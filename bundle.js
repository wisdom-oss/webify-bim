import caxa from "caxa";
import pkg from "./package.json" assert {type: "json"};
import {rmSync} from "fs";
import {execSync} from "child_process";
import {promisify} from "util";
import ncp from "ncp";
import {join} from "path";

let base;
rmSync("dist", {force: true, recursive: true});
await new Promise((resolve, reject) => ncp(
  ".",
  "dist",
  {
    filter: f => {
      if (!base) {
        base = f;
        return true
      }
      if (f.endsWith(".js.map")) return false;
      return f.split(base)[1].match(/^\\(bin|js|sql|package.json|package-lock.json).*/);
    }
  },
  e => e ? reject(e) : resolve()
));
execSync("npm ci --omit=dev", {
  cwd: "dist/"
});

let output = `dist/WebifyBim-${pkg.version}-win-x64.exe`;
caxa({
  input: "dist/.",
  output,
  identifier: "webify-bim\\" + pkg.version,
  uncompressionMessage: "This may take a while to run the first time, please wait...",
  exclude: [output],
  command: [
    "{{caxa}}/node_modules/.bin/node",
    "{{caxa}}/js/app.js"
  ]
}).catch(console.error);
