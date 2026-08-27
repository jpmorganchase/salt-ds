import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { resolvePackageKnowledgeApplicability } from "../applicability/knowledgeApplicability.js";
import {
  canonicalJson,
  sha256Bytes,
} from "../catalog/catalogSerialization.js";
import { loadCatalogRuntimeContext } from "../registry/loadRegistry.js";
import { REVIEW_RULE_CHARACTERIZATION } from "../review/reviewRuleRegistry.js";
import { searchSaltRecords } from "../search/searchSalt.js";
import { createSaltProjectFacts } from "../project/projectFacts.js";
import { REPO_ROOT } from "../../__tests__/registryTestUtils.js";

describe("Unit 01 semantic characterization", () => {
  it("matches the normalized prototype oracle", async () => {
    const registryDir = path.join(REPO_ROOT, "packages", "mcp", "generated");
    const context = await loadCatalogRuntimeContext({
      registryDir,
      prefetch: true,
    });
    const manifest = context.store.manifest;
    const semanticPatternsPath = path.join(
      REPO_ROOT,
      "packages",
      "mcp",
      "src",
      "core",
      "build",
      "catalogSemanticInputPatterns.json",
    );
    const compilerPatternsPath = path.join(
      REPO_ROOT,
      "packages",
      "mcp",
      "src",
      "core",
      "build",
      "catalogCompilerInputPatterns.json",
    );
    const [semanticPatternBytes, compilerPatternBytes] = await Promise.all([
      fs.readFile(semanticPatternsPath),
      fs.readFile(compilerPatternsPath),
    ]);
    const search = searchSaltRecords(context.store, {
      query: "button action",
      families: ["component", "pattern"],
      limit: 3,
    });
    const characterizationBaselinePath =
      "packages/mcp/src/core/__fixtures__/unit01-semantic-characterization.json";
    const normalizedInputProjection = manifest.inputs.filter(
      (entry) => entry.path !== characterizationBaselinePath,
    );
    const projectFacts = createSaltProjectFacts({
      rootDir: "D:/fixture",
      packageManifest: {
        status: "valid",
        path: "D:/fixture/package.json",
        name: "fixture",
        packageManager: "yarn@4.17.0",
      },
      declaredSaltPackages: [
        { name: "@salt-ds/core", version: "^1.0.0" },
      ],
      installation: {
        resolvedPackages: [
          {
            name: "@salt-ds/core",
            declaredVersion: "^1.0.0",
            effectiveDeclaredVersion: "^1.0.0",
            declarationResolution: "verified",
            resolvedVersion: "1.2.3",
            resolvedPath: "D:/fixture/node_modules/@salt-ds/core/package.json",
            satisfiesDeclaredVersion: true,
          },
        ],
        versionHealth: {
          declaredVersions: ["^1.0.0"],
          resolvedVersions: ["1.2.3"],
          multipleDeclaredVersions: false,
          multipleResolvedVersions: false,
          mismatchedPackages: [],
          unverifiablePackages: [],
          issues: [],
        },
        inspection: {
          packageManager: "yarn",
          packageManagerDetectionStatus: "declared",
          strategy: "manifest-resolution",
          status: "succeeded",
          packageLayout: "node-modules",
          limitations: [],
          manifestOverrideFields: [],
        },
        workspace: {
          kind: "single-package",
          packageRoot: "D:/fixture",
          workspaceRoot: null,
          issueSourceHint: "none",
          workspaceSaltPackages: [],
          workspaceIssues: [],
        },
      },
      detectedPolicy: {
        mode: "none",
        teamConfigPath: null,
        stackConfigPath: null,
        markerIssues: [],
      },
      policyEvaluation: null,
    });
    const projection = {
      schema_version: "1.0.0",
      contract: "unit-01-prototype-semantic-characterization",
      catalog: {
        semantic_digest: manifest.semantic_digest,
        input_count: manifest.inputs.length,
        normalized_input_projection_digest: sha256Bytes(
          canonicalJson(normalizedInputProjection),
        ),
        package_family_inventory: context.store
          .getFamily("package")
          .map(({ name, version, status }) => ({ name, version, status })),
        record_reads: [
          context.store.getRecord("package", "package.salt-ds-core"),
          context.store.getRecord("component", "component.button"),
        ].map((record) =>
          record
            ? {
                family: record.family,
                id: record.id,
                name: "name" in record ? record.name : null,
                status: "status" in record ? record.status : null,
              }
            : null,
        ),
      },
      inputs: {
        semantic_patterns_sha256: sha256Bytes(semanticPatternBytes),
        compiler_patterns_sha256: sha256Bytes(compilerPatternBytes),
      },
      search: {
        query: search.query,
        matched_documents: search.matched_documents,
        matches: search.matches.map((match) => ({
          reference: match.reference,
          title: match.title,
          score: match.evidence.score,
          matched_fields: match.evidence.matched_fields,
          matched_terms: match.evidence.matched_terms,
        })),
      },
      project_facts: {
        schema_version: projectFacts.schema_version,
        package_manifest: projectFacts.package_manifest,
        declared_salt_packages: projectFacts.declared_salt_packages,
        resolved_packages: projectFacts.installation.resolvedPackages,
        workspace: projectFacts.workspace,
        policy: projectFacts.policy,
      },
      review: {
        rules: REVIEW_RULE_CHARACTERIZATION,
        complete_result_fields: [
          "findings",
          "version_decisions",
          "coverage",
          "applicability",
          "evidence",
        ],
      },
      applicability: {
        exact: resolvePackageKnowledgeApplicability({
          packageName: "@salt-ds/core",
          targetVersion: "1.2.3",
          catalogVersion: "1.2.3",
        }),
        mismatch: resolvePackageKnowledgeApplicability({
          packageName: "@salt-ds/core",
          targetVersion: "1.2.3",
          catalogVersion: "1.3.0",
        }),
        unknown: resolvePackageKnowledgeApplicability({
          packageName: "@salt-ds/core",
          targetVersion: null,
          catalogVersion: "1.2.3",
        }),
      },
      integrity: {
        valid_catalog: "accepted",
        digest_mismatch: "rejected",
        containment_escape: "rejected",
        changed_during_read: "rejected",
      },
      prototype_only_fields: [
        "catalog-v2 schema and codecs",
        "catalog-manifest generator receipt",
        "salt://catalog/v2 resource identities",
        "build_artifacts publication partition",
        "MCP public result and resource budgets",
      ],
    };
    const baseline = JSON.parse(
      await fs.readFile(
        path.join(REPO_ROOT, ...characterizationBaselinePath.split("/")),
        "utf8",
      ),
    );
    expect(projection.catalog.record_reads).not.toContain(null);
    expect(projection).toEqual(baseline);
  });
});
