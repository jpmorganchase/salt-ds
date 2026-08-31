import packageManifest from "../package.json";
import { runContextCommand } from "./commands/context.js";
import { runDocsCommand } from "./commands/docs.js";
import { runInfoCommand } from "./commands/info.js";
import { runSkillCommand, type SaltSkillKind } from "./commands/skill.js";

export const SALT_CLI_HELP = `Salt Design System CLI

Usage:
  salt-ds help
  salt-ds version
  salt-ds -h
  salt-ds --help
  salt-ds --version
  salt-ds info [root] --json
  salt-ds docs <record-id-or-name> --format markdown|json
  salt-ds context <query> --format markdown|json --limit <n>
  salt-ds skill info --json
  salt-ds skill print --kind skill|agents

Commands:
  help       Show this help text.
  version    Print the installed CLI version.
  info       Inspect the exact local Salt package vector and Knowledge identity.
  docs       Read one exact, compatible Knowledge record.
  context    Retrieve a bounded, cited Knowledge slice.
  skill      Inspect or print the verified bundled Skill artifacts.

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
  stdout(value: string): void | Promise<void>;
}

type ParsedCliCommand =
  | { command: "help" }
  | { command: "version" }
  | { command: "info"; rootDir: string | null; format: "json" }
  | {
      command: "docs";
      identifier: string;
      format: "markdown" | "json";
    }
  | {
      command: "context";
      query: string;
      format: "markdown" | "json";
      limit: number;
    }
  | { command: "skill"; action: "info"; kind: null }
  | { command: "skill"; action: "print"; kind: SaltSkillKind };

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
  if (
    command !== "info" &&
    command !== "docs" &&
    command !== "context" &&
    command !== "skill"
  ) {
    throw new SaltCliUsageError(
      `Unknown command: ${command}. Run \`salt-ds help\` for usage.`,
    );
  }

  if (command === "docs") return parseDocsArguments(arguments_);
  if (command === "context") return parseContextArguments(arguments_);
  if (command === "skill") return parseSkillArguments(arguments_);

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

function parseSkillArguments(arguments_: readonly string[]): ParsedCliCommand {
  const [action, ...options] = arguments_;
  if (action === "info") {
    if (options.length !== 1 || options[0] !== "--json") {
      throw new SaltCliUsageError(
        "skill info requires exactly one --json option.",
      );
    }
    return { command: "skill", action: "info", kind: null };
  }
  if (action === "print") {
    if (
      options.length !== 2 ||
      options[0] !== "--kind" ||
      (options[1] !== "skill" && options[1] !== "agents")
    ) {
      throw new SaltCliUsageError(
        "skill print requires --kind skill or --kind agents.",
      );
    }
    return { command: "skill", action: "print", kind: options[1] };
  }
  throw new SaltCliUsageError("skill requires the info or print subcommand.");
}

function parseRetrievalFormat(
  command: "docs" | "context",
  argument: string | undefined,
): "markdown" | "json" {
  if (argument !== "markdown" && argument !== "json") {
    throw new SaltCliUsageError(
      command + " requires --format markdown or --format json.",
    );
  }
  return argument;
}

function parseDocsArguments(arguments_: readonly string[]): ParsedCliCommand {
  let identifier: string | null = null;
  let format: "markdown" | "json" | null = null;
  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index];
    if (argument === "--format") {
      if (format !== null) {
        throw new SaltCliUsageError("docs accepts --format once.");
      }
      format = parseRetrievalFormat("docs", arguments_[index + 1]);
      index += 1;
      continue;
    }
    if (argument.startsWith("-")) {
      throw new SaltCliUsageError("Unknown docs option: " + argument + ".");
    }
    if (identifier !== null) {
      throw new SaltCliUsageError(
        "docs accepts exactly one record ID or name.",
      );
    }
    if (argument.includes("\0")) {
      throw new SaltCliUsageError(
        "The docs identifier contains an invalid byte.",
      );
    }
    identifier = argument;
  }
  if (identifier === null || format === null) {
    throw new SaltCliUsageError(
      "docs requires one record ID or name and exactly one --format option.",
    );
  }
  return { command: "docs", identifier, format };
}

function parseContextArguments(
  arguments_: readonly string[],
): ParsedCliCommand {
  let query: string | null = null;
  let format: "markdown" | "json" | null = null;
  let limit: number | null = null;
  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index];
    if (argument === "--format") {
      if (format !== null) {
        throw new SaltCliUsageError("context accepts --format once.");
      }
      format = parseRetrievalFormat("context", arguments_[index + 1]);
      index += 1;
      continue;
    }
    if (argument === "--limit") {
      if (limit !== null) {
        throw new SaltCliUsageError("context accepts --limit once.");
      }
      const value = arguments_[index + 1];
      if (!value || !/^[1-9][0-9]*$/u.test(value)) {
        throw new SaltCliUsageError(
          "context requires an integer --limit from 1 to 100.",
        );
      }
      limit = Number(value);
      if (limit > 100) {
        throw new SaltCliUsageError(
          "context requires an integer --limit from 1 to 100.",
        );
      }
      index += 1;
      continue;
    }
    if (argument.startsWith("-")) {
      throw new SaltCliUsageError("Unknown context option: " + argument + ".");
    }
    if (query !== null) {
      throw new SaltCliUsageError("context accepts exactly one query.");
    }
    if (argument.includes("\0")) {
      throw new SaltCliUsageError(
        "The context query contains an invalid byte.",
      );
    }
    query = argument;
  }
  if (query === null || format === null || limit === null) {
    throw new SaltCliUsageError(
      "context requires one query, exactly one --format, and exactly one --limit.",
    );
  }
  return { command: "context", query, format, limit };
}

export async function runCliWithIo(
  argv: readonly string[],
  io: SaltCliIo,
): Promise<number> {
  const parsed = parseCliArgs(argv);
  if (parsed.command === "help") {
    await io.stdout(SALT_CLI_HELP);
    return 0;
  }
  if (parsed.command === "version") {
    await io.stdout(`${packageManifest.version}\n`);
    return 0;
  }
  if (parsed.command === "docs") {
    const result = await runDocsCommand({
      rootDir: io.cwd(),
      identifier: parsed.identifier,
      format: parsed.format,
    });
    await io.stdout(result.output);
    return result.exitCode;
  }
  if (parsed.command === "context") {
    const result = await runContextCommand({
      rootDir: io.cwd(),
      query: parsed.query,
      format: parsed.format,
      limit: parsed.limit,
    });
    await io.stdout(result.output);
    return result.exitCode;
  }
  if (parsed.command === "skill") {
    await io.stdout(
      await runSkillCommand({
        action: parsed.action,
        ...(parsed.kind ? { kind: parsed.kind } : {}),
      }),
    );
    return 0;
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
        "The project root is invalid or unavailable.",
      );
    }
    throw error;
  }
  await io.stdout(`${JSON.stringify(result)}\n`);
  return 0;
}

function writeStandardOutput(value: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const onError = (error: Error) => {
      process.stdout.off("error", onError);
      reject(error);
    };
    process.stdout.once("error", onError);
    process.stdout.write(value, () => {
      process.stdout.off("error", onError);
      resolve();
    });
  });
}

export async function runCli(
  argv: string[] = process.argv.slice(2),
): Promise<number> {
  return runCliWithIo(argv, {
    cwd: () => process.cwd(),
    stdout: writeStandardOutput,
  });
}
