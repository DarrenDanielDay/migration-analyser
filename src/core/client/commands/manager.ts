import * as vscode from "vscode";
import { onHelloWorld } from "./find-reference";
import { test } from "./test";

export class MyCommandManager {
  readonly commands: [string, () => void][] = [
    ["helloWorld", onHelloWorld],
    ["test", test],
  ];

  registerAll(context: vscode.ExtensionContext) {
    for (let [command, handler] of this.commands) {
      if (!command.startsWith("vscode-extension-demo.")) {
        command = "vscode-extension-demo." + command;
      }
      const disposable = vscode.commands.registerCommand(command, async () => {
        try {
          const result = handler() as any
          if (result instanceof Promise) {
            await result
          }
        } catch (e) {
          console.error(e);
        }
      });
      context.subscriptions.push(disposable);
    }
  }
}
