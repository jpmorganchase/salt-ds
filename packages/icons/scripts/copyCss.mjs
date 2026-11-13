import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { transformCssFile } from "../../../scripts/cssBaseline.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcFolder = path.join(__dirname, "../src");
const cssFolder = path.join(__dirname, "../css");

try {
  await mkdir(cssFolder, { recursive: true });
  await transformCssFile(
    path.join(srcFolder, "/icon/Icon.css"),
    path.join(cssFolder, "/salt-icon.css"),
  );
  console.log(`Icon.css copied to: ${cssFolder} `);
} catch (err) {
  console.error(err.message);
}
