import * as vscode from "vscode";
import { MyCommandManager } from "./core/client";
import { TypeScriptServer } from "./core/server";
import { ControllerManager } from "./ui/controller/controller-decorator";
import { WebviewManager } from "./ui/react-ui/extension-handler";
import { logger } from "./utils/debugger";

export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "package-migration-analyzer-extension" is now active!'
  );
  setImmediate(() => {
    const webviewManager = WebviewManager.instance;
    webviewManager.open(context);
    webviewManager.attach(ControllerManager.instance.messageHandler);
  });
  try {
    const manager = new MyCommandManager();
    manager.registerAll(context);
  } catch (error) {
    logger.block("Register Command", error);
  }
}

export function deactivate() {
  WebviewManager.instance.close();
}