import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..", "..", "..");
const cacheDir = path.join(repoRoot, ".salt-eval-cache");
const wrapperPath = path.join(cacheDir, "evidence-sprint-entry.ts");
const outputPath = path.join(cacheDir, "evidence-sprint-entry.mjs");

await fs.mkdir(cacheDir, { recursive: true });
await fs.writeFile(
  wrapperPath,
  [
    `import { runCli } from ${JSON.stringify(path.join(repoRoot, "packages", "mcp", "src", "evals", "runEvidenceSprint.ts").replaceAll("\\", "/"))};`,
    "",
    "runCli(process.argv.slice(2))",
    "  .then((exitCode) => {",
    "    process.exit(typeof exitCode === 'number' ? exitCode : 0);",
    "  })",
    "  .catch((error) => {",
    '    console.error("salt evidence sprint error:", error);',
    "    process.exit(1);",
    "  });",
    "",
  ].join("\n"),
  "utf8",
);

await build({
  entryPoints: [wrapperPath],
  outfile: outputPath,
  bundle: true,
  platform: "node",
  format: "esm",
  sourcemap: false,
  absWorkingDir: repoRoot,
  external: ["chromium-bidi/*", "typescript"],
  logLevel: "silent",
});

await import(pathToFileURL(outputPath).href);
