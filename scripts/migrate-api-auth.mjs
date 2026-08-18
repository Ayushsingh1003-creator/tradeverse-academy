import fs from "fs";
import path from "path";

const files = [
  "src/app/api/xp/history/route.ts",
  "src/app/api/live-classes/enroll/route.ts",
  "src/app/api/library/enroll/route.ts",
  "src/app/api/leaderboard/weekly/route.ts",
  "src/app/api/leaderboard/route.ts",
  "src/app/api/league/standings/route.ts",
  "src/app/api/stripe/create-checkout/route.ts",
  "src/app/api/stripe/create-portal/route.ts",
  "src/app/api/stripe/connect/route.ts",
  "src/app/api/recommendations/route.ts",
  "src/app/api/push/subscribe/route.ts",
  "src/app/api/lessons/[slug]/comments/route.ts",
  "src/app/api/lesson-comments/[commentId]/upvote/route.ts",
  "src/app/api/lesson-comments/[commentId]/reply/route.ts",
];

const authOnlyHeader = `import { getAuthUserId } from "@/lib/auth/session";\n`;

const requireDbHeader = `import { requireDbUser } from "@/lib/auth/api";\nimport { getAuthUserId } from "@/lib/auth/session";\n`;

for (const rel of files) {
  const p = path.join(process.cwd(), rel);
  if (!fs.existsSync(p)) continue;
  let c = fs.readFileSync(p, "utf8");
  if (!c.includes("@clerk/nextjs/server")) continue;

  const needsDbUser =
    c.includes("resolveUserForAuth") ||
    c.includes("currentUser") ||
    rel.includes("library/enroll") ||
    rel.includes("live-classes/enroll");

  c = c.replace(/import \{[^}]+\} from "@clerk\/nextjs\/server";\n/g, "");
  c = c.replace(/import \{ resolveUserForAuth \} from "@\/lib\/server\/resolveDbUser";\n/g, "");

  const insertAt = c.indexOf('import { Next');
  const header = needsDbUser ? requireDbHeader : authOnlyHeader;
  if (!c.includes("@/lib/auth/session") && !c.includes("@/lib/auth/api")) {
    c = c.slice(0, insertAt) + header + c.slice(insertAt);
  }

  c = c.replace(
    /const \{ userId \} = await auth\(\);\s*\n\s*if \(!userId\) return[^\n]+\n/g,
    needsDbUser
      ? `const authResult = await requireDbUser();\n  if (authResult.error) return authResult.error;\n  const { authUserId: userId, dbUser } = authResult;\n`
      : `const userId = await getAuthUserId();\n  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });\n`,
  );

  c = c.replace(
    /const clerk = await currentUser\(\);\s*\n\s*const email = clerk\?\.[^;]+;\s*\n\s*const name = clerk\?\.[^;]+;\s*\n\s*const dbUser = await resolveUserForAuth\(userId, email, \{ name \}\);\s*\n\s*if \(!dbUser\) return[^\n]+\n/g,
    "",
  );

  c = c.replace(
    /const clerk = await currentUser\(\);\s*\n\s*const email = clerk\?\.[^;]+;\s*\n\s*const dbUser = await resolveUserForAuth\(userId, email\);\s*\n\s*if \(!dbUser\) return[^\n]+\n/g,
    "",
  );

  fs.writeFileSync(p, c, "utf8");
  console.log("updated", rel);
}
