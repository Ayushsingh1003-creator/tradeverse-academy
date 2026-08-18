/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

async function main() {
  const publicDir = path.join(__dirname, "..", "public");
  const input = path.join(publicDir, "logo.png");
  const outDir = path.join(publicDir, "icons");
  await fs.promises.mkdir(outDir, { recursive: true });

  const sizes = [72, 96, 128, 192, 512];
  for (const s of sizes) {
    await sharp(input).resize(s, s, { fit: "cover" }).png().toFile(path.join(outDir, `icon-${s}.png`));
    console.log("wrote", `icon-${s}.png`);
  }
  for (const name of ["shortcut-learn", "shortcut-challenge"]) {
    await sharp(input).resize(96, 96, { fit: "cover" }).png().toFile(path.join(outDir, `${name}.png`));
    console.log("wrote", `${name}.png`);
  }

  await sharp(input).resize(32, 32, { fit: "cover" }).png().toFile(path.join(publicDir, "favicon.png"));
  console.log("wrote", "favicon.png");
  await sharp(input).resize(180, 180, { fit: "cover" }).png().toFile(path.join(publicDir, "apple-touch-icon.png"));
  console.log("wrote", "apple-touch-icon.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
