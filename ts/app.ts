import {createHash} from "crypto";
import {createReadStream, renameSync} from "fs";
import log from "log4js";
import {basename, dirname, join, resolve} from "path";
import pgPromise from "pg-promise";
import {transformStream} from "txml/dist/transformStream.js";

import {compact} from "./util.js";
import {args} from "./cli.js";
import {
  createSchemaQuery,
  insertFileQuery,
  insertInstanceQuery,
  insertModelQuery,
  selectHashedFilesQuery
} from "./db.js";
import {convertIfc} from "./convert.js";

// loggers
const logger = {
  default: log.getLogger(),
  db: log.getLogger("database"),
  hasher: log.getLogger("hasher"),
  converter: log.getLogger("converter"),
  xml: log.getLogger("xml"),
  wexbim: log.getLogger("wexbim")
};

// parse in arguments
const argv = await args();
for (let l of Object.values(logger)) l.level = argv.l;
logger.default.debug("Parsed arguments:");
logger.default.debug(argv);

// connect to db and make schema if necessary
const pgp = pgPromise();
const db = pgp({
  ...argv,
  application_name: "webify-bim"
});
logger.db.trace("Connected.");
await db.none(createSchemaQuery, {
  hash_length: 32
});
logger.db.debug("Created schema.");

// create hashes from all files
const hashes = {};
for (let f of argv._) {
  const file = resolve(f);
  let hasher = createHash(argv.hash_algo).setEncoding("hex");
  logger.hasher.debug(`Selected "${argv.hash_algo}" for hashing.`);
  let stream = createReadStream(file).pipe(hasher);
  logger.hasher.trace(`Created read stream of "${f}".`);
  for await (let el of stream) hashes[f] = el;
  logger.hasher.debug(`Hash for "${f}": ${hashes[f]}`);

  // check hashes against database
  let containingFiles = await db.any(selectHashedFilesQuery, {hash: hashes[f]});
  logger.hasher.debug(`Database entries for that hash:`);
  logger.hasher.debug(containingFiles);
  if (!containingFiles.length) continue;
  let msg = `"${f}" already in database.`;
  if (argv.f) logger.hasher.warn(msg);
  else {
    logger.hasher.error(msg);
    process.exit(1);
  }
}

// start transaction for a persistent database
db.tx(argv.n ? `insert bim: ${argv.n}` : "insert bim", async t => {
  logger.db.trace("Transaction start.");

  // insert model grouping the files
  let {id: modelId} = await t.one(insertModelQuery, {
    name: argv.n,
    description: argv.d
  });
  logger.db.info(`Inserted model "${argv.n}".`);
  logger.db.debug(`Model ID: ${modelId}`);

  logger.default.debug("Files to insert.");
  logger.default.debug(argv._);
  for (let f of argv._) {
    const file = resolve(f);
    // convert file
    logger.converter.info(`Converting file "${f}" to xml and wexbim.`);
    let base = join(dirname(file), basename(file, ".ifc"));
    let xml = base + ".xml";
    logger.converter.debug(`XML name: "${xml}"`);
    let wexbim = base + ".wexbim";
    logger.converter.debug(`WEXBIM name: "${wexbim}"`);
    await convertIfc(file, wexbim, xml, logger);

    // insert file metadata into database
    let {id: fileId} = await t.one(insertFileQuery, {
      model: modelId,
      name: basename(base),
      hash: hashes[f]
    });
    logger.db.info(`Inserted file "${f}".`);
    logger.db.debug(`File ID: ${fileId}`);

    // use a read stream for less ram usage
    const xmlStream = createReadStream(xml).pipe(transformStream(100, {}));
    logger.xml.debug(`Created read stream for "${xml}".`);
    let iterator = xmlStream[Symbol.asyncIterator]();

    // print the inserted instances only every second, this drastically improves
    // execution time
    let counter = 0;
    let interval = setInterval(() => {
      logger.db.info(`Inserted ${counter} into database for "${f}".`);
    }, 1000);

    // sequentially import every instance into the database
    await t.sequence(i => {
      return iterator.next().then(({value, done}) => {
        logger.xml.debug("Current value:");
        logger.xml.debug(value);
        logger.xml.debug("Done?: " + done);
        if (done) return undefined;
        if (value.tagName === "header") {
          logger.xml.debug("Skipping header.");
          return null;
        }
        return t.none(insertInstanceQuery, {
          model: modelId,
          file: fileId,
          data_type: value.tagName,
          id: parseInt(value.attributes.id.slice(1)),
          data: compact(value)
        }).then(() => counter++);
      });
    });
    clearInterval(interval);
    logger.default.info(`Extraction of "${f}" successfully done.`);
  }
});
logger.db.debug("Transaction end.");

