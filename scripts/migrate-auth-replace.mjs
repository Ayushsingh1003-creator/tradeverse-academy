import fs from "fs";
import path from "path";

const root = path.join(process.cwd(), "src");

const replacements = [
  [/isClerkConfigured/g, "isAuthConfigured"],
  [/@\/lib\/clerkEnabled/g, "@/lib/auth/enabled"],
  [/@\/lib\/clerkUrls/g, "@/lib/auth/urls"],
  [/CLERK_HOME_URL/g, "AUTH_HOME_URL"],
  [/CLERK_SIGN_IN_URL/g, "AUTH_SIGN_IN_URL"],
  [/CLERK_SIGN_UP_URL/g, "AUTH_SIGN_UP_URL"],
  [/CLERK_AFTER_SIGN_IN_URL/g, "AUTH_AFTER_SIGN_IN_URL"],
  [/CLERK_AFTER_SIGN_UP_URL/g, "AUTH_AFTER_SIGN_UP_URL"],
  [/CLERK_AFTER_SIGN_OUT_URL/g, "AUTH_AFTER_SIGN_OUT_URL"],
  [/resolveUserForClerk/g, "resolveUserForAuth"],
  [/clerkEnabled/g, "authEnabled"],
];

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (/\.(ts|tsx)$/.test(ent.name)) {
      let c = fs.readFileSync(p, "utf8");
      let n = c;
      for (const [from, to] of replacements) n = n.replace(from, to);
      if (n !== c) fs.writeFileSync(p, n, "utf8");
    }
  }
}

walk(root);
console.log("done");
