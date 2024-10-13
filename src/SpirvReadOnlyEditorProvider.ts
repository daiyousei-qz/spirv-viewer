import * as vscode from 'vscode';
import { SpirvVirtualDocumentProvider } from './SpirvVirtualDocumentProvider';

export class SpirvReadOnlyEditorProvider implements vscode.CustomReadonlyEditorProvider {
    public static readonly viewType = 'spirv-viewer.spirvReadonlyEditor';

    public static register(context: vscode.ExtensionContext): vscode.Disposable {
        const provider = new SpirvReadOnlyEditorProvider(context);
        return vscode.window.registerCustomEditorProvider(SpirvReadOnlyEditorProvider.viewType, provider);
    }

    constructor(private readonly context: vscode.ExtensionContext) { }

    public async openCustomDocument(
        uri: vscode.Uri,
        openContext: vscode.CustomDocumentOpenContext,
        token: vscode.CancellationToken
    ): Promise<vscode.CustomDocument> {
        return {
            uri,
            dispose: () => { }
        };
    }

    public async resolveCustomEditor(
        document: vscode.CustomDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken
    ): Promise<void> {
        const virtualUri = document.uri.with({ scheme: SpirvVirtualDocumentProvider.scheme });
        await vscode.window.showTextDocument(virtualUri, { preview: false, preserveFocus: true });

        webviewPanel.dispose();
    }
}