import { execFileSync } from "node:child_process";
import { readFile, lstat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import {
  assert,
  gitHeadCommit,
  parseArgs,
  portablePath,
  readJson,
  repositoryRoot,
  sha256,
  stableJson,
  writeJsonAtomic,
} from "./saltAiEvidenceUtils.mjs";

const args = parseArgs(process.argv.slice(2));
const stage = String(args.get("--stage") ?? "");
assert(
  stage !== "R1_PRE_AGENT",
  "R1_PRE_AGENT candidate sealing was retired after agent-support activation",
);
assert(
  false,
  "Candidate sealing is unavailable until the Unit 08 release-complete inputs exist",
);
assert(args.get("--pack-report"), "--pack-report is required");
assert(args.get("--output"), "--output is required");

function resolveInside(root, relative, label) {
  assert(
    typeof relative === "string" &&
      relative.length > 0 &&
      !path.isAbsolute(relative) &&
      !relative.includes("\\") &&
      !relative.split("/").includes(".."),
    label + " must be a portable contained path",
  );
  const resolved = path.resolve(root, ...relative.split("/"));
  const containment = path.relative(root, resolved);
  assert(
    containment.length > 0 &&
      !containment.startsWith("..") &&
      !path.isAbsolute(containment),
    label + " escapes its authority",
  );
  return resolved;
}

async function readRegularFile(file, label) {
  const stats = await lstat(file);
  assert(stats.isFile() && !stats.isSymbolicLink(), label + " is not a regular file");
  return readFile(file);
}

function assertRepositoryPath(file, label, requiredRoot = repositoryRoot) {
  const relative = path.relative(requiredRoot, file);
  assert(
    relative.length > 0 &&
      !relative.startsWith("..") &&
      !path.isAbsolute(relative),
    label + " must stay inside " + portablePath(requiredRoot),
  );
}

const packReportPath = path.resolve(
  repositoryRoot,
  String(args.get("--pack-report")),
);
const outputPath = path.resolve(repositoryRoot, String(args.get("--output")));
assertRepositoryPath(packReportPath, "Pack report");
assertRepositoryPath(
  outputPath,
  "Candidate receipt output",
  path.join(repositoryRoot, "dist"),
);
const packReportBytes = await readRegularFile(packReportPath, "Pack report");
const packReport = JSON.parse(packReportBytes.toString("utf8"));
assert(
  packReport.contract === "salt-ai-pack-report@1" &&
    packReport.schema_version === "1.0.0" &&
    packReport.policy_profile === "pre-agent-support" &&
    packReport.publishable === false,
  "Pack report is not a nonpublishable pre-agent-support report",
);
assert(
  Array.isArray(packReport.packages) &&
    packReport.packages.length === 2 &&
    packReport.packages.map((entry) => entry.name).sort().join("\0") ===
      ["@salt-ds/cli", "@salt-ds/knowledge"].join("\0"),
  "Pack report must contain exactly Knowledge and CLI",
);

const packageReceipts = [];
for (const entry of [...packReport.packages].sort((left, right) =>
  left.name.localeCompare(right.name),
)) {
  assert(entry.version === "0.0.0", entry.name + " must reuse version 0.0.0");
  const tarballPath = resolveInside(
    path.dirname(packReportPath),
    entry.tarball?.path,
    entry.name + " tarball",
  );
  const tarballBytes = await readRegularFile(tarballPath, entry.name + " tarball");
  assert(
    entry.tarball.bytes === tarballBytes.byteLength &&
      entry.tarball.sha256 === sha256(tarballBytes),
    entry.name + " tarball identity does not match the pack report",
  );
  packageReceipts.push({
    name: entry.name,
    version: entry.version,
    tarball: {
      path: portablePath(tarballPath),
      sha256: entry.tarball.sha256,
      bytes: entry.tarball.bytes,
    },
  });
}

const distKnowledgeDir = path.join(repositoryRoot, "dist", "salt-ds-knowledge");
const distManifestPath = path.join(distKnowledgeDir, "manifest.json");
const distManifestBytes = await readRegularFile(
  distManifestPath,
  "Built Knowledge manifest",
);
const distManifest = JSON.parse(distManifestBytes.toString("utf8"));
const bundle = packReport.knowledge_bundle;
assert(
  bundle &&
    bundle.manifest?.sha256 === sha256(distManifestBytes) &&
    bundle.bundle_digest === distManifest.bundle_digest &&
    bundle.semantic_digest === distManifest.semantic_digest &&
    bundle.semantic_source_digest === distManifest.semantic_source_digest &&
    bundle.compiler_digest === distManifest.compiler_digest,
  "Built Knowledge manifest does not match the exact pack report",
);

const smokeReceiptPath = path.join(
  path.dirname(packReportPath),
  "consumer-smoke-receipt.json",
);
const smokeReceiptBytes = await readRegularFile(
  smokeReceiptPath,
  "Consumer smoke receipt",
);
const smokeReceipt = JSON.parse(smokeReceiptBytes.toString("utf8"));
assert(
  smokeReceipt.contract === "salt-ai-consumer-smoke/1" &&
    smokeReceipt.schema_version === "1.0.0" &&
    smokeReceipt.adapter === "@salt-ds/cli" &&
    smokeReceipt.result === "pass" &&
    smokeReceipt.pack_report?.sha256 === sha256(packReportBytes) &&
    smokeReceipt.pack_report.path === path.basename(packReportPath),
  "Consumer smoke receipt is stale or invalid",
);

const runtime = await import(
  pathToFileURL(path.join(distKnowledgeDir, "dist-es", "public.js")).href
);
const store = new runtime.KnowledgeStore({ bundleDir: distKnowledgeDir });
assert(
  store.manifest.bundle_digest === bundle.bundle_digest,
  "Loaded Knowledge runtime selected a different bundle",
);
const corpusPaths = [
  "evals/salt-ai/retrieval/api-migrations.json",
  "evals/salt-ai/retrieval/navigation-overlay.json",
];
const corpora = [];
const retrievalResults = [];
for (const relative of corpusPaths) {
  const absolute = path.join(repositoryRoot, ...relative.split("/"));
  const bytes = await readRegularFile(absolute, "Retrieval corpus " + relative);
  const corpus = JSON.parse(bytes.toString("utf8"));
  assert(
    Array.isArray(corpus.gold_queries) &&
      Array.isArray(corpus.package_vector),
    "Retrieval corpus is invalid: " + relative,
  );
  const installedVersions = Object.fromEntries(
    corpus.package_vector.map((entry) => [entry.name, entry.version]),
  );
  corpora.push({
    path: relative,
    sha256: sha256(bytes),
    queries: corpus.gold_queries.length,
  });
  for (const query of corpus.gold_queries) {
    const result = runtime.searchSaltRecords(store, {
      query: query.query,
      installed_versions: installedVersions,
      limit: 5,
    });
    const matches = result.matches.map(
      (match) =>
        "record:" + match.reference.family + ":" + match.reference.id,
    );
    retrievalResults.push({
      id: query.id,
      category: query.category,
      query: query.query,
      gold: query.gold,
      matches,
      hit: query.gold.some((gold) => matches.includes(gold)),
    });
  }
}
assert(retrievalResults.length >= 40, "Retrieval corpus has fewer than 40 queries");
const microRecall =
  retrievalResults.filter((entry) => entry.hit).length / retrievalResults.length;
const categories = [
  ...new Set(retrievalResults.map((entry) => entry.category)),
].sort();
const categoryMacroRecall =
  categories
    .map((category) => {
      const members = retrievalResults.filter(
        (entry) => entry.category === category,
      );
      return members.filter((entry) => entry.hit).length / members.length;
    })
    .reduce((sum, value) => sum + value, 0) / categories.length;
assert(microRecall >= 0.95, "Retrieval micro recall@5 is below 95%");
assert(
  categoryMacroRecall >= 0.95,
  "Retrieval category-macro recall@5 is below 95%",
);

const gitStatus = execFileSync(
  "git",
  ["status", "--porcelain=v1", "--untracked-files=all"],
  { cwd: repositoryRoot, encoding: "utf8", windowsHide: true },
);
assert(gitStatus.trim() === "", "Candidate sealing requires a clean source commit");
const sourceCommit = await gitHeadCommit();
assert(/^[0-9a-f]{40}$/u.test(sourceCommit), "Source commit is not exact");

const receipt = {
  $schema:
    "https://www.saltdesignsystem.com/ai/schemas/salt-ai-candidate-receipt-1.json",
  schema_version: "1.0.0",
  contract: "salt-ai-candidate-receipt/1",
  stage,
  source_commit: sourceCommit,
  source_clean: true,
  publishable: false,
  policy_profile: "pre-agent-support",
  pack_report: {
    path: portablePath(packReportPath),
    sha256: sha256(packReportBytes),
    contract: packReport.contract,
    policy_digest: packReport.policy_digest,
  },
  packages: packageReceipts,
  knowledge_bundle: {
    manifest_sha256: bundle.manifest.sha256,
    bundle_digest: bundle.bundle_digest,
    semantic_digest: bundle.semantic_digest,
    semantic_source_digest: bundle.semantic_source_digest,
    compiler_digest: bundle.compiler_digest,
  },
  verification_outputs: {
    retrieval: {
      scoring_version: runtime.KNOWLEDGE_SEARCH_SCORING_VERSION,
      query_count: retrievalResults.length,
      micro_recall_at_5: microRecall,
      category_macro_recall_at_5: categoryMacroRecall,
      corpora,
      result_sha256: sha256(stableJson(retrievalResults)),
    },
    consumer_smoke: {
      path: portablePath(smokeReceiptPath),
      sha256: sha256(smokeReceiptBytes),
      contract: smokeReceipt.contract,
      result: smokeReceipt.result,
    },
  },
  external_mutations: [],
  result: "pass",
};

const schema = await readJson(
  path.join(
    repositoryRoot,
    "scripts",
    "schemas",
    "saltAiCandidateReceiptV1.schema.json",
  ),
);
const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
const validate = ajv.compile(schema);
assert(
  validate(receipt),
  "Candidate receipt schema failure: " +
    ajv.errorsText(validate.errors, { separator: "; " }),
);
await writeJsonAtomic(outputPath, receipt);
console.log(
  "Salt AI R1_PRE_AGENT candidate sealed (" +
    retrievalResults.length +
    " retrieval queries, micro=" +
    microRecall.toFixed(3) +
    ", category-macro=" +
    categoryMacroRecall.toFixed(3) +
    ").",
);
