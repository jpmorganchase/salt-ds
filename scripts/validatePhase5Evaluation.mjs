import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { verifyPhase5TrustedEvaluatorIdentity } from "./phase5ArtifactHarness.mjs";
import {
  auditPhase5RuntimeIntelligence,
  computePhase5EvaluationReport,
  loadPhase5Preregistration,
  validatePhase5Preregistration,
  validatePhase5RunCaptures,
  verifyPhase5EvaluationCommit,
} from "./phase5EvaluationContract.mjs";
import { readPhase5ExternalFile } from "./phase5ExternalFile.mjs";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function parseArgs(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index];
    const value = argv[index + 1];
    if (!flag?.startsWith("--") || value === undefined) {
      throw new Error(
        `Invalid Phase 5 evaluation argument ${flag ?? "<missing>"}.`,
      );
    }
    values[flag.slice(2)] = value;
  }
  return values;
}

function readBoundJson(relativePath, label) {
  if (
    typeof relativePath !== "string" ||
    path.isAbsolute(relativePath) ||
    relativePath.includes("\\") ||
    relativePath
      .split("/")
      .some((segment) => !segment || segment === "." || segment === "..")
  ) {
    throw new Error(`${label} must be a safe repository-relative JSON path.`);
  }
  const target = path.resolve(repoRoot, ...relativePath.split("/"));
  const relative = path.relative(repoRoot, fs.realpathSync(target));
  if (
    relative === ".." ||
    relative.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relative)
  ) {
    throw new Error(`${label} escapes the repository root.`);
  }
  return JSON.parse(fs.readFileSync(target, "utf8"));
}

const args = parseArgs(process.argv.slice(2));
const preregistration = loadPhase5Preregistration(repoRoot);
const trustedKeyFingerprints = args["trusted-key-fingerprints"]
  ? JSON.parse(
      readPhase5ExternalFile(
        args["trusted-key-fingerprints"],
        "trusted key fingerprints",
        repoRoot,
      ).toString("utf8"),
    )
  : null;
const rawTrustedEvaluatorIdentity = args["trusted-evaluator-identity"]
  ? JSON.parse(
      readPhase5ExternalFile(
        args["trusted-evaluator-identity"],
        "trusted evaluator identity",
        repoRoot,
      ).toString("utf8"),
    )
  : null;
const validation = await validatePhase5Preregistration(preregistration, {
  repoRoot,
  trustedKeyFingerprints,
});
const intelligence = auditPhase5RuntimeIntelligence(preregistration, repoRoot);

if (Object.keys(args).length === 0) {
  process.stdout.write(
    `${JSON.stringify(
      {
        contract: "salt_phase5_local_validation_v1",
        status: "external_execution_blocked",
        validation,
        intelligence,
        external_blockers: preregistration.external_blockers,
      },
      null,
      2,
    )}\n`,
  );
} else {
  const required = [
    "captures",
    "packet-manifest",
    "sealed-mapping",
    "primary-submissions",
    "score-freeze",
    "trusted-key-fingerprints",
    "trusted-evaluator-identity",
    "published-tarball",
  ];
  for (const name of required) {
    if (!args[name]) throw new Error(`Phase 5 report input omits --${name}.`);
  }
  const captures = readBoundJson(args.captures, "captures");
  validatePhase5RunCaptures(preregistration, captures);
  const trustedEvaluatorIdentity = verifyPhase5TrustedEvaluatorIdentity(
    rawTrustedEvaluatorIdentity,
    {
      forbiddenRoots: [
        repoRoot,
        ...captures.flatMap((capture) => [
          capture.worktree_root,
          capture.worktree_receipt?.real_root_at_execution,
        ]),
      ],
    },
  );
  validatePhase5RunCaptures(preregistration, captures, {
    trustedEvaluatorIdentity,
  });
  verifyPhase5EvaluationCommit(preregistration, captures, repoRoot);
  const evaluation = {
    captures,
    packet_manifest: readBoundJson(args["packet-manifest"], "packet manifest"),
    sealed_mapping: readBoundJson(args["sealed-mapping"], "sealed mapping"),
    primary_submissions: readBoundJson(
      args["primary-submissions"],
      "primary submissions",
    ),
    adjudication_submission: args["adjudication-submission"]
      ? readBoundJson(
          args["adjudication-submission"],
          "adjudication submission",
        )
      : null,
    score_freeze: readBoundJson(args["score-freeze"], "score freeze"),
    host_trace: args["host-trace"]
      ? readBoundJson(args["host-trace"], "host trace")
      : null,
    published_package_attestation: args["published-attestation"]
      ? readBoundJson(args["published-attestation"], "published attestation")
      : null,
    signed_evidence: args["signed-evidence"]
      ? readBoundJson(args["signed-evidence"], "signed evidence")
      : null,
  };
  process.stdout.write(
    `${JSON.stringify(
      computePhase5EvaluationReport(preregistration, evaluation, {
        publishedPackageTarballBytes: readPhase5ExternalFile(
          args["published-tarball"],
          "published package tarball",
          repoRoot,
        ),
        repoRoot,
        trustedKeyFingerprints,
        trustedEvaluatorIdentity,
      }),
      null,
      2,
    )}\n`,
  );
}
