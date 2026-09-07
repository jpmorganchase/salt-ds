import path from "node:path";
import { KnowledgeContextInputError } from "@salt-ds/knowledge";
import packageManifest from "../package.json";
import { runContextCommand } from "./commands/context.js";
import { runDocsCommand } from "./commands/docs.js";
import {
  type DoctorFailOn,
  type DoctorFormat,
  runDoctorCommand,
} from "./commands/doctor.js";
import { runInfoCommand } from "./commands/info.js";
import { runSkillCommand, type SaltSkillKind } from "./commands/skill.js";

export const SALT_CLI_HELP = `Salt Design System CLI

Usage:
  salt-ds help
  salt-ds version
  salt-ds -h
  salt-ds --help
  salt-ds --version
  salt-ds info [--root <repo>] [--project <relative-workspace>] --json
  salt-ds docs <record-id-or-name> [--root <repo>] [--project <relative-workspace>] --format markdown|json
  salt-ds context <query> [--root <repo>] [--project <relative-workspace>] --format markdown|json --limit <n>
  salt-ds doctor [root] --format json|prompt --fail-on error|warning|never
  salt-ds skill info --json
  salt-ds skill print --kind skill|agents

Commands:
  help       Show this help text.
  version    Print the installed CLI version.
  info       Inspect the selected Salt application's package vector and Knowledge identity.
  docs       Read one exact, compatible Knowledge record for the selected application.
  context    Retrieve a bounded, cited Knowledge slice for the selected application.
  doctor     Analyze an exact-version Salt project with read-only evidence.
  skill      Inspect or print the verified bundled Skill artifacts.

For info, docs, and context, --root defaults to the current directory and
--project defaults to . within it. Child applications are never selected automatically.

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
  | {
      command: "info";
      rootDir: string | null;
      project: string;
      format: "json";
    }
  | {
      command: "docs";
      rootDir: string | null;
      project: string;
      identifier: string;
      format: "markdown" | "json";
    }
  | {
      command: "context";
      rootDir: string | null;
      project: string;
      query: string;
      format: "markdown" | "json";
      limit: number;
    }
  | {
      command: "doctor";
      rootDir: string | null;
      format: DoctorFormat;
      failOn: DoctorFailOn;
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

interface ProjectSelectionArguments {
  rootDir: string | null;
  project: string;
  rootSpecified: boolean;
  projectSpecified: boolean;
}

function createProjectSelectionArguments(): ProjectSelectionArguments {
  return {
    rootDir: null,
    project: ".",
    rootSpecified: false,
    projectSpecified: false,
  };
}

function isProjectPathAbsolute(value: string): boolean {
  return (
    path.isAbsolute(value) ||
    path.win32.isAbsolute(value) ||
    path.posix.isAbsolute(value) ||
    /^[A-Za-z]:/u.test(value)
  );
}

function hasProjectTraversal(value: string): boolean {
  return value.split(/[\\\\/]+/u).includes("..");
}

function parseProjectSelectionOption(
  arguments_: readonly string[],
  index: number,
  selection: ProjectSelectionArguments,
): boolean {
  const argument = arguments_[index];
  if (argument !== "--root" && argument !== "--project") return false;

  const value = arguments_[index + 1];
  if (value === undefined || value === "" || value.startsWith("--")) {
    throw new SaltCliUsageError(
      argument === "--root"
        ? "--root requires a non-empty project root."
        : "--project requires a non-empty relative workspace.",
    );
  }
  if (value.includes("\0")) {
    throw new SaltCliUsageError(
      argument === "--root"
        ? "The project root contains an invalid byte."
        : "The project workspace contains an invalid byte.",
    );
  }

  if (argument === "--root") {
    if (selection.rootSpecified) {
      throw new SaltCliUsageError(
        "info, docs, and context accept --root once.",
      );
    }
    selection.rootDir = value;
    selection.rootSpecified = true;
    return true;
  }

  if (selection.projectSpecified) {
    throw new SaltCliUsageError(
      "info, docs, and context accept --project once.",
    );
  }
  if (isProjectPathAbsolute(value) || hasProjectTraversal(value)) {
    throw new SaltCliUsageError(
      "--project requires a relative workspace contained by --root.",
    );
  }
  selection.project = value;
  selection.projectSpecified = true;
  return true;
}

function resolveProjectRoot(rootDir: string | null, cwd: string): string {
  return rootDir === null ? cwd : path.resolve(cwd, rootDir);
}

function isProjectRootInspectionError(error: unknown): boolean {
  return (
    !!error &&
    typeof error === "object" &&
    "code" in error &&
    (error.code === "SALT_PROJECT_ROOT_NOT_DIRECTORY" ||
      error.code === "SALT_PROJECT_ROOT_UNAVAILABLE")
  );
}

function mapProjectRootInspectionError(error: unknown): never {
  if (isProjectRootInspectionError(error)) {
    throw new SaltCliUsageError("The project root is invalid or unavailable.");
  }
  throw error;
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
    command !== "doctor" &&
    command !== "skill"
  ) {
    throw new SaltCliUsageError(
      `Unknown command: ${command}. Run \`salt-ds help\` for usage.`,
    );
  }

  if (command === "docs") return parseDocsArguments(arguments_);
  if (command === "context") return parseContextArguments(arguments_);
  if (command === "doctor") return parseDoctorArguments(arguments_);
  if (command === "skill") return parseSkillArguments(arguments_);

  const selection = createProjectSelectionArguments();
  let jsonCount = 0;
  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index];
    if (parseProjectSelectionOption(arguments_, index, selection)) {
      index += 1;
      continue;
    }
    if (argument === "--json") {
      jsonCount += 1;
      continue;
    }
    if (argument.startsWith("-")) {
      throw new SaltCliUsageError(`Unknown info option: ${argument}.`);
    }
    throw new SaltCliUsageError("info accepts no positional arguments.");
  }
  if (jsonCount !== 1) {
    throw new SaltCliUsageError("info requires exactly one --json option.");
  }
  return {
    command: "info",
    rootDir: selection.rootDir,
    project: selection.project,
    format: "json",
  };
}

function parseDoctorArguments(arguments_: readonly string[]): ParsedCliCommand {
  let rootDir: string | null = null;
  let format: DoctorFormat | null = null;
  let failOn: DoctorFailOn | null = null;
  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index];
    if (argument === "--format") {
      if (format !== null) {
        throw new SaltCliUsageError("doctor accepts --format once.");
      }
      const value = arguments_[index + 1];
      if (value !== "json" && value !== "prompt") {
        throw new SaltCliUsageError(
          "doctor requires --format json or --format prompt.",
        );
      }
      format = value;
      index += 1;
      continue;
    }
    if (argument === "--fail-on") {
      if (failOn !== null) {
        throw new SaltCliUsageError("doctor accepts --fail-on once.");
      }
      const value = arguments_[index + 1];
      if (value !== "error" && value !== "warning" && value !== "never") {
        throw new SaltCliUsageError(
          "doctor requires --fail-on error, warning, or never.",
        );
      }
      failOn = value;
      index += 1;
      continue;
    }
    if (argument.startsWith("-")) {
      throw new SaltCliUsageError("Unknown doctor option: " + argument + ".");
    }
    if (rootDir !== null) {
      throw new SaltCliUsageError("doctor accepts at most one project root.");
    }
    if (argument.includes("\0")) {
      throw new SaltCliUsageError("The project root contains an invalid byte.");
    }
    rootDir = argument;
  }
  if (format === null || failOn === null) {
    throw new SaltCliUsageError(
      "doctor requires exactly one --format and exactly one --fail-on.",
    );
  }
  return { command: "doctor", rootDir, format, failOn };
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
  const selection = createProjectSelectionArguments();
  let identifier: string | null = null;
  let format: "markdown" | "json" | null = null;
  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index];
    if (parseProjectSelectionOption(arguments_, index, selection)) {
      index += 1;
      continue;
    }
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
  return {
    command: "docs",
    rootDir: selection.rootDir,
    project: selection.project,
    identifier,
    format,
  };
}

function parseContextArguments(
  arguments_: readonly string[],
): ParsedCliCommand {
  const selection = createProjectSelectionArguments();
  let query: string | null = null;
  let format: "markdown" | "json" | null = null;
  let limit: number | null = null;
  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index];
    if (parseProjectSelectionOption(arguments_, index, selection)) {
      index += 1;
      continue;
    }
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
  return {
    command: "context",
    rootDir: selection.rootDir,
    project: selection.project,
    query,
    format,
    limit,
  };
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
    let result: Awaited<ReturnType<typeof runDocsCommand>>;
    try {
      result = await runDocsCommand({
        rootDir: resolveProjectRoot(parsed.rootDir, io.cwd()),
        project: parsed.project,
        identifier: parsed.identifier,
        format: parsed.format,
      });
    } catch (error) {
      mapProjectRootInspectionError(error);
    }
    await io.stdout(result.output);
    return result.exitCode;
  }
  if (parsed.command === "context") {
    let result: Awaited<ReturnType<typeof runContextCommand>>;
    try {
      result = await runContextCommand({
        rootDir: resolveProjectRoot(parsed.rootDir, io.cwd()),
        project: parsed.project,
        query: parsed.query,
        format: parsed.format,
        limit: parsed.limit,
      });
    } catch (error) {
      if (error instanceof KnowledgeContextInputError) {
        throw new SaltCliUsageError(
          "Context input cannot fit the 16 KiB output budget. Use a shorter query.",
        );
      }
      mapProjectRootInspectionError(error);
    }
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
  if (parsed.command === "doctor") {
    try {
      const result = await runDoctorCommand({
        rootDir: parsed.rootDir ?? io.cwd(),
        cliVersion: packageManifest.version,
        format: parsed.format,
        failOn: parsed.failOn,
      });
      await io.stdout(result.output);
      return result.exitCode;
    } catch (error) {
      mapProjectRootInspectionError(error);
    }
  }
  let result: Awaited<ReturnType<typeof runInfoCommand>>;
  try {
    result = await runInfoCommand({
      rootDir: resolveProjectRoot(parsed.rootDir, io.cwd()),
      project: parsed.project,
      cliVersion: packageManifest.version,
    });
  } catch (error) {
    mapProjectRootInspectionError(error);
  }
  await io.stdout(`${JSON.stringify(result)}\n`);
  return 0;
}

function writeStandardOutput(value: string): Promise<void> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const settle = (error?: Error | null) => {
      if (settled) return;
      settled = true;
      if (error) reject(error);
      else resolve();
    };
    const onError = (error: Error) => {
      process.stdout.off("error", onError);
      settle(error);
    };
    process.stdout.once("error", onError);
    process.stdout.write(value, (error) => {
      if (error) {
        settle(error);
        setImmediate(() => process.stdout.off("error", onError));
        return;
      }
      process.stdout.off("error", onError);
      settle();
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
