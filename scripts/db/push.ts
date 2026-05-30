/**
 * Push Drizzle schema via node-postgres.
 * Applies a small drizzle-kit patch so introspection passes query params
 * (required for tables with composite primary keys).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "dotenv";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

const DRIZZLE_KIT_PUSH_PATCH = "TRADEVERSE_DRIZZLE_PUSH_PARAMS_FIX_v1";

function patchDrizzleKitFile(apiPath: string) {
  let src = readFileSync(apiPath, "utf8");
  if (src.includes(DRIZZLE_KIT_PUSH_PATCH)) return;

  const broken = `query: async (query, params) => {
      const res = await drizzleInstance.execute(sql.raw(query));
      return res.rows;
    }`;
  const fixed = `query: async (query, params) => {
      const res = params?.length
        ? await drizzleInstance.session.client.query(query, params)
        : await drizzleInstance.execute(sql.raw(query));
      return res.rows;
    } /* ${DRIZZLE_KIT_PUSH_PATCH} */`;

  if (!src.includes(broken)) {
    throw new Error(
      `Could not patch ${apiPath} — drizzle-kit format changed. Update scripts/db/push.ts or apply SQL manually.`,
    );
  }

  writeFileSync(apiPath, src.replace(broken, fixed));
}

function patchDrizzleKitPushSchema() {
  const kitDir = resolve(process.cwd(), "node_modules/drizzle-kit");
  patchDrizzleKitFile(resolve(kitDir, "api.js"));
  patchDrizzleKitFile(resolve(kitDir, "api.mjs"));
}

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

async function main() {
  patchDrizzleKitPushSchema();

  const { pushSchema } = await import("drizzle-kit/api");
  const schema = await import("../../src/lib/db/schema");

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
