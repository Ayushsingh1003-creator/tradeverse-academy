import fs from "fs";
import path from "path";

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (/\.(ts|tsx)$/.test(ent.name)) {
      let c = fs.readFileSync(p, "utf8");
      const n = c
        .split("\n")
        .filter((line) => !line.includes("@clerk/"))
        .join("\n");
      if (n !== c) {
        fs.writeFileSync(p, n, "utf8");
        console.log("fixed", p);
      }
    }
  }
}

walk(path.join(process.cwd(), "src"));
