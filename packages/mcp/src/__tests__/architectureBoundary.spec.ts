import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { describe, expect, it } from "vitest";

const SRC_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const PACKAGES_ROOT = path.resolve(SRC_ROOT, "..", "..");
const KNOWLEDGE_ROOT = path.join(PACKAGES_ROOT, "knowledge", "src");
const KNOWLEDGE_RUNTIME = path.join(KNOWLEDGE_ROOT, "public.ts");
const CORE_ROOT = path.join(SRC_ROOT, "core");
const CORE_RUNTIME = path.join(CORE_ROOT, "runtime.ts");
const SALT_TOOL_OPERATIONS = path.join(
  SRC_ROOT,
  "server",
  "saltToolOperations.ts",
);

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

function collectRuntimeModuleSpecifiersFromSource(
  sourceText: string,
  filePath = "runtime-boundary-fixture.ts",
): string[] {
  const source = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
  );
  const specifiers: string[] = [];

  function visit(node: ts.Node): void {
    if (
      ts.isImportDeclaration(node) &&
      !node.importClause?.isTypeOnly &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      const bindings = node.importClause?.namedBindings;
      const hasRuntimeBinding =
        !node.importClause ||
        Boolean(node.importClause.name) ||
        (bindings && ts.isNamespaceImport(bindings)) ||
        (bindings &&
          ts.isNamedImports(bindings) &&
          bindings.elements.some((element) => !element.isTypeOnly));
      if (hasRuntimeBinding) specifiers.push(node.moduleSpecifier.text);
    }
    if (
      ts.isExportDeclaration(node) &&
      !node.isTypeOnly &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      const hasRuntimeExport =
        !node.exportClause ||
        ts.isNamespaceExport(node.exportClause) ||
        (ts.isNamedExports(node.exportClause) &&
          node.exportClause.elements.some((element) => !element.isTypeOnly));
      if (hasRuntimeExport) specifiers.push(node.moduleSpecifier.text);
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

function collectRuntimeModuleSpecifiers(filePath: string): string[] {
  return collectRuntimeModuleSpecifiersFromSource(
    fs.readFileSync(filePath, "utf8"),
    filePath,
  );
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
  it.each([
    ['export { value } from "./module.js";', ["./module.js"]],
    [
      'export { type Model, value } from "./module.js";',
      ["./module.js"],
    ],
    ['export * from "./module.js";', ["./module.js"]],
    ['export * as module from "./module.js";', ["./module.js"]],
    ['export type { Model } from "./module.js";', []],
    ['export { type Model } from "./module.js";', []],
    ['export type * from "./module.js";', []],
    ['export {} from "./module.js";', []],
  ])("classifies runtime re-export edges in %s", (source, expected) => {
    expect(collectRuntimeModuleSpecifiersFromSource(source)).toEqual(expected);
  });

  it("limits MCP SDK imports to the frozen adapter and host edge", () => {
    const allowed = new Set(
      [
        "cli.ts",
        "index.ts",
        "server/compactStandardSchema.ts",
        "server/createServer.ts",
        "server/registerResources.ts",
        "server/registerTools.ts",
        "server/responseAdapters.ts",
        "server/toolDefinitions.ts",
      ].map((file) => path.join(SRC_ROOT, ...file.split("/"))),
    );
    const actual = collectTypeScriptFiles(SRC_ROOT).filter(
      (filePath) =>
        !filePath.includes(`${path.sep}__tests__${path.sep}`) &&
        collectModuleSpecifiers(filePath).some((specifier) =>
          specifier.startsWith("@modelcontextprotocol"),
        ),
    );

    expect(actual.sort()).toEqual([...allowed].sort());
  });

  it("keeps the concrete Salt operation runtime closure free of MCP SDK and envelope concepts", () => {
    const pending = [SALT_TOOL_OPERATIONS];
    const visited = new Set<string>();
    const violations: string[] = [];

    while (pending.length > 0) {
      const filePath = pending.pop();
      if (!filePath) continue;
      if (visited.has(filePath)) continue;
      visited.add(filePath);
      const source = fs.readFileSync(filePath, "utf8");
      for (const token of [
        "ContentBlock",
        "ResourceLink",
        "structuredContent",
        "McpServer",
        "StdioServerTransport",
      ]) {
        if (source.includes(token)) {
          violations.push(
            `${path.relative(SRC_ROOT, filePath)} contains ${token}`,
          );
        }
      }
      for (const specifier of collectRuntimeModuleSpecifiers(filePath)) {
        if (specifier.startsWith("@modelcontextprotocol")) {
          violations.push(
            `${path.relative(SRC_ROOT, filePath)} imports ${specifier}`,
          );
        }
        if (!specifier.startsWith(".")) continue;
        const target = resolveSourceSpecifier(filePath, specifier);
        if (isWithin(SRC_ROOT, target)) pending.push(target);
      }
    }

    expect(violations).toEqual([]);
    expect(visited).toContain(
      path.join(CORE_ROOT, "review", "reviewSaltCode.ts"),
    );
    expect(visited).toContain(path.join(CORE_ROOT, "search", "searchSalt.ts"));
  });

  it("keeps the internal core independent from MCP transport and host concerns", () => {
    const violations: string[] = [];
    const forbiddenPackages = [
      "@modelcontextprotocol",
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

  it("keeps core modules and tests from importing the adapter runtime facade", () => {
    const violations: string[] = [];
    for (const filePath of collectTypeScriptFiles(CORE_ROOT)) {
      if (filePath === CORE_RUNTIME) continue;
      for (const specifier of collectModuleSpecifiers(filePath)) {
        if (!specifier.startsWith(".")) continue;
        if (resolveSourceSpecifier(filePath, specifier) === CORE_RUNTIME) {
          violations.push(
            `${path.relative(SRC_ROOT, filePath)} imports the adapter runtime facade via ${specifier}`,
          );
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it("keeps public resource URI projection behind the citation normalizer", () => {
    const allowedFiles = new Set([
      path.join(CORE_ROOT, "catalog", "catalogPublicCitation.ts"),
      path.join(CORE_ROOT, "catalog", "catalogResourceIdentity.ts"),
      path.join(CORE_ROOT, "policy", "projectPolicyResourceIdentity.ts"),
    ]);
    const identityBuilders = [
      "catalogManifestResourceUri",
      "catalogRecordResourceTemplate",
      "catalogRecordResourceUri",
      "projectPolicyResourceTemplate",
      "projectPolicyResourceUri",
    ];
    const violations: string[] = [];

    for (const filePath of collectTypeScriptFiles(SRC_ROOT)) {
      if (
        filePath.includes(`${path.sep}__tests__${path.sep}`) ||
        allowedFiles.has(filePath)
      ) {
        continue;
      }
      const source = fs.readFileSync(filePath, "utf8");
      for (const builder of identityBuilders) {
        if (source.includes(builder)) {
          violations.push(
            `${path.relative(SRC_ROOT, filePath)} bypasses public citation normalization with ${builder}`,
          );
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it("keeps knowledge independent from MCP, CLI, and the MCP SDK", () => {
    const violations: string[] = [];
    const forbiddenPackages = [
      "@modelcontextprotocol",
      "@salt-ds/mcp",
      "@salt-ds/cli",
    ];

    for (const filePath of collectTypeScriptFiles(KNOWLEDGE_ROOT)) {
      if (filePath.includes(`${path.sep}__tests__${path.sep}`)) continue;
      for (const specifier of collectModuleSpecifiers(filePath)) {
        if (
          forbiddenPackages.some(
            (name) => specifier === name || specifier.startsWith(`${name}/`),
          )
        ) {
          violations.push(
            `${path.relative(KNOWLEDGE_ROOT, filePath)} imports ${specifier}`,
          );
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it("allows MCP to import only the knowledge package root", () => {
    const violations: string[] = [];
    for (const filePath of collectTypeScriptFiles(SRC_ROOT)) {
      for (const specifier of collectModuleSpecifiers(filePath)) {
        if (
          specifier.startsWith("@salt-ds/knowledge/") ||
          specifier.includes("packages/knowledge/src")
        ) {
          violations.push(
            `${path.relative(SRC_ROOT, filePath)} imports ${specifier}`,
          );
        }
      }
    }

    expect(violations).toEqual([]);
    expect(
      collectModuleSpecifiers(CORE_RUNTIME).filter(
        (specifier) => specifier === "@salt-ds/knowledge",
      ),
    ).toHaveLength(1);
  });

  it("keeps the knowledge runtime closure away from generator-only dependencies", () => {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(PACKAGES_ROOT, "knowledge", "package.json"), "utf8"),
    ) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const generatorOnlyDependencies = new Set(
      Object.keys(manifest.devDependencies ?? {}).filter(
        (name) => !Object.hasOwn(manifest.dependencies ?? {}, name),
      ),
    );
    const pending = [KNOWLEDGE_RUNTIME];
    const visited = new Set<string>();
    const violations: string[] = [];

    while (pending.length > 0) {
      const filePath = pending.pop();
      if (!filePath || visited.has(filePath)) continue;
      visited.add(filePath);
      for (const specifier of collectRuntimeModuleSpecifiers(filePath)) {
        const dependencyRoot = specifier.startsWith("@")
          ? specifier.split("/").slice(0, 2).join("/")
          : specifier.split("/")[0];
        if (generatorOnlyDependencies.has(dependencyRoot)) {
          violations.push(
            `${path.relative(KNOWLEDGE_ROOT, filePath)} imports ${specifier}`,
          );
        }
        if (!specifier.startsWith(".")) continue;
        const target = resolveSourceSpecifier(filePath, specifier);
        if (isWithin(KNOWLEDGE_ROOT, target)) pending.push(target);
      }
    }

    expect(violations).toEqual([]);
    expect(
      [...visited].some((filePath) =>
        isWithin(path.join(KNOWLEDGE_ROOT, "build"), filePath),
      ),
    ).toBe(false);
  });

  it("prevents production packages from importing another package's source tree", () => {
    const violations: string[] = [];
    for (const [sourceRoot, packageRoot] of [
      [SRC_ROOT, path.dirname(SRC_ROOT)],
      [KNOWLEDGE_ROOT, path.dirname(KNOWLEDGE_ROOT)],
    ]) {
      for (const filePath of collectTypeScriptFiles(sourceRoot)) {
        if (filePath.includes(`${path.sep}__tests__${path.sep}`)) continue;
        for (const specifier of collectModuleSpecifiers(filePath)) {
          if (/^@salt-ds\/[^/]+\/src(?:\/|$)/u.test(specifier)) {
            violations.push(
              `${path.relative(PACKAGES_ROOT, filePath)} imports ${specifier}`,
            );
          }
          if (!specifier.startsWith(".")) continue;
          const target = resolveSourceSpecifier(filePath, specifier);
          if (
            isWithin(PACKAGES_ROOT, target) &&
            !isWithin(packageRoot, target)
          ) {
            violations.push(
              `${path.relative(PACKAGES_ROOT, filePath)} crosses package source via ${specifier}`,
            );
          }
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
