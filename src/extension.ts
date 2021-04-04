import * as vscode from "vscode";
import { MyCommandManager } from "./core/client";
import { TypeScriptServer } from "./core/server";
import { WebviewManager } from "./ui/react-ui/extension-handler";
import { logger } from "./utils/debugger";

export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "vscode-extension-demo" is now active!'
  );
  try {
    const manager = new MyCommandManager();
    manager.registerAll(context);
  } catch (error) {
    logger.block("Register Command", error)
  }
}

export function deactivate() {
  WebviewManager.instance.close();
}
