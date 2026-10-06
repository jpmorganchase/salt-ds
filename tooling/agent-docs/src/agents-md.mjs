#!/usr/bin/env node
// Points coding agents at the Salt docs installed with @salt-ds/core.
//
//   node node_modules/@salt-ds/core/docs/agents-md.mjs [--dir <path>] [--check] [--no-claude]
//
// Adds or updates the Salt block in AGENTS.md and makes CLAUDE.md import
// AGENTS.md. The block holds a compressed index of the docs in every installed
// @salt-ds package, so agents see which pages exist without first deciding to
// look them up. Content outside the block is kept. With --check, changes
// nothing and exits with 1 if either file needs updating, for example after
// upgrading Salt.
import {
  existsSync,
  readdirSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const BEGIN_MARKER = "<!-- BEGIN:salt-ds-agent-docs -->";
export const END_MARKER = "<!-- END:salt-ds-agent-docs -->";
/** Lists the pages in each package's docs folder; written by tooling/agent-docs. */
export const MANIFEST_FILE = "manifest.json";
export const INSTRUCTIONS =
  "This project uses the Salt Design System (`@salt-ds/*` packages), whose APIs may differ from your training data. For any Salt task, prefer retrieval-led reasoning over pre-training-led reasoning: before writing or changing UI that uses Salt, read the relevant pages from the index below. They are generated for the installed package versions. Prefer component props, such as `Text`'s `color`, to custom CSS with `--salt-*` tokens. Before you finish, check that each Salt prop you used is in its component page's props table and not deprecated, and that each `--salt-*` token is listed under characteristic or foundation tokens in `theme/docs/tokens.md`. Index paths are relative to `root`, which is relative to this file. Names in brackets are other names for the same component, and each package's `docs/index.md` summarizes its pages.";
const CLAUDE_IMPORT = "@AGENTS.md";
const USAGE = `Usage: node node_modules/@salt-ds/core/docs/agents-md.mjs [options]

Adds or updates the Salt block, with an index of the installed Salt docs, in
AGENTS.md and makes CLAUDE.md import AGENTS.md.

Options:
  --dir <path>  Folder that holds AGENTS.md (default: current folder)
  --check       Change nothing; exit with 1 if either file needs updating
  --no-claude   Leave CLAUDE.md alone
  --help        Show this help`;

/** The Salt block: instructions plus the compressed docs index. */
export function agentsBlock({ root, lines }) {
  return [
    BEGIN_MARKER,
    "",
    "## Salt Design System",
    "",
    INSTRUCTIONS,
    "",
    [`[Salt docs index]|root: ${root}`, ...lines].join("\n"),
    "",
    END_MARKER,
  ].join("\n");
}

const UNSAFE_ALIAS_CHARACTERS = /[[\]{}|;,]/g;

function compare(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

/**
 * Compresses package manifests into one line per docs folder, such as
 * `|core/docs/components:{button.md[Action],dialog.md[Modal]}`. Core comes
 * first so agents meet the main components before the other packages.
 */
export function indexLines(manifests) {
  const ordered = [...manifests].sort((left, right) =>
    left.directory === "core"
      ? -1
      : right.directory === "core"
        ? 1
        : compare(left.directory, right.directory),
  );
  const lines = [];
  for (const { directory, pages } of ordered) {
    const folders = new Map();
    for (const page of pages ?? []) {
      if (typeof page?.path !== "string") continue;
      const folder = path.posix.dirname(page.path);
      const name = path.posix.basename(page.path);
      const aliases = (Array.isArray(page.aliases) ? page.aliases : [])
        .filter((alias) => typeof alias === "string")
        .map((alias) =>
          alias
            .replace(UNSAFE_ALIAS_CHARACTERS, " ")
            .replace(/\s+/g, " ")
            .trim(),
        )
        .filter(Boolean);
      const key = folder === "." ? "" : `/${folder}`;
      if (!folders.has(key)) folders.set(key, []);
      folders.get(key).push({
        name,
        entry: aliases.length > 0 ? `${name}[${aliases.join(";")}]` : name,
      });
    }
    for (const key of [...folders.keys()].sort(compare)) {
      const entries = folders
        .get(key)
        .sort((left, right) => compare(left.name, right.name))
        .map(({ entry }) => entry);
      lines.push(`|${directory}/docs${key}:{${entries.join(",")}}`);
    }
  }
  return lines;
}

/** Reads the docs manifest of every package installed beside @salt-ds/core. */
export function readManifests(scopeDir) {
  let directories;
  try {
    directories = readdirSync(scopeDir);
  } catch {
    return [];
  }
  const manifests = [];
  for (const directory of directories) {
    const manifestPath = path.join(scopeDir, directory, "docs", MANIFEST_FILE);
    if (!existsSync(manifestPath)) continue;
    try {
      const { pages } = JSON.parse(readFileSync(manifestPath, "utf8"));
      if (Array.isArray(pages)) manifests.push({ directory, pages });
    } catch {
      // A package with an unreadable manifest is left out of the index.
    }
  }
  return manifests;
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
 * Finds the installed Salt docs: the `@salt-ds` folder that holds
 * `core/docs/index.md`, and its path relative to `dir`. Uses the path this
 * script was run from rather than its real path, so package-manager stores
 * such as pnpm's never appear in AGENTS.md.
 */
export function findDocs(dir, scriptPath) {
  const candidates = [];
  if (scriptPath) candidates.push(path.dirname(path.resolve(scriptPath)));
  for (let current = path.resolve(dir); ; current = path.dirname(current)) {
    candidates.push(
      path.join(current, "node_modules", "@salt-ds", "core", "docs"),
    );
    if (path.dirname(current) === current) break;
  }
  const docsDir = candidates.find((candidate) =>
    existsSync(path.join(candidate, "index.md")),
  );
  if (!docsDir) return undefined;
  const scopeDir = path.dirname(path.dirname(docsDir));
  return {
    scopeDir,
    root: toPosix(path.relative(path.resolve(dir), scopeDir)) || ".",
  };
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
  const docs = findDocs(dir, scriptPath);
  if (!docs) {
    throw new Error(
      "Cannot find the Salt docs in node_modules/@salt-ds/core/docs. Install @salt-ds/core, then run this script from that folder.",
    );
  }
  const block = agentsBlock({
    root: docs.root,
    lines: indexLines(readManifests(docs.scopeDir)),
  });
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
    log("Run this script without --check to update them.");
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
