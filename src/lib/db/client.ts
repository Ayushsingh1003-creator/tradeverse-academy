import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type Db = NeonHttpDatabase<typeof schema>;

let sql: NeonQueryFunction<false, false> | null = null;
let db: Db | null = null;

function getSql() {
  if (!sql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    sql = neon(url);
  }
  return sql;
}

function getDb(): Db {
  if (!db) db = drizzle({ client: getSql(), schema });
  return db;
}

/** Lazy Drizzle client (env must be loaded before first query). */
export const drizzleDb = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    const value = Reflect.get(getDb() as object, prop, receiver);
    return typeof value === "function" ? value.bind(getDb()) : value;
  },
});
