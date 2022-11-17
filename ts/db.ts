import {dirname, join} from "path";
import pgPromise from "pg-promise";
import {fileURLToPath} from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function createQuery(path): pgPromise.QueryFile {
  return new pgPromise.QueryFile(
    join(__dirname, path),
    {minify: false}
  );
}

const createSchemaQuery = createQuery("../sql/create_schema.sql");
const insertModelQuery = createQuery("../sql/insert_model.sql");
const insertFileQuery = createQuery("../sql/insert_file.sql");
const insertInstanceQuery = createQuery("../sql/insert_instance.sql");
const selectHashedFilesQuery = createQuery("../sql/select_hashed_files.sql");

export {
  createSchemaQuery,
  insertModelQuery,
  insertFileQuery,
  insertInstanceQuery,
  selectHashedFilesQuery
};
