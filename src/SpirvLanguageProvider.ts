import * as vscode from 'vscode';

interface InstructionOperandInfo {
    kind: string;
    quantifier?: string;
    name?: string;
}

interface InstructionOpCodeInfo {
    opname: string;
    operands: InstructionOperandInfo[];
    documentation?: string;
}

export class SpirvLanguageProvider {
    public static async register(context: vscode.ExtensionContext): Promise<vscode.Disposable> {
        const dataPath = context.asAbsolutePath('resource/spirv.data.json');
        const data: InstructionOpCodeInfo[] = await vscode.workspace.fs.readFile(vscode.Uri.file(dataPath)).then(content => JSON.parse(content.toString()));
        const opLookup: { [opname: string]: InstructionOpCodeInfo } = {};
        for (const opcodeInfo of data) {
            opLookup[opcodeInfo.opname] = opcodeInfo;
        }

        const enableInlayHints = vscode.workspace.getConfiguration('spirv-viewer').get<boolean>('enableInlayHints');

        const provider = new SpirvLanguageProvider(context, opLookup);
        let subscriptions = [];
        subscriptions.push(vscode.languages.registerHoverProvider('spirv', provider));
        subscriptions.push(vscode.languages.registerDefinitionProvider('spirv', provider));
        if (enableInlayHints) {
            subscriptions.push(vscode.languages.registerInlayHintsProvider('spirv', provider));
        }

        return vscode.Disposable.from(...subscriptions);
    }

    constructor(private readonly context: vscode.ExtensionContext, private readonly opLookup: { [opname: string]: InstructionOpCodeInfo }) {
    }

    parseInstruction(document: vscode.TextDocument, lineIndex: number) {
        const lineText = document.lineAt(lineIndex).text;
        const lineTextTrimmed = lineText.trimStart();
        if (lineTextTrimmed.length === 0 || lineTextTrimmed.startsWith(";")) {
            return;
        }

        const tokenRegex = /"(?:[^"]|\\")*"?|=|%?[\.\w]+|;.*/g;
        const matches = Array.from(lineText.matchAll(tokenRegex));
        if (matches.length === 0) {
            return;
        }

        // Remove trailing comments
        if (matches[matches.length - 1][0].startsWith(";")) {
            matches.pop();
        }
        if (matches.length === 0) {
            return;
        }

        let opname = "";
        let operands = [];
        if (matches.length >= 3 && matches[1][0] === "=") {
            opname = matches[2][0];
            operands = [matches[0]].concat(matches.slice(3));
            if (!lineTextTrimmed.startsWith("%") || !opname.startsWith("Op")) {
                return;
            }
        }
        else {
            opname = matches[0][0];
            operands = matches.slice(1);
            if (!lineTextTrimmed.startsWith("Op")) {
                return;
            }
        }

        let extOpName = "";
        if (opname === "OpExtInst" && operands.length >= 4) {
            extOpName = operands[3][0];
        }

        const opInfo = extOpName ? this.opLookup[extOpName] : this.opLookup[opname];
        if (!opInfo) {
            return;
        }

        if (operands.length >= 2 && opInfo.operands.length >= 2 && opInfo.operands[0].kind === "IdResultType" && opInfo.operands[1].kind === "IdResult") {
            operands[0], operands[1] = operands[1], operands[0];
        }

        return { opname, extOpName, operands, tokens: matches, opInfo };
    }

    isDefinitionLine(lineText: string, resultId: string) {
        return lineText.startsWith(resultId) && lineText.slice(resultId.length).trimStart().startsWith("=");
    }

    public provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Hover> {
        const instruction = this.parseInstruction(document, position.line);
        if (!instruction) {
            return;
        }

        const { opname, extOpName, operands, tokens, opInfo } = instruction;

        const tokenIndex = tokens.findIndex(tok => tok.index! <= position.character && tok.index! + tok[0].length > position.character);
        const word = tokens[tokenIndex][0];
        const wordRange = new vscode.Range(position.line, tokens[tokenIndex].index!, position.line, tokens[tokenIndex].index! + tokens[tokenIndex][0].length);
        if (word === opname || word === extOpName) {
            const hoverText = new vscode.MarkdownString(opInfo.documentation || "");
            if (hoverText) {
                hoverText.supportHtml = true;
                return new vscode.Hover(hoverText, wordRange);
            }
        }
        else {
            const hoverText = new vscode.MarkdownString();

            const operandIndex = operands.findIndex(op => op.index === wordRange.start.character) - (extOpName ? 4 : 0);
            if (operandIndex >= 0) {
                const lookupIndex = Math.min(operandIndex, opInfo.operands.length - 1);
                if (opInfo.operands[lookupIndex].name) {
                    hoverText.appendMarkdown(`### Passed as \`${opInfo.operands[lookupIndex].name!.slice(1, -1)}\`\n`);
                    hoverText.appendMarkdown("---\n");
                }
            }

            if (word.startsWith("%")) {
                // This is a result id, we'll try to find the instruction that defines it
                // We'll search backwards first as an optimization
                let found = false;
                const scanLine = (lineIndex: number) => {
                    const lineText = document.lineAt(lineIndex).text.trim();
                    if (this.isDefinitionLine(lineText, word)) {
                        hoverText.appendCodeblock(lineText, "spirv");
                        found = true;
                    }
                };
                for (let i = position.line; !found && i >= 0; i--) {
                    scanLine(i);
                }
                for (let i = position.line + 1; !found && i < document.lineCount; i++) {
                    scanLine(i);
                }
            }
            else {
                hoverText.appendCodeblock(word, "spirv");
            }

            if (hoverText) {
                return new vscode.Hover(hoverText, wordRange);
            }
        }
    }

    public provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Location> {
        const wordRange = document.getWordRangeAtPosition(position, /%?\w+/);
        const word = document.getText(wordRange);

        if (!word) {
            return;
        }

        if (word.startsWith("%")) {
            for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
                const lineText = document.lineAt(lineIndex).text.trim();
                if (lineText.startsWith(word)) {
                    return new vscode.Location(document.uri, new vscode.Position(lineIndex, 0));
                }
            }
        }
    }

    public provideInlayHints(document: vscode.TextDocument, range: vscode.Range, token: vscode.CancellationToken): vscode.ProviderResult<vscode.InlayHint[]> {
        let inlayHints: vscode.InlayHint[] = [];
        for (let lineIndex = range.start.line; lineIndex < range.end.line; lineIndex++) {
            const instruction = this.parseInstruction(document, lineIndex);
            if (!instruction) {
                continue;
            }

            const { extOpName, operands, opInfo } = instruction;

            const operandOffset = extOpName ? 4 : 0;
            for (let operandIndex = 0; operandIndex < opInfo.operands.length && operandIndex + operandOffset < operands.length; operandIndex++) {
                const operandName = opInfo.operands[operandIndex].name;
                if (operandName) {
                    const hint = new vscode.InlayHint(
                        new vscode.Position(lineIndex, operands[operandIndex + operandOffset].index),
                        operandName.slice(1, -1) + ":", vscode.InlayHintKind.Parameter
                    );
                    hint.paddingRight = true;
                    inlayHints.push(hint);
                }
            }
        }

        return inlayHints;
    }
}