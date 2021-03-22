import * as vscode from "vscode";
import { logger } from "../../../utils/debugger";
import { demo } from "./demo";
import { onHelloWorld } from "./find-reference";
import { test } from "./test";

export class MyCommandManager {
  readonly commands: [string, (context: vscode.ExtensionContext) => any][] = [
    ["helloWorld", onHelloWorld],
    ["test", test],
    ["demo", demo]
  ];

  registerAll(context: vscode.ExtensionContext) {
    for (let [command, handler] of this.commands) {
      if (!command.startsWith("vscode-extension-demo.")) {
        command = "vscode-extension-demo." + command;
      }
      const disposable = vscode.commands.registerCommand(command, async () => {
        try {
          const result = handler(context)
          if (result instanceof Promise) {
            await result
          }
        } catch (e) {
          logger.block(`Execute '${command}' Failed`, e)
        }
      });
      context.subscriptions.push(disposable);
    }
  }
}
