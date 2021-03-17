import { Disposable } from "vscode";
import { Command, CommandManager } from "../src/commands/commandManager";

export class MockCommandManager extends CommandManager {
  public dispose(): void {}
  public register<T extends Command>(command: T): T {
    return command;
  }
}
