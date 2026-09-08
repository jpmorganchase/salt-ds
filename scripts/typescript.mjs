import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);

export async function runTypeScript(args, { cwd = process.cwd() } = {}) {
  // Resolve the native compiler explicitly: the legacy API package also has a
  // `tsc` binary, so package-manager bin links can select the wrong compiler.
  const manifestPath = require.resolve("@typescript/native/package.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const bin = manifest.bin?.tsc;
  if (typeof bin !== "string") {
    throw new Error("The native TypeScript package does not provide a tsc CLI");
  }

  const binPath = path.resolve(path.dirname(manifestPath), bin);
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [binPath, ...args], {
      cwd,
      stdio: "inherit",
      shell: false,
      windowsHide: true,
    });
    child.once("error", reject);
    child.once("close", (code, signal) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(
            `TypeScript exited with ${signal ? `signal ${signal}` : `code ${code}`}`,
          ),
        );
      }
    });
  });
}
