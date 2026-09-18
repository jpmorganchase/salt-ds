import assert from "node:assert/strict";
import path from "node:path";

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
