import { TypeScriptServer } from "../../server";
import * as ts from "typescript/lib/protocol";
import { withType } from "../../../utils";

export async function onHelloWorld() {
  try {
    const response = await TypeScriptServer.client.execute(
      "open",
      withType<ts.OpenRequestArgs>({
        file: `C:\\Users\\DarrenDanielDay\\Documents\\School\\paper\\vscode-extension-demo\\src\\extension.ts`,
      }),
      {
        isCancellationRequested: false,
        onCancellationRequested: () => {
          console.log("canceled");
          return {
            dispose() {},
          };
        },
      }
    );
    console.log(response);
  } catch (e) {
    // console.log(e);
  }
}
