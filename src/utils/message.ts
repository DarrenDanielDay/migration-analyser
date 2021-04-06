import * as vscode from "vscode";
import { die } from "./assertions";

export function note(text: string, isError?: boolean) {
  if (isError) {
    vscode.window.showErrorMessage(text);
    return;
  }
  vscode.window.showErrorMessage(text);
}

export function dieMessage(text: string) {
  vscode.window.showErrorMessage(text);
  return die(text);
}
