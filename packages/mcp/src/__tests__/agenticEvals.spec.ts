import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildRegistry } from "../core/build/buildRegistry.js";
import { mergeCanonicalAndProjectConventionLayers } from "../core/policy/index.js";
import { loadRegistry } from "../core/registry/loadRegistry.js";
import { createSaltUi } from "../core/tools/createSaltUi.js";
import { getSaltEntity } from "../core/tools/getSaltEntity.js";
import { migrateToSalt } from "../core/tools/migrateToSalt.js";
import type { PublicContract } from "../core/tools/publicContract.js";
import { reviewSaltUi } from "../core/tools/reviewSaltUi.js";
import {
  buildCreateSaltUiWorkflowContract,
  buildMigrateToSaltWorkflowContract,
  buildReviewSaltUiWorkflowContract,
} from "../core/tools/workflowContracts.js";
import { buildWorkflowProjectPolicyArtifact } from "../core/tools/workflowProjectPolicy.js";
import { applyProjectPolicyToStarterCodeSnippets } from "../core/tools/workflowProjectPolicyApplication.js";
import type { SaltRegistry } from "../core/types.js";
import { TOOL_DEFINITIONS } from "../server/toolDefinitions.js";
import {
  withAnalyzeWorkflowGuidance,
  withChooseWorkflowGuidance,
  withTranslateWorkflowGuidance,
} from "../server/workflowOutputs.js";
import { createToolSelectionRanker } from "./fixtures/toolSelectionRanker.js";
import { REPO_ROOT } from "./registryTestUtils.js";

const BUILT_AT = "2026-03-10T00:00:00Z";

let registry: SaltRegistry;
let registryDir: string;

// biome-ignore lint/suspicious/noExplicitAny: deterministic evals flatten dynamic workflow detail envelopes from multiple workflows.
type LooseWorkflowDetailsObject = Record<string, any>;

type WorkflowFullDetailsShape = {
  workflow: LooseWorkflowDetailsObject;
  result: LooseWorkflowDetailsObject;
  artifacts: LooseWorkflowDetailsObject;
};

type WorkflowDiagnosticResult = Omit<PublicContract, "workflow"> &
  WorkflowFullDetailsShape;
type CreateWorkflowFullResult = WorkflowDiagnosticResult;
type ReviewWorkflowFullResult = WorkflowDiagnosticResult;
type MigrateWorkflowFullResult = WorkflowDiagnosticResult;

function toWorkflowDiagnosticResult(
  publicContract: PublicContract,
  details: WorkflowFullDetailsShape,
): WorkflowDiagnosticResult {
  expect(publicContract).toEqual(
    expect.objectContaining({
      contract: "salt_workflow_v1",
      workflow: expect.any(String),
      status: expect.any(String),
      safety: expect.any(Object),
      action: expect.any(Object),
      summary: expect.any(String),
    }),
  );
  expect(publicContract).not.toHaveProperty("details");

  return {
    ...publicContract,
    workflow: details.workflow,
    result: details.result,
    artifacts: details.artifacts,
  };
}

function runCreateWorkflowFull(input: {
  query: string;
  includeStarterCode?: boolean;
  solutionType?: Parameters<typeof createSaltUi>[1]["solution_type"];
  contextChecked?: boolean;
  projectPolicy?: ReturnType<typeof buildWorkflowProjectPolicyArtifact> | null;
  resolvedEntities?: string[];
}): CreateWorkflowFullResult {
  const result = createSaltUi(registry, {
    query: input.query,
    include_starter_code: input.includeStarterCode ?? true,
    solution_type: input.solutionType,
  });
  const starterCode = applyProjectPolicyToStarterCodeSnippets(
    result.starter_code,
    input.projectPolicy,
  );
  const workflow = buildCreateSaltUiWorkflowContract(registry, result, {
    query: input.query,
    context_checked: input.contextChecked,
    project_policy: input.projectPolicy,
    starter_code: starterCode,
  });
  const publicContract = withChooseWorkflowGuidance(registry, result, {
    create_rerun_args: {
      query: input.query,
      resolved_entities: input.resolvedEntities,
    },
    context_checked: input.contextChecked,
    project_policy: input.projectPolicy,
  }) as PublicContract;

  return toWorkflowDiagnosticResult(publicContract, {
    workflow: {
      id: "create_salt_ui",
      ...workflow,
    },
    result: {
      ...result,
      ide_summary: workflow.ide_summary,
      final_decision: {
        name: workflow.repo_refinement?.final_name ?? result.decision.name,
        source: workflow.repo_refinement?.source ?? "canonical_salt",
      },
    },
    artifacts: {
      ...result,
      ...workflow,
      starter_code: starterCode,
      project_policy: input.projectPolicy ?? null,
    },
  });
}

function runReviewWorkflowFull(input: {
  code: string;
  fidelity?: "production" | "prototype";
  projectPolicy?: ReturnType<typeof buildWorkflowProjectPolicyArtifact> | null;
  expectedTargets?: Parameters<typeof reviewSaltUi>[1]["expected_targets"];
}): ReviewWorkflowFullResult {
  const result = reviewSaltUi(registry, {
    framework: "react",
    fidelity: input.fidelity,
    view: "full",
    code: input.code,
    expected_targets: input.expectedTargets,
  });
  const workflow = buildReviewSaltUiWorkflowContract(result, {
    code: input.code,
    expected_targets: input.expectedTargets,
    project_policy: input.projectPolicy,
  });
  const publicContract = withAnalyzeWorkflowGuidance(registry, result, {
    code: input.code,
    expected_targets: input.expectedTargets,
    project_policy: input.projectPolicy,
  }) as PublicContract;
  const projectPolicyFixCount = workflow.fix_candidates.candidates.filter(
    (candidate) => candidate.category === "project-policy",
  ).length;

  return toWorkflowDiagnosticResult(publicContract, {
    workflow: {
      id: "review_salt_ui",
      ...workflow,
    },
    result: {
      ...result,
      ide_summary: workflow.ide_summary,
      decision: workflow.decision,
      summary: {
        ...result.summary,
        fix_count: result.summary.fix_count + projectPolicyFixCount,
      },
    },
    artifacts: {
      ...workflow,
      project_policy: input.projectPolicy ?? null,
    },
  });
}

function runMigrateWorkflowFull(input: {
  sourceOutline: {
    regions: string[];
    actions: string[];
    states: string[];
    notes: string[];
  };
}): MigrateWorkflowFullResult {
  const result = migrateToSalt(registry, {
    source_outline: input.sourceOutline,
    include_starter_code: true,
  });
  const starterCode = applyProjectPolicyToStarterCodeSnippets(
    result.starter_code,
    null,
  );
  const combinedScaffold = applyProjectPolicyToStarterCodeSnippets(
    result.combined_scaffold,
    null,
  );
  const publicStarterCode = (
    (combinedScaffold?.length ?? 0) > 0 ? combinedScaffold : starterCode
  )?.map((snippet) =>
    snippet.language === "tsx" &&
    !snippet.label.toLowerCase().includes("starter")
      ? { ...snippet, label: `${snippet.label} starter` }
      : snippet,
  );
  const workflow = buildMigrateToSaltWorkflowContract(registry, result, {
    source_outline: input.sourceOutline,
    starter_code: publicStarterCode,
  });
  const publicContract = withTranslateWorkflowGuidance(registry, result, {
    source_outline: input.sourceOutline,
  }) as PublicContract;

  return toWorkflowDiagnosticResult(publicContract, {
    workflow: {
      id: "migrate_to_salt",
      ...workflow,
    },
    result: {
      ...result,
      ide_summary: workflow.ide_summary,
    },
    artifacts: {
      ...result,
      ...workflow,
      starter_code: starterCode,
      combined_scaffold: combinedScaffold,
      project_policy: null,
    },
  });
}

beforeAll(async () => {
  registryDir = await fs.mkdtemp(path.join(os.tmpdir(), "salt-agentic-evals-"));
  await buildRegistry({
    sourceRoot: REPO_ROOT,
    outputDir: registryDir,
    timestamp: BUILT_AT,
  });
  registry = await loadRegistry({ registryDir });
}, 120000);

afterAll(async () => {
  if (registryDir) {
    await fs.rm(registryDir, { recursive: true, force: true });
  }
});

describe("deterministic agentic evals", () => {
  it("resolves stable core export names through reference and create evidence lookup", () => {
    const lookupCases = [
      ["VerticalNavigation", "Vertical navigation"],
      ["BorderLayout", "Border layout"],
      ["StackLayout", "Stack layout"],
      ["GridLayout", "Grid layout"],
      ["H1", "Text"],
    ] as const;

    for (const [exportName, entityName] of lookupCases) {
      const result = getSaltEntity(registry, {
        name: exportName,
        include_starter_code: true,
      });

      expect(result.decision.status).toBe("found");
      expect(result.entity?.name).toBe(entityName);
      expect(result.starter_code).toHaveLength(1);
      expect(result.starter_code?.[0]?.label).toMatch(/starter$/i);
      expect(
        result.starter_code?.[0]?.code.split(/\r?\n/).length,
      ).toBeLessThanOrEqual(30);
    }

    const createResult = runCreateWorkflowFull({
      query: "Button",
      contextChecked: true,
      resolvedEntities: lookupCases.map(([exportName]) => exportName),
    });

    expect(createResult.status).toBe("blocked");
    expect(createResult.action).toMatchObject({
      kind: "ask_user",
      question: expect.stringMatching(/remove.*resolved_entities/i),
      post_action: null,
    });
    expect(createResult.action.kind).not.toBe("implement");
    expect(createResult.evidence.items).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "resolved_entities" }),
      ]),
    );
  });

  it("keeps create_salt_ui out of implement when resolved_entities include an unverified name", () => {
    const result = runCreateWorkflowFull({
      query: "Button",
      contextChecked: true,
      resolvedEntities: ["Button", "DefinitelyMissingSaltExport"],
    });

    expect(result.status).toBe("blocked");
    expect(result.safety.exact_request_safe).toBe(false);
    expect(result.action).toEqual(
      expect.objectContaining({
        kind: "ask_user",
        question: expect.stringContaining("DefinitelyMissingSaltExport"),
        post_action: null,
      }),
    );
    expect(result.action.kind).not.toBe("implement");
    expect(result.evidence.missing).toEqual(
      expect.arrayContaining([
        expect.stringContaining("DefinitelyMissingSaltExport"),
      ]),
    );
  });

  it("keeps a financial dashboard with vertical navigation blocked until its composition is grounded", () => {
    const query =
      "Create a Salt analytical dashboard for a financial website with a vertical navigation sidebar, KPI metrics, tabs, and a transactions table.";
    const beforeGrounding = runCreateWorkflowFull({
      query,
      contextChecked: true,
    });

    expect(beforeGrounding.result.decision.name).toBe("Analytical dashboard");
    expect(
      beforeGrounding.result.composition_contract?.expected_components ?? [],
    ).toContain("Vertical navigation");
    expect(
      beforeGrounding.workflow.implementation_gate.required_follow_through,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ entity: "Vertical navigation" }),
      ]),
    );
    expect(beforeGrounding.status).not.toBe("success");
    expect(beforeGrounding.action.kind).not.toBe("implement");

    const reference = getSaltEntity(registry, {
      name: "VerticalNavigation",
      include_starter_code: true,
    });
    expect(reference.decision.status).toBe("found");
    expect(reference.entity).toEqual(
      expect.objectContaining({
        name: "Vertical navigation",
        composition: expect.objectContaining({
          required_children: expect.arrayContaining([
            "VerticalNavigationItemContent",
            "VerticalNavigationItemTrigger",
          ]),
        }),
      }),
    );

    const requiredEntities =
      beforeGrounding.workflow.implementation_gate.required_follow_through.map(
        (item: { entity: string }) => item.entity,
      );
    const afterGrounding = runCreateWorkflowFull({
      query,
      contextChecked: true,
      resolvedEntities: requiredEntities,
    });

    expect(afterGrounding.evidence.missing).toEqual([]);
    expect(afterGrounding.evidence.status).toBe("complete");
    expect(afterGrounding.evidence.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          entity: "Vertical navigation",
          field: "resolved_follow_through",
        }),
      ]),
    );
  });

  it("anchors PascalCase exports in descriptive create requests and advances without repeating evidence", () => {
    const query =
      "Build a Salt app shell with a left VerticalNavigation, a page header, and a main content region.";
    const beforeGrounding = runCreateWorkflowFull({
      query,
      contextChecked: true,
    });
    const requiredEntities =
      beforeGrounding.workflow.implementation_gate.required_follow_through.map(
        (item: { entity: string }) => item.entity,
      );

    expect(requiredEntities).toContain("Vertical navigation");

    const afterGrounding = runCreateWorkflowFull({
      query,
      contextChecked: true,
      resolvedEntities: requiredEntities,
    });

    expect(afterGrounding.evidence.missing).toEqual([]);
    expect(afterGrounding.evidence.status).toBe("complete");
    expect(afterGrounding.action.kind).toBe("implement");
    expect(afterGrounding.action).not.toEqual(
      expect.objectContaining({
        kind: "retrieve_reference",
        args: expect.objectContaining({
          names: expect.arrayContaining(requiredEntities),
        }),
      }),
    );
  });

  it("keeps the generated App header starter internally clean", () => {
    const result = runCreateWorkflowFull({
      query: "App header",
      contextChecked: true,
    });
    const starterCode = result.artifacts.starter_code?.[0]?.code ?? "";

    expect(starterCode).toContain('<Link href="/">');
    expect(starterCode).toContain("<NavigationItem");
    expect(result.artifacts.starter_validation).toEqual(
      expect.objectContaining({
        status: "clean",
        top_issue: null,
      }),
    );
  });

  it("flags VerticalNavigation items missing VerticalNavigationItemContent", () => {
    const result = runReviewWorkflowFull({
      code: `
        import {
          VerticalNavigation,
          VerticalNavigationItem,
          VerticalNavigationItemLabel,
          VerticalNavigationItemTrigger,
        } from "@salt-ds/core";

        export function DemoNavigation() {
          return (
            <VerticalNavigation aria-label="Main navigation" appearance="indicator">
              <VerticalNavigationItem active>
                <VerticalNavigationItemTrigger>
                  <VerticalNavigationItemLabel>Overview</VerticalNavigationItemLabel>
                </VerticalNavigationItemTrigger>
              </VerticalNavigationItem>
            </VerticalNavigation>
          );
        }
      `,
    });

    expect(result.status).toBe("blocked");
    expect(result.result.decision.status).toBe("needs_attention");
    expect(result.result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "composition.vertical-navigation-item-content",
          severity: "error",
          suggested_fix: expect.stringContaining(
            "Wrap each VerticalNavigationItemTrigger",
          ),
        }),
      ]),
    );
  });

  it("allows the canonical VerticalNavigation compound-component structure", () => {
    const result = runReviewWorkflowFull({
      code: `
        import {
          VerticalNavigation,
          VerticalNavigationItem,
          VerticalNavigationItemContent,
          VerticalNavigationItemLabel,
          VerticalNavigationItemTrigger,
        } from "@salt-ds/core";

        export function DemoNavigation() {
          return (
            <VerticalNavigation aria-label="Main navigation" appearance="indicator">
              <VerticalNavigationItem active>
                <VerticalNavigationItemContent>
                  <VerticalNavigationItemTrigger href="/overview">
                    <VerticalNavigationItemLabel>Overview</VerticalNavigationItemLabel>
                  </VerticalNavigationItemTrigger>
                </VerticalNavigationItemContent>
              </VerticalNavigationItem>
            </VerticalNavigation>
          );
        }
      `,
    });

    expect(result.result.issues).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "composition.nested-interactive-primitives",
        }),
      ]),
    );
  });

  it("still blocks identical interactive primitives nested inside themselves", () => {
    const result = runReviewWorkflowFull({
      code: `
        import { Button } from "@salt-ds/core";

        export function NestedButtons() {
          return (
            <Button>
              <Button>Save</Button>
            </Button>
          );
        }
      `,
    });

    expect(result.result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "composition.nested-interactive-primitives",
        }),
      ]),
    );
  });

  it("allows a Tooltip to describe its interactive trigger", () => {
    const result = runReviewWorkflowFull({
      code: `
        import { Button, Tooltip } from "@salt-ds/core";

        export function HelpAction() {
          return (
            <Tooltip content="Open help">
              <Button>Help</Button>
            </Tooltip>
          );
        }
      `,
    });

    expect(result.result.issues).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "composition.nested-interactive-primitives",
        }),
      ]),
    );
  });

  it("allows NavigationItem to own a navigation target", () => {
    const result = runReviewWorkflowFull({
      code: `
        import { NavigationItem } from "@salt-ds/core";

        export function HeaderNavigation() {
          return <NavigationItem href="/overview">Overview</NavigationItem>;
        }
      `,
    });

    expect(result.result.issues).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "component-choice.navigation" }),
      ]),
    );
  });

  it('flags placeholder href="#" on VerticalNavigationItemTrigger with an actionable fix', () => {
    const result = runReviewWorkflowFull({
      fidelity: "production",
      code: `
        import {
          VerticalNavigation,
          VerticalNavigationItem,
          VerticalNavigationItemContent,
          VerticalNavigationItemLabel,
          VerticalNavigationItemTrigger,
        } from "@salt-ds/core";

        export function DemoNavigation() {
          return (
            <VerticalNavigation aria-label="Main navigation" appearance="indicator">
              <VerticalNavigationItem active>
                <VerticalNavigationItemContent>
                  <VerticalNavigationItemTrigger href="#">
                    <VerticalNavigationItemLabel>Overview</VerticalNavigationItemLabel>
                  </VerticalNavigationItemTrigger>
                </VerticalNavigationItemContent>
              </VerticalNavigationItem>
            </VerticalNavigation>
          );
        }
      `,
    });

    expect(result.status).toBe("blocked");
    expect(result.result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "navigation.fake-href",
          severity: "error",
          suggested_fix: expect.stringContaining("real route"),
          source_urls: expect.arrayContaining([
            "/salt/components/vertical-navigation/usage",
          ]),
        }),
      ]),
    );
    expect(result.artifacts.fix_candidates.candidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          recommendation: expect.stringContaining("real route"),
        }),
      ]),
    );
  });

  it('does not fire the placeholder href="#" production rule for an explicit prototype', () => {
    const result = runReviewWorkflowFull({
      fidelity: "prototype",
      code: `
        import {
          VerticalNavigation,
          VerticalNavigationItem,
          VerticalNavigationItemContent,
          VerticalNavigationItemLabel,
          VerticalNavigationItemTrigger,
        } from "@salt-ds/core";

        export function PrototypeNavigation() {
          return (
            <VerticalNavigation aria-label="Main" appearance="indicator">
              <VerticalNavigationItem>
                <VerticalNavigationItemContent>
                  <VerticalNavigationItemTrigger href="#">
                    <VerticalNavigationItemLabel>Overview</VerticalNavigationItemLabel>
                  </VerticalNavigationItemTrigger>
                </VerticalNavigationItemContent>
              </VerticalNavigationItem>
            </VerticalNavigation>
          );
        }
      `,
    });

    expect(result.result.issues).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "navigation.fake-href" }),
      ]),
    );
    expect(result.artifacts.fix_candidates.candidates).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          recommendation: expect.stringContaining("real route"),
        }),
      ]),
    );
  });

  it("flags deprecated Text variant usage with the source-backed color replacement", () => {
    const result = runReviewWorkflowFull({
      code: `
        import { Text } from "@salt-ds/core";

        export function DemoText() {
          return <Text variant="secondary">Projected revenue</Text>;
        }
      `,
    });

    expect(result.status).toBe("partial");
    expect(result.action).toMatchObject({
      kind: "apply_fixes",
      scope: "grounded_findings",
      authorization: "host_or_user_required",
      post_action: {
        kind: "review",
        tool: "review_salt_ui",
        required_input: ["complete_updated_file"],
      },
    });
    expect(result.guidance.kind).toBe("review");
    if (result.guidance.kind !== "review") return;
    expect(result.guidance.fixes.length).toBeGreaterThan(0);
    expect(
      result.guidance.fixes.every((fix) =>
        fix.source_urls.some((sourceUrl) => sourceUrl.trim().length > 0),
      ),
    ).toBe(true);
    expect(result.action.rule_ids).toEqual([
      ...new Set(
        result.guidance.fixes
          .map((fix) => fix.rule_id?.trim())
          .filter((ruleId): ruleId is string => Boolean(ruleId)),
      ),
    ]);
    expect(result.result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "deprecated.prop.salt-ds-core.variant",
          category: "deprecated",
          severity: "warning",
          suggested_fix: expect.stringContaining("color"),
          evidence_refs: expect.arrayContaining([
            expect.objectContaining({
              source_kind: "registry",
              registry: expect.objectContaining({
                entity_id: "dep.salt-ds-core.text-text.variant.prop.49",
              }),
            }),
          ]),
        }),
      ]),
    );
    expect(result.artifacts.fix_candidates.candidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          recommendation: expect.stringContaining("color"),
        }),
      ]),
    );
  });

  it("keeps single-destination navigation queries on Link instead of pagination or unrelated patterns", () => {
    const routeQuery = "navigate to another route";
    const toolbarQuery = "link to another page from a toolbar action";
    const routeResult = runCreateWorkflowFull({ query: routeQuery });
    const toolbarResult = runCreateWorkflowFull({ query: toolbarQuery });

    expect(routeResult.result).toMatchObject({
      solution_type: "component",
      decision: {
        name: "Link",
      },
    });
    expect(routeResult.artifacts.starter_code?.[0]?.label).toBe("Link starter");
    expect(toolbarResult.result).toMatchObject({
      solution_type: "component",
      decision: {
        name: "Link",
      },
    });
    expect(toolbarResult.artifacts.starter_code?.[0]?.label).toBe(
      "Link starter",
    );
  });

  it("keeps dashboard create output grounded in the analytical dashboard scaffold without unsupported theme bootstrap", () => {
    const query =
      "Finance-themed metric dashboard with key financial metrics like revenue, expenses, profit margin, and portfolio performance";
    const result = runCreateWorkflowFull({ query });

    expect(result.workflow.id).toBe("create_salt_ui");
    expect(result.workflow.readiness.implementation_ready).toEqual(
      expect.any(Boolean),
    );
    expect(result.workflow.implementation_gate).toEqual(
      expect.objectContaining({
        required_follow_through: expect.arrayContaining([
          expect.objectContaining({ entity: "Metric" }),
        ]),
      }),
    );
    expect(
      result.workflow.implementation_gate.required_follow_through.map(
        (item: { entity: string }) => item.entity,
      ),
    ).not.toEqual(
      expect.arrayContaining([
        "Announcement dialog",
        "App header",
        "Border layout",
      ]),
    );
    expect(result.workflow.context_requirement).toMatchObject({
      repo_specific_edits_ready: false,
    });
    expect(result.workflow.project_conventions_check).toMatchObject({
      contract: "project_conventions_v1",
      check_recommended: true,
    });
    expect(result.result).toMatchObject({
      mode: "recommend",
      solution_type: "pattern",
      decision: {
        name: "Analytical dashboard",
      },
      ide_summary: {
        recommended_direction: expect.stringContaining("Analytical dashboard"),
        starter_plan: expect.arrayContaining([expect.any(String)]),
      },
    });
    expect(result.artifacts.starter_code?.[0]?.code).not.toContain(
      "SaltProvider",
    );
    expect(result.artifacts.starter_code?.[0]?.code).not.toContain(
      "@salt-ds/theme/",
    );
    expect(result.artifacts.starter_code?.[0]?.code).not.toContain(
      'accent="teal"',
    );
    expect(result.artifacts.starter_code?.[0]?.code).toContain(
      '<BorderItem position="north" as="header">',
    );
    expect(result.artifacts.starter_code?.[0]?.code).toContain(
      '<BorderItem position="center" as="main">',
    );
    expect(result.artifacts.starter_code?.[0]?.code).toContain(
      '<GridLayout columns={12} gap={3} aria-label="Dashboard modules">',
    );
    expect(result.artifacts.starter_code?.[0]?.code).toContain(
      "Metric subtitle or subvalue",
    );
    expect(result.artifacts.starter_validation).toEqual(
      expect.objectContaining({
        status: expect.stringMatching(/^(clean|needs_attention)$/),
      }),
    );
    expect(result.workflow.readiness.implementation_ready).toBe(
      result.artifacts.starter_validation?.status === "clean",
    );
    expect(result.workflow.provenance).toEqual(
      expect.objectContaining({
        canonical_source_urls: expect.arrayContaining([expect.any(String)]),
        starter_source_urls: expect.any(Array),
        source_urls: expect.arrayContaining([expect.any(String)]),
      }),
    );

    const starterCode = result.artifacts.starter_code?.[0]?.code;
    expect(starterCode).toEqual(expect.any(String));
    const starterReview = runReviewWorkflowFull({ code: starterCode ?? "" });
    expect(starterReview.result.artifact_verification).toMatchObject({
      component_imports: expect.arrayContaining([
        expect.objectContaining({
          imported: "BorderItem",
          resolved_entity: "Border layout",
          resolution: "canonical_example_export",
          status: "verified",
          evidence_refs: expect.arrayContaining([
            expect.objectContaining({
              source_kind: "example",
              claim_kind: "import",
              registry: expect.objectContaining({
                entity_id: expect.any(String),
                field_path: expect.stringMatching(/^examples\..+\.code$/),
              }),
              source: {
                url: expect.any(String),
              },
            }),
          ]),
        }),
        expect.objectContaining({
          imported: "GridItem",
          resolved_entity: "Grid layout",
          resolution: "canonical_example_export",
          status: "verified",
        }),
      ]),
    });
    expect(starterReview.result.issues).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          rule: "salt-component-import-unverified",
        }),
      ]),
    );
  });

  it("keeps paraphrased finance dashboard create prompts on the analytical dashboard pattern", () => {
    const query =
      "Finance-themed metric dashboard with key financial metrics like revenue, expenses, profit margin, and portfolio performance";
    const result = runCreateWorkflowFull({ query });

    expect(result.result).toMatchObject({
      solution_type: "pattern",
      decision: {
        name: "Analytical dashboard",
      },
    });
    expect(result.workflow.implementation_gate).toEqual(
      expect.objectContaining({
        required_follow_through: expect.arrayContaining([
          expect.objectContaining({ entity: "Metric" }),
        ]),
      }),
    );
  });

  it("keeps profile surface prompts anchored on Tabs instead of Avatar decoration", () => {
    const query = "user profile with tabs and avatar";
    const result = runCreateWorkflowFull({ query });

    expect(result.result).toMatchObject({
      solution_type: "component",
      decision: {
        name: "Tabs",
      },
    });
    expect(result.workflow.implementation_gate).toEqual(
      expect.objectContaining({
        required_follow_through: expect.arrayContaining([
          expect.objectContaining({ entity: "Avatar" }),
        ]),
        rule_ids: expect.arrayContaining(["create-follow-through-required"]),
      }),
    );
  });

  it("keeps detailed profile page prompts with tabbed content anchored on Tabs instead of dashboard drift", () => {
    const query =
      "User profile page with tabs for different sections (Overview, Activity, Settings) and an avatar showing the user's initials. The profile header should display the avatar, user name, and role. Tabs switch between content panels below.";
    const result = runCreateWorkflowFull({ query, contextChecked: true });

    expect(result.result).toMatchObject({
      solution_type: "component",
      decision: {
        name: "Tabs",
      },
    });
    expect(result.request).toMatchObject({
      resolved_entity: "Tabs",
    });
    expect(
      result.workflow.implementation_gate.required_follow_through.map(
        (item: { entity: string }) => item.entity,
      ),
    ).not.toEqual(
      expect.arrayContaining([
        "Analytical dashboard",
        "Border layout",
        "Panel",
        "Switch",
      ]),
    );
  });

  it("keeps tabbed-sections profile prompts anchored on Tabs instead of decoration or navigation drift", () => {
    const query =
      "User profile page with tabbed sections showing personal info, settings, and activity. Includes an avatar displaying the user's initials or profile image at the top.";
    const result = runCreateWorkflowFull({ query, contextChecked: true });

    expect(result.result).toMatchObject({
      solution_type: "component",
      decision: {
        name: "Tabs",
      },
    });
    expect(result.request).toMatchObject({
      entity: query,
      resolved_entity: "Tabs",
    });
    expect(result.safety.blocking_reasons).not.toEqual(
      expect.arrayContaining([
        expect.stringContaining("Vertical navigation"),
        expect.stringContaining("Navigation"),
      ]),
    );
  });

  it("keeps toggle-in-form prompts anchored on Switch instead of broad Forms patterns", () => {
    const query =
      "compact control to turn email alerts on and off inside a settings form";
    const result = runCreateWorkflowFull({
      query,
      contextChecked: true,
    });

    expect(result.result).toMatchObject({
      solution_type: "component",
      decision: {
        name: "Switch",
      },
    });
    expect(result.request).toMatchObject({
      entity: query,
      resolved_entity: "Switch",
    });
    expect(
      result.workflow.implementation_gate.required_follow_through.map(
        (item: { entity: string }) => item.entity,
      ),
    ).not.toEqual(
      expect.arrayContaining([
        "International address form",
        "Button bar",
        "Menu button",
        "Split button",
      ]),
    );
  });

  it("keeps singular KPI summary prompts anchored on Metric instead of dashboard or chart drift", () => {
    const query =
      "Create a summary view showing a single KPI, its label, and an up or down indicator.";
    const result = runCreateWorkflowFull({
      query,
      contextChecked: true,
    });

    expect(result.result).toMatchObject({
      solution_type: "pattern",
      decision: {
        name: "Metric",
      },
    });
    expect(result.request).toMatchObject({
      entity: query,
      resolved_entity: "Metric",
    });
    expect(
      result.workflow.implementation_gate.required_follow_through.map(
        (item: { entity: string }) => item.entity,
      ),
    ).toEqual([]);
    expect(result.workflow.implementation_gate).toEqual(
      expect.objectContaining({
        required_follow_through: [],
      }),
    );
  });

  it("keeps content-region state prompts anchored on Content status instead of Spinner aliases", () => {
    const query =
      "Create a loading, empty, or error state inside the current content region, not as a global page state.";
    const result = runCreateWorkflowFull({
      query,
      contextChecked: true,
    });

    expect(result.result).toMatchObject({
      solution_type: "pattern",
      decision: {
        name: "Content status",
      },
    });
    expect(result.request).toMatchObject({
      entity: query,
      resolved_entity: "Content status",
    });
    expect(result.safety.blocking_reasons).not.toEqual(
      expect.arrayContaining([expect.stringContaining("Spinner")]),
    );
  });

  it("keeps explicit sidebar hierarchy prompts anchored on Vertical navigation instead of generic suggested sets", () => {
    const query =
      "Create a page with a left sidebar containing grouped, nested navigation items for multiple sections.";
    const result = runCreateWorkflowFull({
      query,
      contextChecked: true,
    });

    expect(result.result).toMatchObject({
      solution_type: "pattern",
      decision: {
        name: "Vertical navigation",
      },
    });
    expect(result.request).toMatchObject({
      entity: query,
      resolved_entity: "Vertical navigation",
    });
  });

  it("keeps host-rewritten Metric component prompts anchored on exact Metric without unrelated follow-through", () => {
    const query =
      "Create a Metric component to display a key value with a label, indicator and direction";
    const result = runCreateWorkflowFull({ query, contextChecked: true });

    expect(result.request).toMatchObject({
      entity: "Metric",
      resolved_entity: "Metric",
      match_status: "exact",
      exact_match_required: true,
    });
    expect(result.safety).toMatchObject({
      canonical_complete: true,
      exact_request_safe: true,
      blocking_reasons: [],
    });
    expect(result.action).toMatchObject({
      kind: "implement",
      post_action: {
        kind: "review",
        required_input: ["complete_updated_file"],
      },
    });
    expect(result.workflow.implementation_gate).toEqual(
      expect.objectContaining({
        required_follow_through: [],
        rule_ids: [],
      }),
    );
    expect(
      result.result.composition_contract?.expected_components ?? [],
    ).toEqual([]);
  });

  it("keeps multiple named surfaces on exact follow-through for breadcrumbs plus table prompts", () => {
    const query = "file manager with breadcrumbs and table";
    const result = runCreateWorkflowFull({ query });

    expect(result.result).toMatchObject({
      solution_type: "component",
      decision: {
        name: "Breadcrumbs",
      },
    });
    expect(result.workflow.implementation_gate).toEqual(
      expect.objectContaining({
        required_follow_through: expect.arrayContaining([
          expect.objectContaining({ entity: "Table" }),
        ]),
        rule_ids: ["create-follow-through-required"],
      }),
    );
  });

  it("falls back to component routing when a pattern hint conflicts with an explicitly named Table", () => {
    const query =
      "file manager with breadcrumbs navigation and a data table showing files and folders";
    const result = runCreateWorkflowFull({ query, solutionType: "pattern" });

    expect(result.result).toMatchObject({
      solution_type: "component",
      decision: {
        name: "Table",
      },
    });
    expect(result.workflow.implementation_gate).toEqual(
      expect.objectContaining({
        required_follow_through: expect.arrayContaining([
          expect.objectContaining({ entity: "Breadcrumbs" }),
        ]),
      }),
    );
  });

  it("keeps realistic file-browser path trail prompts anchored on Table with Breadcrumbs follow-through", () => {
    const query =
      "Create a file browser with a path trail above a table of files and folders.";
    const result = runCreateWorkflowFull({ query, contextChecked: true });

    expect(result.result).toMatchObject({
      solution_type: "component",
      decision: {
        name: "Table",
      },
    });
    expect(result.workflow.implementation_gate).toEqual(
      expect.objectContaining({
        required_follow_through: expect.arrayContaining([
          expect.objectContaining({ entity: "Breadcrumbs" }),
        ]),
      }),
    );
  });

  it("requires a candidate-specific pattern anchor before applying structural intent", () => {
    const query =
      "Build a Salt app shell with a left VerticalNavigation, a page header, and a main content region.";
    const result = runCreateWorkflowFull({ query, contextChecked: true });

    expect(result.result).toMatchObject({
      solution_type: "pattern",
      decision: {
        name: "App header",
      },
    });
    expect(result.result.decision.name).not.toBe("Analytical dashboard");
    expect(
      result.workflow.implementation_gate.required_follow_through.map(
        (item: { entity: string }) => item.entity,
      ),
    ).not.toContain("Metric");
    expect(result.workflow.implementation_gate.blocking_questions).toEqual([]);
    expect(result.action.kind).not.toBe("ask_user");
  });

  it("does not treat generic workflow wording as evidence for a heavier settings pattern", () => {
    const query =
      "Build a Salt settings workflow with form controls, save actions, and a compact list of notification preferences.";
    const result = runCreateWorkflowFull({ query, contextChecked: true });
    const requiredFollowThrough =
      result.workflow.implementation_gate.required_follow_through.map(
        (item: { entity: string }) => item.entity,
      );

    expect(result.result).toMatchObject({
      solution_type: "pattern",
      decision: {
        name: "Forms",
      },
    });
    expect(requiredFollowThrough).not.toEqual(
      expect.arrayContaining([
        "Content status",
        "Formatted input",
        "International address form",
        "Navigation",
        "Vertical navigation",
      ]),
    );
  });

  it("keeps strong structural dashboard prompts on the pattern path even when pattern is forced", () => {
    const query = "chart dashboard with filters and summary";
    const result = runCreateWorkflowFull({ query, solutionType: "pattern" });

    expect(result.result).toMatchObject({
      solution_type: "pattern",
      decision: {
        name: "Analytical dashboard",
      },
    });
  });

  it("keeps dashboard follow-through focused on the explicit chart region instead of generic header drift", () => {
    const query = "chart dashboard with filters and summary";
    const result = runCreateWorkflowFull({ query });

    expect(result.result).toMatchObject({
      solution_type: "pattern",
      decision: {
        name: "Analytical dashboard",
      },
    });
    expect(
      result.workflow.implementation_gate.required_follow_through.map(
        (item: { entity: string }) => item.entity,
      ),
    ).toEqual(expect.arrayContaining(["Chart"]));
    expect(
      result.workflow.implementation_gate.required_follow_through.map(
        (item: { entity: string }) => item.entity,
      ),
    ).not.toEqual(
      expect.arrayContaining(["App header", "Header block", "Border layout"]),
    );
    expect(result.workflow.implementation_gate).toEqual(
      expect.objectContaining({
        rule_ids: ["create-follow-through-required"],
      }),
    );
  });

  it("keeps large metric create output grounded in the metric pattern anatomy", () => {
    const query = "create a large metric";
    const result = runCreateWorkflowFull({ query });

    expect(result.workflow.readiness).toMatchObject({
      implementation_ready: expect.any(Boolean),
    });
    expect(result.result).toMatchObject({
      solution_type: "pattern",
      decision: {
        name: "Metric",
      },
    });
    expect(result.artifacts.starter_code?.[0]?.code).toContain("Metric title");
    expect(result.artifacts.starter_code?.[0]?.code).toContain("Display1");
    expect(result.artifacts.starter_code?.[0]?.code).toContain("StackLayout");
    expect(result.artifacts.starter_validation).toEqual(
      expect.objectContaining({
        status: expect.stringMatching(/^(clean|needs_attention)$/),
      }),
    );
  });

  it("keeps narrow single-metric prompts on the metric pattern", () => {
    const query = "Create a metric card for revenue with a trend indicator";
    const result = runCreateWorkflowFull({ query });

    expect(result.result).toMatchObject({
      solution_type: "pattern",
      decision: {
        name: "Metric",
      },
    });
  });

  it("treats starter-code opt-out as planning-only output instead of implementation-ready guidance", () => {
    const query = "link to another page from a toolbar action";
    const result = runCreateWorkflowFull({
      query,
      includeStarterCode: false,
    });

    expect(result.workflow.readiness).toEqual(
      expect.objectContaining({
        implementation_ready: false,
      }),
    );
    expect(result.artifacts.starter_code).toBeUndefined();
    expect(result.artifacts.starter_validation).toBeNull();
  });

  it("flags invented canonical-looking tokens and hard-coded colors in review output", () => {
    const result = runReviewWorkflowFull({
      code: `
          import { Button } from "@salt-ds/core";

          export function Demo() {
            return (
              <Button
                style={{
                  borderColor: "var(--salt-container-borderColor)",
                  color: "#ff0000",
                }}
              >
                Save
              </Button>
            );
          }
        `,
    });

    expect(result.workflow.id).toBe("review_salt_ui");
    expect(result.result.decision).toMatchObject({
      status: "needs_attention",
    });
    expect(result.result.ide_summary).toMatchObject({
      safest_next_fix: expect.any(String),
    });
    expect(result.result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "tokens.unknown-salt-token",
          canonical_source: null,
        }),
        expect.objectContaining({
          id: "tokens.hardcoded-color",
        }),
      ]),
    );
    expect(result.workflow.provenance.canonical_source_urls).toContain(
      "/salt/themes/design-tokens/index",
    );
    expect(result.artifacts.rule_ids).toEqual(
      expect.arrayContaining(["review-canonical-mismatch"]),
    );
  });

  it("flags transcript-shaped dashboard drift from source-backed expected pattern and component evidence", () => {
    const code = `
      import { Card, StackLayout, Text } from "@salt-ds/core";

      interface MetricCardProps {
        label: string;
        value: string;
      }

      export function MetricCard({ label, value }: MetricCardProps) {
        return (
          <Card className="metricCard">
            <StackLayout gap={1}>
              <Text styleAs="label">{label}</Text>
              <Text styleAs="h3">{value}</Text>
            </StackLayout>
          </Card>
        );
      }

      export function TransactionsTable() {
        return (
          <table>
            <thead>
              <tr>
                <th>Trade</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Buy</td>
                <td>Settled</td>
              </tr>
            </tbody>
          </table>
        );
      }
    `;

    const result = runReviewWorkflowFull({
      code,
      expectedTargets: {
        components: ["Data grid", "Table"],
        patterns: ["Metric"],
        composition_contract: {
          primary_target: {
            solution_type: "pattern",
            name: "Analytical dashboard",
          },
          expected_patterns: ["Metric"],
          expected_components: ["Data grid", "Table"],
          slots: [
            {
              id: "key-metrics",
              label: "Key metrics",
              certainty: "strongly_implied",
              preferred_patterns: ["Metric"],
              preferred_components: [],
              reason: "Metrics were explicitly requested.",
              source_urls: ["/salt/patterns/metric"],
              notes: [],
            },
            {
              id: "main-body",
              label: "Main body",
              certainty: "confirmation_needed",
              preferred_patterns: [],
              preferred_components: ["Data grid", "Table"],
              reason: "A tabular data surface was explicitly requested.",
              source_urls: [
                "/salt/components/table",
                "/salt/components/ag-grid-theme",
              ],
              notes: [],
            },
          ],
          avoid: [],
          source_urls: ["/salt/patterns/analytical-dashboard"],
        },
        source: "create_report",
      },
    });

    expect(result.result.decision).toMatchObject({
      status: "needs_attention",
    });
    expect(result.result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.stringMatching(/^workflow-expected\.pattern-missing-/),
          evidence_refs: expect.arrayContaining([
            expect.objectContaining({
              source_kind: "workflow_input",
              claim_kind: "workflow",
            }),
            expect.objectContaining({
              source_kind: "registry",
              claim_kind: "pattern",
              registry: expect.objectContaining({
                entity_type: "pattern",
              }),
            }),
          ]),
        }),
        expect.objectContaining({
          id: "workflow-expected.missing-component.mainbody",
          rule: "workflow-expected-component-not-imported",
          evidence_refs: expect.arrayContaining([
            expect.objectContaining({
              source_kind: "workflow_input",
              claim_kind: "workflow",
            }),
            expect.objectContaining({
              source_kind: "registry",
              claim_kind: "component",
              registry: expect.objectContaining({
                entity_type: "component",
                field_path: "name",
              }),
            }),
          ]),
        }),
        expect.objectContaining({
          id: "primitive-choice.native-table",
        }),
      ]),
    );
    expect(result.result.missing_data ?? []).not.toEqual(
      expect.arrayContaining([
        expect.stringContaining("source-backed rule kinds"),
      ]),
    );
    expect(result.result.unsupported_rule_kinds.length).toBeGreaterThan(0);
    expect(result.artifacts.rule_ids).toEqual(
      expect.arrayContaining(["review-canonical-mismatch"]),
    );
  });

  it("adds project-policy review guidance when repo wrappers or token aliases should refine the fix plan", () => {
    const projectPolicy = buildWorkflowProjectPolicyArtifact({
      policyMode: "team",
      declared: true,
      sharedPacks: [],
      approvedWrappers: ["AppLink"],
      approvedWrapperDetails: [
        {
          name: "AppLink",
          wraps: "Link",
          reason: "Route links must use the repo wrapper.",
          import: {
            from: "@/navigation/AppLink",
            name: "AppLink",
          },
          sourceUrls: ["./docs/router-policy.md"],
        },
      ],
      warnings: [],
      themeDefaults: {
        provider: "BrandShellProvider",
        providerImport: {
          from: "@/theme/BrandShellProvider",
          name: "BrandShellProvider",
        },
        imports: ["@/theme/brand-shell.css"],
        props: [{ name: "density", value: "high" }],
        reason: "Use the repo theme shell.",
        sourceUrls: ["./docs/theme-policy.md"],
      },
      tokenAliases: [
        {
          saltName: "--salt-container-primary-borderColor",
          prefer: "--markets-border-default",
          reason: "Container borders route through the repo alias.",
          sourceUrls: ["./docs/token-policy.md"],
        },
      ],
      tokenFamilyPolicies: [
        {
          family: "container",
          mode: "prefer-local-aliases",
          reason: "Container tokens should prefer repo aliases.",
          sourceUrls: ["./docs/token-policy.md"],
        },
      ],
    });
    const code = `
      import { Link, SaltProviderNext } from "@salt-ds/core";
      import "@salt-ds/theme/index.css";
      import "@salt-ds/theme/css/theme-next.css";

      export function Demo() {
        return (
          <SaltProviderNext>
            <Link href="/next" style={{ borderColor: "var(--salt-container-primary-borderColor)" }}>
              Next
            </Link>
          </SaltProviderNext>
        );
      }
    `;
    const result = runReviewWorkflowFull({
      code,
      projectPolicy,
    });

    expect(result.artifacts.fix_candidates.candidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          rule_id: "review-project-policy-wrapper",
          recommendation: expect.stringContaining(
            'import { AppLink } from "@/navigation/AppLink";',
          ),
        }),
        expect.objectContaining({
          rule_id: "review-project-policy-theme-default",
          recommendation: expect.stringContaining(
            'import { BrandShellProvider } from "@/theme/BrandShellProvider";',
          ),
        }),
        expect.objectContaining({
          rule_id: "review-project-policy-token-alias",
        }),
      ]),
    );
    expect(result.result.decision).toEqual(
      expect.objectContaining({
        status: "needs_attention",
        why: expect.stringContaining("repo policy"),
      }),
    );
  });

  it("flags repo theme drift when the repo provider is already present but required imports or props are missing", () => {
    const projectPolicy = buildWorkflowProjectPolicyArtifact({
      policyMode: "team",
      declared: true,
      sharedPacks: [],
      approvedWrappers: [],
      warnings: [],
      themeDefaults: {
        provider: "BrandShellProvider",
        providerImport: {
          from: "@/theme/BrandShellProvider",
          name: "BrandShellProvider",
        },
        imports: ["@/theme/brand-shell.css"],
        props: [{ name: "density", value: "high" }],
        reason: "Use the repo theme shell.",
        sourceUrls: ["./docs/theme-policy.md"],
      },
    });
    const code = `
      import { Link } from "@salt-ds/core";
      import { BrandShellProvider } from "@/theme/BrandShellProvider";

      export function Demo() {
        return (
          <BrandShellProvider>
            <Link href="/next">Next</Link>
          </BrandShellProvider>
        );
      }
    `;
    const result = runReviewWorkflowFull({
      code,
      projectPolicy,
    });

    expect(result.artifacts.fix_candidates.candidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          rule_id: "review-project-policy-theme-default",
          recommendation: expect.stringContaining("@/theme/brand-shell.css"),
          reason: expect.stringContaining('density="high"'),
        }),
      ]),
    );
    expect(result.result.decision).toEqual(
      expect.objectContaining({
        status: "needs_attention",
        why: expect.stringContaining("repo policy"),
      }),
    );
  });

  it("flags legacy SaltProvider bootstrap only when repo policy requires Theme Next", () => {
    const projectPolicy = buildWorkflowProjectPolicyArtifact({
      policyMode: "team",
      declared: true,
      sharedPacks: [],
      approvedWrappers: [],
      warnings: [],
      themeDefaults: {
        provider: "SaltProviderNext",
        imports: [
          "@salt-ds/theme/index.css",
          "@salt-ds/theme/css/theme-next.css",
        ],
        props: [],
        reason: "This repo has adopted Theme Next.",
        sourceUrls: ["./docs/theme-policy.md"],
      },
    });
    const code = `
      import { SaltProvider, Text } from "@salt-ds/core";
      import "@salt-ds/theme/index.css";

      export function Demo() {
        return (
          <SaltProvider>
            <Text>Theme-aware content</Text>
          </SaltProvider>
        );
      }
    `;

    const withoutPolicy = runReviewWorkflowFull({ code });
    expect(withoutPolicy.artifacts.fix_candidates.candidates).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          rule_id: "review-project-policy-theme-default",
        }),
      ]),
    );

    const withPolicy = runReviewWorkflowFull({ code, projectPolicy });
    expect(withPolicy.artifacts.fix_candidates.candidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          rule_id: "review-project-policy-theme-default",
          recommendation: expect.stringMatching(
            /SaltProviderNext[\s\S]*theme-next\.css/,
          ),
          source_urls: expect.arrayContaining(["./docs/theme-policy.md"]),
        }),
      ]),
    );
    expect(withPolicy.result.decision).toEqual(
      expect.objectContaining({
        status: "needs_attention",
        why: expect.stringContaining("repo policy"),
      }),
    );
  });

  it("keeps canonical CSS starter code unchanged and annotates token aliases", () => {
    const projectPolicy = buildWorkflowProjectPolicyArtifact({
      policyMode: "team",
      declared: true,
      sharedPacks: [],
      approvedWrappers: [],
      warnings: [],
      themeDefaults: {
        provider: "SaltProviderNext",
        imports: ["@salt-ds/theme/index.css"],
        props: [{ name: "accent", value: "teal" }],
        reason: "Repo bootstrap.",
        sourceUrls: ["./docs/theme-policy.md"],
      },
      tokenAliases: [
        {
          saltName: "--salt-content-primary-foreground",
          prefer: "--brand-text-primary",
          reason: "Use the repo alias.",
          sourceUrls: ["./docs/token-policy.md"],
        },
      ],
    });

    const snippets = applyProjectPolicyToStarterCodeSnippets(
      [
        {
          label: "Spacing starter",
          language: "css",
          code: [
            ".panel {",
            "  color: var(--salt-content-primary-foreground);",
            "}",
          ].join("\n"),
        },
      ],
      projectPolicy,
    );

    expect(snippets?.[0]?.code).toContain(
      "var(--salt-content-primary-foreground)",
    );
    expect(snippets?.[0]?.code).not.toContain("var(--brand-text-primary)");
    expect(snippets?.[0]?.notes).toEqual(
      expect.arrayContaining([
        expect.stringContaining("intentionally unchanged"),
        expect.stringContaining(
          "Replace canonical token --salt-content-primary-foreground with repo alias --brand-text-primary",
        ),
      ]),
    );
  });

  it("keeps canonical wrapper starter code unchanged and annotates the repo adaptation", () => {
    const projectPolicy = buildWorkflowProjectPolicyArtifact({
      policyMode: "team",
      declared: true,
      sharedPacks: [],
      approvedWrappers: ["AppButton"],
      approvedWrapperDetails: [
        {
          name: "AppButton",
          wraps: "Button",
          reason: "Use the repo action wrapper.",
          import: {
            from: "@/components/AppButton",
            name: "AppButton",
          },
        },
      ],
      warnings: [],
    });

    const canonicalCode = [
      "import {",
      "  Button,",
      "  StackLayout,",
      "  Text,",
      "  type ButtonProps,",
      '} from "@salt-ds/core";',
      "",
      "export function Example() {",
      "  return <StackLayout><Text>Ready</Text><Button>Save</Button></StackLayout>;",
      "}",
    ].join("\n");
    const snippets = applyProjectPolicyToStarterCodeSnippets(
      [
        {
          label: "Multiline starter",
          language: "tsx",
          code: canonicalCode,
        },
      ],
      projectPolicy,
    );
    expect(snippets?.[0]?.code).toBe(canonicalCode);
    expect(snippets?.[0]?.notes).toEqual(
      expect.arrayContaining([
        expect.stringContaining("intentionally unchanged"),
        expect.stringContaining(
          "Replace canonical Button with the repo-approved AppButton",
        ),
        expect.stringContaining(
          'import { AppButton } from "@/components/AppButton";',
        ),
      ]),
    );
  });

  it("does not suggest wrapper adaptation for aliased or type-only target imports", () => {
    const projectPolicy = buildWorkflowProjectPolicyArtifact({
      policyMode: "team",
      declared: true,
      sharedPacks: [],
      approvedWrappers: ["AppButton"],
      approvedWrapperDetails: [
        {
          name: "AppButton",
          wraps: "Button",
          reason: "Use the repo action wrapper.",
          import: {
            from: "@/components/AppButton",
            name: "AppButton",
          },
        },
      ],
      warnings: [],
    });
    const aliasedCode = [
      'import { Button as SaltButton, StackLayout } from "@salt-ds/core";',
      "",
      "export function Example() {",
      "  return <StackLayout><SaltButton>Save</SaltButton></StackLayout>;",
      "}",
    ].join("\n");
    const typeOnlyCode = [
      'import type { Button } from "@salt-ds/core";',
      "",
      "export type ButtonConstructor = typeof Button;",
    ].join("\n");

    for (const code of [aliasedCode, typeOnlyCode]) {
      const snippets = applyProjectPolicyToStarterCodeSnippets(
        [{ label: "Unsupported rewrite", language: "tsx", code }],
        projectPolicy,
      );

      expect(snippets?.[0]?.code).toBe(code);
      expect(snippets?.[0]?.notes ?? []).not.toEqual(
        expect.arrayContaining([
          expect.stringContaining("repo-approved AppButton"),
        ]),
      );
    }
  });

  it("downgrades create readiness when repo theme policy lacks an exact provider import", () => {
    const projectPolicy = buildWorkflowProjectPolicyArtifact({
      policyMode: "team",
      declared: true,
      sharedPacks: [],
      approvedWrappers: [],
      warnings: [],
      themeDefaults: {
        provider: "BrandShellProvider",
        imports: ["@/theme/brand-shell.css"],
        props: [{ name: "density", value: "high" }],
        reason: "Use the repo shell.",
        sourceUrls: ["./docs/theme-policy.md"],
      },
    });

    const result = runCreateWorkflowFull({
      query: "navigate to another route",
      projectPolicy,
      contextChecked: true,
    });

    expect(result.workflow.readiness).toEqual(
      expect.objectContaining({
        implementation_ready: false,
        reason: expect.stringContaining("provider_import"),
      }),
    );
    expect(result.artifacts.project_policy?.warnings).toEqual(
      expect.arrayContaining([expect.stringContaining("provider_import")]),
    );
  });

  it("keeps migrate output in the validated workflow envelope with explicit verification artifacts", () => {
    const sourceOutline = {
      regions: ["header", "sidebar", "main content", "dialog footer"],
      actions: ["primary action with secondary menu", "navigation link"],
      states: ["loading", "validation"],
      notes: ["This screen has a confirmation dialog."],
    };
    const result = runMigrateWorkflowFull({
      sourceOutline,
    });

    expect(result.workflow).toMatchObject({
      id: "migrate_to_salt",
      readiness: {
        implementation_ready: false,
      },
      context_requirement: {
        repo_specific_edits_ready: false,
      },
    });
    expect(result.artifacts.starter_validation).toEqual(
      expect.objectContaining({
        status: "clean",
      }),
    );
    expect(result.artifacts.post_migration_verification).toEqual(
      expect.objectContaining({
        suggested_workflow: "review_salt_ui",
      }),
    );
    expect(result.artifacts.visual_evidence_contract).toEqual(
      expect.objectContaining({
        source_outline_provided: true,
        derived_outline_available: true,
      }),
    );
    expect(result.result.translations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source_kind: "split-action",
        }),
      ]),
    );
    expect(result.result.ide_summary).toMatchObject({
      first_scaffold: expect.arrayContaining([expect.any(String)]),
    });
  });

  it("keeps the canonical Salt choice visible when project conventions override the final repo answer", () => {
    const workflow = runCreateWorkflowFull({
      query: "link to another page from a toolbar action",
    });
    const linkEntity = getSaltEntity(registry, {
      entity_type: "component",
      name: "Link",
    });
    const guidanceBoundary = linkEntity.guidance_boundary;
    if (!guidanceBoundary) {
      throw new Error("Expected Link entity guidance boundary");
    }
    const merged = mergeCanonicalAndProjectConventionLayers(
      {
        decision: {
          name:
            typeof linkEntity.entity?.name === "string"
              ? linkEntity.entity.name
              : "Link",
          why: linkEntity.decision.why,
        },
        guidance_boundary: guidanceBoundary,
      },
      [
        {
          id: "team-navigation",
          scope: "team",
          source: "./.salt/team.json",
          conventions: {
            preferred_components: [
              {
                salt_name: "Link",
                prefer: "AppLink",
                reason:
                  "The repo wraps navigation links for analytics and route helpers.",
                docs: ["/repo/navigation/app-link"],
              },
            ],
          },
        },
      ],
    );

    expect(workflow.workflow.project_conventions_check).toMatchObject({
      check_recommended: true,
    });
    expect(merged).toMatchObject({
      canonical_choice: {
        source: "canonical_salt",
        name: "Link",
      },
      project_conventions: {
        consulted: true,
        check_recommended: true,
        applied: true,
        layers_consulted: [
          {
            id: "team-navigation",
            scope: "team",
            source: "./.salt/team.json",
          },
        ],
        applied_rule: {
          type: "preferred-component",
          replacement: "AppLink",
        },
      },
      final_choice: {
        name: "AppLink",
        source: "project_conventions",
        changed: true,
        based_on: "Link",
        import: null,
      },
      merge_reason: "preferred-component",
    });
  });

  it("returns a composition contract and open questions for broad dashboard prompts", () => {
    const query =
      "create a finance metric dashboard with KPI cards, sparklines, and a data grid table";
    const result = runCreateWorkflowFull({ query });

    expect(result.result).toMatchObject({
      decision: {
        name: "Analytical dashboard",
      },
      ide_summary: {
        starter_plan: expect.arrayContaining([
          "Before coding named sub-surfaces, run Salt follow-up grounding for the unresolved composition-contract items first.",
        ]),
      },
      composition_contract: {
        primary_target: {
          solution_type: "pattern",
          name: "Analytical dashboard",
        },
        expected_patterns: expect.arrayContaining(["Metric"]),
        expected_components: expect.arrayContaining(["Data grid", "Table"]),
        slots: expect.arrayContaining([
          expect.objectContaining({
            id: "key-metrics",
            certainty: "strongly_implied",
            preferred_patterns: expect.arrayContaining(["Metric"]),
          }),
          expect.objectContaining({
            id: "main-body",
            certainty: "confirmation_needed",
            preferred_components: expect.arrayContaining([
              "Data grid",
              "Table",
            ]),
          }),
        ]),
      },
      open_questions: expect.arrayContaining([
        expect.objectContaining({
          kind: "component-choice",
          topic: "tabular-data",
          choices: ["Data grid", "Table"],
        }),
      ]),
    });
    expect(result.workflow.implementation_gate).toEqual(
      expect.objectContaining({
        required_follow_through: expect.arrayContaining([
          expect.objectContaining({ entity: "Metric" }),
        ]),
      }),
    );
  });
});

/**
 * Tool-selection benchmark (Phase 0 task 0.10 / M15 / F8).
 *
 * Hosts (VS Code Copilot, Claude Code, Cursor, Codex, Windsurf, Copilot CLI…)
 * pick MCP tools by reading the tool's `name`, `description`, and
 * `annotations`. When that lexical signal is weak, the host falls back to
 * broader retrieval — `tool_search` in the captured 9-turn trace (turn 0,
 * see `session-findings-2026-06.md` root cause #7) — adding a round-trip
 * before useful work happens.
 *
 * This suite asserts the deterministic ranker — which scores tools using
 * only the public name/description/annotations surface that hosts actually
 * see over the wire — picks the correct Salt tool first for each of 20
 * representative consumer prompts. When a prompt fails, the right fix is to
 * strengthen the losing tool's description (or, in some cases, narrow the
 * winning tool's description) — not to rename tools.
 */

interface ToolSelectionFixture {
  prompt: string;
  expected: string;
  /** Coarse intent label for grouping the audit output. */
  intent:
    | "create"
    | "review"
    | "migrate"
    | "info"
    | "entity-lookup"
    | "pattern-lookup";
}

const TOOL_SELECTION_CORPUS: readonly ToolSelectionFixture[] = [
  // create (4) — the primary front door for new Salt UI.
  {
    prompt:
      "Create a Salt UI dashboard with KPI metrics, a data grid, and a header.",
    expected: "create_salt_ui",
    intent: "create",
  },
  {
    prompt:
      "I need to build a new Salt login form with email, password, and a submit button.",
    expected: "create_salt_ui",
    intent: "create",
  },
  {
    prompt:
      "Generate a Salt toolbar with a primary action and an overflow menu.",
    expected: "create_salt_ui",
    intent: "create",
  },
  {
    prompt: "Compare Salt Button and SplitButton side by side for a toolbar.",
    expected: "get_salt_reference",
    intent: "entity-lookup",
  },

  // review (3) — analyse existing code for Salt conformance.
  {
    prompt:
      "Review my Salt React component for design-system violations and deprecated APIs.",
    expected: "review_salt_ui",
    intent: "review",
  },
  {
    prompt:
      "Check this existing Salt code for misuse of deprecated props and suggest fixes.",
    expected: "review_salt_ui",
    intent: "review",
  },
  {
    prompt:
      "Analyse my existing React UI against Salt rules and surface any violations.",
    expected: "review_salt_ui",
    intent: "review",
  },

  // migrate (3) — translate non-Salt input into Salt.
  {
    prompt: "Migrate my Material UI form layout to Salt components.",
    expected: "migrate_to_salt",
    intent: "migrate",
  },
  {
    prompt: "Convert this Chakra UI dashboard mockup into a Salt screen.",
    expected: "migrate_to_salt",
    intent: "migrate",
  },
  {
    prompt:
      "Translate this screen outline of header, sidebar, and main content into Salt primitives.",
    expected: "migrate_to_salt",
    intent: "migrate",
  },

  // version-risk review (2) — version-to-version Salt checks use review_salt_ui in v1.
  {
    prompt:
      "Review this existing Salt toolbar feature for breaking-change risk between version 1.20 and 1.30.",
    expected: "review_salt_ui",
    intent: "review",
  },
  {
    prompt:
      "Review this Salt feature for version-risk and deprecation concerns between 1.40 and the current target version.",
    expected: "review_salt_ui",
    intent: "review",
  },

  // info (2) — repo-level setup and inspection.
  {
    prompt:
      "Inspect whether this project has Salt policy and repo instructions before setup work.",
    expected: "get_salt_project_context",
    intent: "info",
  },
  {
    prompt:
      "Inspect this repo's Salt project context: framework, workspace, declared policy, Salt packages.",
    expected: "get_salt_project_context",
    intent: "info",
  },

  // entity-lookup (3) — resolve a specific named Salt entity.
  {
    prompt: "Look up the Salt FormField component details and props.",
    expected: "get_salt_reference",
    intent: "entity-lookup",
  },
  {
    prompt:
      "Resolve the Salt Avatar component: I already know the exact entity name I need.",
    expected: "get_salt_reference",
    intent: "entity-lookup",
  },
  {
    prompt:
      "Get the canonical Salt SaltProviderNext entity record including its prop schema.",
    expected: "get_salt_reference",
    intent: "entity-lookup",
  },

  // pattern-lookup / examples (3) — grounding evidence before writing code.
  {
    prompt:
      "Show me canonical Salt code examples for the Card component before I implement it.",
    expected: "get_salt_reference",
    intent: "pattern-lookup",
  },
  {
    prompt:
      "Fetch sample implementation code for the Salt Analytical dashboard pattern.",
    expected: "get_salt_reference",
    intent: "pattern-lookup",
  },
  {
    prompt:
      "Give me canonical example snippets for the Salt Metric pattern so I can ground the starter code.",
    expected: "get_salt_reference",
    intent: "pattern-lookup",
  },
];

describe("tool-selection benchmark (Phase 0 task 0.10 / F8)", () => {
  const ranker = createToolSelectionRanker(TOOL_DEFINITIONS);

  it("covers at least 20 representative consumer prompts across every public Salt intent", () => {
    expect(TOOL_SELECTION_CORPUS.length).toBeGreaterThanOrEqual(20);

    const expectedIntents = new Set([
      "create",
      "review",
      "migrate",
      "info",
      "entity-lookup",
      "pattern-lookup",
    ]);
    const seenIntents = new Set(
      TOOL_SELECTION_CORPUS.map((fixture) => fixture.intent),
    );
    expect(seenIntents).toEqual(expectedIntents);

    // Every expected tool in the corpus must be a registered, default-exposed
    // MCP tool. Catches typos in the fixture list and protects the benchmark
    // from silently drifting if a tool is removed.
    const registeredToolNames = new Set(
      TOOL_DEFINITIONS.map((definition) => definition.name),
    );
    for (const fixture of TOOL_SELECTION_CORPUS) {
      expect(registeredToolNames.has(fixture.expected)).toBe(true);
    }
  });

  it.each(
    TOOL_SELECTION_CORPUS,
  )("ranks $expected first for $intent prompt: $prompt", ({
    prompt,
    expected,
  }) => {
    const ranking = ranker.rank(prompt);
    const top = ranking[0];
    const second = ranking[1];

    if (!top || top.tool !== expected) {
      // Surface a diagnostic that names the losing tool, the prompt
      // tokens that hit, and the top-3 score breakdown — so the maintainer
      // can see exactly which description needs strengthening.
      const top3 = ranking
        .slice(0, 3)
        .map(
          (entry) =>
            `${entry.tool} (score=${entry.score.toFixed(3)}, name=[${entry.breakdown.nameHits.join(",")}], desc=[${entry.breakdown.descriptionHits.join(",")}], annoBias=${entry.breakdown.annotationBias.toFixed(2)})`,
        )
        .join("\n  ");
      throw new Error(
        `Expected ${expected} to rank #1 for prompt:\n  "${prompt}"\nGot top 3:\n  ${top3}`,
      );
    }

    // Soft assertion: the winning tool should beat the runner-up by a
    // visible margin so the ranking is not pinned on noise. Without this,
    // a description change that flipped only the ordering would still
    // pass even though the host-side selection is now coin-flippy.
    if (second) {
      expect(top.score).toBeGreaterThan(second.score);
    }
  });

  it("keeps every public tool read-only for v1 prompts", () => {
    const readOnlyPrompts = TOOL_SELECTION_CORPUS.filter(
      (fixture) =>
        fixture.intent === "info" ||
        fixture.intent === "entity-lookup" ||
        fixture.intent === "pattern-lookup" ||
        fixture.intent === "review",
    );
    expect(readOnlyPrompts.length).toBeGreaterThan(0);

    for (const definition of TOOL_DEFINITIONS) {
      expect(definition.annotations).toEqual(
        expect.objectContaining({
          readOnlyHint: true,
          destructiveHint: false,
        }),
      );
    }

    for (const fixture of readOnlyPrompts) {
      const ranking = ranker.rank(fixture.prompt);
      const top = ranking[0];
      expect(top).toBeDefined();
      if (!top) continue;
      const topDefinition = TOOL_DEFINITIONS.find(
        (definition) => definition.name === top.tool,
      );
      expect(topDefinition?.annotations?.readOnlyHint).toBe(true);
    }
  });
});
