import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  buildComponentContext,
  buildContextCoverageAudit,
  buildFoundationContext,
  buildPatternContext,
  SALT_CONTEXT_COVERAGE_AUDIT_CONTRACT,
  selectDefaultContextPackComponents,
  selectDefaultContextPackFoundationTokenGroups,
  selectDefaultContextPackPatterns,
  validateGeneratedArtifactEvidence,
  validateGeneratedArtifactRegistryEvidence,
} from "@salt-ds/semantic-core";
import { buildRegistry } from "@salt-ds/semantic-core/build/buildRegistry";
import { describe, expect, it } from "vitest";
import { validateSaltContextCoverageAuditSchema } from "../../../semantic-core/src/__tests__/contextCoverageAuditSchemaTestUtils.js";
import { loadRegistry } from "../registry/loadRegistry.js";
import { REPO_ROOT } from "./registryTestUtils.js";

const GENERATED_AT = "2026-05-02T00:00:00Z";
const GENERATOR = {
  name: "semantic-core production context coverage audit",
  version: "0.0.0",
};

describe("production context coverage audit", () => {
  it("writes a schema-valid production audit instead of filling coverage gaps with static facts", async () => {
    const registryDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-context-coverage-production-"),
    );

    try {
      await buildRegistry({
        sourceRoot: REPO_ROOT,
        outputDir: registryDir,
        timestamp: GENERATED_AT,
      });
      const registry = await loadRegistry({ registryDir });
      const audit = buildContextCoverageAudit({
        registry,
        generated_at: GENERATED_AT,
        generator: GENERATOR,
      });
      const reportPath = path.join(registryDir, "context-coverage-audit.json");

      await fs.writeFile(
        reportPath,
        `${JSON.stringify(audit, null, 2)}\n`,
        "utf8",
      );

      const persistedAudit = JSON.parse(
        await fs.readFile(reportPath, "utf8"),
      ) as typeof audit;
      const tokenCategoryCount = new Set(
        registry.tokens.map((token) => token.category),
      ).size;
      const expectedGapCount =
        audit.component_contexts.source_gap_count +
        audit.pattern_contexts.source_gap_count +
        audit.foundation_contexts.source_gap_count +
        audit.component_contexts.unsupported_records.length +
        audit.pattern_contexts.unsupported_records.length +
        audit.foundation_contexts.unsupported_records.length;

      expect(validateSaltContextCoverageAuditSchema(persistedAudit)).toEqual(
        [],
      );
      expect(persistedAudit).toEqual(audit);
      expect(audit.contract).toBe(SALT_CONTEXT_COVERAGE_AUDIT_CONTRACT);
      expect(audit.component_contexts.total_records).toBe(
        registry.components.length,
      );
      expect(audit.pattern_contexts.total_records).toBe(
        registry.patterns.length,
      );
      expect(audit.foundation_contexts.total_records).toBe(tokenCategoryCount);
      expect(audit.docs_registry_gaps).toHaveLength(expectedGapCount);
      expect(audit.status).toBe(
        audit.docs_registry_gaps.length === 0 ? "validated" : "unsupported",
      );

      for (const gap of audit.docs_registry_gaps) {
        expect(["component", "pattern", "foundation"]).toContain(gap.kind);
        expect(gap.status).toBe("unsupported");
        expect(gap.reason).toMatch(/evidence|registry|source|surface gate/i);
        expect(gap.missing.length).toBeGreaterThan(0);
        expect(Array.isArray(gap.evidence_ref_ids)).toBe(true);
        expect(Array.isArray(gap.records)).toBe(true);

        if (
          gap.kind === "foundation" &&
          gap.missing.includes(
            "token policy docs or source-backed policy evidence",
          )
        ) {
          expect(gap.records.length).toBeGreaterThan(0);
          for (const record of gap.records) {
            expect(record.kind).toBe("token");
            expect(record.status).toBe("unsupported");
            expect(record.reason_code).toMatch(
              /^missing_token_policy|^deprecated_token_/,
            );
            expect(record.reason).toMatch(/policy|evidence/i);
            expect(record.missing.length).toBeGreaterThan(0);
            expect(Array.isArray(record.evidence_ref_ids)).toBe(true);
          }
        }
      }

      const componentContexts = selectDefaultContextPackComponents(
        registry,
      ).map((component) =>
        buildComponentContext({
          registry,
          component,
          generated_at: GENERATED_AT,
          generator: GENERATOR,
        }),
      );
      const patternContexts = selectDefaultContextPackPatterns(registry).map(
        (pattern) =>
          buildPatternContext({
            registry,
            pattern,
            generated_at: GENERATED_AT,
            generator: GENERATOR,
          }),
      );
      const foundationContexts =
        selectDefaultContextPackFoundationTokenGroups(registry).map((group) =>
          buildFoundationContext({
            registry,
            category: group.category,
            tokens: group.tokens,
            generated_at: GENERATED_AT,
            generator: GENERATOR,
          }),
        );
      const generatedArtifacts = [
        ...componentContexts.map((context) => context.generated_artifact),
        ...patternContexts.map((context) => context.generated_artifact),
        ...foundationContexts.map((context) => context.generated_artifact),
      ];
      const unsupportedDefaultContexts = [
        ...componentContexts,
        ...patternContexts,
        ...foundationContexts,
      ].filter((context) => context.status !== "validated");
      const evidenceIssues = generatedArtifacts.flatMap((artifact) =>
        validateGeneratedArtifactEvidence(artifact).map((issue) => ({
          artifact_id: artifact.id,
          issue,
        })),
      );
      const registryIssues = generatedArtifacts.flatMap((artifact) =>
        validateGeneratedArtifactRegistryEvidence(artifact, registry).map(
          (issue) => ({
            artifact_id: artifact.id,
            issue,
          }),
        ),
      );

      expect(generatedArtifacts.length).toBeGreaterThan(0);
      expect(unsupportedDefaultContexts).toEqual([]);
      expect(
        generatedArtifacts.flatMap(
          (artifact) => artifact.unsupported_claims ?? [],
        ),
      ).toEqual([]);
      expect(evidenceIssues).toEqual([]);
      expect(registryIssues).toEqual([]);

      for (const context of [
        ...componentContexts,
        ...patternContexts,
        ...foundationContexts,
      ]) {
        if (context.status === "unsupported") {
          expect(context.surface_gate.missing.length).toBeGreaterThan(0);
        }
      }
    } finally {
      await fs.rm(registryDir, { recursive: true, force: true });
    }
  }, 120000);
});
