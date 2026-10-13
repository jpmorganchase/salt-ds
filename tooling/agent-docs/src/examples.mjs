import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";
import { MAX_INLINE_SUPPORT_FILE_BYTES } from "./config.mjs";
import { isFile, pathExists, toPosix } from "./files.mjs";

const LANGUAGES = {
  ".tsx": "tsx",
  ".ts": "ts",
  ".jsx": "jsx",
  ".js": "js",
  ".mjs": "js",
  ".css": "css",
  ".json": "json",
};
const SCRIPT_EXTENSIONS = new Set([".tsx", ".ts", ".jsx", ".js", ".mjs"]);
const RESOLUTION_SUFFIXES = [
  "",
  ".tsx",
  ".ts",
  ".jsx",
  ".js",
  ".css",
  ".json",
  "/index.tsx",
  "/index.ts",
  "/index.js",
];
const MAX_SUPPORT_DEPTH = 3;
// Salt packages publish neither their stories nor their src folders.
const UNPUBLISHED_IMPORT_PATTERN = /^@salt-ds\/[^/]+\/(?:stories|src)(?:\/|$)/;

/** Module specifiers that a file imports or re-exports, ignoring comments. */
function importSpecifiers(source) {
  return ts
    .preProcessFile(source, true, true)
    .importedFiles.map((file) => file.fileName);
}

export function localImportSpecifiers(source) {
  return importSpecifiers(source).filter((specifier) =>
    specifier.startsWith("."),
  );
}

async function resolveLocalImport(fromFile, specifier) {
  const base = path.resolve(path.dirname(fromFile), specifier);
  for (const suffix of RESOLUTION_SUFFIXES) {
    if (await isFile(`${base}${suffix}`)) return `${base}${suffix}`;
  }
  return undefined;
}

function displayPath(entryFile, file) {
  const relative = toPosix(path.relative(path.dirname(entryFile), file));
  return relative.startsWith(".") ? relative : `./${relative}`;
}

/**
 * Resolves `<LivePreview componentName exampleName />` to the example source
 * and the local files it imports, as the site does when showing code. An
 * example is `<componentName>/<exampleName>.tsx`, for components and patterns
 * alike. `shown` collects every example resolved, as `<componentName>/<exampleName>`.
 */
export function createExampleResolver({ examplesDir }) {
  const root = path.resolve(examplesDir);
  const inRoot = (file) => file.startsWith(`${root}${path.sep}`);
  const shown = new Set();

  async function resolve(componentName, exampleName) {
    const entryFile = path.join(root, componentName, `${exampleName}.tsx`);
    if (!inRoot(entryFile) || !(await isFile(entryFile))) {
      return {
        error: `Example ${componentName}/${exampleName}.tsx does not exist in site/src/examples.`,
      };
    }
    shown.add(`${componentName}/${exampleName}`);
    const entryCode = await readFile(entryFile, "utf8");
    const support = [];
    const seen = new Set([entryFile]);
    const queue = [{ file: entryFile, code: entryCode, depth: 0 }];

    while (queue.length > 0) {
      const { file, code, depth } = queue.shift();
      const unpublished = importSpecifiers(code).find((specifier) =>
        UNPUBLISHED_IMPORT_PATTERN.test(specifier),
      );
      if (unpublished) {
        return {
          error: `Example ${componentName}/${exampleName} imports ${unpublished}, which isn't published, so readers can't use it. Copy what it needs into the example's folder.`,
        };
      }
      if (depth >= MAX_SUPPORT_DEPTH) continue;
      for (const specifier of localImportSpecifiers(code)) {
        const resolved = await resolveLocalImport(file, specifier);
        if (!resolved) {
          return {
            error: `Example ${componentName}/${exampleName} imports ${specifier}, which does not resolve to a file.`,
          };
        }
        if (seen.has(resolved)) continue;
        seen.add(resolved);
        const shownPath = displayPath(entryFile, resolved);
        const extension = path.extname(resolved);
        const language = LANGUAGES[extension];
        if (!resolved.startsWith(`${root}${path.sep}`)) {
          support.push({ displayPath: shownPath, kind: "site-helper" });
        } else if (!language) {
          support.push({ displayPath: shownPath, kind: "asset" });
        } else {
          const content = await readFile(resolved, "utf8");
          support.push({
            displayPath: shownPath,
            absolutePath: resolved,
            examplePath: toPosix(path.relative(root, resolved)),
            kind: "file",
            language,
            code: content,
            large: Buffer.byteLength(content) > MAX_INLINE_SUPPORT_FILE_BYTES,
          });
          if (SCRIPT_EXTENSIONS.has(extension)) {
            queue.push({ file: resolved, code: content, depth: depth + 1 });
          }
        }
      }
    }

    return {
      entry: {
        language: "tsx",
        code: entryCode,
        absolutePath: entryFile,
        displayPath: toPosix(path.relative(root, entryFile)),
      },
      support,
    };
  }

  return { resolve, shown };
}

/**
 * Pattern examples, `patterns/<pattern>/<Example>`, that the pattern's
 * `index.ts` exports but no page shows. An example that no page shows reaches
 * neither the website nor the agent docs.
 */
export async function unshownPatternExamples({ examplesDir, shown }) {
  const patternsDir = path.join(examplesDir, "patterns");
  if (!(await pathExists(patternsDir))) return [];
  const unshown = [];
  for (const entry of await readdir(patternsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    let indexFile;
    for (const name of ["index.ts", "index.tsx"]) {
      const candidate = path.join(patternsDir, entry.name, name);
      if (await isFile(candidate)) indexFile = candidate;
    }
    if (!indexFile) continue;
    const source = await readFile(indexFile, "utf8");
    // Examples are the .tsx files beside index.ts that it re-exports.
    for (const specifier of importSpecifiers(source)) {
      const name = /^\.\/([^/]+)$/.exec(specifier)?.[1];
      if (!name) continue;
      if (!(await isFile(path.join(patternsDir, entry.name, `${name}.tsx`)))) {
        continue;
      }
      const example = `patterns/${entry.name}/${name}`;
      if (!shown.has(example)) unshown.push(example);
    }
  }
  return unshown.sort();
}
