import { geneTypeDoc } from "../core/typedoc/doc-json";
import * as fs from "fs";
import * as path from "path";
import { generateDoneMessage } from "../utils/constants";
console.log("args", process.argv);
geneTypeDoc(process.argv[2]).then(() => {
  console.log(generateDoneMessage);
});
