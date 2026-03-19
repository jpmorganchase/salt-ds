import fs from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ensureSiteBuildInputs } from "./ensureSiteBuildInputs.mjs";

const ALLOWED_FLAGS = new Set(["source-root", "output-dir"]);

function parseFlags(argv) {
  const flags = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      throw new Error(
        `Unexpected argument: ${token}. This repo script only accepts --source-root and --output-dir.`,
      );
    }

    const key = token.slice(2);
    if (!ALLOWED_FLAGS.has(key)) {
      throw new Error(
        `Unknown flag: --${key}. Supported flags: --source-root, --output-dir.`,
      );
    }

    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      throw new Error(`Missing value for --${key}.`);
    }

    flags[key] = next;
    index += 1;
  }

  return flags;
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(scriptDir, "..");
const repoRoot = path.resolve(packageRoot, "..", "..");
const distIndexPath = path.join(
  repoRoot,
  "dist",
  "salt-ds-mcp",
  "dist-cjs",
  "index.js",
);
const require = createRequire(import.meta.url);
const flags = parseFlags(process.argv.slice(2));
const sourceRoot = flags["source-root"]
  ? path.resolve(flags["source-root"])
  : repoRoot;
const outputDir = flags["output-dir"]
  ? path.resolve(flags["output-dir"])
  : path.join(packageRoot, "generated");

try {
  await fs.access(distIndexPath);
} catch {
  throw new Error(
    "Missing built @salt-ds/mcp package output. Run `yarn workspace @salt-ds/mcp build:package` first.",
  );
}

const { buildRegistry } = require(distIndexPath);
await ensureSiteBuildInputs(sourceRoot);

const registry = await buildRegistry({
  sourceRoot,
  outputDir,
});

console.error(
  `Built registry at ${outputDir}: ${registry.packages.length} packages, ${registry.components.length} components, ${registry.icons.length} icons, ${registry.country_symbols.length} country symbols, ${registry.patterns.length} patterns, ${registry.tokens.length} tokens.`,
);
