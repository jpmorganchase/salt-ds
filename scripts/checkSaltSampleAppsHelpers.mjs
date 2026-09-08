import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import path from "node:path";

import { repositoryTextBytes } from "./saltAiEvidenceUtils.mjs";

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
  return { id: recipe.id, manifestBytes: packageFile.bytes, files, recipe };
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
