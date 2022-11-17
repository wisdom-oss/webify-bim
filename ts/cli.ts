import yargs from "yargs/yargs";
import {readFile} from "fs/promises";
import dotenv from "dotenv";

export async function args() {
  const flags = {
    n: {
      type: "string",
      alias: "name",
      description: "Name of the Model",
      demandOption: true,
      requiresArg: true
    },
    d: {
      type: "string",
      alias: "description",
      requiresArg: true,
      description: "Description of the Model"
    },
    f: {
      type: "boolean",
      alias: "force",
      description: "Force inserting Files even if the already are in the Database",
      default: false
    },
    e: {
      type: "string",
      alias: "env",
      requiresArg: true,
      description: "Path to .env File to load Environment Variables from"
    },
    l: {
      alias: "loglevel",
      describe: "Log Level for the Logger",
      requiresArg: true,
      choices: ["trace", "debug", "info", "warn", "fatal", "off"],
      default: () => process.env.LOG_LEVEL ?? "info",
      defaultDescription: `$env:LOG_LEVEL | "info"`
    },
    u: {
      alias: "user",
      describe: "Postgres User",
      type: "string",
      requiresArg: true,
      default: () => process.env.PG_USER ?? "postgres",
      defaultDescription: `$env:PG_USER | "postgres"`
    },
    h: {
      alias: "host",
      describe: "Postgres Host",
      requiresArg: true,
      type: "string",
      default: () => process.env.PG_HOST ?? "localhost",
      defaultDescription: `$env:PG_HOST | "localhost"`
    },
    P: {
      alias: "port",
      describe: "Postgres Port",
      requiresArg: true,
      type: "number",
      default: () => process.env.PG_PORT ? parseInt(process.env.PG_PORT) : 5432,
      defaultDescription: `$env:PG_PORT | 5432`
    },
    p: {
      alias: "password",
      describe: "Postgres Password",
      demandOption: true,
      requiresArg: true,
      type: "string",
      default: () => process.env.PG_PASS,
      defaultDescription: `$env:PG_PASS`
    },
    D: {
      alias: "database",
      describe: "Postgres Database",
      requiresArg: true,
      type: "string",
      default: () => process.env.PG_DB ?? "wisdom",
      defaultDescription: `$env:PG_DB | "wisdom"`
    },
    hash_algo: {
      describe: "Hashing Algorithm used for File Hashing",
      type: "string",
      requiresArg: true,
      default: () => process.env.HASH_ALGO ?? "md5",
      defaultDescription: `$env:HASH_ALGO | "md5"`
    },
    hash_len: {
      describe: "Length of Column in Postgres Database for File Hashes",
      type: "number",
      requiresArg: true,
      default: () => process.env.HASH_LEN ? parseInt(process.env.HASH_LEN) : 32,
      defaultDescription: `$env:HASH_LEN | 32`
    }
  };

  let env = await yargs(process.argv.slice(2))
    .options({e: flags.e})
    .argv;
  if (env.e) Object.assign(process.env, dotenv.parse(await readFile(env.e)));

  return await yargs(process.argv.slice(2))
    .locale("en")
    .command(`[Files...]`, "Related Files for a BIM")
    .string("_")
    .options(flags)
    .demandCommand(1)
    .argv;
}
