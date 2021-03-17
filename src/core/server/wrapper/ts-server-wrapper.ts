import { ProcessBasedTsServer, TsServerProcessKind } from "../src/tsServer/server";
import { ChildServerProcess } from "../src/tsServer/serverProcess.electron";
import { TypeScriptVersionManager } from "../src/tsServer/versionManager";
import { DiskTypeScriptVersionProvider } from "../src/tsServer/versionProvider.electron";
import { ServerType } from "../src/typescriptService";
import { TypeScriptServiceConfiguration } from "../src/utils/configuration";
import * as vscode from 'vscode'

export class TypeScriptServerWrapper {
    readonly tsserverPath = '';
    readonly process: ChildServerProcess
    constructor(context: vscode.ExtensionContext) {
        const config = TypeScriptServiceConfiguration.loadFromWorkspace();
        this.process = ChildServerProcess.fork(this.tsserverPath, [], TsServerProcessKind.Semantic, config, new TypeScriptVersionManager(config, new DiskTypeScriptVersionProvider(), context.workspaceState) )
    }
}