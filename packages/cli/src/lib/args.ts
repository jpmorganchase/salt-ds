import type { ParsedArgs } from "../types.js";

export function parseArgs(argv: string[]): ParsedArgs {
  const positionals: string[] = [];
  const flags: Record<string, string> = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      positionals.push(token);
      continue;
    }

    const key = token.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      flags[key] = flags[key] ? `${flags[key]}\ntrue` : "true";
      continue;
    }

    flags[key] = flags[key] ? `${flags[key]}\n${next}` : next;
    index += 1;
  }

  const [command = "help", ...commandPositionals] = positionals;
  return { command, positionals: commandPositionals, flags };
}

export function printHelp(writeStdout: (message: string) => void): number {
  writeStdout(
    [
      "Salt DS CLI",
      "",
      "Workflow commands:",
      "  salt-ds init [rootDir] [--json] [--output <path>] [--registry-dir <path>] [--project <name>] [--create-stack] [--conventions-pack [<package[#export]>]] [--host-adapters <vscode>] [--add-ui-verify]",
      "  salt-ds info [rootDir] [--json] [--output <path>] [--registry-dir <path>]",
      "  salt-ds create <query> [--json] [--output <path>] [--registry-dir <path>] [--include-starter-code] [--type <auto|component|pattern|composition|foundation|token>] [--package <name>] [--status <stable|beta|lab|deprecated>] [--full]",
      "  salt-ds review [target ...] [--url <url>] [--create-report <path>] [--migration-report <path>] [--json] [--output <path>] [--registry-dir <path>] [--timeout <ms>] [--mode <auto|browser|fetched-html>] [--output-dir <path>] [--no-screenshot]",
      "  salt-ds migrate [query] [--source-outline <path>] [--mockup <path-or-url>] [--screenshot <path-or-url>] [--url <url>] [--json] [--output <path>] [--registry-dir <path>] [--include-starter-code] [--timeout <ms>] [--mode <auto|browser|fetched-html>] [--output-dir <path>] [--no-screenshot]",
      "  salt-ds upgrade [--package <name>] [--component <name>] [--from-version <version>] [--to-version <version>] [--include-deprecations] [--json] [--output <path>] [--registry-dir <path>]",
      "",
      "Support commands:",
      "  salt-ds doctor [rootDir] [--json] [--output <path>] [--bundle|--bundle-dir <path>] [--storybook-url <url>] [--app-url <url>] [--check-detected-targets] [--timeout <ms>]",
      "  salt-ds runtime inspect <url> [--json] [--output <path>] [--output-dir <path>] [--timeout <ms>] [--mode <auto|browser|fetched-html>] [--no-screenshot]",
      "",
      "Notes:",
      "  Canonical Salt grounding happens inside the workflow commands and MCP tools.",
      "  There is no second manual semantic command surface to learn.",
      "  Advanced validation commands may still exist for maintainers, but they are not part of the main product story.",
    ].join("\n"),
  );
  return 0;
}

export function parsePositiveInteger(
  rawValue: string | undefined,
): number | undefined {
  if (!rawValue) {
    return undefined;
  }

  const value = Number(rawValue);
  return Number.isInteger(value) && value > 0 ? value : undefined;
}

export function readRepeatableFlagValues(
  rawValue: string | undefined,
): string[] {
  if (!rawValue) {
    return [];
  }

  return rawValue
    .split("\n")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0 && entry !== "true");
}
