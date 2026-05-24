/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

async function main() {
  const input = path.join(__dirname, "..", "public", "icon-source.svg");
  const outDir = path.join(__dirname, "..", "public", "icons");
  await fs.promises.mkdir(outDir, { recursive: true });

  const sizes = [72, 96, 128, 192, 512];
  for (const s of sizes) {
    await sharp(input).resize(s, s).png().toFile(path.join(outDir, `icon-${s}.png`));
    console.log("wrote", `icon-${s}.png`);
  }
  for (const name of ["shortcut-learn", "shortcut-challenge"]) {
    await sharp(input).resize(96, 96).png().toFile(path.join(outDir, `${name}.png`));
    console.log("wrote", `${name}.png`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
