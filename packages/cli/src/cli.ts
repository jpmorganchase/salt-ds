import packageManifest from "../package.json";
import { runInfoCommand } from "./commands/info.js";
import {
  runScanCommand,
  type ScanFailOn,
  type ScanFormat,
} from "./commands/scan.js";

export const SALT_CLI_HELP = `Salt Design System CLI

Usage:
  salt-ds help
  salt-ds version
  salt-ds -h
  salt-ds --help
  salt-ds --version
  salt-ds info [root] --json
  salt-ds scan [root] --format pretty|json|sarif|prompt --fail-on error|warning|info|never [--allow-incomplete]

Commands:
  help       Show this help text.
  version    Print the installed CLI version.
  info       Inspect the exact local Salt package vector and Knowledge identity.
  scan       Review supported source files with the bundled offline rule engine.

The CLI runs locally and does not use the network, Storybook, MCP, or a model.
`;

export class SaltCliUsageError extends Error {
  readonly code = "SALT_CLI_USAGE";
  readonly exitCode = 2;

  constructor(message: string) {
    super(message);
    this.name = "SaltCliUsageError";
  }
}

export interface SaltCliIo {
  cwd(): string;
  stdout(value: string): void;
}

type ParsedCliCommand =
  | { command: "help" }
  | { command: "version" }
  | { command: "info"; rootDir: string | null; format: "json" }
  | {
      command: "scan";
      rootDir: string | null;
      format: ScanFormat;
      failOn: ScanFailOn;
      allowIncomplete: boolean;
    };

function requireNoTrailingArguments(command: string, argv: string[]): void {
  if (argv.length > 1) {
    throw new SaltCliUsageError(
      `${command} accepts no arguments. Run \`salt-ds help\` for usage.`,
    );
  }
}

export function parseCliArgs(argv: readonly string[]): ParsedCliCommand {
  const [command, ...arguments_] = argv;
  if (!command) {
    throw new SaltCliUsageError(
      "A command is required. Run `salt-ds help` for usage.",
    );
  }
  if (command === "help" || command === "-h" || command === "--help") {
    requireNoTrailingArguments(command, argv as string[]);
    return { command: "help" };
  }
  if (command === "version" || command === "--version") {
    requireNoTrailingArguments(command, argv as string[]);
    return { command: "version" };
  }
  if (command !== "info" && command !== "scan") {
    throw new SaltCliUsageError(
      `Unknown command: ${command}. Run \`salt-ds help\` for usage.`,
    );
  }

  if (command === "scan") return parseScanArguments(arguments_);

  let rootDir: string | null = null;
  let jsonCount = 0;
  for (const argument of arguments_) {
    if (argument === "--json") {
      jsonCount += 1;
      continue;
    }
    if (argument.startsWith("-")) {
      throw new SaltCliUsageError(`Unknown info option: ${argument}.`);
    }
    if (rootDir !== null) {
      throw new SaltCliUsageError("info accepts at most one project root.");
    }
    if (argument.includes("\0")) {
      throw new SaltCliUsageError("The project root contains an invalid byte.");
    }
    rootDir = argument;
  }
  if (jsonCount !== 1) {
    throw new SaltCliUsageError("info requires exactly one --json option.");
  }
  return { command: "info", rootDir, format: "json" };
}

function parseScanArguments(arguments_: readonly string[]): ParsedCliCommand {
  let rootDir: string | null = null;
  let format: ScanFormat | null = null;
  let failOn: ScanFailOn | null = null;
  let allowIncomplete = false;
  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index];
    if (argument === "--allow-incomplete") {
      if (allowIncomplete) {
        throw new SaltCliUsageError(
          "scan accepts --allow-incomplete at most once.",
        );
      }
      allowIncomplete = true;
      continue;
    }
    if (argument === "--format") {
      if (format !== null)
        throw new SaltCliUsageError("scan accepts --format once.");
      const value = arguments_[index + 1];
      if (!value || !["pretty", "json", "sarif", "prompt"].includes(value)) {
        throw new SaltCliUsageError(
          "scan requires a supported --format value.",
        );
      }
      format = value as ScanFormat;
      index += 1;
      continue;
    }
    if (argument === "--fail-on") {
      if (failOn !== null)
        throw new SaltCliUsageError("scan accepts --fail-on once.");
      const value = arguments_[index + 1];
      if (!value || !["error", "warning", "info", "never"].includes(value)) {
        throw new SaltCliUsageError(
          "scan requires a supported --fail-on value.",
        );
      }
      failOn = value as ScanFailOn;
      index += 1;
      continue;
    }
    if (argument.startsWith("-")) {
      throw new SaltCliUsageError(`Unknown scan option: ${argument}.`);
    }
    if (rootDir !== null) {
      throw new SaltCliUsageError("scan accepts at most one project root.");
    }
    if (argument.includes("\0")) {
      throw new SaltCliUsageError("The project root contains an invalid byte.");
    }
    rootDir = argument;
  }
  if (format === null || failOn === null) {
    throw new SaltCliUsageError(
      "scan requires exactly one --format and --fail-on option.",
    );
  }
  return { command: "scan", rootDir, format, failOn, allowIncomplete };
}

export async function runCliWithIo(
  argv: readonly string[],
  io: SaltCliIo,
): Promise<number> {
  const parsed = parseCliArgs(argv);
  if (parsed.command === "help") {
    io.stdout(SALT_CLI_HELP);
    return 0;
  }
  if (parsed.command === "version") {
    io.stdout(`${packageManifest.version}\n`);
    return 0;
  }
  if (parsed.command === "scan") {
    try {
      const scan = await runScanCommand({
        rootDir: parsed.rootDir ?? io.cwd(),
        cliVersion: packageManifest.version,
        format: parsed.format,
        failOn: parsed.failOn,
        allowIncomplete: parsed.allowIncomplete,
      });
      io.stdout(scan.output);
      return scan.exitCode;
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "exitCode" in error &&
        error.exitCode === 2
      ) {
        throw error;
      }
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        (error.code === "SALT_PROJECT_ROOT_NOT_DIRECTORY" ||
          error.code === "SALT_PROJECT_ROOT_UNAVAILABLE")
      ) {
        throw new SaltCliUsageError(
          error instanceof Error
            ? error.message
            : "The project root is invalid.",
        );
      }
      throw Object.assign(new Error("The scan could not be completed."), {
        code: "SALT_CLI_SCAN_FAILED",
        exitCode: 3,
      });
    }
  }
  let result: Awaited<ReturnType<typeof runInfoCommand>>;
  try {
    result = await runInfoCommand({
      rootDir: parsed.rootDir ?? io.cwd(),
      cliVersion: packageManifest.version,
    });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error.code === "SALT_PROJECT_ROOT_NOT_DIRECTORY" ||
        error.code === "SALT_PROJECT_ROOT_UNAVAILABLE")
    ) {
      throw new SaltCliUsageError(
        error instanceof Error ? error.message : "The project root is invalid.",
      );
    }
    throw error;
  }
  io.stdout(`${JSON.stringify(result)}\n`);
  return 0;
}

export async function runCli(
  argv: string[] = process.argv.slice(2),
): Promise<number> {
  return runCliWithIo(argv, {
    cwd: () => process.cwd(),
    stdout: (value) => process.stdout.write(value),
  });
}
