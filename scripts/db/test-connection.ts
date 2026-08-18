import { config } from "dotenv";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";

config({ path: resolve(process.cwd(), ".env.local") });

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  const rows = await sql`SELECT 1 AS ok`;
  console.log("Neon HTTP OK:", rows);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
