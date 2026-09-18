import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  createBuiltCatalogV2Fixture,
  SOURCE_REGISTRY_BUILD_TEST_TIMEOUT_MS,
} from "../../__tests__/registryTestUtils.js";
import {
  loadKnowledgeRuntimeContext,
  type KnowledgeRuntimeContext,
} from "../../core/runtime.js";
import {
  createProjectAccessPolicy,
  type ProjectAccessPolicy,
} from "../projectAccess.js";
import { ProjectPolicySnapshotCache } from "../projectPolicySnapshot.js";
import {
  measureSaltToolBaseResultFrameUtf8Bytes,
  type SaltToolWireContext,
} from "../responseAdapters.js";
import {
  inspectSaltProjectOperation,
  reviewSaltCodeOperation,
  type SaltToolOperationContext,
  searchSaltOperation,
} from "../saltToolOperations.js";
import {
  INSPECT_TOOL_DEFINITION,
  REVIEW_TOOL_DEFINITION,
  SEARCH_TOOL_DEFINITION,
} from "../toolDefinitions.js";

let catalogDirectory = "";
let projectRoot = "";
let runtimeContext: KnowledgeRuntimeContext;
let operationContext: SaltToolOperationContext;

const TEST_WIRE_CONTEXT: SaltToolWireContext = {
  era: "modern",
  requestId: 0,
  serverInfo: { name: "salt-mcp-test", version: "0.0.0-test" },
};

function measureTestNonSearchResult(payload: unknown): number {
  return measureSaltToolBaseResultFrameUtf8Bytes(
    "review_salt_code",
    payload as Record<string, unknown>,
    TEST_WIRE_CONTEXT,
  );
}

function withProjectAccess(
  projectAccess: ProjectAccessPolicy,
): SaltToolOperationContext {
  return {
    ...runtimeContext,
    projectAccess,
    projectPolicySnapshots: new ProjectPolicySnapshotCache(),
    measureFinalResultUtf8Bytes: measureTestNonSearchResult,
  };
}

beforeAll(async () => {
  [catalogDirectory, projectRoot] = await Promise.all([
    createBuiltCatalogV2Fixture("salt-tool-operations-"),
    fs.mkdtemp(path.join(os.tmpdir(), "salt-tool-operations-project-")),
  ]);
  runtimeContext = await loadKnowledgeRuntimeContext({
    bundleDir: catalogDirectory,
  });
  const corePackage = runtimeContext.store
    .getFamily("package")
    .find((record) => record.name === "@salt-ds/core");
  if (!corePackage) throw new Error("The test catalog has no Core package.");
  const coreVersion = corePackage.version;
  await Promise.all([
    fs.mkdir(path.join(projectRoot, ".salt"), { recursive: true }),
    fs.mkdir(path.join(projectRoot, "node_modules", "@salt-ds", "core"), {
      recursive: true,
    }),
  ]);
  await Promise.all([
    fs.writeFile(
      path.join(projectRoot, "package.json"),
      JSON.stringify({
        name: "salt-tool-operations-fixture",
        private: true,
        dependencies: { "@salt-ds/core": coreVersion },
      }),
      "utf8",
    ),
    fs.writeFile(
      path.join(
        projectRoot,
        "node_modules",
        "@salt-ds",
        "core",
        "package.json",
      ),
      JSON.stringify({ name: "@salt-ds/core", version: coreVersion }),
      "utf8",
    ),
    fs.writeFile(
      path.join(projectRoot, ".salt", "team.json"),
      JSON.stringify({
        contract: "project_conventions_v1",
        version: "1.0.0",
        preferred_components: [
          {
            salt_name: "Button",
            prefer: "CompanyButton",
            reason: "Use the company wrapper for product actions.",
          },
        ],
      }),
      "utf8",
    ),
  ]);
  operationContext = {
    ...runtimeContext,
    projectAccess: await createProjectAccessPolicy({
      mode: "restricted",
      allowedRoots: [projectRoot],
      defaultRoot: projectRoot,
    }),
    projectPolicySnapshots: new ProjectPolicySnapshotCache(),
    measureFinalResultUtf8Bytes: measureTestNonSearchResult,
  };
}, SOURCE_REGISTRY_BUILD_TEST_TIMEOUT_MS);

afterAll(async () => {
  await Promise.all(
    [catalogDirectory, projectRoot]
      .filter(Boolean)
      .map((directory) => fs.rm(directory, { recursive: true, force: true })),
  );
});

describe("typed Salt tool operations", () => {
  it("returns strict ordinary results for all three operations", async () => {
    const searchResult = searchSaltOperation(operationContext, {
      query: "Button",
      limit: 1,
    });
    expect(
      SEARCH_TOOL_DEFINITION.outputValidationSchema.safeParse(searchResult)
        .success,
    ).toBe(true);
    expect(searchResult.applicability).toMatchObject({
      state: "current",
      basis: "knowledge_current_target",
      historical_completeness: false,
    });

    const inspectResult = await inspectSaltProjectOperation(operationContext, {
      evaluate_policy: true,
    });
    expect(
      INSPECT_TOOL_DEFINITION.outputValidationSchema.safeParse(inspectResult)
        .success,
    ).toBe(true);
    const core =
      inspectResult.data.installation?.untrusted_project_data.resolved_packages.find(
        (entry) => entry.name === "@salt-ds/core",
      );
    expect(core?.catalog_assessment.applicability).toMatchObject({
      state: "applicable",
      basis: "exact_knowledge_package_version",
      peer_compatibility: "not_evaluated",
      historical_completeness: false,
    });
    expect(inspectResult.data.context?.handle).toBeTruthy();
    if (!core?.resolved_version) {
      throw new Error("The inspected Core fixture did not resolve a version.");
    }

    const reviewResult = await reviewSaltCodeOperation(operationContext, {
      artifacts: [
        {
          id: "button.tsx",
          language: "tsx",
          text: 'import { Button } from "@salt-ds/core"; export const Example = () => <Button href="/home">Home</Button>;',
        },
      ],
      package_versions: {
        "@salt-ds/core": core.resolved_version,
      },
    });
    expect(
      REVIEW_TOOL_DEFINITION.outputValidationSchema.safeParse(reviewResult)
        .success,
    ).toBe(true);
    expect(reviewResult.data.results[0]?.findings.length).toBeGreaterThan(0);
  });

  it("keeps denied inspection and invalid snapshot failures at the operation boundary", async () => {
    const deniedContext = withProjectAccess(
      await createProjectAccessPolicy({
        mode: "restricted",
        allowedRoots: [],
      }),
    );
    const denied = await inspectSaltProjectOperation(deniedContext, {});
    expect(denied.scope.authorization).toBe("restricted");
    expect(denied.coverage.requested_root).toBe("denied");
    expect(denied.data.installation).toBeNull();

    await expect(
      reviewSaltCodeOperation(operationContext, {
        artifacts: [
          {
            id: "expired.tsx",
            language: "tsx",
            text: "export const value = 1;",
          },
        ],
        project_context_handle: "A".repeat(43),
      }),
    ).rejects.toThrow(/Invalid project context handle/u);
  });

  it("supports fresh and retained policy context without exposing transport objects", async () => {
    const fresh = await reviewSaltCodeOperation(operationContext, {
      artifacts: [
        {
          id: "fresh.tsx",
          language: "tsx",
          text: 'import { Button } from "@salt-ds/core"; export const Example = () => <Button href="/save">Save</Button>;',
        },
      ],
      root_dir: projectRoot,
    });
    expect(fresh.scope.context_source).toBe("fresh_project_inspection");
    expect(fresh.coverage.project_policy.status).not.toBe("not_supplied");
    expect(
      fresh.data.results[0]?.findings.map((finding) => ({
        rule_id: finding.rule_id,
        official_decision: finding.official_decision,
        policy_evaluation: finding.policy_evaluation,
      })),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          rule_id: "salt.component.action_navigation_target",
          official_decision: expect.objectContaining({
            outcome: "finding",
          }),
          policy_evaluation: null,
        }),
        expect.objectContaining({
          rule_id: "salt.project_policy.preferred_component",
          official_decision: null,
          policy_evaluation: expect.objectContaining({
            trust: "untrusted_advisory",
          }),
        }),
      ]),
    );

    const inspected = await inspectSaltProjectOperation(operationContext, {});
    if (!inspected.data.context) {
      throw new Error("Inspection did not retain its policy snapshot.");
    }
    const retained = await reviewSaltCodeOperation(operationContext, {
      artifacts: [
        {
          id: "retained.tsx",
          language: "tsx",
          text: 'import { Button } from "@salt-ds/core"; export const Example = () => <Button>Save</Button>;',
        },
      ],
      project_context_handle: inspected.data.context.handle,
    });
    expect(retained.scope.context_source).toBe("retained_project_snapshot");
    expect(retained.coverage.project_policy.status).not.toBe("not_supplied");
  });

  it("uses the sealed catalog for the real Core 1.35 Button variant boundary", async () => {
    const reviewed = await reviewSaltCodeOperation(operationContext, {
      artifacts: [
        {
          id: "button-1.35.tsx",
          language: "tsx",
          text: 'import { Button } from "@salt-ds/core"; export const Example = () => <Button variant="primary" />;',
        },
      ],
      package_versions: { "@salt-ds/core": "1.35.0" },
    });
    const artifact = reviewed.data.results[0]!;

    expect(
      artifact.findings.some(
        (finding) => finding.rule_id === "salt.deprecation.static_prop",
      ),
    ).toBe(false);
    expect(artifact.version_decisions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          rule_id: "salt.deprecation.static_prop",
          disposition: "evaluated",
          outcome: "no_finding",
          reason_code: "NOT_DEPRECATED_AT_TARGET_VERSION",
          applicability: expect.objectContaining({
            state: "applicable",
            basis: "deprecation_timeline",
            target_version: "1.35.0",
            historical_completeness: false,
          }),
        }),
      ]),
    );
  });

  it("keeps unresolved package evidence unknown for fresh and retained project context", async () => {
    const unresolvedRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-tool-operations-unresolved-"),
    );
    try {
      await fs.writeFile(
        path.join(unresolvedRoot, "package.json"),
        JSON.stringify({
          name: "unresolved-salt-fixture",
          private: true,
          dependencies: { "@salt-ds/core": "1.35.0" },
        }),
        "utf8",
      );
      const unresolvedContext = withProjectAccess(
        await createProjectAccessPolicy({
          mode: "restricted",
          allowedRoots: [unresolvedRoot],
          defaultRoot: unresolvedRoot,
        }),
      );
      const artifact = {
        id: "unresolved.tsx",
        language: "tsx" as const,
        text: 'import { Button } from "@salt-ds/core"; export const Example = () => <Button variant="primary" />;',
      };
      const fresh = await reviewSaltCodeOperation(unresolvedContext, {
        artifacts: [artifact],
        root_dir: unresolvedRoot,
      });
      const inspected = await inspectSaltProjectOperation(unresolvedContext, {
        root_dir: unresolvedRoot,
      });
      if (!inspected.data.context) {
        throw new Error("Unresolved inspection did not retain a snapshot.");
      }
      const retained = await reviewSaltCodeOperation(unresolvedContext, {
        artifacts: [artifact],
        project_context_handle: inspected.data.context.handle,
      });

      for (const reviewed of [fresh, retained]) {
        const result = reviewed.data.results[0]!;
        expect(
          result.findings.some(
            (finding) => finding.rule_id === "salt.deprecation.static_prop",
          ),
        ).toBe(false);
        expect(result.version_decisions).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              rule_id: "salt.deprecation.static_prop",
              disposition: "skipped_unknown",
              outcome: null,
              reason_code: "TARGET_VERSION_EVIDENCE_UNKNOWN",
              applicability: expect.objectContaining({
                state: "unknown",
                target_version: null,
                historical_completeness: false,
              }),
            }),
          ]),
        );
      }
    } finally {
      await fs.rm(unresolvedRoot, { recursive: true, force: true });
    }
  });
});
