import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import url from "node:url";
import fantasticon from "fantasticon";
import { normalizeSvgWinding } from "./normalize-svg-winding.mjs";

const { generateFonts, FontAssetType } = fantasticon;

const packageDir = path.join(
  path.dirname(url.fileURLToPath(import.meta.url)),
  "..",
);
const iconsDir = path.join(packageDir, "src/icons");
const codepointsPath = path.join(iconsDir, "codepoints.json");
const fontPath = path.join(packageDir, "src/fonts/salt-icons.woff");
const cssPath = path.join(packageDir, "src/css/salt-icons.css");

const iconNames = fs
  .readdirSync(iconsDir)
  .filter((file) => file.endsWith(".svg"))
  .map((file) => path.basename(file, ".svg"))
  .sort();

const codepoints = JSON.parse(fs.readFileSync(codepointsPath, "utf8"));

// Codepoints are referenced by salt-icons.css (and possibly consumers), so removing an icon is not allowed.
const orphaned = Object.keys(codepoints).filter(
  (name) => !iconNames.includes(name),
);
if (orphaned.length > 0) {
  throw new Error(
    `Missing SVGs for existing codepoints: ${orphaned.join(", ")}`,
  );
}

// New icons get the next codepoint after the current highest, so existing codepoints never move.
let nextCodepoint = Math.max(...Object.values(codepoints)) + 1;
const added = iconNames.filter((name) => codepoints[name] === undefined);
for (const name of added) {
  codepoints[name] = nextCodepoint++;
}

const normalizedDir = fs.mkdtempSync(path.join(os.tmpdir(), "salt-ag-icons-"));
let assetsOut;
try {
  for (const name of iconNames) {
    const svg = fs.readFileSync(path.join(iconsDir, `${name}.svg`), "utf8");
    fs.writeFileSync(
      path.join(normalizedDir, `${name}.svg`),
      normalizeSvgWinding(svg),
    );
  }

  ({ assetsOut } = await generateFonts({
    inputDir: normalizedDir,
    name: "salt-icons",
    fontTypes: [FontAssetType.WOFF],
    assetTypes: [],
    codepoints,
    // Matches the original IcoMoon font metrics (1024 units per em, ascent 960, descent -64).
    fontHeight: 1024,
    descent: 64,
    normalize: true,
    formatOptions: { ttf: { version: "2.0" } },
  }));
} finally {
  fs.rmSync(normalizedDir, { recursive: true, force: true });
}

fs.writeFileSync(fontPath, assetsOut.woff);

const sortedCodepoints = Object.fromEntries(
  Object.entries(codepoints).sort(([, a], [, b]) => a - b),
);
fs.writeFileSync(
  codepointsPath,
  `${JSON.stringify(sortedCodepoints, null, 2)}\n`,
);

console.log(
  `Built ${path.relative(packageDir, fontPath)} with ${iconNames.length} icons`,
);
for (const name of added) {
  console.log(`  added ${name} -> \\${codepoints[name].toString(16)}`);
}

const css = fs.readFileSync(cssPath, "utf8");
const missingCss = iconNames.filter(
  (name) => !css.includes(`--ag-icon-font-code-${name}:`),
);
if (missingCss.length > 0) {
  console.warn(`\nAdd the following to ${path.relative(packageDir, cssPath)}:`);
  for (const name of missingCss) {
    console.warn(
      `  --ag-icon-font-code-${name}: "\\${codepoints[name].toString(16)}";`,
    );
  }
}
