import { writeFileSync } from "fs";
import * as path from "path";
import { extensionBase } from "./paths";
class Logger {
  totalSwitch: boolean = true;
  console = {
    on: true,
  };
  file = {
    on: true,
    fileName: path.resolve(extensionBase, "log.txt"),
  };
  write(message: string) {
    const { on, fileName } = this.file;
    this.totalSwitch &&
      on &&
      writeFileSync(fileName, message + "\n", {
        flag: "a",
      });
  }

  log(...args: any[]) {
    const { on } = this.console;
    this.totalSwitch && on && console.log(...args);
  }

  record(message: string) {
    this.log(message);
    this.write(message);
  }

  middle(content: string, length: number, fill: string = " ") {
    if (content.length > length) {
      return content;
    }
    const padCount = length - content.length;
    const leftPad = Math.floor(padCount / 2);
    const rightPad = padCount - leftPad;
    return `${fill.repeat(leftPad)}${content}${fill.repeat(rightPad)}`;
  }

  block(title: string, content: string) {
    this.record(`${this.middle(`<${title}> Begin`, 100, "+")}
${content}
${this.middle(`<${title}> End`, 100, "-")}`);
  }
}

const logger = new Logger();

export { logger };
