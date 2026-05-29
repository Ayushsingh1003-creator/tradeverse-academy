/**
 * Push Drizzle schema via node-postgres (avoids drizzle-kit websocket introspection hangs).
 */
import { config } from "dotenv";
import { resolve } from "node:path";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { pushSchema } from "drizzle-kit/api";
import * as schema from "../../src/lib/db/schema";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

async function main() {
  const pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });
  const db = drizzle(pool, { schema });
  const { apply, hasDataLoss, warnings } = await pushSchema(
    schema,
    db as unknown as Parameters<typeof pushSchema>[1],
    ["public"],
  );

  if (warnings.length) {
    console.warn("Warnings:", warnings);
  }
  if (hasDataLoss) {
    console.warn("Schema push may cause data loss — review warnings above.");
  }

  await apply();
  console.log("Schema push complete.");
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
