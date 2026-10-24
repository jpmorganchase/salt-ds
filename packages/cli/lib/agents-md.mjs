// salt-ds init: sets up coding agents with the documentation of the target
// application's installed Salt packages.
import {
  existsSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { CHECK_DATA_FILE, saltPackages } from "./packages.mjs";

export const BEGIN_MARKER = "<!-- BEGIN:salt-ds-agent-docs -->";
export const END_MARKER = "<!-- END:salt-ds-agent-docs -->";
export const MANIFEST_FILE = "manifest.json";

/**
 * The block's instructions. `rootBase` is what the index's `root` is relative
 * to, and `check` is the salt-check command to run from that base.
 */
export function instructions({ rootBase = "this file", check } = {}) {
  return [
    "This project uses the Salt Design System (`@salt-ds/*` packages), whose APIs may differ from your training data.",
    "For any Salt task, prefer retrieval-led reasoning over pre-training-led reasoning: before writing or changing UI that uses Salt, read the relevant pages from the index below.",
    "They are generated for the installed package versions.",
    "Prefer component props, such as `Text`'s `color`, to custom CSS with `--salt-*` tokens.",
    check
      ? `Before you finish, run \`${check}\` from ${rootBase === "this file" ? "this file's folder" : rootBase} and fix what it reports: it checks the Salt tokens, deprecated props and component parts in the files you changed against the installed docs.`
      : "Before you finish, check each Salt prop against its component page's props table and avoid deprecated props.",
    "Under each props table, pages list the attributes a component also accepts and the Salt types the table names; use the installed type declarations for anything else, such as whether attributes belong on the wrapper or an inputProps slot.",
    ...(check
      ? []
      : [
          "For each `--salt-*` token, find the installed `@salt-ds/theme` documentation in the index and check its token references for a characteristic or foundation token available in the selected theme.",
        ]),
    `Index paths are relative to \`root\`, which is relative to ${rootBase}.`,
    "Names in brackets after page names are other names for the same component, and each package's `docs/index.md` summarizes its pages.",
  ].join(" ");
}

/** The salt-ds check command, run from `base`, for the application at `project`. */
export function checkCommand({ base, project }) {
  const relative = toPosix(path.relative(base, project)) || ".";
  // The scoped name: npx uses an installed copy, or fetches this package.
  return `npx @salt-ds/cli check${relative === "." ? "" : ` --project ${relative}`} --changed`;
}

export function agentsBlock({ root = ".", lines, rootBase, check }) {
  return [
    BEGIN_MARKER,
    "",
    "## Salt Design System",
    "",
    instructions({ rootBase, check }),
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
 * One line per docs folder, preserving each package's actual installed path.
 * Package versions are left out so that the block, which projects commit,
 * changes only when pages do; each page states its version.
 */
export function indexLines(manifests) {
  const ordered = [...manifests].sort((left, right) => {
    const leftCore = left.name === "@salt-ds/core" || left.directory === "core";
    const rightCore =
      right.name === "@salt-ds/core" || right.directory === "core";
    return (
      Number(rightCore) - Number(leftCore) ||
      compare(left.name ?? left.directory, right.name ?? right.directory)
    );
  });
  const lines = [];
  for (const { directory, docsPath, pages } of ordered) {
    const docsRoot = docsPath ?? `${directory}/docs`;
    const folders = new Map();
    for (const page of pages ?? []) {
      if (typeof page?.path !== "string") continue;
      const folder = path.posix.dirname(page.path);
      const pageName = path.posix.basename(page.path);
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
        name: pageName,
        entry:
          aliases.length > 0 ? `${pageName}[${aliases.join(";")}]` : pageName,
      });
    }
    for (const key of [...folders.keys()].sort(compare)) {
      const entries = folders
        .get(key)
        .sort((left, right) => compare(left.name, right.name))
        .map(({ entry }) => entry);
      lines.push(`|${docsRoot}${key}:{${entries.join(",")}}`);
    }
  }
  return lines;
}

const CLAUDE_IMPORT = "@AGENTS.md";
const COPILOT_INSTRUCTIONS = path.join(".github", "copilot-instructions.md");
const USAGE = `Usage: salt-ds init [options]

Adds an index of your project's installed Salt docs to AGENTS.md and makes
CLAUDE.md import AGENTS.md. It reads the packages resolved from the
application and does not install or upgrade Salt packages.

Options:
  --project <path>  Application whose packages to index (default: --dir or cwd)
  --dir <path>      Folder holding AGENTS.md (default: project folder)
  --copilot         Also add the index to .github/copilot-instructions.md in
                    the repository holding --dir, for GitHub Copilot
  --check           Change nothing; exit with 1 if any file needs updating
  --no-claude       Leave CLAUDE.md alone
  --script <name>   Run "salt-ds check" at the end of this package.json script,
                    such as typecheck or lint
  --help            Show this help`;

function readJson(file) {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    throw new Error(`Cannot read ${file}: ${error.message}`);
  }
}

function requireFile(file) {
  try {
    if (statSync(file).isFile()) return;
  } catch {
    // Report directories and missing files with the same actionable diagnostic.
  }
  throw new Error(`Missing documentation file: ${file}`);
}

function requireDirectory(directory, option) {
  try {
    if (statSync(directory).isDirectory()) return;
  } catch {
    // The option name makes an invalid application/output folder easy to find.
  }
  throw new Error(`${option} must name an existing directory: ${directory}`);
}

function toPosix(value) {
  return value.split(path.sep).join("/");
}

export function readManifest(packageDir, directory, outputDir = packageDir) {
  const name = `@salt-ds/${directory}`;
  const docsDir = path.join(packageDir, "docs");
  const manifestPath = path.join(docsDir, MANIFEST_FILE);
  if (!existsSync(manifestPath)) {
    throw new Error(
      `${name} is missing ${manifestPath}. Install a version of ${name} that includes agent documentation.`,
    );
  }
  const installed = readJson(path.join(packageDir, "package.json"));
  const manifest = readJson(manifestPath);
  const invalid = (reason) => {
    throw new Error(
      `Invalid documentation manifest ${manifestPath}: ${reason}`,
    );
  };
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    invalid("expected an object");
  }
  if (manifest.schemaVersion !== undefined && manifest.schemaVersion !== 1) {
    invalid(`unsupported schemaVersion ${manifest.schemaVersion}`);
  }
  if (manifest.name !== name || installed?.name !== name) {
    invalid(`package name must be ${name}`);
  }
  if (
    typeof manifest.version !== "string" ||
    !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(
      manifest.version,
    ) ||
    manifest.version !== installed.version
  ) {
    invalid(`version must match the installed package (${installed.version})`);
  }
  if (!Array.isArray(manifest.pages) || manifest.pages.length === 0) {
    invalid("pages must be a nonempty array");
  }
  requireFile(path.join(docsDir, "index.md"));
  const pagePaths = new Set();
  for (const page of manifest.pages) {
    if (
      !page ||
      typeof page.path !== "string" ||
      !page.path.endsWith(".md") ||
      /[\\\r\n\0]/.test(page.path) ||
      page.path.split("/").some((part) => ["", ".", ".."].includes(part)) ||
      typeof page.title !== "string" ||
      page.title.trim() === "" ||
      (page.aliases !== undefined &&
        (!Array.isArray(page.aliases) ||
          page.aliases.some((alias) => typeof alias !== "string")))
    ) {
      invalid(
        "each page needs a relative Markdown path, title and string aliases",
      );
    }
    if (pagePaths.has(page.path)) invalid(`duplicate page ${page.path}`);
    pagePaths.add(page.path);
    requireFile(path.join(docsDir, page.path));
  }
  return {
    directory,
    name,
    version: manifest.version,
    docsPath: toPosix(path.relative(outputDir, docsDir)),
    pages: manifest.pages,
  };
}

/**
 * Walk the real application's hierarchy, keeping package symlink paths intact.
 * A nearer package shadows the same package above it even when it has no docs.
 * The executable's own installation does not affect package selection.
 */
export function discoverManifests(project, outputDir = project) {
  const manifests = [];
  const instructionDir = realpathSync(outputDir);
  for (const { name, packageDir } of saltPackages(realpathSync(project))) {
    if (name !== "core" && !existsSync(path.join(packageDir, "docs"))) continue;
    manifests.push(readManifest(packageDir, name, instructionDir));
  }
  if (manifests.length === 0) {
    throw new Error(
      `No installed Salt documentation found for ${path.resolve(project)}. Install Salt packages with agent docs, or use --project to select the application that has them. Yarn Plug'n'Play requires nodeLinker: node-modules.`,
    );
  }
  return manifests;
}

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
  if (start !== -1 || content.includes(END_MARKER)) {
    throw new Error(
      `Found an incomplete Salt block. Restore both ${BEGIN_MARKER} and ${END_MARKER}, or remove them, then run again.`,
    );
  }
  if (content.trim() === "") return `${normalized}${eol}`;
  return `${content.trimEnd()}${eol}${eol}${normalized}${eol}`;
}

export function withClaudeImport(content) {
  if (content.split(/\r?\n/).some((line) => line.trim() === CLAUDE_IMPORT)) {
    return content;
  }
  const eol = content.includes("\r\n") ? "\r\n" : "\n";
  if (content.trim() === "") return `${CLAUDE_IMPORT}${eol}`;
  return `${content.trimEnd()}${eol}${eol}${CLAUDE_IMPORT}${eol}`;
}

function parseArguments(args) {
  const options = { check: false, claude: true };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--") continue;
    if (arg === "--check") options.check = true;
    else if (arg === "--no-claude") options.claude = false;
    else if (arg === "--copilot") options.copilot = true;
    else if (arg === "--help" || arg === "-h") options.help = true;
    else if (/^--(?:dir|project)(?:=|$)/.test(arg)) {
      const [flag, ...inline] = arg.split("=");
      const value = inline.length > 0 ? inline.join("=") : args[++index];
      if (!value || value.startsWith("--")) {
        throw new Error(`${flag} requires a path\n\n${USAGE}`);
      }
      options[flag.slice(2)] = value;
    } else throw new Error(`Unknown argument: ${arg}\n\n${USAGE}`);
  }
  return options;
}

function sameFile(left, right) {
  try {
    const leftStat = statSync(left, { bigint: true });
    const rightStat = statSync(right, { bigint: true });
    if (
      leftStat.ino !== 0n &&
      leftStat.dev === rightStat.dev &&
      leftStat.ino === rightStat.ino
    ) {
      return true;
    }
    return realpathSync(left) === realpathSync(right);
  } catch {
    return false;
  }
}

/** The nearest folder at or above `start` that holds `.git`, else `start`. */
function repositoryRoot(start) {
  for (let current = start; ; current = path.dirname(current)) {
    if (existsSync(path.join(current, ".git"))) return current;
    if (path.dirname(current) === current) return start;
  }
}

/** The salt-ds check command, when the installed packages ship its data. */
function coreCheck({ base, project, manifests }) {
  const core = manifests.find(({ name }) => name === "@salt-ds/core");
  // docsPath is relative to the instructions folder's real path.
  if (
    !core ||
    !existsSync(path.join(realpathSync(base), core.docsPath, CHECK_DATA_FILE))
  ) {
    return undefined;
  }
  // From the real folders, like the index's paths.
  return checkCommand({
    base: realpathSync(base),
    project: realpathSync(project),
  });
}

export function run(args, { log = console.log, cwd = process.cwd() } = {}) {
  const options = parseArguments(args);
  if (options.help) {
    log(USAGE);
    return 0;
  }
  const project = path.resolve(cwd, options.project ?? options.dir ?? ".");
  const dir = path.resolve(cwd, options.dir ?? project);
  requireDirectory(project, "--project");
  requireDirectory(dir, "--dir");
  const manifests = discoverManifests(project, dir);
  const block = agentsBlock({
    root: ".",
    lines: indexLines(manifests),
    check: coreCheck({ base: dir, project, manifests }),
  });
  const agentsPath = path.join(dir, "AGENTS.md");
  const updates = [
    {
      file: "AGENTS.md",
      filePath: agentsPath,
      update: (content) => upsertBlock(content, block),
    },
  ];
  if (options.claude) {
    updates.push({
      file: "CLAUDE.md",
      filePath: path.join(dir, "CLAUDE.md"),
      update: withClaudeImport,
    });
  }
  if (options.copilot) {
    // Copilot reads one instructions file at the repository root and may not
    // tell the model where it is, so this index is relative to that root.
    const repository = repositoryRoot(dir);
    const copilotManifests = discoverManifests(project, repository);
    const copilotBlock = agentsBlock({
      root: ".",
      rootBase: "the repository root",
      lines: indexLines(copilotManifests),
      check: coreCheck({
        base: repository,
        project,
        manifests: copilotManifests,
      }),
    });
    const filePath = path.join(repository, COPILOT_INSTRUCTIONS);
    updates.push({
      file: toPosix(path.relative(dir, filePath)),
      filePath,
      update: (content) => upsertBlock(content, copilotBlock),
    });
  }
  const isAgentsFile = (filePath) =>
    filePath !== agentsPath && sameFile(filePath, agentsPath);

  // Read and validate every file before writing any of them.
  const planned = updates.map(({ file, filePath, update }) => {
    if (isAgentsFile(filePath)) return { file, same: true };
    const current = existsSync(filePath) ? readFileSync(filePath, "utf8") : "";
    try {
      return { file, filePath, current, next: update(current) };
    } catch (error) {
      throw new Error(`${file}: ${error.message}`);
    }
  });

  let stale = false;
  for (const { file, filePath, current, next, same } of planned) {
    // Creating AGENTS.md can make a previously dangling link to it resolve.
    if (same || isAgentsFile(filePath)) {
      log(`${file} is the same file as AGENTS.md.`);
    } else if (next === current) {
      log(`${file} is up to date.`);
    } else {
      stale = true;
      if (options.check) {
        log(`${file} needs updating.`);
      } else {
        mkdirSync(path.dirname(filePath), { recursive: true });
        writeFileSync(filePath, next);
        log(`${current === "" ? "Created" : "Updated"} ${file}.`);
      }
    }
  }
  if (options.check && stale) {
    log("Run this command without --check to update them.");
    return 1;
  }
  return 0;
}
