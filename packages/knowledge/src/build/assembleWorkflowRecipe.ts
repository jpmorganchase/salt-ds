import path from "node:path";
import { parse } from "@babel/parser";
import postcss from "postcss";
import { isPortableRepositoryPath } from "../catalog/catalogPortablePath.js";
import {
  canonicalJson,
  compareOrdinalStrings,
  sha256Bytes,
} from "../catalog/catalogSerialization.js";
import {
  type AuthoredWorkflowRecipe,
  type EmittedWorkflowRecipe,
  parseAuthoredWorkflowRecipe,
  parseEmittedWorkflowRecipe,
} from "../documents/workflowRecipeSchema.js";
import { readCatalogInputFile } from "./catalogInputInventory.js";

export interface WorkflowInputInventoryEntry {
  path: string;
  sha256: string;
  bytes: number;
}

export interface WorkflowInputInventory {
  entries: readonly WorkflowInputInventoryEntry[];
  digest: string;
}

export interface WorkflowRecipeRegistration {
  id: string;
  recipePath: string;
}

export interface WorkflowPackageCompatibility {
  name: string;
  tested_version: string;
}

export interface WorkflowCompatibility {
  packages: readonly WorkflowPackageCompatibility[];
  workflow_acceptance?: {
    id: string;
    packed_application: "passed";
  };
}

export interface WorkflowRecipePublicFile {
  artifactPath: string;
  mediaType: string;
  bytes: Buffer;
}

export interface WorkflowRecipeSemanticMetadata {
  id: string;
  title: string;
  summary: string;
  aliases: readonly string[];
  taskTerms: readonly string[];
  packageNames: readonly string[];
  sourcePaths: readonly string[];
  manifestPath: string;
}

export interface WorkflowRecipeIndexEntry {
  id: string;
  title: string;
  status: "contextual" | "runnable" | "workflow-verified";
  entry_file: string;
  supporting_files: string[];
  dependencies: string[];
  css: string[];
  providers: string[];
  package_vector: Array<{ name: string; tested_version: string }>;
  source_provenance: string;
  limitation: string;
  recipe_manifest: string;
}

export interface AssembleWorkflowRecipeOptions {
  sourceRoot: string;
  registration?: WorkflowRecipeRegistration;
  semanticInputInventory: WorkflowInputInventory;
  publicationInputInventory: WorkflowInputInventory;
  compatibility?: WorkflowCompatibility;
}

export interface AssembledWorkflowRecipe {
  indexEntry: WorkflowRecipeIndexEntry;
  recipeArtifact: EmittedWorkflowRecipe;
  publicFiles: WorkflowRecipePublicFile[];
  semanticMetadata: WorkflowRecipeSemanticMetadata;
}

export function parseWorkflowRecipeDeclaration(
  input: unknown,
): AuthoredWorkflowRecipe {
  return parseAuthoredWorkflowRecipe(input);
}

const DEFAULT_REGISTRATION: WorkflowRecipeRegistration = Object.freeze({
  id: "operations-dashboard.record-form",
  recipePath:
    "examples/apps/operations-dashboard/src/workflows/record-form/recipe.json",
});

const CSS_URL_PATTERN = /url\(\s*["']?([^"')]+)["']?\s*\)/gu;
const HTML_ASSET_PATTERN = /\b(?:src|href)\s*=\s*["']([^"']+)["']/giu;

function cssImportSpecifier(parameters: string): string | null {
  const value = parameters.trim();
  const url = /^url\(\s*(?:"([^"]+)"|'([^']+)'|([^"')\s]+))\s*\)/iu.exec(value);
  if (url) return url[1] ?? url[2] ?? url[3] ?? null;
  const quoted = /^(?:"([^"]+)"|'([^']+)')/u.exec(value);
  return quoted ? (quoted[1] ?? quoted[2] ?? null) : null;
}

function assertContainedPath(value: string, label: string): void {
  if (!isPortableRepositoryPath(value) || value.includes("%")) {
    throw new Error(`${label} is not a contained portable path: ${value}`);
  }
}

function sourcePathWithoutFragment(reference: string): string {
  return reference.split("#", 1)[0] as string;
}

function fragmentOf(reference: string): string | null {
  const separator = reference.indexOf("#");
  return separator === -1 ? null : reference.slice(separator + 1);
}

function slugifyHeading(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[`*_~]/gu, "")
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
    .replace(/\s+/gu, "-")
    .replace(/-+/gu, "-");
}

function assertGuidanceFragment(source: string, reference: string): void {
  const fragment = fragmentOf(reference);
  if (fragment === null) return;
  const headings = [...source.matchAll(/^#{1,6}\s+(.+?)\s*$/gmu)].map((match) =>
    slugifyHeading(match[1] as string),
  );
  if (!headings.includes(fragment)) {
    throw new Error(
      `Canonical guidance fragment does not resolve to a heading: ${reference}`,
    );
  }
}

function packageName(specifier: string): string {
  const parts = specifier.split("/");
  return specifier.startsWith("@")
    ? parts.slice(0, 2).join("/")
    : (parts[0] as string);
}

function mediaType(filePath: string): string {
  switch (path.posix.extname(filePath)) {
    case ".css":
      return "text/css";
    case ".html":
      return "text/html";
    case ".json":
      return "application/json";
    case ".ts":
    case ".tsx":
      return "text/typescript";
    default:
      return "text/plain";
  }
}

function normalizedTextBytes(source: string): Buffer {
  return Buffer.from(source.replace(/\r\n?/gu, "\n"), "utf8");
}

function inventoryEntry(
  inventory: WorkflowInputInventory,
  sourcePath: string,
  label: string,
): WorkflowInputInventoryEntry {
  const matches = inventory.entries.filter(
    (entry) => entry.path === sourcePath,
  );
  if (matches.length !== 1) {
    throw new Error(
      `${label} must contain exactly one entry for ${sourcePath}; found ${matches.length}.`,
    );
  }
  return matches[0] as WorkflowInputInventoryEntry;
}

function assertInventoryBytes(
  entry: WorkflowInputInventoryEntry,
  bytes: Buffer,
): void {
  const digest = sha256Bytes(bytes);
  if (entry.sha256 !== digest || entry.bytes !== bytes.byteLength) {
    throw new Error(
      `Workflow input changed after inventory: ${entry.path}; expected ${entry.sha256}/${entry.bytes}, received ${digest}/${bytes.byteLength}.`,
    );
  }
}

function resolveDeclaredRelativeImport(
  importer: string,
  specifier: string,
  declaredFiles: ReadonlySet<string>,
): string {
  const base = path.posix.normalize(
    path.posix.join(path.posix.dirname(importer), specifier),
  );
  if (base === ".." || base.startsWith("../") || path.posix.isAbsolute(base)) {
    throw new Error(
      `Workflow import escapes the application: ${importer} -> ${specifier}`,
    );
  }
  const candidates = path.posix.extname(base)
    ? [base]
    : [
        base,
        `${base}.ts`,
        `${base}.tsx`,
        `${base}.js`,
        `${base}.jsx`,
        `${base}/index.ts`,
        `${base}/index.tsx`,
        `${base}/index.js`,
        `${base}/index.jsx`,
      ];
  const matches = candidates.filter((candidate) =>
    declaredFiles.has(candidate),
  );
  if (matches.length !== 1) {
    throw new Error(
      `Workflow import must resolve to exactly one declared public file: ${importer} -> ${specifier}; found ${matches.length}.`,
    );
  }
  return matches[0] as string;
}

function codeSpecifiers(source: string, filePath: string): string[] {
  const extension = path.posix.extname(filePath);
  const ast = parse(source, {
    sourceType: "unambiguous",
    plugins: [
      ...(extension === ".ts" || extension === ".tsx"
        ? (["typescript"] as const)
        : []),
      ...(extension === ".tsx" || extension === ".jsx"
        ? (["jsx"] as const)
        : []),
    ],
  });
  const specifiers: string[] = [];
  const visit = (value: unknown): void => {
    if (Array.isArray(value)) {
      for (const entry of value) visit(entry);
      return;
    }
    if (typeof value !== "object" || value === null) return;
    const node = value as Record<string, unknown>;
    const literalValue = (candidate: unknown): string | null =>
      typeof candidate === "object" &&
      candidate !== null &&
      (candidate as Record<string, unknown>).type === "StringLiteral" &&
      typeof (candidate as Record<string, unknown>).value === "string"
        ? ((candidate as Record<string, unknown>).value as string)
        : null;
    if (
      node.type === "ImportDeclaration" ||
      node.type === "ExportNamedDeclaration" ||
      node.type === "ExportAllDeclaration"
    ) {
      const specifier = literalValue(node.source);
      if (specifier !== null) specifiers.push(specifier);
    } else if (node.type === "ImportExpression") {
      const specifier = literalValue(node.source);
      if (specifier === null) {
        throw new Error(
          `Workflow source uses a non-literal dynamic import: ${filePath}.`,
        );
      }
      specifiers.push(specifier);
    } else if (node.type === "CallExpression") {
      const callee = node.callee as Record<string, unknown> | undefined;
      const isDynamicImport = callee?.type === "Import";
      const isRequire =
        callee?.type === "Identifier" && callee.name === "require";
      if (isDynamicImport || isRequire) {
        const args = Array.isArray(node.arguments) ? node.arguments : [];
        const specifier = args.length === 1 ? literalValue(args[0]) : null;
        if (specifier === null) {
          throw new Error(
            `Workflow source uses a non-literal ${isRequire ? "require" : "dynamic import"}: ${filePath}.`,
          );
        }
        specifiers.push(specifier);
      }
    } else if (node.type === "NewExpression") {
      const callee = node.callee as Record<string, unknown> | undefined;
      if (callee?.type === "Identifier" && callee.name === "URL") {
        const args = Array.isArray(node.arguments) ? node.arguments : [];
        const specifier = literalValue(args[0]);
        if (specifier?.startsWith(".")) specifiers.push(specifier);
      }
    }
    for (const [key, entry] of Object.entries(node)) {
      if (
        key !== "loc" &&
        key !== "start" &&
        key !== "end" &&
        key !== "extra" &&
        key !== "comments" &&
        key !== "tokens"
      ) {
        visit(entry);
      }
    }
  };
  visit(ast.program);
  return specifiers;
}

function validateDeclaredClosure(
  sources: ReadonlyMap<string, string>,
  declaredFiles: ReadonlySet<string>,
  declaredPackages: ReadonlySet<string>,
): Set<string> {
  const importedPackages = new Set<string>();
  const validateAsset = (importer: string, specifier: string): void => {
    if (/^(?:data:|https?:|#)/u.test(specifier)) return;
    if (specifier.startsWith("/")) {
      const applicationPath = specifier.slice(1);
      if (!declaredFiles.has(applicationPath)) {
        throw new Error(
          `Workflow asset is not a declared public file: ${importer} -> ${specifier}.`,
        );
      }
      return;
    }
    resolveDeclaredRelativeImport(importer, specifier, declaredFiles);
  };
  for (const [filePath, source] of sources) {
    if (/\.(?:[cm]?[jt]sx?)$/u.test(filePath)) {
      for (const specifier of codeSpecifiers(source, filePath)) {
        if (specifier.startsWith(".")) {
          resolveDeclaredRelativeImport(filePath, specifier, declaredFiles);
          continue;
        }
        const dependency = packageName(specifier);
        if (!declaredPackages.has(dependency)) {
          throw new Error(
            `Workflow source imports undeclared dependency '${dependency}': ${filePath}.`,
          );
        }
        importedPackages.add(dependency);
      }
    }

    if (filePath.endsWith(".css")) {
      const stylesheet = postcss.parse(source, { from: filePath, map: false });
      stylesheet.walkAtRules((atRule) => {
        if (atRule.name.toLowerCase() !== "import") return;
        const specifier = cssImportSpecifier(atRule.params);
        if (specifier === null) {
          throw new Error(
            `Workflow stylesheet uses an unsupported non-literal @import: ${filePath}.`,
          );
        }
        validateAsset(filePath, specifier);
      });
      stylesheet.walkDecls((declaration) => {
        CSS_URL_PATTERN.lastIndex = 0;
        for (const match of declaration.value.matchAll(CSS_URL_PATTERN)) {
          validateAsset(filePath, match[1] as string);
        }
      });
    }
    if (filePath.endsWith(".html")) {
      HTML_ASSET_PATTERN.lastIndex = 0;
      for (const match of source.matchAll(HTML_ASSET_PATTERN)) {
        const specifier = match[1] as string;
        validateAsset(filePath, specifier);
      }
    }
  }
  return importedPackages;
}

function exactPackageVersion(
  manifest: Record<string, unknown>,
  packageNameValue: string,
): string {
  for (const field of ["dependencies", "devDependencies"] as const) {
    const dependencies = manifest[field];
    if (
      typeof dependencies === "object" &&
      dependencies !== null &&
      typeof (dependencies as Record<string, unknown>)[packageNameValue] ===
        "string"
    ) {
      const version = (dependencies as Record<string, string>)[
        packageNameValue
      ] as string;
      if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/u.test(version)) {
        throw new Error(
          `Workflow Salt dependency must use an exact tested version: ${packageNameValue}@${version}.`,
        );
      }
      return version;
    }
  }
  throw new Error(`Workflow dependency manifest omits ${packageNameValue}.`);
}

function compatibilityVector(
  packageNames: readonly string[],
  manifest: Record<string, unknown>,
  compatibility: WorkflowCompatibility | undefined,
): Array<{ name: string; tested_version: string }> {
  return [...packageNames].sort(compareOrdinalStrings).map((name) => {
    const declaredVersion = exactPackageVersion(manifest, name);
    if (compatibility) {
      const matches = compatibility.packages.filter(
        (entry) => entry.name === name,
      );
      if (matches.length !== 1) {
        throw new Error(
          `Knowledge compatibility must contain exactly one vector for ${name}; found ${matches.length}.`,
        );
      }
      if (matches[0]?.tested_version !== declaredVersion) {
        throw new Error(
          `Workflow dependency ${name}@${declaredVersion} does not match tested compatibility ${matches[0]?.tested_version}.`,
        );
      }
    }
    return { name, tested_version: declaredVersion };
  });
}

function fileId(recipeId: string, relativePath: string): string {
  return `workflow-file:${recipeId}:${relativePath}`;
}

function artifactRoot(recipeId: string): string {
  return `examples/workflows/${recipeId}`;
}

function recipeSourcePaths(
  registration: WorkflowRecipeRegistration,
  recipe: AuthoredWorkflowRecipe,
): string[] {
  return [
    registration.recipePath,
    ...recipe.source.reusable_form_files.map(
      (file) => `${recipe.source.application}/${file}`,
    ),
    `${recipe.source.application}/${recipe.setup.dependency_manifest}`,
    ...recipe.source.canonical_guidance.map(sourcePathWithoutFragment),
  ].sort(compareOrdinalStrings);
}

export async function assembleWorkflowRecipe(
  options: AssembleWorkflowRecipeOptions,
): Promise<AssembledWorkflowRecipe> {
  const sourceRoot = path.resolve(options.sourceRoot);
  const registration = options.registration ?? DEFAULT_REGISTRATION;
  assertContainedPath(registration.recipePath, "Workflow recipe path");

  const recipeSource = await readCatalogInputFile(
    path.resolve(sourceRoot, registration.recipePath),
    "utf8",
  );
  const recipeBytes = normalizedTextBytes(recipeSource);
  const recipe = parseAuthoredWorkflowRecipe(JSON.parse(recipeSource));
  if (recipe.id !== registration.id) {
    throw new Error(
      `Workflow registration '${registration.id}' does not match recipe '${recipe.id}'.`,
    );
  }

  const semanticPaths = recipeSourcePaths(registration, recipe);
  const semanticEntries = semanticPaths.map((sourcePath) =>
    inventoryEntry(
      options.semanticInputInventory,
      sourcePath,
      "Semantic inventory",
    ),
  );
  const recipeInventoryEntry = inventoryEntry(
    options.semanticInputInventory,
    registration.recipePath,
    "Semantic inventory",
  );
  assertInventoryBytes(recipeInventoryEntry, recipeBytes);

  const allApplicationFiles = [
    ...recipe.source.reusable_form_files,
    ...recipe.source.demo_application_files,
  ];
  if (new Set(allApplicationFiles).size !== allApplicationFiles.length) {
    throw new Error("Workflow public-file inventory contains duplicate paths.");
  }

  const sourceByApplicationPath = new Map<string, string>();
  const publicFileRecords: EmittedWorkflowRecipe["files"] = [];
  const publicFiles: WorkflowRecipePublicFile[] = [];
  const reusable = new Set(recipe.source.reusable_form_files);
  for (const relativePath of [...allApplicationFiles].sort(
    compareOrdinalStrings,
  )) {
    assertContainedPath(relativePath, "Workflow public file");
    const sourcePath = `${recipe.source.application}/${relativePath}`;
    const role = reusable.has(relativePath)
      ? "reusable"
      : relativePath === recipe.setup.dependency_manifest
        ? "setup"
        : "demo-only";
    const inventory =
      role === "demo-only"
        ? options.publicationInputInventory
        : options.semanticInputInventory;
    const entry = inventoryEntry(
      inventory,
      sourcePath,
      role === "demo-only" ? "Publication inventory" : "Semantic inventory",
    );
    const source = await readCatalogInputFile(
      path.resolve(sourceRoot, sourcePath),
      "utf8",
    );
    const bytes = normalizedTextBytes(source);
    assertInventoryBytes(entry, bytes);
    sourceByApplicationPath.set(relativePath, source);
    const artifactPath = `${artifactRoot(recipe.id)}/files/${relativePath}`;
    publicFileRecords.push({
      id: fileId(recipe.id, relativePath),
      source_path: sourcePath,
      path: relativePath,
      artifact_path: artifactPath,
      role,
      media_type: mediaType(relativePath),
      sha256: sha256Bytes(bytes),
      bytes: bytes.byteLength,
    });
    publicFiles.push({
      artifactPath,
      mediaType: mediaType(relativePath),
      bytes,
    });
  }

  const guidanceSources = new Map<string, string>();
  for (const reference of recipe.source.canonical_guidance) {
    const sourcePath = sourcePathWithoutFragment(reference);
    if (!guidanceSources.has(sourcePath)) {
      const source = await readCatalogInputFile(
        path.resolve(sourceRoot, sourcePath),
        "utf8",
      );
      const entry = inventoryEntry(
        options.semanticInputInventory,
        sourcePath,
        "Semantic inventory",
      );
      assertInventoryBytes(entry, normalizedTextBytes(source));
      guidanceSources.set(sourcePath, source);
    }
    assertGuidanceFragment(
      guidanceSources.get(sourcePath) as string,
      reference,
    );
  }

  const dependencyManifestSource = sourceByApplicationPath.get(
    recipe.setup.dependency_manifest,
  );
  if (dependencyManifestSource === undefined) {
    throw new Error(
      "Workflow dependency manifest was not loaded as a public file.",
    );
  }
  const dependencyManifest = JSON.parse(dependencyManifestSource) as Record<
    string,
    unknown
  >;
  const declaredDependencies = new Set<string>();
  for (const field of ["dependencies", "devDependencies"] as const) {
    const entries = dependencyManifest[field];
    if (typeof entries === "object" && entries !== null) {
      for (const dependency of Object.keys(entries)) {
        declaredDependencies.add(dependency);
      }
    }
  }
  const declaredFiles = new Set(allApplicationFiles);
  const importedPackages = validateDeclaredClosure(
    sourceByApplicationPath,
    declaredFiles,
    declaredDependencies,
  );
  const fullSaltPackages = [...importedPackages]
    .filter((name) => name.startsWith("@salt-ds/"))
    .sort(compareOrdinalStrings);
  for (const themeImport of recipe.setup.theme_css) {
    fullSaltPackages.push(packageName(themeImport));
  }
  const distinctFullSaltPackages = [...new Set(fullSaltPackages)].sort(
    compareOrdinalStrings,
  );

  const reusableSources = new Map(
    [...sourceByApplicationPath].filter(([filePath]) => reusable.has(filePath)),
  );
  const reusableImports = validateDeclaredClosure(
    reusableSources,
    reusable,
    declaredDependencies,
  );
  const reusablePackageNames = [
    ...new Set([
      ...[...reusableImports].filter((name) => name.startsWith("@salt-ds/")),
      ...recipe.setup.theme_css.map(packageName),
    ]),
  ].sort(compareOrdinalStrings);
  const reusableSemanticPackageNames = [
    ...new Set([
      ...reusableImports,
      ...recipe.setup.theme_css.map(packageName),
    ]),
  ].sort(compareOrdinalStrings);
  const packageVector = compatibilityVector(
    distinctFullSaltPackages,
    dependencyManifest,
    options.compatibility,
  );
  const reusablePackageVector = compatibilityVector(
    reusablePackageNames,
    dependencyManifest,
    options.compatibility,
  );
  const reusablePackageSet = new Set(reusablePackageNames);
  const runtimeDependencies =
    typeof dependencyManifest.dependencies === "object" &&
    dependencyManifest.dependencies !== null
      ? new Set(Object.keys(dependencyManifest.dependencies))
      : new Set<string>();
  const reusableImportSet = new Set(reusableImports);
  const externalDependencyVector = [...importedPackages]
    .filter(
      (name) => !name.startsWith("@salt-ds/") && runtimeDependencies.has(name),
    )
    .sort(compareOrdinalStrings)
    .map((name) => ({
      name,
      version: exactPackageVersion(dependencyManifest, name),
      role: reusableImportSet.has(name)
        ? ("reusable" as const)
        : ("demo-only" as const),
    }));

  const manifestPath = `${artifactRoot(recipe.id)}/recipe.json`;
  const contentIdentity = sha256Bytes(
    canonicalJson(
      publicFileRecords.map(({ path: filePath, sha256, bytes }) => ({
        path: filePath,
        sha256,
        bytes,
      })),
    ),
  );
  const semanticSourceDigest = sha256Bytes(
    canonicalJson(
      semanticEntries
        .map(({ path: sourcePath, sha256, bytes }) => ({
          path: sourcePath,
          sha256,
          bytes,
        }))
        .sort((left, right) => compareOrdinalStrings(left.path, right.path)),
    ),
  );
  const packedAcceptance =
    options.compatibility?.workflow_acceptance?.id === recipe.id &&
    options.compatibility.workflow_acceptance.packed_application === "passed"
      ? "passed"
      : "required";
  const manualReview =
    recipe.acceptance.manual_review_pending.length === 0 ? "passed" : "pending";
  const deliveredReadiness =
    recipe.readiness === "workflow-verified" &&
    (packedAcceptance !== "passed" || manualReview !== "passed")
      ? "runnable"
      : recipe.readiness;

  const recipeArtifact = parseEmittedWorkflowRecipe({
    contract: "salt-workflow-recipe/1",
    schema_version: "1.0.0",
    id: recipe.id,
    title: recipe.title,
    intent: recipe.intent,
    owner: recipe.owner,
    source_identity: {
      recipe_sha256: sha256Bytes(recipeBytes),
      semantic_source_digest: semanticSourceDigest,
      content_identity: contentIdentity,
    },
    source: {
      application: recipe.source.application,
      recipe: registration.recipePath,
      canonical_guidance: recipe.source.canonical_guidance,
    },
    files: publicFileRecords,
    setup: recipe.setup,
    adaptation: recipe.adaptation,
    acceptance: recipe.acceptance,
    limitations: recipe.limitations,
    support: {
      reusable_packages: reusablePackageVector.map((entry) => ({
        name: entry.name,
        version: entry.tested_version,
        role: "reusable" as const,
      })),
      demo_packages: packageVector
        .filter((entry) => !reusablePackageSet.has(entry.name))
        .map((entry) => ({
          name: entry.name,
          version: entry.tested_version,
          role: "demo-only" as const,
        })),
      external_dependencies: externalDependencyVector,
      provider: recipe.setup.provider,
      theme_css: recipe.setup.theme_css,
    },
    readiness: {
      authored: recipe.readiness,
      delivered: deliveredReadiness,
      static_validation: "passed",
      packed_application_acceptance: packedAcceptance,
      manual_review: manualReview,
      pending_reviews: recipe.acceptance.manual_review_pending,
    },
  });

  const entryFile = recipe.source.reusable_form_files.find((file) =>
    file.endsWith("RecordForm.tsx"),
  );
  if (!entryFile) {
    throw new Error("Workflow reusable inventory omits RecordForm.tsx.");
  }
  const reusableArtifacts = publicFileRecords.filter(
    (file) => file.role === "reusable",
  );
  const limitation = recipe.limitations.join(" ");
  const indexEntry: WorkflowRecipeIndexEntry = {
    id: recipe.id,
    title: recipe.title,
    status: deliveredReadiness,
    entry_file: `${artifactRoot(recipe.id)}/files/${entryFile}`,
    supporting_files: reusableArtifacts
      .filter((file) => file.path !== entryFile)
      .map((file) => file.artifact_path),
    dependencies: reusableSemanticPackageNames,
    css: reusableArtifacts
      .filter((file) => file.path.endsWith(".css"))
      .map((file) => file.artifact_path),
    providers: [recipe.setup.provider],
    package_vector: reusablePackageVector,
    source_provenance: "verified Salt workflow authoring source",
    limitation,
    recipe_manifest: manifestPath,
  };

  return {
    indexEntry,
    recipeArtifact,
    publicFiles,
    semanticMetadata: {
      id: recipe.id,
      title: recipe.title,
      summary: recipe.intent.summary,
      aliases: recipe.intent.aliases,
      taskTerms: [
        recipe.title,
        recipe.intent.summary,
        ...recipe.intent.aliases,
        recipe.adaptation.draft_owner,
        ...recipe.adaptation.inputs,
        ...recipe.adaptation.callbacks,
        ...recipe.adaptation.submission_state,
        ...recipe.acceptance.automated,
      ],
      packageNames: reusableSemanticPackageNames,
      sourcePaths: semanticPaths,
      manifestPath,
    },
  };
}
