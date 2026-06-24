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
  "Setup commands:",
  "  salt-ds init [rootDir] [--ai] [--json] [--output <path>] [--registry-dir <path>] [--project <name>] [--create-stack] [--conventions-pack [<package[#export]>]] [--host-adapters <vscode>] [--add-ui-verify] [--add-agent-hooks]",
  "  salt-ds info [rootDir] [--json] [--output <path>] [--registry-dir <path>] [--catalog-query <prompt>] [--entity <name>] [--family <category>] [--hook]",
  "",
  "Agent-hook commands:",
  "  salt-ds hook [--emit-attestation]                          Read VS Code / Claude Code / Copilot CLI agent-hook JSON on stdin (PostToolUse, PreToolUse). With --emit-attestation, emits a SaltAttestationV1 NDJSON line on stdout after a clean PostToolUse review. Wire stdout to whatever audit store you operate.",
  "  salt-ds verify [path]                                       Read SaltAttestationV1 NDJSON on stdin (or from the given file), re-hash recorded files, exit non-zero on drift.",
  "",
  "Support commands:",
  "  salt-ds export-context [rootDir] [--component <name-or-id>] [--package <name>] [--json] [--output <path>] [--output-dir <path>] [--manifest [<path>]] [--coverage] [--gap-catalog] [--format <json|markdown>] [--check] [--release-gate <artifact.json|manifest.json|dir>] [--registry-dir <path>]",
  "  salt-ds doctor [rootDir] [--ai] [--json] [--output <path>] [--registry-dir <path>] [--bundle|--bundle-dir <path>] [--storybook-url <url>] [--app-url <url>] [--check-detected-targets] [--timeout <ms>] [--check-install]",
  "  salt-ds runtime inspect <url> [--json] [--output <path>] [--output-dir <path>] [--timeout <ms>] [--mode <auto|browser|fetched-html>] [--no-screenshot]",
  "",
  "Workflow commands moved to the @salt-ds/mcp server:",
  "  create_salt_ui, review_salt_ui, migrate_to_salt, upgrade_salt_ui    (use the MCP tools; the CLI subcommands were removed in favour of MCP-only delivery)",
  "",
  "Notes:",
  "  For one-off canonical entity / example / discovery lookups, use the Salt MCP `get_salt_entity`, `get_salt_entities`, `get_salt_examples`, and `discover_salt` tools \u2014 they are not exposed as CLI subcommands.",
  "  All commands accept --prefetch to eagerly load every registry artifact (~24 MB). Default is lazy: only metadata loads at boot and each artifact loads on first touch.",
];

const COMMAND_HELP: Record<string, string[]> = {
  hook: [
    "Salt DS CLI - hook",
    "",
    "Usage:",
    "  salt-ds hook [--emit-attestation]",
    "",
    "Purpose:",
    "  Read VS Code / Claude Code / Copilot CLI agent-hook JSON on stdin (see https://code.visualstudio.com/docs/agent-customization/hooks).",
    "  For PostToolUse, reviews the Salt-affected edited files and exits 2 with findings on stderr when blocking, 0 otherwise.",
    "  For PreToolUse, consults .salt/team.json require_human_review_for and emits permissionDecision: ask/allow.",
    "",
    "Attestation:",
    "  --emit-attestation emits a Zod-typed SaltAttestationV1 NDJSON line on stdout when a PostToolUse review is clean. Pipe stdout to the audit store you already operate (git notes, signed commits, check API, SIEM, plain file). Salt does not pick the disk layout, the hashing algorithm, the retention policy, or the GC story.",
  ],
  verify: [
    "Salt DS CLI - verify",
    "",
    "Usage:",
    "  salt-ds verify [path]",
    "",
    "Purpose:",
    "  Read SaltAttestationV1 NDJSON attestation payloads from stdin (or from the optional path), re-hash recorded files against the current on-disk state, and exit non-zero on drift. Standalone-usable in CI or from an agent Stop hook.",
  ],
  "export-context": [
    "Salt DS CLI - export-context",
    "",
    "Usage:",
    "  salt-ds export-context [rootDir] [--component <name-or-id>] [--json] [--output <path>] [--output-dir <path>] [--manifest [<path>]] [--coverage] [--gap-catalog] [--format <json|markdown>] [--check] [--release-gate <artifact.json|manifest.json|dir>] [--registry-dir <path>]",
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
    "  salt-ds export-context . --gap-catalog --json",
    "  salt-ds export-context . --gap-catalog --format markdown --output .salt/context/gap-catalog.md",
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
