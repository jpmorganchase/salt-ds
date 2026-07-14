import fs from "node:fs/promises";
import path from "node:path";
import { parse } from "@babel/parser";
import * as t from "@babel/types";
import { createPathsMatcher, getTsconfig } from "get-tsconfig";

const RUNTIME_MODULE_EXTENSIONS = [
  ".ts",
  ".tsx",
  ".mts",
  ".cts",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
] as const;
const THEME_IMPORT_EXTENSIONS = [
  ...RUNTIME_MODULE_EXTENSIONS,
  ".css",
  ".scss",
  ".sass",
  ".less",
] as const;
const MAX_INSPECTED_MODULE_BYTES = 256 * 1024;
const MAX_PROJECT_POLICY_IMPORT_TARGETS = 16;
const MAX_PROJECT_POLICY_IMPORT_CONCURRENCY = 4;

// The target and per-module caps also bound the total source parsed for one
// policy inspection to 4 MiB. Process smaller batches so the AST expansion of
// several valid modules cannot occur for every declared target at once.
async function validateTargetsInBoundedBatches(
  rootDir: string,
  targets: ProjectPolicyImportTargetInput[],
  pathsMatcher: ((specifier: string) => string[]) | null,
  aliasPatterns: string[],
): Promise<ProjectPolicyImportTargetDiagnostic[]> {
  const diagnostics: ProjectPolicyImportTargetDiagnostic[] = [];
  for (
    let offset = 0;
    offset < targets.length;
    offset += MAX_PROJECT_POLICY_IMPORT_CONCURRENCY
  ) {
    diagnostics.push(
      ...(await Promise.all(
        targets
          .slice(offset, offset + MAX_PROJECT_POLICY_IMPORT_CONCURRENCY)
          .map((target) =>
            validateTarget(rootDir, target, pathsMatcher, aliasPatterns),
          ),
      )),
    );
  }
  return diagnostics;
}

export type ProjectPolicyImportTargetKind =
  | "approved_wrapper"
  | "theme_provider"
  | "theme_import";

export interface ProjectPolicyImportTargetInput {
  kind: ProjectPolicyImportTargetKind;
  owner: string;
  from: string;
  name: string | null;
}

export type ProjectPolicyImportTargetStatus =
  | "resolved"
  | "missing_module"
  | "missing_export"
  | "unsupported";

export interface ProjectPolicyImportTargetDiagnostic
  extends ProjectPolicyImportTargetInput {
  status: ProjectPolicyImportTargetStatus;
  resolved_path: string | null;
  reason: string | null;
}

export interface ProjectPolicyImportTargetDiagnostics {
  status: "not_declared" | "ready" | "blocked";
  declared_count: number;
  resolved_count: number;
  blocking_count: number;
  targets: ProjectPolicyImportTargetDiagnostic[];
  blocking_reasons: string[];
}

function toPosix(inputPath: string): string {
  return inputPath.split(path.sep).join("/");
}

function isPathInside(rootDir: string, candidatePath: string): boolean {
  const relativePath = path.relative(rootDir, candidatePath);
  return (
    relativePath === "" ||
    (!relativePath.startsWith(`..${path.sep}`) &&
      relativePath !== ".." &&
      !path.isAbsolute(relativePath))
  );
}

function moduleFileCandidates(
  basePath: string,
  kind: ProjectPolicyImportTargetKind,
): string[] {
  const supportedExtensions =
    kind === "theme_import"
      ? THEME_IMPORT_EXTENSIONS
      : RUNTIME_MODULE_EXTENSIONS;
  const extension = path.extname(basePath);

  if ((supportedExtensions as readonly string[]).includes(extension)) {
    return [basePath];
  }

  if (extension.length > 0) {
    return [];
  }

  return [
    ...supportedExtensions.map((extension) => `${basePath}${extension}`),
    ...supportedExtensions.map((extension) =>
      path.join(basePath, `index${extension}`),
    ),
  ];
}

async function firstExistingModuleFile(
  rootDir: string,
  candidates: string[],
  kind: ProjectPolicyImportTargetKind,
): Promise<{ path: string | null; outsideRoot: boolean }> {
  const realRootDir = await fs.realpath(rootDir).catch(() => rootDir);
  let outsideRoot = false;

  for (const basePath of candidates) {
    const absoluteBasePath = path.resolve(basePath);
    if (!isPathInside(rootDir, absoluteBasePath)) {
      outsideRoot = true;
      continue;
    }

    for (const candidatePath of moduleFileCandidates(absoluteBasePath, kind)) {
      try {
        const stats = await fs.stat(candidatePath);
        if (!stats.isFile()) {
          continue;
        }

        const realCandidatePath = await fs.realpath(candidatePath);
        if (!isPathInside(realRootDir, realCandidatePath)) {
          outsideRoot = true;
          continue;
        }

        return { path: realCandidatePath, outsideRoot };
      } catch {
        // Try the next supported source-file candidate.
      }
    }
  }

  return { path: null, outsideRoot };
}

function getExportedName(specifier: t.ExportSpecifier): string {
  return t.isIdentifier(specifier.exported)
    ? specifier.exported.name
    : specifier.exported.value;
}

function declarationExportsName(
  declaration: t.Declaration,
  exportName: string,
): boolean {
  if ((declaration as t.Declaration & { declare?: boolean }).declare) {
    return false;
  }

  if (t.isTSEnumDeclaration(declaration) && declaration.const) {
    return false;
  }

  if (
    t.isFunctionDeclaration(declaration) ||
    t.isClassDeclaration(declaration) ||
    t.isTSEnumDeclaration(declaration)
  ) {
    return declaration.id?.name === exportName;
  }

  if (t.isVariableDeclaration(declaration)) {
    return declaration.declarations.some((declarator) =>
      Object.hasOwn(t.getBindingIdentifiers(declarator.id), exportName),
    );
  }

  return false;
}

function sourceDeclaresNamedValueExport(
  source: string,
  exportName: string,
): "resolved" | "indirect_export" | "missing" {
  const parsed = parse(source, {
    sourceType: "unambiguous",
    plugins: [
      "jsx",
      "typescript",
      "classProperties",
      "classPrivateProperties",
      "classPrivateMethods",
      "decorators-legacy",
    ],
  });

  const localValueExports = new Set<string>();
  for (const statement of parsed.program.body) {
    const declaration = t.isExportNamedDeclaration(statement)
      ? statement.declaration
      : t.isDeclaration(statement)
        ? statement
        : null;
    if (!declaration) continue;

    if ((declaration as t.Declaration & { declare?: boolean }).declare) {
      continue;
    }

    if (t.isTSEnumDeclaration(declaration) && declaration.const) {
      continue;
    }

    if (
      t.isFunctionDeclaration(declaration) ||
      t.isClassDeclaration(declaration) ||
      t.isTSEnumDeclaration(declaration)
    ) {
      if (declaration.id) localValueExports.add(declaration.id.name);
      continue;
    }
    if (t.isVariableDeclaration(declaration)) {
      for (const declarator of declaration.declarations) {
        for (const name of Object.keys(
          t.getBindingIdentifiers(declarator.id),
        )) {
          localValueExports.add(name);
        }
      }
    }
  }

  let indirectExport = false;
  const resolved = parsed.program.body.some((statement) => {
    if (!t.isExportNamedDeclaration(statement)) {
      return false;
    }
    if (statement.exportKind === "type") {
      return false;
    }
    if (
      statement.declaration &&
      declarationExportsName(statement.declaration, exportName)
    ) {
      return true;
    }

    return statement.specifiers.some((specifier) => {
      if (
        !t.isExportSpecifier(specifier) ||
        specifier.exportKind === "type" ||
        getExportedName(specifier) !== exportName
      ) {
        return false;
      }

      if (statement.source) {
        indirectExport = true;
        return false;
      }
      const localName = specifier.local.name;
      if (localValueExports.has(localName)) return true;
      indirectExport = true;
      return false;
    });
  });

  if (resolved) {
    return "resolved";
  }

  return indirectExport ||
    parsed.program.body.some((statement) => t.isExportAllDeclaration(statement))
    ? "indirect_export"
    : "missing";
}

function formatTarget(target: ProjectPolicyImportTargetInput): string {
  if (target.kind === "theme_import") {
    return `theme side-effect import ${target.from} for ${target.owner}`;
  }

  const label =
    target.kind === "approved_wrapper"
      ? `approved wrapper ${target.owner}`
      : `theme provider ${target.owner}`;
  return `${label} import ${target.name ?? "<missing-name>"} from ${target.from}`;
}

function unsupportedDiagnostic(
  target: ProjectPolicyImportTargetInput,
  reason: string,
): ProjectPolicyImportTargetDiagnostic {
  return {
    ...target,
    status: "unsupported",
    resolved_path: null,
    reason,
  };
}

function matchesTsconfigPathAlias(
  specifier: string,
  aliasPatterns: string[],
): boolean {
  return aliasPatterns.some((pattern) => {
    const wildcardIndex = pattern.indexOf("*");
    if (wildcardIndex < 0) {
      return pattern === specifier;
    }

    return (
      specifier.startsWith(pattern.slice(0, wildcardIndex)) &&
      specifier.endsWith(pattern.slice(wildcardIndex + 1))
    );
  });
}

async function validateTarget(
  rootDir: string,
  target: ProjectPolicyImportTargetInput,
  pathsMatcher: ((specifier: string) => string[]) | null,
  aliasPatterns: string[],
): Promise<ProjectPolicyImportTargetDiagnostic> {
  const formattedTarget = formatTarget(target);

  if (target.name === "default") {
    return unsupportedDiagnostic(
      target,
      `Project policy declares ${formattedTarget}, but default-export validation is not supported. Declare an exact named export before relying on this repo-specific import.`,
    );
  }

  if (path.isAbsolute(target.from)) {
    return unsupportedDiagnostic(
      target,
      `Project policy declares ${formattedTarget}, but absolute import paths are not supported. Use a repo-relative path or a tsconfig paths alias.`,
    );
  }

  const possiblePaths = target.from.startsWith(".")
    ? [path.resolve(rootDir, target.from)]
    : matchesTsconfigPathAlias(target.from, aliasPatterns)
      ? (pathsMatcher?.(target.from) ?? [])
      : [];

  if (possiblePaths.length === 0) {
    return unsupportedDiagnostic(
      target,
      `Project policy declares ${formattedTarget}, but it is not a repo-relative module or a resolvable tsconfig paths alias. Package imports and custom bundler aliases are not inspected.`,
    );
  }

  const resolved = await firstExistingModuleFile(
    rootDir,
    possiblePaths,
    target.kind,
  );
  if (!resolved.path) {
    if (resolved.outsideRoot) {
      return unsupportedDiagnostic(
        target,
        `Project policy declares ${formattedTarget}, but its resolved path leaves the declared root_dir. Only repo-local modules are inspected.`,
      );
    }
    return {
      ...target,
      status: "missing_module",
      resolved_path: null,
      reason: `Project policy declares ${formattedTarget}, but no supported repo-local module exists at the resolved path. Add the module or correct the import before relying on repo-specific implementation guidance.`,
    };
  }

  if (/\.d\.(?:ts|mts|cts)$/i.test(resolved.path)) {
    return unsupportedDiagnostic(
      target,
      `Project policy declares ${formattedTarget}, but declaration files do not prove a runtime import target. Point policy at the concrete repo-local runtime module.`,
    );
  }

  if (target.kind === "theme_import") {
    return {
      ...target,
      status: "resolved",
      resolved_path: toPosix(resolved.path),
      reason: null,
    };
  }

  if (target.name === null) {
    return unsupportedDiagnostic(
      target,
      `Project policy declares ${formattedTarget}, but a named runtime import target is required.`,
    );
  }

  try {
    const stats = await fs.stat(resolved.path);
    if (stats.size > MAX_INSPECTED_MODULE_BYTES) {
      return unsupportedDiagnostic(
        target,
        `Project policy declares ${formattedTarget}, but the resolved module is too large for bounded static inspection.`,
      );
    }

    const source = await fs.readFile(resolved.path, "utf8");
    const exportInspection = sourceDeclaresNamedValueExport(
      source,
      target.name,
    );
    if (exportInspection === "indirect_export") {
      return {
        ...target,
        status: "unsupported",
        resolved_path: toPosix(resolved.path),
        reason: `Project policy declares ${formattedTarget}, but ${toPosix(resolved.path)} exposes the requested value through an indirect or barrel export that this bounded validator cannot prove. Point policy at the concrete repo-local module with a local named value export.`,
      };
    }
    if (exportInspection === "missing") {
      return {
        ...target,
        status: "missing_export",
        resolved_path: toPosix(resolved.path),
        reason: `Project policy declares ${formattedTarget}, but ${toPosix(resolved.path)} does not declare the named value export ${target.name}. Correct the export or policy metadata before relying on repo-specific implementation guidance.`,
      };
    }
  } catch {
    return unsupportedDiagnostic(
      target,
      `Project policy declares ${formattedTarget}, but the resolved module could not be parsed for a named ESM value export.`,
    );
  }

  return {
    ...target,
    status: "resolved",
    resolved_path: toPosix(resolved.path),
    reason: null,
  };
}

export async function validateProjectPolicyImportTargets(
  rootDir: string,
  targets: ProjectPolicyImportTargetInput[],
): Promise<ProjectPolicyImportTargetDiagnostics> {
  const inspectedTargets = targets.slice(0, MAX_PROJECT_POLICY_IMPORT_TARGETS);
  const overflowReason =
    targets.length > MAX_PROJECT_POLICY_IMPORT_TARGETS
      ? `Project policy declares ${targets.length} import targets, exceeding the bounded inspection limit of ${MAX_PROJECT_POLICY_IMPORT_TARGETS}. Reduce or split the declared policy before relying on repo-specific guidance.`
      : null;
  let pathsMatcher: ((specifier: string) => string[]) | null = null;
  let aliasPatterns: string[] = [];
  try {
    const tsconfig = getTsconfig(rootDir);
    pathsMatcher = tsconfig ? createPathsMatcher(tsconfig) : null;
    aliasPatterns = Object.keys(tsconfig?.config.compilerOptions?.paths ?? {});
  } catch {
    // Relative repo-local imports remain inspectable when tsconfig is invalid.
  }
  const diagnostics = await validateTargetsInBoundedBatches(
    rootDir,
    inspectedTargets,
    pathsMatcher,
    aliasPatterns,
  );
  const blockingReasons = [
    ...diagnostics.flatMap((diagnostic) =>
      diagnostic.status !== "resolved" && diagnostic.reason
        ? [diagnostic.reason]
        : [],
    ),
    ...(overflowReason ? [overflowReason] : []),
  ];

  return {
    status:
      diagnostics.length === 0
        ? "not_declared"
        : blockingReasons.length > 0
          ? "blocked"
          : "ready",
    declared_count: targets.length,
    resolved_count: diagnostics.filter(
      (diagnostic) => diagnostic.status === "resolved",
    ).length,
    blocking_count: blockingReasons.length,
    targets: diagnostics,
    blocking_reasons: [...new Set(blockingReasons)],
  };
}
