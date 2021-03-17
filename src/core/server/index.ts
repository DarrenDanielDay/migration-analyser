import * as vscode from "vscode";
import { MockCommandManager } from "./mocks/command-manager";
import { getExtensionApi } from "./src/api";
import { registerBaseCommands } from "./src/commands";
import { CommandManager } from "./src/commands/commandManager";
import { deactivate } from "./src/extension";
import { LanguageConfigurationManager } from "./src/languageFeatures/languageConfiguration";
import {
  createLazyClientHost,
  lazilyActivateClient,
} from "./src/lazyClientHost";
import { nodeRequestCancellerFactory } from "./src/tsServer/cancellation.electron";
import { NodeLogDirectoryProvider } from "./src/tsServer/logDirectoryProvider.electron";
import { ChildServerProcess } from "./src/tsServer/serverProcess.electron";
import { DiskTypeScriptVersionProvider } from "./src/tsServer/versionProvider.electron";
import TypeScriptServiceClient from "./src/typescriptServiceClient";
import TypeScriptServiceClientHost from "./src/typeScriptServiceClientHost";
import { onCaseInsenitiveFileSystem } from "./src/utils/fileSystem.electron";
import { standardLanguageDescriptions } from "./src/utils/languageDescription";
import { PluginManager } from "./src/utils/plugins";
export class TypeScriptServer {
  static client: TypeScriptServiceClient;
  static start(context: vscode.ExtensionContext) {
    const pluginManager = new PluginManager();
    context.subscriptions.push(pluginManager);

    const commandManager = new CommandManager();
    context.subscriptions.push(commandManager);

    const onCompletionAccepted = new vscode.EventEmitter<vscode.CompletionItem>();
    context.subscriptions.push(onCompletionAccepted);

    const logDirectoryProvider = new NodeLogDirectoryProvider(context);
    const versionProvider = new DiskTypeScriptVersionProvider();

    context.subscriptions.push(new LanguageConfigurationManager());
    this.client = new TypeScriptServiceClient(
      context,
      onCaseInsenitiveFileSystem(),
      {
        pluginManager,
        logDirectoryProvider,
        cancellerFactory: nodeRequestCancellerFactory,
        versionProvider,
        processFactory: ChildServerProcess,
      },
      // @ts-expect-error
      TypeScriptServiceClientHost.prototype.getAllModeIds.call(
        undefined,
        standardLanguageDescriptions,
        pluginManager
      )
    );
    this.client.restartTsServer();
    return getExtensionApi(onCompletionAccepted.event, pluginManager);
  }
  static stop() {
    deactivate();
  }
}
