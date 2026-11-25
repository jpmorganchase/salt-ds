import { readdir, readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Checks prop JSDoc against the standards in CONTRIBUTING.md, under
// "Documenting props". Run it with `yarn lint:jsdoc`.

const require = createRequire(import.meta.url);
const ts = require("typescript");

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

// Lab isn't checked until its components move to core.
export const sourceDirs = [
  "packages/core/src",
  "packages/countries/src/country-symbol",
  "packages/countries/src/lazy-country-symbol",
  "packages/date-adapters/src",
  "packages/date-components/src",
  "packages/embla-carousel/src",
  "packages/icons/src/icon",
  "packages/styles/src",
  "packages/window/src",
];

// The packages whose props tables site/propsGen.js generates, apart from lab
// and the theme packages.
export const propsTableEntries = [
  "packages/core/src/index.ts",
  "packages/countries/src/index.ts",
  "packages/date-components/src/index.ts",
  "packages/embla-carousel/src/index.ts",
  "packages/icons/src/index.ts",
];

export const rules = {
  format:
    "Put `/**` and `*/` on their own lines, and start each line between them with `*`.",
  "plain-comment":
    "Use a `/** */` block. Editors and the props tables ignore `//` and `/* */` comments.",
  description: "Add a description before the tags.",
  sentence:
    "Start the description with a capital letter and end it with a period.",
  phrasing: "Follow the phrasing for this kind of prop.",
  "repeats-type":
    "Don't repeat the type, which the props tables already show. Only list a union's values to explain what each one does.",
  default:
    'Write the `@default` value as it is in code, for example `@default "top"`, with no backticks, single quotes or trailing period.',
  "prose-default":
    "Document the default with an `@default` tag instead of in the description.",
  spelling: "Use American English.",
  param: "Only document `@param` on props that are functions.",
  "deprecated-last": "Put `@deprecated` after the other tags.",
  "props-table": "Add a description, so the props table doesn't show it empty.",
  ignore:
    "Name rules that exist and give a reason, for example `// jsdoc-lint-ignore default: <reason>`.",
};

const ignoreCommentPattern =
  /^\/\/\s*jsdoc-lint-ignore\s+([\w-]+(?:\s*,\s*[\w-]+)*)\s*(?::\s*(.*))?$/;
const directiveCommentPattern =
  /^\/[/*]\s*(?:biome-ignore|@ts-|eslint-|jsdoc-lint-ignore)/;

const literal = String.raw`(?:"[^"\n]*"|'[^'\n]*'|-?\d+(?:\.\d+)?|true|false|null|undefined)`;
// A default written as a sentence of its own, such as "Defaults to `300`.",
// rather than one that another prop or a parent sets, such as "Inside a
// `ToggleButtonGroup`, it defaults to the group's `sentiment`."
const proseDefaultPattern = new RegExp(
  String.raw`(?:^|[.!?,;]\s+)(?:[Dd]efaults to|[Dd]efault value is|(?:[Tt]he )?[Dd]efault is)\s+(\`?)${literal}\1(?=$|[\s.,;:)])|(?:^|[.!?]\s+)(\`?)${literal}\2\s+is the default\b`,
);

const britishSpellingPattern =
  /\b(?:colour\w*|behaviour\w*|favour\w*|honour\w*|neighbour\w*|centre[ds]?|licence[ds]?|grey|customis\w*|initialis\w*|organis\w*|recognis\w*|utilis\w*|serialis\w*|normalis\w*|visualis\w*|prioritis\w*|summaris\w*|analys(?:e|ed|es|ing)|cancell(?:ed|ing)|labell(?:ed|ing)|modell(?:ed|ing)|travell(?:ed|ing))\b/i;

const repeatsTypePatterns = [
  /^Either\s+["'`]/,
  /^(?:A|An)\s+(?:string|boolean|number)\b/,
  /^One of\b/,
  /^Shape of\b/,
  /(?:^|[.!?]\s+)Options are\b/,
];

function stripCode(text) {
  return text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/https?:\/\/\S+/g, " ");
}

function getDeclarationName(node) {
  let current = node.parent;
  while (current) {
    if (
      ts.isInterfaceDeclaration(current) ||
      ts.isTypeAliasDeclaration(current)
    ) {
      return current.name.text;
    }
    current = current.parent;
  }
  return undefined;
}

function getPropName(member) {
  const { name } = member;
  if (!name) return undefined;
  if (ts.isIdentifier(name) || ts.isStringLiteral(name)) return name.text;
  return undefined;
}

function isFunctionType(member, sourceFile) {
  if (ts.isMethodSignature(member)) return true;
  const { type } = member;
  if (!type) return false;
  if (ts.isFunctionTypeNode(type)) return true;
  const typeText = type.getText(sourceFile);
  return (
    typeText.includes("=>") ||
    /(?:Handler|Callback|Function)\b/.test(typeText) ||
    /\["on[A-Z]\w*"\]/.test(typeText)
  );
}

function isBooleanType(member, sourceFile) {
  if (!member.type) return false;
  const typeText = member.type.getText(sourceFile).replace(/\s/g, "");
  return ["boolean", "boolean|undefined", "true|false"].includes(typeText);
}

function getIgnoredRules(member, sourceFile, report) {
  const text = sourceFile.text;
  const ignored = new Set();
  for (const range of ts.getLeadingCommentRanges(text, member.pos) ?? []) {
    const comment = text.slice(range.pos, range.end);
    const match = ignoreCommentPattern.exec(comment);
    if (!match) continue;
    const names = match[1].split(",").map((name) => name.trim());
    const unknown = names.filter((name) => !(name in rules));
    if (unknown.length > 0 || !match[2]?.trim()) {
      report(range.pos, "ignore", rules.ignore);
    }
    for (const name of names) ignored.add(name);
  }
  return ignored;
}

function checkDefaultTag(value, report) {
  if (!value) {
    report("default", "Give the `@default` tag a value.");
  } else if (value.includes("\n")) {
    report(
      "default",
      "Put the description before the tags. Text after a tag becomes part of that tag.",
    );
  } else if (/^(?:false|undefined)$/.test(value)) {
    report(
      "default",
      `Don't document a default of \`${value}\`. An unset prop is already \`undefined\`, which a boolean treats as \`false\`.`,
    );
  } else if (value.includes("`")) {
    report("default", "Don't use backticks in the `@default` value.");
  } else if (/^'.*'$/.test(value)) {
    report("default", "Use double quotes in the `@default` value.");
  } else if (/[.,;]$/.test(value)) {
    report("default", "Don't end the `@default` value with punctuation.");
  } else if (
    /^[a-z][a-z-]*$/.test(value) &&
    value !== "true" &&
    value !== "null"
  ) {
    report(
      "default",
      `Write string values in double quotes, for example \`@default "${value}"\`.`,
    );
  }
}

function checkMember(member, sourceFile, findings) {
  const propName = getPropName(member);
  const declarationName = getDeclarationName(member);
  if (!propName || !declarationName?.endsWith("Props")) return;

  const text = sourceFile.text;
  const fileName = sourceFile.fileName;
  const pending = [];
  const reportAt = (position, rule, message) => {
    const { line, character } =
      sourceFile.getLineAndCharacterOfPosition(position);
    pending.push({
      file: fileName,
      line: line + 1,
      column: character + 1,
      rule,
      message: `\`${propName}\`: ${message}`,
    });
  };

  const ignored = getIgnoredRules(member, sourceFile, reportAt);
  const jsDocs = member.jsDoc ?? [];

  if (jsDocs.length === 0) {
    const plainComment = (ts.getLeadingCommentRanges(text, member.pos) ?? [])
      .map((range) => ({ range, comment: text.slice(range.pos, range.end) }))
      .find(({ comment }) => !directiveCommentPattern.test(comment));
    if (plainComment) {
      reportAt(plainComment.range.pos, "plain-comment", rules["plain-comment"]);
    }
  } else {
    const jsDoc = jsDocs[jsDocs.length - 1];
    const start = jsDoc.getStart(sourceFile);
    const report = (rule, message) => reportAt(start, rule, message);
    const lines = text.slice(start, jsDoc.end).split("\n");

    if (lines.length === 1) {
      report("format", "Put `/**` and `*/` on their own lines.");
    } else {
      if (lines[0].trim() !== "/**") {
        report("format", "Put `/**` on its own line.");
      }
      if (lines[lines.length - 1].trim() !== "*/") {
        report("format", "Close the block with `*/` on its own line.");
      }
      if (lines.slice(1, -1).some((line) => !/^\s*\*/.test(line))) {
        report("format", "Start each line between `/**` and `*/` with `*`.");
      }
    }

    const description = (ts.getTextOfJSDocComment(jsDoc.comment) ?? "").trim();
    const tags = jsDoc.tags ?? [];
    const tagNames = tags.map((tag) => tag.tagName.text);
    const isDeprecated = tagNames.includes("deprecated");
    const isFunction = isFunctionType(member, sourceFile);

    if (!description) {
      if (!isDeprecated) report("description", rules.description);
    } else {
      if (/^[a-z]/.test(description)) {
        report("sentence", "Start the description with a capital letter.");
      }
      if (!/(?:[.?!:]|```|\|)$/.test(description)) {
        report("sentence", "End the description with a period.");
      }
      if (!isDeprecated && isBooleanType(member, sourceFile)) {
        if (!description.startsWith("If `true`, ")) {
          report(
            "phrasing",
            'Start a boolean prop\'s description with "If `true`, ".',
          );
        }
      }
      if (/^on[A-Z]/.test(propName) && isFunction) {
        if (!description.startsWith("Callback fired ")) {
          report(
            "phrasing",
            'Start an event callback\'s description with "Callback fired when ".',
          );
        }
      }
      if (/Props$/.test(propName) && !isFunction) {
        if (!description.startsWith("Props applied to ")) {
          report("phrasing", 'Start the description with "Props applied to ".');
        }
      }
      if (repeatsTypePatterns.some((pattern) => pattern.test(description))) {
        report("repeats-type", rules["repeats-type"]);
      }
      if (
        !tagNames.includes("default") &&
        proseDefaultPattern.test(description.replace(/\s+/g, " "))
      ) {
        report("prose-default", rules["prose-default"]);
      }
      const spelling = britishSpellingPattern.exec(stripCode(description));
      if (spelling) {
        report("spelling", `Use American English instead of "${spelling[0]}".`);
      }
    }

    for (const [index, tag] of tags.entries()) {
      const tagName = tag.tagName.text;
      const value = (ts.getTextOfJSDocComment(tag.comment) ?? "").trim();
      if (tagName === "deprecated" && index !== tags.length - 1) {
        report("deprecated-last", rules["deprecated-last"]);
      }
      if (tagName === "default") {
        checkDefaultTag(value, (rule, message) => report(rule, message));
      }
      if (tagName === "param" && !isFunction) {
        report("param", rules.param);
      }
      const spelling = britishSpellingPattern.exec(stripCode(value));
      if (spelling) {
        report("spelling", `Use American English instead of "${spelling[0]}".`);
      }
    }
  }

  for (const finding of pending) {
    if (finding.rule === "ignore" || !ignored.has(finding.rule)) {
      findings.push(finding);
    }
  }
}

/**
 * Checks the JSDoc of the props declared in one file.
 */
export function checkSource(fileName, sourceText) {
  const sourceFile = ts.createSourceFile(
    fileName,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    fileName.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const findings = [];
  const visit = (node) => {
    if (ts.isPropertySignature(node) || ts.isMethodSignature(node)) {
      checkMember(node, sourceFile, findings);
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return findings;
}

// react-docgen-typescript gives file names relative to the parent of the
// closest folder that contains both the file and the working directory.
function resolveDocgenFileName(fileName) {
  if (path.isAbsolute(fileName)) return fileName;
  let parent = process.cwd();
  while (parent !== path.dirname(parent)) {
    const candidate = path.resolve(path.dirname(parent), fileName);
    if (candidate.startsWith(parent) && ts.sys.fileExists(candidate)) {
      return candidate;
    }
    parent = path.dirname(parent);
  }
  return path.resolve(fileName);
}

function findMember(sourceFile, declarationName, propName) {
  let fallback;
  let match;
  const visit = (node) => {
    if (match) return;
    if (
      (ts.isPropertySignature(node) || ts.isMethodSignature(node)) &&
      getPropName(node) === propName
    ) {
      if (getDeclarationName(node) === declarationName) {
        match = node;
        return;
      }
      fallback ??= node;
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return match ?? fallback;
}

/**
 * Checks that every prop in the props tables of the given package entry files
 * has a description, using the same react-docgen-typescript options as
 * site/propsGen.js.
 */
export function checkPropsTables(entryFiles) {
  const docgen = require("react-docgen-typescript");
  const options = {
    propFilter: (prop) =>
      !/@types[\\/]react[\\/]/.test(prop.parent?.fileName || ""),
  };
  const findings = [];
  const seen = new Set();
  const sourceFiles = new Map();

  for (const entryFile of entryFiles) {
    for (const component of docgen.parse(entryFile, options)) {
      for (const [propName, prop] of Object.entries(component.props)) {
        if (prop.description?.trim()) continue;
        const declaration = (prop.declarations ?? []).find(
          ({ fileName }) => !/node_modules/.test(fileName),
        );
        if (!declaration) continue;
        const fileName = resolveDocgenFileName(declaration.fileName);
        const key = `${fileName}:${declaration.name}:${propName}`;
        if (seen.has(key)) continue;
        seen.add(key);

        if (!sourceFiles.has(fileName)) {
          sourceFiles.set(
            fileName,
            ts.createSourceFile(
              fileName,
              ts.sys.readFile(fileName) ?? "",
              ts.ScriptTarget.Latest,
              true,
            ),
          );
        }
        const sourceFile = sourceFiles.get(fileName);
        const member = findMember(sourceFile, declaration.name, propName);
        const comments = member
          ? (ts.getLeadingCommentRanges(sourceFile.text, member.pos) ?? []).map(
              (range) => sourceFile.text.slice(range.pos, range.end),
            )
          : [];
        const isIgnored = comments.some((comment) => {
          const match = ignoreCommentPattern.exec(comment);
          return match?.[1]
            .split(",")
            .some((name) => name.trim() === "props-table");
        });
        if (isIgnored) continue;

        const { line, character } = member
          ? sourceFile.getLineAndCharacterOfPosition(
              member.getStart(sourceFile),
            )
          : { line: 0, character: 0 };
        findings.push({
          file: fileName,
          line: line + 1,
          column: character + 1,
          rule: "props-table",
          message: `\`${propName}\`: \`${component.displayName}\`'s props table shows this prop with no description. Add a JSDoc description where it's declared.`,
        });
      }
    }
  }
  return findings;
}

async function listSourceFiles(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (
        !["__tests__", "stories", "examples", "node_modules"].includes(
          entry.name,
        )
      ) {
        files.push(...(await listSourceFiles(entryPath)));
      }
    } else if (
      /\.tsx?$/.test(entry.name) &&
      !/\.(?:d|spec|test)\.tsx?$/.test(entry.name)
    ) {
      files.push(entryPath);
    }
  }
  return files;
}

/**
 * Runs every check over the source directories and props tables.
 */
export async function checkJsdoc({
  cwd = rootDir,
  dirs = sourceDirs,
  entries = propsTableEntries,
} = {}) {
  const findings = [];
  for (const dir of dirs) {
    for (const file of await listSourceFiles(path.join(cwd, dir))) {
      findings.push(...checkSource(file, await readFile(file, "utf8")));
    }
  }
  findings.push(
    ...checkPropsTables(entries.map((entry) => path.join(cwd, entry))),
  );
  return findings
    .map((finding) => ({ ...finding, file: path.relative(cwd, finding.file) }))
    .sort(
      (a, b) =>
        a.file.localeCompare(b.file) || a.line - b.line || a.column - b.column,
    );
}

function escapeAnnotation(text) {
  return text.replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const findings = await checkJsdoc();
  for (const { file, line, column, rule, message } of findings) {
    console.log(`${file}:${line}:${column} jsdoc/${rule} ${message}`);
    if (process.env.GITHUB_ACTIONS === "true") {
      console.log(
        `::error file=${file},line=${line},col=${column},title=jsdoc/${rule}::${escapeAnnotation(message)}`,
      );
    }
  }
  if (findings.length > 0) {
    console.log(
      `\nFound ${findings.length} JSDoc ${findings.length === 1 ? "problem" : "problems"}. The standards are in CONTRIBUTING.md, under "Documenting props".`,
    );
    process.exitCode = 1;
  } else {
    console.log("No JSDoc problems found.");
  }
}
