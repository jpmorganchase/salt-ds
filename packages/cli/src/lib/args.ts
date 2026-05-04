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
  "  salt-ds init [rootDir] [--ai] [--json] [--output <path>] [--registry-dir <path>] [--project <name>] [--create-stack] [--conventions-pack [<package[#export]>]] [--host-adapters <vscode>] [--add-ui-verify]",
  "  salt-ds info [rootDir] [--json] [--output <path>] [--registry-dir <path>] [--catalog-query <prompt>] [--entity <name>] [--family <category>]",
  "  salt-ds create <query> [--json] [--json-file <path>] [--output <path>] [--registry-dir <path>] [--type <auto|component|pattern|composition|foundation|token>] [--package <name>] [--status <stable|beta|lab|deprecated>] [--resolved-entity <name>] [--full] [--starter-only]",
  "  salt-ds review [target ...] [--url <url>] [--create-report <path>] [--migration-report <path>] [--report <path>] [--validate <report.json>] [--resume <report.json>] [--json] [--json-file <path>] [--output <path>] [--registry-dir <path>] [--timeout <ms>] [--mode <auto|browser|fetched-html>] [--output-dir <path>] [--no-screenshot] [--full]",
  "  salt-ds migrate [query] [--source-outline <path>] [--mockup <path-or-url>] [--screenshot <path-or-url>] [--url <url>] [--review-report <path>] [--report <path>] [--json] [--json-file <path>] [--output <path>] [--registry-dir <path>] [--include-starter-code] [--timeout <ms>] [--mode <auto|browser|fetched-html>] [--output-dir <path>] [--no-screenshot] [--full]",
  "  salt-ds upgrade [--package <name>] [--component <name>] [--from-version <version>] [--to-version <version>] [--include-deprecations] [--review-report <path>] [--report <path>] [--json] [--json-file <path>] [--output <path>] [--registry-dir <path>] [--full]",
  "  salt-ds get_salt_entity <name> [--json] [--output <path>] [--registry-dir <path>] [--entity-type <type>] [--include <section[,section]>] [--include-starter-code] [--view <compact|full>]",
  "  salt-ds get_salt_examples <target> [--json] [--output <path>] [--registry-dir <path>] [--target-type <component|pattern>] [--query <scenario>] [--include-code] [--include-starter-code] [--view <compact|full>]",
  "  salt-ds discover_salt [query] [--json] [--output <path>] [--registry-dir <path>] [--area <area>] [--package <name>] [--status <stable|beta|lab|deprecated>] [--view <compact|full>]",
  "",
  "Support commands:",
  "  salt-ds export-context [rootDir] [--component <name-or-id>] [--package <name>] [--json] [--output <path>] [--output-dir <path>] [--manifest [<path>]] [--coverage] [--check] [--release-gate <artifact.json|manifest.json|dir>] [--registry-dir <path>]",
  "  salt-ds doctor [rootDir] [--ai] [--json] [--output <path>] [--registry-dir <path>] [--bundle|--bundle-dir <path>] [--storybook-url <url>] [--app-url <url>] [--check-detected-targets] [--timeout <ms>]",
  "  salt-ds runtime inspect <url> [--json] [--output <path>] [--output-dir <path>] [--timeout <ms>] [--mode <auto|browser|fetched-html>] [--no-screenshot]",
  "",
  "Notes:",
  "  Canonical Salt grounding happens inside the workflow commands and MCP tools.",
  "  Create compact JSON is a workflow contract only; starter code requires --full --include-starter-code or --starter-only.",
  "  There is no second manual semantic command surface to learn.",
  "  Advanced validation commands may still exist for maintainers, but they are not part of the main product story.",
];

const COMMAND_HELP: Record<string, string[]> = {
  create: [
    "Salt DS CLI - create",
    "",
    "Usage:",
    "  salt-ds create <query> [--json] [--resolved-entity <name>] [--registry-dir <path>]",
    "  salt-ds create <query> --json --full --include-starter-code",
    "  salt-ds create <query> --json --starter-only [--include-starter-code]",
    "",
    "Purpose:",
    "  Ground new Salt UI work in canonical docs and registry evidence before implementation.",
    "",
    "Starter code:",
    "  Compact JSON is a workflow contract only and does not include starter code.",
    "  Use --full --include-starter-code for additive starter snippets in the full workflow envelope.",
    "  Use --starter-only for a minimal starter-code payload after the exact entity is known.",
    "",
    "JSON statuses:",
    "  success: action.kind is implement and evidence.status is complete; implement the exact request, then run the returned review post action.",
    "  partial: do not implement yet; complete next_required_action, rerun this create request, and wait for success+implement.",
    "  blocked: stop and complete next_required_action, usually ask_user, install_dependencies, or fix_context; rerun this create request before editing.",
    "  failed: the workflow could not return usable Salt guidance.",
    "",
    "Common follow-ups:",
    "  salt-ds get_salt_entity <entity-name> --json",
    '  salt-ds create "<task>" --resolved-entity <entity-name> --json',
    "  salt-ds get_salt_examples <entity-name> --target-type <component|pattern> --json",
    "  salt-ds review <changed-path> --json",
  ],
  migrate: [
    "Salt DS CLI - migrate",
    "",
    "Usage:",
    "  salt-ds migrate [query] [--source-outline <path>] [--mockup <path-or-url>] [--screenshot <path-or-url>] [--review-report <path>] [--report <path>] [--json] [--full]",
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
    "  partial: complete the returned next_required_action, rerun this migration request, and wait for success before editing.",
    "  blocked: stop and answer the returned question, fix context, or run the requested review before editing.",
    "  failed: the migration input could not produce usable Salt guidance.",
    "",
    "Common follow-ups:",
    '  salt-ds migrate "<task>" --source-outline .salt/tmp/outline.json --json',
    '  salt-ds migrate "<task>" --review-report .salt/reports/post-migration-review.json --report .salt/reports/migration-followup.json --json',
    "  salt-ds review <changed-path> --json",
  ],
  review: [
    "Salt DS CLI - review",
    "",
    "Usage:",
    "  salt-ds review [target ...] [--url <url>] [--create-report <path>] [--migration-report <path>] [--report <path>] [--validate <report.json>] [--resume <report.json>] [--json] [--full]",
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
    "  salt-ds review --validate .salt/reports/review.json --json",
    "  salt-ds review --resume .salt/reports/review.json --json",
  ],
  "export-context": [
    "Salt DS CLI - export-context",
    "",
    "Usage:",
    "  salt-ds export-context [rootDir] [--component <name-or-id>] [--json] [--output <path>] [--output-dir <path>] [--manifest [<path>]] [--coverage] [--check] [--release-gate <artifact.json|manifest.json|dir>] [--registry-dir <path>]",
    "",
    "Purpose:",
    "  Emit schema-shaped static component context from semantic-core registry evidence.",
    "",
    "JSON statuses:",
    "  validated: every emitted context claim resolves through the shared generated-artifact surface gate.",
    "  unsupported: context was emitted, but missing evidence or registry validation gaps were recorded.",
    "  current: --check found the existing output current and source-backed.",
    "  stale: --check found durable context fields that differ from the registry rebuild.",
    "  passed: --release-gate found generated artifacts whose claims all resolve to EvidenceRefs.",
    "  blocked: --release-gate found unsupported, invalid, stale, or coverage-gap generated claims.",
    "",
    "Common follow-ups:",
    "  salt-ds export-context --component <name-or-id> --json",
    "  salt-ds export-context . --component <name-or-id> --json --output .salt/context/component.json --manifest",
    "  salt-ds export-context . --manifest --output-dir .salt/context/components --json",
    "  salt-ds export-context . --coverage --json",
    "  salt-ds export-context . --component <name-or-id> --output .salt/context/component.json --check --json",
    "  salt-ds export-context . --release-gate .salt/context/components/workflow-prompts.prompt.json --json",
    "  salt-ds export-context . --release-gate .salt/context/manifest.json --json",
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
