import { execFileSync } from "node:child_process";

import { describe, expect, it } from "vitest";
import { validatePairRegistry } from "./retireSaltAiPremergeEvidence.mjs";
import {
  assertCurrentMigrationRecord,
  assertHistoricalDecisionDocument,
  assertHistoricalMigrationRecord,
  assertHistoricalPackageDocsSnapshot,
  assertHistoricalRetirementFixture,
  assertHistoricalRetirementPairCounts,
  assertHistoricalVisibilitySnapshot,
  assertRootScripts,
} from "./validateSaltAiContracts.mjs";

const predecessor = "e55fa54e215503b4a0e521e2f5ee054b9f0068ce";

function historicalJson(file) {
  return JSON.parse(
    execFileSync("git", ["show", `${predecessor}:${file}`], {
      encoding: "utf8",
    }),
  );
}

function historicalText(file) {
  return execFileSync("git", ["show", `${predecessor}:${file}`], {
    encoding: "utf8",
  });
}

function migration(status) {
  return {
    id: "core-button-appearance",
    status,
    file: "docs/ai/migrations/records/core-button-appearance.json",
    owners: { primary: "owner-a", backup: "owner-b" },
    affected_families: ["@salt-ds/core"],
    required_source_evidence: ["one.ts", "two.ts"],
  };
}

describe("Salt AI contract validation", () => {
  it("allows current migration states while preserving required record shape", () => {
    expect(() =>
      assertCurrentMigrationRecord(migration("completed"), new Set()),
    ).not.toThrow();
    expect(() =>
      assertCurrentMigrationRecord(migration("  "), new Set()),
    ).toThrow(/no migration status/u);
  });

  it("keeps the frozen migration audit at planned status", () => {
    expect(() =>
      assertHistoricalMigrationRecord(migration("planned")),
    ).not.toThrow();
    expect(() =>
      assertHistoricalMigrationRecord(migration("completed")),
    ).toThrow(/remain planned/u);
  });

  it("audits package and visibility history from the preserved predecessor", () => {
    const packages = historicalJson("tooling/ai/public-package-docs-v1.json");
    const visibility = historicalJson("tooling/ai/content-visibility-v1.json");
    expect(() => assertHistoricalPackageDocsSnapshot(packages)).not.toThrow();
    expect(() => assertHistoricalVisibilitySnapshot(visibility)).not.toThrow();

    packages.authoring_baseline.checkpoint_sha = "0".repeat(40);
    expect(() => assertHistoricalPackageDocsSnapshot(packages)).toThrow(
      /baseline/u,
    );
  });

  it("requires the historical retirement-pair inventory and fixtures", () => {
    const registry = validatePairRegistry(
      historicalJson("tooling/ai/premerge-evidence-pairs-v1.json"),
    );
    expect(() => assertHistoricalRetirementPairCounts(registry)).not.toThrow();
    expect(() =>
      assertHistoricalRetirementFixture(
        registry,
        historicalJson(
          "scripts/fixtures/salt-ai-premerge-retirement/valid-complete-batch.json",
        ),
        "valid-complete-batch.json",
      ),
    ).not.toThrow();
    expect(() =>
      assertHistoricalRetirementFixture(
        registry,
        historicalJson(
          "scripts/fixtures/salt-ai-premerge-retirement/invalid-partial-batch.json",
        ),
        "invalid-partial-batch.json",
      ),
    ).not.toThrow();
  });

  it("requires the frozen ADR decision text and legacy commands", () => {
    expect(() =>
      assertHistoricalDecisionDocument(
        historicalText("docs/decisions/0001-salt-ai-knowledge-platform.md"),
      ),
    ).not.toThrow();
    expect(() => assertHistoricalDecisionDocument("missing")).toThrow(
      /decision text/u,
    );

    const legacy = historicalJson("package.json");
    expect(() =>
      assertRootScripts(
        legacy,
        {
          "validate:salt-ai:contracts":
            "node ./scripts/validateSaltAiContracts.mjs",
          "eval:salt-ai:run":
            "node ./evals/salt-ai/scripts/runMcpCandidate.mjs",
        },
        "Historical",
      ),
    ).not.toThrow();
    legacy.scripts["eval:salt-ai:run"] = "changed";
    expect(() =>
      assertRootScripts(
        legacy,
        {
          "eval:salt-ai:run":
            "node ./evals/salt-ai/scripts/runMcpCandidate.mjs",
        },
        "Historical",
      ),
    ).toThrow(/missing or changed/u);
  });
});
