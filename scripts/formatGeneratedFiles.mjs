import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { setTimeout } from "node:timers/promises";

const require = createRequire(import.meta.url);

async function runBiome(cliPath, args, cwd) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const { code, signal, diagnostics } = await new Promise(
      (resolve, reject) => {
        let diagnostics = "";
        const child = spawn(process.execPath, [cliPath, ...args], {
          cwd,
          stdio: ["ignore", "inherit", "pipe"],
          shell: false,
          windowsHide: true,
        });
        child.stderr.setEncoding("utf8");
        child.stderr.on("data", (output) => {
          diagnostics += output;
          process.stderr.write(output);
        });
        child.once("error", reject);
        child.once("close", (code, signal) => {
          resolve({ code, signal, diagnostics });
        });
      },
    );
    const internalErrors =
      diagnostics.match(/\binternalError(?:\/\w+)?\b/g) ?? [];
    if (code === 0 && internalErrors.length === 0) return;

    // Windows readers can briefly map an output while Biome tries to truncate
    // it. Biome reports these failed writes with exit code zero. Retry only
    // that specific transient error; persistent locks and other errors fail.
    const mappedErrors = diagnostics.match(/\(os error 1224\)/g) ?? [];
    if (
      attempt < 2 &&
      code === 0 &&
      internalErrors.length > 0 &&
      internalErrors.every((category) => category === "internalError/io") &&
      mappedErrors.length === internalErrors.length
    ) {
      await setTimeout(100 * (attempt + 1));
      continue;
    }
    throw new Error(
      internalErrors.length > 0
        ? `Biome ${args[0]} reported an internal error (exit code ${code})`
        : `Biome ${args[0]} exited with ${signal ? `signal ${signal}` : `code ${code}`}`,
    );
  }
}

export async function formatGeneratedFiles(
  files,
  { cwd = process.cwd(), maxSize } = {},
) {
  cwd = path.resolve(cwd);
  const relativePaths = [
    ...new Set(
      files.map((file) => path.relative(cwd, path.resolve(cwd, file))),
    ),
  ].sort();
  if (relativePaths.length === 0) {
    return;
  }

  const manifestPath = require.resolve("@biomejs/biome/package.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const cliPath = path.resolve(path.dirname(manifestPath), manifest.bin.biome);
  const configDirectory = await mkdtemp(
    path.join(tmpdir(), "salt-generated-biome-"),
  );
  const configPath = path.join(configDirectory, "biome.json");

  try {
    await writeFile(
      configPath,
      JSON.stringify({
        root: true,
        vcs: { enabled: false },
        files: maxSize === undefined ? {} : { maxSize },
        assist: { actions: { source: { organizeImports: "on" } } },
        formatter: { enabled: true, indentStyle: "space" },
      }),
    );

    // Explicit file lists avoid changing handwritten files. Bound argument size
    // so growing generated sets also fit Windows' command-line limit.
    const batches = [];
    let batch = [];
    let length = 0;
    for (const file of relativePaths) {
      if (batch.length > 0 && length + file.length + 3 > 24_000) {
        batches.push(batch);
        batch = [];
        length = 0;
      }
      batch.push(file);
      length += file.length + 3;
    }
    batches.push(batch);

    // Preserve the generators' format-then-safe-fix order. The second pass
    // organizes imports and applies the same default recommended lint fixes.
    for (const paths of batches) {
      await runBiome(
        cliPath,
        ["format", "--write", "--config-path", configPath, "--", ...paths],
        cwd,
      );
    }
    for (const paths of batches) {
      await runBiome(
        cliPath,
        [
          "check",
          "--write",
          "--formatter-enabled=false",
          "--config-path",
          configPath,
          "--",
          ...paths,
        ],
        cwd,
      );
    }
  } finally {
    await rm(configDirectory, { recursive: true, force: true });
  }
}
