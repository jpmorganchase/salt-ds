import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  lstat,
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  realpath,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

import Ajv2020 from "ajv/dist/2020.js";
import postcss from "postcss";

import {
  repositoryRoot,
  repositoryTextBytes,
  stableJson,
} from "./saltAiEvidenceUtils.mjs";

export const SAMPLE_APP_NAMES = Object.freeze([
  "vite-starter",
  "next-app-router",
  "operations-dashboard",
]);

export function selectSampleAppNames(selectedApp) {
  assert(
    selectedApp === undefined || SAMPLE_APP_NAMES.includes(selectedApp),
    `Unknown sample app: ${selectedApp}`,
  );
  return selectedApp ? [selectedApp] : [...SAMPLE_APP_NAMES];
}

function parseResult(result, label) {
  assert.equal(result.exitCode, 0, `${label} failed`);
  assert.equal(result.stderr, "", `${label} wrote stderr`);
  assert(result.stdout.endsWith("\n"), `${label} omitted its final newline`);
  try {
    return JSON.parse(result.stdout);
  } catch {
    throw new Error(`${label} returned malformed JSON`);
  }
}

function portable(value) {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    !value.includes("\\") &&
    !path.posix.isAbsolute(value) &&
    !path.win32.isAbsolute(value) &&
    !value.split("/").includes("..")
  );
}

const WORKFLOW_ID = "operations-dashboard.record-form";
const WORKFLOW_MANIFEST = `examples/workflows/${WORKFLOW_ID}/recipe.json`;
const WORKFLOW_GUIDE_ID = WORKFLOW_ID;
const PREVIEW_ENTRY = "index.html";
const PREVIEW_DIRECTORY = "workflow-preview";
const MAX_PREVIEW_FILES = 64;
const MAX_PREVIEW_BYTES = 16 * 1024 * 1024;
const DIGEST_PATTERN = /^sha256:[0-9a-f]{64}$/u;
const WORKFLOW_FILE_PATHS = Object.freeze([
  "index.html",
  "package.json",
  "src/OperationsDashboard.tsx",
  "src/dashboard.css",
  "src/main.tsx",
  "src/vite-env.d.ts",
  "src/workflows/record-form/RecordForm.css",
  "src/workflows/record-form/RecordForm.tsx",
  "src/workflows/record-form/localDemoAdapter.ts",
  "src/workflows/record-form/types.ts",
  "tsconfig.json",
  "vite.config.ts",
]);

function sha256(bytes) {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${canonicalJson(entry)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function comparePortablePaths(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function sha512Integrity(bytes) {
  return `sha512-${createHash("sha512").update(bytes).digest("base64")}`;
}

function containedPath(root, relative, label) {
  assert(portable(relative), `${label} path is unsafe: ${String(relative)}`);
  const result = path.resolve(root, ...relative.split("/"));
  const containment = path.relative(root, result);
  assert(
    containment !== ".." &&
      !containment.startsWith(`..${path.sep}`) &&
      !path.isAbsolute(containment),
    `${label} escapes its root: ${relative}`,
  );
  return result;
}

async function assertNoLinkedPathSegments(root, target, label) {
  const relative = path.relative(root, target);
  assert(
    relative !== ".." &&
      !relative.startsWith(`..${path.sep}`) &&
      !path.isAbsolute(relative),
    `${label} escapes its root`,
  );
  let cursor = root;
  for (const segment of relative.split(path.sep).filter(Boolean)) {
    cursor = path.join(cursor, segment);
    const stats = await lstat(cursor);
    assert(!stats.isSymbolicLink(), `${label} contains a symbolic link`);
  }
  const [realRoot, realTarget] = await Promise.all([
    realpath(root),
    realpath(target),
  ]);
  const realRelative = path.relative(realRoot, realTarget);
  assert(
    realRelative !== ".." &&
      !realRelative.startsWith(`..${path.sep}`) &&
      !path.isAbsolute(realRelative),
    `${label} resolves outside its root`,
  );
}

async function regularBytes(root, relative, label) {
  const file = containedPath(root, relative, label);
  await assertNoLinkedPathSegments(root, file, label);
  const before = await lstat(file);
  assert(before.isFile(), `${label} is not a regular file`);
  const bytes = await readFile(file);
  const after = await lstat(file);
  assert(
    after.isFile() &&
      after.size === before.size &&
      after.mtimeMs === before.mtimeMs &&
      bytes.byteLength === before.size,
    `${label} changed while it was read`,
  );
  return bytes;
}

function previewMediaType(file) {
  switch (path.posix.extname(file).toLowerCase()) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".js":
    case ".mjs":
      return "text/javascript; charset=utf-8";
    case ".json":
    case ".map":
      return "application/json";
    case ".svg":
      return "image/svg+xml";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".woff":
      return "font/woff";
    case ".woff2":
      return "font/woff2";
    default:
      throw new Error(`Unsupported workflow preview file type: ${file}`);
  }
}

async function readPreviewTree(root, containmentRoot = root) {
  await assertNoLinkedPathSegments(containmentRoot, root, "Workflow preview");
  const rootStats = await lstat(root);
  assert(rootStats.isDirectory(), "Workflow preview root is not a directory");
  const pending = [""];
  const directories = [];
  const files = [];
  let totalBytes = 0;
  while (pending.length > 0) {
    const relativeDirectory = pending.pop();
    const absoluteDirectory = relativeDirectory
      ? containedPath(root, relativeDirectory, "Workflow preview directory")
      : root;
    const entries = (
      await readdir(absoluteDirectory, { withFileTypes: true })
    ).sort((left, right) => comparePortablePaths(left.name, right.name));
    for (const entry of entries) {
      const relative = relativeDirectory
        ? `${relativeDirectory}/${entry.name}`
        : entry.name;
      assert(
        portable(relative),
        `Workflow preview path is unsafe: ${relative}`,
      );
      const absolute = containedPath(root, relative, "Workflow preview");
      const stats = await lstat(absolute);
      assert(
        !stats.isSymbolicLink(),
        `Workflow preview path is linked: ${relative}`,
      );
      if (stats.isDirectory()) {
        directories.push(relative);
        pending.push(relative);
        continue;
      }
      assert(
        stats.isFile(),
        `Workflow preview path is not regular: ${relative}`,
      );
      const bytes = await regularBytes(
        root,
        relative,
        `Workflow preview ${relative}`,
      );
      totalBytes += bytes.byteLength;
      assert(
        files.length + 1 <= MAX_PREVIEW_FILES &&
          totalBytes <= MAX_PREVIEW_BYTES,
        "Workflow preview exceeds its file or byte budget",
      );
      files.push({
        path: relative,
        media_type: previewMediaType(relative),
        bytes: bytes.byteLength,
        sha256: sha256(bytes),
        content: bytes,
      });
    }
  }
  files.sort((left, right) => comparePortablePaths(left.path, right.path));
  for (const directory of directories) {
    assert(
      files.some((file) => file.path.startsWith(`${directory}/`)),
      `Workflow preview contains an empty directory: ${directory}`,
    );
  }
  assert(files.length > 0, "Workflow preview is empty");
  return files;
}

function previewFileDescriptors(files) {
  return files.map(({ content: _content, ...descriptor }) => descriptor);
}

export function workflowPreviewTreeSha256(files) {
  return sha256(Buffer.from(stableJson(files), "utf8"));
}

function cssReferences(source, file) {
  const references = [];
  const root = postcss.parse(source, { from: file });
  const collectUrls = (value) => {
    for (const match of value.matchAll(/url\(\s*(["']?)(.*?)\1\s*\)/giu)) {
      references.push(match[2]);
    }
  };
  root.walkDecls((declaration) => collectUrls(declaration.value));
  root.walkAtRules("import", (rule) => {
    const url = /^\s*url\(\s*(["']?)(.*?)\1\s*\)/iu.exec(rule.params);
    if (url) {
      references.push(url[2]);
      return;
    }
    const quoted = /^\s*(["'])(.*?)\1/iu.exec(rule.params);
    assert(quoted, `Workflow preview CSS import is not a static URL: ${file}`);
    references.push(quoted[2]);
  });
  return references;
}

function htmlReferences(source, file) {
  const references = [];
  for (const match of source.matchAll(
    /\b(?:href|poster|src)\s*=\s*(?:"([^"]*)"|'([^']*)')/giu,
  )) {
    references.push(match[1] ?? match[2]);
  }
  for (const match of source.matchAll(
    /\bsrcset\s*=\s*(?:"([^"]*)"|'([^']*)')/giu,
  )) {
    const sourceSet = match[1] ?? match[2];
    if (/^\s*data:(?:font|image)\//iu.test(sourceSet)) {
      references.push(sourceSet.trim());
    } else {
      for (const candidate of sourceSet.split(",")) {
        references.push(candidate.trim().split(/\s+/u)[0]);
      }
    }
  }
  for (const match of source.matchAll(
    /<style(?:\s[^>]*)?>([\s\S]*?)<\/style>/giu,
  )) {
    references.push(...cssReferences(match[1], file));
  }
  for (const match of source.matchAll(
    /\bstyle\s*=\s*(?:"([^"]*)"|'([^']*)')/giu,
  )) {
    references.push(...cssReferences(`a{${match[1] ?? match[2]}}`, file));
  }
  return references;
}

function assertLocalPreviewReference(reference, fromFile, paths) {
  const value = reference.trim();
  assert(
    value.length > 0,
    `Workflow preview has an empty reference: ${fromFile}`,
  );
  if (value.startsWith("#")) return;
  if (/^data:(?:font|image)\//iu.test(value)) return;
  assert(
    !value.startsWith("//") &&
      !value.startsWith("/") &&
      !/^[a-z][a-z0-9+.-]*:/iu.test(value),
    `Workflow preview has an external or root-absolute reference in ${fromFile}: ${value}`,
  );
  let referencedPath;
  try {
    referencedPath = decodeURIComponent(value.split(/[?#]/u, 1)[0]);
  } catch {
    assert.fail(
      `Workflow preview has an invalid encoded reference in ${fromFile}`,
    );
  }
  assert(
    referencedPath.length > 0 && !referencedPath.includes("\\"),
    `Workflow preview has an unsafe reference in ${fromFile}: ${value}`,
  );
  const resolved = path.posix.normalize(
    path.posix.join(path.posix.dirname(fromFile), referencedPath),
  );
  assert(
    portable(resolved) && paths.has(resolved),
    `Workflow preview reference is missing from the retained tree: ${fromFile} -> ${value}`,
  );
}

export function assertWorkflowPreviewReferenceClosure(files) {
  const paths = new Set(files.map((file) => file.path));
  for (const file of files) {
    let references = [];
    if (file.media_type === "text/html; charset=utf-8") {
      references = htmlReferences(file.content.toString("utf8"), file.path);
    } else if (file.media_type === "text/css; charset=utf-8") {
      references = cssReferences(file.content.toString("utf8"), file.path);
    }
    for (const reference of references) {
      assertLocalPreviewReference(reference, file.path, paths);
    }
  }
}

function packageNameFromImport(value) {
  const segments = value.split("/");
  return value.startsWith("@") ? segments.slice(0, 2).join("/") : segments[0];
}

export function assertPackedWorkflowManifestMatchesSource(
  packedManifestBytes,
  sourceManifestBytes,
) {
  assert(
    Buffer.from(packedManifestBytes).equals(
      repositoryTextBytes(sourceManifestBytes),
    ),
    "Packed workflow package.json differs from the declared operations dashboard manifest",
  );
}

/**
 * Reads the one currently supported workflow only through an installed
 * KnowledgeStore. Every selected byte is re-verified by the Store before it
 * is returned, so callers never reconstruct from a repository app copy.
 */
export function readPackedWorkflowRecipe(store) {
  assert(store && typeof store.getRecord === "function");
  assert.equal(typeof store.readArtifact, "function");
  const guide = store.getRecord("guide", WORKFLOW_GUIDE_ID);
  assert(guide, `Packed Knowledge omits ${WORKFLOW_GUIDE_ID}`);
  assert.equal(
    guide.id,
    WORKFLOW_GUIDE_ID,
    "Packed workflow guide has an unexpected record id",
  );
  const detail = store.getContentValue(guide.detail_content_ref);
  assert(
    detail && typeof detail === "object",
    "Packed workflow guide detail is invalid",
  );
  assert.equal(
    detail.recipe_manifest,
    WORKFLOW_MANIFEST,
    "Packed workflow guide does not select the record-form recipe artifact",
  );

  const recipeBytes = Buffer.from(store.readArtifact(WORKFLOW_MANIFEST));
  let recipe;
  try {
    recipe = JSON.parse(recipeBytes.toString("utf8"));
  } catch {
    throw new Error("Packed workflow recipe artifact is not JSON.");
  }
  assert.equal(recipe.contract, "salt-workflow-recipe/1");
  assert.equal(recipe.schema_version, "1.0.0");
  assert.equal(recipe.id, WORKFLOW_ID);
  assert.equal(
    recipe.source?.application,
    "examples/apps/operations-dashboard",
  );
  assert.equal(
    recipe.source?.recipe,
    "examples/apps/operations-dashboard/src/workflows/record-form/recipe.json",
  );
  assert(Array.isArray(recipe.files), "Packed workflow recipe has no files");

  const paths = recipe.files.map((file) => file?.path);
  assert.deepEqual(
    [...paths].sort(),
    [...WORKFLOW_FILE_PATHS].sort(),
    "Packed workflow recipe has missing or extra public files",
  );
  const roles = recipe.files.reduce((result, file) => {
    result[file.role] = (result[file.role] ?? 0) + 1;
    return result;
  }, {});
  assert.deepEqual(roles, { "demo-only": 8, reusable: 3, setup: 1 });

  const files = recipe.files
    .map((file) => {
      assert(
        portable(file.path),
        `Packed workflow file path is unsafe: ${file.path}`,
      );
      assert.equal(
        file.id,
        `workflow-file:${WORKFLOW_ID}:${file.path}`,
        `Packed workflow file id is inconsistent: ${file.path}`,
      );
      assert.equal(
        file.artifact_path,
        `examples/workflows/${WORKFLOW_ID}/files/${file.path}`,
        `Packed workflow file artifact path is inconsistent: ${file.path}`,
      );
      const bytes = Buffer.from(store.readArtifact(file.artifact_path));
      assert.equal(
        bytes.byteLength,
        file.bytes,
        `Packed workflow file byte count differs: ${file.path}`,
      );
      assert.equal(
        sha256(bytes),
        file.sha256,
        `Packed workflow file digest differs: ${file.path}`,
      );
      return { path: file.path, role: file.role, bytes };
    })
    .sort((left, right) => left.path.localeCompare(right.path));

  assert.equal(
    recipe.source_identity?.content_identity,
    sha256(
      Buffer.from(
        canonicalJson(
          recipe.files.map(({ path: filePath, sha256: digest, bytes }) => ({
            path: filePath,
            sha256: digest,
            bytes,
          })),
        ),
        "utf8",
      ),
    ),
    "Packed workflow content identity does not bind its declared files",
  );

  const packageFile = files.find((file) => file.path === "package.json");
  assert(
    packageFile && packageFile.role === "setup",
    "Packed workflow has no setup manifest",
  );
  const manifest = JSON.parse(packageFile.bytes.toString("utf8"));
  assert.equal(manifest.name, "salt-operations-dashboard");
  assert.equal(manifest.private, true);
  assert.equal(manifest.type, "module");
  assert.equal(manifest.scripts?.typecheck, "tsc --noEmit");
  assert.equal(manifest.scripts?.build, "vite build");
  const declared = {
    ...(manifest.dependencies ?? {}),
    ...(manifest.devDependencies ?? {}),
  };
  const support = [
    ...(recipe.support?.reusable_packages ?? []),
    ...(recipe.support?.demo_packages ?? []),
    ...(recipe.support?.external_dependencies ?? []),
  ];
  assert(
    support.length > 0,
    "Packed workflow has no dependency support vector",
  );
  for (const dependency of support) {
    assert.equal(
      declared[dependency.name],
      dependency.version,
      `Packed workflow dependency is not exact in package.json: ${dependency.name}`,
    );
    if (dependency.name.startsWith("@salt-ds/")) {
      const compatible = store.manifest?.compatibility?.packages?.find(
        (candidate) => candidate.name === dependency.name,
      );
      assert.equal(
        compatible?.tested_version,
        dependency.version,
        `Packed workflow dependency is not in the Knowledge tested vector: ${dependency.name}`,
      );
    }
  }
  for (const themeImport of recipe.support?.theme_css ?? []) {
    const dependency = packageNameFromImport(themeImport);
    assert.equal(
      typeof declared[dependency],
      "string",
      `Packed workflow theme import is absent from package.json: ${themeImport}`,
    );
  }
  return {
    id: recipe.id,
    recipeBytes,
    manifestBytes: packageFile.bytes,
    files,
    recipe,
  };
}

export async function retainViteWorkflowPreview({
  appRoot,
  receiptArtifactRoot,
  workflow,
}) {
  assert.equal(
    workflow?.id,
    WORKFLOW_ID,
    "Workflow preview has the wrong recipe",
  );
  assert(
    Buffer.isBuffer(workflow.recipeBytes),
    "Workflow preview has no recipe bytes",
  );
  assert(
    DIGEST_PATTERN.test(
      workflow.recipe?.source_identity?.content_identity ?? "",
    ),
    "Workflow preview has no recipe content identity",
  );
  const sourceRoot = path.join(appRoot, "dist");
  const destinationRoot = path.join(receiptArtifactRoot, PREVIEW_DIRECTORY);
  await mkdir(receiptArtifactRoot, { recursive: true });
  try {
    await lstat(destinationRoot);
    assert.fail("Workflow preview destination already exists");
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }

  const sourceFiles = await readPreviewTree(sourceRoot);
  assertWorkflowPreviewReferenceClosure(sourceFiles);
  const files = previewFileDescriptors(sourceFiles);
  const entry = files.find((file) => file.path === PREVIEW_ENTRY);
  assert.equal(
    entry?.media_type,
    "text/html; charset=utf-8",
    "Workflow preview entry is missing or is not HTML",
  );
  const descriptor = {
    entry: PREVIEW_ENTRY,
    files,
    tree_sha256: workflowPreviewTreeSha256(files),
    recipe: {
      artifact: WORKFLOW_MANIFEST,
      artifact_sha256: sha256(workflow.recipeBytes),
      content_identity: workflow.recipe.source_identity.content_identity,
    },
  };

  const stagingRoot = await mkdtemp(
    path.join(receiptArtifactRoot, ".workflow-preview-"),
  );
  try {
    for (const file of sourceFiles) {
      const target = containedPath(
        stagingRoot,
        file.path,
        "Workflow preview output",
      );
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, file.content, { flag: "wx" });
    }
    const [sourceAfter, retained] = await Promise.all([
      readPreviewTree(sourceRoot),
      readPreviewTree(stagingRoot),
    ]);
    assert.equal(
      stableJson(previewFileDescriptors(sourceAfter)),
      stableJson(files),
      "Workflow preview changed while it was retained",
    );
    assert.equal(
      stableJson(previewFileDescriptors(retained)),
      stableJson(files),
      "Retained workflow preview differs from the accepted Vite output",
    );
    await rename(stagingRoot, destinationRoot);
    return descriptor;
  } catch (error) {
    await rm(stagingRoot, { recursive: true, force: true });
    throw error;
  }
}

let receiptValidatorPromise;

async function validateCohortReceipt(receipt) {
  receiptValidatorPromise ??= readFile(
    new URL(
      "./schemas/saltSampleAppCohortReceiptV2.schema.json",
      import.meta.url,
    ),
    "utf8",
  ).then((source) =>
    new Ajv2020({ allErrors: true, strict: true }).compile(JSON.parse(source)),
  );
  const validate = await receiptValidatorPromise;
  assert(
    validate(receipt),
    `Sample app receipt schema failure: ${new Ajv2020().errorsText(
      validate.errors,
      { separator: "; " },
    )}`,
  );
}

export async function readValidatedWorkflowPreview({
  cohortReceiptPath,
  verifiedKnowledge,
}) {
  const absoluteReceiptPath = path.resolve(cohortReceiptPath);
  const receiptRelativePath = path
    .relative(repositoryRoot, absoluteReceiptPath)
    .replaceAll("\\", "/");
  assert(
    portable(receiptRelativePath) &&
      receiptRelativePath.startsWith("dist/salt-sample-apps/") &&
      receiptRelativePath.endsWith("-cohort-receipt.json"),
    "Workflow preview cohort receipt path is outside the current artifact root",
  );
  const receiptBytes = await regularBytes(
    repositoryRoot,
    receiptRelativePath,
    "Workflow preview cohort receipt",
  );
  let receipt;
  try {
    receipt = JSON.parse(receiptBytes.toString("utf8"));
  } catch {
    throw new Error("Workflow preview cohort receipt is not JSON");
  }
  await validateCohortReceipt(receipt);

  const operationsApps = receipt.apps.filter(
    (entry) => entry.name === "operations-dashboard",
  );
  const operationsChecks = receipt.checks.filter(
    (entry) => entry.app === "operations-dashboard",
  );
  assert.equal(
    operationsApps.length,
    1,
    "Workflow preview receipt must contain one operations dashboard app",
  );
  assert.equal(
    operationsChecks.length,
    1,
    "Workflow preview receipt must contain one operations dashboard check",
  );
  const workflow = operationsChecks[0].workflow;
  assert(
    workflow?.status === "pass" && workflow.preview,
    "Current workflow preview evidence is missing",
  );

  const manifest = verifiedKnowledge?.manifest;
  assert(manifest, "Workflow preview requires verified Knowledge");
  for (const field of [
    "version",
    "bundle_digest",
    "semantic_digest",
    "semantic_source_digest",
    "compiler_digest",
  ]) {
    const manifestField = field === "version" ? "bundle_version" : field;
    assert.equal(
      receipt.knowledge_bundle[field],
      manifest[manifestField],
      `Workflow preview Knowledge ${field} is stale`,
    );
  }

  const packageNames = receipt.packages.map((entry) => entry.name);
  assert.deepEqual(
    packageNames,
    [...new Set(packageNames)].sort(comparePortablePaths),
    "Workflow preview package cohort is not sorted and unique",
  );
  const tarballParents = new Set();
  for (const entry of receipt.packages) {
    const tarballBytes = await regularBytes(
      repositoryRoot,
      entry.tarball.path,
      `${entry.name} retained tarball`,
    );
    assert.equal(
      tarballBytes.byteLength,
      entry.tarball.bytes,
      `${entry.name} retained tarball byte count changed`,
    );
    assert.equal(
      sha256(tarballBytes),
      entry.tarball.sha256,
      `${entry.name} retained tarball SHA-256 changed`,
    );
    assert.equal(
      sha512Integrity(tarballBytes),
      entry.tarball.integrity,
      `${entry.name} retained tarball integrity changed`,
    );
    tarballParents.add(path.posix.dirname(entry.tarball.path));
  }
  assert.equal(
    tarballParents.size,
    1,
    "Workflow preview package tarballs do not share one artifact root",
  );
  const [receiptArtifactRoot] = tarballParents;
  const receiptKey = path.posix
    .basename(receiptRelativePath)
    .slice(0, -"-cohort-receipt.json".length);
  assert(
    ["all", "operations-dashboard"].includes(receiptKey) &&
      receiptArtifactRoot === `dist/salt-sample-apps/${receiptKey}.artifacts`,
    "Workflow preview package artifact root is invalid",
  );

  const descriptor = workflow.preview;
  const recipeDescriptor = verifiedKnowledge.artifactDescriptors.find(
    (entry) => entry.path === descriptor.recipe.artifact,
  );
  assert(
    recipeDescriptor?.media_type === "application/json",
    "Current Knowledge omits the workflow recipe artifact",
  );
  const recipeBytes = await regularBytes(
    verifiedKnowledge.generatedRoot,
    descriptor.recipe.artifact,
    "Current workflow recipe artifact",
  );
  assert(
    recipeBytes.byteLength === recipeDescriptor.bytes &&
      sha256(recipeBytes) === recipeDescriptor.sha256 &&
      descriptor.recipe.artifact_sha256 === recipeDescriptor.sha256,
    "Workflow preview recipe artifact identity is stale",
  );
  const recipe = JSON.parse(recipeBytes.toString("utf8"));
  assert(
    recipe.id === WORKFLOW_ID &&
      recipe.source_identity?.content_identity ===
        descriptor.recipe.content_identity,
    "Workflow preview recipe content identity is stale",
  );
  for (const support of [
    ...(recipe.support?.reusable_packages ?? []),
    ...(recipe.support?.demo_packages ?? []),
  ]) {
    const matches = receipt.packages.filter(
      (entry) => entry.name === support.name,
    );
    assert(
      matches.length === 1 &&
        matches[0].version === support.version &&
        matches[0].used_by.includes("operations-dashboard"),
      `Workflow preview cohort does not match recipe support for ${support.name}`,
    );
  }

  const previewRoot = containedPath(
    repositoryRoot,
    `${receiptArtifactRoot}/${PREVIEW_DIRECTORY}`,
    "Workflow preview artifact root",
  );
  const actualFiles = await readPreviewTree(previewRoot, repositoryRoot);
  assertWorkflowPreviewReferenceClosure(actualFiles);
  const actualDescriptors = previewFileDescriptors(actualFiles);
  assert.equal(
    stableJson(descriptor.files),
    stableJson(actualDescriptors),
    "Workflow preview files are missing, extra, reordered, or stale",
  );
  assert.equal(
    descriptor.tree_sha256,
    workflowPreviewTreeSha256(descriptor.files),
    "Workflow preview tree digest is stale",
  );
  const entry = actualFiles.find((file) => file.path === descriptor.entry);
  assert.equal(
    entry?.media_type,
    "text/html; charset=utf-8",
    "Workflow preview entry is missing or is not HTML",
  );
  return {
    receipt: {
      path: receiptRelativePath,
      sha256: sha256(receiptBytes),
      bytes: receiptBytes.byteLength,
    },
    descriptor,
    files: actualFiles.map((file) => ({
      path: file.path,
      mediaType: file.media_type,
      bytes: file.content,
    })),
  };
}

export async function verifyCurrentCliCommands({
  invoke,
  appRoot,
  knowledgeManifest,
}) {
  const selection = ["--root", appRoot, "--project", "."];
  const infoResult = await invoke(["info", ...selection, "--json"]);
  const info = parseResult(infoResult, "salt-ds info");
  const projectedPaths = [
    info.project?.package_manifest?.path,
    info.project?.workspace?.packageRoot,
    ...(info.project?.packages?.map((entry) => entry.observed_manifest_path) ??
      []),
  ];
  const encodedRoot = JSON.stringify(appRoot).slice(1, -1);
  const serializedInfo = JSON.stringify(info);
  assert(
    info.contract === "salt-cli-info/1" &&
      info.project?.root === "." &&
      info.selection?.status === "selected" &&
      info.selection.reason_code === "SALT_PROJECT_SELECTED" &&
      info.coverage?.status === "complete" &&
      info.coverage.exact_project_package_vector === true &&
      info.compatibility?.compatible === true &&
      info.knowledge?.bundle_digest === knowledgeManifest.bundle_digest &&
      info.knowledge.semantic_digest === knowledgeManifest.semantic_digest &&
      info.project.packages.length > 0 &&
      projectedPaths.every(portable) &&
      (info.project.workspace.workspaceRoot === null ||
        portable(info.project.workspace.workspaceRoot)) &&
      !serializedInfo.includes(encodedRoot) &&
      !serializedInfo.includes(appRoot.replaceAll("\\", "/")),
    "salt-ds info did not prove the selected project and contained path projection",
  );

  const docsResult = await invoke([
    "docs",
    "component.button",
    ...selection,
    "--format",
    "json",
  ]);
  const docs = parseResult(docsResult, "salt-ds docs");
  assert(
    docs.contract === "salt-knowledge-document/1" &&
      docs.status === "resolved" &&
      docs.bundle?.digest === knowledgeManifest.bundle_digest &&
      docs.document?.reference?.id === "component.button" &&
      docs.document.citation?.record_key ===
        "record:component:component.button",
    "salt-ds docs did not return the cited Button record",
  );

  const contextResult = await invoke([
    "context",
    "Button",
    ...selection,
    "--format",
    "json",
    "--limit",
    "5",
  ]);
  const context = parseResult(contextResult, "salt-ds context");
  const contextBytes = Buffer.byteLength(contextResult.stdout, "utf8");
  assert(
    context.contract === "salt-knowledge-context/1" &&
      context.bundle_digest === knowledgeManifest.bundle_digest &&
      /^sha256:[0-9a-f]{64}$/u.test(context.context_digest) &&
      contextBytes <= 16 * 1024 &&
      context.matches?.some(
        (match) =>
          match.reference?.id === "component.button" &&
          match.citation?.record_key === "record:component:component.button",
      ),
    "salt-ds context did not return bounded, cited Button guidance",
  );

  return {
    read_only: true,
    info: {
      result: "pass",
      contract: info.contract,
      project_root: info.project.root,
      selection_status: info.selection.status,
      coverage_status: info.coverage.status,
      compatible: info.compatibility.compatible,
      observed_package_count: info.project.packages.length,
      paths: "repository_relative",
      bundle_digest: info.knowledge.bundle_digest,
      semantic_digest: info.knowledge.semantic_digest,
    },
    docs: {
      result: "pass",
      contract: docs.contract,
      status: docs.status,
      record_key: docs.document.citation.record_key,
      bundle_digest: docs.bundle.digest,
    },
    context: {
      result: "pass",
      contract: context.contract,
      match_count: context.matches.length,
      context_digest: context.context_digest,
      bytes: contextBytes,
      bundle_digest: context.bundle_digest,
    },
  };
}

export function unavailableAnalysis() {
  return {
    status: "not_run",
    availability: "unavailable",
    reason_code: "ANALYSIS_NOT_RUN",
    clean_result: false,
  };
}
