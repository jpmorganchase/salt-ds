import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const repositoryYarnEntrypoint = fileURLToPath(
  new URL("../.yarn/releases/yarn-4.17.0.cjs", import.meta.url),
);

export const CSS_BUNDLE_LANES = Object.freeze([
  Object.freeze([
    "bundle:core:css",
    "bundle:lab:css",
    "bundle:date-components:css",
  ]),
  Object.freeze([
    "bundle:embla-carousel:css",
    "copy:icon:css",
    "copy:countries:css",
  ]),
]);

function runYarnScript(scriptName) {
  // Yarn may expose a temporary POSIX wrapper through npm_execpath on Windows.
  // Launch the repository-pinned JavaScript entrypoint directly so Node never
  // attempts to parse that shell wrapper as JavaScript.
  const yarnEntrypoint = repositoryYarnEntrypoint;
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [yarnEntrypoint, "run", scriptName], {
      cwd: process.cwd(),
      env: process.env,
      stdio: "inherit",
      windowsHide: true,
    });
    child.on("error", reject);
    child.on("close", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(
        new Error(
          `CSS bundle step '${scriptName}' failed${
            signal ? ` with signal ${signal}` : ` with exit code ${code}`
          }.`,
        ),
      );
    });
  });
}

export async function runCssBundleLanes(runScript = runYarnScript) {
  const results = await Promise.allSettled(
    CSS_BUNDLE_LANES.map(async (lane) => {
      for (const scriptName of lane) {
        await runScript(scriptName);
      }
    }),
  );
  const failures = results
    .filter((result) => result.status === "rejected")
    .map((result) => result.reason);
  if (failures.length > 0) {
    throw new AggregateError(failures, "One or more CSS bundle lanes failed.");
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await runCssBundleLanes();
}
