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

const ROOT_HELP = [
  "Salt DS CLI",
  "",
  "Workflow commands:",
  "  salt-ds init [rootDir] [--json] [--output <path>] [--registry-dir <path>] [--project <name>] [--create-stack] [--conventions-pack [<package[#export]>]] [--host-adapters <vscode>] [--add-ui-verify]",
  "  salt-ds info [rootDir] [--json] [--output <path>] [--registry-dir <path>] [--catalog-query <prompt>] [--entity <name>] [--family <category>]",
  "  salt-ds create <query> [--json] [--json-file <path>] [--output <path>] [--registry-dir <path>] [--include-starter-code] [--type <auto|component|pattern|composition|foundation|token>] [--package <name>] [--status <stable|beta|lab|deprecated>] [--starter-only] [--full]",
  "  salt-ds review [target ...] [--url <url>] [--create-report <path>] [--migration-report <path>] [--json] [--json-file <path>] [--output <path>] [--registry-dir <path>] [--timeout <ms>] [--mode <auto|browser|fetched-html>] [--output-dir <path>] [--no-screenshot] [--full]",
  "  salt-ds migrate [query] [--source-outline <path>] [--mockup <path-or-url>] [--screenshot <path-or-url>] [--url <url>] [--json] [--json-file <path>] [--output <path>] [--registry-dir <path>] [--include-starter-code] [--timeout <ms>] [--mode <auto|browser|fetched-html>] [--output-dir <path>] [--no-screenshot] [--full]",
  "  salt-ds upgrade [--package <name>] [--component <name>] [--from-version <version>] [--to-version <version>] [--include-deprecations] [--json] [--json-file <path>] [--output <path>] [--registry-dir <path>] [--full]",
  "  salt-ds get_salt_entity <name> [--json] [--output <path>] [--registry-dir <path>] [--entity-type <type>] [--include <section[,section]>] [--include-starter-code] [--view <compact|full>]",
  "  salt-ds get_salt_examples <target> [--json] [--output <path>] [--registry-dir <path>] [--target-type <component|pattern>] [--query <scenario>] [--include-code] [--include-starter-code] [--view <compact|full>]",
  "  salt-ds discover_salt [query] [--json] [--output <path>] [--registry-dir <path>] [--area <area>] [--package <name>] [--status <stable|beta|lab|deprecated>] [--view <compact|full>]",
  "",
  "Support commands:",
  "  salt-ds doctor [rootDir] [--json] [--output <path>] [--bundle|--bundle-dir <path>] [--storybook-url <url>] [--app-url <url>] [--check-detected-targets] [--timeout <ms>]",
  "  salt-ds runtime inspect <url> [--json] [--output <path>] [--output-dir <path>] [--timeout <ms>] [--mode <auto|browser|fetched-html>] [--no-screenshot]",
  "",
  "Notes:",
  "  Canonical Salt grounding happens inside the workflow commands and MCP tools.",
  "  There is no second manual semantic command surface to learn.",
  "  Advanced validation commands may still exist for maintainers, but they are not part of the main product story.",
];

const COMMAND_HELP: Record<string, string[]> = {
  create: [
    "Salt DS CLI - create",
    "",
    "Usage:",
    "  salt-ds create <query> [--json] [--full] [--include-starter-code] [--registry-dir <path>]",
    "",
    "Purpose:",
    "  Ground new Salt UI work in canonical docs and registry evidence before implementation.",
    "",
    "JSON statuses:",
    "  success: action.kind is implement and evidence.status is complete; implement the exact request, then run the returned review post action.",
    "  partial: do not implement yet; call next_required_action, usually get_salt_entity or get_salt_examples.",
    "  blocked: stop and complete next_required_action, usually ask_user, install_dependencies, or fix_context.",
    "  failed: the workflow could not return usable Salt guidance.",
    "",
    "Common follow-ups:",
    "  salt-ds get_salt_entity Avatar --json",
    "  salt-ds get_salt_examples Avatar --target-type component --json",
    "  salt-ds review <changed-path> --json",
  ],
  migrate: [
    "Salt DS CLI - migrate",
    "",
    "Usage:",
    "  salt-ds migrate [query] [--source-outline <path>] [--mockup <path-or-url>] [--screenshot <path-or-url>] [--json] [--full]",
    "",
    "Purpose:",
    "  Translate existing UI, screenshots, mockups, or structured outlines into a canonical Salt migration plan.",
    "",
    "Evidence inputs:",
    "  --source-outline must be JSON with regions, actions, states, or notes arrays.",
    "  --mockup and --screenshot require SALT_DS_MIGRATE_VISUAL_ADAPTER to normalize visual evidence.",
    "  Compact JSON surfaces source_outline_provided and signal counts under evidence.input_context.",
    "",
    "JSON statuses:",
    "  success: the exact migration request is safe, evidence is complete, and no blocking questions remain.",
    "  partial: continue with the returned next_required_action before editing.",
    "  blocked: stop and answer the returned question, fix context, or run the requested review.",
    "  failed: the migration input could not produce usable Salt guidance.",
    "",
    "Common follow-ups:",
    '  salt-ds migrate "toolbar with save and search" --source-outline .salt/tmp/outline.json --json',
    "  salt-ds review <changed-path> --json",
  ],
  review: [
    "Salt DS CLI - review",
    "",
    "Usage:",
    "  salt-ds review [target ...] [--url <url>] [--create-report <path>] [--migration-report <path>] [--json] [--full]",
    "",
    "Purpose:",
    "  Validate existing Salt source against canonical docs, registry evidence, migration reports, and optional runtime evidence.",
    "",
    "JSON statuses:",
    "  success: clean review; action.kind is complete and outcome is no_changes_required.",
    "  partial: review guidance exists but follow-up evidence or remediation is still needed.",
    "  blocked: fix the returned findings or answer the returned question before calling the work complete.",
    "  failed: the review could not analyze the target.",
    "",
    "Common follow-ups:",
    "  salt-ds review src --json",
    "  salt-ds review src --url http://localhost:6006 --json",
    "  salt-ds review <changed-path> --create-report .salt/reports/create.json --json",
  ],
};

export function printHelp(
  writeStdout: (message: string) => void,
  command?: string,
): number {
  const help = command ? COMMAND_HELP[command] : null;
  writeStdout((help ?? ROOT_HELP).join("\n"));
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
