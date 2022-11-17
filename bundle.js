/**
 * @file This file is used to bundle the application in a minimal .exe
 */

import caxa from "caxa";
import pkg from "./package.json" assert {type: "json"};
import {rmSync} from "fs";
import {execSync} from "child_process";
import ncp from "ncp";

// cleanup
let base;
rmSync("dist", {force: true, recursive: true});

// copy over necessary files
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

// execute install on minimal files
execSync("npm ci --omit=dev", {
  cwd: "dist/"
});

// bundle files to .exe
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
