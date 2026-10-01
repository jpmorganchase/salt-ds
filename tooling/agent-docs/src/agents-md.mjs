#!/usr/bin/env node
// Points coding agents at the Salt docs installed with @salt-ds/core.
//
//   node node_modules/@salt-ds/core/docs/agents-md.mjs [--dir <path>] [--check] [--no-claude]
//
// Adds or updates the Salt block in AGENTS.md and makes CLAUDE.md import
// AGENTS.md. Content outside the block is kept. With --check, changes nothing
// and exits with 1 if either file needs updating.
import { existsSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const BEGIN_MARKER = "<!-- BEGIN:salt-ds-agent-docs -->";
export const END_MARKER = "<!-- END:salt-ds-agent-docs -->";
const CLAUDE_IMPORT = "@AGENTS.md";
const USAGE = `Usage: node node_modules/@salt-ds/core/docs/agents-md.mjs [options]

Adds or updates the Salt block in AGENTS.md and makes CLAUDE.md import AGENTS.md.

Options:
  --dir <path>  Folder that holds AGENTS.md (default: current folder)
  --check       Change nothing; exit with 1 if either file needs updating
  --no-claude   Leave CLAUDE.md alone
  --help        Show this help`;

export function agentsBlock(indexPath) {
  return [
    BEGIN_MARKER,
    "",
    "## Salt Design System",
    "",
    `This project uses the Salt Design System (\`@salt-ds/*\` packages). Salt's APIs may differ from your training data. Before writing or changing UI that uses Salt, read \`${indexPath}\` (relative to this file) and the pages it links to; they match the installed package versions.`,
    "",
    END_MARKER,
  ].join("\n");
}

/** Replaces the Salt block in `content`, or appends it. */
export function upsertBlock(content, block) {
  const eol = content.includes("\r\n") ? "\r\n" : "\n";
  const normalized = block.replace(/\n/g, eol);
  const start = content.indexOf(BEGIN_MARKER);
  const end = start === -1 ? -1 : content.indexOf(END_MARKER, start);
  if (start !== -1 && end !== -1) {
    return (
      content.slice(0, start) +
      normalized +
      content.slice(end + END_MARKER.length)
    );
  }
  // Replacing from a lone marker could delete the user's own instructions.
  if (start !== -1 || content.includes(END_MARKER)) {
    throw new Error(
      `Found an incomplete Salt block. Restore both ${BEGIN_MARKER} and ${END_MARKER}, or remove them, then run again.`,
    );
  }
  if (content.trim() === "") return `${normalized}${eol}`;
  return `${content.trimEnd()}${eol}${eol}${normalized}${eol}`;
}

/** Adds the AGENTS.md import to CLAUDE.md content when it is missing. */
export function withClaudeImport(content) {
  if (content.split(/\r?\n/).some((line) => line.trim() === CLAUDE_IMPORT)) {
    return content;
  }
  const eol = content.includes("\r\n") ? "\r\n" : "\n";
  if (content.trim() === "") return `${CLAUDE_IMPORT}${eol}`;
  return `${content.trimEnd()}${eol}${eol}${CLAUDE_IMPORT}${eol}`;
}

function toPosix(value) {
  return value.split(path.sep).join("/");
}

/**
 * The docs index path to write, relative to `dir`. Uses the path this script
 * was run from rather than its real path, so package-manager stores such as
 * pnpm's never appear in AGENTS.md.
 */
export function indexPathFor(dir, scriptPath) {
  const candidates = [];
  if (scriptPath) {
    candidates.push(
      path.join(path.dirname(path.resolve(scriptPath)), "index.md"),
    );
  }
  for (let current = path.resolve(dir); ; current = path.dirname(current)) {
    candidates.push(
      path.join(
        current,
        "node_modules",
        "@salt-ds",
        "core",
        "docs",
        "index.md",
      ),
    );
    if (path.dirname(current) === current) break;
  }
  const found = candidates.find((candidate) => existsSync(candidate));
  return found
    ? toPosix(path.relative(path.resolve(dir), found))
    : "node_modules/@salt-ds/core/docs/index.md";
}

function parseArguments(args) {
  const options = {
    dir: process.cwd(),
    check: false,
    claude: true,
    help: false,
  };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--check") options.check = true;
    else if (arg === "--no-claude") options.claude = false;
    else if (arg === "--help" || arg === "-h") options.help = true;
    else if (arg === "--dir" && args[index + 1]) options.dir = args[++index];
    else if (arg.startsWith("--dir=")) options.dir = arg.slice("--dir=".length);
    else throw new Error(`Unknown argument: ${arg}\n\n${USAGE}`);
  }
  return options;
}

function sameFile(left, right) {
  try {
    return realpathSync(left) === realpathSync(right);
  } catch {
    return false;
  }
}

export function run(args, { scriptPath, log = console.log } = {}) {
  const options = parseArguments(args);
  if (options.help) {
    log(USAGE);
    return 0;
  }
  const dir = path.resolve(options.dir);
  const block = agentsBlock(indexPathFor(dir, scriptPath));
  const updates = [
    { file: "AGENTS.md", update: (content) => upsertBlock(content, block) },
  ];
  if (options.claude) {
    updates.push({ file: "CLAUDE.md", update: withClaudeImport });
  }

  const stale = [];
  for (const { file, update } of updates) {
    const filePath = path.join(dir, file);
    // A CLAUDE.md that links to AGENTS.md already has the block.
    if (
      file === "CLAUDE.md" &&
      sameFile(filePath, path.join(dir, "AGENTS.md"))
    ) {
      log("CLAUDE.md is the same file as AGENTS.md.");
      continue;
    }
    const current = existsSync(filePath) ? readFileSync(filePath, "utf8") : "";
    let next;
    try {
      next = update(current);
    } catch (error) {
      throw new Error(`${file}: ${error.message}`);
    }
    if (next === current) {
      log(`${file} is up to date.`);
      continue;
    }
    stale.push(file);
    if (options.check) {
      log(`${file} needs updating.`);
    } else {
      writeFileSync(filePath, next);
      log(`${current === "" ? "Created" : "Updated"} ${file}.`);
    }
  }
  if (options.check && stale.length > 0) {
    log(
      "Run node node_modules/@salt-ds/core/docs/agents-md.mjs to update them.",
    );
    return 1;
  }
  return 0;
}

function isInvokedDirectly() {
  try {
    return (
      realpathSync(path.resolve(process.argv[1])) ===
      realpathSync(fileURLToPath(import.meta.url))
    );
  } catch {
    return false;
  }
}

if (isInvokedDirectly()) {
  try {
    process.exitCode = run(process.argv.slice(2), {
      scriptPath: process.argv[1],
    });
  } catch (error) {
    console.error(error.message);
    process.exitCode = 2;
  }
}
