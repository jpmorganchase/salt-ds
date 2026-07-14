import fs from "node:fs/promises";
import path from "node:path";
import ts from "typescript";
import { loadRegistry, type SaltRegistry } from "../core/runtime.js";

export type EvidenceSprintConditionId =
  | "closed_book"
  | "docs_context_dump"
  | "mcp_assisted";

export interface EvidenceSprintManifest {
  sprint_id: string;
  version: number;
  evidence_provenance: "synthetic_scorer_regression";
  conditions: Array<{
    id: EvidenceSprintConditionId;
    label: string;
    description: string;
  }>;
  tasks: EvidenceSprintTask[];
}

export interface EvidenceSprintTask {
  id: string;
  title: string;
  workflow: "create" | "review" | "migrate";
  prompt: string;
  capability_tags: string[];
  practical_gates: string[];
  expectations: {
    required_imports?: Array<{
      package: string;
      names: string[];
    }>;
    required_any_of?: Array<{
      package: string;
      names: string[];
    }>;
    required_ancestors?: Array<{
      child: string;
      ancestor: string;
      rule_id: string;
      required?: boolean;
    }>;
    banned_patterns?: EvidenceSprintBannedPattern[];
    unresolved_probe_names?: string[];
  };
  conditions: Record<
    EvidenceSprintConditionId,
    {
      artifact: string;
      contract_history?: string;
      notes?: string[];
    }
  >;
}

type EvidenceSprintBannedPattern =
  | "fake_href"
  | "native_table"
  | "nested_card"
  | "deprecated_text_variant";

interface WorkflowContractShape {
  contract?: unknown;
  status?: unknown;
  action?: unknown;
  safety?: unknown;
  evidence?: unknown;
}

interface ContractHistory {
  reference_results?: Array<{
    name: string;
    status: "found" | "not_found" | "unresolved";
  }>;
  workflow_calls?: Array<{
    tool?: unknown;
    args?: {
      resolved_entities?: unknown;
    };
    contract?: unknown;
  }>;
}

interface ApprovedWrapper {
  name: string;
  wraps: string;
  import: {
    from: string;
    name: string;
  };
}

interface ParsedImport {
  module_name: string;
  imported_name: string;
  local_name: string;
  kind: "default" | "named";
}

export interface EvidenceSprintFinding {
  code: string;
  severity: "error" | "warning";
  message: string;
  suggested_fix: string;
}

export interface EvidenceSprintCriterionResult {
  id:
    | "artifact_compiles"
    | "real_salt_imports"
    | "required_salt_surface_present"
    | "composition_valid"
    | "unresolved_names_rejected"
    | "implement_gate_honest"
    | "review_findings_actionable"
    | "practical_gate_labels_declared";
  status: "passed" | "failed" | "not_applicable";
  passed: boolean | null;
  scored: boolean;
  summary: string;
  findings: EvidenceSprintFinding[];
}

export interface EvidenceSprintArtifactQualityResult {
  score: number;
  passed: boolean;
  compile_gate_passed: boolean;
  criteria: EvidenceSprintCriterionResult[];
}

export interface EvidenceSprintWorkflowIntegrityResult {
  applicable: boolean;
  passed: boolean | null;
  criteria: EvidenceSprintCriterionResult[];
}

export interface EvidenceSprintConditionResult {
  condition_id: EvidenceSprintConditionId;
  artifact_path: string;
  contract_history_path: string | null;
  /** Artifact-quality score used for cross-condition comparison. */
  score: number;
  /** Whether every artifact-quality criterion passed. */
  passed: boolean;
  artifact_quality: EvidenceSprintArtifactQualityResult;
  workflow_integrity: EvidenceSprintWorkflowIntegrityResult;
  diagnostics: EvidenceSprintCriterionResult[];
  findings: EvidenceSprintFinding[];
}

export interface EvidenceSprintTaskResult {
  id: string;
  title: string;
  workflow: EvidenceSprintTask["workflow"];
  prompt: string;
  capability_tags: string[];
  practical_gates: string[];
  conditions: EvidenceSprintConditionResult[];
  comparison: {
    score_basis: "artifact_quality";
    mcp_score: number;
    best_baseline_score: number;
    score_delta: number;
    mcp_outperformed_baselines: boolean;
    mcp_matched_or_outperformed_baselines: boolean;
  };
}

export interface EvidenceSprintReport {
  generated_at: string;
  sprint_id: string;
  version: number;
  evidence_provenance: "synthetic_scorer_regression";
  valid_as_product_comparison: false;
  repo_root: string;
  fixture_dir: string;
  passed: boolean;
  tasks: EvidenceSprintTaskResult[];
  scorecard: {
    score_basis: "artifact_quality";
    task_count: number;
    condition_count: number;
    condition_scores: Record<
      EvidenceSprintConditionId,
      {
        average_score: number;
        passed: number;
        failed: number;
      }
    >;
    workflow_integrity: Record<
      EvidenceSprintConditionId,
      {
        applicable: number;
        passed: number;
        failed: number;
        not_applicable: number;
      }
    >;
    comparison: {
      outperformed: number;
      matched: number;
      regressed: number;
    };
  };
}

interface ParsedSaltImport {
  package_name: string;
  imported_name: string;
}

export type SaltExportIndex = Map<string, Set<string>>;

const CONDITION_IDS: EvidenceSprintConditionId[] = [
  "closed_book",
  "docs_context_dump",
  "mcp_assisted",
];

function normalizeName(value: string): string {
  return value.trim().toLowerCase();
}

function averageScore(total: number, count: number): number {
  return count > 0 ? Number((total / count).toFixed(2)) : 0;
}

function getExportSet(
  exportIndex: SaltExportIndex,
  packageName: string,
): Set<string> {
  const existing = exportIndex.get(packageName);
  if (existing) {
    return existing;
  }

  const next = new Set<string>();
  exportIndex.set(packageName, next);
  return next;
}

export function buildSaltExportIndex(registry: SaltRegistry): SaltExportIndex {
  const exportIndex: SaltExportIndex = new Map();

  for (const component of registry.components) {
    const packageName = component.package.name;
    const exports = getExportSet(exportIndex, packageName);
    if (component.source.export_name) {
      exports.add(component.source.export_name);
    }
    for (const subComponent of component.sub_components ?? []) {
      exports.add(subComponent.export_name);
    }
  }

  for (const icon of registry.icons) {
    if (icon.source.export_name) {
      getExportSet(exportIndex, icon.package.name).add(icon.source.export_name);
    }
  }

  for (const countrySymbol of registry.country_symbols) {
    const exports = getExportSet(exportIndex, countrySymbol.package.name);
    exports.add(countrySymbol.variants.circle.export_name);
    exports.add(countrySymbol.variants.sharp.export_name);
  }

  // Some canonical package exports (for example H1, BorderItem, and GridItem)
  // are evidenced by generated examples rather than top-level component
  // records. Include them in this diagnostic census without making the census
  // authoritative for artifact scoring.
  for (const example of registry.examples) {
    for (const saltImport of parseSaltNamedImports(example.code)) {
      getExportSet(exportIndex, saltImport.package_name).add(
        saltImport.imported_name,
      );
    }
  }

  return exportIndex;
}

function parseSaltNamedImports(code: string): ParsedSaltImport[] {
  const imports: ParsedSaltImport[] = [];
  const sourceFile = ts.createSourceFile(
    "evidence-sprint-artifact.tsx",
    code,
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TSX,
  );

  for (const statement of sourceFile.statements) {
    if (
      !ts.isImportDeclaration(statement) ||
      !ts.isStringLiteralLike(statement.moduleSpecifier)
    ) {
      continue;
    }

    const packageName = statement.moduleSpecifier.text;
    const namedBindings = statement.importClause?.namedBindings;
    if (
      !packageName.startsWith("@salt-ds/") ||
      !namedBindings ||
      !ts.isNamedImports(namedBindings)
    ) {
      continue;
    }

    for (const specifier of namedBindings.elements) {
      imports.push({
        package_name: packageName,
        imported_name: (specifier.propertyName ?? specifier.name).text,
      });
    }
  }

  return imports;
}

function parseImports(code: string): ParsedImport[] {
  const imports: ParsedImport[] = [];
  const sourceFile = ts.createSourceFile(
    "evidence-sprint-artifact.tsx",
    code,
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TSX,
  );

  for (const statement of sourceFile.statements) {
    if (
      !ts.isImportDeclaration(statement) ||
      !ts.isStringLiteralLike(statement.moduleSpecifier)
    ) {
      continue;
    }

    const importClause = statement.importClause;
    if (!importClause) {
      continue;
    }

    if (importClause.name) {
      imports.push({
        module_name: statement.moduleSpecifier.text,
        imported_name: "default",
        local_name: importClause.name.text,
        kind: "default",
      });
    }

    if (
      importClause.namedBindings &&
      ts.isNamedImports(importClause.namedBindings)
    ) {
      for (const specifier of importClause.namedBindings.elements) {
        imports.push({
          module_name: statement.moduleSpecifier.text,
          imported_name: (specifier.propertyName ?? specifier.name).text,
          local_name: specifier.name.text,
          kind: "named",
        });
      }
    }
  }

  return imports;
}

function collectOutputBindingUses(code: string): Set<string> {
  const usedBindings = new Set<string>();
  const sourceFile = ts.createSourceFile(
    "evidence-sprint-artifact.tsx",
    code,
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TSX,
  );

  const collectIdentifiers = (node: ts.Node): void => {
    if (ts.isIdentifier(node)) {
      usedBindings.add(node.text);
    }
    ts.forEachChild(node, collectIdentifiers);
  };

  const collectReturnedExpressions = (node: ts.Node): void => {
    if (ts.isReturnStatement(node) && node.expression) {
      collectIdentifiers(node.expression);
      return;
    }
    ts.forEachChild(node, collectReturnedExpressions);
  };

  const isExported = (node: ts.Node): boolean =>
    ts
      .getModifiers(node as ts.HasModifiers)
      ?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) ??
    false;

  for (const statement of sourceFile.statements) {
    if (ts.isFunctionDeclaration(statement) && isExported(statement)) {
      if (statement.body) collectReturnedExpressions(statement.body);
      continue;
    }
    if (ts.isVariableStatement(statement) && isExported(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        const initializer = declaration.initializer;
        if (!initializer) continue;
        if (
          (ts.isArrowFunction(initializer) ||
            ts.isFunctionExpression(initializer)) &&
          ts.isBlock(initializer.body)
        ) {
          collectReturnedExpressions(initializer.body);
        } else if (ts.isArrowFunction(initializer)) {
          collectIdentifiers(initializer.body);
        } else {
          collectIdentifiers(initializer);
        }
      }
      continue;
    }
    if (ts.isExportAssignment(statement)) {
      collectIdentifiers(statement.expression);
    }
  }
  return usedBindings;
}

function normalizeFsPath(value: string): string {
  const normalized = path.resolve(value);
  return process.platform === "win32" ? normalized.toLowerCase() : normalized;
}

function isMissingFileError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ENOENT"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    if (isMissingFileError(error)) {
      return false;
    }
    throw error;
  }
}

async function readProtocolRootDir(fixtureDir: string): Promise<string | null> {
  const protocolPath = path.join(fixtureDir, "protocol.json");
  let raw: string;
  try {
    raw = await fs.readFile(protocolPath, "utf8");
  } catch (error) {
    if (isMissingFileError(error)) {
      return null;
    }
    throw error;
  }

  const protocol = JSON.parse(raw) as unknown;
  if (!isRecord(protocol) || typeof protocol.root_dir !== "string") {
    return null;
  }

  const rootDir = protocol.root_dir.trim();
  if (rootDir.length === 0) {
    return null;
  }

  return path.resolve(fixtureDir, rootDir);
}

async function readApprovedWrappers(
  rootDir: string | null,
): Promise<ApprovedWrapper[]> {
  if (!rootDir) {
    return [];
  }

  const teamConfigPath = path.join(rootDir, ".salt", "team.json");
  let raw: string;
  try {
    raw = await fs.readFile(teamConfigPath, "utf8");
  } catch (error) {
    if (isMissingFileError(error)) {
      return [];
    }
    throw error;
  }

  const teamConfig = JSON.parse(raw) as unknown;
  if (!isRecord(teamConfig) || !Array.isArray(teamConfig.approved_wrappers)) {
    return [];
  }

  return teamConfig.approved_wrappers.flatMap((value): ApprovedWrapper[] => {
    if (
      !isRecord(value) ||
      typeof value.name !== "string" ||
      typeof value.wraps !== "string" ||
      !isRecord(value.import) ||
      typeof value.import.from !== "string" ||
      typeof value.import.name !== "string"
    ) {
      return [];
    }

    const wrapper = {
      name: value.name.trim(),
      wraps: value.wraps.trim(),
      import: {
        from: value.import.from.trim(),
        name: value.import.name.trim(),
      },
    };
    return wrapper.name &&
      wrapper.wraps &&
      wrapper.import.from &&
      wrapper.import.name
      ? [wrapper]
      : [];
  });
}

async function readArtifactCode(
  artifactPath: string,
): Promise<{ code: string; missing: boolean }> {
  try {
    return { code: await fs.readFile(artifactPath, "utf8"), missing: false };
  } catch (error) {
    if (isMissingFileError(error)) {
      return { code: "", missing: true };
    }
    throw error;
  }
}

async function buildCompileFindings(input: {
  manifest: EvidenceSprintManifest;
  fixtureDir: string;
  repoRoot: string;
  protocolRootDir: string | null;
}): Promise<Map<string, EvidenceSprintFinding[]>> {
  const artifactPaths = [
    ...new Set(
      input.manifest.tasks.flatMap((task) =>
        CONDITION_IDS.map((conditionId) =>
          path.resolve(input.fixtureDir, task.conditions[conditionId].artifact),
        ),
      ),
    ),
  ];
  const artifacts = await Promise.all(
    artifactPaths.map(async (artifactPath) => ({
      artifactPath,
      ...(await readArtifactCode(artifactPath)),
      virtualPath: `${artifactPath}.tsx`,
    })),
  );
  const virtualSources = new Map(
    artifacts.map((artifact) => [
      normalizeFsPath(artifact.virtualPath),
      artifact,
    ]),
  );
  const consumerTsconfigPath = input.protocolRootDir
    ? path.join(input.protocolRootDir, "tsconfig.json")
    : null;
  const useConsumerConfig =
    consumerTsconfigPath !== null && (await pathExists(consumerTsconfigPath));
  const compilerRoot = useConsumerConfig
    ? (input.protocolRootDir ?? input.repoRoot)
    : input.repoRoot;
  const tsconfigPath = useConsumerConfig
    ? (consumerTsconfigPath ?? path.join(input.repoRoot, "tsconfig.json"))
    : path.join(input.repoRoot, "tsconfig.json");
  const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
  if (configFile.error) {
    throw new Error(
      `Unable to read ${tsconfigPath}: ${ts.flattenDiagnosticMessageText(configFile.error.messageText, " ")}`,
    );
  }
  const parsedConfig = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    compilerRoot,
    {
      noEmit: true,
      skipLibCheck: true,
    },
    tsconfigPath,
  );
  if (parsedConfig.errors.length > 0) {
    throw new Error(
      `Unable to parse ${tsconfigPath}: ${parsedConfig.errors
        .map((diagnostic) =>
          ts.flattenDiagnosticMessageText(diagnostic.messageText, " "),
        )
        .join("; ")}`,
    );
  }

  const compilerHost = ts.createCompilerHost(parsedConfig.options);
  const defaultGetSourceFile = compilerHost.getSourceFile.bind(compilerHost);
  compilerHost.fileExists = (fileName) =>
    virtualSources.has(normalizeFsPath(fileName)) ||
    ts.sys.fileExists(fileName);
  compilerHost.readFile = (fileName) =>
    virtualSources.get(normalizeFsPath(fileName))?.code ??
    ts.sys.readFile(fileName);
  compilerHost.getCurrentDirectory = () => compilerRoot;
  compilerHost.getSourceFile = (
    fileName,
    languageVersion,
    onError,
    shouldCreateNewSourceFile,
  ) => {
    const artifact = virtualSources.get(normalizeFsPath(fileName));
    if (!artifact) {
      return defaultGetSourceFile(
        fileName,
        languageVersion,
        onError,
        shouldCreateNewSourceFile,
      );
    }
    return ts.createSourceFile(
      fileName,
      artifact.code,
      languageVersion,
      true,
      ts.ScriptKind.TSX,
    );
  };

  const declarationRoots = useConsumerConfig
    ? parsedConfig.fileNames.filter((fileName) =>
        /\.d\.[cm]?ts$/i.test(fileName),
      )
    : [];
  const program = ts.createProgram({
    rootNames: [
      ...new Set([
        ...artifacts.map((artifact) => artifact.virtualPath),
        ...declarationRoots,
      ]),
    ],
    options: parsedConfig.options,
    host: compilerHost,
  });
  const findings = new Map<string, EvidenceSprintFinding[]>();

  for (const artifact of artifacts) {
    if (artifact.missing) {
      findings.set(normalizeFsPath(artifact.artifactPath), [
        {
          code: "compile.missing-artifact",
          severity: "error",
          message: `No generated artifact exists at ${path.relative(input.repoRoot, artifact.artifactPath)}.`,
          suggested_fix:
            "Record the blocked workflow state and generate an artifact only after the implementation gate permits it.",
        },
      ]);
      continue;
    }
    const sourceFile = program.getSourceFile(artifact.virtualPath);
    const diagnostics = sourceFile
      ? ts
          .getPreEmitDiagnostics(program, sourceFile)
          .filter(
            (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error,
          )
      : [];
    findings.set(
      normalizeFsPath(artifact.artifactPath),
      diagnostics.map((diagnostic) => {
        const position =
          diagnostic.file && diagnostic.start !== undefined
            ? diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start)
            : null;
        const location = position
          ? `${path.relative(input.repoRoot, artifact.artifactPath)}:${position.line + 1}:${position.character + 1}`
          : path.relative(input.repoRoot, artifact.artifactPath);
        return {
          code: "compile.typescript-error",
          severity: "error",
          message: `TS${diagnostic.code} at ${location}: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, " ")}`,
          suggested_fix:
            "Update the artifact to compile against the repo tsconfig and current Salt component APIs before comparing its quality.",
        };
      }),
    );
  }

  return findings;
}

export function hasAncestorForEveryChild(
  code: string,
  child: string,
  ancestor: string,
  required = false,
): boolean {
  const tagRegex = /<\/?([A-Z][A-Za-z0-9.]*)\b[^>]*(\/?)>/g;
  const stack: string[] = [];
  let childFound = false;

  for (const match of code.matchAll(tagRegex)) {
    const rawTag = match[0];
    const tagName = match[1];
    const selfClosing = rawTag.endsWith("/>") || match[2] === "/";
    if (!tagName) {
      continue;
    }

    if (rawTag.startsWith("</")) {
      const matchingIndex = stack.lastIndexOf(tagName);
      if (matchingIndex >= 0) {
        stack.splice(matchingIndex);
      }
      continue;
    }

    if (tagName === child) {
      childFound = true;
      if (!stack.includes(ancestor)) {
        return false;
      }
    }

    if (!selfClosing) {
      stack.push(tagName);
    }
  }

  return childFound || !required;
}

function hasNestedTag(code: string, tag: string): boolean {
  const tagRegex = /<\/?([A-Z][A-Za-z0-9.]*)\b[^>]*(\/?)>/g;
  const stack: string[] = [];

  for (const match of code.matchAll(tagRegex)) {
    const rawTag = match[0];
    const tagName = match[1];
    const selfClosing = rawTag.endsWith("/>") || match[2] === "/";
    if (!tagName) {
      continue;
    }

    if (rawTag.startsWith("</")) {
      const matchingIndex = stack.lastIndexOf(tagName);
      if (matchingIndex >= 0) {
        stack.splice(matchingIndex);
      }
      continue;
    }

    if (tagName === tag && stack.includes(tag)) {
      return true;
    }

    if (!selfClosing) {
      stack.push(tagName);
    }
  }

  return false;
}

function buildImportFindings(
  code: string,
  exportIndex: SaltExportIndex,
): EvidenceSprintFinding[] {
  const findings: EvidenceSprintFinding[] = [];

  for (const saltImport of parseSaltNamedImports(code)) {
    const knownExports = exportIndex.get(saltImport.package_name);
    if (!knownExports?.has(saltImport.imported_name)) {
      findings.push({
        code: "imports.unknown-salt-export",
        severity: "error",
        message: `${saltImport.imported_name} is not a known ${saltImport.package_name} export in the generated registry.`,
        suggested_fix:
          "Resolve the entity through get_salt_reference and replace the import with a source-backed Salt export.",
      });
    }
  }

  return findings;
}

function buildRequiredSurfaceFindings(
  code: string,
  task: EvidenceSprintTask,
  approvedWrappers: ApprovedWrapper[],
): EvidenceSprintFinding[] {
  const allImports = parseImports(code);
  const outputBindings = collectOutputBindingUses(code);
  const usedSaltBindings = new Map<string, Map<string, Set<string>>>();
  for (const parsedImport of allImports) {
    if (
      parsedImport.kind !== "named" ||
      !parsedImport.module_name.startsWith("@salt-ds/") ||
      !outputBindings.has(parsedImport.local_name)
    ) {
      continue;
    }
    const packageBindings =
      usedSaltBindings.get(parsedImport.module_name) ?? new Map();
    const localBindings =
      packageBindings.get(parsedImport.imported_name) ?? new Set();
    localBindings.add(parsedImport.local_name);
    packageBindings.set(parsedImport.imported_name, localBindings);
    usedSaltBindings.set(parsedImport.module_name, packageBindings);
  }
  const approvedWrappedCoreNames = new Set(
    approvedWrappers
      .filter((wrapper) =>
        allImports.some(
          (parsedImport) =>
            parsedImport.module_name === wrapper.import.from &&
            outputBindings.has(parsedImport.local_name) &&
            ((parsedImport.kind === "named" &&
              parsedImport.imported_name === wrapper.import.name) ||
              parsedImport.kind === "default"),
        ),
      )
      .map((wrapper) => wrapper.wraps),
  );

  const hasRequiredImport = (packageName: string, name: string): boolean =>
    (usedSaltBindings.get(packageName)?.has(name) ?? false) ||
    (packageName === "@salt-ds/core" && approvedWrappedCoreNames.has(name));

  const findings: EvidenceSprintFinding[] = [];
  for (const requiredImport of task.expectations.required_imports ?? []) {
    for (const requiredName of requiredImport.names) {
      if (!hasRequiredImport(requiredImport.package, requiredName)) {
        findings.push({
          code: "imports.required-salt-surface-missing",
          severity: "error",
          message: `${requiredName} is required for ${task.id} but no ${requiredImport.package} binding for it is used in the rendered output.`,
          suggested_fix:
            "Import the source-backed Salt surface and use that local binding in the rendered artifact.",
        });
      }
    }
  }

  for (const requiredGroup of task.expectations.required_any_of ?? []) {
    if (
      !requiredGroup.names.some((name) =>
        hasRequiredImport(requiredGroup.package, name),
      )
    ) {
      findings.push({
        code: "imports.required-salt-surface-missing",
        severity: "error",
        message: `At least one of ${requiredGroup.names.join(", ")} is required for ${task.id} but no matching ${requiredGroup.package} binding is used in the rendered output.`,
        suggested_fix:
          "Choose one prompt-aligned Salt surface and use its local binding in the rendered artifact.",
      });
    }
  }

  return findings;
}

function buildCompositionFindings(
  code: string,
  task: EvidenceSprintTask,
): EvidenceSprintFinding[] {
  const findings: EvidenceSprintFinding[] = [];

  for (const requirement of task.expectations.required_ancestors ?? []) {
    if (
      !hasAncestorForEveryChild(
        code,
        requirement.child,
        requirement.ancestor,
        requirement.required,
      )
    ) {
      findings.push({
        code: requirement.rule_id,
        severity: "error",
        message: `${requirement.child} must be nested under ${requirement.ancestor}.`,
        suggested_fix: `Wrap each ${requirement.child} with ${requirement.ancestor} before implementation is accepted.`,
      });
    }
  }

  for (const pattern of task.expectations.banned_patterns ?? []) {
    if (pattern === "fake_href" && /\bhref=["']#["']/.test(code)) {
      findings.push({
        code: "navigation.fake-href",
        severity: "error",
        message: 'Placeholder href="#" navigation was emitted.',
        suggested_fix:
          "Use a button-style trigger for non-routing prototypes or wire the trigger to a real route.",
      });
    }

    if (pattern === "native_table" && /<table\b/.test(code)) {
      findings.push({
        code: "primitive-choice.native-table",
        severity: "error",
        message:
          "A native table was emitted where the task expects Salt table guidance.",
        suggested_fix:
          "Use a source-backed Salt Table or Data grid surface instead of raw table markup.",
      });
    }

    if (pattern === "nested_card" && hasNestedTag(code, "Card")) {
      findings.push({
        code: "systemic.nested-card",
        severity: "error",
        message: "A Card is nested inside another Card.",
        suggested_fix:
          "Flatten the dashboard module structure and use layout primitives between peer Cards.",
      });
    }

    if (
      pattern === "deprecated_text_variant" &&
      /<Text\b[^>]*\bvariant=/.test(code)
    ) {
      findings.push({
        code: "deprecation.text-variant",
        severity: "error",
        message: "Text uses the deprecated variant prop.",
        suggested_fix:
          "Use current Text styling props from the source-backed Salt reference instead of variant.",
      });
    }
  }

  return findings;
}

async function readContractHistory(
  fixtureDir: string,
  relativePath: string | undefined,
): Promise<{
  path: string | null;
  history: ContractHistory | null;
}> {
  if (!relativePath) {
    return {
      path: null,
      history: null,
    };
  }

  const contractHistoryPath = path.resolve(fixtureDir, relativePath);
  try {
    const raw = await fs.readFile(contractHistoryPath, "utf8");
    return {
      path: contractHistoryPath,
      history: JSON.parse(raw) as ContractHistory,
    };
  } catch (error) {
    if (isMissingFileError(error)) {
      return { path: contractHistoryPath, history: null };
    }
    throw error;
  }
}

interface NormalizedWorkflowCall {
  actionKind: string | null;
  evidenceStatus: string | null;
  exactRequestSafe: boolean | null;
  postActionTool: string | null;
  reviewRequiredInputCompleteFile: boolean;
  resolvedEntities: string[];
  status: string | null;
  structuredContract: boolean;
  tool: string | null;
}

function normalizeWorkflowCall(
  call: NonNullable<ContractHistory["workflow_calls"]>[number],
): NormalizedWorkflowCall {
  const envelope = isRecord(call.contract)
    ? (call.contract as WorkflowContractShape)
    : null;
  const action = envelope && isRecord(envelope.action) ? envelope.action : null;
  const actionKind =
    action && typeof action.kind === "string"
      ? action.kind.trim().toLowerCase()
      : null;
  const postAction = action?.post_action;
  const postActionTool = isRecord(postAction)
    ? typeof postAction.tool === "string"
      ? postAction.tool.trim()
      : null
    : null;
  const reviewRequiredInputCompleteFile =
    isRecord(postAction) &&
    Array.isArray(postAction.required_input) &&
    postAction.required_input.length === 1 &&
    postAction.required_input[0] === "complete_updated_file";
  const safety = envelope && isRecord(envelope.safety) ? envelope.safety : null;
  const evidence = envelope?.evidence;
  const evidenceStatus = isRecord(evidence)
    ? typeof evidence.status === "string"
      ? evidence.status.trim().toLowerCase()
      : null
    : null;
  const exactRequestSafe =
    safety && typeof safety.exact_request_safe === "boolean"
      ? safety.exact_request_safe
      : null;
  const resolvedEntities = Array.isArray(call.args?.resolved_entities)
    ? call.args.resolved_entities.filter(
        (value): value is string => typeof value === "string",
      )
    : [];
  const status =
    envelope && typeof envelope.status === "string"
      ? envelope.status.trim().toLowerCase()
      : null;
  const structuredContract =
    envelope?.contract === "salt_workflow_v1" &&
    status !== null &&
    actionKind !== null &&
    exactRequestSafe !== null &&
    evidenceStatus !== null;

  return {
    actionKind,
    evidenceStatus,
    exactRequestSafe,
    postActionTool,
    reviewRequiredInputCompleteFile,
    resolvedEntities,
    status,
    structuredContract,
    tool: typeof call.tool === "string" ? call.tool.trim() : null,
  };
}

function buildContractFindings(
  history: ContractHistory | null,
  task: EvidenceSprintTask,
): {
  unresolved: EvidenceSprintFinding[];
  implementGate: EvidenceSprintFinding[];
} {
  if (!history) {
    const finding: EvidenceSprintFinding = {
      code: "contract.missing-history",
      severity: "error",
      message: "No MCP contract history was captured for this condition.",
      suggested_fix:
        "Capture the get_salt_reference, workflow, and post-action review contracts for this artifact.",
    };
    return {
      unresolved: [finding],
      implementGate: [finding],
    };
  }

  const referenceResults = Array.isArray(history.reference_results)
    ? history.reference_results.filter(
        (entry) =>
          isRecord(entry) &&
          typeof entry.name === "string" &&
          (entry.status === "found" ||
            entry.status === "not_found" ||
            entry.status === "unresolved"),
      )
    : [];
  const verifiedNames = new Set(
    referenceResults
      .filter((entry) => entry.status === "found")
      .map((entry) => normalizeName(entry.name)),
  );
  const unresolvedNames = new Set(
    referenceResults
      .filter((entry) => entry.status !== "found")
      .map((entry) => normalizeName(entry.name)),
  );
  const expectedProbeNames = task.expectations.unresolved_probe_names ?? [];
  const missingProbeFindings = expectedProbeNames
    .filter((name) => !unresolvedNames.has(normalizeName(name)))
    .map<EvidenceSprintFinding>((name) => ({
      code: "contract.unresolved-probe-missing",
      severity: "error",
      message: `The unresolved-name probe ${name} was not captured as not_found or unresolved.`,
      suggested_fix:
        "Include an explicit not_found reference result and prove the workflow does not implement it.",
    }));

  const workflowCalls = Array.isArray(history.workflow_calls)
    ? history.workflow_calls
        .filter(isRecord)
        .map((call) =>
          normalizeWorkflowCall(
            call as NonNullable<ContractHistory["workflow_calls"]>[number],
          ),
        )
    : [];
  const implementCalls = workflowCalls.filter(
    (call) => call.structuredContract && call.actionKind === "implement",
  );
  const implementedResolvedNames = implementCalls.flatMap(
    (call) => call.resolvedEntities,
  );
  const unresolvedImplemented = implementedResolvedNames.filter((name) =>
    unresolvedNames.has(normalizeName(name)),
  );
  const unverifiedImplemented = implementedResolvedNames.filter(
    (name) => !verifiedNames.has(normalizeName(name)),
  );

  const unresolvedFindings: EvidenceSprintFinding[] = [...missingProbeFindings];
  if (unresolvedImplemented.length > 0) {
    unresolvedFindings.push({
      code: "contract.unresolved-name-implemented",
      severity: "error",
      message: `Unresolved names reached an implement call: ${unresolvedImplemented.join(", ")}.`,
      suggested_fix:
        "Keep create_salt_ui blocked until every resolved_entities entry has successful reference evidence.",
    });
  }

  const implementGateFindings: EvidenceSprintFinding[] = [];
  const invalidStructuredCalls = workflowCalls.filter(
    (call) => !call.structuredContract,
  );
  if (invalidStructuredCalls.length > 0) {
    implementGateFindings.push({
      code: "contract.invalid-workflow-contract",
      severity: "error",
      message:
        "One or more workflow calls did not contain a structured salt_workflow_v1 contract.",
      suggested_fix:
        "Record the exact structured workflow response with contract, status, action, safety.exact_request_safe, and evidence.status fields; narrative summaries are not evidence.",
    });
  }
  if (implementCalls.length === 0) {
    implementGateFindings.push({
      code: "contract.no-implement-gate",
      severity: "error",
      message:
        "No honest MCP implement gate was captured for the final artifact.",
      suggested_fix:
        "Capture the final create_salt_ui contract with action.kind=implement after source-backed evidence is complete.",
    });
  }

  for (const call of implementCalls) {
    if (
      call.status !== "success" ||
      call.exactRequestSafe !== true ||
      call.evidenceStatus !== "complete"
    ) {
      implementGateFindings.push({
        code: "contract.implement-without-complete-evidence",
        severity: "error",
        message:
          "An implement action was captured without success status, exact-request safety, and complete evidence.",
        suggested_fix:
          "Only accept action.kind=implement when the public contract status, safety, and evidence fields all agree.",
      });
    }

    if (call.postActionTool !== "review_salt_ui") {
      implementGateFindings.push({
        code: "contract.missing-post-create-review",
        severity: "error",
        message: "The implement action did not require review_salt_ui.",
        suggested_fix:
          "Require a blocking review_salt_ui post-action for create and migrate implement gates.",
      });
    } else if (!call.reviewRequiredInputCompleteFile) {
      implementGateFindings.push({
        code: "contract.review-input-not-required",
        severity: "error",
        message:
          "The implement action did not require complete updated source for review_salt_ui.",
        suggested_fix:
          'Capture action.post_action.required_input=["complete_updated_file"] before accepting the implement gate.',
      });
    }
  }

  const finalImplementIndex = workflowCalls.findLastIndex(
    (call) => call.structuredContract && call.actionKind === "implement",
  );
  const terminalCall = workflowCalls.at(-1);
  const reviewCallsAfterImplement = workflowCalls
    .slice(finalImplementIndex + 1)
    .filter((call) => call.tool === "review_salt_ui");

  if (implementCalls.length > 0 && reviewCallsAfterImplement.length === 0) {
    implementGateFindings.push({
      code: "contract.post-action-review-not-captured",
      severity: "error",
      message:
        "The implement pointer required review_salt_ui, but no executed review was captured after implementation.",
      suggested_fix:
        "Capture the review_salt_ui response after implementation; a post-action pointer alone is not execution evidence.",
    });
  } else if (
    implementCalls.length > 0 &&
    (terminalCall?.tool !== "review_salt_ui" ||
      terminalCall.status !== "success" ||
      terminalCall.actionKind !== "complete" ||
      terminalCall.exactRequestSafe !== true ||
      terminalCall.evidenceStatus !== "complete")
  ) {
    implementGateFindings.push({
      code: "contract.terminal-review-not-clean",
      severity: "error",
      message:
        "The captured workflow does not end with a successful, complete, exact-request-safe review_salt_ui response.",
      suggested_fix:
        "Resolve the terminal review findings and capture the clean review_salt_ui response before treating the implementation gate as passed.",
    });
  }

  if (unverifiedImplemented.length > 0) {
    implementGateFindings.push({
      code: "contract.unverified-resolved-entities",
      severity: "error",
      message: `Implement used names without successful reference evidence: ${unverifiedImplemented.join(", ")}.`,
      suggested_fix:
        "Remove unverified resolved_entities entries and rerun source-backed reference lookup first.",
    });
  }

  return {
    unresolved: unresolvedFindings,
    implementGate: implementGateFindings,
  };
}

function criterion(
  id: EvidenceSprintCriterionResult["id"],
  passedSummary: string,
  failedSummary: string,
  findings: EvidenceSprintFinding[],
  options: { scored: boolean },
): EvidenceSprintCriterionResult {
  const passed = findings.length === 0;
  return {
    id,
    status: passed ? "passed" : "failed",
    passed,
    scored: options.scored,
    summary: passed ? passedSummary : failedSummary,
    findings,
  };
}

function notApplicableCriterion(
  id: EvidenceSprintCriterionResult["id"],
  summary: string,
): EvidenceSprintCriterionResult {
  return {
    id,
    status: "not_applicable",
    passed: null,
    scored: false,
    summary,
    findings: [],
  };
}

async function scoreCondition(input: {
  task: EvidenceSprintTask;
  conditionId: EvidenceSprintConditionId;
  fixtureDir: string;
  exportIndex: SaltExportIndex;
  approvedWrappers: ApprovedWrapper[];
  compileFindings: Map<string, EvidenceSprintFinding[]>;
}): Promise<EvidenceSprintConditionResult> {
  const condition = input.task.conditions[input.conditionId];
  const artifactPath = path.resolve(input.fixtureDir, condition.artifact);
  const { code } = await readArtifactCode(artifactPath);
  const compileFindings = input.compileFindings.get(
    normalizeFsPath(artifactPath),
  ) ?? [
    {
      code: "compile.missing-result",
      severity: "error" as const,
      message: "No TypeScript compile result was captured for this artifact.",
      suggested_fix:
        "Include the artifact in the in-memory TypeScript compile pass before scoring it.",
    },
  ];
  const importFindings = buildImportFindings(code, input.exportIndex);
  const requiredSurfaceFindings = buildRequiredSurfaceFindings(
    code,
    input.task,
    input.approvedWrappers,
  );
  const compositionFindings = buildCompositionFindings(code, input.task);
  const workflowApplicable = input.conditionId === "mcp_assisted";
  const contractHistory = workflowApplicable
    ? await readContractHistory(input.fixtureDir, condition.contract_history)
    : { path: null, history: null };
  const contractFindings = workflowApplicable
    ? buildContractFindings(contractHistory.history, input.task)
    : { unresolved: [], implementGate: [] };
  const evaluatedFindings = [
    ...compileFindings,
    ...importFindings,
    ...requiredSurfaceFindings,
    ...compositionFindings,
    ...contractFindings.unresolved,
    ...contractFindings.implementGate,
  ];
  const nonActionableFindings = evaluatedFindings.filter(
    (finding) => finding.suggested_fix.trim().length === 0,
  );
  const practicalGateFindings = input.task.practical_gates.some(
    (label) => label.trim().length > 0,
  )
    ? []
    : [
        {
          code: "gates.no-declared-labels",
          severity: "error" as const,
          message: "No practical repo gate label is attached to this task.",
          suggested_fix:
            "Declare the smallest relevant typecheck, build, pack, or smoke command as a follow-up label; execute it separately when verification is required.",
        },
      ];

  const artifactCriteria: EvidenceSprintCriterionResult[] = [
    criterion(
      "artifact_compiles",
      "The artifact compiles against the repo tsconfig and current Salt APIs.",
      "The artifact has one or more TypeScript compile errors.",
      compileFindings,
      { scored: true },
    ),
    criterion(
      "required_salt_surface_present",
      "The artifact uses prompt-aligned Salt bindings in its rendered output.",
      "The rendered output is missing one or more prompt-aligned Salt bindings.",
      requiredSurfaceFindings,
      { scored: true },
    ),
    criterion(
      "composition_valid",
      "The artifact avoids the sprint's known bad Salt compositions.",
      "The artifact still contains a known bad Salt composition or anti-pattern.",
      compositionFindings,
      { scored: true },
    ),
  ];
  const workflowCriteria: EvidenceSprintCriterionResult[] = workflowApplicable
    ? [
        criterion(
          "unresolved_names_rejected",
          "The captured workflow rejects unresolved names before implementation.",
          "Unresolved or unverified names were not rejected.",
          contractFindings.unresolved,
          { scored: false },
        ),
        criterion(
          "implement_gate_honest",
          "The implement gate is backed by success, complete evidence, and review.",
          "The implement gate is missing or overstates available evidence.",
          contractFindings.implementGate,
          { scored: false },
        ),
      ]
    : [
        notApplicableCriterion(
          "unresolved_names_rejected",
          "Not applicable: this baseline condition does not use MCP reference contracts.",
        ),
        notApplicableCriterion(
          "implement_gate_honest",
          "Not applicable: this baseline condition does not use an MCP implement gate.",
        ),
      ];
  const diagnostics: EvidenceSprintCriterionResult[] = [
    criterion(
      "real_salt_imports",
      "Every named @salt-ds import appears in the registry or canonical examples.",
      "One or more named @salt-ds imports are absent from the diagnostic census.",
      importFindings,
      { scored: false },
    ),
    criterion(
      "review_findings_actionable",
      "All deterministic findings include concrete remediation guidance.",
      "One or more deterministic findings lack remediation guidance.",
      nonActionableFindings,
      { scored: false },
    ),
    criterion(
      "practical_gate_labels_declared",
      "The task declares follow-up gate labels; this scorer does not execute them.",
      "The task does not declare a follow-up repo gate label.",
      practicalGateFindings,
      { scored: false },
    ),
  ];
  const compileGatePassed = artifactCriteria[0]?.passed === true;
  const rawArtifactScore = Number(
    (
      artifactCriteria.filter((entry) => entry.passed === true).length /
      artifactCriteria.length
    ).toFixed(4),
  );
  const score = compileGatePassed ? rawArtifactScore : 0;
  const artifactPassed = artifactCriteria.every(
    (entry) => entry.passed === true,
  );
  const workflowPassed = workflowApplicable
    ? workflowCriteria.every((entry) => entry.passed === true)
    : null;

  return {
    condition_id: input.conditionId,
    artifact_path: artifactPath,
    contract_history_path: contractHistory.path,
    score,
    passed: artifactPassed,
    artifact_quality: {
      score,
      passed: artifactPassed,
      compile_gate_passed: compileGatePassed,
      criteria: artifactCriteria,
    },
    workflow_integrity: {
      applicable: workflowApplicable,
      passed: workflowPassed,
      criteria: workflowCriteria,
    },
    diagnostics,
    findings: [...evaluatedFindings, ...practicalGateFindings],
  };
}

async function readManifest(
  fixtureDir: string,
): Promise<EvidenceSprintManifest> {
  const manifestPath = path.join(fixtureDir, "tasks.json");
  const raw = await fs.readFile(manifestPath, "utf8");
  return JSON.parse(raw) as EvidenceSprintManifest;
}

function buildScorecard(
  tasks: EvidenceSprintTaskResult[],
): EvidenceSprintReport["scorecard"] {
  const conditionScores = Object.fromEntries(
    CONDITION_IDS.map((conditionId) => {
      const entries = tasks.flatMap((task) =>
        task.conditions.filter((entry) => entry.condition_id === conditionId),
      );
      return [
        conditionId,
        {
          average_score: averageScore(
            entries.reduce((sum, entry) => sum + entry.score, 0),
            entries.length,
          ),
          passed: entries.filter((entry) => entry.passed).length,
          failed: entries.filter((entry) => !entry.passed).length,
        },
      ];
    }),
  ) as EvidenceSprintReport["scorecard"]["condition_scores"];
  const workflowIntegrity = Object.fromEntries(
    CONDITION_IDS.map((conditionId) => {
      const entries = tasks.flatMap((task) =>
        task.conditions.filter((entry) => entry.condition_id === conditionId),
      );
      return [
        conditionId,
        {
          applicable: entries.filter(
            (entry) => entry.workflow_integrity.applicable,
          ).length,
          passed: entries.filter(
            (entry) => entry.workflow_integrity.passed === true,
          ).length,
          failed: entries.filter(
            (entry) => entry.workflow_integrity.passed === false,
          ).length,
          not_applicable: entries.filter(
            (entry) => !entry.workflow_integrity.applicable,
          ).length,
        },
      ];
    }),
  ) as EvidenceSprintReport["scorecard"]["workflow_integrity"];

  return {
    score_basis: "artifact_quality",
    task_count: tasks.length,
    condition_count: tasks.reduce(
      (sum, task) => sum + task.conditions.length,
      0,
    ),
    condition_scores: conditionScores,
    workflow_integrity: workflowIntegrity,
    comparison: {
      outperformed: tasks.filter(({ comparison }) => comparison.score_delta > 0)
        .length,
      matched: tasks.filter(({ comparison }) => comparison.score_delta === 0)
        .length,
      regressed: tasks.filter(({ comparison }) => comparison.score_delta < 0)
        .length,
    },
  };
}

export async function runEvidenceSprint(
  options: {
    repoRoot?: string;
    fixtureDir?: string;
    registryDir?: string;
    registry?: SaltRegistry;
    protocolRootDir?: string;
  } = {},
): Promise<EvidenceSprintReport> {
  const repoRoot = path.resolve(options.repoRoot ?? process.cwd());
  const fixtureDir = path.resolve(
    options.fixtureDir ??
      path.join(
        repoRoot,
        "packages",
        "mcp",
        "eval-fixtures",
        "evidence-sprint",
      ),
  );
  const registryDir =
    options.registryDir ?? path.join(repoRoot, "packages", "mcp", "generated");
  const registry =
    options.registry ??
    (await loadRegistry({
      registryDir,
      prefetch: true,
    }));
  const exportIndex = buildSaltExportIndex(registry);
  const manifest = await readManifest(fixtureDir);
  const protocolRootDir = options.protocolRootDir
    ? path.resolve(options.protocolRootDir)
    : await readProtocolRootDir(fixtureDir);
  const approvedWrappers = await readApprovedWrappers(protocolRootDir);
  const compileFindings = await buildCompileFindings({
    manifest,
    fixtureDir,
    repoRoot,
    protocolRootDir,
  });
  const taskResults: EvidenceSprintTaskResult[] = [];

  for (const task of manifest.tasks) {
    const conditions = await Promise.all(
      CONDITION_IDS.map((conditionId) =>
        scoreCondition({
          task,
          conditionId,
          fixtureDir,
          exportIndex,
          approvedWrappers,
          compileFindings,
        }),
      ),
    );
    const mcpScore =
      conditions.find((entry) => entry.condition_id === "mcp_assisted")
        ?.score ?? 0;
    const bestBaselineScore = Math.max(
      ...conditions
        .filter((entry) => entry.condition_id !== "mcp_assisted")
        .map((entry) => entry.score),
    );
    const scoreDelta = Number((mcpScore - bestBaselineScore).toFixed(4));

    taskResults.push({
      id: task.id,
      title: task.title,
      workflow: task.workflow,
      prompt: task.prompt,
      capability_tags: task.capability_tags,
      practical_gates: task.practical_gates,
      conditions,
      comparison: {
        score_basis: "artifact_quality",
        mcp_score: mcpScore,
        best_baseline_score: bestBaselineScore,
        score_delta: scoreDelta,
        mcp_outperformed_baselines: scoreDelta > 0,
        mcp_matched_or_outperformed_baselines: scoreDelta >= 0,
      },
    });
  }

  return {
    generated_at: new Date().toISOString(),
    sprint_id: manifest.sprint_id,
    version: manifest.version,
    evidence_provenance: manifest.evidence_provenance,
    valid_as_product_comparison: false,
    repo_root: repoRoot,
    fixture_dir: fixtureDir,
    passed: passesEvidenceSprintComparison(taskResults),
    tasks: taskResults,
    scorecard: buildScorecard(taskResults),
  };
}

export function passesEvidenceSprintComparison(
  tasks: EvidenceSprintTaskResult[],
): boolean {
  return (
    tasks.length > 0 &&
    tasks.some(({ comparison }) => comparison.mcp_outperformed_baselines) &&
    tasks.every((task) => {
      const mcp = task.conditions.find(
        (entry) => entry.condition_id === "mcp_assisted",
      );
      return (
        task.comparison.mcp_matched_or_outperformed_baselines &&
        mcp?.artifact_quality.passed === true &&
        mcp.workflow_integrity.passed === true
      );
    })
  );
}

export function buildEvidenceSprintJsonReport(
  report: EvidenceSprintReport,
): string {
  return JSON.stringify(report, null, 2);
}
