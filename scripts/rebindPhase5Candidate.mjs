import { spawnSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  PHASE5_RUNTIME_CAPABILITY_LOCK_PATH,
  renderPhase5RuntimeCapabilityLock,
} from "./buildPhase5RuntimeCapabilityLock.mjs";
import {
  createWindowsCmdInvocation,
  getExecutable,
} from "./consumer-smoke/shared.mjs";
import { hashCanonicalSkillTree } from "./consumer-smoke/skillTreeHash.mjs";
import {
  canonicalJson,
  computePhase5RunScheduleDigest,
  computePreregistrationDigest,
  loadPhase5Preregistration,
  PHASE5_PREREGISTRATION_LOCK_PATH,
  PHASE5_PREREGISTRATION_PATH,
  readPhase5NpmTarEntry,
  sha256Bytes,
  validatePhase5CandidateBindings,
  validatePhase5Preregistration,
} from "./phase5EvaluationContract.mjs";
import { readPhase5ExternalFile } from "./phase5ExternalFile.mjs";

const modulePath = fileURLToPath(import.meta.url);
const defaultRepoRoot = path.resolve(path.dirname(modulePath), "..");
const PHASE5_ROOT = "packages/mcp/eval-fixtures/phase5";
const MINIMAL_TARBALL_PATH = `${PHASE5_ROOT}/artifacts/salt-ds-mcp-0.0.0.tgz`;
const MINIMAL_REPLAY_MANIFEST_PATH = `${PHASE5_ROOT}/artifacts/replay-package.json`;
const MINIMAL_REPLAY_LOCK_PATH = `${PHASE5_ROOT}/artifacts/replay-package-lock.json`;

export const PHASE5_REBIND_OUTPUT_ALLOWLIST = Object.freeze([
  PHASE5_PREREGISTRATION_PATH,
  PHASE5_PREREGISTRATION_LOCK_PATH,
  PHASE5_RUNTIME_CAPABILITY_LOCK_PATH,
  MINIMAL_TARBALL_PATH,
  MINIMAL_REPLAY_MANIFEST_PATH,
  MINIMAL_REPLAY_LOCK_PATH,
]);

export const PHASE5_BEFORE_FIRST_RUN_FILE_ALLOWLIST = Object.freeze([
  ...PHASE5_REBIND_OUTPUT_ALLOWLIST,
  `${PHASE5_ROOT}/.gitattributes`,
  `${PHASE5_ROOT}/setup/create-compile-recovery.ts`,
]);

function sha256File(filePath) {
  return sha256Bytes(fs.readFileSync(filePath));
}

function sha512Integrity(bytes) {
  return `sha512-${createHash("sha512").update(bytes).digest("base64")}`;
}

function renderJson(value) {
  return Buffer.from(`${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function resolveRepoPath(repoRoot, relativePath) {
  if (
    typeof relativePath !== "string" ||
    path.isAbsolute(relativePath) ||
    relativePath.includes("\\") ||
    relativePath
      .split("/")
      .some((segment) => !segment || segment === "." || segment === "..")
  ) {
    throw new Error(`Unsafe repository-relative path: ${relativePath}`);
  }
  const resolved = path.resolve(repoRoot, ...relativePath.split("/"));
  const relative = path.relative(repoRoot, resolved);
  if (
    relative === "" ||
    relative === ".." ||
    relative.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relative)
  ) {
    throw new Error(`Repository path escapes the root: ${relativePath}`);
  }
  return resolved;
}

function listFiles(root) {
  const files = [];
  const pending = [root];
  while (pending.length > 0) {
    const directory = pending.pop();
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      const stats = fs.lstatSync(absolute);
      if (stats.isSymbolicLink()) {
        throw new Error(`Phase 5 fixture tree contains a link: ${absolute}`);
      }
      if (stats.isDirectory()) {
        pending.push(absolute);
      } else if (stats.isFile()) {
        files.push(absolute);
      } else {
        throw new Error(
          `Phase 5 fixture tree contains a special file: ${absolute}`,
        );
      }
    }
  }
  return files;
}

export function assertPhase5SupersessionBeforeFirstRun(
  repoRoot = defaultRepoRoot,
) {
  const phase5Root = resolveRepoPath(repoRoot, PHASE5_ROOT);
  const allowed = new Set(PHASE5_BEFORE_FIRST_RUN_FILE_ALLOWLIST);
  const unexpected = listFiles(phase5Root)
    .map((filePath) => path.relative(repoRoot, filePath).replaceAll("\\", "/"))
    .filter((relativePath) => !allowed.has(relativePath))
    .sort();
  if (unexpected.length > 0) {
    throw new Error(
      `Phase 5 supersession is forbidden after execution evidence or an unexpected fixture appears: ${unexpected.join(", ")}`,
    );
  }
  return { allowed_files: [...allowed].sort() };
}

function gitHeadTimestamp(repoRoot) {
  const result = spawnSync("git", ["log", "-1", "--format=%cI"], {
    cwd: repoRoot,
    encoding: "utf8",
    windowsHide: true,
  });
  if (result.status !== 0) {
    throw new Error(`Unable to read candidate commit time: ${result.stderr}`);
  }
  return Date.parse(result.stdout.trim());
}

function validateFreezeTimestamp(frozenAt, repoRoot) {
  const parsed = Date.parse(frozenAt);
  if (
    typeof frozenAt !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/u.test(frozenAt) ||
    !Number.isFinite(parsed)
  ) {
    throw new Error("--frozen-at must be an ISO-8601 UTC timestamp.");
  }
  if (parsed > Date.now()) {
    throw new Error("--frozen-at may not be in the future.");
  }
  if (parsed < gitHeadTimestamp(repoRoot)) {
    throw new Error("--frozen-at predates the candidate commit.");
  }
}

function packBuiltCandidate(repoRoot) {
  const packageRoot = path.join(repoRoot, "dist/salt-ds-mcp");
  if (!fs.existsSync(path.join(packageRoot, "package.json"))) {
    throw new Error("Build dist/salt-ds-mcp before rebinding Phase 5.");
  }
  const temporaryRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), "salt-phase5-rebind-pack-"),
  );
  try {
    const npmArgs = [
      "pack",
      packageRoot,
      "--pack-destination",
      temporaryRoot,
      "--ignore-scripts",
      "--json",
    ];
    const invocation =
      process.platform === "win32"
        ? createWindowsCmdInvocation(getExecutable("npm"), npmArgs)
        : { command: "npm", args: npmArgs };
    const result = spawnSync(invocation.command, invocation.args, {
      cwd: repoRoot,
      encoding: "utf8",
      windowsHide: true,
      windowsVerbatimArguments: invocation.windowsVerbatimArguments,
    });
    if (result.status !== 0) {
      throw new Error(
        `Unable to pack the Phase 5 candidate: ${result.error?.message ?? result.stderr ?? result.stdout}`,
      );
    }
    const archives = fs
      .readdirSync(temporaryRoot)
      .filter((name) => name.endsWith(".tgz"));
    if (archives.length !== 1) {
      throw new Error("Candidate packing did not produce exactly one tarball.");
    }
    return fs.readFileSync(path.join(temporaryRoot, archives[0]));
  } finally {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
}

function updateReplayLock(existingLock, replayManifest, tarballBytes) {
  const lock = structuredClone(existingLock);
  const installed = lock.packages?.["node_modules/@salt-ds/mcp"];
  const root = lock.packages?.[""];
  const packedManifest = JSON.parse(
    readPhase5NpmTarEntry(tarballBytes, "package/package.json").toString(
      "utf8",
    ),
  );
  if (!installed || !root) {
    throw new Error("Phase 5 replay lock omits its root or MCP package entry.");
  }
  for (const field of ["dependencies", "bin", "engines", "license"]) {
    if (
      canonicalJson(installed[field] ?? null) !==
      canonicalJson(packedManifest[field] ?? null)
    ) {
      throw new Error(
        `Unexpected replay dependency-graph change in packed field ${field}.`,
      );
    }
  }
  if (
    packedManifest.name !== "@salt-ds/mcp" ||
    packedManifest.version !== "0.0.0" ||
    canonicalJson(root.dependencies) !==
      canonicalJson(replayManifest.dependencies)
  ) {
    throw new Error("Unexpected replay package identity or dependency change.");
  }
  installed.integrity = sha512Integrity(tarballBytes);
  return lock;
}

async function updateFixtureBindings(preregistration, repoRoot) {
  for (const binding of preregistration.fixture_bindings) {
    const target = resolveRepoPath(repoRoot, binding.path);
    binding.sha256 =
      binding.kind === "salt_skill_tree_v1"
        ? (await hashCanonicalSkillTree(target)).sha256
        : sha256File(target);
  }
}

function readTrustConfiguration(options, repoRoot) {
  const publicKeysPath = options.trustedPublicKeys ?? null;
  const fingerprintsPath = options.trustedKeyFingerprints ?? null;
  if (Boolean(publicKeysPath) !== Boolean(fingerprintsPath)) {
    throw new Error(
      "Configured trust requires both --trusted-public-keys and --trusted-key-fingerprints.",
    );
  }
  if (!publicKeysPath) return null;
  const publicKeysJson = JSON.parse(
    readPhase5ExternalFile(
      publicKeysPath,
      "trusted public keys",
      repoRoot,
    ).toString("utf8"),
  );
  const fingerprintsJson = JSON.parse(
    readPhase5ExternalFile(
      fingerprintsPath,
      "trusted key fingerprints",
      repoRoot,
    ).toString("utf8"),
  );
  const trustedKeys = Array.isArray(publicKeysJson)
    ? publicKeysJson
    : publicKeysJson.trusted_keys;
  const fingerprints = Array.isArray(fingerprintsJson)
    ? fingerprintsJson
    : fingerprintsJson.fingerprints;
  if (!Array.isArray(trustedKeys) || !Array.isArray(fingerprints)) {
    throw new Error("External trust files have invalid top-level shapes.");
  }
  return { trustedKeys, fingerprints };
}

export async function buildPhase5CandidateRebindProposal({
  repoRoot = defaultRepoRoot,
  frozenAt,
  trustedPublicKeys = null,
  trustedKeyFingerprints = null,
} = {}) {
  assertPhase5SupersessionBeforeFirstRun(repoRoot);
  validateFreezeTimestamp(frozenAt, repoRoot);
  const trustConfiguration = readTrustConfiguration(
    { trustedPublicKeys, trustedKeyFingerprints },
    repoRoot,
  );
  const preregistration = structuredClone(loadPhase5Preregistration(repoRoot));
  const candidateTarball = packBuiltCandidate(repoRoot);
  const replayManifest = JSON.parse(
    fs.readFileSync(
      resolveRepoPath(repoRoot, MINIMAL_REPLAY_MANIFEST_PATH),
      "utf8",
    ),
  );
  const replayLock = updateReplayLock(
    JSON.parse(
      fs.readFileSync(
        resolveRepoPath(repoRoot, MINIMAL_REPLAY_LOCK_PATH),
        "utf8",
      ),
    ),
    replayManifest,
    candidateTarball,
  );
  const runtimeLockBytes = Buffer.from(
    renderPhase5RuntimeCapabilityLock(repoRoot),
    "utf8",
  );

  preregistration.frozen_at = frozenAt;
  if (trustConfiguration) {
    preregistration.evidence_trust.status = "configured";
    preregistration.evidence_trust.trusted_keys = structuredClone(
      trustConfiguration.trustedKeys,
    );
  }
  await updateFixtureBindings(preregistration, repoRoot);
  preregistration.artifact_harness.sha256 = sha256File(
    resolveRepoPath(repoRoot, preregistration.artifact_harness.path),
  );
  preregistration.runtime_capability_lock.sha256 =
    sha256Bytes(runtimeLockBytes);
  for (const primitive of preregistration.minimal_primitive_allowlist) {
    primitive.sha256 = sha256File(resolveRepoPath(repoRoot, primitive.path));
  }
  for (const task of preregistration.tasks) {
    if (task.setup?.source) {
      task.setup.source_sha256 = sha256File(
        resolveRepoPath(repoRoot, task.setup.source),
      );
    }
  }

  const baseline = preregistration.architectures.find(
    (architecture) => architecture.kind === "captured_baseline",
  );
  const minimal = preregistration.architectures.find(
    (architecture) => architecture.kind === "minimal_architecture",
  );
  if (!baseline || !minimal) {
    throw new Error("Phase 5 architecture arms are incomplete.");
  }
  for (const architecture of [baseline, minimal]) {
    architecture.package_sha256 = sha256File(
      architecture === minimal
        ? resolveRepoPath(repoRoot, MINIMAL_TARBALL_PATH)
        : resolveRepoPath(repoRoot, architecture.package_path),
    );
    architecture.install_manifest_sha256 = sha256File(
      resolveRepoPath(repoRoot, architecture.install_manifest_path),
    );
    architecture.lockfile_sha256 = sha256File(
      resolveRepoPath(repoRoot, architecture.lockfile_path),
    );
  }
  minimal.package_sha256 = sha256Bytes(candidateTarball);
  const replayManifestBytes = renderJson(replayManifest);
  const replayLockBytes = renderJson(replayLock);
  minimal.install_manifest_sha256 = sha256Bytes(replayManifestBytes);
  minimal.lockfile_sha256 = sha256Bytes(replayLockBytes);
  const catalogManifestBytes = Buffer.from(
    readPhase5NpmTarEntry(
      candidateTarball,
      "package/generated/catalog-manifest.json",
    ),
  );
  const catalogManifest = JSON.parse(catalogManifestBytes.toString("utf8"));
  minimal.catalog_manifest_sha256 = sha256Bytes(catalogManifestBytes);
  minimal.catalog_semantic_digest = catalogManifest.semantic_digest;
  minimal.skill_tree_sha256 = (
    await hashCanonicalSkillTree(path.join(repoRoot, "packages/skills/salt-ds"))
  ).sha256;

  await validatePhase5Preregistration(preregistration, {
    repoRoot,
    verifyBoundFiles: false,
    verifyLock: false,
    trustedKeyFingerprints: trustConfiguration?.fingerprints ?? null,
    requireExternalTrust: true,
  });
  const categoryCounts = Object.fromEntries(
    ["create", "migration", "review_retrieval_policy"].map((category) => [
      category,
      preregistration.tasks.filter((task) => task.category === category).length,
    ]),
  );
  const lock = {
    contract: "salt_phase5_preregistration_lock_v1",
    preregistration_path: PHASE5_PREREGISTRATION_PATH,
    preregistration_digest: computePreregistrationDigest(preregistration),
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
  const outputs = new Map([
    [PHASE5_PREREGISTRATION_PATH, renderJson(preregistration)],
    [PHASE5_PREREGISTRATION_LOCK_PATH, renderJson(lock)],
    [PHASE5_RUNTIME_CAPABILITY_LOCK_PATH, runtimeLockBytes],
    [MINIMAL_TARBALL_PATH, candidateTarball],
    [MINIMAL_REPLAY_MANIFEST_PATH, replayManifestBytes],
    [MINIMAL_REPLAY_LOCK_PATH, replayLockBytes],
  ]);
  for (const outputPath of outputs.keys()) {
    if (!PHASE5_REBIND_OUTPUT_ALLOWLIST.includes(outputPath)) {
      throw new Error(
        `Rebind proposal escaped its output allowlist: ${outputPath}`,
      );
    }
  }
  return {
    preregistration,
    lock,
    outputs,
    trustedKeyFingerprints: trustConfiguration?.fingerprints ?? null,
  };
}

export function summarizePhase5CandidateRebind(
  proposal,
  repoRoot = defaultRepoRoot,
) {
  return {
    contract: "salt_phase5_candidate_rebind_preview_v1",
    frozen_at: proposal.preregistration.frozen_at,
    evidence_trust_status: proposal.preregistration.evidence_trust.status,
    external_evidence_status: "not_evaluated",
    paths: [...proposal.outputs].map(([relativePath, bytes]) => {
      const target = resolveRepoPath(repoRoot, relativePath);
      const oldBytes = fs.existsSync(target) ? fs.readFileSync(target) : null;
      return {
        path: relativePath,
        changed: !oldBytes?.equals(bytes),
        old_sha256: oldBytes ? sha256Bytes(oldBytes) : null,
        new_sha256: sha256Bytes(bytes),
        bytes: bytes.byteLength,
      };
    }),
  };
}

export async function applyPhase5CandidateRebind(
  proposal,
  {
    repoRoot = defaultRepoRoot,
    supersedeBeforeFirstRun = false,
    failAfterReplacement = Number.POSITIVE_INFINITY,
  } = {},
) {
  if (!supersedeBeforeFirstRun) {
    throw new Error("Writing requires --supersede-before-first-run.");
  }
  for (const outputPath of proposal.outputs.keys()) {
    if (!PHASE5_REBIND_OUTPUT_ALLOWLIST.includes(outputPath)) {
      throw new Error(
        `Rebind proposal escaped its output allowlist: ${outputPath}`,
      );
    }
  }
  assertPhase5SupersessionBeforeFirstRun(repoRoot);
  const changed = [...proposal.outputs].filter(([relativePath, bytes]) => {
    const target = resolveRepoPath(repoRoot, relativePath);
    return !fs.existsSync(target) || !fs.readFileSync(target).equals(bytes);
  });
  const transactionId = `${process.pid}-${randomUUID()}`;
  const staged = [];
  const replaced = [];
  try {
    for (const [relativePath, bytes] of changed) {
      const target = resolveRepoPath(repoRoot, relativePath);
      const temporary = `${target}.phase5-rebind-${transactionId}.tmp`;
      fs.writeFileSync(temporary, bytes, { flag: "wx" });
      staged.push({
        relativePath,
        target,
        temporary,
        bytes,
        original: fs.readFileSync(target),
      });
    }
    for (const [index, entry] of staged.entries()) {
      const current = fs.readFileSync(entry.target);
      if (!current.equals(entry.original)) {
        throw new Error(
          `Phase 5 binding changed during rebind: ${entry.relativePath}`,
        );
      }
      const backup = `${entry.target}.phase5-rebind-${transactionId}.bak`;
      fs.renameSync(entry.target, backup);
      fs.renameSync(entry.temporary, entry.target);
      replaced.push({ ...entry, backup });
      if (failAfterReplacement === index + 1) {
        throw new Error("Injected Phase 5 rebind replacement failure.");
      }
    }
    await validatePhase5CandidateBindings(loadPhase5Preregistration(repoRoot), {
      repoRoot,
    });
    for (const entry of replaced) fs.rmSync(entry.backup);
    return { changed_paths: changed.map(([relativePath]) => relativePath) };
  } catch (error) {
    for (const entry of [...replaced].reverse()) {
      if (fs.existsSync(entry.target)) fs.rmSync(entry.target);
      if (fs.existsSync(entry.backup))
        fs.renameSync(entry.backup, entry.target);
    }
    throw error;
  } finally {
    for (const entry of staged) {
      if (fs.existsSync(entry.temporary)) fs.rmSync(entry.temporary);
      const backup = `${entry.target}.phase5-rebind-${transactionId}.bak`;
      if (fs.existsSync(backup)) fs.rmSync(backup);
    }
  }
}

function parseArgs(argv) {
  const options = {
    write: false,
    supersedeBeforeFirstRun: false,
    frozenAt: null,
    trustedPublicKeys: null,
    trustedKeyFingerprints: null,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--write") options.write = true;
    else if (argument === "--supersede-before-first-run") {
      options.supersedeBeforeFirstRun = true;
    } else if (
      [
        "--frozen-at",
        "--trusted-public-keys",
        "--trusted-key-fingerprints",
      ].includes(argument)
    ) {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`${argument} requires a value.`);
      }
      index += 1;
      if (argument === "--frozen-at") options.frozenAt = value;
      if (argument === "--trusted-public-keys")
        options.trustedPublicKeys = value;
      if (argument === "--trusted-key-fingerprints") {
        options.trustedKeyFingerprints = value;
      }
    } else {
      throw new Error(`Unknown Phase 5 rebind argument: ${argument}`);
    }
  }
  if (!options.frozenAt) throw new Error("--frozen-at is required.");
  if (options.write && !options.supersedeBeforeFirstRun) {
    throw new Error("--write requires --supersede-before-first-run.");
  }
  if (!options.write && options.supersedeBeforeFirstRun) {
    throw new Error("--supersede-before-first-run is valid only with --write.");
  }
  return options;
}

async function runCli(argv) {
  const options = parseArgs(argv);
  const proposal = await buildPhase5CandidateRebindProposal(options);
  const preview = summarizePhase5CandidateRebind(proposal);
  if (options.write) {
    const result = await applyPhase5CandidateRebind(proposal, {
      supersedeBeforeFirstRun: options.supersedeBeforeFirstRun,
    });
    process.stdout.write(
      `${JSON.stringify({ ...preview, write_status: "committed", ...result }, null, 2)}\n`,
    );
  } else {
    process.stdout.write(`${JSON.stringify(preview, null, 2)}\n`);
  }
}

if (path.resolve(process.argv[1] ?? "") === path.resolve(modulePath)) {
  await runCli(process.argv.slice(2));
}
