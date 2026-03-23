import duckdb from "duckdb";
import util from "util";
import path from "path";

// Pointing to your newly built denormalized database
const DB_PATH = path.join(
  process.cwd(),
  "../Transform_Parquet/pittsburgh_standard_charge_details.duckdb"
);

// Extend the global object in TypeScript to hold our cached connection
declare global {
  var __db: duckdb.Database | undefined;
}

let db: duckdb.Database;

if (!global.__db) {
  global.__db = new duckdb.Database(DB_PATH, { access_mode: "READ_ONLY" });
}
db = global.__db;

// Type the Promisified methods so we get autocomplete when querying
export const dbAll = util.promisify(db.all.bind(db)) as (
  query: string
) => Promise<any[]>;
export const dbExec = util.promisify(db.exec.bind(db)) as (
  query: string
) => Promise<void>;
