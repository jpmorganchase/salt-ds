import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { runCommands, yarnTask } from "./verifyRunner.mjs";

const supportedExtensions = new Set([
  ".cjs",
  ".css",
  ".gql",
  ".graphql",
  ".html",
  ".js",
  ".json",
  ".jsonc",
  ".jsx",
  ".mjs",
  ".ts",
  ".tsx",
]);

export function createBatches(paths, maximumCharacters = 20_000) {
  const batches = [];
  let batch = [];
  let characterCount = 0;

  for (const file of paths) {
    if (
      batch.length > 0 &&
      characterCount + file.length + 1 > maximumCharacters
    ) {
      batches.push(batch);
      batch = [];
      characterCount = 0;
    }
    batch.push(file);
    characterCount += file.length + 1;
  }
  if (batch.length > 0) {
    batches.push(batch);
  }
  return batches;
}

export function normalizeLineEndings(content) {
  return content.replaceAll("\r\n", "\n").replaceAll("\r", "\n");
}

function listFiles() {
  const result = spawnSync(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
    { encoding: "utf8", windowsHide: true },
  );
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || `git exited with ${result.status}`);
  }
  return result.stdout.split("\0").filter(Boolean);
}

async function checkBiome() {
  const files = listFiles().filter((file) =>
    supportedExtensions.has(path.extname(file).toLowerCase()),
  );
  const lintTasks = createBatches(files).map((batch, index, batches) =>
    yarnTask(`Biome lint and assist ${index + 1}/${batches.length}`, [
      "biome",
      "check",
      "--formatter-enabled=false",
      "--diagnostic-level=error",
      ...batch,
    ]),
  );
  await runCommands(lintTasks);

  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "salt-biome-"));
  try {
    fs.copyFileSync(".gitignore", path.join(temporaryRoot, ".gitignore"));
    const copiedFiles = [];
    for (const file of files) {
      const content = fs.readFileSync(file);
      if (content.includes(0)) {
        continue;
      }
      const destination = path.join(temporaryRoot, file);
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.writeFileSync(destination, normalizeLineEndings(content.toString()));
      copiedFiles.push(file);
    }

    await runCommands([
      yarnTask("Biome formatter", [
        "biome",
        "format",
        "--write",
        "--line-ending=lf",
        `--config-path=${path.join(temporaryRoot, "biome.jsonc")}`,
        temporaryRoot,
      ]),
    ]);

    const unformatted = copiedFiles.filter((file) => {
      const source = normalizeLineEndings(fs.readFileSync(file, "utf8"));
      const formatted = fs.readFileSync(path.join(temporaryRoot, file), "utf8");
      return source !== formatted;
    });
    if (unformatted.length > 0) {
      for (const file of unformatted) {
        console.error(`Not formatted: ${file}`);
      }
      throw new Error(`${unformatted.length} file(s) require Biome formatting`);
    }
  } finally {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    await checkBiome();
  } catch (error) {
    console.error(`\nBiome check failed: ${error.message}`);
    process.exitCode = 1;
  }
}
