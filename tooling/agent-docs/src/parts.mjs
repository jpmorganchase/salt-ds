import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

/** Fewest examples of a component before its parts are suggested. */
const MIN_EXAMPLES = 3;

// Each examples folder's usages, read once.
const usagesByFolder = new Map();

/**
 * Every component used as a JSX element in the site examples, with each
 * use's file and the names of its JSX descendants.
 */
export function exampleUsages(examplesDir) {
  if (!usagesByFolder.has(examplesDir)) {
    usagesByFolder.set(examplesDir, readUsages(examplesDir));
  }
  return usagesByFolder.get(examplesDir);
}

async function readUsages(examplesDir) {
  const files = (await readdir(examplesDir, { recursive: true }))
    .filter((file) => file.endsWith(".tsx"))
    .map((file) => path.join(examplesDir, file));
  // Component -> one Set of descendant names per element found.
  const usages = new Map();
  for (const file of files) {
    const source = await readFile(file, "utf8");
    const sourceFile = ts.createSourceFile(
      file,
      source,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    const visit = (node) => {
      if (ts.isJsxElement(node)) {
        const name = node.openingElement.tagName.getText(sourceFile);
        if (/^[A-Z]/.test(name)) {
          const descendants = new Set();
          const collect = (child) => {
            if (
              ts.isJsxOpeningElement(child) ||
              ts.isJsxSelfClosingElement(child)
            ) {
              descendants.add(child.tagName.getText(sourceFile));
            }
            ts.forEachChild(child, collect);
          };
          for (const child of node.children) collect(child);
          if (!usages.has(name)) usages.set(name, []);
          usages.get(name).push({ file, descendants });
        }
      } else if (ts.isJsxSelfClosingElement(node)) {
        const name = node.tagName.getText(sourceFile);
        if (/^[A-Z]/.test(name)) {
          if (!usages.has(name)) usages.set(name, []);
          usages.get(name).push({ file, descendants: new Set() });
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(sourceFile);
  }
  return usages;
}

/**
 * Parts that every site example of a component nests inside it: for each
 * component used in at least `MIN_EXAMPLES` example files, the components
 * whose names extend it (`Toast` → `ToastContent`) and that are among its
 * JSX descendants wherever it's used. Candidates for `REQUIRED_PARTS`.
 */
export async function partCandidates(examplesDir) {
  const usages = await exampleUsages(examplesDir);
  const candidates = new Map();
  for (const [name, found] of usages) {
    const exampleCount = new Set(found.map(({ file }) => file)).size;
    if (exampleCount < MIN_EXAMPLES) continue;
    const parts = [...found[0].descendants].filter(
      (part) =>
        part.startsWith(name) &&
        /^[A-Z]/.test(part.slice(name.length)) &&
        found.every(({ descendants }) => descendants.has(part)),
    );
    if (parts.length > 0) {
      candidates.set(name, { examples: exampleCount, parts: parts.sort() });
    }
  }
  return candidates;
}
