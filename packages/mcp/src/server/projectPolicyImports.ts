import fs from "node:fs/promises";
import path from "node:path";
import { parse } from "@babel/parser";
import * as t from "@babel/types";
import { readBoundedProjectFile } from "../core/runtime.js";
import { loadBoundedTsconfigAliases } from "./projectContext/boundedTsconfig.js";

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
const MAX_INSPECTED_MODULE_BYTES = 128 * 1024;
const MAX_PROJECT_POLICY_IMPORT_TARGETS = 16;
const MAX_PROJECT_POLICY_IMPORT_CONCURRENCY = 1;
const MAX_PROJECT_POLICY_RESOLUTION_ATTEMPTS = 512;
const MAX_PROJECT_POLICY_MODULE_AST_NODES = 25_000;
const MAX_PROJECT_POLICY_MODULE_AST_DEPTH = 128;
const MAX_PROJECT_POLICY_MODULE_STATEMENTS = 4_096;
const MAX_PROJECT_POLICY_AGGREGATE_AST_NODES = 100_000;

type BoundedModuleRead = Awaited<ReturnType<typeof readBoundedProjectFile>>;
type ModuleExportSummary =
  | {
      status: "valid";
      direct: ReadonlySet<string>;
      indirect: ReadonlySet<string>;
      hasExportAll: boolean;
    }
  | { status: "limited" };

// The target and per-module caps also bound the total source read or parsed for one
// policy inspection to 4 MiB. Process smaller batches so the AST expansion of
// several valid modules cannot occur for every declared target at once.
async function validateTargetsInBoundedBatches(
  rootDir: string,
  authorityRoot: string,
  targets: ProjectPolicyImportTargetInput[],
  pathsMatcher: ((specifier: string) => string[]) | null,
): Promise<ProjectPolicyImportTargetDiagnostic[]> {
  const diagnostics: ProjectPolicyImportTargetDiagnostic[] = [];
  const resolutionBudget = {
    remaining: MAX_PROJECT_POLICY_RESOLUTION_ATTEMPTS,
  };
  const astBudget = { remaining: MAX_PROJECT_POLICY_AGGREGATE_AST_NODES };
  const moduleReadCache = new Map<string, Promise<BoundedModuleRead>>();
  const moduleExportCache = new Map<string, Promise<ModuleExportSummary>>();
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
            validateTarget(
              rootDir,
              authorityRoot,
              target,
              pathsMatcher,
              resolutionBudget,
              astBudget,
              moduleReadCache,
              moduleExportCache,
            ),
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
  occurrence_id?: string;
  policy_type_id?: string;
  source_path?: string | null;
  json_pointer?: string;
  slot?:
    | "wrapper_import"
    | "theme_provider_import"
    | "theme_side_effect_import";
  slot_index?: number | null;
}

export type ProjectPolicyImportTargetStatus =
  | "resolved"
  | "missing_module"
  | "missing_export"
  | "unsupported"
  | "not_inspected_limit";

export interface ProjectPolicyImportTargetDiagnostic
  extends ProjectPolicyImportTargetInput {
  status: ProjectPolicyImportTargetStatus;
  resolved_path: string | null;
  reason: string | null;
}

export interface ProjectPolicyImportTargetDiagnostics {
  status: "not_declared" | "verified" | "issues";
  declared_count: number;
  resolved_count: number;
  issue_count: number;
  targets: ProjectPolicyImportTargetDiagnostic[];
  diagnostic_reasons: string[];
  inspection_limitations: string[];
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
  authorityRoot: string,
  candidates: string[],
  kind: ProjectPolicyImportTargetKind,
  resolutionBudget: { remaining: number },
): Promise<{
  path: string | null;
  outsideRoot: boolean;
  candidateLimit: boolean;
}> {
  const absoluteAuthorityRoot = path.resolve(authorityRoot);
  const realRootDir = await fs.realpath(rootDir).catch(() => rootDir);
  if (!isPathInside(absoluteAuthorityRoot, realRootDir)) {
    return { path: null, outsideRoot: true, candidateLimit: false };
  }
  const outsideRoot = false;

  for (const basePath of candidates) {
    const absoluteBasePath = path.resolve(basePath);
    if (!isPathInside(rootDir, absoluteBasePath)) {
      return { path: null, outsideRoot: true, candidateLimit: false };
    }

    for (const candidatePath of moduleFileCandidates(absoluteBasePath, kind)) {
      if (resolutionBudget.remaining <= 0) {
        return { path: null, outsideRoot, candidateLimit: true };
      }
      resolutionBudget.remaining -= 1;
      try {
        const stats = await fs.stat(candidatePath);
        if (!stats.isFile()) {
          continue;
        }

        const realCandidatePath = await fs.realpath(candidatePath);
        if (
          !isPathInside(absoluteAuthorityRoot, realCandidatePath) ||
          !isPathInside(realRootDir, realCandidatePath)
        ) {
          return { path: null, outsideRoot: true, candidateLimit: false };
        }

        return {
          path: realCandidatePath,
          outsideRoot,
          candidateLimit: false,
        };
      } catch {
        // Try the next supported source-file candidate.
      }
    }
  }

  return { path: null, outsideRoot, candidateLimit: false };
}

function getExportedName(specifier: t.ExportSpecifier): string {
  return t.isIdentifier(specifier.exported)
    ? specifier.exported.name
    : specifier.exported.value;
}

function sourceValueExportSummary(
  source: string,
  aggregateBudget: { remaining: number },
): ModuleExportSummary {
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

  if (parsed.program.body.length > MAX_PROJECT_POLICY_MODULE_STATEMENTS) {
    return { status: "limited" };
  }
  let nodeCount = 0;
  const stack: Array<{ node: t.Node; depth: number }> = [
    { node: parsed, depth: 1 },
  ];
  while (stack.length > 0) {
    const current = stack.pop()!;
    nodeCount += 1;
    if (
      nodeCount > MAX_PROJECT_POLICY_MODULE_AST_NODES ||
      nodeCount > aggregateBudget.remaining ||
      current.depth > MAX_PROJECT_POLICY_MODULE_AST_DEPTH
    ) {
      return { status: "limited" };
    }
    for (const key of t.VISITOR_KEYS[current.node.type] ?? []) {
      const value = (current.node as unknown as Record<string, unknown>)[key];
      if (Array.isArray(value)) {
        for (const child of value) {
          if (child && typeof child === "object" && "type" in child) {
            stack.push({ node: child as t.Node, depth: current.depth + 1 });
          }
        }
      } else if (value && typeof value === "object" && "type" in value) {
        stack.push({ node: value as t.Node, depth: current.depth + 1 });
      }
    }
  }
  aggregateBudget.remaining -= nodeCount;

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

  const direct = new Set<string>();
  const indirect = new Set<string>();
  let hasExportAll = false;
  for (const statement of parsed.program.body) {
    if (t.isExportAllDeclaration(statement)) {
      hasExportAll = true;
      continue;
    }
    if (!t.isExportNamedDeclaration(statement)) {
      continue;
    }
    if (statement.exportKind === "type") {
      continue;
    }
    const declaration = statement.declaration;
    if (
      declaration &&
      !(declaration as t.Declaration & { declare?: boolean }).declare &&
      !(t.isTSEnumDeclaration(declaration) && declaration.const)
    ) {
      if (
        (t.isFunctionDeclaration(declaration) ||
          t.isClassDeclaration(declaration) ||
          t.isTSEnumDeclaration(declaration)) &&
        declaration.id
      ) {
        direct.add(declaration.id.name);
      } else if (t.isVariableDeclaration(declaration)) {
        for (const declarator of declaration.declarations) {
          for (const name of Object.keys(
            t.getBindingIdentifiers(declarator.id),
          )) {
            direct.add(name);
          }
        }
      }
    }
    for (const specifier of statement.specifiers) {
      if (!t.isExportSpecifier(specifier) || specifier.exportKind === "type") {
        continue;
      }
      const exportName = getExportedName(specifier);
      if (statement.source) {
        indirect.add(exportName);
        continue;
      }
      const localName = specifier.local.name;
      if (localValueExports.has(localName)) direct.add(exportName);
      else indirect.add(exportName);
    }
  }
  return { status: "valid", direct, indirect, hasExportAll };
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

async function validateTarget(
  rootDir: string,
  authorityRoot: string,
  target: ProjectPolicyImportTargetInput,
  pathsMatcher: ((specifier: string) => string[]) | null,
  resolutionBudget: { remaining: number },
  astBudget: { remaining: number },
  moduleReadCache: Map<string, Promise<BoundedModuleRead>>,
  moduleExportCache: Map<string, Promise<ModuleExportSummary>>,
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
    : (pathsMatcher?.(target.from) ?? []);

  if (possiblePaths.length === 0) {
    return unsupportedDiagnostic(
      target,
      `Project policy declares ${formattedTarget}, but it is not a repo-relative module or a resolvable tsconfig paths alias. Package imports and custom bundler aliases are not inspected.`,
    );
  }

  const resolved = await firstExistingModuleFile(
    rootDir,
    authorityRoot,
    possiblePaths,
    target.kind,
    resolutionBudget,
  );
  if (!resolved.path) {
    if (resolved.candidateLimit) {
      return unsupportedDiagnostic(
        target,
        `Project policy declares ${formattedTarget}, but the aggregate bounded module-resolution attempt limit was reached. Reduce alias breadth or declared import targets before relying on repo-specific guidance.`,
      );
    }
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

  try {
    let moduleRead = moduleReadCache.get(resolved.path);
    if (!moduleRead) {
      moduleRead = readBoundedProjectFile({
        authorityRoot,
        rootDir,
        filePath: resolved.path,
        maxUtf8Bytes: MAX_INSPECTED_MODULE_BYTES,
      });
      moduleReadCache.set(resolved.path, moduleRead);
    }
    const moduleFile = await moduleRead;
    if (moduleFile.status !== "valid") {
      const inspectionFailure =
        moduleFile.status === "invalid" && moduleFile.reason === "oversized"
          ? "the resolved module is too large for bounded static inspection"
          : moduleFile.status === "invalid" &&
              moduleFile.reason === "outside_root"
            ? "the resolved module leaves the authorized project root"
            : moduleFile.status === "invalid" &&
                moduleFile.reason === "not_file"
              ? "the resolved target is not a regular file"
              : moduleFile.status === "invalid" &&
                  moduleFile.reason === "changed_during_inspection"
                ? "the resolved module changed during bounded inspection"
                : moduleFile.status === "invalid" &&
                    moduleFile.reason === "identity_unavailable"
                  ? "the resolved module has no stable filesystem identity for bounded inspection"
                  : "the resolved module could not be read within the bounded inspection policy";
      return unsupportedDiagnostic(
        target,
        `Project policy declares ${formattedTarget}, but ${inspectionFailure}.`,
      );
    }
    if (target.kind === "theme_import") {
      return {
        ...target,
        status: "resolved",
        resolved_path: toPosix(moduleFile.path),
        reason: null,
      };
    }
    if (target.name === null) {
      return unsupportedDiagnostic(
        target,
        `Project policy declares ${formattedTarget}, but a named runtime import target is required.`,
      );
    }
    let exportSummary = moduleExportCache.get(resolved.path);
    if (!exportSummary) {
      exportSummary = Promise.resolve().then(() =>
        sourceValueExportSummary(moduleFile.text, astBudget),
      );
      moduleExportCache.set(resolved.path, exportSummary);
    }
    const summary = await exportSummary;
    if (summary.status === "limited") {
      return {
        ...target,
        status: "not_inspected_limit",
        resolved_path: toPosix(resolved.path),
        reason: `Project policy declares ${formattedTarget}, but the resolved module exceeded the bounded AST node, depth, statement, or aggregate inspection budget.`,
      };
    }
    if (
      summary.status === "valid" &&
      !summary.direct.has(target.name) &&
      (summary.indirect.has(target.name) || summary.hasExportAll)
    ) {
      return {
        ...target,
        status: "unsupported",
        resolved_path: toPosix(resolved.path),
        reason: `Project policy declares ${formattedTarget}, but ${toPosix(resolved.path)} exposes the requested value through an indirect or barrel export that this bounded validator cannot prove. Point policy at the concrete repo-local module with a local named value export.`,
      };
    }
    if (summary.status === "valid" && !summary.direct.has(target.name)) {
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
  suppliedImportConventions?: {
    pathsMatcher: ((specifier: string) => string[]) | null;
    aliasPatterns: string[];
  },
  authorityRoot: string = rootDir,
): Promise<ProjectPolicyImportTargetDiagnostics> {
  const inspectedTargets = targets.slice(0, MAX_PROJECT_POLICY_IMPORT_TARGETS);
  const overflowReason =
    targets.length > MAX_PROJECT_POLICY_IMPORT_TARGETS
      ? `Project policy declares ${targets.length} import targets, exceeding the bounded inspection limit of ${MAX_PROJECT_POLICY_IMPORT_TARGETS}. Reduce or split the declared policy before relying on repo-specific guidance.`
      : null;
  let importConventions = suppliedImportConventions;
  let inspectionLimitations: string[] = [];
  if (!importConventions) {
    const tsconfig = await loadBoundedTsconfigAliases(rootDir, authorityRoot);
    importConventions = {
      pathsMatcher: tsconfig.pathsMatcher,
      aliasPatterns: tsconfig.aliasPatterns,
    };
    inspectionLimitations = tsconfig.limitations;
  }
  importConventions ??= { pathsMatcher: null, aliasPatterns: [] };
  const diagnostics = await validateTargetsInBoundedBatches(
    rootDir,
    authorityRoot,
    inspectedTargets,
    importConventions.pathsMatcher,
  );
  const overflowDiagnostics: ProjectPolicyImportTargetDiagnostic[] = targets
    .slice(MAX_PROJECT_POLICY_IMPORT_TARGETS)
    .map((target) => ({
      ...target,
      status: "not_inspected_limit",
      resolved_path: null,
      reason: overflowReason,
    }));
  const allDiagnostics = [...diagnostics, ...overflowDiagnostics];
  const blockingReasons = [
    ...allDiagnostics.flatMap((diagnostic) =>
      diagnostic.status !== "resolved" && diagnostic.reason
        ? [diagnostic.reason]
        : [],
    ),
  ];

  return {
    status:
      allDiagnostics.length === 0
        ? "not_declared"
        : blockingReasons.length > 0
          ? "issues"
          : "verified",
    declared_count: targets.length,
    resolved_count: allDiagnostics.filter(
      (diagnostic) => diagnostic.status === "resolved",
    ).length,
    issue_count: allDiagnostics.filter(
      (diagnostic) => diagnostic.status !== "resolved",
    ).length,
    targets: allDiagnostics,
    diagnostic_reasons: [...new Set(blockingReasons)],
    inspection_limitations: inspectionLimitations,
  };
}
