import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { REPO_ROOT } from "./registryTestUtils.js";

const TEXT_EXTENSIONS = new Set([
  ".cjs",
  ".cts",
  ".js",
  ".json",
  ".md",
  ".mdx",
  ".mjs",
  ".mts",
  ".ts",
  ".tsx",
  ".yaml",
  ".yml",
]);
const SCAN_ROOTS = [
  "packages/mcp/src",
  "packages/mcp/scripts",
  "packages/mcp/schemas",
  "packages/mcp/README.md",
  "packages/skills/salt-ds",
  "site/docs/getting-started/ai.mdx",
  "workflow-examples",
] as const;
const EXCLUDED_SEGMENTS = [
  "/__tests__/",
  "/eval-fixtures/remediation-baseline/",
] as const;
const BANNED_TEXT = [
  "salt_workflow_v1",
  "@modelcontextprotocol/sdk",
  "PublicNextStep",
  "post_action",
  "implementation_ready",
  "canonical_complete",
  "exact_request_safe",
  "repo_specific_workflows_ready",
  "finish_without_changes",
  "starter_scaffold",
  "starterScaffold",
  "pattern_starter_scaffold",
  "create_salt_ui",
  "migrate_to_salt",
  "get_salt_project_context",
  "get_salt_reference",
  "review_salt_ui",
  "can_generate_fix",
  "static_fix_blockers",
  "choice_precedence",
  "final_choice",
  "final_recommendation",
  "canonical_choice",
  "salt_project_policy_evaluation_v2",
  "token_alias_action",
  "blockingWorkflows",
  "recommendedAction",
  "explainCommand",
  "dedupeCommand",
  "reinstallCommand",
  "mergeCanonicalAndProjectConvention",
  "migrate_visual_evidence_v1",
  "workflow_input",
  "workflow-input",
  "SaltEvidenceWorkflowInputRef",
  "missing_workflow_input_locator",
  "healthSummary",
  "remediationFor",
  "SaltInstallationHealthSummary",
  "SaltInstallationRemediation",
  "health_summary",
  "recommended_action",
  "blocking_workflows",
] as const;
const DELETED_MODULES = [
  "packages/mcp/src/core/tools/publicContract.ts",
  "packages/mcp/src/core/tools/workflowContracts.ts",
  "packages/mcp/src/core/tools/capabilityManifest.ts",
  "packages/mcp/src/core/tools/createSaltUi.ts",
  "packages/mcp/src/core/tools/migrateToSalt.ts",
  "packages/mcp/src/core/tools/reviewSaltUi.ts",
  "packages/mcp/src/core/patternValidationRulePacks.ts",
  "packages/mcp/src/server/workflowOutputs.ts",
  "packages/mcp/schemas/salt-pattern-validation-rule-pack.schema.json",
  "packages/mcp/src/core/policy/projectPolicyEvaluation.ts",
  "packages/mcp/src/core/policy/__tests__/projectPolicyEvaluation.spec.ts",
  "packages/mcp/scripts/runEvidenceSprint.mjs",
  "packages/mcp/scripts/captureRemediationBaseline.mjs",
  "workflow-examples/project-conventions/custom-host-merge.example.ts",
  "packages/mcp/schemas/migrate-visual-evidence-request.schema.json",
  "packages/mcp/schemas/migrate-visual-evidence-response.schema.json",
  "workflow-examples/migration-visual-grounding/visual-evidence-adapter.example.mjs",
  "workflow-examples/migration-visual-grounding/reduce-visual-evidence-to-source-outline.example.mjs",
] as const;

function portable(filePath: string): string {
  return filePath.replaceAll("\\", "/");
}

function collectTextFiles(target: string): string[] {
  const absolute = path.join(REPO_ROOT, target);
  const stats = fs.statSync(absolute);
  if (stats.isFile()) return [absolute];
  return fs.readdirSync(absolute, { withFileTypes: true }).flatMap((entry) => {
    const child = path.join(absolute, entry.name);
    if (entry.isDirectory())
      return collectTextFiles(portable(path.relative(REPO_ROOT, child)));
    return TEXT_EXTENSIONS.has(path.extname(entry.name)) ? [child] : [];
  });
}

describe("Phase 2 deletion boundary", () => {
  it("contains no private workflow, starter, or temporary-adapter residue", () => {
    const violations: string[] = [];
    const files = SCAN_ROOTS.flatMap(collectTextFiles).filter((filePath) => {
      const relative = `/${portable(path.relative(REPO_ROOT, filePath))}`;
      return !EXCLUDED_SEGMENTS.some((segment) => relative.includes(segment));
    });

    for (const filePath of files) {
      const content = fs.readFileSync(filePath, "utf8");
      for (const term of BANNED_TEXT) {
        if (content.includes(term)) {
          violations.push(
            `${portable(path.relative(REPO_ROOT, filePath))}: ${term}`,
          );
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it("keeps rejected owner modules and schemas physically absent", () => {
    expect(
      DELETED_MODULES.filter((relativePath) =>
        fs.existsSync(path.join(REPO_ROOT, relativePath)),
      ),
    ).toEqual([]);
  });

  it("uses only the split SDK-v2 packages at the adapter boundary", () => {
    const manifest = JSON.parse(
      fs.readFileSync(
        path.join(REPO_ROOT, "packages/mcp/package.json"),
        "utf8",
      ),
    ) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const dependencies = {
      ...manifest.dependencies,
      ...manifest.devDependencies,
    };

    expect(dependencies).not.toHaveProperty("@modelcontextprotocol/sdk");
    expect(dependencies["@modelcontextprotocol/server"]).toMatch(/^\^2\./u);
    expect(dependencies["@modelcontextprotocol/client"]).toMatch(/^\^2\./u);

    const consumerSmokeV1Imports = collectTextFiles("scripts/consumer-smoke")
      .filter((filePath) =>
        fs.readFileSync(filePath, "utf8").includes("@modelcontextprotocol/sdk"),
      )
      .map((filePath) => portable(path.relative(REPO_ROOT, filePath)));
    expect(consumerSmokeV1Imports).toEqual([]);
  });
});
