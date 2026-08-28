import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const sourceRoot = path.join(packageRoot, "src");
const entryPoints = [
  path.join(sourceRoot, "index.ts"),
  path.join(sourceRoot, "cli.ts"),
];
const baseline = {
  commit: "f0f6d86db9a5f7b6db434e2b0be4e6d3f57f4f4b",
  physical_lines: 47_540,
};
const maximumPhysicalLines = Math.floor(baseline.physical_lines * 0.7);

function portable(filePath) {
  return filePath.replaceAll("\\", "/");
}

function excluded(root, filePath) {
  const relative = `/${portable(path.relative(root, filePath))}`;
  return (
    relative.includes("/__tests__/") ||
    relative.includes("/evals/") ||
    relative.includes("/core/build/") ||
    /(?:\.spec|\.test|\.d)\.tsx?$/u.test(relative)
  );
}

function isWithinRoot(root, filePath) {
  const relative = path.relative(root, filePath);
  return (
    relative.length === 0 ||
    (!relative.startsWith(`..${path.sep}`) &&
      relative !== ".." &&
      !path.isAbsolute(relative))
  );
}

function runtimeSpecifier(node) {
  if (ts.isImportDeclaration(node)) {
    const clause = node.importClause;
    if (clause?.isTypeOnly) return null;
    if (
      clause?.namedBindings &&
      ts.isNamedImports(clause.namedBindings) &&
      !clause.name &&
      clause.namedBindings.elements.length > 0 &&
      clause.namedBindings.elements.every((element) => element.isTypeOnly)
    ) {
      return null;
    }
    return ts.isStringLiteral(node.moduleSpecifier)
      ? node.moduleSpecifier.text
      : null;
  }
  if (ts.isExportDeclaration(node)) {
    if (node.isTypeOnly || !node.moduleSpecifier) return null;
    if (
      node.exportClause &&
      ts.isNamedExports(node.exportClause) &&
      node.exportClause.elements.length > 0 &&
      node.exportClause.elements.every((element) => element.isTypeOnly)
    ) {
      return null;
    }
    return ts.isStringLiteral(node.moduleSpecifier)
      ? node.moduleSpecifier.text
      : null;
  }
  if (
    ts.isCallExpression(node) &&
    node.arguments.length === 1 &&
    ts.isStringLiteral(node.arguments[0]) &&
    (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
      (ts.isIdentifier(node.expression) && node.expression.text === "require"))
  ) {
    return node.arguments[0].text;
  }
  return null;
}

function localSpecifiers(filePath) {
  const source = ts.createSourceFile(
    filePath,
    fs.readFileSync(filePath, "utf8"),
    ts.ScriptTarget.Latest,
    true,
  );
  const values = [];
  function visit(node) {
    const specifier = runtimeSpecifier(node);
    if (specifier?.startsWith(".")) values.push(specifier);
    ts.forEachChild(node, visit);
  }
  visit(source);
  return values;
}

function resolveLocal(importer, specifier) {
  const base = path.resolve(path.dirname(importer), specifier);
  const candidates = /\.[cm]?js$/u.test(base)
    ? [base.replace(/\.[cm]?js$/u, ".ts"), base.replace(/\.[cm]?js$/u, ".tsx")]
    : [base, `${base}.ts`, `${base}.tsx`, path.join(base, "index.ts")];
  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
}

function countPhysicalLines(filePath) {
  const source = fs.readFileSync(filePath, "utf8");
  if (source.length === 0) return 0;
  return source.replace(/(?:\r\n|\r)$/u, "").split(/\r\n|\n|\r/u).length;
}

export function collectRuntimeReachableFiles(root, roots) {
  const pending = [...roots];
  const reached = new Set();
  while (pending.length > 0) {
    const filePath = path.resolve(pending.pop());
    if (reached.has(filePath)) continue;
    if (!isWithinRoot(root, filePath)) {
      throw new Error(
        `Runtime-reachable source leaves the measured root: ${portable(filePath)}`,
      );
    }
    if (excluded(root, filePath)) {
      throw new Error(
        `Runtime-reachable source is excluded from the LOC budget: ${portable(path.relative(root, filePath))}`,
      );
    }
    reached.add(filePath);
    for (const specifier of localSpecifiers(filePath)) {
      const resolved = resolveLocal(filePath, specifier);
      if (resolved) pending.push(resolved);
    }
  }
  return [...reached].sort((left, right) =>
    portable(left).localeCompare(portable(right)),
  );
}

export function measureRuntimeReachableLoc() {
  const files = collectRuntimeReachableFiles(sourceRoot, entryPoints);
  const physicalLines = files.reduce(
    (total, filePath) => total + countPhysicalLines(filePath),
    0,
  );
  return {
    baseline_commit: baseline.commit,
    baseline_physical_lines: baseline.physical_lines,
    entry_points: entryPoints.map((entry) =>
      portable(path.relative(packageRoot, entry)),
    ),
    exclusions: [
      "tests",
      "evals",
      "core/build",
      "declaration files",
      "type-only import/export edges",
    ],
    excluded_reachable_policy:
      "fail when a runtime edge resolves into an excluded or out-of-root source path",
    encoding: "UTF-8",
    line_method: "physical lines excluding a terminal empty line",
    reachable_files: files.map((filePath) =>
      portable(path.relative(packageRoot, filePath)),
    ),
    reachable_file_count: files.length,
    runtime_reachable_physical_lines: physicalLines,
    maximum_physical_lines: maximumPhysicalLines,
    reduction_ratio: 1 - physicalLines / baseline.physical_lines,
    passed: physicalLines <= maximumPhysicalLines,
  };
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  const result = measureRuntimeReachableLoc();
  console.log(JSON.stringify(result, null, 2));
  if (!result.passed) process.exitCode = 1;
}
