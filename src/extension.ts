// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { SpirvLanguageProvider } from './SpirvLanguageProvider';
import { SpirvVirtualDocumentProvider } from './SpirvVirtualDocumentProvider';
import { SpirvReadOnlyEditorProvider } from './SpirvReadOnlyEditorProvider';
import { logInfo } from './SpirvLogProvider';


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		await SpirvLanguageProvider.register(context),
		SpirvVirtualDocumentProvider.register(context),
		SpirvReadOnlyEditorProvider.register(context),
	);

	logInfo('The extension is activated');
}

// This method is called when your extension is deactivated
export async function deactivate() {}
