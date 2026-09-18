#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { lstat, readFile, realpath } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { TextDecoder } from "node:util";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function sha256(value) {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function parseArgs(argv) {
  const values = new Map();
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    invariant(argument.startsWith("--"), `Unexpected argument: ${argument}`);
    const next = argv[index + 1];
    if (next === undefined || next.startsWith("--")) values.set(argument, true);
    else {
      values.set(argument, next);
      index += 1;
    }
  }
  return values;
}

const unitIds = Array.from({ length: 8 }, (_, index) => `004/0${index}`);
const fullCommit = /^[0-9a-f]{40}$/u;
const sanitizedGitEnvironment = Object.fromEntries(
  Object.entries(process.env).filter(
    ([key]) => !key.toUpperCase().startsWith("GIT_"),
  ),
);
const nullDevice = process.platform === "win32" ? "NUL" : "/dev/null";
const controlPaths = new Set([
  "plans/004-validate-salt-ai-product-wedge.md",
  "plans/README.md",
  "plans/evidence/004/index.json",
]);
const unit00ExactPaths = [
  "AGENTS.md",
  "package.json",
  "plans/001-build-salt-ai-knowledge-platform.md",
  "plans/002-add-secure-historical-salt-knowledge.md",
  "plans/003-publish-salt-ai-release-candidate.md",
  "plans/004-validate-salt-ai-product-wedge.md",
  "plans/evidence/004/index.json",
  "plans/README.md",
  "scripts/checkChangedQuality.mjs",
  "scripts/checkChangedQuality.spec.js",
  "scripts/fixtures/changed-quality/prettierignore",
  "scripts/schemas/salt-ai-plan-004-evidence-index.schema.json",
  "scripts/validateSaltAiPlan004.mjs",
  "scripts/validateSaltAiPlan004.spec.js",
];
const technicalUnitIds = new Set(["004/00", "004/01", "004/02"]);
const successfulEvidenceResult = new Map([
  ["004/03", "PASS_NEED"],
  ["004/04", "PASS_CANDIDATE"],
  ["004/05", "READY_FOR_MODEL_AUTHORIZATION"],
  ["004/06", "PASS_CORE"],
  ["004/07", "PASS"],
]);
const terminalResults = new Set([
  "PASS",
  "DEFER_AUTHORITY_MISSING_OR_EXPIRED",
  "DEFER_PROTOCOL_INVALID",
  "DEFER_LEDGER_INVALID",
  "CUT_FINAL_TRUST",
  "CUT_FINAL_COMPETITIVE",
  "CUT_FINAL_ADOPTION",
]);
const plan004InitialAncestry = "d30dc1f7fca047e5180c15d07bb7be4557305eff";

function compileSchema(schema) {
  const validator = new Ajv2020({ allErrors: true, strict: true });
  addFormats(validator);
  return { validator, validate: validator.compile(schema) };
}

const defaultIndexSchemaValidation = compileSchema(
  JSON.parse(
    await readFile(
      path.join(
        repositoryRoot,
        "scripts",
        "schemas",
        "salt-ai-plan-004-evidence-index.schema.json",
      ),
      "utf8",
    ),
  ),
);

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function hasControlCharacters(value) {
  return [...value].some((character) => {
    const codePoint = character.codePointAt(0);
    return codePoint !== undefined && (codePoint <= 31 || codePoint === 127);
  });
}

export function readUniqueMarkdownField(text, label) {
  const marker = `- **${label}:**`;
  const lines = String(text).split(/\r?\n/u);
  const positions = lines
    .map((line, index) => (line.startsWith(marker) ? index : -1))
    .filter((index) => index >= 0);
  invariant(
    positions.length === 1,
    `Expected exactly one canonical Markdown field: ${label}`,
  );
  const position = positions[0];
  const parts = [lines[position].slice(marker.length).trim()];
  for (let index = position + 1; index < lines.length; index += 1) {
    if (!/^\s{2,}\S/u.test(lines[index]) || /^\s*- \*\*/u.test(lines[index]))
      break;
    parts.push(lines[index].trim());
  }
  return parts.filter(Boolean).join(" ");
}

export function validateRepositoryLocator(locator) {
  invariant(
    typeof locator === "string" && locator.startsWith("plans/evidence/004/"),
    `Unsafe Plan 004 evidence locator: ${String(locator)}`,
  );
  invariant(
    !locator.includes("\\") && !path.posix.isAbsolute(locator),
    `Unsafe Plan 004 evidence locator: ${locator}`,
  );
  invariant(
    !locator.split("/").includes(".."),
    `Unsafe Plan 004 evidence locator: ${locator}`,
  );
  invariant(
    !hasControlCharacters(locator),
    `Unsafe Plan 004 evidence locator: ${locator}`,
  );
  return locator;
}

export function validateSchemaLocator(locator) {
  invariant(
    typeof locator === "string" &&
      locator.endsWith(".schema.json") &&
      (locator.startsWith("scripts/schemas/") ||
        locator.startsWith("evals/salt-ai/opportunity/") ||
        locator.startsWith("evals/salt-ai/candidate/") ||
        locator.startsWith("evals/salt-ai/pilot/")),
    `Unsafe Plan 004 schema locator: ${String(locator)}`,
  );
  invariant(
    !locator.includes("\\") &&
      !path.posix.isAbsolute(locator) &&
      !locator.split("/").some((segment) => segment === ".." || !segment) &&
      !hasControlCharacters(locator),
    `Unsafe Plan 004 schema locator: ${locator}`,
  );
  return locator;
}

function sortedUnique(values, label) {
  const sorted = values.toSorted((left, right) => left.localeCompare(right));
  invariant(
    new Set(values).size === values.length,
    `${label} contains duplicates`,
  );
  invariant(
    values.every((value, index) => value === sorted[index]),
    `${label} is not path-sorted`,
  );
}

function evidenceEqual(left, right) {
  return (
    left?.locator === right?.locator &&
    left?.sha256 === right?.sha256 &&
    left?.schema === right?.schema &&
    left?.schema_locator === right?.schema_locator &&
    left?.schema_sha256 === right?.schema_sha256 &&
    left?.result === right?.result
  );
}

export function assertRealPathContained(rootRealPath, targetRealPath, label) {
  const containment = path.relative(rootRealPath, targetRealPath);
  invariant(
    containment !== ".." &&
      !containment.startsWith(`..${path.sep}`) &&
      !path.isAbsolute(containment),
    `${label} resolves outside the repository`,
  );
}

async function readWorktreeRegularFile(root, locator, label) {
  const absolute = path.resolve(root, ...locator.split("/"));
  const [rootRealPath, targetRealPath, stats] = await Promise.all([
    realpath(root),
    realpath(absolute),
    lstat(absolute),
  ]);
  assertRealPathContained(rootRealPath, targetRealPath, label);
  invariant(
    stats.isFile() && !stats.isSymbolicLink(),
    `${label} is not a regular file`,
  );
  return readFile(absolute);
}

async function validateEvidence(
  evidence,
  { root, verifyEvidence, readTrackedFile = null },
) {
  validateRepositoryLocator(evidence.locator);
  validateSchemaLocator(evidence.schema_locator);
  if (!verifyEvidence) return;
  const readRepositoryFile =
    readTrackedFile ??
    ((locator, label) => readWorktreeRegularFile(root, locator, label));
  const [bytes, schemaBytes] = await Promise.all([
    readRepositoryFile(evidence.locator, evidence.locator),
    readRepositoryFile(evidence.schema_locator, evidence.schema_locator),
  ]);
  invariant(
    sha256(bytes) === evidence.sha256,
    `${evidence.locator} digest mismatch`,
  );
  invariant(
    sha256(schemaBytes) === evidence.schema_sha256,
    `${evidence.schema_locator} digest mismatch`,
  );
  const receipt = JSON.parse(bytes.toString("utf8"));
  const receiptSchema = JSON.parse(schemaBytes.toString("utf8"));
  const receiptSchemaValidator = new Ajv2020({ allErrors: true, strict: true });
  addFormats(receiptSchemaValidator);
  const validateReceipt = receiptSchemaValidator.compile(receiptSchema);
  invariant(
    validateReceipt(receipt),
    `${evidence.locator} failed receipt schema validation: ${receiptSchemaValidator.errorsText(validateReceipt.errors, { separator: "; " })}`,
  );
  invariant(
    receipt.contract === evidence.schema,
    `${evidence.locator} schema mismatch`,
  );
  invariant(
    receipt.result === evidence.result,
    `${evidence.locator} result mismatch`,
  );
}

export async function validatePlan004Index(
  index,
  {
    root = repositoryRoot,
    verifyCommit = () => {},
    verifyAncestry = () => {},
    dirtyEntries = [],
    committedEntries = [],
    allowInheritedDirty = false,
    readmeText = null,
    indexDigest = null,
    plan003Text = null,
    verifyEvidence = true,
    readTrackedFile = null,
    indexSchemaValidation = defaultIndexSchemaValidation,
    authorizedScopePaths = null,
    inheritedSnapshot = null,
  } = {},
) {
  invariant(
    indexSchemaValidation.validate(index),
    `Plan 004 index failed schema validation: ${indexSchemaValidation.validator.errorsText(indexSchemaValidation.validate.errors, { separator: "; " })}`,
  );
  invariant(
    index.planned_ancestry === plan004InitialAncestry,
    "Plan 004 planned ancestry differs from its immutable adoption boundary",
  );
  verifyCommit(index.planned_ancestry, "planned ancestry");
  invariant(
    index.inherited_worktree.base_sha === index.planned_ancestry,
    "Inherited worktree base differs from planned ancestry",
  );
  sortedUnique(
    index.inherited_worktree.product_paths,
    "Inherited product paths",
  );
  sortedUnique(
    index.inherited_worktree.path_states.map((entry) => entry.path),
    "Inherited path states",
  );
  invariant(
    index.inherited_worktree.product_paths.length ===
      index.inherited_worktree.path_states.length &&
      index.inherited_worktree.product_paths.every(
        (file, position) =>
          file === index.inherited_worktree.path_states[position].path,
      ),
    "Inherited product paths and states differ",
  );
  invariant(
    index.units
      .map((unit) => unit.id)
      .every((id, index_) => id === unitIds[index_]),
    "Plan 004 units are missing, duplicated, or reordered",
  );

  const activeUnits = index.units.filter(
    (unit) => unit.status === "IN_PROGRESS",
  );
  invariant(activeUnits.length <= 1, "Plan 004 has multiple active units");
  if (index.active_dispatch === null) {
    invariant(
      activeUnits.length === 0,
      "Plan 004 has an active unit without active_dispatch",
    );
  } else {
    invariant(
      activeUnits.length === 1 &&
        activeUnits[0].id === index.active_dispatch.unit,
      "Plan 004 active dispatch does not match the active unit",
    );
    invariant(
      activeUnits[0].checkpoint_sha === index.active_dispatch.checkpoint_sha,
      "Plan 004 active checkpoint mismatch",
    );
  }

  const evidenceLocators = new Set();
  for (const [position, unit] of index.units.entries()) {
    const previous = position === 0 ? null : index.units[position - 1];
    const expectedDependency = position === 0 ? null : unitIds[position - 1];
    invariant(
      unit.dependency_unit === expectedDependency,
      `${unit.id} has the wrong dependency`,
    );
    if (unit.checkpoint_sha !== null)
      verifyCommit(unit.checkpoint_sha, `${unit.id} checkpoint`);
    if (unit.dependency_completion_sha !== null)
      verifyCommit(
        unit.dependency_completion_sha,
        `${unit.id} dependency completion`,
      );
    if (unit.completion_sha !== null)
      verifyCommit(unit.completion_sha, `${unit.id} completion`);
    if (position === 0) {
      invariant(
        unit.dependency_completion_sha === null,
        `${unit.id} cannot have a dependency completion`,
      );
      if (unit.checkpoint_sha !== null)
        invariant(
          unit.checkpoint_sha === index.planned_ancestry,
          `${unit.id} checkpoint differs from planned ancestry`,
        );
    } else if (unit.dependency_completion_sha !== null) {
      invariant(
        previous?.completion_sha === unit.dependency_completion_sha,
        `${unit.id} dependency completion differs from ${previous?.id}`,
      );
      invariant(
        previous?.status === "DONE" && previous.successor_eligible,
        `${unit.id} depends on an incomplete or ineligible predecessor`,
      );
      invariant(
        unit.checkpoint_sha === unit.dependency_completion_sha,
        `${unit.id} checkpoint differs from dependency completion`,
      );
    } else {
      invariant(
        unit.checkpoint_sha === null && unit.status === "TODO",
        `${unit.id} lacks its dependency completion`,
      );
    }
    if (unit.completion_sha !== null) {
      invariant(
        unit.checkpoint_sha !== null &&
          unit.completion_sha !== unit.checkpoint_sha,
        `${unit.id} completion must descend from a distinct checkpoint`,
      );
      verifyAncestry(
        unit.checkpoint_sha,
        unit.completion_sha,
        `${unit.id} checkpoint-to-completion ancestry`,
      );
    }
    invariant(
      unit.status !== "DONE" || unit.completion_sha !== null,
      `${unit.id} DONE lacks completion SHA`,
    );
    invariant(
      unit.status !== "DONE" || unit.verification.length > 0,
      `${unit.id} DONE lacks verification evidence`,
    );
    invariant(
      unit.status !== "IN_PROGRESS" || unit.scope.materialized,
      `${unit.id} active scope is not materialized`,
    );
    invariant(
      unit.scope.allow_inherited_dirty === position <= 1,
      `${unit.id} has the wrong inherited-dirty policy`,
    );
    sortedUnique(unit.scope.exact_paths, `${unit.id} scope`);
    for (const file of unit.scope.exact_paths) {
      invariant(
        !file.includes("\\") &&
          !path.posix.isAbsolute(file) &&
          !file.split("/").includes(".."),
        `${unit.id} has an unsafe scope path: ${file}`,
      );
    }
    if (unit.evidence !== null) {
      invariant(
        !evidenceLocators.has(unit.evidence.locator),
        `Duplicate evidence locator ${unit.evidence.locator}`,
      );
      evidenceLocators.add(unit.evidence.locator);
      await validateEvidence(unit.evidence, {
        root,
        verifyEvidence,
        readTrackedFile,
      });
    }
    if (unit.successor_eligible) {
      invariant(
        unit.status === "DONE",
        `${unit.id} enables a successor before DONE`,
      );
      if (technicalUnitIds.has(unit.id)) {
        invariant(
          unit.evidence === null &&
            unit.verification.length > 0 &&
            unit.verification.every((entry) => entry.result === "pass"),
          `${unit.id} enables a successor without passing verification evidence`,
        );
      } else {
        invariant(
          unit.evidence !== null &&
            unit.evidence.result === successfulEvidenceResult.get(unit.id),
          `${unit.id} enables a successor from a non-PASS result`,
        );
      }
    }
  }

  if (index.terminal_decision !== null) {
    await validateEvidence(index.terminal_decision, {
      root,
      verifyEvidence,
      readTrackedFile,
    });
    invariant(
      evidenceEqual(index.terminal_decision, index.units[7].evidence),
      "Terminal decision is not Unit 004/07 evidence",
    );
    invariant(
      terminalResults.has(index.terminal_decision.result),
      "Terminal decision has a non-terminal result",
    );
    invariant(
      index.active_dispatch === null && index.units[7].status === "DONE",
      "Terminal decision exists before Unit 004/07 completion",
    );
    invariant(
      index.plan_003_eligible === (index.terminal_decision.result === "PASS"),
      "Plan 003 eligibility differs from the terminal decision",
    );
  }
  if (index.plan_003_eligible) {
    invariant(
      index.active_dispatch === null,
      "Plan 003 is eligible while Plan 004 is active",
    );
    invariant(
      index.terminal_decision?.result === "PASS",
      "Plan 003 eligibility lacks final PASS",
    );
    invariant(
      index.units.every(
        (unit) => unit.status === "DONE" && unit.successor_eligible,
      ),
      "Plan 003 eligibility lacks the completed eligible unit chain",
    );
  } else if (plan003Text !== null) {
    invariant(
      /^DEFERRED(?:\s|—|$)/u.test(
        readUniqueMarkdownField(plan003Text, "Status"),
      ),
      "Plan 003 is not deferred without a Plan 004 PASS",
    );
  }

  if (readmeText !== null) {
    if (index.active_dispatch === null) {
      invariant(
        readUniqueMarkdownField(readmeText, "Active plan/unit") === "none",
        "README dispatch should be none",
      );
    } else {
      invariant(
        readUniqueMarkdownField(readmeText, "Active plan/unit") ===
          `\`${index.active_dispatch.unit}\``,
        "README active unit differs from the index",
      );
      invariant(
        readUniqueMarkdownField(readmeText, "Ancestry checkpoint") ===
          `\`${index.active_dispatch.checkpoint_sha}\``,
        "README checkpoint differs from the index",
      );
    }
    if (indexDigest !== null) {
      invariant(
        readUniqueMarkdownField(readmeText, "Plan 004 evidence authority") ===
          `\`plans/evidence/004/index.json@${indexDigest}\``,
        "README Plan 004 index digest differs from the index bytes",
      );
    }
  }

  const active = activeUnits[0] ?? null;
  if (active !== null && authorizedScopePaths !== null)
    invariant(
      active.scope.exact_paths.length === authorizedScopePaths.length &&
        active.scope.exact_paths.every(
          (file, index_) => file === authorizedScopePaths[index_],
        ),
      `${active.id} scope differs from its authorized dispatch scope`,
    );
  const committedAllowed = new Set(
    authorizedScopePaths ?? active?.scope.exact_paths ?? [],
  );
  const dirtyAllowed = new Set(committedAllowed);
  if (allowInheritedDirty) {
    invariant(
      active?.scope.allow_inherited_dirty,
      "Inherited dirty paths are not allowed for this unit",
    );
    if (active.id === "004/00") {
      for (const file of index.inherited_worktree.product_paths)
        dirtyAllowed.add(file);
      invariant(
        inheritedSnapshot !== null &&
          inheritedSnapshot.staged_patch_sha256 ===
            index.inherited_worktree.staged_patch_sha256 &&
          inheritedSnapshot.unstaged_patch_sha256 ===
            index.inherited_worktree.unstaged_patch_sha256 &&
          JSON.stringify(inheritedSnapshot.path_states) ===
            JSON.stringify(index.inherited_worktree.path_states) &&
          JSON.stringify(inheritedSnapshot.untracked_files) ===
            JSON.stringify(index.inherited_worktree.untracked_files),
        "Inherited Unit 004/00 worktree differs from its adopted snapshot",
      );
    } else {
      invariant(
        active.id === "004/01" &&
          index.inherited_worktree.product_paths.every((file) =>
            committedAllowed.has(file),
          ),
        "Unit 004/01 inherited paths are not fully contained by its authorized scope",
      );
    }
  }
  for (const entry of dirtyEntries) {
    invariant(
      !entry.renameOrCopy,
      `Renames/copies are forbidden in active scope: ${entry.path}`,
    );
    invariant(
      dirtyAllowed.has(entry.path),
      `Dirty path outside ${active?.id ?? "terminal"} scope: ${entry.path}`,
    );
  }
  for (const entry of committedEntries) {
    invariant(
      !entry.renameOrCopy,
      `Committed renames/copies are forbidden: ${entry.path}`,
    );
    invariant(
      committedAllowed.has(entry.path) || controlPaths.has(entry.path),
      `Committed path outside ${active?.id ?? "terminal"} scope: ${entry.path}`,
    );
  }
  return index;
}

function runGit(arguments_, { root = repositoryRoot, encoding = "utf8" } = {}) {
  return execFileSync(
    "git",
    [
      `--work-tree=${root}`,
      "-c",
      "core.commitGraph=false",
      "-c",
      "core.fsmonitor=false",
      "-c",
      "core.untrackedCache=false",
      ...arguments_,
    ],
    {
      cwd: root,
      encoding,
      env: {
        ...sanitizedGitEnvironment,
        GIT_GRAFT_FILE: nullDevice,
        GIT_LITERAL_PATHSPECS: "1",
        GIT_NO_REPLACE_OBJECTS: "1",
      },
      maxBuffer: 64 * 1024 * 1024,
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    },
  );
}

function assertNoHiddenIndexEntries(root) {
  assertNoHiddenIndexRecords(
    runGit(["ls-files", "-v", "-z"], { root, encoding: null }),
  );
}

export function assertNoHiddenIndexRecords(value) {
  for (const record of splitNul(value)) {
    invariant(
      !/^[a-zS]/u.test(record),
      `Tracked path uses assume-unchanged or skip-worktree: ${record.slice(2)}`,
    );
  }
}

function createCommitVerifier(root) {
  return (commit, label) => {
    invariant(fullCommit.test(commit), `${label} is not a full commit SHA`);
    const resolved = String(
      runGit(["rev-parse", "--verify", `${commit}^{commit}`], { root }),
    ).trim();
    invariant(resolved === commit, `${label} did not resolve exactly`);
    runGit(["merge-base", "--is-ancestor", commit, "HEAD"], { root });
  };
}

function createAncestryVerifier(root) {
  return (ancestor, descendant, label) => {
    try {
      runGit(["merge-base", "--is-ancestor", ancestor, descendant], { root });
    } catch {
      throw new Error(`${label} is invalid`);
    }
  };
}

function splitNul(value) {
  let text;
  try {
    text = Buffer.isBuffer(value)
      ? new TextDecoder("utf-8", { fatal: true }).decode(value)
      : String(value);
  } catch {
    throw new Error("Git returned a path that is not valid UTF-8");
  }
  return text.split("\0").filter(Boolean);
}

export function parsePorcelainV1Z(value) {
  const records = splitNul(value);
  const entries = [];
  for (let index = 0; index < records.length; index += 1) {
    const record = records[index];
    invariant(
      record.length >= 4 && record[2] === " ",
      `Malformed Git status record: ${record}`,
    );
    const code = record.slice(0, 2);
    const renameOrCopy = /[RC]/u.test(code);
    invariant(
      !renameOrCopy || index + 1 < records.length,
      `Malformed Git rename/copy record: ${record}`,
    );
    entries.push({ path: record.slice(3), code, renameOrCopy });
    if (renameOrCopy) index += 1;
  }
  return entries;
}

export function parseNameStatusZ(value) {
  const records = splitNul(value);
  const entries = [];
  for (let index = 0; index < records.length; ) {
    const code = records[index++];
    invariant(
      /^(?:[ADMUTX]|[RC][0-9]{1,3})$/u.test(code),
      `Malformed Git diff status: ${code}`,
    );
    const renameOrCopy = /^[RC]/u.test(code);
    const sourcePath = records[index++];
    invariant(
      sourcePath !== undefined,
      `Missing path for Git diff status ${code}`,
    );
    if (renameOrCopy) {
      const destinationPath = records[index++];
      invariant(
        destinationPath !== undefined,
        `Missing destination for Git diff status ${code}`,
      );
      entries.push({
        path: destinationPath,
        sourcePath,
        code,
        renameOrCopy: true,
      });
    } else {
      entries.push({ path: sourcePath, code, renameOrCopy: false });
    }
  }
  return entries;
}

export function enumerateCommittedEntries(checkpoint, end, run) {
  if (checkpoint === null) return [];
  const commits = String(
    run(["rev-list", "--reverse", "--ancestry-path", `${checkpoint}..${end}`]),
  )
    .trim()
    .split(/\r?\n/u)
    .filter(Boolean);
  const entries = [];
  for (const commit of commits) {
    const ancestry = String(run(["rev-list", "--parents", "-n", "1", commit]))
      .trim()
      .split(/\s+/u);
    invariant(
      ancestry.length === 2,
      `Merge or parentless commit is forbidden in unit range: ${commit}`,
    );
    entries.push(
      ...parseNameStatusZ(
        run(
          [
            "diff",
            "--no-ext-diff",
            "--no-textconv",
            "--name-status",
            "-z",
            "--find-renames",
            "--find-copies",
            "--find-copies-harder",
            "--diff-filter=ACDMRTUX",
            `${ancestry[1]}..${commit}`,
          ],
          { encoding: null },
        ),
      ),
    );
  }
  return entries.toSorted((left, right) => left.path.localeCompare(right.path));
}

function changedEntriesBetween(checkpoint, root, end = "HEAD") {
  return enumerateCommittedEntries(
    checkpoint,
    end,
    (arguments_, options = {}) => runGit(arguments_, { root, ...options }),
  );
}

function readRevisionRegularFile(root, revision, locator, label = locator) {
  const records = splitNul(
    runGit(["ls-tree", "-z", revision, "--", locator], {
      root,
      encoding: null,
    }),
  );
  invariant(
    records.length === 1,
    `${label} is not tracked exactly once at ${revision}`,
  );
  const match = /^(100[0-7]{3}) blob [0-9a-f]+\t(.+)$/u.exec(records[0]);
  invariant(
    match?.[2] === locator,
    `${label} is not a regular file at ${revision}`,
  );
  return runGit(["show", `${revision}:${locator}`], {
    root,
    encoding: null,
  });
}

function readHeadRegularFile(root, locator, label = locator) {
  return readRevisionRegularFile(root, "HEAD", locator, label);
}

function readIndexRegularFile(root, locator, label = locator) {
  const records = splitNul(
    runGit(["ls-files", "--stage", "-z", "--", locator], {
      root,
      encoding: null,
    }),
  );
  invariant(
    records.length === 1,
    `${label} is not present exactly once in the Git index`,
  );
  const match = /^(100[0-7]{3}) [0-9a-f]+ 0\t(.+)$/u.exec(records[0]);
  invariant(
    match?.[2] === locator,
    `${label} is not a regular stage-zero index file`,
  );
  return runGit(["show", `:${locator}`], { root, encoding: null });
}

async function readMatchingIndexFile(root, locator, label = locator) {
  const [indexBytes, worktreeBytes] = await Promise.all([
    Promise.resolve(readIndexRegularFile(root, locator, label)),
    readWorktreeRegularFile(root, locator, label),
  ]);
  invariant(
    indexBytes.equals(worktreeBytes),
    `${label} differs between the Git index and worktree`,
  );
  return indexBytes;
}

function authorizedScopeForUnit(unit, checkpoint, end, root) {
  if (unit === "004/00") return unit00ExactPaths;
  invariant(checkpoint !== null, `${unit} lacks a trusted scope checkpoint`);
  const commits = String(
    runGit(
      [
        "rev-list",
        "--reverse",
        "--ancestry-path",
        `${checkpoint}..${end}`,
        "--",
        "plans/evidence/004/index.json",
      ],
      { root },
    ),
  )
    .trim()
    .split(/\r?\n/u)
    .filter(Boolean);
  invariant(commits.length > 0, `${unit} has no committed dispatch index`);
  const dispatchCommit = commits[0];
  const parent = String(
    runGit(["rev-parse", "--verify", `${dispatchCommit}^`], { root }),
  ).trim();
  assertDispatchFollowsCheckpoint(parent, checkpoint, unit);
  const dispatchEntries = changedEntriesBetween(parent, root, dispatchCommit);
  invariant(
    dispatchEntries.every(
      (entry) => !entry.renameOrCopy && controlPaths.has(entry.path),
    ),
    `${unit} dispatch commit contains non-control paths`,
  );
  const dispatchIndex = JSON.parse(
    readRevisionRegularFile(
      root,
      dispatchCommit,
      "plans/evidence/004/index.json",
    ).toString("utf8"),
  );
  invariant(
    dispatchIndex.active_dispatch?.unit === unit &&
      dispatchIndex.active_dispatch.checkpoint_sha === checkpoint,
    `${unit} committed dispatch differs from the active checkpoint`,
  );
  const dispatchedUnit = dispatchIndex.units.find((entry) => entry.id === unit);
  invariant(
    dispatchedUnit?.status === "IN_PROGRESS" &&
      dispatchedUnit.scope.materialized,
    `${unit} committed dispatch is not active and materialized`,
  );
  return dispatchedUnit.scope.exact_paths;
}

export function assertDispatchFollowsCheckpoint(parent, checkpoint, unit) {
  invariant(
    parent === checkpoint,
    `${unit} dispatch commit does not immediately follow its checkpoint`,
  );
}

export function assertCommittedEntriesAuthorized(entries, scopePaths, label) {
  const allowed = new Set(scopePaths);
  for (const entry of entries) {
    invariant(
      !entry.renameOrCopy,
      `${label} contains a rename/copy: ${entry.path}`,
    );
    invariant(
      allowed.has(entry.path) || controlPaths.has(entry.path),
      `${label} contains an out-of-scope path: ${entry.path}`,
    );
  }
}

function validateCompletedUnitRanges(index, root) {
  const unit00 = index.units[0];
  if (unit00.status === "DONE") {
    invariant(
      unit00.completion_sha !== null,
      "Unit 004/00 completion is absent",
    );
    const adoptionIndex = JSON.parse(
      readRevisionRegularFile(
        root,
        unit00.completion_sha,
        "plans/evidence/004/index.json",
      ).toString("utf8"),
    );
    assertInheritedAuthorityPreserved(
      index.inherited_worktree,
      adoptionIndex.inherited_worktree,
    );
  }
  for (const unit of index.units.filter((entry) => entry.status === "DONE")) {
    invariant(
      unit.checkpoint_sha !== null && unit.completion_sha !== null,
      `${unit.id} completed range is incomplete`,
    );
    const authorizedScope = authorizedScopeForUnit(
      unit.id,
      unit.checkpoint_sha,
      unit.completion_sha,
      root,
    );
    invariant(
      unit.scope.exact_paths.length === authorizedScope.length &&
        unit.scope.exact_paths.every(
          (file, index_) => file === authorizedScope[index_],
        ),
      `${unit.id} completed scope differs from its authorized dispatch scope`,
    );
    assertCommittedEntriesAuthorized(
      changedEntriesBetween(unit.checkpoint_sha, root, unit.completion_sha),
      authorizedScope,
      `${unit.id} completed range`,
    );
  }
}

export function assertInheritedAuthorityPreserved(current, adopted) {
  invariant(
    JSON.stringify(current) === JSON.stringify(adopted),
    "Inherited worktree authority differs from Unit 004/00 completion",
  );
}

async function captureInheritedSnapshot(index, dirtyEntries, root) {
  const productPaths = index.inherited_worktree.product_paths;
  const productSet = new Set(productPaths);
  const productEntries = dirtyEntries.filter((entry) =>
    productSet.has(entry.path),
  );
  const pathStates = productEntries
    .map((entry) => ({
      path: entry.path,
      state:
        entry.code === "??"
          ? "untracked"
          : entry.code.includes("D")
            ? "deleted"
            : "modified",
    }))
    .toSorted((left, right) => left.path.localeCompare(right.path));
  const untrackedFiles = [];
  for (const entry of productEntries.filter((item) => item.code === "??")) {
    const bytes = await readWorktreeRegularFile(root, entry.path, entry.path);
    untrackedFiles.push({ path: entry.path, sha256: sha256(bytes) });
  }
  untrackedFiles.sort((left, right) => left.path.localeCompare(right.path));
  return {
    path_states: pathStates,
    staged_patch_sha256: sha256(
      runGit(
        [
          "diff",
          "--no-ext-diff",
          "--no-textconv",
          "--cached",
          "--binary",
          "--",
          ...productPaths,
        ],
        {
          root,
          encoding: null,
        },
      ),
    ),
    unstaged_patch_sha256: sha256(
      runGit(
        [
          "diff",
          "--no-ext-diff",
          "--no-textconv",
          "--binary",
          "--",
          ...productPaths,
        ],
        {
          root,
          encoding: null,
        },
      ),
    ),
    untracked_files: untrackedFiles,
  };
}

export function resolveCheckpoint(index, requested, phase) {
  const recorded =
    index.active_dispatch?.checkpoint_sha ??
    (phase === "final" ? index.units[7].completion_sha : null);
  const checkpoint = requested ?? recorded;
  if (checkpoint !== null)
    invariant(
      fullCommit.test(checkpoint),
      "--checkpoint must be a full commit SHA",
    );
  invariant(
    checkpoint === recorded,
    `${phase} checkpoint differs from active dispatch`,
  );
  return checkpoint;
}

export function assertDerivedExpectation(index, phase) {
  invariant(
    phase === "final",
    "--expect-derived is only valid for final validation",
  );
  const result = index.terminal_decision?.result ?? null;
  invariant(
    result !== null,
    "Derived final expectation requires a terminal decision",
  );
  invariant(
    index.plan_003_eligible === (result === "PASS"),
    "Derived Plan 003 eligibility differs from the terminal result",
  );
  return result;
}

function currentUnitResult(index, unit) {
  if (unit)
    return (
      index.units.find((entry) => entry.id === unit)?.evidence?.result ?? null
    );
  return index.terminal_decision?.result ?? null;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const allowed = new Set([
    "--phase",
    "--unit",
    "--checkpoint",
    "--completion",
    "--allow-inherited-dirty",
    "--expect",
    "--expect-derived",
  ]);
  for (const key of args.keys())
    invariant(allowed.has(key), `Unknown option: ${key}`);
  const phase = String(args.get("--phase") ?? "");
  invariant(
    [
      "adopt",
      "preflight",
      "verify",
      "decision",
      "post-commit",
      "final",
    ].includes(phase),
    "Unknown or missing --phase",
  );
  invariant(
    !(args.has("--expect") && args.has("--expect-derived")),
    "Use only one expectation mode",
  );
  invariant(
    String(runGit(["rev-parse", "--is-shallow-repository"])).trim() === "false",
    "Plan 004 validation requires a complete, non-shallow Git repository",
  );
  assertNoHiddenIndexEntries(repositoryRoot);

  const indexLocator = "plans/evidence/004/index.json";
  const readmeLocator = "plans/README.md";
  const plan003Locator = "plans/003-publish-salt-ai-release-candidate.md";
  const validatorLocator = "scripts/validateSaltAiPlan004.mjs";
  const indexSchemaLocator =
    "scripts/schemas/salt-ai-plan-004-evidence-index.schema.json";
  const useHeadBytes = phase === "post-commit";
  if (useHeadBytes)
    invariant(
      args.has("--checkpoint"),
      "post-commit requires an explicit trusted --checkpoint",
    );
  const readTrackedFile = useHeadBytes
    ? (locator, label) =>
        Promise.resolve(readHeadRegularFile(repositoryRoot, locator, label))
    : (locator, label) => readMatchingIndexFile(repositoryRoot, locator, label);
  const [
    indexBytes,
    readmeBytes,
    plan003Bytes,
    indexSchemaBytes,
    validatorBytes,
  ] = await Promise.all([
    readTrackedFile(indexLocator, indexLocator),
    readTrackedFile(readmeLocator, readmeLocator),
    readTrackedFile(plan003Locator, plan003Locator),
    readTrackedFile(indexSchemaLocator, indexSchemaLocator),
    readTrackedFile(validatorLocator, validatorLocator),
  ]);
  if (useHeadBytes) {
    const executingValidatorBytes = await readFile(
      fileURLToPath(import.meta.url),
    );
    invariant(
      executingValidatorBytes.equals(validatorBytes),
      "Executing Plan 004 validator differs from the validator at HEAD",
    );
  }
  const index = JSON.parse(indexBytes.toString("utf8"));
  const indexSchemaValidation = compileSchema(
    JSON.parse(indexSchemaBytes.toString("utf8")),
  );
  const unit = args.get("--unit") ? String(args.get("--unit")) : null;
  const checkpoint = resolveCheckpoint(
    index,
    args.get("--checkpoint") ? String(args.get("--checkpoint")) : null,
    phase,
  );
  if (["preflight", "verify", "decision", "post-commit"].includes(phase)) {
    invariant(
      unit !== null && index.active_dispatch?.unit === unit,
      `${phase} requires the active --unit`,
    );
  }
  if (phase === "adopt")
    invariant(
      index.active_dispatch?.unit === "004/00",
      "adopt requires Unit 004/00 dispatch",
    );
  if (phase === "final")
    invariant(
      index.active_dispatch === null,
      "final validation requires no active unit",
    );
  const dirtyEntries = parsePorcelainV1Z(
    runGit(["status", "--porcelain=v1", "-z", "--untracked-files=all"], {
      encoding: null,
    }),
  );
  const committedEntries = changedEntriesBetween(checkpoint, repositoryRoot);
  const authorizedScopePaths =
    index.active_dispatch === null
      ? null
      : authorizedScopeForUnit(
          index.active_dispatch.unit,
          checkpoint,
          "HEAD",
          repositoryRoot,
        );
  const inheritedSnapshot =
    args.has("--allow-inherited-dirty") &&
    index.active_dispatch?.unit === "004/00"
      ? await captureInheritedSnapshot(index, dirtyEntries, repositoryRoot)
      : null;
  validateCompletedUnitRanges(index, repositoryRoot);
  await validatePlan004Index(index, {
    root: repositoryRoot,
    verifyCommit: createCommitVerifier(repositoryRoot),
    verifyAncestry: createAncestryVerifier(repositoryRoot),
    dirtyEntries,
    committedEntries,
    allowInheritedDirty: args.has("--allow-inherited-dirty"),
    readmeText: readmeBytes.toString("utf8"),
    indexDigest: sha256(indexBytes),
    plan003Text: plan003Bytes.toString("utf8"),
    readTrackedFile,
    indexSchemaValidation,
    authorizedScopePaths,
    inheritedSnapshot,
  });

  if (phase === "post-commit") {
    invariant(args.get("--completion"), "post-commit requires --completion");
    const completion = String(
      runGit([
        "rev-parse",
        "--verify",
        `${String(args.get("--completion"))}^{commit}`,
      ]),
    ).trim();
    invariant(
      completion === String(runGit(["rev-parse", "HEAD"])).trim(),
      "post-commit completion is not HEAD",
    );
    invariant(
      checkpoint !== null && completion !== checkpoint,
      "post-commit completion must differ from the recorded checkpoint",
    );
    createAncestryVerifier(repositoryRoot)(
      checkpoint,
      completion,
      "post-commit checkpoint-to-completion ancestry",
    );
  }
  if (args.has("--expect")) {
    const result = currentUnitResult(index, unit);
    invariant(
      result === String(args.get("--expect")),
      `Expected ${String(args.get("--expect"))}, received ${String(result)}`,
    );
  }
  if (args.has("--expect-derived")) assertDerivedExpectation(index, phase);

  console.log(
    `Plan 004 validated (${phase}; ${index.active_dispatch?.unit ?? "terminal"}; ${dirtyEntries.length} dirty paths).`,
  );
}

const isDirect =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirect) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
