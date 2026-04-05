import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  applyProjectPolicyToStarterCodeSnippets,
  buildWorkflowProjectPolicyArtifact,
  createSaltUi,
  getSaltEntity,
  loadRegistry,
  migrateToSalt,
  reviewSaltUi,
} from "@salt-ds/semantic-core";
import { buildRegistry } from "@salt-ds/semantic-core/build/buildRegistry";
import { mergeCanonicalAndProjectConventionLayers } from "@salt-ds/semantic-core/policy";
import type { SaltRegistry } from "@salt-ds/semantic-core/types";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  withAnalyzeWorkflowGuidance,
  withChooseWorkflowGuidance,
  withTranslateWorkflowGuidance,
} from "../server/workflowOutputs.js";
import { REPO_ROOT } from "./registryTestUtils.js";

const BUILT_AT = "2026-03-10T00:00:00Z";

let registry: SaltRegistry;
let registryDir: string;

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
  it("keeps single-destination navigation queries on Link instead of pagination or unrelated patterns", () => {
    const routeQuery = "navigate to another route";
    const toolbarQuery = "link to another page from a toolbar action";
    const routeResult = withChooseWorkflowGuidance(
      registry,
      createSaltUi(registry, {
        query: routeQuery,
        include_starter_code: true,
      }),
      { query: routeQuery },
    );
    const toolbarResult = withChooseWorkflowGuidance(
      registry,
      createSaltUi(registry, {
        query: toolbarQuery,
        include_starter_code: true,
      }),
      { query: toolbarQuery },
    );

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

  it("keeps dashboard create output grounded in the branded analytical dashboard scaffold", () => {
    const query =
      "Can you help me create a metric dashboard, I don't have any test data but it should be finance themed.";
    const result = withChooseWorkflowGuidance(
      registry,
      createSaltUi(registry, {
        query,
        include_starter_code: true,
      }),
      { query },
    );

    expect(result.workflow.id).toBe("create_salt_ui");
    expect(result.workflow.readiness.status).toMatch(
      /^(starter_validated|starter_needs_attention)$/,
    );
    expect(result.workflow.implementation_gate).toEqual(
      expect.objectContaining({
        status: "follow_through_required",
        required_follow_through: expect.arrayContaining([
          "App header",
          "Metric",
        ]),
        next_step: expect.stringContaining(
          "Run targeted Salt create follow-up",
        ),
      }),
    );
    expect(
      result.workflow.implementation_gate.required_follow_through,
    ).not.toEqual(expect.arrayContaining(["Announcement dialog"]));
    expect(result.workflow.context_requirement).toMatchObject({
      status: "context_required",
      suggested_follow_up_tool: "get_salt_project_context",
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
        bounded_scope: expect.arrayContaining([expect.any(String)]),
        starter_plan: expect.arrayContaining([expect.any(String)]),
        verify: expect.arrayContaining([
          "Run salt-ds review on the changed files after the first implementation pass.",
        ]),
      },
    });
    expect(result.artifacts.starter_code?.[0]?.code).toContain(
      "SaltProviderNext",
    );
    expect(result.artifacts.starter_code?.[0]?.code).toContain(
      "@salt-ds/theme/index.css",
    );
    expect(result.artifacts.starter_code?.[0]?.code).toContain(
      "@salt-ds/theme/css/theme-next.css",
    );
    expect(result.artifacts.starter_code?.[0]?.code).toContain('accent="teal"');
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
        snippets_checked: expect.any(Number),
      }),
    );
    expect(result.workflow.readiness.implementation_ready).toBe(
      result.artifacts.starter_validation?.status === "clean",
    );
    expect(result.workflow.provenance).toEqual(
      expect.objectContaining({
        canonical_source_urls: expect.arrayContaining([expect.any(String)]),
        starter_source_urls: expect.arrayContaining([expect.any(String)]),
        source_urls: expect.arrayContaining([expect.any(String)]),
      }),
    );
  });

  it("keeps paraphrased finance dashboard create prompts on the analytical dashboard pattern", () => {
    const query =
      "Finance-themed metric dashboard with key financial metrics like revenue, expenses, profit margin, and portfolio performance";
    const result = withChooseWorkflowGuidance(
      registry,
      createSaltUi(registry, {
        query,
        include_starter_code: true,
      }),
      { query },
    );

    expect(result.result).toMatchObject({
      solution_type: "pattern",
      decision: {
        name: "Analytical dashboard",
      },
    });
    expect(result.workflow.implementation_gate).toEqual(
      expect.objectContaining({
        status: "follow_through_required",
        required_follow_through: expect.arrayContaining(["Metric"]),
      }),
    );
  });

  it("keeps large metric create output grounded in the metric pattern anatomy", () => {
    const query = "create a large metric";
    const result = withChooseWorkflowGuidance(
      registry,
      createSaltUi(registry, {
        query,
        include_starter_code: true,
      }),
      { query },
    );

    expect(result.workflow.readiness).toMatchObject({
      status: expect.stringMatching(
        /^(starter_validated|starter_needs_attention)$/,
      ),
      implementation_ready: expect.any(Boolean),
    });
    expect(result.result).toMatchObject({
      solution_type: "pattern",
      decision: {
        name: "Metric",
      },
    });
    expect(result.artifacts.starter_code?.[0]?.code).toContain("Performance");
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
    const result = withChooseWorkflowGuidance(
      registry,
      createSaltUi(registry, {
        query,
        include_starter_code: true,
      }),
      { query },
    );

    expect(result.result).toMatchObject({
      solution_type: "pattern",
      decision: {
        name: "Metric",
      },
    });
  });

  it("treats starter-code opt-out as planning-only output instead of implementation-ready guidance", () => {
    const query = "link to another page from a toolbar action";
    const result = withChooseWorkflowGuidance(
      registry,
      createSaltUi(registry, {
        query,
        include_starter_code: false,
      }),
      { query },
    );

    expect(result.workflow.readiness).toEqual(
      expect.objectContaining({
        status: "guidance_only",
        implementation_ready: false,
      }),
    );
    expect(result.artifacts.starter_code).toBeUndefined();
    expect(result.artifacts.starter_validation).toBeNull();
  });

  it("flags invented canonical-looking tokens and hard-coded colors in review output", () => {
    const result = withAnalyzeWorkflowGuidance(
      reviewSaltUi(registry, {
        framework: "react",
        view: "full",
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
      }),
    );

    expect(result.workflow.id).toBe("review_salt_ui");
    expect(result.result.decision).toMatchObject({
      status: "needs_attention",
    });
    expect(result.result.ide_summary).toMatchObject({
      verdict: {
        level: expect.stringMatching(/^(medium_risk|high_risk)$/),
      },
      top_findings: expect.arrayContaining([expect.any(String)]),
      safest_next_fix: expect.any(String),
      verify: expect.arrayContaining([
        "Rerun salt-ds review on the changed files.",
      ]),
    });
    expect(result.result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "tokens.unknown-salt-token",
          canonical_source: "/salt/themes/design-tokens/index",
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

  it("flags transcript-shaped dashboard drift when a saved create direction expects Metric and the implementation drifts to custom KPI cards and raw tables", () => {
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

    const result = withAnalyzeWorkflowGuidance(
      reviewSaltUi(registry, {
        framework: "react",
        view: "full",
        code,
        expected_targets: {
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
      }),
    );

    expect(result.result.decision).toMatchObject({
      status: "needs_attention",
    });
    expect(result.result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "workflow-expected.metric-pattern",
        }),
        expect.objectContaining({
          id: "workflow-expected.tabular-surface",
        }),
        expect.objectContaining({
          id: "primitive-choice.native-table",
        }),
      ]),
    );
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
    const result = withAnalyzeWorkflowGuidance(
      reviewSaltUi(registry, {
        framework: "react",
        view: "full",
        code,
      }),
      {
        code,
        project_policy: projectPolicy,
      },
    );

    expect(result.artifacts.fix_candidates.candidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          rule_id: "review-project-policy-wrapper",
        }),
        expect.objectContaining({
          rule_id: "review-project-policy-theme-default",
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
    const result = withAnalyzeWorkflowGuidance(
      reviewSaltUi(registry, {
        framework: "react",
        view: "full",
        code,
      }),
      {
        code,
        project_policy: projectPolicy,
      },
    );

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

  it("keeps CSS starter snippets CSS-safe while still applying token aliases", () => {
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

    expect(snippets?.[0]?.code).toContain("var(--brand-text-primary)");
    expect(snippets?.[0]?.code).not.toContain(
      'import "@salt-ds/theme/index.css";',
    );
  });

  it("downgrades create readiness when repo theme policy cannot rewrite the starter safely", () => {
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

    const result = withChooseWorkflowGuidance(
      registry,
      createSaltUi(registry, {
        query: "navigate to another route",
        include_starter_code: true,
      }),
      {
        query: "navigate to another route",
        project_policy: projectPolicy,
        context_checked: true,
      },
    );

    expect(result.workflow.readiness).toEqual(
      expect.objectContaining({
        status: "starter_needs_attention",
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
    const result = withTranslateWorkflowGuidance(
      registry,
      migrateToSalt(registry, {
        source_outline: sourceOutline,
        include_starter_code: true,
      }),
      { source_outline: sourceOutline },
    );

    expect(result.workflow).toMatchObject({
      id: "migrate_to_salt",
      readiness: {
        status: "starter_needs_attention",
        implementation_ready: false,
      },
      context_requirement: {
        status: "context_required",
      },
    });
    expect(result.artifacts.starter_validation).toEqual(
      expect.objectContaining({
        status: "needs_attention",
        snippets_checked: expect.any(Number),
      }),
    );
    expect(result.artifacts.post_migration_verification).toEqual(
      expect.objectContaining({
        suggested_workflow: "review_salt_ui",
      }),
    );
    expect(result.artifacts.visual_evidence_contract).toEqual(
      expect.objectContaining({
        role: "supporting-evidence",
        interpretation_owner: "agent-or-adapter",
        normalization_required: true,
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
      screen_map: expect.arrayContaining([expect.any(String)]),
      preserve: expect.any(Array),
      recommended_direction: expect.arrayContaining([expect.any(String)]),
      first_scaffold: expect.arrayContaining([expect.any(String)]),
      verify: expect.arrayContaining([expect.any(String)]),
    });
  });

  it("keeps the canonical Salt choice visible when project conventions override the final repo answer", () => {
    const workflow = withChooseWorkflowGuidance(
      registry,
      createSaltUi(registry, {
        query: "link to another page from a toolbar action",
        include_starter_code: true,
      }),
      { query: "link to another page from a toolbar action" },
    );
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
    const result = withChooseWorkflowGuidance(
      registry,
      createSaltUi(registry, {
        query,
        include_starter_code: true,
      }),
      { query },
    );

    expect(result.result).toMatchObject({
      decision: {
        name: "Analytical dashboard",
      },
      ide_summary: {
        open_question: expect.stringContaining("Data grid"),
        bounded_scope: expect.arrayContaining([expect.any(String)]),
        starter_plan: expect.arrayContaining([
          "Before coding named sub-surfaces, run Salt follow-up grounding for the unresolved composition-contract items first.",
        ]),
        verify: expect.arrayContaining([
          expect.stringContaining(
            "Treat the composition contract as a required checklist",
          ),
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
    expect(result.workflow.confidence).toEqual(
      expect.objectContaining({
        ask_before_proceeding: true,
      }),
    );
    expect(result.workflow.implementation_gate).toEqual(
      expect.objectContaining({
        status: "follow_through_required",
        required_follow_through: expect.arrayContaining(["Metric"]),
      }),
    );
  });
});
