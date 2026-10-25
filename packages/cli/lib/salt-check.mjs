// salt-ds check: checks an application's use of Salt against the docs of its installed Salt
// packages: tokens, deprecated props and the parts a component needs.
import { execFileSync } from "node:child_process";
import {
  existsSync,
  readdirSync,
  readFileSync,
  realpathSync,
  statSync,
} from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { CHECK_DATA_FILE, saltPackages } from "./packages.mjs";

export const SCHEMA_VERSION = 1;

const SCRIPT_FILE = /\.[cm]?[jt]sx?$/;
const STYLE_FILE = /\.(?:css|scss|sass|less)$/;
const SKIPPED_DIRECTORIES = new Set([
  ".cache",
  ".git",
  ".next",
  ".turbo",
  "build",
  "coverage",
  "dist",
  "node_modules",
  "out",
]);
const TOKEN = /--salt-[A-Za-z0-9-]+/g;

const USAGE = `Usage: salt-ds check [options] [paths...]

Checks Salt tokens, deprecated props and component parts in an application
against the docs of its installed Salt packages. Without paths, checks the
application's files that Git tracks or would add.

Options:
  --project <path>  Application whose Salt packages to use (default: cwd)
  --changed         Check only files changed since the last commit
  --json            Print the results as JSON
  --help            Show this help

Exits with 1 when it finds errors, and 2 when it can't run or finds no files.`;

class SetupError extends Error {}

function parseArguments(args) {
  const options = { paths: [], changed: false, json: false };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--changed") options.changed = true;
    else if (arg === "--json") options.json = true;
    else if (arg === "--help" || arg === "-h") options.help = true;
    else if (/^--project(?:=|$)/.test(arg)) {
      const value = arg.includes("=")
        ? arg.slice(arg.indexOf("=") + 1)
        : args[++index];
      if (!value || value.startsWith("--")) {
        throw new SetupError(`--project requires a path\n\n${USAGE}`);
      }
      options.project = value;
    } else if (arg.startsWith("--")) {
      throw new SetupError(`Unknown option: ${arg}\n\n${USAGE}`);
    } else options.paths.push(arg);
  }
  return options;
}

/**
 * Salt packages with agent docs resolved from the application, nearest first
 * as Node resolves them: a nearer package shadows the same package above it.
 */
function installedPackages(project) {
  const found = [];
  let packages;
  try {
    packages = saltPackages(project);
  } catch (error) {
    throw new SetupError(
      `Cannot read the installed packages: ${error.message}`,
    );
  }
  for (const { name, packageDir } of packages) {
    const docsDir = path.join(packageDir, "docs");
    // Packages without agent docs, such as @salt-ds/styles, have nothing to
    // check; a manifest marks agent docs from before salt-check.
    if (
      !existsSync(path.join(docsDir, "manifest.json")) &&
      !existsSync(path.join(docsDir, CHECK_DATA_FILE))
    ) {
      continue;
    }
    let version;
    try {
      ({ version } = JSON.parse(
        readFileSync(path.join(packageDir, "package.json"), "utf8"),
      ));
    } catch {
      continue;
    }
    found.push({ name: `@salt-ds/${name}`, version, docsDir });
  }
  if (found.length === 0) {
    throw new SetupError(
      `No installed Salt packages with agent docs found for ${project}. Run this from the application folder, or use --project. Yarn Plug'n'Play requires nodeLinker: node-modules.`,
    );
  }
  return found;
}

/** The installed Salt packages' check data. */
function loadData(project) {
  const notices = [];
  const tokens = new Map();
  const components = new Map();
  const docsDirs = new Map();
  let tokenPages = [];
  let themeDocs;
  for (const manifest of installedPackages(project)) {
    const { docsDir } = manifest;
    docsDirs.set(manifest.name, docsDir);
    const file = path.join(docsDir, CHECK_DATA_FILE);
    if (!existsSync(file)) {
      notices.push(
        `${manifest.name}@${manifest.version} has no ${CHECK_DATA_FILE}, so its checks are skipped.`,
      );
      continue;
    }
    let data;
    try {
      data = JSON.parse(readFileSync(file, "utf8"));
    } catch (error) {
      throw new SetupError(`Cannot read ${file}: ${error.message}`);
    }
    if (data.schemaVersion > SCHEMA_VERSION) {
      notices.push(
        `${manifest.name}@${manifest.version} has newer check data than this @salt-ds/cli reads, so its checks are skipped; upgrade @salt-ds/cli to check it.`,
      );
      continue;
    }
    if (data.tokens) {
      themeDocs = docsDir;
      tokenPages = data.pages ?? [];
      for (const [
        name,
        [state, pageIndex, replacements = []],
      ] of Object.entries(data.tokens)) {
        tokens.set(name, { state, page: tokenPages[pageIndex], replacements });
      }
    }
    if (data.components) {
      components.set(manifest.name, new Map(Object.entries(data.components)));
    }
  }
  if (!themeDocs)
    notices.push(
      "No installed @salt-ds/theme check data, so token checks are skipped.",
    );
  return { tokens, themeDocs, components, docsDirs, notices };
}

/** File names from a git command, NUL-separated so no path is quoted. */
function git(project, [command, ...args]) {
  return execFileSync("git", [command, "-z", ...args], {
    cwd: project,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  })
    .split("\0")
    .filter(Boolean);
}

function walk(directory, files = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (SKIPPED_DIRECTORIES.has(entry.name)) continue;
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(file, files);
    else if (entry.isFile()) files.push(file);
  }
  return files;
}

function listFiles({ project, paths, changed, cwd }) {
  // Build output and dependencies that Git lists are left out; files and
  // folders passed explicitly are checked wherever they are.
  const inSkippedFolder = (file) =>
    path
      .relative(project, file)
      .split(path.sep)
      .some((part) => SKIPPED_DIRECTORIES.has(part));
  let files;
  if (paths.length > 0) {
    files = paths.flatMap((target) => {
      const full = path.resolve(cwd, target);
      if (!existsSync(full))
        throw new SetupError(`No such file or folder: ${target}`);
      return statSync(full).isDirectory() ? walk(full) : [full];
    });
  } else if (changed) {
    try {
      files = [
        ...git(project, ["diff", "--name-only", "--relative", "HEAD"]),
        ...git(project, ["ls-files", "--others", "--exclude-standard"]),
      ]
        .map((file) => path.join(project, file))
        .filter((file) => !inSkippedFolder(file));
    } catch {
      throw new SetupError(
        "--changed needs a Git repository with a commit. Pass the files to check instead.",
      );
    }
  } else {
    try {
      files = git(project, [
        "ls-files",
        "--cached",
        "--others",
        "--exclude-standard",
      ])
        .map((file) => path.join(project, file))
        .filter((file) => !inSkippedFolder(file));
    } catch {
      files = walk(project);
    }
  }
  return [...new Set(files)]
    .filter(
      (file) =>
        existsSync(file) && (SCRIPT_FILE.test(file) || STYLE_FILE.test(file)),
    )
    .sort();
}

function loadTypeScript(project, cwd) {
  for (const from of [project, cwd]) {
    try {
      return createRequire(path.join(from, "package.json"))("typescript");
    } catch {
      // Try the next location.
    }
  }
  return undefined;
}

/** Comments replaced by spaces, keeping offsets and line breaks. */
function blankComments(text, { lineComments }) {
  const blank = (match) => match.replace(/[^\n]/g, " ");
  let result = text.replace(/\/\*[\s\S]*?\*\//g, blank);
  if (lineComments)
    result = result.replace(
      // After `:` or `(` it's a URL, as in `url(//cdn…)`, not a comment.
      /(^|[^:("'`\\])\/\/[^\n]*/g,
      (match, before) => before + blank(match.slice(before.length)),
    );
  return result;
}

/**
 * Token uses in text: names built at runtime (`--salt-palette-${hue}`) and
 * declarations (`--salt-x: …`, an app's own overrides) are left out.
 */
function tokenUses(text, offset = 0) {
  const uses = [];
  for (const match of text.matchAll(TOKEN)) {
    const name = match[0];
    const end = match.index + name.length;
    const after = text.slice(end);
    if (name.endsWith("-")) continue;
    if (/^(?:\$\{|#\{|@\{|\s*\+)/.test(after)) continue;
    if (/^["']?\s*:/.test(after)) continue;
    uses.push({ name, index: offset + match.index });
  }
  return uses;
}

function lineAndColumn(text, index) {
  const before = text.slice(0, index);
  const line = before.split("\n").length;
  return { line, column: index - before.lastIndexOf("\n") };
}

/**
 * The token reference page for the group a name points to, such as the text
 * characteristic for `--salt-text-…`: the page that lists most current tokens
 * starting the same way.
 */
function groupPage(name, tokens) {
  const group = name.split("-")[3];
  const counts = new Map();
  for (const [candidate, info] of tokens) {
    if (info.state !== "current" || candidate.split("-")[3] !== group) continue;
    counts.set(info.page, (counts.get(info.page) ?? 0) + 1);
  }
  return [...counts].sort((left, right) => right[1] - left[1])[0]?.[0];
}

/**
 * Tokens to suggest for a name that isn't a token: the token it spells in
 * kebab case (`border-color` for `borderColor`), or its replacement when
 * that's deprecated; otherwise current tokens that differ in one segment.
 */
function suggestTokens(name, tokens) {
  const parts = name.slice("--salt-".length).split("-");
  const camel = (segments) =>
    segments
      .map((part, index) =>
        index === 0 || part === ""
          ? part
          : part[0].toUpperCase() + part.slice(1),
      )
      .join("");
  for (let length = parts.length; length >= 2; length -= 1) {
    for (let start = 0; start + length <= parts.length; start += 1) {
      const candidate = `--salt-${[...parts.slice(0, start), camel(parts.slice(start, start + length)), ...parts.slice(start + length)].join("-")}`;
      const info = tokens.get(candidate);
      if (info?.state === "current") return [candidate];
      if (info?.state === "deprecated" && info.replacements.length > 0)
        return info.replacements;
    }
  }
  const scored = [];
  for (const [candidate, info] of tokens) {
    if (info.state !== "current") continue;
    const other = candidate.slice("--salt-".length).split("-");
    if (Math.abs(other.length - parts.length) > 1) continue;
    const shared = parts.filter((part) => other.includes(part)).length;
    if (other[0] === parts[0] && shared >= Math.max(2, parts.length - 1)) {
      scored.push({
        candidate,
        score: shared - Math.abs(other.length - parts.length) * 0.5,
      });
    }
  }
  return scored
    .sort(
      (left, right) =>
        right.score - left.score || (left.candidate < right.candidate ? -1 : 1),
    )
    .slice(0, 3)
    .map(({ candidate }) => candidate);
}

function checkTokens({ uses, text, file, data, problems, page }) {
  for (const { name, index } of uses) {
    const at = { file, ...lineAndColumn(text, index) };
    const info = data.tokens.get(name);
    if (!info) {
      const suggestions = suggestTokens(name, data.tokens);
      problems.push({
        ...at,
        severity: "error",
        rule: "unknown-token",
        message: `${name} isn't a Salt token${suggestions.length > 0 ? `; did you mean ${suggestions.join(", ")}?` : ""}`,
        page: page(groupPage(name, data.tokens) ?? "tokens.md"),
      });
    } else if (info.state === "deprecated") {
      problems.push({
        ...at,
        severity: "error",
        rule: "deprecated-token",
        message: `${name} is deprecated${info.replacements.length > 0 ? `; use ${info.replacements.join(" or ")} instead` : " and has no replacement"}`,
        page: page(info.page),
      });
    } else if (info.state === "palette") {
      problems.push({
        ...at,
        severity: "warning",
        rule: "palette-token",
        message: `${name} is a palette token, which characteristic tokens use to support modes. Use a characteristic or foundation token instead`,
        page: page(info.page),
      });
    }
  }
}

/** " since 1.36.0. Use …" or ": Use …", from a prop's deprecation text. */
function deprecationText(text) {
  const since = /^since (\d+\.\d+\.\d+)\.?\s*/i.exec(text);
  const rest = (since ? text.slice(since[0].length) : text)
    .trim()
    .replace(/\.$/, "");
  return `${since ? ` since ${since[1]}` : ""}${rest ? `${since ? "." : ":"} ${rest}` : ""}`;
}

/** Salt components a file imports: local name -> { name, packageName }. */
function saltImports(ts, sourceFile) {
  const named = new Map();
  const namespaces = new Map();
  for (const statement of sourceFile.statements) {
    if (
      !ts.isImportDeclaration(statement) ||
      !ts.isStringLiteral(statement.moduleSpecifier)
    )
      continue;
    const packageName = statement.moduleSpecifier.text;
    if (!/^@salt-ds\/[\w-]+$/.test(packageName)) continue;
    const bindings = statement.importClause?.namedBindings;
    if (bindings && ts.isNamedImports(bindings)) {
      for (const element of bindings.elements) {
        named.set(element.name.text, {
          name: (element.propertyName ?? element.name).text,
          packageName,
        });
      }
    } else if (bindings && ts.isNamespaceImport(bindings)) {
      namespaces.set(bindings.name.text, packageName);
    }
  }
  return (tag) => {
    if (named.has(tag)) return named.get(tag);
    const [namespace, name] = tag.split(".");
    return name && namespaces.has(namespace)
      ? { name, packageName: namespaces.get(namespace) }
      : undefined;
  };
}

/** TSX for .tsx, TS for .ts, and JSX for JavaScript, which may hold JSX. */
function scriptKind(ts, file) {
  if (/\.tsx$/.test(file)) return ts.ScriptKind.TSX;
  if (/\.[cm]?ts$/.test(file)) return ts.ScriptKind.TS;
  return ts.ScriptKind.JSX;
}

function checkScript({ ts, text, file, data, problems, page }) {
  const sourceFile = ts.createSourceFile(
    file,
    text,
    ts.ScriptTarget.Latest,
    true,
    scriptKind(ts, file),
  );
  const resolve = saltImports(ts, sourceFile);
  const uses = [];
  const at = (node) => ({
    file,
    ...lineAndColumn(text, node.getStart(sourceFile)),
  });
  const tagOf = (node) => node.tagName.getText(sourceFile);

  // Whether an element's children are all known: no expressions other than
  // literals and no components other than Salt's, which could hold a part.
  const known = (element) => {
    let open = false;
    const visit = (child) => {
      if (open) return;
      // Attribute values don't add children, unless they pass them.
      if (ts.isJsxAttributes(child)) {
        open = child.properties.some(
          (attribute) =>
            ts.isJsxSpreadAttribute(attribute) ||
            attribute.name.getText(sourceFile) === "children",
        );
        return;
      }
      if (
        ts.isJsxExpression(child) &&
        child.expression &&
        !ts.isStringLiteralLike(child.expression) &&
        !ts.isNumericLiteral(child.expression)
      )
        open = true;
      else if (
        (ts.isJsxOpeningElement(child) || ts.isJsxSelfClosingElement(child)) &&
        /^[A-Z]/.test(tagOf(child)) &&
        !resolve(tagOf(child))
      )
        open = true;
      else ts.forEachChild(child, visit);
    };
    for (const child of element.children ?? []) visit(child);
    return !open;
  };
  const descendants = (element) => {
    const names = new Set();
    const visit = (child) => {
      if (ts.isJsxOpeningElement(child) || ts.isJsxSelfClosingElement(child)) {
        const salt = resolve(tagOf(child));
        if (salt) names.add(salt.name);
      }
      ts.forEachChild(child, visit);
    };
    for (const child of element.children ?? []) visit(child);
    return names;
  };

  const visit = (node) => {
    if (
      ts.isStringLiteralLike(node) ||
      ts.isTemplateHead(node) ||
      ts.isTemplateMiddle(node) ||
      ts.isTemplateTail(node)
    ) {
      const declared =
        (ts.isPropertyAssignment(node.parent) && node.parent.name === node) ||
        (ts.isCallExpression(node.parent) &&
          node.parent.arguments[0] === node &&
          /\.setProperty$/.test(node.parent.expression.getText(sourceFile)));
      if (!declared && node.text.includes("--salt-")) {
        // The source text, quotes and all, so escapes such as `\t` don't
        // shift positions; a template part ends with the `${` that follows.
        const start = node.getStart(sourceFile);
        uses.push(...tokenUses(text.slice(start, node.getEnd()), start));
      }
    }
    const opening = ts.isJsxElement(node)
      ? node.openingElement
      : ts.isJsxSelfClosingElement(node)
        ? node
        : undefined;
    if (opening) {
      const salt = resolve(tagOf(opening));
      const entry =
        salt && data.components.get(salt.packageName)?.get(salt.name);
      if (entry) {
        const attributes = opening.attributes.properties;
        for (const attribute of attributes) {
          if (!ts.isJsxAttribute(attribute)) continue;
          const prop = attribute.name.getText(sourceFile);
          if (
            entry.deprecatedProps &&
            Object.hasOwn(entry.deprecatedProps, prop)
          ) {
            problems.push({
              ...at(attribute),
              severity: "error",
              rule: "deprecated-prop",
              message: `${salt.name}'s ${prop} prop is deprecated${deprecationText(entry.deprecatedProps[prop])}`,
              page: page(entry.page, salt.packageName),
            });
          }
        }
        const passesChildren = attributes.some(
          (attribute) =>
            ts.isJsxSpreadAttribute(attribute) ||
            attribute.name?.getText(sourceFile) === "children",
        );
        if (
          entry.parts &&
          !passesChildren &&
          (ts.isJsxSelfClosingElement(node) || known(node))
        ) {
          const present = ts.isJsxElement(node) ? descendants(node) : new Set();
          const missing = entry.parts.filter((part) => !present.has(part));
          if (missing.length > 0) {
            problems.push({
              ...at(opening),
              severity: "warning",
              rule: "missing-part",
              message: `${salt.name} has no ${missing.join(" or ")}, which every Salt example of it includes`,
              page: page(entry.page, salt.packageName),
            });
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return uses;
}

export function run(
  args,
  { log = console.log, cwd = process.cwd(), typescript } = {},
) {
  let options;
  try {
    options = parseArguments(args);
    if (options.help) {
      log(USAGE);
      return 0;
    }
    const projectPath = path.resolve(cwd, options.project ?? ".");
    if (!existsSync(projectPath) || !statSync(projectPath).isDirectory()) {
      throw new SetupError(
        `--project must name an existing directory: ${options.project ?? "."}`,
      );
    }
    const project = realpathSync(projectPath);
    const data = loadData(project);
    const files = listFiles({
      project,
      paths: options.paths,
      changed: options.changed,
      cwd,
    });
    if (files.length === 0) {
      // Nothing changed is a clean result, which agents and CI check for.
      if (!options.changed) {
        throw new SetupError(
          "No files to check. Pass the files or folders to check.",
        );
      }
      data.notices.push("No changed script or style files to check.");
    }
    const ts = typescript ?? loadTypeScript(project, cwd);
    if (!ts)
      data.notices.push(
        "TypeScript isn't installed for this application, so prop and part checks are skipped.",
      );
    const page = (docPath, packageName = "@salt-ds/theme") => {
      if (!docPath) return undefined;
      const qualified = /^(@salt-ds\/[\w-]+)\/docs\/(.+)$/.exec(docPath);
      const docsDir = data.docsDirs.get(qualified ? qualified[1] : packageName);
      return docsDir
        ? path.relative(
            cwd,
            path.join(docsDir, qualified ? qualified[2] : docPath),
          )
        : undefined;
    };
    const problems = [];
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      const hasTokens = data.themeDocs && text.includes("--salt-");
      if (STYLE_FILE.test(file)) {
        if (hasTokens) {
          const uses = tokenUses(
            blankComments(text, { lineComments: !file.endsWith(".css") }),
          );
          checkTokens({ uses, text, file, data, problems, page });
        }
      } else if (ts && (text.includes("@salt-ds/") || hasTokens)) {
        const uses = checkScript({ ts, text, file, data, problems, page });
        if (hasTokens) checkTokens({ uses, text, file, data, problems, page });
      } else if (hasTokens) {
        checkTokens({
          uses: tokenUses(blankComments(text, { lineComments: true })),
          text,
          file,
          data,
          problems,
          page,
        });
      }
    }
    problems.sort((left, right) =>
      left.file < right.file
        ? -1
        : left.file > right.file
          ? 1
          : left.line - right.line || left.column - right.column,
    );
    const errors = problems.filter(
      ({ severity }) => severity === "error",
    ).length;
    const warnings = problems.length - errors;
    if (options.json) {
      log(
        JSON.stringify(
          {
            files: files.length,
            errors,
            warnings,
            problems: problems.map((problem) => ({
              ...problem,
              file: path.relative(cwd, problem.file),
            })),
            notices: data.notices,
          },
          null,
          2,
        ),
      );
    } else {
      for (const notice of data.notices) log(`salt-check: ${notice}`);
      for (const {
        file,
        line,
        column,
        severity,
        rule,
        message,
        page: docsPage,
      } of problems) {
        const sentence = /[.?!]$/.test(message) ? message : `${message}.`;
        log(
          `${path.relative(cwd, file)}:${line}:${column}: ${severity} ${rule}: ${sentence}${docsPage ? ` See ${docsPage}.` : ""}`,
        );
      }
      log(
        `salt-check: checked ${files.length} ${files.length === 1 ? "file" : "files"}: ${errors} ${errors === 1 ? "error" : "errors"}, ${warnings} ${warnings === 1 ? "warning" : "warnings"}.`,
      );
    }
    return errors > 0 ? 1 : 0;
  } catch (error) {
    if (!(error instanceof SetupError)) throw error;
    log(`salt-check: ${error.message}`);
    return 2;
  }
}
