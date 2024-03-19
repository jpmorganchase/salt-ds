import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcFolder = path.join(__dirname, "../src");
const buildFolder = path.join(__dirname, "../../../dist/salt-ds-icons");
const cssFolder = path.join(buildFolder, "/css");

try {
  await mkdir(cssFolder, { recursive: true });
  await copyFile(
    path.join(srcFolder, "/icon/Icon.css"),
    path.join(cssFolder, "/salt-icon.css")
  );
  await copyFile(
    path.join(srcFolder, "/icon/saltIcons.css"),
    path.join(cssFolder, "/salt-icons.css")
  );
  console.log(`Icon.css copied to: ${cssFolder} `);
} catch (err) {
  console.error(err.message);
}
