import {fork} from "child_process";
import {dirname, join} from "path";
import {fileURLToPath} from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

process.env.EDGE_USE_CORECLR = "1";

let child = fork(
  join(process.argv[2], "js", "app.js"),
  process.argv.slice(3),
  {
    stdio: [0, 1, 2, 'ipc']
  }
);
