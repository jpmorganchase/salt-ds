import { createHash } from "node:crypto";
import { lstat, readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const SHA256 = /^sha256:[0-9a-f]{64}$/u;

function sha256(value) {
  return (
    "sha256:" + createHash("sha256").update(JSON.stringify(value)).digest("hex")
  );
}

export const ACCESS_PROTOCOL_SHA256 = sha256({
  protocol: "salt-ai-doctor-consumer-access/1",
  outreach_attempt_limit: 20,
  business_day_limit: 10,
  required_consumers: 5,
  expected_valid_completions: 4,
  matched_pairs: 4,
  pair_strata: ["expected_noop", "repair_family_a", "repair_family_b"],
  assignment_order: { candidate_first: 2, comparator_first: 2 },
});

export const ACCESS_GRADER_SET_SHA256 = sha256({
  grader: "salt-ai-doctor-access-threshold/1",
  executable_owner_acceptance_required: true,
  candidate_and_comparator_task_per_pair: true,
  exact_current_consumers_only: true,
  synthetic_repositories_forbidden: true,
});

export const EMPTY_ASSIGNMENT_SHA256 = sha256({
  state: "not_authorized",
  pairs: [],
});

export const EMPTY_COMPARATOR_MAP_SHA256 = sha256({
  state: "not_authorized",
  alternatives: [],
});

const ROOT_KEYS = [
  "contract",
  "schema_version",
  "candidate_sha256",
  "knowledge_semantic_digest",
  "protocol_sha256",
  "grader_set_sha256",
  "assignment_sha256",
  "comparator_map_sha256",
  "authority",
  "consent",
  "expiry",
  "counts",
];

export const ACCESS_AUTHORITY_KEYS = [
  "product_research",
  "privacy",
  "retention",
  "storage",
  "participant_contact",
  "local_installation",
  "participant_model_use",
  "private_recruitment_readback",
  "assignment_verified",
  "comparator_map_verified",
];

export const PRE_CONTACT_AUTHORITY_KEYS = [
  "product_research",
  "privacy",
  "retention",
  "storage",
  "participant_contact",
];

export const ACCESS_CONSENT_KEYS = [
  "participant_data",
  "repository_access",
  "model_use",
];

export const ACCESS_EXPIRY_KEYS = [
  "retention_window_approved",
  "within_authorized_window",
];

export const ACCESS_COUNT_KEYS = [
  "outreach_attempts",
  "consent_eligible_consumers",
  "expected_valid_completions",
  "independent_groups",
  "repositories",
  "matched_pairs",
  "repair_family_a_pairs",
  "repair_family_b_pairs",
  "expected_noop_pairs",
  "executable_acceptance_checks",
  "candidate_first_pairs",
  "comparator_first_pairs",
  "frozen_comparator_alternatives",
  "frozen_workflow_pairs",
  "usable_configuration_pairs",
  "fresh_snapshot_tasks",
  "approved_install_cleanup_consumers",
];

function exactKeys(value, expected, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
  const actual = Object.keys(value).sort();
  const sortedExpected = [...expected].sort();
  if (JSON.stringify(actual) !== JSON.stringify(sortedExpected)) {
    throw new Error(`${label} has missing or additional properties.`);
  }
}

export function candidateDigestFromPackReport(report) {
  if (
    report?.contract !== "salt-ai-pack-report@1" ||
    !Array.isArray(report.packages) ||
    !SHA256.test(report.knowledge_bundle?.semantic_digest ?? "")
  ) {
    throw new Error("Cannot derive a candidate digest from this pack report.");
  }
  const packages = report.packages
    .map((entry) => ({
      name: entry.name,
      version: entry.version,
      tarball_sha256: entry.tarball?.sha256,
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
  if (
    packages.length !== 2 ||
    JSON.stringify(packages.map((entry) => entry.name)) !==
      JSON.stringify(["@salt-ds/cli", "@salt-ds/knowledge"]) ||
    packages.some((entry) => !SHA256.test(entry.tarball_sha256 ?? ""))
  ) {
    throw new Error(
      "Pack report does not bind the exact two-package candidate.",
    );
  }
  return sha256({
    contract: "salt-ai-doctor-candidate/1",
    packages,
    knowledge_semantic_digest: report.knowledge_bundle.semantic_digest,
  });
}

export function validateAccessSummary(value, expected = {}) {
  exactKeys(value, ROOT_KEYS, "Consumer access summary");
  if (
    value.contract !== "salt-ai-doctor-consumer-access/1" ||
    value.schema_version !== "1.0.0"
  ) {
    throw new Error("Consumer access summary has the wrong contract.");
  }
  for (const key of [
    "candidate_sha256",
    "knowledge_semantic_digest",
    "protocol_sha256",
    "grader_set_sha256",
    "assignment_sha256",
    "comparator_map_sha256",
  ]) {
    if (!SHA256.test(value[key])) {
      throw new Error(`Consumer access summary has an invalid ${key}.`);
    }
  }
  if (
    value.protocol_sha256 !== ACCESS_PROTOCOL_SHA256 ||
    value.grader_set_sha256 !== ACCESS_GRADER_SET_SHA256
  ) {
    throw new Error("Consumer access protocol or grader identity drifted.");
  }
  if (
    (expected.candidate_sha256 &&
      value.candidate_sha256 !== expected.candidate_sha256) ||
    (expected.knowledge_semantic_digest &&
      value.knowledge_semantic_digest !== expected.knowledge_semantic_digest)
  ) {
    throw new Error("Consumer access summary selects a different candidate.");
  }
  exactKeys(value.authority, ACCESS_AUTHORITY_KEYS, "Access authority");
  exactKeys(value.consent, ACCESS_CONSENT_KEYS, "Access consent");
  exactKeys(value.expiry, ACCESS_EXPIRY_KEYS, "Access expiry");
  for (const [label, object, keys] of [
    ["authority", value.authority, ACCESS_AUTHORITY_KEYS],
    ["consent", value.consent, ACCESS_CONSENT_KEYS],
    ["expiry", value.expiry, ACCESS_EXPIRY_KEYS],
  ]) {
    if (keys.some((key) => typeof object[key] !== "boolean")) {
      throw new Error(`Consumer access ${label} values must be boolean.`);
    }
  }
  exactKeys(value.counts, ACCESS_COUNT_KEYS, "Access counts");
  if (
    ACCESS_COUNT_KEYS.some(
      (key) =>
        !Number.isSafeInteger(value.counts[key]) || value.counts[key] < 0,
    ) ||
    value.counts.outreach_attempts > 20
  ) {
    throw new Error("Consumer access counts are invalid or exceed outreach.");
  }
  if (
    PRE_CONTACT_AUTHORITY_KEYS.some((key) => value.authority[key] !== true) &&
    (ACCESS_COUNT_KEYS.some((key) => value.counts[key] !== 0) ||
      value.assignment_sha256 !== EMPTY_ASSIGNMENT_SHA256 ||
      value.comparator_map_sha256 !== EMPTY_COMPARATOR_MAP_SHA256)
  ) {
    throw new Error(
      "Consumer activity was recorded without every pre-contact authority.",
    );
  }
  return value;
}

export function deriveAccessDecision(value, expected = {}) {
  validateAccessSummary(value, expected);
  if (
    ACCESS_AUTHORITY_KEYS.some((key) => value.authority[key] !== true) ||
    ACCESS_CONSENT_KEYS.some((key) => value.consent[key] !== true) ||
    ACCESS_EXPIRY_KEYS.some((key) => value.expiry[key] !== true)
  ) {
    return "DEFER_CONSUMER_ACCESS";
  }
  const counts = value.counts;
  const thresholdPassed =
    value.assignment_sha256 !== EMPTY_ASSIGNMENT_SHA256 &&
    value.comparator_map_sha256 !== EMPTY_COMPARATOR_MAP_SHA256 &&
    counts.consent_eligible_consumers >= 5 &&
    counts.expected_valid_completions >= 4 &&
    Math.max(counts.independent_groups, counts.repositories) >= 2 &&
    counts.matched_pairs === 4 &&
    counts.repair_family_a_pairs >= 1 &&
    counts.repair_family_b_pairs >= 1 &&
    counts.expected_noop_pairs >= 1 &&
    counts.executable_acceptance_checks === 8 &&
    counts.candidate_first_pairs === 2 &&
    counts.comparator_first_pairs === 2 &&
    counts.frozen_comparator_alternatives >= 1 &&
    counts.frozen_workflow_pairs === 4 &&
    counts.usable_configuration_pairs === 4 &&
    counts.fresh_snapshot_tasks === 8 &&
    counts.approved_install_cleanup_consumers >= 5;
  return thresholdPassed ? "READY_CONSUMER_PILOT" : "DEFER_CONSUMER_ACCESS";
}

export async function loadAccessSummary(filePath, expected = {}) {
  const resolved = path.resolve(filePath);
  const stats = await lstat(resolved);
  if (!stats.isFile() || stats.isSymbolicLink()) {
    throw new Error("Consumer access summary must be a regular file.");
  }
  const value = JSON.parse(await readFile(resolved, "utf8"));
  validateAccessSummary(value, expected);
  return value;
}

export async function runCli(args, io = process) {
  if (
    args.length !== 4 ||
    args[0] !== "--mode" ||
    args[1] !== "validate-access" ||
    args[2] !== "--input"
  ) {
    io.stderr.write(
      "Usage: node ./evals/salt-ai/doctor/pilot.mjs --mode validate-access --input <consumer-access.json>\n",
    );
    return 2;
  }
  try {
    const value = await loadAccessSummary(args[3]);
    const result = deriveAccessDecision(value);
    io.stdout.write(
      `${JSON.stringify({ contract: "salt-ai-doctor-access-validation/1", result })}\n`,
    );
    return 0;
  } catch (error) {
    io.stderr.write(
      `salt-ai Doctor access validation failed: ${error instanceof Error ? error.message : String(error)}\n`,
    );
    return 3;
  }
}

if (
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url
) {
  process.exitCode = await runCli(process.argv.slice(2));
}
