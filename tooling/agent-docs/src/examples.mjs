import { readFile } from "node:fs/promises";
import path from "node:path";
import { MAX_INLINE_SUPPORT_FILE_BYTES } from "./config.mjs";
import { isFile, toPosix } from "./files.mjs";

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
const IMPORT_PATTERN =
  /(?:^|[\s;])(?:import|export)\s+(?:type\s+)?(?:[^"';]*?\sfrom\s+)?["']([^"']+)["']/g;
const MAX_SUPPORT_DEPTH = 3;

export function localImportSpecifiers(source) {
  return [...source.matchAll(IMPORT_PATTERN)]
    .map((match) => match[1])
    .filter((specifier) => specifier.startsWith("."));
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
 * alike.
 */
export function createExampleResolver({ examplesDir }) {
  const root = path.resolve(examplesDir);
  const inRoot = (file) => file.startsWith(`${root}${path.sep}`);

  async function resolve(componentName, exampleName) {
    const entryFile = path.join(root, componentName, `${exampleName}.tsx`);
    if (!inRoot(entryFile) || !(await isFile(entryFile))) {
      return {
        error: `Example ${componentName}/${exampleName}.tsx does not exist in site/src/examples.`,
      };
    }
    const entryCode = await readFile(entryFile, "utf8");
    const support = [];
    const seen = new Set([entryFile]);
    const queue = [{ file: entryFile, code: entryCode, depth: 0 }];

    while (queue.length > 0) {
      const { file, code, depth } = queue.shift();
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

  return { resolve };
}
