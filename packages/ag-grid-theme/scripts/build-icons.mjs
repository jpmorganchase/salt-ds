/**
 * Build `fonts/salt-icons.woff` by composing glyphs from two sources, as
 * declared in `icons.manifest.cjs`:
 *   - Salt source SVGs from `packages/icons/src/SVG/*.svg`
 *   - Local custom SVGs from `icons-src/*.svg` (only for icons with no
 *     Salt equivalent)
 *
 * Run with:  yarn workspace @salt-ds/ag-grid-theme run regen-icons
 *
 * The build:
 *   1. Reads the manifest.
 *   2. For each entry, resolves the source SVG and copies it into a temp
 *      staging directory under the ag-grid name (e.g. `tick.svg` ← Salt's
 *      `checkmark.svg`).
 *   3. Runs fantasticon against the staging dir with codepoints from the
 *      manifest.
 *   4. Validates: errors if a required source SVG is missing, and warns if
 *      `icons-src/` contains a stale SVG whose manifest entry points at Salt.
 *   5. Cleans up staging.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { generateFonts } from "fantasticon";

const require = createRequire(import.meta.url);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgDir = path.resolve(__dirname, "..");
const manifestPath = path.join(pkgDir, "icons.manifest.cjs");
const saltSvgDir = path.resolve(pkgDir, "../icons/src/SVG");
const customSvgDir = path.join(pkgDir, "icons-src");
const outputDir = path.join(pkgDir, "fonts");

/** @type {Record<string, { source: string; codepoint: number }>} */
const manifest = require(manifestPath);

/** Resolve the on-disk SVG that backs a manifest entry. */
function resolveSource(agName, entry) {
  if (entry.source === "custom") {
    return path.join(customSvgDir, `${agName}.svg`);
  }
  if (entry.source.startsWith("salt:")) {
    return path.join(saltSvgDir, `${entry.source.slice(5)}.svg`);
  }
  throw new Error(
    `[${agName}] unknown manifest source "${entry.source}" — expected "custom" or "salt:<filename>".`,
  );
}

const stagingDir = fs.mkdtempSync(path.join(os.tmpdir(), "salt-ag-icons-"));
let exitCode = 0;

try {
  /** @type {Record<string, number>} */
  const codepoints = {};
  /** @type {Array<{ agName: string; srcFile: string }>} */
  const missing = [];

  for (const [agName, entry] of Object.entries(manifest)) {
    const srcFile = resolveSource(agName, entry);
    if (!fs.existsSync(srcFile)) {
      missing.push({ agName, srcFile });
      continue;
    }
    fs.copyFileSync(srcFile, path.join(stagingDir, `${agName}.svg`));
    codepoints[agName] = entry.codepoint;
  }

  if (missing.length > 0) {
    console.error("✖ Missing source SVGs:");
    for (const { agName, srcFile } of missing) {
      console.error(
        `    ${agName.padEnd(24)} expected at ${path.relative(pkgDir, srcFile)}`,
      );
    }
    console.error(
      "\nFor `custom` entries, drop the SVG into icons-src/. For `salt:*` entries, double-check the filename exists in @salt-ds/icons.",
    );
    process.exit(1);
  }

  // Drift check: warn if icons-src/ holds SVGs that the manifest no longer
  // marks as custom (e.g. an icon previously bootstrapped from the legacy
  // WOFF that is now sourced from Salt).
  if (fs.existsSync(customSvgDir)) {
    const customsFromManifest = new Set(
      Object.entries(manifest)
        .filter(([, e]) => e.source === "custom")
        .map(([name]) => name),
    );
    const stale = fs
      .readdirSync(customSvgDir)
      .filter((f) => f.endsWith(".svg"))
      .map((f) => f.replace(/\.svg$/, ""))
      .filter((name) => !customsFromManifest.has(name));
    if (stale.length > 0) {
      console.warn(
        `⚠ icons-src/ contains SVGs not declared as \`custom\` in the manifest:\n` +
          stale.map((n) => `    icons-src/${n}.svg`).join("\n") +
          `\n  These files are ignored by the build. Delete them, or update the manifest if you intend to override the Salt source.\n`,
      );
    }
  }

  console.log(
    `Generating salt-icons.woff from ${Object.keys(codepoints).length} glyphs ` +
      `(${Object.values(manifest).filter((e) => e.source !== "custom").length} from @salt-ds/icons, ` +
      `${Object.values(manifest).filter((e) => e.source === "custom").length} custom)…`,
  );

  await generateFonts({
    name: "salt-icons",
    inputDir: stagingDir,
    outputDir,
    fontTypes: ["woff"],
    assetTypes: [],
    normalize: true,
    fontHeight: 1000,
    codepoints,
  });

  console.log(
    `✓ Wrote ${path.relative(process.cwd(), path.join(outputDir, "salt-icons.woff"))}`,
  );
} catch (err) {
  exitCode = 1;
  console.error(err);
} finally {
  fs.rmSync(stagingDir, { recursive: true, force: true });
  process.exit(exitCode);
}

