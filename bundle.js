import caxa from "caxa";
import pkg from "./package.json" assert {type: "json"};

caxa({
  input: ".",
  output: `dist/WebifyBim-${pkg.version}-win-x64.exe`,
  identifier: "webify-bim\\" + pkg.version,
  uncompressionMessage: "This may take a while to run the first time, please wait...",
  exclude: [
    "./obj",
    "./stubs",
    "./ts",
    ".idea",
    ".git",
    ".gitignore",
    "bundle.js",
    "Converter.cs",
    "tsconfig.json",
    "WebifyBim.csproj"
  ],
  command: [
    "{{caxa}}/node_modules/.bin/node",
    "{{caxa}}/js/wrapper.js",
    "{{caxa}}"
  ]
}).catch(console.error);
