import * as vscode from "vscode";
import { logger } from "../../../utils/debugger";
import { demo } from "./demo";
import { onHelloWorld } from "./find-reference";
import { test } from "./test";
// import { open, reload } from "./ui";
import { WebviewManager } from "../../../ui/react-ui/extension-handler";
const webviewManager = WebviewManager.instance;
export class MyCommandManager {
  readonly commands: [string, (context: vscode.ExtensionContext) => any][] = [
    ["helloWorld", onHelloWorld],
    ["test", test],
    ["demo", demo],
    ["reload-ui", webviewManager.reload.bind(webviewManager)],
    ["open-ui", webviewManager.open.bind(webviewManager)],
    ["close-ui", webviewManager.close.bind(webviewManager)],
  ];

  registerAll(context: vscode.ExtensionContext) {
    for (let [command, handler] of this.commands) {
      if (!command.startsWith("package-migration-analyzer-extension.")) {
        command = "package-migration-analyzer-extension." + command;
      }
      const disposable = vscode.commands.registerCommand(command, async () => {
        try {
          const result = handler(context);
          if (result instanceof Promise) {
            await result;
          }
        } catch (e) {
          logger.block(`Execute '${command}' Failed`, e);
        }
      });
      context.subscriptions.push(disposable);
    }
  }
}
