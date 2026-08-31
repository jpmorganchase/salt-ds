#!/usr/bin/env node

import {
  chmod,
  lstat,
  mkdir,
  readFile,
  realpath,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import {
  parseArgs,
  readJson,
  repositoryRoot,
  sha256,
  stableJson,
} from "../../../scripts/saltAiEvidenceUtils.mjs";
import {
  buildAlternativesDecision,
  buildDevelopmentBaseline,
  buildNeedDecision,
  deriveDecisionResult,
  targetJob,
} from "./aggregate.mjs";

const scriptPath = fileURLToPath(import.meta.url);
const opportunityRoot = path.dirname(scriptPath);
const schemaRoot = path.join(opportunityRoot, "schemas");
const offlineFile = "offline.json";
const alternativesLedgerFile = "alternatives-ledger.json";
const needLedgerFile = "need-ledger.json";
const alternativesDecisionFile = "alternatives-decision.json";
const developmentBaselineFile = "development-baseline.json";
const externalLocatorFile = "external-locator.json";
const alternativesAuthorizationFile = "alternatives-authorization.capture";
const needAuthorizationFile = "need-authorization.capture";
const needProtocolFile = "need-protocol.capture";
const needConsentFile = "need-consent.capture";
const validators = new Map();

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function outsideRepository(file) {
  const relative = path.relative(repositoryRoot, file);
  return (
    path.isAbsolute(relative) ||
    relative === ".." ||
    relative.startsWith(`..${path.sep}`)
  );
}

async function resolveExistingEvidenceRoot(locator) {
  invariant(
    typeof locator === "string" && path.isAbsolute(locator),
    "--evidence-root must be an absolute path",
  );
  const stats = await lstat(locator);
  invariant(
    stats.isDirectory() && !stats.isSymbolicLink(),
    "Evidence root must be a real directory",
  );
  const resolved = await realpath(locator);
  invariant(
    outsideRepository(resolved),
    "Evidence root must stay outside the repository",
  );
  return resolved;
}

async function createFreshEvidenceRoot(locator) {
  invariant(
    typeof locator === "string" && path.isAbsolute(locator),
    "--evidence-root must be an absolute path",
  );
  const requested = path.resolve(locator);
  invariant(
    outsideRepository(requested),
    "Evidence root must stay outside the repository",
  );
  const parent = await realpath(path.dirname(requested));
  invariant(
    outsideRepository(parent),
    "Evidence-root parent must stay outside the repository",
  );
  try {
    await lstat(requested);
    throw new Error("Offline preparation requires a fresh evidence root");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  await mkdir(requested, { mode: 0o700 });
  await chmod(requested, 0o700);
  return resolveExistingEvidenceRoot(requested);
}

async function readRegularBytes(file, label) {
  const stats = await lstat(file);
  invariant(
    stats.isFile() && !stats.isSymbolicLink(),
    `${label} must be a regular file`,
  );
  return readFile(file);
}

async function readExternalJson(root, name, label) {
  const bytes = await readRegularBytes(path.join(root, name), label);
  try {
    return { bytes, value: JSON.parse(bytes.toString("utf8")) };
  } catch {
    throw new Error(`${label} is not valid JSON`);
  }
}

async function verifyDigestFile(root, name, expected, label) {
  const bytes = await readRegularBytes(path.join(root, name), label);
  invariant(sha256(bytes) === expected, `${label} digest mismatch`);
  return bytes;
}

async function validatorFor(schemaName) {
  if (!validators.has(schemaName)) {
    const schema = await readJson(path.join(schemaRoot, schemaName));
    const ajv = new Ajv2020({ allErrors: true, strict: true });
    addFormats(ajv);
    validators.set(schemaName, {
      ajv,
      validate: ajv.compile(schema),
    });
  }
  return validators.get(schemaName);
}

async function validateSchema(value, schemaName, label) {
  const { ajv, validate } = await validatorFor(schemaName);
  invariant(
    validate(value),
    `${label} schema failure: ${ajv.errorsText(validate.errors, {
      separator: "; ",
    })}`,
  );
  return value;
}

function sortedUnique(values, label) {
  const sorted = [...new Set(values)].toSorted((left, right) =>
    left.localeCompare(right),
  );
  invariant(
    values.length === sorted.length &&
      values.every((value, index) => value === sorted[index]),
    `${label} must be sorted and unique`,
  );
}

function validateDateWindow({
  approved,
  completed,
  expires,
  retention,
  label,
}) {
  invariant(approved <= completed, `${label} predates approval`);
  invariant(completed <= expires, `${label} occurred after authority expiry`);
  invariant(expires <= retention, `${label} retention ends before expiry`);
}

async function writeImmutableJson(file, value) {
  const rendered = stableJson(value);
  await mkdir(path.dirname(file), { recursive: true });
  try {
    const current = await readFile(file, "utf8");
    invariant(
      current === rendered,
      "Immutable opportunity output already exists with different bytes",
    );
    return;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  await writeFile(file, rendered, {
    encoding: "utf8",
    flag: "wx",
    mode: 0o600,
  });
}

function assertTrackedOutput(locator, option, expectedFile) {
  invariant(
    typeof locator === "string" && locator.length > 0,
    `--${option} is required`,
  );
  const resolved = path.resolve(repositoryRoot, locator);
  const expected = path.join(
    repositoryRoot,
    "plans",
    "evidence",
    "004",
    expectedFile,
  );
  invariant(
    resolved === expected,
    `--${option} must select the registered Plan 004 receipt`,
  );
  return resolved;
}

function offlineDescriptor() {
  return {
    contract: "salt-ai-opportunity-offline/1",
    schema_version: "1.0.0",
    phase: "offline",
    target_job: targetJob,
    commands: ["prepare", "record", "score", "validate", "validate-decision"],
    participant_contact_authorized: false,
    network_authorized: false,
    model_calls_authorized: false,
    tracked_data: "sanitized_receipts_only",
  };
}

async function validateOffline(root) {
  const { value } = await readExternalJson(
    root,
    offlineFile,
    "Offline opportunity descriptor",
  );
  await validateSchema(
    value,
    "opportunity-ledger.schema.json",
    "Offline opportunity descriptor",
  );
  invariant(
    stableJson(value) === stableJson(offlineDescriptor()),
    "Offline opportunity descriptor differs from the registered protocol",
  );
  return value;
}

async function validateAlternatives(root) {
  await validateOffline(root);
  const { value: ledger } = await readExternalJson(
    root,
    alternativesLedgerFile,
    "Alternatives ledger",
  );
  await validateSchema(
    ledger,
    "opportunity-ledger.schema.json",
    "Alternatives ledger",
  );
  invariant(
    ledger.contract === "salt-ai-opportunity-alternatives-input/1",
    "Alternatives ledger has the wrong phase",
  );
  sortedUnique(
    ledger.authority.primary_source_domains,
    "Primary-source domains",
  );
  sortedUnique(
    ledger.sources.map((source) => source.alternative_id),
    "Alternative IDs",
  );
  validateDateWindow({
    approved: ledger.authority.approved_on,
    completed: ledger.research_completed_on,
    expires: ledger.authority.expires_on,
    retention: ledger.authority.retention_until,
    label: "Alternative research",
  });
  invariant(
    ledger.paid_access_spent_minor <=
      ledger.authority.paid_access_ceiling_minor,
    "Alternative research exceeded its paid-access ceiling",
  );
  await verifyDigestFile(
    root,
    alternativesAuthorizationFile,
    ledger.authority.authorization_sha256,
    "Alternatives authorization",
  );
  const permittedDomains = new Set(ledger.authority.primary_source_domains);
  for (const source of ledger.sources) {
    sortedUnique(source.capabilities, "Alternative capabilities");
    sortedUnique(source.known_limitations, "Alternative limitations");
    invariant(
      permittedDomains.has(source.primary_source_domain),
      "Alternative source domain is outside the authority allowlist",
    );
    invariant(
      source.source_date <= ledger.research_completed_on,
      "Alternative source date is after research completion",
    );
    const capture = await readRegularBytes(
      path.join(
        root,
        "captures",
        `${source.capture_sha256.slice("sha256:".length)}.capture`,
      ),
      "Alternative capture",
    );
    invariant(
      sha256(capture) === source.capture_sha256,
      "Alternative capture digest mismatch",
    );
  }
  const { bytes: locatorBytes, value: locator } = await readExternalJson(
    root,
    externalLocatorFile,
    "External locator",
  );
  invariant(
    sha256(locatorBytes) === ledger.external_locator_sha256,
    "External locator digest mismatch",
  );
  const expectedLocator = {
    contract: "salt-ai-opportunity-external-locator/1",
    schema_version: "1.0.0",
    assets: ledger.sources.map((source) => ({
      asset_id: `source-${source.alternative_id}`,
      sha256: source.capture_sha256,
      relative_locator: `captures/${source.capture_sha256.slice(
        "sha256:".length,
      )}.capture`,
    })),
  };
  invariant(
    stableJson(locator) === stableJson(expectedLocator),
    "External locator does not materialize the frozen alternatives",
  );
  return ledger;
}

async function readAlternativesDecision(root) {
  const { bytes, value } = await readExternalJson(
    root,
    alternativesDecisionFile,
    "Alternatives decision",
  );
  await validateSchema(
    value,
    "opportunity-decision.schema.json",
    "Alternatives decision",
  );
  invariant(
    value.result === deriveDecisionResult(value),
    "Alternatives decision result is not derived",
  );
  return { bytes, value };
}

async function validateNeed(root) {
  await validateOffline(root);
  const { bytes: alternativesBytes, value: alternatives } =
    await readAlternativesDecision(root);
  invariant(
    alternatives.result === "READY_FOR_NEED_RESEARCH",
    "Need research requires a ready frozen alternatives decision",
  );
  const { value: ledger } = await readExternalJson(
    root,
    needLedgerFile,
    "Need ledger",
  );
  await validateSchema(ledger, "opportunity-ledger.schema.json", "Need ledger");
  invariant(
    ledger.contract === "salt-ai-opportunity-need-input/1",
    "Need ledger has the wrong phase",
  );
  invariant(
    sha256(alternativesBytes) === ledger.alternatives_receipt_sha256,
    "Need ledger alternatives receipt digest mismatch",
  );
  validateDateWindow({
    approved: ledger.authority.approved_on,
    completed: ledger.interviews_completed_on,
    expires: ledger.authority.expires_on,
    retention: ledger.authority.retention_until,
    label: "Need interviews",
  });
  await verifyDigestFile(
    root,
    needAuthorizationFile,
    ledger.authority.authorization_sha256,
    "Need authorization",
  );
  await verifyDigestFile(
    root,
    needProtocolFile,
    ledger.authority.protocol_sha256,
    "Need protocol",
  );
  await verifyDigestFile(
    root,
    needConsentFile,
    ledger.authority.consent_sha256,
    "Need consent language",
  );
  sortedUnique(
    ledger.participants.map((participant) => participant.participant_id),
    "Participant IDs",
  );
  invariant(
    new Set(
      ledger.participants.map((participant) => participant.evidence_sha256),
    ).size === ledger.participants.length,
    "Need ledger repeats participant evidence",
  );
  invariant(
    ledger.outreach_attempt_count >= ledger.participants.length,
    "Outreach attempts cannot be fewer than participant records",
  );
  const shortlistIds = new Set(
    alternatives.shortlist.map((entry) => entry.alternative_id),
  );
  for (const participant of ledger.participants) {
    sortedUnique(participant.problem_categories, "Problem categories");
    invariant(
      participant.current_workflow_alternative_id === "other" ||
        shortlistIds.has(participant.current_workflow_alternative_id),
      "Participant current workflow is outside the frozen shortlist",
    );
    invariant(
      participant.recurring_problem
        ? participant.problem_categories.length > 0
        : participant.problem_categories.length === 0,
      "Participant problem categories disagree with recurring-problem status",
    );
    await verifyDigestFile(
      root,
      path.join(
        "interviews",
        `${participant.evidence_sha256.slice("sha256:".length)}.capture`,
      ),
      participant.evidence_sha256,
      "Participant evidence",
    );
  }
  const validCount = ledger.participants.filter(
    (participant) => participant.valid,
  ).length;
  invariant(
    validCount >= 4 || ledger.boundary_exhausted,
    "Insufficient cohort cannot be recorded before its boundary is exhausted",
  );
  return { alternatives, ledger };
}

export async function prepare({ phase, evidenceRoot }) {
  if (phase === "offline") {
    const root = await createFreshEvidenceRoot(evidenceRoot);
    const descriptor = offlineDescriptor();
    await validateSchema(
      descriptor,
      "opportunity-ledger.schema.json",
      "Offline opportunity descriptor",
    );
    await writeImmutableJson(path.join(root, offlineFile), descriptor);
    return { phase, root };
  }
  const root = await resolveExistingEvidenceRoot(evidenceRoot);
  if (phase === "alternatives") {
    await validateAlternatives(root);
    return { phase, root };
  }
  throw new Error("Unsupported opportunity preparation phase");
}

export async function validate({ phase, evidenceRoot }) {
  const root = await resolveExistingEvidenceRoot(evidenceRoot);
  if (phase === "offline") await validateOffline(root);
  else if (phase === "alternatives") await validateAlternatives(root);
  else if (phase === "need") await validateNeed(root);
  else throw new Error("Unsupported opportunity validation phase");
  return { phase, root };
}

export async function record({ phase, evidenceRoot, output, baselineOutput }) {
  const root = await resolveExistingEvidenceRoot(evidenceRoot);
  if (phase === "alternatives") {
    const ledger = await validateAlternatives(root);
    const decision = buildAlternativesDecision(ledger);
    await validateSchema(
      decision,
      "opportunity-decision.schema.json",
      "Alternatives decision",
    );
    invariant(
      decision.result === deriveDecisionResult(decision),
      "Alternatives decision result is not derived",
    );
    const decisionSha256 = sha256(stableJson(decision));
    const baseline = buildDevelopmentBaseline(ledger, decisionSha256);
    await validateSchema(
      baseline,
      "development-baseline.schema.json",
      "Development baseline",
    );
    const trackedDecision = assertTrackedOutput(
      output,
      "output",
      "03-alternatives.json",
    );
    const trackedBaseline = assertTrackedOutput(
      baselineOutput,
      "baseline-output",
      "03-development-baseline.json",
    );
    await writeImmutableJson(
      path.join(root, alternativesDecisionFile),
      decision,
    );
    await writeImmutableJson(
      path.join(root, developmentBaselineFile),
      baseline,
    );
    await writeImmutableJson(trackedDecision, decision);
    await writeImmutableJson(trackedBaseline, baseline);
    return { phase, result: decision.result };
  }
  if (phase === "need") {
    const { alternatives, ledger } = await validateNeed(root);
    const decision = buildNeedDecision(ledger, alternatives);
    await validateSchema(
      decision,
      "opportunity-decision.schema.json",
      "Need decision",
    );
    invariant(
      decision.result === deriveDecisionResult(decision),
      "Need decision result is not derived",
    );
    await writeImmutableJson(
      assertTrackedOutput(output, "output", "03.json"),
      decision,
    );
    return { phase, result: decision.result };
  }
  throw new Error("Unsupported opportunity recording phase");
}

export async function validateDecision({ receipt, expectDerived }) {
  invariant(
    typeof receipt === "string" && receipt.length > 0,
    "--receipt is required",
  );
  invariant(expectDerived, "--expect-derived is required");
  const value = await readJson(path.resolve(repositoryRoot, receipt));
  await validateSchema(
    value,
    "opportunity-decision.schema.json",
    "Opportunity decision",
  );
  invariant(
    value.result === deriveDecisionResult(value),
    "Opportunity decision result is not derived",
  );
  return value;
}

function assertAllowedArgs(args, allowed) {
  for (const key of args.keys())
    invariant(allowed.has(key), `Unknown option: ${key}`);
}

async function main() {
  const subcommand = process.argv[2];
  const args = parseArgs(process.argv.slice(3));
  if (subcommand === "prepare") {
    assertAllowedArgs(args, new Set(["--phase", "--evidence-root"]));
    const result = await prepare({
      phase: String(args.get("--phase") ?? ""),
      evidenceRoot: String(args.get("--evidence-root") ?? ""),
    });
    console.log(`Prepared Salt AI opportunity phase ${result.phase}.`);
    return;
  }
  if (subcommand === "validate") {
    assertAllowedArgs(args, new Set(["--phase", "--evidence-root"]));
    const result = await validate({
      phase: String(args.get("--phase") ?? ""),
      evidenceRoot: String(args.get("--evidence-root") ?? ""),
    });
    console.log(`Validated Salt AI opportunity phase ${result.phase}.`);
    return;
  }
  if (subcommand === "record") {
    assertAllowedArgs(
      args,
      new Set(["--phase", "--evidence-root", "--output", "--baseline-output"]),
    );
    const result = await record({
      phase: String(args.get("--phase") ?? ""),
      evidenceRoot: String(args.get("--evidence-root") ?? ""),
      output: args.get("--output"),
      baselineOutput: args.get("--baseline-output"),
    });
    console.log(
      `Recorded Salt AI opportunity phase ${result.phase}: ${result.result}.`,
    );
    return;
  }
  if (subcommand === "validate-decision") {
    assertAllowedArgs(args, new Set(["--receipt", "--expect-derived"]));
    const decision = await validateDecision({
      receipt: String(args.get("--receipt") ?? ""),
      expectDerived: args.get("--expect-derived") === true,
    });
    console.log(`Validated derived opportunity result ${decision.result}.`);
    return;
  }
  if (subcommand === "score")
    throw new Error("Opportunity scoring is not available before Unit 004/07");
  throw new Error("Unknown opportunity subcommand");
}

const isDirect =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(scriptPath);
if (isDirect) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}

export const opportunityFiles = Object.freeze({
  alternativesAuthorizationFile,
  alternativesDecisionFile,
  alternativesLedgerFile,
  developmentBaselineFile,
  externalLocatorFile,
  needAuthorizationFile,
  needConsentFile,
  needLedgerFile,
  needProtocolFile,
  offlineFile,
});

export { validateSchema };
