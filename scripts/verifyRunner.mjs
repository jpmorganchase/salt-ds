import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url));

function findYarnRelease() {
  const configuredPath = process.env.npm_execpath;
  if (configuredPath && /\.[cm]?js$/iu.test(configuredPath)) {
    return configuredPath;
  }

  const releasesDirectory = path.resolve(
    scriptsDirectory,
    "..",
    ".yarn",
    "releases",
  );
  const releases = fs
    .readdirSync(releasesDirectory)
    .filter((file) => /^yarn-.*\.cjs$/u.test(file));
  if (releases.length !== 1) {
    throw new Error(
      `Expected one checked-in Yarn release, found ${releases.length}`,
    );
  }
  return path.join(releasesDirectory, releases[0]);
}

export class VerificationError extends Error {
  constructor(label, exitCode, signal) {
    const outcome = signal ? `signal ${signal}` : `exit code ${exitCode}`;
    super(`${label} failed with ${outcome}`);
    this.name = "VerificationError";
    this.exitCode = exitCode;
    this.signal = signal;
  }
}

export function yarnTask(label, args) {
  return {
    label,
    command: process.execPath,
    args: [findYarnRelease(), ...args],
  };
}

export function runCommand(
  { label, command, args = [] },
  { cwd = process.cwd(), env = process.env } = {},
) {
  console.log(`\n[verify] ${label}`);

  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env,
      stdio: "inherit",
      windowsHide: true,
    });

    child.once("error", reject);
    child.once("exit", (exitCode, signal) => {
      if (exitCode === 0) {
        resolve();
      } else {
        reject(new VerificationError(label, exitCode, signal));
      }
    });
  });
}

export async function runCommands(tasks, options) {
  for (const task of tasks) {
    await runCommand(task, options);
  }
}
