import { execFileSync } from "node:child_process";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import {
  assert,
  parseArgs,
  portablePath,
  readJson,
  repositoryRoot,
  sha256,
  stableJson,
  writeJsonAtomic,
} from "./saltAiEvidenceUtils.mjs";

const args = parseArgs(process.argv.slice(2));
const batch = String(args.get("--batch") ?? "");
assert(["06a", "06b", "06c"].includes(batch), "--batch must be 06a, 06b, or 06c");
for (const required of [
  "--baseline",
  "--predecessor-receipt",
  "--pack-report",
  "--output",
]) {
  assert(args.get(required), `${required} is required`);
}

function insideRepository(value, label, requiredPrefix = null) {
  const resolved = path.resolve(repositoryRoot, String(value));
  const relative = path.relative(repositoryRoot, resolved).replaceAll("\\", "/");
  assert(
    relative.length > 0 &&
      !relative.startsWith("../") &&
      relative !== ".." &&
      !path.isAbsolute(relative),
    `${label} escapes the repository`,
  );
  if (requiredPrefix) {
    assert(relative.startsWith(requiredPrefix), `${label} must stay in ${requiredPrefix}`);
  }
  return resolved;
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonicalize(value[key])]),
    );
  }
  return value;
}

function compactCanonicalJson(value) {
  return JSON.stringify(canonicalize(value));
}

async function regularBytes(file, label) {
  const value = await stat(file);
  assert(value.isFile() && !value.isSymbolicLink(), `${label} is not a regular file`);
  return readFile(file);
}

async function maybeRegularBytes(file) {
  try {
    return await regularBytes(file, portablePath(file));
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

function validateBaseline(baseline) {
  assert(
    baseline.contract === "salt-pattern-migration-baseline/1" &&
      baseline.schema_version === "1.0.0" &&
      /^[0-9a-f]{40}$/u.test(baseline.checkpoint_sha),
    "Migration baseline contract is invalid",
  );
  assert(
    baseline.patterns.length === 24 &&
      baseline.package_stories.length === 8 &&
      new Set(baseline.patterns.map((entry) => entry.id)).size === 24,
    "Migration baseline does not freeze exactly 24 patterns and eight package stories",
  );
  assert(
    sha256(
      stableJson({
        patterns: baseline.patterns,
        package_stories: baseline.package_stories,
      }),
    ) === baseline.inventory_sha256,
    "Migration baseline inventory digest is stale",
  );
  for (const collection of [
    baseline.patterns.map((entry) => entry.id),
    baseline.package_stories.map((entry) => entry.source_path),
  ]) {
    assert(
      JSON.stringify(collection) === JSON.stringify([...collection].sort()),
      "Migration baseline inventories must be path-sorted",
    );
  }
  assert(
    baseline.patterns.filter((entry) => entry.batch === "06b").length === 12 &&
      baseline.patterns.filter((entry) => entry.batch === "06c").length === 12,
    "Migration pattern batches must contain 12 entries each",
  );
  for (const unit of ["06a", "06b", "06c"]) {
    const entries = baseline.allowed_changes[unit];
    assert(
      Array.isArray(entries) &&
        JSON.stringify(entries) === JSON.stringify([...entries].sort()) &&
        new Set(entries).size === entries.length,
      `Allowed changes for ${unit} are not unique and path-sorted`,
    );
  }
}

function knowledgeIdentity(value) {
  return {
    semantic_source_digest: value.semantic_source_digest,
    compiler_digest: value.compiler_digest,
    semantic_digest: value.semantic_digest,
    bundle_digest: value.bundle_digest,
  };
}

function pageRecordKeyForPublicDestination(relative) {
  assert(
    relative.startsWith("site/docs/") && relative.endsWith(".mdx"),
    `Reviewed public destination is not a site MDX page: ${relative}`,
  );
  const routeSuffix = relative
    .slice("site/docs/".length)
    .replace(/\.mdx$/iu, "")
    .replace(/\/index$/iu, "");
  const normalizedRoute = `salt${routeSuffix ? `-${routeSuffix}` : ""}`
    .replace(/[^a-z0-9]+/giu, "-")
    .replace(/(^-|-$)/gu, "")
    .toLowerCase();
  return `record:page:page.${normalizedRoute}`;
}

async function validatePredecessor(file, expectedBatch, baseline) {
  const bytes = await regularBytes(file, "Predecessor receipt");
  const receipt = JSON.parse(bytes.toString("utf8"));
  if (expectedBatch === "06a") {
    assert(
      receipt.contract === "salt-ai-candidate-receipt/1" &&
        receipt.stage === "R1_PRE_AGENT" &&
        receipt.policy_profile === "pre-agent-support" &&
        receipt.publishable === false &&
        receipt.result === "pass",
      "06a predecessor is not the R1_PRE_AGENT cohort receipt",
    );
    assert(
      receipt.source_commit === baseline.checkpoint_sha,
      "06a predecessor does not bind the frozen Unit 05 checkpoint",
    );
  } else {
    const previous = expectedBatch === "06b" ? "06a" : "06b";
    assert(
      receipt.contract === "salt-pattern-migration-receipt/1" &&
        receipt.batch === previous &&
        receipt.result === "pass",
      `${expectedBatch} predecessor must be the ${previous} migration receipt`,
    );
  }
  assert(/^[0-9a-f]{40}$/u.test(receipt.source_commit), "Predecessor source commit is invalid");
  return { bytes, receipt };
}

function isIdentitySource(relative) {
  return (
    relative === "package.json" ||
    relative === "packages/knowledge/src/build/catalogSemanticInputPatterns.json" ||
    relative === "site/src/examples/patterns/manifest.json" ||
    relative.startsWith("site/docs/") ||
    relative.startsWith("site/src/examples/") ||
    /^packages\/[^/]+\/(?:stories|src)\//u.test(relative) ||
    /^packages\/[^/]+\/(?:package\.json|CHANGELOG\.md|README\.md)$/u.test(relative) ||
    relative === "tooling/ai/migration-records-v1.json" ||
    relative.startsWith("docs/ai/migrations/records/")
  );
}

function classifiedChanges(baseline) {
  const changed = execFileSync(
    "git",
    ["diff", "--name-only", "--diff-filter=ACDMRT", `${baseline.checkpoint_sha}..HEAD`],
    { cwd: repositoryRoot, encoding: "utf8", windowsHide: true },
  )
    .split(/\r?\n/u)
    .filter(Boolean)
    .map((entry) => entry.replaceAll("\\", "/"))
    .filter(isIdentitySource)
    .sort();
  const allowedUnits = batch === "06a" ? ["06a"] : batch === "06b" ? ["06a", "06b"] : ["06a", "06b", "06c"];
  const allowed = new Set(allowedUnits.flatMap((unit) => baseline.allowed_changes[unit]));
  if (batch === "06c") {
    allowed.add("packages/knowledge/src/build/buildRegistry.ts");
  }
  const unclassified = changed.filter((entry) => !allowed.has(entry));
  assert(
    unclassified.length === 0,
    `Unclassified migration identity changes: ${unclassified.join(", ")}`,
  );
  return changed;
}

async function exampleClosure(example) {
  const entries = [];
  for (const relative of example.files) {
    const absolute = path.join(repositoryRoot, "site", "src", "examples", ...relative.split("/"));
    entries.push({
      path: `site/src/examples/${relative}`,
      sha256: sha256(await regularBytes(absolute, `Example closure ${relative}`)),
    });
  }
  return sha256(Buffer.from(compactCanonicalJson(entries)));
}

const baselinePath = insideRepository(args.get("--baseline"), "Migration baseline");
const predecessorPath = insideRepository(
  args.get("--predecessor-receipt"),
  "Predecessor receipt",
  "dist/",
);
const packReportPath = insideRepository(args.get("--pack-report"), "Pack report", "dist/");
const outputPath = insideRepository(args.get("--output"), "Migration receipt output", "dist/");

const baselineBytes = await regularBytes(baselinePath, "Migration baseline");
const baseline = JSON.parse(baselineBytes.toString("utf8"));
validateBaseline(baseline);
const predecessor = await validatePredecessor(predecessorPath, batch, baseline);

const packReportBytes = await regularBytes(packReportPath, "Pack report");
const packReport = JSON.parse(packReportBytes.toString("utf8"));
assert(
  packReport.contract === "salt-ai-pack-report@1" &&
    packReport.schema_version === "1.0.0" &&
    packReport.policy_profile === "pre-agent-support" &&
    packReport.publishable === false &&
    packReport.packages.length === 2,
  "Migration verification requires an exact pre-agent-support pack report",
);
assert(
  packReport.packages.every((entry) =>
    ["@salt-ds/cli", "@salt-ds/knowledge"].includes(entry.name) &&
    entry.version === "0.0.0",
  ),
  "Migration pack report must contain private 0.0.0 Knowledge and CLI packages",
);

const manifestPath = path.join(repositoryRoot, "dist", "salt-ds-knowledge", "manifest.json");
const manifestBytes = await regularBytes(manifestPath, "Built Knowledge manifest");
const manifest = JSON.parse(manifestBytes.toString("utf8"));
const reported = packReport.knowledge_bundle;
assert(
  reported?.manifest?.sha256 === sha256(manifestBytes) &&
    reported.bundle_digest === manifest.bundle_digest &&
    reported.semantic_digest === manifest.semantic_digest &&
    reported.semantic_source_digest === manifest.semantic_source_digest &&
    reported.compiler_digest === manifest.compiler_digest,
  "Pack report does not bind the current built Knowledge manifest",
);
const beforeIdentity = knowledgeIdentity(baseline.knowledge_identity);
const afterIdentity = knowledgeIdentity(manifest);
if (batch === "06b") {
  assert(
    afterIdentity.compiler_digest ===
      predecessor.receipt.knowledge_identity.after.compiler_digest,
    "06b changed the reviewed compiler closure",
  );
}

const exampleManifestPath = path.join(
  repositoryRoot,
  "site",
  "src",
  "examples",
  "patterns",
  "manifest.json",
);
const exampleManifestBytes = await regularBytes(exampleManifestPath, "Authored example manifest");
const exampleManifest = JSON.parse(exampleManifestBytes.toString("utf8"));
assert(
  exampleManifest.contract === "salt-authored-example-manifest/1" &&
    exampleManifest.examples.length === 24,
  "Authored example manifest contract is invalid",
);

const patternRecordSet = await readJson(
  path.join(repositoryRoot, "dist", "salt-ds-knowledge", "records", "pattern.json"),
);
const pageRecordSet = await readJson(
  path.join(repositoryRoot, "dist", "salt-ds-knowledge", "records", "page.json"),
);
const sourceRecordSet = await readJson(
  path.join(repositoryRoot, "dist", "salt-ds-knowledge", "records", "source.json"),
);
const patternRecords = new Map(
  patternRecordSet.records.map((record) => [record.key, record]),
);
const pageRecords = new Map(pageRecordSet.records.map((record) => [record.key, record]));
const sourceRecords = new Map(
  sourceRecordSet.records.map((record) => [record.id, record]),
);
const receiptPatterns = [];
for (const frozen of baseline.patterns) {
  const record = patternRecords.get(frozen.record_key);
  assert(record, `Missing frozen pattern record ${frozen.record_key}`);
  assert(
    sha256(Buffer.from(compactCanonicalJson(record))) === frozen.record_sha256 &&
      record.data.detail_content_ref.id === frozen.content_sha256,
    `Canonical record/content identity changed for ${frozen.id}`,
  );
  const example = exampleManifest.examples.find(
    (entry) => entry.id === frozen.example_id,
  );
  assert(example, `Missing authored example ${frozen.example_id}`);
  assert(
    (await exampleClosure(example)) === frozen.example_closure_sha256,
    `Authored example closure changed for ${frozen.id}`,
  );
  const complete = batch === "06c" || (batch === "06b" && frozen.batch === "06b");
  if (!complete) {
    const storyBytes = await regularBytes(
      path.join(repositoryRoot, ...frozen.story_path.split("/")),
      `${frozen.id} story`,
    );
    assert(
      sha256(storyBytes) === frozen.story_sha256,
      `Non-batch story changed for ${frozen.id}`,
    );
  } else {
    const storySource = (
      await regularBytes(
        path.join(repositoryRoot, ...frozen.story_path.split("/")),
        `${frozen.id} maintainer facade`,
      )
    ).toString("utf8");
    assert(
      storySource.includes(`site/src/examples/patterns/${frozen.example_id}`),
      `${frozen.id} story is not a maintainer facade over its authored example`,
    );
  }
  receiptPatterns.push({
    id: frozen.id,
    batch: frozen.batch,
    record_key: frozen.record_key,
    record_sha256: frozen.record_sha256,
    content_sha256: frozen.content_sha256,
    example_id: frozen.example_id,
    example_closure_sha256: frozen.example_closure_sha256,
    status: complete ? "complete" : "tracked",
  });
}

const receiptPackageStories = [];
for (const frozen of baseline.package_stories) {
  const complete = batch === "06c" || (batch === "06b" && frozen.batch === "06b");
  const sourcePath = path.join(repositoryRoot, ...frozen.source_path.split("/"));
  let destinationSha256 = null;
  let retirementReason = null;
  let maintainerFacade = null;
  if (!complete) {
    const sourceBytes = await regularBytes(sourcePath, frozen.source_path);
    assert(sha256(sourceBytes) === frozen.source_sha256, `${frozen.source_path} changed before its assigned batch`);
  } else if (frozen.disposition === "retire") {
    assert((await maybeRegularBytes(sourcePath)) === null, `${frozen.source_path} must be removed when retired`);
    retirementReason = "The source only redirected readers to the canonical Salt website and retained no unique supported guidance.";
  } else {
    const destinationPath = path.join(repositoryRoot, ...frozen.destination.split("/"));
    destinationSha256 = sha256(await regularBytes(destinationPath, frozen.destination));
    const retained = await maybeRegularBytes(sourcePath);
    if (retained) {
      const source = retained.toString("utf8");
      assert(
        !source.includes("@storybook/addon-docs") && source.includes(frozen.destination),
        `${frozen.source_path} is not a small maintainer-only facade`,
      );
      maintainerFacade = frozen.source_path;
    }
  }
  receiptPackageStories.push({
    source_path: frozen.source_path,
    batch: frozen.batch,
    disposition: frozen.disposition,
    owner: frozen.owner,
    destination: frozen.destination,
    source_sha256: frozen.source_sha256,
    destination_sha256: destinationSha256,
    retirement_reason: retirementReason,
    maintainer_facade: maintainerFacade,
    status: complete ? "complete" : "planned",
  });
}

const reviewedPublicDestinations = receiptPackageStories
  .filter(
    (entry) =>
      entry.status === "complete" && entry.destination?.startsWith("site/docs/"),
  )
  .map((entry) => {
    const destination = entry.destination;
    const pageRecordKey = pageRecordKeyForPublicDestination(destination);
    const pageRecord = pageRecords.get(pageRecordKey);
    assert(pageRecord, `Missing reviewed public page record ${pageRecordKey}`);
    const sourceRecord = sourceRecords.get(pageRecord.data.source_ref.id);
    assert(
      sourceRecord?.data.locator === destination,
      `${pageRecordKey} does not bind reviewed destination ${destination}`,
    );
    return {
      path: destination,
      page_record_key: pageRecordKey,
      page_record_sha256: sha256(Buffer.from(compactCanonicalJson(pageRecord))),
      source_record_key: sourceRecord.key,
      source_record_sha256: sha256(Buffer.from(compactCanonicalJson(sourceRecord))),
    };
  });

const semanticChanged =
  beforeIdentity.semantic_digest !== afterIdentity.semantic_digest;
if (batch === "06a") {
  assert(!semanticChanged, "06a changed the baseline semantic digest");
} else {
  assert(
    semanticChanged && reviewedPublicDestinations.length > 0,
    `${batch} must bind its semantic change to canonical public destinations`,
  );
}

let compilerClosureChange = null;
if (batch === "06c") {
  const configurationPath =
    "packages/knowledge/src/build/catalogSemanticInputPatterns.json";
  const configurationBytes = await regularBytes(
    path.join(repositoryRoot, ...configurationPath.split("/")),
    "Knowledge semantic input configuration",
  );
  const semanticPatterns = JSON.parse(configurationBytes.toString("utf8"));
  const predecessorPatterns = JSON.parse(
    execFileSync(
      "git",
      ["show", `${predecessor.receipt.source_commit}:${configurationPath}`],
      {
        cwd: repositoryRoot,
        encoding: "utf8",
        windowsHide: true,
      },
    ),
  );
  const retiredStoryPatterns = predecessorPatterns.filter((entry) =>
    entry.includes("/stories/"),
  );
  assert(
    retiredStoryPatterns.length === 13 &&
      JSON.stringify(semanticPatterns) ===
        JSON.stringify(
          predecessorPatterns.filter((entry) => !entry.includes("/stories/")),
        ),
    "06c must remove exactly the 13 reviewed story input patterns",
  );
  assert(
    afterIdentity.compiler_digest !==
      predecessor.receipt.knowledge_identity.after.compiler_digest,
    "06c story-input retirement did not change the compiler closure identity",
  );
  compilerClosureChange = {
    policy: "storybook-semantic-input-retirement/1",
    configuration_path: configurationPath,
    configuration_sha256: sha256(configurationBytes),
    predecessor_compiler_digest:
      predecessor.receipt.knowledge_identity.after.compiler_digest,
    current_compiler_digest: afterIdentity.compiler_digest,
    reviewed_source_paths: [
      "packages/knowledge/src/build/buildRegistry.ts",
    ],
    retired_story_patterns: retiredStoryPatterns,
    remaining_story_pattern_count: semanticPatterns.filter((entry) =>
      entry.includes("/stories/"),
    ).length,
  };
}

const identityChanges = classifiedChanges(baseline);
const gitStatus = execFileSync(
  "git",
  ["status", "--porcelain=v1", "--untracked-files=all"],
  { cwd: repositoryRoot, encoding: "utf8", windowsHide: true },
);
assert(gitStatus.trim() === "", "Migration sealing requires a clean source commit");
const sourceCommit = execFileSync("git", ["rev-parse", "HEAD"], {
  cwd: repositoryRoot,
  encoding: "utf8",
  windowsHide: true,
}).trim();
assert(/^[0-9a-f]{40}$/u.test(sourceCommit), "Migration source commit is invalid");

const receipt = {
  $schema:
    "https://www.saltdesignsystem.com/ai/schemas/salt-pattern-migration-receipt-1.json",
  schema_version: "1.0.0",
  contract: "salt-pattern-migration-receipt/1",
  batch,
  source_commit: sourceCommit,
  source_clean: true,
  baseline: {
    path: portablePath(baselinePath),
    sha256: sha256(baselineBytes),
    contract: baseline.contract,
    checkpoint_sha: baseline.checkpoint_sha,
    inventory_sha256: baseline.inventory_sha256,
  },
  predecessor: {
    path: portablePath(predecessorPath),
    sha256: sha256(predecessor.bytes),
    contract: predecessor.receipt.contract,
    source_commit: predecessor.receipt.source_commit,
  },
  pack_report: {
    path: portablePath(packReportPath),
    sha256: sha256(packReportBytes),
    contract: packReport.contract,
    policy_profile: packReport.policy_profile,
  },
  knowledge_identity: {
    before: beforeIdentity,
    after: afterIdentity,
    delta: {
      semantic_source_changed:
        beforeIdentity.semantic_source_digest !== afterIdentity.semantic_source_digest,
      compiler_changed: beforeIdentity.compiler_digest !== afterIdentity.compiler_digest,
      semantic_changed: beforeIdentity.semantic_digest !== afterIdentity.semantic_digest,
      bundle_changed: beforeIdentity.bundle_digest !== afterIdentity.bundle_digest,
    },
  },
  ...(batch === "06a"
    ? {}
    : {
        semantic_change_review: {
          policy: "canonical-public-destination-expansion/1",
          allowed: true,
          reason:
            "Executed package-story dispositions add or expand canonical public MDX pages that are selected Knowledge page records; 06c also retires the reviewed Storybook semantic input patterns. All frozen pattern records and authored example closures remain unchanged.",
          stable_pattern_count: receiptPatterns.length,
          public_destinations: reviewedPublicDestinations,
          ...(compilerClosureChange
            ? { compiler_closure_change: compilerClosureChange }
            : {}),
        },
      }),
  package_version_intent: [
    {
      name: "@salt-ds/cli",
      current_version: "0.0.0",
      intent: "initial-release-pending",
      changeset: false,
    },
    {
      name: "@salt-ds/knowledge",
      current_version: "0.0.0",
      intent: "initial-release-pending",
      changeset: false,
    },
  ],
  inventory: {
    pattern_count: receiptPatterns.length,
    package_story_count: receiptPackageStories.length,
    example_manifest_sha256: sha256(exampleManifestBytes),
    patterns: receiptPatterns,
    package_stories: receiptPackageStories,
  },
  classified_changes: identityChanges,
  unclassified_identity_changes: [],
  result: "pass",
};

const schema = await readJson(
  path.join(
    repositoryRoot,
    "scripts",
    "schemas",
    "saltPatternMigrationReceiptV1.schema.json",
  ),
);
const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
const validate = ajv.compile(schema);
assert(
  validate(receipt),
  `Migration receipt schema failure: ${ajv.errorsText(validate.errors, {
    separator: "; ",
  })}`,
);
await writeJsonAtomic(outputPath, receipt);
console.log(
  `Salt pattern migration ${batch} sealed (${receiptPatterns.filter((entry) => entry.status === "complete").length}/24 patterns, ${receiptPackageStories.filter((entry) => entry.status === "complete").length}/8 package stories).`,
);
