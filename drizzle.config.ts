import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import type { Config } from "drizzle-kit";

// Next.js uses .env.local; drizzle-kit CLI must load it explicitly.
loadEnv({ path: resolve(process.cwd(), ".env.local") });
loadEnv({ path: resolve(process.cwd(), ".env") });

neonConfig.webSocketConstructor = ws;

export default {
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  schemaFilter: ["public"],
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
