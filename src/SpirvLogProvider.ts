import * as vscode from 'vscode';

const outputChannel = vscode.window.createOutputChannel('SPIR-V Viewer Log');

export function logInfo(msg: string) {
    console.log(`[Info] ${msg}`);
    outputChannel.appendLine(`[Info] ${msg}`);
}