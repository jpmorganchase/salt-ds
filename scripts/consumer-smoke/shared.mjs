import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const REPLACE_PROCESS_ENVIRONMENT = Symbol(
  "salt.consumer-smoke.replace-process-environment",
);

const WINDOWS_CMD_META_CHARACTERS = /([()\][%!^"`<>&|;, *?])/gu;

function escapeWindowsCommand(value) {
  return String(value).replace(WINDOWS_CMD_META_CHARACTERS, "^$1");
}

function escapeWindowsArgument(value, doubleEscapeMetaCharacters = false) {
  let escaped = String(value)
    .replace(/(?=(\\+?)?)\1"/gu, '$1$1\\"')
    .replace(/(?=(\\+?)?)\1$/gu, "$1$1");
  escaped = `"${escaped}"`.replace(WINDOWS_CMD_META_CHARACTERS, "^$1");
  return doubleEscapeMetaCharacters
    ? escaped.replace(WINDOWS_CMD_META_CHARACTERS, "^$1")
    : escaped;
}

export function createWindowsCmdInvocation(command, args) {
  const doubleEscapeMetaCharacters = /\.cmd$/iu.test(command);
  const commandLine = [
    escapeWindowsCommand(command),
    ...args.map((arg) =>
      escapeWindowsArgument(arg, doubleEscapeMetaCharacters),
    ),
  ].join(" ");
  return {
    command: process.env.ComSpec ?? "cmd.exe",
    args: ["/d", "/s", "/c", `"${commandLine}"`],
    windowsVerbatimArguments: true,
  };
}

export const repoRoot = path.resolve(__dirname, "..", "..");
export const distKnowledgeDir = path.join(
  repoRoot,
  "dist",
  "salt-ds-knowledge",
);
export const distCliDir = path.join(repoRoot, "dist", "salt-ds-cli");

const CONSUMER_SMOKE_OPTIONS = new Set([
  "journey",
  "keep-temp",
  "skip-build",
  "pack-report",
]);

export function getExecutable(name) {
  return process.platform === "win32" ? `${name}.cmd` : name;
}

export function getInstalledCliBin(rootDir) {
  return path.join(
    rootDir,
    "node_modules",
    "@salt-ds",
    "cli",
    "bin",
    "salt-ds.js",
  );
}

export function parseArgs(argv) {
  const flags = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      continue;
    }

    const key = token.slice(2);
    assert(
      CONSUMER_SMOKE_OPTIONS.has(key),
      `Unknown consumer smoke option: --${key}.`,
    );
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      flags[key] = "true";
      continue;
    }

    flags[key] = next;
    index += 1;
  }

  const result = {
    journey: flags.journey === "true",
    keepTemp: flags["keep-temp"] === "true",
    skipBuild: flags["skip-build"] === "true",
    packReport: flags["pack-report"],
  };
  assert(result.packReport, "Local packed smoke requires --pack-report.");
  return result;
}

export function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

export async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

export async function runCommand(command, args, options = {}) {
  const {
    cwd = repoRoot,
    env = {},
    label = `${command} ${args.join(" ")}`,
    acceptableExitCodes = [0],
    timeoutMs = 5 * 60 * 1000,
  } = options;

  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1) {
    throw new Error(
      `Command timeout must be a positive integer; received ${timeoutMs}.`,
    );
  }

  return new Promise((resolve, reject) => {
    const useWindowsCmdShim =
      process.platform === "win32" && command.toLowerCase().endsWith(".cmd");
    const windowsInvocation = useWindowsCmdShim
      ? createWindowsCmdInvocation(command, args)
      : null;
    const child = spawn(
      windowsInvocation?.command ?? command,
      windowsInvocation?.args ?? args,
      {
        cwd,
        env:
          env[REPLACE_PROCESS_ENVIRONMENT] === true
            ? env
            : { ...process.env, ...env },
        stdio: ["ignore", "pipe", "pipe"],
        windowsHide: true,
        windowsVerbatimArguments:
          windowsInvocation?.windowsVerbatimArguments ?? false,
      },
    );

    let stdout = "";
    let stderr = "";
    let timedOut = false;
    let settled = false;
    const finish = (callback) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      callback();
    };
    const timeout = setTimeout(() => {
      timedOut = true;
      child.kill();
    }, timeoutMs);
    timeout.unref();

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", (error) => finish(() => reject(error)));
    child.on("close", (code) => {
      if (timedOut) {
        finish(() =>
          reject(
            new Error(
              `${label} exceeded its ${timeoutMs}ms timeout and was terminated.\nstdout:\n${stdout}\nstderr:\n${stderr}`,
            ),
          ),
        );
        return;
      }
      if (acceptableExitCodes.includes(code ?? -1)) {
        finish(() => resolve({ stdout, stderr, exitCode: code ?? 0 }));
        return;
      }

      finish(() =>
        reject(
          new Error(
            `${label} failed with exit code ${code}\nstdout:\n${stdout}\nstderr:\n${stderr}`,
          ),
        ),
      );
    });
  });
}
