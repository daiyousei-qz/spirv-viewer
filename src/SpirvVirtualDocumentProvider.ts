import * as vscode from 'vscode';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import { logInfo } from './SpirvLogProvider';

const execAsync = promisify(exec);

export class SpirvVirtualDocumentProvider implements vscode.TextDocumentContentProvider {
    public static readonly scheme = 'spirv-viewer';

    public static register(context: vscode.ExtensionContext): vscode.Disposable {
        const provider = new SpirvVirtualDocumentProvider(context);
        return vscode.Disposable.from(
            vscode.workspace.registerTextDocumentContentProvider(SpirvVirtualDocumentProvider.scheme, provider),
            provider,
        );
    }

    subscriptions: vscode.Disposable[] = [];
    activeFileWatchers: { [uri: string]: vscode.FileSystemWatcher } = {};

    constructor(private readonly context: vscode.ExtensionContext) { 
        this.subscriptions.push( vscode.workspace.onDidCloseTextDocument(e => {
            const uri = e.uri.toString();
            if (uri in this.activeFileWatchers) {
                this.activeFileWatchers[uri].dispose();
                delete this.activeFileWatchers[uri];
                logInfo(`Stopped watching ${uri}`);
            }
        }));
    }

    private _onDidChange = new vscode.EventEmitter<vscode.Uri>();

    readonly onDidChange = this._onDidChange.event;

    public provideTextDocumentContent(uri: vscode.Uri): string | Thenable<string> {
        const config = vscode.workspace.getConfiguration('spirv-viewer');
        const spirvDis = config.get<string>('spirvDisPath', 'spirv-dis');
        const noIndentOption = config.get<boolean>('toggleNoIndent', false) ? '--no-indent' : '';
        const noHeaderOption = config.get<boolean>('toggleNoHeader', false) ? '--no-header' : '';
        const rawIdOption = config.get<boolean>('toggleRawId', false) ? '--raw-id' : '';
        const commentOption = config.get<boolean>('toggleComment', false) ? '--comment' : '';
        const spirvFile = uri.fsPath;

        const cmd = `${spirvDis} ${noIndentOption} ${noHeaderOption} ${rawIdOption} ${commentOption} ${spirvFile}`;
        logInfo(`Executing ${cmd}`);
        const result = execAsync(cmd).then(({ stdout, stderr }) => {
            if (stderr) {
                console.error(`stderr: ${stderr}`);
            }
            return stdout;
        }).catch(error => {
            console.error(`exec error: ${error}`);
            return `Error: ${error.message}`;
        });

        if (!(uri.toString() in this.activeFileWatchers)) {
            const watcher = vscode.workspace.createFileSystemWatcher(spirvFile);
            watcher.onDidChange(() => this.update(uri));
            this.activeFileWatchers[uri.toString()] = watcher;
            logInfo(`Watching ${spirvFile}`);
        }

        return result;
    }

    public update(uri: vscode.Uri) {
        this._onDidChange.fire(uri);
    }

    public dispose() {
        for (const sub of this.subscriptions) {
            sub.dispose();
        }
        for (const uri in this.activeFileWatchers) {
            this.activeFileWatchers[uri].dispose();
        }
    }
}
