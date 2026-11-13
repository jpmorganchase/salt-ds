#!/usr/bin/env node
import { AgentDocsError, generateAgentDocs } from "./generate.mjs";

const USAGE = `Usage: node tooling/agent-docs/src/cli.mjs [--check] [--verbose]

Generates packages/<name>/docs from site/docs for coding agents.

  --check    Validate generation without writing any files.
  --verbose  List every warning and authoring suggestion.`;

// `yarn build:agent-docs -- --check` passes a literal `--` through.
const options = process.argv.slice(2).filter((option) => option !== "--");
const known = new Set(["--check", "--verbose", "--help"]);
const unknown = options.find((option) => !known.has(option));
if (unknown || options.includes("--help")) {
  if (unknown) console.error(`Unknown option: ${unknown}\n`);
  console.log(USAGE);
  process.exit(unknown ? 2 : 0);
}

const check = options.includes("--check");
const verbose = options.includes("--verbose");

try {
  const result = await generateAgentDocs({ write: !check });
  for (const [packageName, { files, bytes }] of result.packages) {
    console.log(
      `${check ? "Checked" : "Wrote"} ${packageName}/docs: ${files} files, ${Math.round(bytes / 1024)} KB`,
    );
  }
  console.log(
    `AGENTS.md block indexing every package: ${(result.agentsBlockBytes / 1024).toFixed(1)} KB`,
  );
  if (result.warnings.length > 0) {
    console.log(
      `${result.warnings.length} warning(s)${verbose ? ":" : ". Run with --verbose to list them."}`,
    );
    if (verbose) {
      for (const warning of result.warnings) console.log(`- ${warning}`);
    }
  }
  if (result.notes.length > 0) {
    console.log(
      `${result.notes.length} authoring suggestion(s)${verbose ? ":" : ". Run with --verbose to list them."}`,
    );
    if (verbose) {
      for (const note of result.notes) console.log(`- ${note}`);
    }
  }
} catch (error) {
  if (error instanceof AgentDocsError) {
    console.error(error.message);
    process.exit(1);
  }
  throw error;
}
