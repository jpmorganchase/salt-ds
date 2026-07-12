import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { describe, expect, it } from "vitest";

const SRC_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const CORE_ROOT = path.join(SRC_ROOT, "core");
const CORE_RUNTIME = path.join(CORE_ROOT, "runtime.ts");

function collectTypeScriptFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory()
      ? collectTypeScriptFiles(target)
      : /\.tsx?$/u.test(entry.name)
        ? [target]
        : [];
  });
}

function collectModuleSpecifiers(filePath: string): string[] {
  const source = ts.createSourceFile(
    filePath,
    fs.readFileSync(filePath, "utf8"),
    ts.ScriptTarget.Latest,
    true,
  );
  const specifiers: string[] = [];

  function visit(node: ts.Node): void {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      specifiers.push(node.moduleSpecifier.text);
    }
    if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments.length === 1 &&
      ts.isStringLiteral(node.arguments[0])
    ) {
      specifiers.push(node.arguments[0].text);
    }
    ts.forEachChild(node, visit);
  }

  visit(source);
  return specifiers;
}

function resolveSourceSpecifier(importer: string, specifier: string): string {
  const resolved = path.resolve(path.dirname(importer), specifier);
  return resolved.replace(/\.js$/u, ".ts");
}

function isWithin(parent: string, target: string): boolean {
  const relative = path.relative(parent, target);
  return (
    relative.length === 0 ||
    (!relative.startsWith("..") && !path.isAbsolute(relative))
  );
}

describe("MCP internal architecture boundary", () => {
  it("keeps the internal core independent from MCP transport and host concerns", () => {
    const violations: string[] = [];
    const forbiddenPackages = [
      "@modelcontextprotocol/sdk",
      "@salt-ds/mcp",
      "@salt-ds/semantic-core",
      "get-tsconfig",
    ];

    for (const filePath of collectTypeScriptFiles(CORE_ROOT)) {
      if (filePath.includes(`${path.sep}__tests__${path.sep}`)) continue;
      for (const specifier of collectModuleSpecifiers(filePath)) {
        if (
          forbiddenPackages.some(
            (name) => specifier === name || specifier.startsWith(`${name}/`),
          )
        ) {
          violations.push(
            `${path.relative(SRC_ROOT, filePath)} imports ${specifier}`,
          );
        }
        if (specifier.startsWith(".")) {
          const target = resolveSourceSpecifier(filePath, specifier);
          if (!isWithin(CORE_ROOT, target)) {
            violations.push(
              `${path.relative(SRC_ROOT, filePath)} reaches outside core via ${specifier}`,
            );
          }
          if (
            !isWithin(path.join(CORE_ROOT, "build"), filePath) &&
            isWithin(path.join(CORE_ROOT, "build"), target)
          ) {
            violations.push(
              `${path.relative(SRC_ROOT, filePath)} imports build-only core code via ${specifier}`,
            );
          }
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it("routes production MCP-to-core imports through the runtime facade", () => {
    const productionFiles = collectTypeScriptFiles(SRC_ROOT).filter(
      (filePath) =>
        !isWithin(CORE_ROOT, filePath) &&
        !filePath.includes(`${path.sep}__tests__${path.sep}`),
    );
    const violations: string[] = [];

    for (const filePath of productionFiles) {
      for (const specifier of collectModuleSpecifiers(filePath)) {
        if (!specifier.startsWith(".")) continue;
        const target = resolveSourceSpecifier(filePath, specifier);
        if (isWithin(CORE_ROOT, target) && target !== CORE_RUNTIME) {
          violations.push(
            `${path.relative(SRC_ROOT, filePath)} deep-imports ${specifier}`,
          );
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
