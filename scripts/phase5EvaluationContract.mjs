import { spawnSync } from "node:child_process";
import { createHash, createHmac, createPublicKey, verify } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";
import { collectRuntimeReachableFiles } from "../packages/mcp/scripts/measureRuntimeReachableLoc.mjs";
import {
  canonicalizeSkillRecords,
  hashCanonicalSkillTree,
} from "./consumer-smoke/skillTreeHash.mjs";
import { isPortableArchivePath } from "./packageArchivePath.mjs";
import {
  assertPhase5TrustedEvaluatorIdentityVerified,
  createPhase5EvaluatorInputManifest,
  evaluatePhase5MachineObservation,
  getPhase5MachineCheckProfile,
  normalizePhase5TrustedEvaluatorIdentity,
  PHASE5_EVALUATOR_PROFILE_TIMEOUT_MS,
  PHASE5_EVALUATOR_VERSION_TIMEOUT_MS,
  PHASE5_REQUIRED_EVALUATOR_BINARY,
} from "./phase5ArtifactHarness.mjs";

export const PHASE5_PREREGISTRATION_PATH =
  "packages/mcp/eval-fixtures/phase5/preregistration.json";
export const PHASE5_PREREGISTRATION_LOCK_PATH =
  "packages/mcp/eval-fixtures/phase5/preregistration.lock.json";

const CATEGORY_NAMES = ["create", "migration", "review_retrieval_policy"];
const REQUIRED_CREATE_MIGRATION_CHECKS = [
  "compile",
  "render",
  "interaction",
  "accessibility",
  "mutation_scope",
];
const REQUIRED_REVIEW_CHECKS = [
  "claim_accuracy",
  "no_false_completion",
  "mutation_scope",
];
const REQUIRED_CRITICAL_FAILURES = [
  "unapproved_mutation",
  "false_completion",
  "fabricated_or_misbound_evidence",
  "non_convergent_required_workflow",
  "invalid_code_presented_as_ready",
];
const REQUIRED_COVERAGE_TAGS = [
  "ambiguity",
  "missing_context",
  "token_variants",
  "local_policy",
  "multi_file",
  "non_salt_react",
  "failure_recovery",
  "adversarial_policy",
  "accessibility",
  "mutation_scope",
];
const REQUIRED_BLIND_DIMENSIONS = [
  "task_correctness",
  "accessibility",
  "salt_fidelity",
  "unnecessary_changes",
  "user_questions",
  "recovery",
  "unsupported_claims",
];
const REQUIRED_MINIMAL_PRIMITIVES = [
  [
    "packages/mcp/src/core/search/searchSalt.ts",
    "bounded_lexical_discovery",
    "deterministic_lexical_retrieval_baseline_v1",
  ],
  [
    "packages/mcp/src/core/review/reviewSaltCode.ts",
    "submitted_text_review",
    "deterministic_submitted_text_review_baseline_v1",
  ],
  [
    "packages/mcp/src/core/review/reviewRuleRegistry.ts",
    "curated_rule_evaluation",
    "deterministic_curated_rule_baseline_v1",
  ],
  [
    "packages/mcp/src/core/review/submittedArtifactFacts.ts",
    "parse_once_submitted_facts",
    "deterministic_submitted_fact_parser_baseline_v1",
  ],
];
const REQUIRED_RESTORATION_THRESHOLDS = {
  restored_intelligence_success_lift_minimum: 0.1,
  restored_intelligence_ci_lower_bound_minimum: 0,
  restored_intelligence_efficiency_lift_minimum: 0.2,
};
const SIGNED_EVIDENCE_EVENT_ORDER = [
  ["capture_manifest_closed", "executor"],
  ["blind_packet_manifest_published", "coordinator"],
  ["primary_rating_submitted", "primary_rater"],
  ["primary_rating_submitted", "primary_rater"],
  ["adjudication_plan_published", "coordinator"],
  ["adjudication_submission_recorded", "adjudicator"],
  ["score_freeze_published", "coordinator"],
  ["mapping_revealed", "coordinator"],
  ["host_interoperability_verified", "host_verifier"],
  ["published_package_verified", "publisher_verifier"],
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function normalizeCanonical(value) {
  if (Array.isArray(value)) return value.map(normalizeCanonical);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, normalizeCanonical(value[key])]),
    );
  }
  return value;
}

export function canonicalJson(value) {
  return JSON.stringify(normalizeCanonical(value));
}

export function sha256Bytes(value) {
  return createHash("sha256").update(value).digest("hex");
}

function sha256File(filePath) {
  return sha256Bytes(fs.readFileSync(filePath));
}

function readNpmTarRegularEntries(tarballPathOrBytes) {
  const archive = gunzipSync(
    Buffer.isBuffer(tarballPathOrBytes)
      ? tarballPathOrBytes
      : fs.readFileSync(tarballPathOrBytes),
  );
  assert(
    archive.length % 512 === 0,
    "Tar archive is not aligned to complete 512-byte blocks.",
  );
  const seenPaths = new Set();
  const regularEntries = new Map();
  let sawCanonicalEndMarker = false;
  for (let offset = 0; offset + 512 <= archive.length; ) {
    const header = archive.subarray(offset, offset + 512);
    if (header.every((byte) => byte === 0)) {
      assert(
        offset + 1024 <= archive.length &&
          archive.subarray(offset, offset + 1024).every((byte) => byte === 0),
        "Tar archive omits its canonical two-block end marker.",
      );
      assert(
        archive.subarray(offset + 1024).every((byte) => byte === 0),
        "Tar archive contains nonzero trailing material after its end marker.",
      );
      sawCanonicalEndMarker = true;
      break;
    }
    const text = (start, length) =>
      header
        .subarray(start, start + length)
        .toString("utf8")
        .replace(/\0.*$/u, "");
    const name = text(0, 100);
    const prefix = text(345, 155);
    const entryPath = prefix ? `${prefix}/${name}` : name;
    assert(entryPath.length > 0, "Tar archive contains an empty entry path.");
    const portableEntryPath = entryPath.endsWith("/")
      ? entryPath.slice(0, -1)
      : entryPath;
    assert(
      isPortableArchivePath(portableEntryPath) &&
        (portableEntryPath === "package" ||
          portableEntryPath.startsWith("package/")),
      `Tar archive contains an unsafe npm path: ${entryPath}.`,
    );
    assert(
      !seenPaths.has(portableEntryPath),
      `Duplicate tar entry ${entryPath}.`,
    );
    seenPaths.add(portableEntryPath);
    const checksumText = text(148, 8).trim();
    assert(
      /^[0-7]+$/u.test(checksumText),
      `Invalid tar checksum field for ${entryPath}.`,
    );
    const checksumHeader = Buffer.from(header);
    checksumHeader.fill(0x20, 148, 156);
    const computedChecksum = checksumHeader.reduce(
      (total, byte) => total + byte,
      0,
    );
    assert(
      computedChecksum === Number.parseInt(checksumText, 8),
      `Tar checksum mismatch for ${entryPath}.`,
    );
    const sizeText = text(124, 12).trim();
    assert(
      /^[0-7]+$/u.test(sizeText || "0"),
      `Invalid tar size for ${entryPath}.`,
    );
    const size = Number.parseInt(sizeText || "0", 8);
    const dataStart = offset + 512;
    const dataEnd = dataStart + size;
    assert(dataEnd <= archive.length, `Truncated tar entry ${entryPath}.`);
    const nextOffset = dataStart + Math.ceil(size / 512) * 512;
    assert(
      nextOffset <= archive.length &&
        archive.subarray(dataEnd, nextOffset).every((byte) => byte === 0),
      `Tar entry ${entryPath} contains nonzero padding bytes.`,
    );
    const typeFlag = header[156];
    assert(
      typeFlag === 0 || typeFlag === 0x30 || typeFlag === 0x35,
      `Tar archive contains unsupported entry type ${typeFlag} at ${entryPath}.`,
    );
    if (typeFlag === 0 || typeFlag === 0x30) {
      regularEntries.set(entryPath, archive.subarray(dataStart, dataEnd));
    } else {
      assert(
        size === 0,
        `Tar directory ${entryPath} contains unexpected data.`,
      );
    }
    offset = nextOffset;
  }
  assert(
    sawCanonicalEndMarker,
    "Tar archive omits its canonical two-block end marker.",
  );
  return regularEntries;
}

export function readPhase5NpmTarEntry(tarballPath, expectedPath) {
  const entry = readNpmTarRegularEntries(tarballPath).get(expectedPath);
  assert(entry !== undefined, `Missing regular tar entry ${expectedPath}.`);
  return entry;
}

export function inspectPhase5NpmTar(tarballBytes) {
  return [...readNpmTarRegularEntries(tarballBytes)].map(
    ([entryPath, bytes]) => ({
      path: entryPath,
      bytes: bytes.byteLength,
      sha256: sha256Bytes(bytes),
    }),
  );
}

function validatePhase5CatalogCandidate({
  manifestBytes,
  packagePath,
  repoRoot,
}) {
  const manifest = JSON.parse(manifestBytes.toString("utf8"));
  const workspaceManifestBytes = fs.readFileSync(
    path.resolve(repoRoot, "packages/mcp/generated/catalog-manifest.json"),
  );
  assert(
    manifestBytes.equals(workspaceManifestBytes),
    "Minimal architecture archived and workspace catalog manifests differ.",
  );
  assert(
    Array.isArray(manifest.artifacts) &&
      Array.isArray(manifest.build_artifacts) &&
      Array.isArray(manifest.support_artifacts) &&
      Array.isArray(manifest.inputs),
    "Minimal architecture catalog manifest has incomplete artifact metadata.",
  );

  const publicationEntries = [
    ...manifest.artifacts,
    ...manifest.support_artifacts,
  ];
  const generations = new Set(
    [...publicationEntries, ...manifest.build_artifacts].map((entry) =>
      path.posix.dirname(entry.file),
    ),
  );
  assert(
    generations.size === 1,
    "Minimal architecture catalog manifest spans multiple generations.",
  );
  const [generation] = generations;
  assert(
    /^catalog-generations\/[0-9a-f]{64}$/u.test(generation),
    "Minimal architecture catalog generation is malformed.",
  );
  const generationPrefix = `${generation}/`;
  const stripGeneration = (file) => {
    assert(
      typeof file === "string" && file.startsWith(generationPrefix),
      `Catalog artifact is outside the active generation: ${String(file)}`,
    );
    return file.slice(generationPrefix.length);
  };

  const tarEntries = readNpmTarRegularEntries(packagePath);
  const publishedFiles = new Set();
  for (const entry of publicationEntries) {
    assert(
      typeof entry.file === "string" && !publishedFiles.has(entry.file),
      `Catalog publication contains a duplicate file: ${String(entry.file)}`,
    );
    publishedFiles.add(entry.file);
    const bytes = tarEntries.get(`package/generated/${entry.file}`);
    assert(
      bytes !== undefined,
      `Packed catalog artifact is missing: ${entry.file}`,
    );
    assert(
      bytes.byteLength === entry.bytes &&
        `sha256:${sha256Bytes(bytes)}` === entry.sha256,
      `Packed catalog artifact drifted: ${entry.file}`,
    );
  }

  const packagedGeneratedFiles = [...tarEntries.keys()]
    .filter((entryPath) => entryPath.startsWith("package/generated/"))
    .map((entryPath) => entryPath.slice("package/generated/".length))
    .sort();
  const expectedPackagedGeneratedFiles = [
    "catalog-manifest.json",
    ...publicationEntries.map((entry) => entry.file),
  ].sort();
  assert(
    canonicalJson(packagedGeneratedFiles) ===
      canonicalJson(expectedPackagedGeneratedFiles),
    "Packed catalog publication inventory has missing or unexpected files.",
  );

  const contentPacks = manifest.support_artifacts.filter(
    (entry) => entry.kind === "content_pack",
  );
  assert(
    contentPacks.length === 1,
    "Catalog manifest must bind one content pack.",
  );
  const expectedSemanticDigest = `sha256:${sha256Bytes(
    canonicalJson({
      catalog_version: manifest.catalog_version,
      canonical_artifacts: manifest.artifacts
        .filter((entry) => entry.canonical)
        .map((entry) => ({
          family: entry.family,
          sha256: entry.sha256,
          bytes: entry.bytes,
          record_count: entry.record_count,
          codec: entry.codec,
        })),
      content_pack: {
        sha256: contentPacks[0].sha256,
        bytes: contentPacks[0].bytes,
      },
    }),
  )}`;
  assert(
    manifest.semantic_digest === expectedSemanticDigest,
    "Minimal architecture catalog semantic digest is not self-consistent.",
  );
  const expectedInputDigest = `sha256:${sha256Bytes(canonicalJson(manifest.inputs))}`;
  assert(
    manifest.input_inventory_digest === expectedInputDigest &&
      manifest.source_revision === expectedInputDigest,
    "Minimal architecture catalog input identity is not self-consistent.",
  );

  const packageInventories = manifest.support_artifacts.filter(
    (entry) => entry.kind === "package_inventory",
  );
  const schemas = manifest.support_artifacts.filter(
    (entry) => entry.kind === "json_schema",
  );
  assert(
    packageInventories.length === 1 && schemas.length === 1,
    "Catalog manifest must bind one package inventory and one JSON schema.",
  );
  const publicationInventory = JSON.parse(
    tarEntries
      .get(`package/generated/${packageInventories[0].file}`)
      .toString("utf8"),
  );
  assert(
    publicationInventory.generation === generation &&
      publicationInventory.schema_version === manifest.schema_version &&
      publicationInventory.semantic_digest === manifest.semantic_digest &&
      canonicalJson(publicationInventory.files) ===
        canonicalJson(expectedPackagedGeneratedFiles),
    "Packed catalog publication inventory is not manifest-complete.",
  );

  const packageFileNames = [
    ...manifest.artifacts.map((entry) => path.posix.basename(entry.file)),
    path.posix.basename(contentPacks[0].file),
    path.posix.basename(schemas[0].file),
    "catalog-manifest.json",
    "catalog-package-files.json",
  ].sort();
  const internalInventoryBytes = Buffer.from(
    `${canonicalJson({
      schema_version: manifest.schema_version,
      files: packageFileNames,
    })}\n`,
    "utf8",
  );
  const generationManifest = {
    ...manifest,
    artifacts: manifest.artifacts.map((entry) => ({
      ...entry,
      file: stripGeneration(entry.file),
    })),
    build_artifacts: manifest.build_artifacts.map((entry) => ({
      ...entry,
      file: stripGeneration(entry.file),
    })),
    support_artifacts: manifest.support_artifacts.map((entry) =>
      entry.kind === "package_inventory"
        ? {
            ...entry,
            file: "catalog-package-files.json",
            sha256: `sha256:${sha256Bytes(internalInventoryBytes)}`,
            bytes: internalInventoryBytes.byteLength,
          }
        : { ...entry, file: stripGeneration(entry.file) },
    ),
  };
  const expectedGeneration = `catalog-generations/${sha256Bytes(
    canonicalJson(generationManifest),
  )}`;
  assert(
    generation === expectedGeneration,
    "Minimal architecture catalog generation identity is not self-consistent.",
  );
  return manifest;
}

export function validatePhase5ReplayBinding(architecture, repoRoot) {
  const packagePath = resolveRepoBoundPath(
    repoRoot,
    architecture.package_path,
    `Architecture ${architecture.id} package`,
  );
  const manifestPath = resolveRepoBoundPath(
    repoRoot,
    architecture.install_manifest_path,
    `Architecture ${architecture.id} install manifest`,
  );
  const lockfilePath = resolveRepoBoundPath(
    repoRoot,
    architecture.lockfile_path,
    `Architecture ${architecture.id} replay lockfile`,
  );
  for (const [filePath, label] of [
    [packagePath, "package"],
    [manifestPath, "install manifest"],
    [lockfilePath, "replay lockfile"],
  ]) {
    assert(
      fs.lstatSync(filePath).isFile(),
      `Architecture ${architecture.id} ${label} is not a regular file.`,
    );
  }
  assert(
    sha256File(packagePath) === architecture.package_sha256 &&
      sha256File(manifestPath) === architecture.install_manifest_sha256 &&
      sha256File(lockfilePath) === architecture.lockfile_sha256,
    `Architecture ${architecture.id} replay files drifted.`,
  );
  const tarBasename = path.basename(packagePath);
  assert(
    tarBasename === path.posix.basename(architecture.package_path) &&
      /^[A-Za-z0-9._-]+\.tgz$/u.test(tarBasename),
    `Architecture ${architecture.id} package has a non-portable tar name.`,
  );
  const packageIntegrity = `sha512-${createHash("sha512")
    .update(fs.readFileSync(packagePath))
    .digest("base64")}`;
  const packedPackage = JSON.parse(
    readPhase5NpmTarEntry(packagePath, "package/package.json").toString("utf8"),
  );
  assert(
    packedPackage.name === architecture.package_name &&
      packedPackage.version === architecture.package_version &&
      architecture.package_name === "@salt-ds/mcp" &&
      /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/u.test(architecture.package_version),
    `Architecture ${architecture.id} tar package identity drifted.`,
  );
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const manifestSpec = manifest.dependencies?.[architecture.package_name];
  const expectedManifestSpec = `file:./${tarBasename}`;
  assert(
    manifest.private === true &&
      typeof manifest.name === "string" &&
      manifest.name.length > 0 &&
      typeof manifest.version === "string" &&
      manifest.version.length > 0 &&
      canonicalJson(Object.keys(manifest.dependencies ?? {})) ===
        canonicalJson([architecture.package_name]) &&
      manifestSpec === expectedManifestSpec &&
      fs.realpathSync(path.resolve(path.dirname(manifestPath), tarBasename)) ===
        packagePath,
    `Architecture ${architecture.id} install manifest is not an exact local-tar replay.`,
  );
  const lock = JSON.parse(fs.readFileSync(lockfilePath, "utf8"));
  const root = lock.packages?.[""];
  const installed =
    lock.packages?.[`node_modules/${architecture.package_name}`];
  assert(
    lock.lockfileVersion === 3 &&
      lock.requires === true &&
      lock.name === manifest.name &&
      lock.version === manifest.version &&
      root?.name === manifest.name &&
      root?.version === manifest.version &&
      canonicalJson(root?.dependencies) ===
        canonicalJson(manifest.dependencies) &&
      installed &&
      installed.resolved === `file:${tarBasename}` &&
      installed.integrity === packageIntegrity &&
      installed.version === architecture.package_version,
    `Architecture ${architecture.id} replay lock does not resolve the exact local tarball.`,
  );
  for (const field of ["dependencies", "bin", "engines", "license"]) {
    assert(
      canonicalJson(installed[field] ?? null) ===
        canonicalJson(packedPackage[field] ?? null),
      `Architecture ${architecture.id} replay lock misbinds package ${field}.`,
    );
  }
  return {
    architecture_id: architecture.id,
    package_path: architecture.package_path,
    package_sha256: architecture.package_sha256,
    package_integrity_sha512: packageIntegrity,
    package_name: architecture.package_name,
    package_version: architecture.package_version,
    manifest_sha256: architecture.install_manifest_sha256,
    lockfile_sha256: architecture.lockfile_sha256,
    manifest_local_spec: manifestSpec,
    lock_resolved_spec: installed.resolved,
  };
}

function isSha256(value) {
  return typeof value === "string" && /^[0-9a-f]{64}$/u.test(value);
}

function assertExternalFingerprintSet(
  configuredFingerprints,
  trustedKeyFingerprints,
  message,
) {
  assert(
    Array.isArray(trustedKeyFingerprints) &&
      trustedKeyFingerprints.length === configuredFingerprints.size,
    message,
  );
  const supplied = new Map();
  for (const entry of trustedKeyFingerprints) {
    assert(
      entry &&
        typeof entry.key_id === "string" &&
        isSha256(entry.sha256) &&
        !supplied.has(entry.key_id),
      message,
    );
    supplied.set(entry.key_id, entry.sha256);
  }
  assert(
    supplied.size === configuredFingerprints.size &&
      [...configuredFingerprints].every(
        ([keyId, fingerprint]) => supplied.get(keyId) === fingerprint,
      ),
    message,
  );
}

function isSafeRelativePath(value) {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    !path.isAbsolute(value) &&
    !value.includes("\\") &&
    !value
      .split("/")
      .some(
        (segment) =>
          segment.length === 0 || segment === "." || segment === "..",
      )
  );
}

function resolveRepoBoundPath(repoRoot, relativePath, label) {
  assert(
    isSafeRelativePath(relativePath),
    `${label} must be a safe repository-relative path.`,
  );
  const canonicalRoot = fs.realpathSync(repoRoot);
  const candidate = path.resolve(canonicalRoot, ...relativePath.split("/"));
  assert(fs.existsSync(candidate), `${label} does not exist.`);
  const canonicalCandidate = fs.realpathSync(candidate);
  const relative = path.relative(canonicalRoot, canonicalCandidate);
  assert(
    relative !== "" &&
      relative !== ".." &&
      !relative.startsWith(`..${path.sep}`) &&
      !path.isAbsolute(relative),
    `${label} escapes the repository root.`,
  );
  return canonicalCandidate;
}

export function computePreregistrationDigest(preregistration) {
  return `sha256:${sha256Bytes(canonicalJson(preregistration))}`;
}

export function loadPhase5Preregistration(repoRoot) {
  return JSON.parse(
    fs.readFileSync(path.join(repoRoot, PHASE5_PREREGISTRATION_PATH), "utf8"),
  );
}

function validateTask(preregistration, task, repoRoot) {
  assert(
    task && typeof task === "object" && /^[a-z][a-z0-9_]+$/u.test(task.id),
    "Every Phase 5 task requires a stable snake-case id.",
  );
  assert(
    CATEGORY_NAMES.includes(task.category),
    `Task ${task.id} has an invalid category.`,
  );
  assert(
    typeof task.prompt === "string" && task.prompt.trim().length >= 20,
    `Task ${task.id} has no substantive prompt.`,
  );
  assert(
    typeof task.fixture === "string" &&
      isSafeRelativePath(task.fixture) &&
      fs.existsSync(path.resolve(repoRoot, ...task.fixture.split("/"))),
    `Task ${task.id} fixture is missing or not repository-relative.`,
  );
  assert(
    Array.isArray(task.tags) && task.tags.length > 0,
    `Task ${task.id} has no coverage tags.`,
  );
  assert(
    Array.isArray(task.artifact_checks) && task.artifact_checks.length > 0,
    `Task ${task.id} has no artifact checks.`,
  );
  assert(
    task.artifact_checks.length === new Set(task.artifact_checks).size,
    `Task ${task.id} repeats an artifact check.`,
  );
  for (const checkName of task.artifact_checks) {
    getPhase5MachineCheckProfile(checkName);
  }
  const requiredChecks =
    task.category === "review_retrieval_policy"
      ? REQUIRED_REVIEW_CHECKS
      : REQUIRED_CREATE_MIGRATION_CHECKS;
  for (const check of requiredChecks) {
    assert(
      task.artifact_checks.includes(check),
      `Task ${task.id} omits required ${check} evidence.`,
    );
  }
  if (task.scripted_user_response !== null) {
    assert(
      typeof preregistration.scripted_user_responses?.[
        task.scripted_user_response
      ] === "string",
      `Task ${task.id} references an unknown scripted user response.`,
    );
  }
  if (task.setup !== undefined) {
    assert(
      task.setup.kind === "copy_fixture_file" &&
        isSafeRelativePath(task.setup.source) &&
        isSafeRelativePath(task.setup.destination) &&
        isSha256(task.setup.source_sha256),
      `Task ${task.id} has an invalid setup contract.`,
    );
    assert(
      task.setup.preflight?.executable === "corepack" &&
        JSON.stringify(task.setup.preflight.args) ===
          JSON.stringify(["yarn", "ui:verify"]) &&
        task.setup.preflight.expected_exit === "nonzero" &&
        task.setup.preflight.expected_diagnostic === "TS2322" &&
        task.setup.postflight?.executable === "corepack" &&
        JSON.stringify(task.setup.postflight.args) ===
          JSON.stringify(["yarn", "ui:verify"]) &&
        task.setup.postflight.expected_exit === 0,
      `Task ${task.id} does not freeze the recovery preflight and postflight.`,
    );
    const setupPath = resolveRepoBoundPath(
      repoRoot,
      task.setup.source,
      `Task ${task.id} setup source`,
    );
    assert(
      fs.existsSync(setupPath) &&
        sha256File(setupPath) === task.setup.source_sha256,
      `Task ${task.id} setup source drifted.`,
    );
  }
}

/**
 * @param {any} preregistration
 * @param {{repoRoot: string, verifyBoundFiles?: boolean, verifyLock?: boolean, trustedKeyFingerprints?: Array<{key_id: string, sha256: string}> | null, requireExternalTrust?: boolean}} options
 */
export async function validatePhase5Preregistration(
  preregistration,
  {
    repoRoot,
    verifyBoundFiles = true,
    verifyLock = true,
    trustedKeyFingerprints = null,
    requireExternalTrust = true,
  } = { repoRoot: "" },
) {
  assert(repoRoot, "Phase 5 preregistration validation requires repoRoot.");
  assert(
    preregistration?.contract === "salt_phase5_real_agent_preregistration_v1",
    "Unsupported Phase 5 preregistration contract.",
  );
  assert(
    preregistration.status === "preregistered_external_execution_blocked",
    "Phase 5 preregistration must remain blocked until real runs are imported.",
  );
  assert(
    typeof preregistration.frozen_at === "string" &&
      Number.isFinite(Date.parse(preregistration.frozen_at)),
    "Phase 5 preregistration must record its freeze time before any run.",
  );
  const host = preregistration.primary_host;
  for (const field of ["host", "model", "reasoning_effort", "service_tier"]) {
    assert(
      typeof host?.[field] === "string" && host[field],
      `Primary host omits ${field}.`,
    );
  }
  assert(
    Array.isArray(preregistration.secondary_hosts) &&
      preregistration.secondary_hosts.length === 0,
    "Phase 5 v1 does not claim or silently skip secondary hosts.",
  );
  assert(
    preregistration.evidence_trust?.contract ===
      "salt_phase5_evidence_trust_v1" &&
      ["unconfigured_external_blocker", "configured"].includes(
        preregistration.evidence_trust.status,
      ) &&
      preregistration.evidence_trust.signature_algorithm === "ed25519" &&
      preregistration.evidence_trust.trust_anchor ===
        "external_out_of_repository_fingerprint_set_v1" &&
      preregistration.evidence_trust.event_chain ===
        "sha256_previous_signed_event" &&
      Array.isArray(preregistration.evidence_trust.trusted_keys),
    "Phase 5 evidence trust configuration is invalid.",
  );
  if (
    preregistration.evidence_trust.status === "unconfigured_external_blocker"
  ) {
    assert(
      preregistration.evidence_trust.trusted_keys.length === 0,
      "Blocked Phase 5 evidence trust may not contain locally trusted keys.",
    );
  } else {
    const keyIds = new Set();
    const keyFingerprints = new Set();
    const configuredFingerprints = new Map();
    for (const key of preregistration.evidence_trust.trusted_keys) {
      assert(
        key &&
          /^[a-z][a-z0-9_-]+$/u.test(key.key_id) &&
          SIGNED_EVIDENCE_EVENT_ORDER.some(([, role]) => role === key.role) &&
          typeof key.public_key_pem === "string" &&
          key.public_key_pem.includes("BEGIN PUBLIC KEY") &&
          !keyIds.has(key.key_id),
        "Configured Phase 5 evidence trust contains an invalid or duplicate key.",
      );
      const publicKey = createPublicKey(key.public_key_pem);
      assert(
        publicKey.asymmetricKeyType === "ed25519",
        "Configured Phase 5 evidence trust contains a non-Ed25519 public key.",
      );
      const fingerprint = sha256Bytes(
        publicKey.export({ type: "spki", format: "der" }),
      );
      assert(
        !keyFingerprints.has(fingerprint),
        "Configured Phase 5 evidence trust reuses public key material across independent roles.",
      );
      keyIds.add(key.key_id);
      keyFingerprints.add(fingerprint);
      configuredFingerprints.set(key.key_id, fingerprint);
    }
    const roleCounts = Object.fromEntries(
      [
        "executor",
        "coordinator",
        "primary_rater",
        "adjudicator",
        "host_verifier",
        "publisher_verifier",
      ].map((role) => [
        role,
        preregistration.evidence_trust.trusted_keys.filter(
          (key) => key.role === role,
        ).length,
      ]),
    );
    assert(
      roleCounts.executor === 1 &&
        roleCounts.coordinator === 1 &&
        roleCounts.primary_rater === 2 &&
        roleCounts.adjudicator === 1 &&
        roleCounts.host_verifier === 1 &&
        roleCounts.publisher_verifier === 1,
      "Configured Phase 5 evidence trust must freeze seven role-separated public keys.",
    );
    if (requireExternalTrust) {
      assertExternalFingerprintSet(
        configuredFingerprints,
        trustedKeyFingerprints,
        "Configured Phase 5 evidence trust is not pinned by the external fingerprint set.",
      );
    }
  }

  assert(
    Array.isArray(preregistration.architectures) &&
      preregistration.architectures.length === 2,
    "Phase 5 requires exactly the captured baseline and minimal architecture arms.",
  );
  const architectureIds = new Set(
    preregistration.architectures.map((architecture) => architecture.id),
  );
  assert(architectureIds.size === 2, "Architecture ids must be unique.");
  assert(
    preregistration.architectures.some(
      (architecture) => architecture.kind === "captured_baseline",
    ) &&
      preregistration.architectures.some(
        (architecture) => architecture.kind === "minimal_architecture",
      ),
    "Phase 5 architecture kinds are incomplete.",
  );
  for (const architecture of preregistration.architectures) {
    assert(
      typeof architecture.package_name === "string" &&
        /^@[a-z0-9._-]+\/[a-z0-9._-]+$/u.test(architecture.package_name) &&
        typeof architecture.package_version === "string" &&
        /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/u.test(
          architecture.package_version,
        ) &&
        isSha256(architecture.package_sha256) &&
        isSha256(architecture.install_manifest_sha256) &&
        isSha256(architecture.lockfile_sha256),
      `Architecture ${architecture.id} has incomplete exact replay identity.`,
    );
    assert(
      Array.isArray(architecture.public_tools) &&
        architecture.public_tools.length > 0 &&
        architecture.public_tools.length ===
          new Set(architecture.public_tools).size &&
        architecture.public_tools.every(
          (toolName) =>
            typeof toolName === "string" && /^[a-z][a-z0-9_]+$/u.test(toolName),
        ),
      `Architecture ${architecture.id} has no exact public-tool inventory.`,
    );
    resolveRepoBoundPath(
      repoRoot,
      architecture.package_path,
      `Architecture ${architecture.id} package`,
    );
    resolveRepoBoundPath(
      repoRoot,
      architecture.install_manifest_path,
      `Architecture ${architecture.id} replay manifest`,
    );
    resolveRepoBoundPath(
      repoRoot,
      architecture.lockfile_path,
      `Architecture ${architecture.id} replay lock`,
    );
  }

  const tasks = preregistration.tasks;
  assert(
    Array.isArray(tasks) && tasks.length >= 30,
    "Phase 5 requires at least 30 tasks.",
  );
  const taskIds = new Set();
  const categoryCounts = Object.fromEntries(
    CATEGORY_NAMES.map((name) => [name, 0]),
  );
  const observedTags = new Set();
  for (const task of tasks) {
    validateTask(preregistration, task, repoRoot);
    assert(!taskIds.has(task.id), `Duplicate Phase 5 task id ${task.id}.`);
    taskIds.add(task.id);
    categoryCounts[task.category] += 1;
    for (const tag of task.tags) observedTags.add(tag);
  }
  for (const category of CATEGORY_NAMES) {
    assert(
      categoryCounts[category] >= 10,
      `Phase 5 category ${category} has fewer than 10 tasks.`,
    );
  }
  assert(
    JSON.stringify(preregistration.required_coverage_tags) ===
      JSON.stringify(REQUIRED_COVERAGE_TAGS),
    "Phase 5 required coverage tags changed.",
  );
  for (const tag of REQUIRED_COVERAGE_TAGS) {
    assert(
      observedTags.has(tag),
      `Phase 5 task matrix omits required ${tag} coverage.`,
    );
  }
  const referencedFixtures = new Set(tasks.map((task) => task.fixture));
  const fixtureBindings = preregistration.fixture_bindings;
  assert(
    Array.isArray(fixtureBindings) &&
      fixtureBindings.length === referencedFixtures.size,
    "Phase 5 fixture bindings must cover exactly the referenced fixtures.",
  );
  const boundFixtures = new Set();
  for (const binding of fixtureBindings) {
    assert(
      referencedFixtures.has(binding.path) && !boundFixtures.has(binding.path),
      `Unexpected or duplicate Phase 5 fixture binding ${binding.path}.`,
    );
    boundFixtures.add(binding.path);
    assert(
      isSha256(binding.sha256),
      `Fixture ${binding.path} has no source digest.`,
    );
    const fixturePath = resolveRepoBoundPath(
      repoRoot,
      binding.path,
      `Fixture ${binding.path}`,
    );
    const stats = fs.lstatSync(fixturePath);
    if (binding.kind === "sha256_file") {
      assert(stats.isFile(), `Fixture ${binding.path} is not a file.`);
      assert(
        sha256File(fixturePath) === binding.sha256,
        `Fixture ${binding.path} drifted.`,
      );
    } else {
      assert(
        binding.kind === "salt_skill_tree_v1" && stats.isDirectory(),
        `Fixture ${binding.path} has an invalid binding kind.`,
      );
      const fixtureTree = await hashCanonicalSkillTree(fixturePath);
      assert(
        fixtureTree.sha256 === binding.sha256,
        `Fixture ${binding.path} drifted.`,
      );
    }
  }
  assert(
    tasks.find((task) => task.id === "create_compile_recovery")?.setup?.kind ===
      "copy_fixture_file",
    "The compile-recovery task must bind an executable seeded failure setup.",
  );

  const runPlan = preregistration.run_plan;
  assert(
    runPlan?.runs_per_task_architecture_host >= 3 &&
      runPlan.randomization_algorithm === "paired_block_sha256_v1" &&
      typeof runPlan.randomization_seed === "string" &&
      runPlan.randomization_seed.length >= 16 &&
      runPlan.fresh_conversation_required === true &&
      runPlan.fresh_worktree_required === true &&
      runPlan.missing_run_policy === "failure" &&
      runPlan.provider_calls_in_release_verification === false &&
      runPlan.evaluation_commit_policy ===
        "capture_one_commit_containing_the_frozen_preregistration_for_every_fresh_worktree",
    "Phase 5 run-plan independence or release isolation is incomplete.",
  );
  assert(
    preregistration.artifact_harness?.required_evaluator_binary ===
      PHASE5_REQUIRED_EVALUATOR_BINARY &&
      preregistration.artifact_harness?.evaluator_resolution ===
        "external_trust_file_absolute_path_digest_and_version" &&
      preregistration.artifact_harness?.version_probe_timeout_ms ===
        PHASE5_EVALUATOR_VERSION_TIMEOUT_MS &&
      preregistration.artifact_harness?.profile_timeout_ms ===
        PHASE5_EVALUATOR_PROFILE_TIMEOUT_MS &&
      preregistration.artifact_harness?.check_profiles ===
        "closed_profile_specific_observations_no_caller_pass_bits",
    "Phase 5 artifact checking is not bound to the closed evaluator profile registry.",
  );
  const expectedSessions =
    tasks.length *
    preregistration.architectures.length *
    runPlan.runs_per_task_architecture_host;
  assert(
    runPlan.minimum_primary_sessions === expectedSessions,
    `Phase 5 primary session count must be exactly ${expectedSessions}.`,
  );
  for (const [name, value] of Object.entries(REQUIRED_RESTORATION_THRESHOLDS)) {
    assert(
      preregistration.statistics?.[name] === value,
      `Phase 5 restored-intelligence threshold ${name} changed.`,
    );
  }
  const artifactHarness = preregistration.artifact_harness;
  assert(
    artifactHarness?.contract === "phase5_artifact_harness_v2" &&
      artifactHarness.execution === "direct_spawn_without_shell" &&
      isSha256(artifactHarness.sha256) &&
      sha256File(
        resolveRepoBoundPath(
          repoRoot,
          artifactHarness.path,
          "Phase 5 artifact harness",
        ),
      ) === artifactHarness.sha256,
    "Phase 5 artifact harness is missing, mutable, or permits shell execution.",
  );

  for (const failure of REQUIRED_CRITICAL_FAILURES) {
    assert(
      preregistration.critical_failures?.includes(failure),
      `Phase 5 critical-failure taxonomy omits ${failure}.`,
    );
  }
  const rubric = preregistration.rubric;
  assert(
    JSON.stringify(rubric?.blind_dimensions) ===
      JSON.stringify(REQUIRED_BLIND_DIMENSIONS) &&
      rubric.score_minimum === 0 &&
      rubric.score_maximum === 4 &&
      rubric.score_passing_minimum === 3 &&
      rubric.score_orientation === "higher_is_better" &&
      rubric.subjective_raters === 2 &&
      rubric.adjudicator_raters === 1 &&
      rubric.adjudication_difference_strictly_greater_than === 1 &&
      rubric.adjudication ===
        "median_of_three_for_planned_cells_otherwise_mean_of_two" &&
      rubric.run_subjective_pass ===
        "every_dimension_at_or_above_passing_minimum",
    "Phase 5 blind-scoring and adjudication rubric changed.",
  );
  const statistics = preregistration.statistics;
  assert(
    statistics?.confidence_level === 0.95,
    "Confidence level must be preregistered at 95%.",
  );
  assert(
    statistics.estimator === "paired_task_cluster_bootstrap",
    "Estimator must be task-clustered and paired.",
  );
  assert(
    statistics.bootstrap_samples === 10_000,
    "Bootstrap sample count must be frozen at 10,000.",
  );
  assert(
    statistics.missing_data === "failure",
    "Missing runs must count as failures.",
  );
  assert(
    statistics.minimal_noninferiority_margin === -0.1,
    "Non-inferiority margin must be -10 points.",
  );
  assert(
    statistics.overall_success_minimum === 0.85,
    "Overall success floor must be 85%.",
  );
  assert(
    statistics.category_success_minimum === 0.8,
    "Category success floor must be 80%.",
  );
  assert(
    statistics.critical_failure_maximum === 0,
    "Critical-failure maximum must be zero.",
  );

  const allowlist = preregistration.minimal_primitive_allowlist;
  assert(
    Array.isArray(allowlist) && allowlist.length > 0,
    "Minimal primitive allowlist is absent.",
  );
  for (const entry of allowlist) {
    assert(
      isSha256(entry.sha256),
      `Minimal primitive ${entry.path} has no source digest.`,
    );
    const sourcePath = path.resolve(repoRoot, entry.path);
    assert(
      fs.existsSync(sourcePath),
      `Minimal primitive source is missing: ${entry.path}`,
    );
    if (verifyBoundFiles) {
      assert(
        sha256File(sourcePath) === entry.sha256,
        `Minimal primitive source drifted: ${entry.path}`,
      );
    }
  }

  if (verifyBoundFiles) {
    for (const architecture of preregistration.architectures) {
      validatePhase5ReplayBinding(architecture, repoRoot);
    }
    const baseline = preregistration.architectures.find(
      (architecture) => architecture.kind === "captured_baseline",
    );
    assert(
      sha256File(
        resolveRepoBoundPath(
          repoRoot,
          baseline.package_path,
          "Captured baseline package",
        ),
      ) === baseline.package_sha256,
      "Captured baseline package digest drifted.",
    );
    assert(
      sha256File(
        resolveRepoBoundPath(
          repoRoot,
          baseline.lockfile_path,
          "Captured baseline lockfile",
        ),
      ) === baseline.lockfile_sha256,
      "Captured baseline lockfile digest drifted.",
    );
    assert(
      sha256File(
        resolveRepoBoundPath(
          repoRoot,
          baseline.install_manifest_path,
          "Captured baseline install manifest",
        ),
      ) === baseline.install_manifest_sha256,
      "Captured baseline install manifest digest drifted.",
    );
    const minimal = preregistration.architectures.find(
      (architecture) => architecture.kind === "minimal_architecture",
    );
    assert(
      JSON.stringify(minimal.public_tools) ===
        JSON.stringify([
          "search_salt",
          "inspect_salt_project",
          "review_salt_code",
        ]),
      "Minimal architecture public tool set changed.",
    );
    assert(
      sha256File(
        resolveRepoBoundPath(
          repoRoot,
          minimal.package_path,
          "Minimal architecture package",
        ),
      ) === minimal.package_sha256,
      "Minimal architecture package digest drifted.",
    );
    assert(
      sha256File(
        resolveRepoBoundPath(
          repoRoot,
          minimal.lockfile_path,
          "Minimal architecture lockfile",
        ),
      ) === minimal.lockfile_sha256,
      "Minimal architecture lockfile digest drifted.",
    );
    assert(
      sha256File(
        resolveRepoBoundPath(
          repoRoot,
          minimal.install_manifest_path,
          "Minimal architecture install manifest",
        ),
      ) === minimal.install_manifest_sha256,
      "Minimal architecture install manifest digest drifted.",
    );
    const minimalPackagePath = resolveRepoBoundPath(
      repoRoot,
      minimal.package_path,
      "Minimal architecture package",
    );
    const manifestBytes = readPhase5NpmTarEntry(
      minimalPackagePath,
      "package/generated/catalog-manifest.json",
    );
    assert(
      sha256Bytes(manifestBytes) === minimal.catalog_manifest_sha256,
      "Minimal architecture catalog manifest drifted.",
    );
    const manifest = validatePhase5CatalogCandidate({
      manifestBytes,
      packagePath: minimalPackagePath,
      repoRoot,
    });
    assert(
      manifest.semantic_digest === minimal.catalog_semantic_digest,
      "Minimal architecture catalog semantic identity drifted.",
    );
    const skillTree = await hashCanonicalSkillTree(
      path.resolve(repoRoot, "packages/skills/salt-ds"),
    );
    assert(
      skillTree.sha256 === minimal.skill_tree_sha256,
      "Minimal architecture Salt skill tree drifted.",
    );
    auditPhase5RuntimeIntelligence(preregistration, repoRoot);
  }

  const result = {
    digest: computePreregistrationDigest(preregistration),
    task_count: tasks.length,
    category_counts: categoryCounts,
    primary_session_count: expectedSessions,
  };
  if (verifyLock) {
    validatePhase5PreregistrationLock(preregistration, result, repoRoot);
  }
  return result;
}

/**
 * Validates only repository-local candidate truth. Configured public keys are
 * checked for shape, algorithm, uniqueness, and role separation, but external
 * fingerprint authority and evaluation evidence are intentionally out of
 * scope.
 *
 * @param {any} preregistration
 * @param {{repoRoot: string, verifyBoundFiles?: boolean, verifyLock?: boolean, verifyRuntimeIntelligence?: boolean}} options
 */
export async function validatePhase5CandidateBindings(
  preregistration,
  {
    repoRoot,
    verifyBoundFiles = true,
    verifyLock = true,
    verifyRuntimeIntelligence = verifyBoundFiles,
  } = {
    repoRoot: "",
  },
) {
  const validation = await validatePhase5Preregistration(preregistration, {
    repoRoot,
    verifyBoundFiles,
    verifyLock,
    trustedKeyFingerprints: null,
    requireExternalTrust: false,
  });
  const intelligence = verifyRuntimeIntelligence
    ? auditPhase5RuntimeIntelligence(preregistration, repoRoot)
    : null;
  return {
    ...validation,
    evidence_trust_status: preregistration.evidence_trust.status,
    external_trust_checked: false,
    external_evidence_status: "not_evaluated",
    intelligence,
  };
}

export function validatePhase5PreregistrationLock(
  preregistration,
  validation,
  repoRoot,
) {
  const lock = JSON.parse(
    fs.readFileSync(
      resolveRepoBoundPath(
        repoRoot,
        PHASE5_PREREGISTRATION_LOCK_PATH,
        "Phase 5 preregistration lock",
      ),
      "utf8",
    ),
  );
  assert(
    lock.contract === "salt_phase5_preregistration_lock_v1" &&
      lock.preregistration_path === PHASE5_PREREGISTRATION_PATH &&
      lock.preregistration_digest === validation.digest &&
      lock.frozen_at === preregistration.frozen_at &&
      lock.task_count === validation.task_count &&
      canonicalJson(lock.category_counts) ===
        canonicalJson(validation.category_counts) &&
      lock.primary_session_count === validation.primary_session_count &&
      canonicalJson(lock.architecture_package_sha256) ===
        canonicalJson(
          Object.fromEntries(
            preregistration.architectures.map((architecture) => [
              architecture.id,
              architecture.package_sha256,
            ]),
          ),
        ) &&
      lock.runtime_capability_lock_sha256 ===
        preregistration.runtime_capability_lock.sha256 &&
      lock.run_schedule_sha256 ===
        computePhase5RunScheduleDigest(preregistration),
    "Phase 5 preregistration lock is stale or incomplete.",
  );
  return lock;
}

export function createPhase5RunPlan(preregistration) {
  const fixtureBindings = new Map(
    preregistration.fixture_bindings.map((binding) => [binding.path, binding]),
  );
  assert(
    preregistration.run_plan.randomization_algorithm ===
      "paired_block_sha256_v1",
    "Unsupported Phase 5 run randomization algorithm.",
  );
  const seed = preregistration.run_plan.randomization_seed;
  const blocks = [];
  for (const task of preregistration.tasks) {
    for (
      let repeat = 1;
      repeat <= preregistration.run_plan.runs_per_task_architecture_host;
      repeat += 1
    ) {
      const pairId = `${task.id}__${repeat}`;
      const runs = preregistration.architectures
        .map((architecture) => ({
          run_id: `${task.id}__${architecture.id}__${repeat}`,
          pair_id: pairId,
          task_id: task.id,
          category: task.category,
          architecture_id: architecture.id,
          host: preregistration.primary_host.host,
          model: preregistration.primary_host.model,
          reasoning_effort: preregistration.primary_host.reasoning_effort,
          service_tier: preregistration.primary_host.service_tier,
          package_sha256: architecture.package_sha256,
          install_manifest_sha256: architecture.install_manifest_sha256 ?? null,
          lockfile_sha256: architecture.lockfile_sha256 ?? null,
          fixture_sha256: fixtureBindings.get(task.fixture).sha256,
          setup_sha256: task.setup?.source_sha256 ?? null,
          repeat,
        }))
        .sort((left, right) => {
          const leftKey = sha256Bytes(
            `${seed}\0arm\0${pairId}\0${left.architecture_id}`,
          );
          const rightKey = sha256Bytes(
            `${seed}\0arm\0${pairId}\0${right.architecture_id}`,
          );
          return leftKey < rightKey ? -1 : leftKey > rightKey ? 1 : 0;
        });
      blocks.push({
        pair_id: pairId,
        order_key: sha256Bytes(`${seed}\0block\0${pairId}`),
        runs,
      });
    }
  }
  blocks.sort((left, right) =>
    left.order_key < right.order_key
      ? -1
      : left.order_key > right.order_key
        ? 1
        : 0,
  );
  return blocks
    .flatMap((block) => block.runs)
    .map((run, dispatchIndex) => ({ ...run, dispatch_index: dispatchIndex }));
}

export function computePhase5RunScheduleDigest(preregistration) {
  return `sha256:${sha256Bytes(
    canonicalJson(
      createPhase5RunPlan(preregistration).map(
        ({ dispatch_index, run_id, pair_id }) => ({
          dispatch_index,
          run_id,
          pair_id,
        }),
      ),
    ),
  )}`;
}

function digestContentRecord(record, label) {
  assert(
    record &&
      typeof record.content === "string" &&
      isSha256(record.sha256) &&
      sha256Bytes(record.content) === record.sha256 &&
      record.bytes === Buffer.byteLength(record.content, "utf8"),
    `${label} content is not byte- and digest-bound.`,
  );
}

function parseNulPathList(content, label) {
  assert(typeof content === "string", `${label} must be text.`);
  if (content === "") return [];
  assert(content.endsWith("\0"), `${label} is not NUL-terminated.`);
  const paths = content.slice(0, -1).split("\0");
  assert(
    paths.length === new Set(paths).size && paths.every(isSafeRelativePath),
    `${label} contains duplicate or unsafe paths.`,
  );
  return paths;
}

function computeArtifactTreeDigest(artifacts) {
  return sha256Bytes(
    canonicalJson(
      artifacts
        .map((artifact) => ({ path: artifact.path, sha256: artifact.sha256 }))
        .sort((left, right) => left.path.localeCompare(right.path)),
    ),
  );
}

function validateMachineCheck(
  preregistration,
  capture,
  check,
  trustedEvaluatorIdentity = null,
) {
  const profile = getPhase5MachineCheckProfile(check?.name);
  const commandArgs = check?.command?.args;
  const expectedEvaluatorBasename =
    process.platform === "win32"
      ? `${preregistration.artifact_harness.required_evaluator_binary}.exe`
      : preregistration.artifact_harness.required_evaluator_binary;
  assert(
    check?.contract === "salt_phase5_machine_check_v2" &&
      check.profile === profile.contract &&
      typeof check.name === "string" &&
      check.run_id === capture.run_id &&
      check.preregistration_digest === capture.preregistration_digest &&
      check.input_fixture_sha256 === capture.fixture_sha256 &&
      check.output_tree_sha256 === capture.output_tree_sha256,
    `Capture ${capture.run_id} has an unbound ${check?.name ?? "unknown"} check.`,
  );
  assert(
    check.runner === "phase5_artifact_harness_v2" &&
      check.runner_sha256 === preregistration.artifact_harness.sha256 &&
      profile.executable_policy === "externally_provisioned_absolute_path" &&
      typeof check.command?.executable === "string" &&
      path.isAbsolute(check.command.executable) &&
      path.basename(check.command.executable).toLowerCase() ===
        expectedEvaluatorBasename.toLowerCase() &&
      isSha256(check.evaluator_binary_sha256) &&
      typeof check.evaluator_version === "string" &&
      check.evaluator_version.length > 0 &&
      canonicalJson(commandArgs) === canonicalJson(profile.args) &&
      check.command.cwd === capture.worktree_root &&
      check.command.shell === false &&
      check.command.timeout_ms === PHASE5_EVALUATOR_PROFILE_TIMEOUT_MS &&
      Number.isSafeInteger(check.exit_code),
    `Capture ${capture.run_id} has invalid ${check.name} runner evidence.`,
  );
  if (trustedEvaluatorIdentity !== null) {
    assert(
      check.command.executable === trustedEvaluatorIdentity.executable_path &&
        check.evaluator_binary_sha256 ===
          trustedEvaluatorIdentity.executable_sha256 &&
        check.evaluator_version === trustedEvaluatorIdentity.version,
      `Capture ${capture.run_id} ${check.name} evidence is not rooted in the externally trusted evaluator identity.`,
    );
  }
  digestContentRecord(
    check.stdout,
    `Capture ${capture.run_id} ${check.name} stdout`,
  );
  digestContentRecord(
    check.stderr,
    `Capture ${capture.run_id} ${check.name} stderr`,
  );
  digestContentRecord(
    check.observation,
    `Capture ${capture.run_id} ${check.name} observation`,
  );
  const evaluatorInput = createPhase5EvaluatorInputManifest({
    run: capture,
    preregistrationDigest: capture.preregistration_digest,
    outputTreeSha256: capture.output_tree_sha256,
    changedPaths: capture.changed_paths,
    questions: capture.questions,
    finalResponse: capture.final_response,
    toolTrace: capture.tool_trace,
    resourceTrace: capture.resource_trace,
    artifacts: capture.artifacts,
    checkName: check.name,
  });
  const evaluatorInputSha256 = sha256Bytes(canonicalJson(evaluatorInput));
  assert(
    check.evaluator_input_sha256 === evaluatorInputSha256,
    `Capture ${capture.run_id} has a misbound ${check.name} evaluator input manifest.`,
  );
  let observation;
  try {
    observation = JSON.parse(check.observation.content);
  } catch {
    throw new Error(
      `Capture ${capture.run_id} ${check.name} observation is not JSON.`,
    );
  }
  assert(
    canonicalJson(observation) === check.observation.content,
    `Capture ${capture.run_id} ${check.name} observation is not canonical JSON.`,
  );
  assert(
    check.stdout.content.trim() === check.observation.content,
    `Capture ${capture.run_id} ${check.name} stdout and observation disagree.`,
  );
  const evaluatorCapture = {
    ...capture,
    evaluator_input_sha256: evaluatorInputSha256,
  };
  const passed =
    check.exit_code === 0 &&
    evaluatePhase5MachineObservation(check.name, observation, evaluatorCapture);
  return {
    passed,
    critical_failure: passed ? null : profile.critical_failure,
  };
}

function deriveCaptureMachineResult(
  preregistration,
  capture,
  trustedEvaluatorIdentity = null,
) {
  const results = capture.checks.map((check) =>
    validateMachineCheck(
      preregistration,
      capture,
      check,
      trustedEvaluatorIdentity,
    ),
  );
  return {
    passed: results.every((result) => result.passed),
    critical_failures: [
      ...new Set(
        results
          .map((result) => result.critical_failure)
          .filter((failure) => failure !== null),
      ),
    ],
  };
}

/**
 * @param {any} preregistration
 * @param {any[]} captures
 * @param {{ trustedEvaluatorIdentity?: any }} [options]
 */
export function validatePhase5RunCaptures(
  preregistration,
  captures,
  { trustedEvaluatorIdentity = null } = {},
) {
  const digest = computePreregistrationDigest(preregistration);
  const normalizedTrustedEvaluatorIdentity =
    trustedEvaluatorIdentity === null
      ? null
      : normalizePhase5TrustedEvaluatorIdentity(trustedEvaluatorIdentity);
  if (normalizedTrustedEvaluatorIdentity !== null) {
    assert(
      normalizedTrustedEvaluatorIdentity.binary_name ===
        preregistration.artifact_harness.required_evaluator_binary,
      "Externally trusted evaluator identity does not match the preregistered binary.",
    );
  }
  const expectedRuns = createPhase5RunPlan(preregistration);
  const expectedById = new Map(expectedRuns.map((run) => [run.run_id, run]));
  assert(Array.isArray(captures), "Phase 5 captures must be an array.");
  const conversationIds = new Set();
  const worktreeIds = new Set();
  const worktreeRoots = new Set();
  const canonicalWorktreeRoots = new Set();
  const worktreeRootDigests = new Set();
  const worktreeAdminDigests = new Set();
  const worktreeRealRootDigests = new Set();
  const worktreeChallenges = new Set();
  const worktreeInstanceIds = new Set();
  const captureIds = new Set();
  const hostVersions = new Set();
  const evaluationCommits = new Set();
  const evaluatorIdentities = new Set();
  for (
    let captureIndex = 0;
    captureIndex < captures.length;
    captureIndex += 1
  ) {
    const capture = captures[captureIndex];
    assert(
      capture.run_id === expectedRuns[captureIndex]?.run_id,
      `Phase 5 capture dispatch order changed at index ${captureIndex}.`,
    );
    const expected = expectedById.get(capture.run_id);
    assert(expected, `Unexpected Phase 5 run capture ${capture.run_id}.`);
    assert(
      !captureIds.has(capture.run_id),
      `Duplicate Phase 5 run capture ${capture.run_id}.`,
    );
    captureIds.add(capture.run_id);
    for (const [field, expectedValue] of Object.entries(expected)) {
      assert(
        capture[field] === expectedValue,
        `Capture ${capture.run_id} changed ${field}.`,
      );
    }
    assert(
      capture.preregistration_digest === digest,
      `Capture ${capture.run_id} has a stale preregistration digest.`,
    );
    assert(
      typeof capture.host_version === "string" && capture.host_version,
      `Capture ${capture.run_id} omits host_version.`,
    );
    hostVersions.add(capture.host_version);
    assert(
      /^[0-9a-f]{40}$/u.test(capture.evaluation_commit),
      `Capture ${capture.run_id} omits the exact evaluation commit.`,
    );
    evaluationCommits.add(capture.evaluation_commit);
    assert(
      typeof capture.conversation_id === "string" && capture.conversation_id,
      `Capture ${capture.run_id} omits conversation_id.`,
    );
    assert(
      typeof capture.worktree_id === "string" && capture.worktree_id,
      `Capture ${capture.run_id} omits worktree_id.`,
    );
    assert(
      typeof capture.worktree_root === "string" &&
        path.isAbsolute(capture.worktree_root),
      `Capture ${capture.run_id} omits its absolute evaluator worktree root.`,
    );
    assert(
      Array.isArray(capture.changed_paths) &&
        capture.changed_paths.length === new Set(capture.changed_paths).size &&
        capture.changed_paths.every(
          (changedPath) =>
            typeof changedPath === "string" && isSafeRelativePath(changedPath),
        ),
      `Capture ${capture.run_id} has an invalid complete changed-path manifest.`,
    );
    const task = preregistration.tasks.find(
      (candidate) => candidate.id === capture.task_id,
    );
    assert(task, `Capture ${capture.run_id} references an unknown task.`);
    assert(
      task.category !== "review_retrieval_policy" ||
        capture.changed_paths.length === 0,
      `Capture ${capture.run_id} mutated files during a read-only review or retrieval task.`,
    );
    const worktreeReceipt = capture.worktree_receipt;
    const canonicalWorktreeRoot = path.resolve(capture.worktree_root);
    const worktreeRootIdentity =
      process.platform === "win32"
        ? canonicalWorktreeRoot.toLowerCase()
        : canonicalWorktreeRoot;
    assert(
      worktreeReceipt?.contract === "salt_phase5_worktree_receipt_v1" &&
        /^[0-9a-f]{32}$/u.test(worktreeReceipt.instance_id) &&
        isSha256(worktreeReceipt.creation_challenge) &&
        worktreeReceipt.root_at_execution === capture.worktree_root &&
        worktreeReceipt.root_sha256 === sha256Bytes(capture.worktree_root) &&
        typeof worktreeReceipt.real_root_at_execution === "string" &&
        path.isAbsolute(worktreeReceipt.real_root_at_execution) &&
        worktreeReceipt.real_root_sha256 ===
          sha256Bytes(worktreeReceipt.real_root_at_execution) &&
        typeof worktreeReceipt.git_admin_dir_at_execution === "string" &&
        path.isAbsolute(worktreeReceipt.git_admin_dir_at_execution) &&
        worktreeReceipt.git_admin_dir_realpath_sha256 ===
          sha256Bytes(worktreeReceipt.git_admin_dir_at_execution) &&
        worktreeReceipt.evaluation_commit === capture.evaluation_commit &&
        worktreeReceipt.head_commit === capture.evaluation_commit &&
        /^[0-9a-f]{40}$/u.test(worktreeReceipt.head_tree) &&
        worktreeReceipt.setup_state_sha256 ===
          sha256Bytes(
            canonicalJson({
              fixture_sha256: capture.fixture_sha256,
              setup_sha256: capture.setup_sha256,
            }),
          ) &&
        canonicalJson(worktreeReceipt.changed_paths) ===
          canonicalJson(capture.changed_paths) &&
        worktreeReceipt.final_state_sha256 ===
          sha256Bytes(
            canonicalJson({
              output_tree_sha256: capture.output_tree_sha256,
              changed_paths: capture.changed_paths,
              final_git_status_sha256: worktreeReceipt.final_git_status?.sha256,
            }),
          ) &&
        typeof worktreeReceipt.created_at === "string" &&
        typeof worktreeReceipt.closed_at === "string" &&
        Number.isFinite(Date.parse(worktreeReceipt.created_at)) &&
        Number.isFinite(Date.parse(worktreeReceipt.closed_at)) &&
        Date.parse(worktreeReceipt.created_at) >=
          Date.parse(preregistration.frozen_at) &&
        Date.parse(worktreeReceipt.closed_at) >=
          Date.parse(worktreeReceipt.created_at),
      `Capture ${capture.run_id} has an invalid archived worktree receipt.`,
    );
    if (fs.existsSync(capture.worktree_root)) {
      const observedRootStats = fs.lstatSync(capture.worktree_root);
      assert(
        observedRootStats.isDirectory() && !observedRootStats.isSymbolicLink(),
        `Capture ${capture.run_id} worktree root is not a real non-link directory.`,
      );
      const observedRealRoot = fs.realpathSync.native(capture.worktree_root);
      assert(
        (process.platform === "win32"
          ? observedRealRoot.toLowerCase()
          : observedRealRoot) ===
          (process.platform === "win32"
            ? worktreeReceipt.real_root_at_execution.toLowerCase()
            : worktreeReceipt.real_root_at_execution),
        `Capture ${capture.run_id} archived the wrong physical worktree root.`,
      );
    }
    digestContentRecord(
      worktreeReceipt.preflight_git_status,
      `Capture ${capture.run_id} preflight git status`,
    );
    digestContentRecord(
      worktreeReceipt.final_git_status,
      `Capture ${capture.run_id} final git status`,
    );
    const gitCommandReceipts = worktreeReceipt.git_command_receipts;
    for (const [name, command, content] of [
      [
        "head_commit",
        ["git", "rev-parse", "HEAD"],
        `${capture.evaluation_commit}\n`,
      ],
      [
        "head_tree",
        ["git", "rev-parse", "HEAD^{tree}"],
        `${worktreeReceipt.head_tree}\n`,
      ],
      [
        "git_admin_dir",
        ["git", "rev-parse", "--absolute-git-dir"],
        `${worktreeReceipt.git_admin_dir_at_execution}\n`,
      ],
      [
        "changed_paths",
        ["git", "diff", "--name-only", "--no-renames", "-z", "HEAD"],
        null,
      ],
      [
        "untracked_paths",
        ["git", "ls-files", "--others", "--exclude-standard", "-z"],
        null,
      ],
    ]) {
      const receipt = gitCommandReceipts?.[name];
      assert(
        receipt?.contract === "salt_phase5_git_command_receipt_v1" &&
          canonicalJson(receipt.command) === canonicalJson(command) &&
          receipt.cwd === capture.worktree_root &&
          receipt.exit_code === 0,
        `Capture ${capture.run_id} has invalid ${name} git command evidence.`,
      );
      digestContentRecord(
        receipt.stdout,
        `Capture ${capture.run_id} ${name} git stdout`,
      );
      digestContentRecord(
        receipt.stderr,
        `Capture ${capture.run_id} ${name} git stderr`,
      );
      assert(
        receipt.stderr.content === "",
        `Capture ${capture.run_id} ${name} git command wrote stderr.`,
      );
      if (content !== null) {
        assert(
          receipt.stdout.content === content,
          `Capture ${capture.run_id} has inconsistent ${name} git command evidence.`,
        );
      }
    }
    const trackedChangedPaths = parseNulPathList(
      gitCommandReceipts.changed_paths.stdout.content,
      `Capture ${capture.run_id} tracked changed paths`,
    );
    const untrackedPaths = parseNulPathList(
      gitCommandReceipts.untracked_paths.stdout.content,
      `Capture ${capture.run_id} untracked paths`,
    );
    assert(
      trackedChangedPaths.every(
        (changedPath) => !untrackedPaths.includes(changedPath),
      ),
      `Capture ${capture.run_id} reports a path as both tracked and untracked.`,
    );
    const observedChangedPaths = [
      ...trackedChangedPaths,
      ...untrackedPaths,
    ].sort();
    const declaredChangedPaths = [...capture.changed_paths].sort();
    assert(
      canonicalJson(observedChangedPaths) ===
        canonicalJson(declaredChangedPaths),
      `Capture ${capture.run_id} changed-path manifest does not match tracked and untracked Git evidence.`,
    );
    assert(
      worktreeReceipt.preflight_git_status.content === "",
      `Capture ${capture.run_id} did not start from a clean worktree.`,
    );
    for (const [set, value, label] of [
      [worktreeRoots, capture.worktree_root, "worktree root"],
      [canonicalWorktreeRoots, worktreeRootIdentity, "canonical worktree root"],
      [
        worktreeRootDigests,
        worktreeReceipt.root_sha256,
        "worktree root digest",
      ],
      [
        worktreeRealRootDigests,
        worktreeReceipt.real_root_sha256,
        "physical worktree root",
      ],
      [
        worktreeAdminDigests,
        worktreeReceipt.git_admin_dir_realpath_sha256,
        "git worktree administration identity",
      ],
      [
        worktreeChallenges,
        worktreeReceipt.creation_challenge,
        "worktree creation challenge",
      ],
      [
        worktreeInstanceIds,
        worktreeReceipt.instance_id,
        "worktree instance id",
      ],
    ]) {
      assert(!set.has(value), `Capture ${capture.run_id} reused its ${label}.`);
      set.add(value);
    }
    assert(
      !conversationIds.has(capture.conversation_id),
      `Conversation ${capture.conversation_id} was reused.`,
    );
    assert(
      !worktreeIds.has(capture.worktree_id),
      `Worktree ${capture.worktree_id} was reused.`,
    );
    conversationIds.add(capture.conversation_id);
    worktreeIds.add(capture.worktree_id);
    assert(
      typeof capture.final_response === "string",
      `Capture ${capture.run_id} omits final_response.`,
    );
    assert(
      Array.isArray(capture.questions) &&
        capture.questions.every((question) => typeof question === "string"),
      `Capture ${capture.run_id} questions must be strings.`,
    );
    assert(
      Array.isArray(capture.tool_trace),
      `Capture ${capture.run_id} omits tool_trace.`,
    );
    assert(
      Array.isArray(capture.resource_trace),
      `Capture ${capture.run_id} omits resource_trace.`,
    );
    assert(
      Array.isArray(capture.artifacts),
      `Capture ${capture.run_id} omits artifacts.`,
    );
    const artifactPaths = new Set();
    for (const artifact of capture.artifacts) {
      assert(
        artifact &&
          typeof artifact.path === "string" &&
          artifact.path.length > 0 &&
          !path.isAbsolute(artifact.path) &&
          !artifact.path.includes("\\") &&
          !artifact.path.split("/").some((segment) => segment === ".."),
        `Capture ${capture.run_id} has an unsafe artifact path.`,
      );
      assert(
        !artifactPaths.has(artifact.path),
        `Capture ${capture.run_id} repeats artifact ${artifact.path}.`,
      );
      artifactPaths.add(artifact.path);
      assert(
        typeof artifact.content === "string" &&
          isSha256(artifact.sha256) &&
          sha256Bytes(artifact.content) === artifact.sha256,
        `Capture ${capture.run_id} has unbound artifact content for ${artifact.path}.`,
      );
    }
    assert(
      isSha256(capture.output_tree_sha256) &&
        computeArtifactTreeDigest(capture.artifacts) ===
          capture.output_tree_sha256,
      `Capture ${capture.run_id} has an unbound output tree.`,
    );
    assert(
      capture.telemetry && typeof capture.telemetry === "object",
      `Capture ${capture.run_id} omits telemetry.`,
    );
    for (const field of [
      "elapsed_ms",
      "tool_calls",
      "context_bytes",
      "response_bytes",
    ]) {
      assert(
        Number.isFinite(capture.telemetry[field]) &&
          capture.telemetry[field] >= 0,
        `Capture ${capture.run_id} has invalid ${field}.`,
      );
    }
    assert(
      Array.isArray(capture.checks),
      `Capture ${capture.run_id} omits artifact checks.`,
    );
    assert(
      capture.checks.length === task.artifact_checks.length &&
        new Set(capture.checks.map((check) => check.name)).size ===
          task.artifact_checks.length,
      `Capture ${capture.run_id} checks do not exactly match its task.`,
    );
    for (const checkName of task.artifact_checks) {
      const check = capture.checks.find(
        (candidate) => candidate.name === checkName,
      );
      assert(check, `Capture ${capture.run_id} omits ${checkName} evidence.`);
      validateMachineCheck(
        preregistration,
        capture,
        check,
        normalizedTrustedEvaluatorIdentity,
      );
      evaluatorIdentities.add(
        canonicalJson({
          executable: check.command.executable,
          sha256: check.evaluator_binary_sha256,
          version: check.evaluator_version,
        }),
      );
    }
    assert(
      !("critical_failures" in capture),
      `Capture ${capture.run_id} may not self-assert critical failures.`,
    );
    assert(
      !("success" in capture) &&
        !capture.checks.some(
          (check) =>
            "status" in check || "passed" in check || "assertions" in check,
        ),
      `Capture ${capture.run_id} may not self-assert success or check status.`,
    );
    assert(
      !("failure_envelope" in capture),
      `Capture ${capture.run_id} may not self-assert a failure envelope.`,
    );
  }
  assert(
    captures.length === expectedRuns.length,
    `Expected ${expectedRuns.length} Phase 5 captures, received ${captures.length}.`,
  );
  assert(
    hostVersions.size === 1,
    "Phase 5 captures must use one exact host version for the complete matrix.",
  );
  assert(
    evaluationCommits.size === 1,
    "Phase 5 captures must use one exact evaluation commit for the complete matrix.",
  );
  assert(
    evaluatorIdentities.size === 1,
    "Phase 5 captures must use one exact externally pinned evaluator binary.",
  );
  return { capture_count: captures.length, preregistration_digest: digest };
}

function runGit(repoRoot, args, label) {
  const result = spawnSync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
    shell: false,
    windowsHide: true,
  });
  assert(
    result.status === 0,
    `${label} failed: ${(result.stderr || result.stdout || "unknown git error").trim()}`,
  );
  return result.stdout;
}

function runGitBuffer(repoRoot, args, label) {
  const result = spawnSync("git", args, {
    cwd: repoRoot,
    encoding: null,
    maxBuffer: 128 * 1024 * 1024,
    shell: false,
    windowsHide: true,
  });
  assert(
    result.status === 0,
    `${label} failed: ${Buffer.from(
      result.stderr ?? result.stdout ?? "unknown git error",
    )
      .toString("utf8")
      .trim()}`,
  );
  return Buffer.from(result.stdout);
}

function readCommittedFile(repoRoot, evaluationCommit, relativePath, label) {
  return runGitBuffer(
    repoRoot,
    ["show", `${evaluationCommit}:${relativePath}`],
    label,
  );
}

function hashCommittedCanonicalTree(repoRoot, evaluationCommit, relativeRoot) {
  const listing = runGitBuffer(
    repoRoot,
    ["ls-tree", "-r", "-z", evaluationCommit, "--", relativeRoot],
    `Committed Phase 5 tree listing for ${relativeRoot}`,
  );
  const records = listing
    .toString("utf8")
    .split("\0")
    .filter(Boolean)
    .map((entry) => {
      const [metadata, filePath] = entry.split("\t");
      const [mode, type] = metadata.split(" ");
      assert(
        type === "blob" && ["100644", "100755"].includes(mode),
        `Committed Phase 5 tree ${relativeRoot} contains a link or special entry ${filePath}.`,
      );
      return {
        path: filePath.slice(`${relativeRoot}/`.length),
        bytes: readCommittedFile(
          repoRoot,
          evaluationCommit,
          filePath,
          `Committed Phase 5 tree file ${filePath}`,
        ),
      };
    });
  assert(
    records.length > 0,
    `Committed Phase 5 tree ${relativeRoot} is empty.`,
  );
  return canonicalizeSkillRecords(records);
}

export function verifyPhase5EvaluationCommit(
  preregistration,
  captures,
  repoRoot,
) {
  validatePhase5RunCaptures(preregistration, captures);
  const commits = new Set(captures.map((capture) => capture.evaluation_commit));
  assert(commits.size === 1, "Phase 5 evaluation commit is not unique.");
  const [evaluationCommit] = commits;
  const resolved = runGit(
    repoRoot,
    ["rev-parse", "--verify", `${evaluationCommit}^{commit}`],
    "Phase 5 evaluation commit resolution",
  ).trim();
  assert(
    resolved === evaluationCommit,
    "Phase 5 evaluation commit is abbreviated, missing, or does not resolve exactly.",
  );
  const committedPreregistration = JSON.parse(
    runGit(
      repoRoot,
      ["show", `${evaluationCommit}:${PHASE5_PREREGISTRATION_PATH}`],
      "Frozen Phase 5 preregistration lookup",
    ),
  );
  const committedLock = JSON.parse(
    runGit(
      repoRoot,
      ["show", `${evaluationCommit}:${PHASE5_PREREGISTRATION_LOCK_PATH}`],
      "Frozen Phase 5 preregistration-lock lookup",
    ),
  );
  const digest = computePreregistrationDigest(preregistration);
  const categoryCounts = Object.fromEntries(
    CATEGORY_NAMES.map((category) => [
      category,
      preregistration.tasks.filter((task) => task.category === category).length,
    ]),
  );
  const expectedCommittedLock = {
    contract: "salt_phase5_preregistration_lock_v1",
    preregistration_path: PHASE5_PREREGISTRATION_PATH,
    preregistration_digest: digest,
    frozen_at: preregistration.frozen_at,
    task_count: preregistration.tasks.length,
    category_counts: categoryCounts,
    primary_session_count:
      preregistration.tasks.length *
      preregistration.architectures.length *
      preregistration.run_plan.runs_per_task_architecture_host,
    run_schedule_sha256: computePhase5RunScheduleDigest(preregistration),
    architecture_package_sha256: Object.fromEntries(
      preregistration.architectures.map((architecture) => [
        architecture.id,
        architecture.package_sha256,
      ]),
    ),
    runtime_capability_lock_sha256:
      preregistration.runtime_capability_lock.sha256,
  };
  assert(
    computePreregistrationDigest(committedPreregistration) === digest &&
      canonicalJson(committedLock) === canonicalJson(expectedCommittedLock),
    "Evaluation commit does not contain the exact frozen preregistration and lock.",
  );
  const committedFileBindings = [
    {
      path: preregistration.artifact_harness.path,
      sha256: preregistration.artifact_harness.sha256,
      label: "artifact harness",
    },
    {
      path: preregistration.runtime_capability_lock.path,
      sha256: preregistration.runtime_capability_lock.sha256,
      label: "runtime capability lock",
    },
    ...preregistration.fixture_bindings
      .filter((binding) => binding.kind === "sha256_file")
      .map((binding) => ({ ...binding, label: `fixture ${binding.path}` })),
    ...preregistration.tasks
      .filter((task) => task.setup !== undefined)
      .map((task) => ({
        path: task.setup.source,
        sha256: task.setup.source_sha256,
        label: `setup source ${task.setup.source}`,
      })),
    ...preregistration.architectures.flatMap((architecture) => [
      {
        path: architecture.package_path,
        sha256: architecture.package_sha256,
        label: `${architecture.id} package`,
      },
      {
        path: architecture.install_manifest_path,
        sha256: architecture.install_manifest_sha256,
        label: `${architecture.id} replay manifest`,
      },
      {
        path: architecture.lockfile_path,
        sha256: architecture.lockfile_sha256,
        label: `${architecture.id} replay lock`,
      },
    ]),
    ...preregistration.minimal_primitive_allowlist.map((entry) => ({
      path: entry.path,
      sha256: entry.sha256,
      label: `minimal primitive ${entry.path}`,
    })),
  ];
  for (const binding of committedFileBindings) {
    assert(
      sha256Bytes(
        readCommittedFile(
          repoRoot,
          evaluationCommit,
          binding.path,
          `Committed Phase 5 ${binding.label}`,
        ),
      ) === binding.sha256,
      `Evaluation commit changed the frozen Phase 5 ${binding.label}.`,
    );
  }
  for (const binding of preregistration.fixture_bindings.filter(
    (candidate) => candidate.kind === "salt_skill_tree_v1",
  )) {
    assert(
      hashCommittedCanonicalTree(repoRoot, evaluationCommit, binding.path)
        .sha256 === binding.sha256,
      `Evaluation commit changed frozen fixture tree ${binding.path}.`,
    );
  }
  const minimalArchitecture = preregistration.architectures.find(
    (architecture) => architecture.kind === "minimal_architecture",
  );
  assert(
    hashCommittedCanonicalTree(
      repoRoot,
      evaluationCommit,
      "packages/skills/salt-ds",
    ).sha256 === minimalArchitecture.skill_tree_sha256,
    "Evaluation commit changed the frozen Salt skill tree.",
  );
  const committedTree = runGit(
    repoRoot,
    ["rev-parse", `${evaluationCommit}^{tree}`],
    "Phase 5 evaluation tree resolution",
  ).trim();
  assert(
    captures.every(
      (capture) => capture.worktree_receipt.head_tree === committedTree,
    ),
    "Archived worktree receipt HEAD trees do not match the evaluation commit.",
  );
  return {
    evaluation_commit: evaluationCommit,
    preregistration_digest: digest,
  };
}

function phase5OpaqueId(secret, value, length) {
  assert(
    isSha256(secret),
    "Phase 5 blinding secret must be 32 random bytes encoded as hex.",
  );
  return createHmac("sha256", Buffer.from(secret, "hex"))
    .update(value)
    .digest("hex")
    .slice(0, length);
}

function phase5MappingCommitment(mapping, secret) {
  return `sha256:${sha256Bytes(`${canonicalJson(mapping)}:${secret}`)}`;
}

export function buildBlindScorePackets(
  preregistration,
  captures,
  blindingSecret,
) {
  validatePhase5RunCaptures(preregistration, captures);
  const redactIdentity = (value, capture) => {
    let redacted = value;
    const architecture = preregistration.architectures.find(
      (candidate) => candidate.id === capture.architecture_id,
    );
    const identities = new Set([
      capture.run_id,
      capture.task_id,
      capture.architecture_id,
      architecture?.kind,
      architecture?.package_path,
      architecture?.package_path?.split("/").at(-1),
      "@salt-ds/mcp",
      "baseline",
      "minimal",
      ...preregistration.architectures.flatMap((candidate) => [
        candidate.id,
        candidate.kind,
        candidate.package_path,
        candidate.package_path.split("/").at(-1),
        ...candidate.public_tools,
      ]),
    ]);
    for (const identity of identities) {
      if (typeof identity === "string" && identity.length > 0) {
        const escaped = identity.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
        redacted = redacted.replace(
          new RegExp(escaped, "giu"),
          "[identity-redacted]",
        );
      }
    }
    return redacted;
  };
  const entries = captures.map((capture) => {
    const task = preregistration.tasks.find(
      (candidate) => candidate.id === capture.task_id,
    );
    return {
      opaque_id: phase5OpaqueId(blindingSecret, capture.run_id, 24),
      packet: {
        task_prompt: redactIdentity(task.prompt, capture),
        fixture_sha256: capture.fixture_sha256,
        changed_paths: capture.changed_paths.map((changedPath) =>
          phase5OpaqueId(
            blindingSecret,
            `${capture.run_id}:changed:${changedPath}`,
            16,
          ),
        ),
        final_response: redactIdentity(capture.final_response, capture),
        artifacts: capture.artifacts.map((artifact) => ({
          opaque_name: phase5OpaqueId(
            blindingSecret,
            `${capture.run_id}:artifact:${artifact.path}`,
            16,
          ),
          sha256: artifact.sha256,
          content: redactIdentity(artifact.content, capture),
        })),
        questions: capture.questions.map((question) =>
          redactIdentity(question, capture),
        ),
      },
      sealed_mapping: {
        run_id: capture.run_id,
        architecture_id: capture.architecture_id,
        task_id: capture.task_id,
      },
    };
  });
  entries.sort((left, right) => left.opaque_id.localeCompare(right.opaque_id));
  const packets = entries.map(({ opaque_id, packet }) => ({
    opaque_id,
    ...packet,
  }));
  const sealedMapping = entries.map(({ opaque_id, sealed_mapping }) => ({
    opaque_id,
    ...sealed_mapping,
  }));
  return {
    contract: "salt_phase5_blind_packet_manifest_v1",
    preregistration_digest: computePreregistrationDigest(preregistration),
    packets,
    packet_manifest_digest: `sha256:${sha256Bytes(canonicalJson(packets))}`,
    mapping_commitment: phase5MappingCommitment(sealedMapping, blindingSecret),
  };
}

export function buildPhase5SealedMapping(
  preregistration,
  captures,
  blindingSecret,
) {
  validatePhase5RunCaptures(preregistration, captures);
  const mapping = captures
    .map((capture) => ({
      opaque_id: phase5OpaqueId(blindingSecret, capture.run_id, 24),
      run_id: capture.run_id,
      architecture_id: capture.architecture_id,
      task_id: capture.task_id,
    }))
    .sort((left, right) => left.opaque_id.localeCompare(right.opaque_id));
  return {
    contract: "salt_phase5_sealed_mapping_v1",
    mapping,
    commitment_nonce: blindingSecret,
    mapping_commitment: phase5MappingCommitment(mapping, blindingSecret),
  };
}

function assertExactKeys(value, expectedKeys, label) {
  assert(
    value && typeof value === "object" && !Array.isArray(value),
    `${label} must be an object.`,
  );
  const actual = Object.keys(value).sort();
  const expected = [...expectedKeys].sort();
  assert(
    JSON.stringify(actual) === JSON.stringify(expected),
    `${label} has unexpected or missing fields.`,
  );
}

function validatePrimaryRatingSubmission(
  preregistration,
  packetManifest,
  submission,
) {
  assertExactKeys(
    submission,
    [
      "contract",
      "phase",
      "preregistration_digest",
      "packet_manifest_digest",
      "rater_id",
      "rater_key_id",
      "independence_attestation",
      "submitted_at",
      "ratings",
    ],
    "Primary rating submission",
  );
  assert(
    submission.contract === "salt_phase5_rating_v1" &&
      submission.phase === "primary" &&
      submission.preregistration_digest ===
        computePreregistrationDigest(preregistration) &&
      submission.packet_manifest_digest ===
        packetManifest.packet_manifest_digest &&
      /^[a-z][a-z0-9_-]+$/u.test(submission.rater_id) &&
      /^[a-z][a-z0-9_-]+$/u.test(submission.rater_key_id) &&
      submission.independence_attestation === true &&
      typeof submission.submitted_at === "string" &&
      Number.isFinite(Date.parse(submission.submitted_at)) &&
      Date.parse(submission.submitted_at) >=
        Date.parse(preregistration.frozen_at),
    "Primary rating submission identity or binding is invalid.",
  );
  const dimensions = preregistration.rubric.blind_dimensions;
  const packetIds = packetManifest.packets.map((packet) => packet.opaque_id);
  assert(
    Array.isArray(submission.ratings) &&
      submission.ratings.length === packetIds.length,
    "Primary rating submission is incomplete.",
  );
  const ratings = new Map();
  for (const rating of submission.ratings) {
    assertExactKeys(
      rating,
      ["opaque_id", "scores", "critical_failures", "rationale"],
      "Primary packet rating",
    );
    assert(
      packetIds.includes(rating.opaque_id) && !ratings.has(rating.opaque_id),
      "Primary rating has an unknown or duplicate packet.",
    );
    assertExactKeys(rating.scores, dimensions, "Primary dimension scores");
    for (const dimension of dimensions) {
      assert(
        Number.isInteger(rating.scores[dimension]) &&
          rating.scores[dimension] >= preregistration.rubric.score_minimum &&
          rating.scores[dimension] <= preregistration.rubric.score_maximum,
        `Primary rating has an invalid ${dimension} score.`,
      );
    }
    assert(
      Array.isArray(rating.critical_failures),
      "Primary rating omits critical-failure judgments.",
    );
    for (const failure of rating.critical_failures) {
      assert(
        preregistration.critical_failures.includes(failure),
        `Primary rating uses unknown critical failure ${failure}.`,
      );
    }
    digestContentRecord(
      rating.rationale,
      `Primary rating ${rating.opaque_id} rationale`,
    );
    ratings.set(rating.opaque_id, rating);
  }
  return ratings;
}

export function createPhase5AdjudicationPlan(
  preregistration,
  packetManifest,
  primarySubmissions,
) {
  assert(
    Array.isArray(primarySubmissions) &&
      primarySubmissions.length === preregistration.rubric.subjective_raters,
    "Phase 5 requires exactly two primary blind rating submissions.",
  );
  const ratingMaps = primarySubmissions.map((submission) =>
    validatePrimaryRatingSubmission(
      preregistration,
      packetManifest,
      submission,
    ),
  );
  assert(
    new Set(primarySubmissions.map((submission) => submission.rater_id))
      .size === primarySubmissions.length &&
      new Set(primarySubmissions.map((submission) => submission.rater_key_id))
        .size === primarySubmissions.length,
    "Primary raters and keys must be independent.",
  );
  const cells = [];
  for (const packet of packetManifest.packets) {
    for (const dimension of preregistration.rubric.blind_dimensions) {
      if (
        Math.abs(
          ratingMaps[0].get(packet.opaque_id).scores[dimension] -
            ratingMaps[1].get(packet.opaque_id).scores[dimension],
        ) > preregistration.rubric.adjudication_difference_strictly_greater_than
      ) {
        cells.push({ opaque_id: packet.opaque_id, dimension });
      }
    }
  }
  const primary_submission_digests = primarySubmissions.map(
    (submission) => `sha256:${sha256Bytes(canonicalJson(submission))}`,
  );
  const planBody = { primary_submission_digests, cells };
  return {
    contract: "salt_phase5_adjudication_plan_v1",
    ...planBody,
    plan_digest: `sha256:${sha256Bytes(canonicalJson(planBody))}`,
  };
}

function validateAdjudicationSubmission(
  preregistration,
  packetManifest,
  plan,
  primarySubmissions,
  submission,
) {
  if (plan.cells.length === 0) {
    assert(
      submission === null,
      "Adjudication is forbidden when no cell exceeds the threshold.",
    );
    return new Map();
  }
  assertExactKeys(
    submission,
    [
      "contract",
      "phase",
      "preregistration_digest",
      "packet_manifest_digest",
      "plan_digest",
      "rater_id",
      "rater_key_id",
      "independence_attestation",
      "submitted_at",
      "ratings",
    ],
    "Adjudication submission",
  );
  assert(
    submission.contract === "salt_phase5_rating_v1" &&
      submission.phase === "adjudication" &&
      submission.preregistration_digest ===
        computePreregistrationDigest(preregistration) &&
      submission.packet_manifest_digest ===
        packetManifest.packet_manifest_digest &&
      submission.plan_digest === plan.plan_digest &&
      submission.independence_attestation === true &&
      typeof submission.submitted_at === "string" &&
      Number.isFinite(Date.parse(submission.submitted_at)) &&
      Date.parse(submission.submitted_at) >=
        Math.max(
          ...primarySubmissions.map((primary) =>
            Date.parse(primary.submitted_at),
          ),
        ) &&
      !primarySubmissions.some(
        (primary) =>
          primary.rater_id === submission.rater_id ||
          primary.rater_key_id === submission.rater_key_id,
      ),
    "Adjudicator identity or binding is invalid.",
  );
  assert(
    Array.isArray(submission.ratings) &&
      submission.ratings.length === plan.cells.length,
    "Adjudication ratings do not exactly cover the plan.",
  );
  const result = new Map();
  for (const rating of submission.ratings) {
    assertExactKeys(
      rating,
      ["opaque_id", "dimension", "score"],
      "Adjudication cell rating",
    );
    const key = `${rating.opaque_id}:${rating.dimension}`;
    assert(
      plan.cells.some(
        (cell) =>
          cell.opaque_id === rating.opaque_id &&
          cell.dimension === rating.dimension,
      ) && !result.has(key),
      "Adjudication contains an unknown or duplicate cell.",
    );
    assert(
      Number.isInteger(rating.score) &&
        rating.score >= preregistration.rubric.score_minimum &&
        rating.score <= preregistration.rubric.score_maximum,
      "Adjudication score is out of range.",
    );
    result.set(key, rating.score);
  }
  return result;
}

export function freezePhase5Scores(
  preregistration,
  packetManifest,
  primarySubmissions,
  adjudicationSubmission,
  frozenAt,
) {
  const plan = createPhase5AdjudicationPlan(
    preregistration,
    packetManifest,
    primarySubmissions,
  );
  const primaryRatings = primarySubmissions.map((submission) =>
    validatePrimaryRatingSubmission(
      preregistration,
      packetManifest,
      submission,
    ),
  );
  const adjudicated = validateAdjudicationSubmission(
    preregistration,
    packetManifest,
    plan,
    primarySubmissions,
    adjudicationSubmission,
  );
  assert(
    typeof frozenAt === "string" && Number.isFinite(Date.parse(frozenAt)),
    "Score freeze requires an exact timestamp.",
  );
  assert(
    Date.parse(frozenAt) >=
      Math.max(
        ...primarySubmissions.map((submission) =>
          Date.parse(submission.submitted_at),
        ),
        adjudicationSubmission === null
          ? Number.NEGATIVE_INFINITY
          : Date.parse(adjudicationSubmission.submitted_at),
      ),
    "Score freeze predates a rating or adjudication submission.",
  );
  const final_scores = packetManifest.packets.map((packet) => {
    const scores = {};
    for (const dimension of preregistration.rubric.blind_dimensions) {
      const values = primaryRatings.map(
        (ratings) => ratings.get(packet.opaque_id).scores[dimension],
      );
      const key = `${packet.opaque_id}:${dimension}`;
      scores[dimension] = adjudicated.has(key)
        ? [values[0], values[1], adjudicated.get(key)].sort(
            (left, right) => left - right,
          )[1]
        : (values[0] + values[1]) / 2;
    }
    return {
      opaque_id: packet.opaque_id,
      scores,
      critical_failures: [
        ...new Set(
          primaryRatings.flatMap(
            (ratings) => ratings.get(packet.opaque_id).critical_failures,
          ),
        ),
      ].sort(),
    };
  });
  const scoreTableDigest = `sha256:${sha256Bytes(canonicalJson(final_scores))}`;
  return {
    contract: "salt_phase5_score_freeze_v1",
    preregistration_digest: computePreregistrationDigest(preregistration),
    packet_manifest_digest: packetManifest.packet_manifest_digest,
    mapping_commitment: packetManifest.mapping_commitment,
    primary_submission_digests: plan.primary_submission_digests,
    adjudication_plan_digest: plan.plan_digest,
    adjudication_submission_digest:
      adjudicationSubmission === null
        ? null
        : `sha256:${sha256Bytes(canonicalJson(adjudicationSubmission))}`,
    final_scores,
    final_score_table_digest: scoreTableDigest,
    frozen_at: frozenAt,
  };
}

function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function quantile(sorted, probability) {
  return sorted[
    Math.min(sorted.length - 1, Math.floor(probability * sorted.length))
  ];
}

/**
 * @param {any} preregistration
 * @param {any} evaluation
 * @param {{ publishedPackageTarballBytes?: Buffer | null, repoRoot?: string | null, trustedKeyFingerprints?: Array<{ key_id: string, sha256: string }> | null, trustedEvaluatorIdentity?: any }} [options]
 */
export function computePhase5EvaluationReport(
  preregistration,
  evaluation,
  {
    publishedPackageTarballBytes = null,
    repoRoot = null,
    trustedKeyFingerprints = null,
    trustedEvaluatorIdentity = null,
  } = {},
) {
  const {
    captures,
    packet_manifest: packetManifest,
    sealed_mapping: sealedMapping,
    primary_submissions: primarySubmissions,
    adjudication_submission: adjudicationSubmission = null,
    score_freeze: scoreFreeze,
    host_trace: hostTrace = null,
    published_package_attestation: publishedPackageAttestation = null,
    signed_evidence: signedEvidence = null,
  } = evaluation;
  validatePhase5RunCaptures(preregistration, captures, {
    trustedEvaluatorIdentity,
  });
  assert(
    packetManifest?.contract === "salt_phase5_blind_packet_manifest_v1",
    "Phase 5 report requires the blind packet manifest.",
  );
  assert(
    sealedMapping?.contract === "salt_phase5_sealed_mapping_v1",
    "Phase 5 report requires the sealed mapping after score freeze.",
  );
  assert(
    scoreFreeze?.contract === "salt_phase5_score_freeze_v1",
    "Phase 5 report requires frozen blind scores.",
  );
  const rebuiltPacketManifest = buildBlindScorePackets(
    preregistration,
    captures,
    sealedMapping.commitment_nonce,
  );
  const rebuiltSealedMapping = buildPhase5SealedMapping(
    preregistration,
    captures,
    sealedMapping.commitment_nonce,
  );
  assert(
    canonicalJson(packetManifest) === canonicalJson(rebuiltPacketManifest) &&
      canonicalJson(sealedMapping) === canonicalJson(rebuiltSealedMapping) &&
      sealedMapping.mapping_commitment === packetManifest.mapping_commitment &&
      scoreFreeze.mapping_commitment === packetManifest.mapping_commitment,
    "Phase 5 packet manifest or mapping cannot be reproduced from the revealed commitment nonce.",
  );
  const rebuiltScoreFreeze = freezePhase5Scores(
    preregistration,
    packetManifest,
    primarySubmissions,
    adjudicationSubmission,
    scoreFreeze.frozen_at,
  );
  assert(
    canonicalJson(scoreFreeze) === canonicalJson(rebuiltScoreFreeze),
    "Phase 5 score freeze does not reproduce from the raw primary and adjudication submissions.",
  );
  const packetIds = packetManifest.packets.map((packet) => packet.opaque_id);
  assert(
    sealedMapping.mapping.length === captures.length &&
      scoreFreeze.final_scores.length === captures.length &&
      new Set(sealedMapping.mapping.map((entry) => entry.opaque_id)).size ===
        captures.length &&
      new Set(scoreFreeze.final_scores.map((entry) => entry.opaque_id)).size ===
        captures.length &&
      packetIds.every(
        (opaqueId) =>
          sealedMapping.mapping.some((entry) => entry.opaque_id === opaqueId) &&
          scoreFreeze.final_scores.some(
            (entry) => entry.opaque_id === opaqueId,
          ),
      ),
    "Phase 5 score freeze and sealed mapping are not complete bijections.",
  );
  const captureByRun = new Map(
    captures.map((capture) => [capture.run_id, capture]),
  );
  const scoreByOpaque = new Map(
    scoreFreeze.final_scores.map((score) => [score.opaque_id, score]),
  );
  const outcomes = sealedMapping.mapping.map((mapping) => {
    const capture = captureByRun.get(mapping.run_id);
    assert(
      capture &&
        capture.task_id === mapping.task_id &&
        capture.architecture_id === mapping.architecture_id,
      `Phase 5 mapping entry ${mapping.opaque_id} is misbound.`,
    );
    const score = scoreByOpaque.get(mapping.opaque_id);
    assert(
      score,
      `Phase 5 mapping entry ${mapping.opaque_id} has no frozen score.`,
    );
    const machine = deriveCaptureMachineResult(
      preregistration,
      capture,
      trustedEvaluatorIdentity,
    );
    const subjectivePass = preregistration.rubric.blind_dimensions.every(
      (dimension) =>
        Number.isFinite(score.scores[dimension]) &&
        score.scores[dimension] >= preregistration.rubric.score_passing_minimum,
    );
    const criticalFailures = [
      ...new Set([...machine.critical_failures, ...score.critical_failures]),
    ];
    return {
      ...capture,
      machine_pass: machine.passed,
      subjective_pass: subjectivePass,
      correctness_pass:
        machine.passed &&
        score.scores.task_correctness >=
          preregistration.rubric.score_passing_minimum,
      critical_failures: criticalFailures,
      success:
        machine.passed && subjectivePass && criticalFailures.length === 0,
    };
  });
  const arms = preregistration.architectures.map(
    (architecture) => architecture.id,
  );
  const minimalId = preregistration.architectures.find(
    (architecture) => architecture.kind === "minimal_architecture",
  ).id;
  const baselineId = preregistration.architectures.find(
    (architecture) => architecture.kind === "captured_baseline",
  ).id;
  const aggregate = Object.fromEntries(
    arms.map((arm) => {
      const armCaptures = outcomes.filter(
        (capture) => capture.architecture_id === arm,
      );
      const category_success = Object.fromEntries(
        CATEGORY_NAMES.map((category) => {
          const values = armCaptures.filter(
            (capture) => capture.category === category,
          );
          return [
            category,
            values.filter((capture) => capture.success).length / values.length,
          ];
        }),
      );
      return [
        arm,
        {
          success_rate:
            armCaptures.filter((capture) => capture.success).length /
            armCaptures.length,
          category_success,
          critical_failures: armCaptures.reduce(
            (total, capture) => total + capture.critical_failures.length,
            0,
          ),
        },
      ];
    }),
  );

  const taskDifferences = preregistration.tasks.map((task) => {
    const rate = (arm) => {
      const values = outcomes.filter(
        (capture) =>
          capture.task_id === task.id && capture.architecture_id === arm,
      );
      return values.filter((capture) => capture.success).length / values.length;
    };
    return rate(minimalId) - rate(baselineId);
  });
  const correctnessDifferences = preregistration.tasks.map((task) => {
    const rate = (arm) => {
      const values = outcomes.filter(
        (capture) =>
          capture.task_id === task.id && capture.architecture_id === arm,
      );
      return (
        values.filter((capture) => capture.correctness_pass).length /
        values.length
      );
    };
    return rate(minimalId) - rate(baselineId);
  });
  const random = mulberry32(preregistration.statistics.bootstrap_seed);
  const bootstrap = [];
  for (
    let sample = 0;
    sample < preregistration.statistics.bootstrap_samples;
    sample += 1
  ) {
    let total = 0;
    for (let index = 0; index < taskDifferences.length; index += 1) {
      total += taskDifferences[Math.floor(random() * taskDifferences.length)];
    }
    bootstrap.push(total / taskDifferences.length);
  }
  bootstrap.sort((left, right) => left - right);
  const alpha = 1 - preregistration.statistics.confidence_level;
  const confidence_interval = {
    lower: quantile(bootstrap, alpha / 2),
    upper: quantile(bootstrap, 1 - alpha / 2),
  };
  const correctnessBootstrap = [];
  const correctnessRandom = mulberry32(
    preregistration.statistics.bootstrap_seed + 1,
  );
  for (
    let sample = 0;
    sample < preregistration.statistics.bootstrap_samples;
    sample += 1
  ) {
    let total = 0;
    for (let index = 0; index < correctnessDifferences.length; index += 1) {
      total +=
        correctnessDifferences[
          Math.floor(correctnessRandom() * correctnessDifferences.length)
        ];
    }
    correctnessBootstrap.push(total / correctnessDifferences.length);
  }
  correctnessBootstrap.sort((left, right) => left - right);
  const correctnessConfidenceInterval = {
    lower: quantile(correctnessBootstrap, alpha / 2),
    upper: quantile(correctnessBootstrap, 1 - alpha / 2),
  };
  const minimalOutcomes = outcomes.filter(
    (outcome) => outcome.architecture_id === minimalId,
  );
  const baselineOutcomeByPair = new Map(
    outcomes
      .filter((outcome) => outcome.architecture_id === baselineId)
      .map((outcome) => [`${outcome.task_id}:${outcome.repeat}`, outcome]),
  );
  const materialSafetyRegressions = minimalOutcomes.filter((minimalOutcome) => {
    const baselineOutcome = baselineOutcomeByPair.get(
      `${minimalOutcome.task_id}:${minimalOutcome.repeat}`,
    );
    return minimalOutcome.critical_failures.some(
      (failure) => !baselineOutcome?.critical_failures.includes(failure),
    );
  }).length;
  const minimal = aggregate[minimalId];
  const thresholds = preregistration.statistics;
  const outcomeThresholdsPassed =
    minimal.success_rate >= thresholds.overall_success_minimum &&
    Object.values(minimal.category_success).every(
      (rate) => rate >= thresholds.category_success_minimum,
    ) &&
    minimal.critical_failures <= thresholds.critical_failure_maximum &&
    materialSafetyRegressions <=
      thresholds.material_safety_regression_maximum &&
    confidence_interval.lower >= thresholds.minimal_noninferiority_margin &&
    correctnessConfidenceInterval.lower >=
      thresholds.minimal_noninferiority_margin;
  const runtimeIntelligenceAudit =
    typeof repoRoot === "string" && repoRoot.length > 0
      ? auditPhase5RuntimeIntelligence(preregistration, repoRoot)
      : null;
  const ac24Passed = runtimeIntelligenceAudit?.ac24_passed === true;
  const trustedEvidence = validatePhase5SignedEvidenceChain(
    preregistration,
    {
      captures,
      packetManifest,
      primarySubmissions,
      adjudicationSubmission,
      scoreFreeze,
      sealedMapping,
      hostTrace,
      publishedPackageAttestation,
      signedEvidence,
    },
    {
      downloadedTarballBytes: publishedPackageTarballBytes,
      repoRoot,
      runtimeIntelligenceAudit,
      trustedKeyFingerprints,
      trustedEvaluatorIdentity,
    },
  );
  if (trustedEvidence.complete) {
    assert(
      typeof repoRoot === "string" && repoRoot.length > 0,
      "Trusted Phase 5 reporting requires the repository root for commit and lock verification.",
    );
    const categoryCounts = Object.fromEntries(
      CATEGORY_NAMES.map((category) => [
        category,
        preregistration.tasks.filter((task) => task.category === category)
          .length,
      ]),
    );
    validatePhase5PreregistrationLock(
      preregistration,
      {
        digest: computePreregistrationDigest(preregistration),
        task_count: preregistration.tasks.length,
        category_counts: categoryCounts,
        primary_session_count: createPhase5RunPlan(preregistration).length,
      },
      repoRoot,
    );
    verifyPhase5EvaluationCommit(preregistration, captures, repoRoot);
  }
  const externalEvidenceComplete = trustedEvidence.complete;
  const gate_status = externalEvidenceComplete
    ? outcomeThresholdsPassed && ac24Passed
      ? "pass"
      : "fail"
    : "blocked";
  return {
    contract: "salt_phase5_evaluation_report_v1",
    preregistration_digest: computePreregistrationDigest(preregistration),
    capture_count: outcomes.length,
    aggregate,
    paired_success_difference: {
      minimal_minus_baseline:
        taskDifferences.reduce((total, value) => total + value, 0) /
        taskDifferences.length,
      confidence_interval,
    },
    correctness_noninferiority: {
      confidence_interval: correctnessConfidenceInterval,
    },
    material_safety_regressions: materialSafetyRegressions,
    outcome_thresholds_passed: outcomeThresholdsPassed,
    ac24_passed: ac24Passed,
    runtime_intelligence_audit: runtimeIntelligenceAudit,
    external_evidence_complete: externalEvidenceComplete,
    external_evidence_blockers: trustedEvidence.blockers,
    gate_status,
    beta_gate_passed: gate_status === "pass",
  };
}

export function validatePhase5HostTrace(preregistration, trace) {
  assert(
    trace?.contract === "salt_phase5_host_trace_v1",
    "Invalid host trace contract.",
  );
  assert(
    trace.host === preregistration.primary_host.host,
    "Host trace uses the wrong host.",
  );
  assert(
    trace.model === preregistration.primary_host.model,
    "Host trace uses the wrong model.",
  );
  assert(
    trace.reasoning_effort === preregistration.primary_host.reasoning_effort,
    "Host trace uses the wrong reasoning effort.",
  );
  assert(
    trace.service_tier === preregistration.primary_host.service_tier,
    "Host trace uses the wrong service tier.",
  );
  assert(
    typeof trace.host_version === "string" && trace.host_version,
    "Host trace omits exact host version.",
  );
  assert(
    typeof trace.protocol_revision === "string" && trace.protocol_revision,
    "Host trace omits protocol revision.",
  );
  assert(
    trace.preregistration_digest ===
      computePreregistrationDigest(preregistration),
    "Host trace has a stale preregistration digest.",
  );
  assert(
    Array.isArray(trace.architectures) &&
      trace.architectures.length === preregistration.architectures.length,
    "Host trace does not cover both frozen architectures.",
  );
  for (const architecture of preregistration.architectures) {
    const evidence = trace.architectures.find(
      (candidate) => candidate.architecture_id === architecture.id,
    );
    assert(
      evidence && evidence.package_sha256 === architecture.package_sha256,
      `Host trace misbinds architecture ${architecture.id}.`,
    );
    for (const transport of ["in_memory", "stdio"]) {
      const observation = evidence.transport_results?.[transport];
      assert(
        observation?.contract === "salt_phase5_transport_observation_v1" &&
          observation.exit_code === 0 &&
          Array.isArray(observation.observed_tool_names) &&
          canonicalJson([...observation.observed_tool_names].sort()) ===
            canonicalJson([...architecture.public_tools].sort()) &&
          Array.isArray(observation.observed_resource_uris) &&
          observation.observed_resource_uris.length > 0 &&
          observation.observed_resource_uris.every(
            (uri) => typeof uri === "string" && uri.startsWith("salt://"),
          ) &&
          !("passed" in observation),
        `Host trace omits raw successful ${transport} observations for ${architecture.id}.`,
      );
      digestContentRecord(
        observation.request_log,
        `Host trace ${architecture.id} ${transport} request log`,
      );
      digestContentRecord(
        observation.response_log,
        `Host trace ${architecture.id} ${transport} response log`,
      );
    }
  }
  assert(
    trace.resource_strategy === "resource_links" ||
      trace.resource_strategy === "embedded_resources" ||
      trace.resource_strategy === "bounded_inline_fallback",
    "Host trace omits its supported resource strategy.",
  );
  for (const capability of [
    "create",
    "migration",
    "review",
    "ambiguity",
    "failure_recovery",
  ]) {
    digestContentRecord(
      trace.capability_evidence?.[capability],
      `Host trace ${capability}`,
    );
  }
  assert(
    trace.deleted_private_protocol_dependency === false,
    "Host trace depends on the deleted private protocol.",
  );
  return true;
}

/**
 * @param {any} preregistration
 * @param {any} attestation
 * @param {string} scoreFrozenAt
 * @param {{ downloadedTarballBytes?: Buffer | null, repoRoot?: string | null }} [options]
 */
export function validatePhase5PublishedPackageAttestation(
  preregistration,
  attestation,
  scoreFrozenAt,
  { downloadedTarballBytes = null, repoRoot = null } = {},
) {
  const minimal = preregistration.architectures.find(
    (architecture) => architecture.kind === "minimal_architecture",
  );
  assert(
    attestation?.contract === "salt_phase5_published_package_attestation_v3" &&
      attestation.package_name === minimal.package_name &&
      typeof attestation.package_version === "string" &&
      /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/u.test(
        attestation.package_version,
      ) &&
      attestation.registry_origin === "https://registry.npmjs.org" &&
      attestation.registry_manifest_url ===
        `https://registry.npmjs.org/@salt-ds%2fmcp/${encodeURIComponent(attestation.package_version)}` &&
      typeof attestation.dist_integrity === "string" &&
      /^sha512-[A-Za-z0-9+/]+={0,2}$/u.test(attestation.dist_integrity) &&
      /^[0-9a-f]{40}$/u.test(attestation.registry_git_head) &&
      attestation.candidate_package_sha256 === minimal.package_sha256 &&
      isSha256(attestation.downloaded_tarball_sha256) &&
      attestation.downloaded_tarball_sha512 === attestation.dist_integrity &&
      Number.isSafeInteger(attestation.downloaded_tarball_bytes) &&
      attestation.downloaded_tarball_bytes > 0 &&
      attestation.smoke_exit_code === 0 &&
      typeof attestation.verified_at === "string" &&
      Number.isFinite(Date.parse(attestation.verified_at)) &&
      Date.parse(attestation.verified_at) >= Date.parse(scoreFrozenAt),
    "Published package verification does not bind the immutable npm artifact and post-freeze smoke result.",
  );
  digestContentRecord(
    attestation.registry_manifest,
    "Published package registry manifest",
  );
  digestContentRecord(
    attestation.smoke_receipt,
    "Published package smoke receipt",
  );
  assert(
    Buffer.isBuffer(downloadedTarballBytes) &&
      typeof repoRoot === "string" &&
      repoRoot.length > 0,
    "Published package verification requires the downloaded tarball bytes and repository root.",
  );
  const downloadedSha256 = sha256Bytes(downloadedTarballBytes);
  const downloadedSha512 = `sha512-${createHash("sha512")
    .update(downloadedTarballBytes)
    .digest("base64")}`;
  assert(
    downloadedTarballBytes.byteLength ===
      attestation.downloaded_tarball_bytes &&
      downloadedSha256 === attestation.downloaded_tarball_sha256 &&
      downloadedSha512 === attestation.downloaded_tarball_sha512 &&
      downloadedSha512 === attestation.dist_integrity,
    "Published package tarball bytes do not match the registry integrity attestation.",
  );

  let registryManifest;
  let smokeReceipt;
  try {
    registryManifest = JSON.parse(attestation.registry_manifest.content);
    smokeReceipt = JSON.parse(attestation.smoke_receipt.content);
  } catch {
    throw new Error(
      "Published package registry manifest and smoke receipt must be canonical JSON.",
    );
  }
  assert(
    canonicalJson(registryManifest) === attestation.registry_manifest.content &&
      registryManifest.name === attestation.package_name &&
      registryManifest.version === attestation.package_version &&
      registryManifest.gitHead === attestation.registry_git_head &&
      registryManifest.dist?.integrity === attestation.dist_integrity &&
      registryManifest.dist?.tarball ===
        `https://registry.npmjs.org/@salt-ds/mcp/-/salt-ds-mcp-${attestation.package_version}.tgz`,
    "Published package registry manifest is not exactly bound to the attestation.",
  );
  const requiredSmokeChecks = [
    "npm_clean_install",
    "yarn_clean_replay",
    "esm_exports",
    "commonjs_exports",
    "stdio_transport",
    "resource_exhaustion",
    "offline_boundary",
    "typecheck",
    "render",
    "keyboard_interaction",
    "whole_document_accessibility",
  ];
  assert(
    canonicalJson(smokeReceipt) === attestation.smoke_receipt.content &&
      smokeReceipt.contract ===
        "salt_phase5_published_consumer_smoke_receipt_v1" &&
      smokeReceipt.package_name === attestation.package_name &&
      smokeReceipt.package_version === attestation.package_version &&
      smokeReceipt.registry_git_head === attestation.registry_git_head &&
      smokeReceipt.dist_integrity === attestation.dist_integrity &&
      smokeReceipt.downloaded_tarball_sha256 === downloadedSha256 &&
      smokeReceipt.exit_code === 0 &&
      requiredSmokeChecks.every(
        (check) => smokeReceipt.checks?.[check] === true,
      ),
    "Published package smoke receipt is incomplete or bound to a different package.",
  );

  const candidateBytes = fs.readFileSync(
    resolveRepoBoundPath(
      repoRoot,
      minimal.package_path,
      "Minimal architecture package",
    ),
  );
  assert(
    sha256Bytes(candidateBytes) === minimal.package_sha256,
    "Minimal architecture package drifted before publication comparison.",
  );
  const candidateEntries = readNpmTarRegularEntries(candidateBytes);
  const publishedEntries = readNpmTarRegularEntries(downloadedTarballBytes);
  assert(
    canonicalJson([...candidateEntries.keys()].sort()) ===
      canonicalJson([...publishedEntries.keys()].sort()),
    "Published package file inventory differs from the evaluated candidate.",
  );
  for (const [entryPath, candidateEntry] of candidateEntries) {
    const publishedEntry = publishedEntries.get(entryPath);
    if (entryPath === "package/package.json") {
      const candidateManifest = JSON.parse(candidateEntry.toString("utf8"));
      const publishedManifest = JSON.parse(publishedEntry.toString("utf8"));
      assert(
        publishedManifest.name === attestation.package_name &&
          publishedManifest.version === attestation.package_version,
        "Published tarball package manifest has the wrong name or version.",
      );
      publishedManifest.version = candidateManifest.version;
      assert(
        canonicalJson(publishedManifest) === canonicalJson(candidateManifest),
        "Published package manifest differs from the evaluated candidate beyond its release version.",
      );
      continue;
    }
    assert(
      publishedEntry?.equals(candidateEntry),
      `Published package file differs from the evaluated candidate: ${entryPath}`,
    );
  }
  return true;
}

export function phase5SignedEvidenceSigningPayload(event) {
  const unsigned = { ...event };
  delete unsigned.signature_ed25519;
  return `salt-phase5-signed-evidence-v1\n${canonicalJson(unsigned)}`;
}

function phase5SignedEventDigest(event) {
  return `sha256:${sha256Bytes(canonicalJson(event))}`;
}

function validateSignedEvidenceEvent(
  preregistration,
  event,
  expectedType,
  expectedRole,
  expectedPrevious,
  expectedPayload,
  minimumIssuedAt,
) {
  assertExactKeys(
    event,
    [
      "contract",
      "event_type",
      "role",
      "key_id",
      "issued_at",
      "previous_event_sha256",
      "payload",
      "payload_sha256",
      "signature_ed25519",
    ],
    `Signed Phase 5 ${expectedType} event`,
  );
  const key = preregistration.evidence_trust.trusted_keys.find(
    (candidate) => candidate.key_id === event.key_id,
  );
  assert(
    event.contract === "salt_phase5_signed_evidence_v1" &&
      event.event_type === expectedType &&
      event.role === expectedRole &&
      key?.role === expectedRole &&
      event.previous_event_sha256 === expectedPrevious &&
      typeof event.issued_at === "string" &&
      Number.isFinite(Date.parse(event.issued_at)) &&
      Date.parse(event.issued_at) >= minimumIssuedAt &&
      event.payload_sha256 ===
        `sha256:${sha256Bytes(canonicalJson(event.payload))}` &&
      canonicalJson(event.payload) === canonicalJson(expectedPayload) &&
      typeof event.signature_ed25519 === "string" &&
      /^[A-Za-z0-9+/]+={0,2}$/u.test(event.signature_ed25519),
    `Signed Phase 5 ${expectedType} event is stale, misbound, or uses an untrusted role.`,
  );
  const signatureValid = verify(
    null,
    Buffer.from(phase5SignedEvidenceSigningPayload(event), "utf8"),
    createPublicKey(key.public_key_pem),
    Buffer.from(event.signature_ed25519, "base64"),
  );
  assert(
    signatureValid,
    `Signed Phase 5 ${expectedType} event has an invalid Ed25519 signature.`,
  );
  return {
    digest: phase5SignedEventDigest(event),
    issuedAt: Date.parse(event.issued_at),
    keyId: event.key_id,
  };
}

/**
 * @param {any} preregistration
 * @param {any} evidence
 * @param {{ downloadedTarballBytes?: Buffer | null, repoRoot?: string | null, runtimeIntelligenceAudit?: any, trustedKeyFingerprints?: Array<{ key_id: string, sha256: string }> | null, trustedEvaluatorIdentity?: any }} [options]
 */
export function validatePhase5SignedEvidenceChain(
  preregistration,
  {
    captures,
    packetManifest,
    primarySubmissions,
    adjudicationSubmission,
    scoreFreeze,
    sealedMapping,
    hostTrace,
    publishedPackageAttestation,
    signedEvidence,
  },
  {
    downloadedTarballBytes = null,
    repoRoot = null,
    runtimeIntelligenceAudit = null,
    trustedKeyFingerprints = null,
    trustedEvaluatorIdentity = null,
  } = {},
) {
  if (preregistration.evidence_trust.status !== "configured") {
    return {
      complete: false,
      blockers: [
        "trusted_external_evidence_keys_unconfigured",
        "real_model_host_and_post_publish_execution_not_imported",
      ],
    };
  }
  assert(
    Array.isArray(signedEvidence) &&
      signedEvidence.length === SIGNED_EVIDENCE_EVENT_ORDER.length,
    "Configured Phase 5 evidence requires the complete signed event chain.",
  );
  const configuredFingerprints = new Map(
    preregistration.evidence_trust.trusted_keys.map((key) => [
      key.key_id,
      sha256Bytes(
        createPublicKey(key.public_key_pem).export({
          type: "spki",
          format: "der",
        }),
      ),
    ]),
  );
  assertExternalFingerprintSet(
    configuredFingerprints,
    trustedKeyFingerprints,
    "Configured Phase 5 evidence chain is not rooted in the external fingerprint set.",
  );
  assert(
    trustedEvaluatorIdentity !== null,
    "Configured Phase 5 evidence requires an externally trusted evaluator identity.",
  );
  assert(
    typeof repoRoot === "string" && path.isAbsolute(repoRoot),
    "Configured Phase 5 evidence requires the absolute repository root.",
  );
  assertPhase5TrustedEvaluatorIdentityVerified(trustedEvaluatorIdentity, {
    requiredForbiddenRoots: [
      repoRoot,
      ...captures.flatMap((capture) => [
        capture.worktree_root,
        capture.worktree_receipt?.real_root_at_execution,
      ]),
    ],
  });
  validatePhase5RunCaptures(preregistration, captures, {
    trustedEvaluatorIdentity,
  });
  assert(
    Array.isArray(primarySubmissions) && primarySubmissions.length === 2,
    "Configured Phase 5 evidence requires both raw primary rating submissions.",
  );
  assert(
    hostTrace !== null,
    "Configured Phase 5 evidence omits the raw host trace.",
  );
  assert(
    publishedPackageAttestation !== null,
    "Configured Phase 5 evidence omits immutable published-package verification.",
  );
  validatePhase5HostTrace(preregistration, hostTrace);
  assert(
    hostTrace.host_version === captures[0].host_version,
    "Host trace version does not match the captured evaluation matrix.",
  );
  validatePhase5PublishedPackageAttestation(
    preregistration,
    publishedPackageAttestation,
    scoreFreeze.frozen_at,
    { downloadedTarballBytes, repoRoot },
  );
  assert(
    runtimeIntelligenceAudit?.contract === "salt_phase5_ac24_audit_v1" &&
      runtimeIntelligenceAudit.ac24_passed === true,
    "Configured Phase 5 evidence omits the passing AC24 runtime-intelligence audit.",
  );
  assert(
    publishedPackageAttestation.registry_git_head ===
      captures[0].evaluation_commit,
    "Published package gitHead does not match the frozen evaluation commit.",
  );
  const adjudicationPlan = createPhase5AdjudicationPlan(
    preregistration,
    packetManifest,
    primarySubmissions,
  );
  const digest = (value) => `sha256:${sha256Bytes(canonicalJson(value))}`;
  const expectedPayloads = [
    {
      captures_digest: digest(captures),
      run_schedule_sha256: computePhase5RunScheduleDigest(preregistration),
    },
    {
      packet_manifest_digest: packetManifest.packet_manifest_digest,
      mapping_commitment: packetManifest.mapping_commitment,
    },
    {
      submission_digest: digest(primarySubmissions[0]),
      rater_key_id: primarySubmissions[0].rater_key_id,
    },
    {
      submission_digest: digest(primarySubmissions[1]),
      rater_key_id: primarySubmissions[1].rater_key_id,
    },
    { plan_digest: adjudicationPlan.plan_digest },
    {
      submission_digest:
        adjudicationSubmission === null ? null : digest(adjudicationSubmission),
      adjudicator_key_id: adjudicationSubmission?.rater_key_id ?? null,
    },
    { score_freeze_digest: digest(scoreFreeze) },
    {
      mapping_digest: digest(sealedMapping.mapping),
      mapping_commitment: sealedMapping.mapping_commitment,
    },
    { host_trace_digest: digest(hostTrace) },
    {
      published_package_attestation_digest: digest(publishedPackageAttestation),
      published_tarball_sha256:
        publishedPackageAttestation.downloaded_tarball_sha256,
      ac24_audit_digest: digest(runtimeIntelligenceAudit),
    },
  ];
  let previous = computePreregistrationDigest(preregistration);
  let minimumIssuedAt = Date.parse(preregistration.frozen_at);
  const verified = [];
  for (let index = 0; index < SIGNED_EVIDENCE_EVENT_ORDER.length; index += 1) {
    const [eventType, role] = SIGNED_EVIDENCE_EVENT_ORDER[index];
    const result = validateSignedEvidenceEvent(
      preregistration,
      signedEvidence[index],
      eventType,
      role,
      previous,
      expectedPayloads[index],
      minimumIssuedAt,
    );
    verified.push(result);
    previous = result.digest;
    minimumIssuedAt = result.issuedAt;
  }
  const primaryEventKeyIds = [verified[2].keyId, verified[3].keyId];
  const latestCaptureClosure = Math.max(
    ...captures.map((capture) =>
      Date.parse(capture.worktree_receipt.closed_at),
    ),
  );
  assert(
    verified[0].issuedAt >= latestCaptureClosure,
    "Signed capture-manifest event predates an archived worktree closure.",
  );
  assert(
    new Set(primaryEventKeyIds).size === 2 &&
      primaryEventKeyIds[0] === primarySubmissions[0].rater_key_id &&
      primaryEventKeyIds[1] === primarySubmissions[1].rater_key_id,
    "Primary rating events are not signed by the two frozen independent rater keys.",
  );
  assert(
    adjudicationSubmission === null ||
      (verified[5].keyId === adjudicationSubmission.rater_key_id &&
        !primaryEventKeyIds.includes(verified[5].keyId)),
    "Adjudication is not signed by an independent adjudicator key.",
  );
  assert(
    verified[6].issuedAt >= Date.parse(scoreFreeze.frozen_at),
    "Signed score-freeze event predates the frozen score table.",
  );
  assert(
    verified[2].issuedAt >= Date.parse(primarySubmissions[0].submitted_at) &&
      verified[3].issuedAt >= Date.parse(primarySubmissions[1].submitted_at),
    "Signed primary-rating event predates its raw rating submission.",
  );
  assert(
    adjudicationSubmission === null ||
      verified[5].issuedAt >= Date.parse(adjudicationSubmission.submitted_at),
    "Signed adjudication event predates its raw adjudication submission.",
  );
  assert(
    verified[9].issuedAt >= Date.parse(publishedPackageAttestation.verified_at),
    "Signed published-package event predates its immutable registry attestation.",
  );
  return { complete: true, blockers: [] };
}

export function auditPhase5RuntimeIntelligence(preregistration, repoRoot) {
  for (const [name, value] of Object.entries(REQUIRED_RESTORATION_THRESHOLDS)) {
    assert(
      preregistration.statistics?.[name] === value,
      `Runtime intelligence audit is missing frozen threshold ${name}.`,
    );
  }
  const sourceRoot = path.resolve(repoRoot, "packages/mcp/src");
  const entry = path.join(sourceRoot, "index.ts");
  const reachable = collectRuntimeReachableFiles(sourceRoot, [entry]);
  const primitiveIdentity = preregistration.minimal_primitive_allowlist.map(
    (entry) => [entry.path, entry.role, entry.algorithm],
  );
  assert(
    JSON.stringify(primitiveIdentity) ===
      JSON.stringify(REQUIRED_MINIMAL_PRIMITIVES),
    "The minimal runtime primitive owner set changed.",
  );
  const lockBinding = preregistration.runtime_capability_lock;
  const lockPath = resolveRepoBoundPath(
    repoRoot,
    lockBinding.path,
    "Phase 5 runtime capability lock",
  );
  assert(
    sha256File(lockPath) === lockBinding.sha256,
    "Phase 5 runtime capability lock digest drifted.",
  );
  const lock = JSON.parse(fs.readFileSync(lockPath, "utf8"));
  assert(
    lock.contract === "salt_phase5_runtime_capability_lock_v1" &&
      JSON.stringify(lock.entrypoints) ===
        JSON.stringify(["packages/mcp/src/index.ts"]) &&
      Array.isArray(lock.phase6_exceptions) &&
      lock.phase6_exceptions.length === 0,
    "Phase 5 runtime capability lock is invalid or contains an unproved exception.",
  );
  const currentFiles = canonicalizeSkillRecords(
    reachable.map((filePath) => ({
      path: path.relative(repoRoot, filePath).split(path.sep).join("/"),
      bytes: fs.readFileSync(filePath),
    })),
  ).records.map(({ path: filePath, sha256 }) => ({
    path: filePath,
    sha256,
  }));
  assert(
    canonicalJson(currentFiles) === canonicalJson(lock.files),
    "Runtime capability graph or executable source changed without Phase 6 evidence.",
  );
  const reachableSet = new Set(currentFiles.map((entry) => entry.path));
  for (const [primitivePath] of REQUIRED_MINIMAL_PRIMITIVES) {
    assert(
      reachableSet.has(primitivePath),
      `Minimal primitive is no longer runtime-reachable: ${primitivePath}`,
    );
  }
  return {
    contract: "salt_phase5_ac24_audit_v1",
    status: "unproved_rankers_and_analyzers_eliminated",
    reachable_file_count: reachable.length,
    allowlisted_primitive_count: REQUIRED_MINIMAL_PRIMITIVES.length,
    baseline_primitives: preregistration.minimal_primitive_allowlist,
    restored_intelligence: [],
    capability_lock_sha256: lockBinding.sha256,
    phase6_exceptions: [],
    restoration_thresholds: REQUIRED_RESTORATION_THRESHOLDS,
    superiority_evidence: null,
    ac24_passed: true,
  };
}

export function repoRootFromModule(moduleUrl = import.meta.url) {
  return path.resolve(path.dirname(fileURLToPath(moduleUrl)), "..");
}
