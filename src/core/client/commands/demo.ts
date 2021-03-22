import { MyTypeScriptServer } from "../../server/node/impl";
import * as path from "path";
import * as typedoc from "typedoc";
import { testProjectHome } from "../../../utils/paths";
let opened = false;

export async function demo() {
  const { instance } = MyTypeScriptServer;
  if (!opened) {
    await instance.execute("open", {
      file: path.join(testProjectHome, "tsconfig.json"),
      projectRootPath: testProjectHome,
    });
    await instance.execute("open", {
      file: path.join(testProjectHome, "0.ts"),
      projectRootPath: testProjectHome,
    });
    opened = true;
  }
  const response = await instance.execute("definition", {
    file: path.resolve(testProjectHome, `1.ts`),
    line: 4,
    offset: 10,
    projectFileName: testProjectHome,
  });
  return response;
}
