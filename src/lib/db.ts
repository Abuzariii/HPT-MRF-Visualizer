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
  var __dbInitPromise: Promise<void> | undefined;
}

let duckdb: any;

async function downloadDatabase() {
  // 1. Ask Hugging Face exactly how big the file is supposed to be
  console.log(`[DB] Checking expected database size from Hugging Face...`);
  const headRes = await fetch(DOWNLOAD_URL, { method: "HEAD" });
  const expectedSize = parseInt(
    headRes.headers.get("content-length") || "0",
    10
  );
  console.log(
    `[DB] Expected size: ${(expectedSize / 1024 / 1024 / 1024).toFixed(2)} GB`
  );

  // 2. Check the existing file against the EXACT expected size
  if (fs.existsSync(DB_PATH)) {
    const stats = fs.statSync(DB_PATH);
    const isValid =
      expectedSize > 0 ? stats.size === expectedSize : stats.size > 5000000000;

    if (isValid) {
      console.log(
        `[DB] Valid database found perfectly matching expected size. Skipping download.`
      );
      return;
    }

    console.log(
      `[DB] Found corrupted partial database (${(
        stats.size /
        1024 /
        1024 /
        1024
      ).toFixed(2)} GB). Deleting and redownloading...`
    );
    fs.unlinkSync(DB_PATH);
  }

  console.log(
    `[DB] Downloading database from Hugging Face... This will take a few minutes. DO NOT interrupt.`
  );

  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const tmpPath = `${DB_PATH}.tmp`;
  if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);

  const res = await fetch(DOWNLOAD_URL);
  if (!res.ok) throw new Error(`Failed to fetch database: ${res.statusText}`);
  if (!res.body)
    throw new Error("No response body received from Hugging Face.");

  const fileStream = fs.createWriteStream(tmpPath);
  await finished(Readable.fromWeb(res.body as any).pipe(fileStream));

  fs.renameSync(tmpPath, DB_PATH);
  console.log(`[DB] Download 100% complete! Saved successfully to ${DB_PATH}`);
}

export async function getDb(): Promise<any> {
  if (global.__db) return global.__db;

  if (!duckdb) {
    duckdb = typeof window === "undefined" ? eval("require('duckdb')") : null;
  }

  if (!global.__dbInitPromise) {
    global.__dbInitPromise = downloadDatabase()
      .then(() => {
        console.log(`[DB] Opening DuckDB connection...`);
        return new Promise<void>((resolve, reject) => {
          const dbInstance = new duckdb.Database(
            DB_PATH,
            { access_mode: "READ_ONLY" },
            (err: any) => {
              if (err) {
                console.error("[DB] Failed to open DuckDB:", err);
                reject(err);
              } else {
                console.log("[DB] Connection established successfully!");
                global.__db = dbInstance;
                resolve();
              }
            }
          );
        });
      })
      .catch((err) => {
        global.__dbInitPromise = undefined;
        throw err;
      });
  }

  await global.__dbInitPromise;
  return global.__db;
}

export async function queryDb(query: string): Promise<any[]> {
  const database = await getDb();
  const dbAll = util.promisify(database.all.bind(database)) as (
    q: string
  ) => Promise<any[]>;
  return dbAll(query);
}
