import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcFolder = path.join(__dirname, "../src");
const buildFolder = path.join(__dirname, "../../../dist/salt-ds-countries");
const cssFolder = path.join(buildFolder, "/css");
const storybookFolder = path.join(__dirname, "../../../docs/css");

try {
  await mkdir(cssFolder, { recursive: true });
  await copyFile(
    path.join(srcFolder, "/country-symbol/CountrySymbol.css"),
    path.join(cssFolder, "/salt-countries.css"),
  );
  console.log(`salt-countries.css copied to: ${cssFolder} `);
  await copyFile(
    path.join(srcFolder, "/country-symbol/CountrySymbol.css"),
    path.join(storybookFolder, "/salt-countries.css"),
  );
  console.log(`salt-countries.css copied to: ${storybookFolder} `);
} catch (err) {
  console.error(err.message);
}
