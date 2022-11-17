import {spawn} from "child_process";
import {dirname, join} from "path";
import {fileURLToPath} from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function convertIfc(path, wexbimOut, xmlOut, logger): Promise<void> {
  return new Promise((resolve, reject) => {
    let child = spawn(
      join(__dirname, "../bin/Release/net6.0/win-x64/WebifyBim.exe"),
      [path, wexbimOut, xmlOut],
      {
        //stdio: "inherit"
        stdio: "pipe"
      }
    );
    child.stdout.on("data", chunk => {
      for (let line of `${chunk}`.split("\n")) {
        try {
          let json = JSON.parse(line);
          logger[json.logger].info(json.msg);
        }
        catch (e) {
          logger.default.debug(e);
        }
      }
    });
    child.stderr?.on("data", chunk => logger.default.error(`${chunk}`));
    child.on("exit", code => {
      child.stdout?.removeAllListeners();
      child.stderr?.removeAllListeners();
      if (code) return reject();
      resolve();
    })
  });
}
