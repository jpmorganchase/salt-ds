import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { canonicalJson } from "../manifest/canonicalJson.js";
import {
  createKnowledgeStore,
  type KnowledgeStore,
} from "../manifest/knowledgeStore.js";
import {
  createReviewCatalogFromStore,
  type ReviewCatalog,
} from "./reviewCatalogAdapter.js";
import {
  REVIEW_RULE_CHARACTERIZATION,
  REVIEW_RULE_DESCRIPTORS,
  type ReviewCharacterizationArtifact,
  type ReviewRuleCharacterization,
} from "./reviewRuleCharacterization.js";
import { REVIEW_RULE_IDS } from "./reviewRuleRegistry.js";
import {
  analyzeSaltCode,
  type CompleteReviewArtifactAnalysis,
} from "./reviewSaltCode.js";

const REPO_ROOT = path.resolve(import.meta.dirname, "../../../..");
const EXPECTED_RULE_IDS = [
  "salt.component.action_navigation_target",
  "salt.catalog.non_stable_import",
  "salt.deprecation.used_import",
  "salt.deprecation.static_prop",
  "salt.token.deprecated_identity",
] as const;

let store: KnowledgeStore;
let reviewCatalog: ReviewCatalog;

beforeAll(() => {
  store = createKnowledgeStore({
    bundleDir: path.join(REPO_ROOT, "packages/knowledge/generated"),
  });
  store.ensureKnowledgeVerified();
  reviewCatalog = createReviewCatalogFromStore(store);
});

function currentPackageVersions(
  names: readonly string[],
): Record<string, string> {
  return Object.fromEntries(
    names.map((name) => {
      const record = store
        .getFamily("package")
        .find((candidate) => candidate.name === name);
      if (!record) throw new Error(`Missing characterized package ${name}.`);
      return [name, record.version];
    }),
  );
}

function analyzeArtifact(
  characterization: ReviewRuleCharacterization,
  artifact: ReviewCharacterizationArtifact,
  packageVersions: Readonly<Record<string, string>> = currentPackageVersions(
    characterization.package_names,
  ),
): CompleteReviewArtifactAnalysis {
  const analysis = analyzeSaltCode(
    { reviewCatalog, store },
    {
      artifacts: [artifact],
      package_versions: { ...packageVersions },
    },
  );
  const result = analysis.results[0];
  if (!result) throw new Error(`Missing analysis for ${artifact.id}.`);
  return result;
}

function targetUtf8Range(artifact: ReviewCharacterizationArtifact): {
  start_offset: number;
  end_offset: number;
} {
  const characterOffset = artifact.text.indexOf(artifact.target);
  if (characterOffset < 0) {
    throw new Error(
      `Characterization target ${artifact.target} is absent from ${artifact.id}.`,
    );
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

describe("review rule registry characterizations", () => {
  it("keeps the runtime, descriptors, and characterizations on one closed five-rule set", () => {
    expect(REVIEW_RULE_IDS).toEqual(EXPECTED_RULE_IDS);
    expect(REVIEW_RULE_DESCRIPTORS.map((rule) => rule.rule_id)).toEqual(
      EXPECTED_RULE_IDS,
    );
    expect(REVIEW_RULE_CHARACTERIZATION.map((rule) => rule.rule_id)).toEqual(
      EXPECTED_RULE_IDS,
    );
    expect(
      REVIEW_RULE_CHARACTERIZATION.every(
        (rule) => rule.disposition === "enabled",
      ),
    ).toBe(true);
  });

  it.each(REVIEW_RULE_CHARACTERIZATION)(
    "proves $rule_id against exact current Knowledge",
    (characterization) => {
      const first = analyzeArtifact(
        characterization,
        characterization.positive,
      );
      const second = analyzeArtifact(
        characterization,
        characterization.positive,
      );
      const findings = first.findings.filter(
        (finding) => finding.rule_id === characterization.rule_id,
      );

      expect(canonicalJson(second)).toBe(canonicalJson(first));
      expect(first.coverage.parser).toBe(characterization.expected_parser);
      expect(first.coverage.evaluated_rule_ids).toEqual(EXPECTED_RULE_IDS);
      expect(first.limitations).toEqual([]);
      expect(findings).toHaveLength(1);
      expect(findings[0]).toMatchObject({
        rule_id: characterization.rule_id,
        rule_description: characterization.rule_description,
        severity: characterization.expected_severity,
        location: targetUtf8Range(characterization.positive),
        evidence: { validation: "source_bound" },
        official_decision: {
          disposition: "evaluated",
          outcome: "finding",
        },
      });
      expect(findings[0]?.evidence.references.length).toBeGreaterThan(0);
      expect(findings[0]?.remediation).not.toBeNull();
      expect(first.coverage.detected_findings).toBe(first.findings.length);
      expect(first.coverage.truncated).toBe(false);
    },
  );

  it.each(REVIEW_RULE_CHARACTERIZATION)(
    "does not flag the characterized correct case for $rule_id",
    (characterization) => {
      const result = analyzeArtifact(
        characterization,
        characterization.correct,
      );
      expect(
        result.findings.some(
          (finding) => finding.rule_id === characterization.rule_id,
        ),
      ).toBe(false);
    },
  );

  it.each(REVIEW_RULE_CHARACTERIZATION)(
    "keeps the declared unsupported boundary for $rule_id",
    (characterization) => {
      const result = analyzeArtifact(
        characterization,
        characterization.unsupported,
        ("package_versions" in characterization.unsupported
          ? characterization.unsupported.package_versions
          : undefined) ??
          currentPackageVersions(characterization.package_names),
      );
      expect(
        result.findings.some(
          (finding) => finding.rule_id === characterization.rule_id,
        ),
      ).toBe(false);
      if (characterization.unsupported.expectation === "skipped_unknown") {
        expect(result.version_decisions).toContainEqual(
          expect.objectContaining({
            rule_id: characterization.rule_id,
            disposition: "skipped_unknown",
            outcome: null,
            evidence: expect.objectContaining({ validation: "source_bound" }),
          }),
        );
      }
    },
  );

  it("has at least two distinct actionable repair families whose golden repairs are clean", () => {
    const actionable = REVIEW_RULE_CHARACTERIZATION.filter(
      (characterization) =>
        characterization.repair_family !== null &&
        characterization.golden_repair !== null,
    );
    expect(
      new Set(actionable.map((entry) => entry.repair_family)).size,
    ).toBeGreaterThanOrEqual(2);

    for (const characterization of actionable) {
      const result = analyzeArtifact(
        characterization,
        characterization.golden_repair!,
      );
      expect(result.coverage.evaluated_rule_ids).toEqual(EXPECTED_RULE_IDS);
      expect(result.findings).toEqual([]);
      expect(result.limitations).toEqual([]);
    }
  });

  it("orders findings deterministically across the whole closed rule set", () => {
    const artifacts = REVIEW_RULE_CHARACTERIZATION.map(
      (characterization) => characterization.positive,
    );
    const packageVersions = Object.assign(
      {},
      ...REVIEW_RULE_CHARACTERIZATION.map((characterization) =>
        currentPackageVersions(characterization.package_names),
      ),
    );
    const first = analyzeSaltCode(
      { reviewCatalog, store },
      { artifacts: [...artifacts], package_versions: packageVersions },
    );
    const second = analyzeSaltCode(
      { reviewCatalog, store },
      { artifacts: [...artifacts], package_versions: packageVersions },
    );

    expect(canonicalJson(second)).toBe(canonicalJson(first));
    expect(
      first.results.flatMap((result) =>
        result.findings.map((finding) => finding.rule_id),
      ),
    ).toEqual(EXPECTED_RULE_IDS);
  });
});
