// src/lib/db.ts
import util from "util";
import path from "path";
import fs from "fs";
import { Readable } from "stream";
import { finished } from "stream/promises";

const IS_PROD = process.env.NODE_ENV === "production";
const DB_PATH = IS_PROD
  ? "/data/pittsburgh_standard_charge_details.duckdb"
  : path.join(
      process.cwd(),
      "../Transform_Parquet/pittsburgh_standard_charge_details.duckdb"
    );

const DOWNLOAD_URL =
  "https://huggingface.co/datasets/Abuzariii/mrf-pittsburgh-duckdb/resolve/main/pittsburgh_standard_charge_details.duckdb";

declare global {
  var __db: any | undefined;
}

let duckdb: any;

async function ensureDatabaseExists() {
  if (fs.existsSync(DB_PATH)) {
    console.log(
      `[DB] Database already exists at ${DB_PATH}. Skipping download.`
    );
    return;
  }

  console.log(
    `[DB] Database not found at ${DB_PATH}. Downloading 4.8GB from Hugging Face...`
  );

  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const res = await fetch(DOWNLOAD_URL);
  if (!res.ok) throw new Error(`Failed to fetch database: ${res.statusText}`);
  if (!res.body)
    throw new Error("No response body received from Hugging Face.");

  const fileStream = fs.createWriteStream(DB_PATH);
  await finished(Readable.fromWeb(res.body as any).pipe(fileStream));
  console.log(`[DB] Download complete! Saved successfully to ${DB_PATH}`);
}

export async function getDb(): Promise<any> {
  if (global.__db) return global.__db;

  // THE FIX: eval() makes it completely invisible to Turbopack during the build phase.
  // It only executes at runtime when Next.js actually starts the server.
  if (!duckdb) {
    duckdb = typeof window === "undefined" ? eval("require('duckdb')") : null;
  }

  await ensureDatabaseExists();

  console.log(`[DB] Opening DuckDB connection...`);
  global.__db = new duckdb.Database(DB_PATH, { access_mode: "READ_ONLY" });
  return global.__db;
}

export async function queryDb(query: string): Promise<any[]> {
  const database = await getDb();
  const dbAll = util.promisify(database.all.bind(database)) as (
    q: string
  ) => Promise<any[]>;
  return dbAll(query);
}
