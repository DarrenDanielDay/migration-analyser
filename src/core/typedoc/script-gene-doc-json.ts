import * as child_process from "child_process";
import * as path from "path";
import * as fs from "fs";
import { generateDoneMessage } from "../../utils/constants";
import { extensionBase } from "../../utils/paths";
import { ProjectReflection } from "typedoc";

export function scriptGeneTypeDocJson(packageName: string) {
  const child = child_process.spawn(
    path.resolve(extensionBase, "src", "scripts", "gene-json.cmd "),
    [packageName],
    {
      cwd: extensionBase,
    }
  );
  return new Promise<ProjectReflection>((resolve, reject) => {
    child.stdout.on("data", (c: Buffer) => {
      const info = c.toString("utf-8");
      fs.writeFileSync(path.resolve(extensionBase, 'typedoc-out.txt'), info, {flag:"a"})
      if (info.includes(generateDoneMessage)) {
        const json = fs
          .readFileSync(
            path.resolve(
              extensionBase,
              "out",
              "cache",
              packageName,
              `${packageName}.json`
            )
          )
          .toString("utf-8");
        resolve(JSON.parse(json) as ProjectReflection);
      }
    });
    child.on("close", (code, signal) => {
      fs.writeFileSync(path.resolve(extensionBase, 'typedoc-out.txt'), `${"!".repeat(100)} closed code ${code} ${signal}`, {flag:"a"})

    });
  });
}
