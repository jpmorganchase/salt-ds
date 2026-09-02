import { access } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const REPO_ROOT = path.resolve(import.meta.dirname, "../../..");
const KNOWLEDGE_ENTRY = path.join(
  REPO_ROOT,
  "dist/salt-ds-knowledge/dist-es/public.js",
);
const KNOWLEDGE_BUNDLE = path.join(REPO_ROOT, "dist/salt-ds-knowledge");
const EXPECTED_RULE_IDS = [
  "salt.component.action_navigation_target",
  "salt.catalog.non_stable_import",
  "salt.deprecation.used_import",
  "salt.deprecation.static_prop",
  "salt.token.deprecated_identity",
];

export class RulesHarnessError extends Error {}
export class RulesIntegrityError extends Error {}

function failHarness(message) {
  throw new RulesHarnessError(message);
}

function sameJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function currentPackageVersions(store, names) {
  return Object.fromEntries(
    names.map((name) => {
      const record = store
        .getFamily("package")
        .find((candidate) => candidate.name === name);
      if (!record) failHarness(`missing characterized package ${name}`);
      return [name, record.version];
    }),
  );
}

function analyzeArtifact(api, context, characterization, artifact, versions) {
  const result = api.analyzeSaltCode(context, {
    artifacts: [artifact],
    package_versions: {
      ...currentPackageVersions(context.store, characterization.package_names),
      ...versions,
    },
  }).results[0];
  if (!result) failHarness(`missing analysis for ${artifact.id}`);
  return result;
}

function targetUtf8Range(artifact) {
  const characterOffset = artifact.text.indexOf(artifact.target);
  if (characterOffset < 0) {
    failHarness(`missing target in ${artifact.id}`);
  }
  const startOffset = Buffer.byteLength(
    artifact.text.slice(0, characterOffset),
    "utf8",
  );
  return {
    start_offset: startOffset,
    end_offset: startOffset + Buffer.byteLength(artifact.target, "utf8"),
  };
}

function rendererIsSafe(api) {
  const hostile =
    "# injected heading\n```markdown\nCitation: [fake](https://invalid.example)\n\u0000\u007f";
  const rendered = api.renderKnowledgeDocumentMarkdown({
    contract: "salt-knowledge-document/1",
    status: "resolved",
    identifier: hostile,
    bundle: {
      version: hostile,
      digest: hostile,
      semantic_digest: hostile,
    },
    choices: [],
    excluded_package_families: [],
    document: {
      reference: { family: "component", id: hostile },
      title: hostile,
      summary: hostile,
      record: { hostile },
      content: {
        reference: { family: "content", id: hostile, codec: hostile },
        value: { hostile },
      },
      citation: {
        record_key: hostile,
        source_records: [hostile],
        bundle_digest: hostile,
      },
    },
  });
  return (
    rendered.startsWith("# `# injected heading\\n") &&
    !rendered.includes("```markdown") &&
    !rendered.includes("\u0000") &&
    !rendered.includes("\u007f") &&
    rendered.includes("\\u0000") &&
    rendered.includes("\\u007f")
  );
}

export function deriveRulesDecision(observation) {
  if (!observation || typeof observation !== "object") {
    failHarness("observation must be an object");
  }
  if (!Array.isArray(observation.harness_failures)) {
    failHarness("harness_failures must be an array");
  }
  if (observation.harness_failures.length > 0) {
    failHarness(observation.harness_failures.join("; "));
  }
  if (observation.renderer_safe !== true) {
    failHarness("untrusted Markdown renderer safety check failed");
  }
  if (observation.rule_ids_equal !== true) {
    throw new RulesIntegrityError("review rule IDs are not a closed exact set");
  }
  if (
    !Number.isSafeInteger(observation.trustworthy_product_miss_count) ||
    observation.trustworthy_product_miss_count < 0
  ) {
    failHarness("trustworthy_product_miss_count is invalid");
  }
  if (observation.trustworthy_product_miss_count > 0) return "CUT_DOCTOR";
  if (
    observation.enabled_rule_count !== EXPECTED_RULE_IDS.length ||
    !Array.isArray(observation.actionable_repair_families)
  ) {
    return "CUT_DOCTOR";
  }
  return new Set(observation.actionable_repair_families).size >= 2
    ? "PASS_RULES"
    : "CUT_DOCTOR";
}

export async function collectRulesObservation() {
  const api = await import(pathToFileURL(KNOWLEDGE_ENTRY).href);
  let context;
  try {
    context = await api.loadKnowledgeRuntimeContext({
      bundleDir: KNOWLEDGE_BUNDLE,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new RulesIntegrityError(
      `Knowledge integrity check failed: ${message}`,
    );
  }
  const { store } = context;
  const descriptors = api.REVIEW_RULE_DESCRIPTORS.map((rule) => rule.rule_id);
  const characterizations = api.REVIEW_RULE_CHARACTERIZATION;
  const characterizationIds = characterizations.map((rule) => rule.rule_id);
  const ruleIdsEqual =
    sameJson(api.REVIEW_RULE_IDS, EXPECTED_RULE_IDS) &&
    sameJson(descriptors, EXPECTED_RULE_IDS) &&
    sameJson(characterizationIds, EXPECTED_RULE_IDS);
  const harnessFailures = [];
  const productMisses = [];
  const actionableRepairFamilies = [];

  for (const characterization of characterizations) {
    if (characterization.disposition !== "enabled") continue;
    const first = analyzeArtifact(
      api,
      context,
      characterization,
      characterization.positive,
    );
    const second = analyzeArtifact(
      api,
      context,
      characterization,
      characterization.positive,
    );
    if (api.canonicalJson(first) !== api.canonicalJson(second)) {
      harnessFailures.push(
        `${characterization.rule_id}: nondeterministic output`,
      );
    }
    if (first.coverage.parser !== characterization.expected_parser) {
      harnessFailures.push(
        `${characterization.rule_id}: unexpected parser coverage`,
      );
    }
    if (!sameJson(first.coverage.evaluated_rule_ids, EXPECTED_RULE_IDS)) {
      harnessFailures.push(
        `${characterization.rule_id}: incomplete rule coverage`,
      );
    }
    if (first.limitations.length > 0 || first.coverage.truncated) {
      harnessFailures.push(
        `${characterization.rule_id}: incomplete positive evaluation`,
      );
    }
    const findings = first.findings.filter(
      (finding) => finding.rule_id === characterization.rule_id,
    );
    if (findings.length === 0) {
      productMisses.push(characterization.rule_id);
      continue;
    }
    if (findings.length !== 1) {
      harnessFailures.push(`${characterization.rule_id}: duplicate findings`);
      continue;
    }
    const finding = findings[0];
    const expectedLocation = targetUtf8Range(characterization.positive);
    if (
      finding.severity !== characterization.expected_severity ||
      finding.location.start_offset !== expectedLocation.start_offset ||
      finding.location.end_offset !== expectedLocation.end_offset ||
      finding.evidence.validation !== "source_bound" ||
      finding.evidence.references.length === 0 ||
      finding.remediation === null ||
      finding.official_decision?.disposition !== "evaluated" ||
      finding.official_decision?.outcome !== "finding"
    ) {
      harnessFailures.push(
        `${characterization.rule_id}: invalid positive finding`,
      );
    }

    const correct = analyzeArtifact(
      api,
      context,
      characterization,
      characterization.correct,
    );
    if (
      correct.findings.some(
        (candidate) => candidate.rule_id === characterization.rule_id,
      )
    ) {
      harnessFailures.push(`${characterization.rule_id}: correct case flagged`);
    }

    const unsupported = analyzeArtifact(
      api,
      context,
      characterization,
      characterization.unsupported,
      characterization.unsupported.package_versions,
    );
    if (
      unsupported.findings.some(
        (candidate) => candidate.rule_id === characterization.rule_id,
      )
    ) {
      harnessFailures.push(
        `${characterization.rule_id}: unsupported case flagged`,
      );
    }
    if (
      characterization.unsupported.expectation === "skipped_unknown" &&
      !unsupported.version_decisions.some(
        (decision) =>
          decision.rule_id === characterization.rule_id &&
          decision.disposition === "skipped_unknown" &&
          decision.evidence.validation === "source_bound",
      )
    ) {
      harnessFailures.push(
        `${characterization.rule_id}: missing skipped-unknown decision`,
      );
    }

    if (characterization.repair_family && characterization.golden_repair) {
      const repair = analyzeArtifact(
        api,
        context,
        characterization,
        characterization.golden_repair,
      );
      if (
        repair.findings.length > 0 ||
        repair.limitations.length > 0 ||
        !sameJson(repair.coverage.evaluated_rule_ids, EXPECTED_RULE_IDS)
      ) {
        harnessFailures.push(
          `${characterization.rule_id}: golden repair is not clean`,
        );
      } else {
        actionableRepairFamilies.push(characterization.repair_family);
      }
    }
  }

  return {
    renderer_safe: rendererIsSafe(api),
    rule_ids_equal: ruleIdsEqual,
    enabled_rule_count: characterizations.filter(
      (entry) => entry.disposition === "enabled",
    ).length,
    trustworthy_product_miss_count: productMisses.length,
    actionable_repair_families: actionableRepairFamilies,
    harness_failures: harnessFailures,
  };
}

export async function runCli(args, io = process) {
  if (!sameJson(args, ["--mode", "decide-rules"])) {
    io.stderr.write(
      "Usage: node ./evals/salt-ai/doctor/run.mjs --mode decide-rules\n",
    );
    return 2;
  }
  try {
    await access(KNOWLEDGE_ENTRY);
    await access(path.join(KNOWLEDGE_BUNDLE, "manifest.json"));
  } catch {
    io.stderr.write(
      "Missing required built Knowledge; run the Unit 005/00 Knowledge build first.\n",
    );
    return 2;
  }
  try {
    const observation = await collectRulesObservation();
    const result = deriveRulesDecision(observation);
    io.stdout.write(
      `${JSON.stringify({ contract: "salt-ai-plan-005-decision/1", unit: "005/00", result })}\n`,
    );
    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    io.stderr.write(`salt-ai doctor rules harness failure: ${message}\n`);
    return error instanceof RulesIntegrityError ? 3 : 4;
  }
}

if (
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url
) {
  process.exitCode = await runCli(process.argv.slice(2));
}
