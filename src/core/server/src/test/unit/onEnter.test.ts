/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as assert from "assert";
import "mocha";
import * as vscode from "vscode";
import { CURSOR, withRandomFileEditor, wait, joinLines } from "../testUtils";

const onDocumentChange = (
  doc: vscode.TextDocument
): Promise<vscode.TextDocument> => {
  return new Promise<vscode.TextDocument>((resolve) => {
    const sub = vscode.workspace.onDidChangeTextDocument((e) => {
      if (e.document !== doc) {
        return;
      }
      sub.dispose();
      resolve(e.document);
    });
  });
};

const type = async (
  document: vscode.TextDocument,
  text: string
): Promise<vscode.TextDocument> => {
  const onChange = onDocumentChange(document);
  await vscode.commands.executeCommand("type", { text });
  await onChange;
  return document;
};

suite.skip("OnEnter", () => {
  setup(async () => {
    // the tests make the assumption that language rules are registered
    await vscode.extensions
      .getExtension("vscode.typescript-language-features")!
      .activate();
  });

  test("should indent after if block with braces", () => {
    return withRandomFileEditor(
      `if (true) {${CURSOR}`,
      "js",
      async (_editor, document) => {
        await type(document, "\nx");
        assert.strictEqual(
          document.getText(),
          joinLines(`if (true) {`, `    x`)
        );
      }
    );
  });

  test("should indent within empty object literal", () => {
    return withRandomFileEditor(
      `({${CURSOR}})`,
      "js",
      async (_editor, document) => {
        await type(document, "\nx");
        await wait(500);

        assert.strictEqual(document.getText(), joinLines(`({`, `    x`, `})`));
      }
    );
  });

  test("should indent after simple jsx tag with attributes", () => {
    return withRandomFileEditor(
      `const a = <div onclick={bla}>${CURSOR}`,
      "jsx",
      async (_editor, document) => {
        await type(document, "\nx");
        assert.strictEqual(
          document.getText(),
          joinLines(`const a = <div onclick={bla}>`, `    x`)
        );
      }
    );
  });
});
