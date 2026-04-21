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
  type PublicContract,
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

type CreateWorkflowFullResult = Exclude<
  ReturnType<typeof withChooseWorkflowGuidance>,
  PublicContract
>;
type ReviewWorkflowFullResult = Exclude<
  ReturnType<typeof withAnalyzeWorkflowGuidance>,
  PublicContract
>;
type MigrateWorkflowFullResult = Exclude<
  ReturnType<typeof withTranslateWorkflowGuidance>,
  PublicContract
>;

function readFullWorkflowResult<T>(value: T): T {
  if (value == null || typeof value !== "object") {
    return value;
  }

  const payload = value as Record<string, unknown>;
  if (payload.contract !== "salt_workflow_v3" || payload.details == null) {
    return value;
  }

  expect(payload).toEqual(
    expect.objectContaining({
      contract: "salt_workflow_v3",
      workflow: expect.any(String),
      transport: expect.any(String),
      status: expect.any(String),
      safety: expect.any(Object),
      action: expect.any(Object),
      summary: expect.any(String),
      details: expect.any(Object),
    }),
  );

  const details = payload.details as Record<string, unknown>;
  return {
    ...payload,
    workflow: details.workflow,
    result: details.result,
    artifacts: details.artifacts,
  } as T;
}

function runCreateWorkflowFull(input: {
  query: string;
  includeStarterCode?: boolean;
  solutionType?: Parameters<typeof createSaltUi>[1]["solution_type"];
  contextChecked?: boolean;
  projectPolicy?: ReturnType<typeof buildWorkflowProjectPolicyArtifact> | null;
}): CreateWorkflowFullResult {
  return readFullWorkflowResult(
    withChooseWorkflowGuidance(
      registry,
      createSaltUi(registry, {
        query: input.query,
        include_starter_code: input.includeStarterCode ?? true,
        solution_type: input.solutionType,
      }),
      {
        query: input.query,
        context_checked: input.contextChecked,
        project_policy: input.projectPolicy,
        view: "full",
      },
    ),
  ) as CreateWorkflowFullResult;
}

function runReviewWorkflowFull(input: {
  code: string;
  projectPolicy?: ReturnType<typeof buildWorkflowProjectPolicyArtifact> | null;
  expectedTargets?: Parameters<typeof reviewSaltUi>[1]["expected_targets"];
}): ReviewWorkflowFullResult {
  return readFullWorkflowResult(
    withAnalyzeWorkflowGuidance(
      reviewSaltUi(registry, {
        framework: "react",
        view: "full",
        code: input.code,
        expected_targets: input.expectedTargets,
      }),
      {
        code: input.code,
        project_policy: input.projectPolicy,
        view: "full",
      },
    ),
  ) as ReviewWorkflowFullResult;
}

function runMigrateWorkflowFull(input: {
  sourceOutline: {
    regions: string[];
    actions: string[];
    states: string[];
    notes: string[];
  };
}): MigrateWorkflowFullResult {
  return readFullWorkflowResult(
    withTranslateWorkflowGuidance(
      registry,
      migrateToSalt(registry, {
        source_outline: input.sourceOutline,
        include_starter_code: true,
      }),
      {
        source_outline: input.sourceOutline,
        view: "full",
      },
    ),
  ) as MigrateWorkflowFullResult;
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

  it("keeps dashboard create output grounded in the branded analytical dashboard scaffold", () => {
    const query =
      "Can you help me create a metric dashboard, I don't have any test data but it should be finance themed.";
    const result = runCreateWorkflowFull({ query });

    expect(result.workflow.id).toBe("create_salt_ui");
    expect(result.workflow.readiness.status).toMatch(
      /^(starter_validated|starter_needs_attention)$/,
    );
    expect(result.workflow.implementation_gate).toEqual(
      expect.objectContaining({
        status: "follow_through_required",
        required_follow_through: expect.arrayContaining([
          expect.objectContaining({ entity: "App header" }),
          expect.objectContaining({ entity: "Metric" }),
        ]),
        next_step: expect.stringContaining(
          "Run targeted Salt create follow-up",
        ),
      }),
    );
    expect(
      result.workflow.implementation_gate.required_follow_through.map(
        (item: { entity: string }) => item.entity,
      ),
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
        starter_source_urls: expect.any(Array),
        source_urls: expect.arrayContaining([expect.any(String)]),
      }),
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
        status: "follow_through_required",
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
        status: "clear",
        required_follow_through: [],
        next_call: null,
        rule_ids: [],
      }),
    );
  });

  it("falls back to component routing when a forced-pattern profile prompt still clearly names Tabs", () => {
    const query =
      "User profile page with tabs for different sections and an avatar displaying user image";
    const result = runCreateWorkflowFull({ query, solutionType: "pattern" });

    expect(result.result).toMatchObject({
      solution_type: "component",
      decision: {
        name: "Tabs",
      },
    });
  });

  it("keeps long paraphrased profile prompts anchored on Tabs without forcing pattern routing", () => {
    const query =
      "User profile page with tabs for switching between profile sections and a avatar display the user's image or initials";
    const result = runCreateWorkflowFull({ query, contextChecked: true });

    expect(result.result).toMatchObject({
      solution_type: "component",
      decision: {
        name: "Tabs",
      },
    });
    expect(result.request).toMatchObject({
      resolved_entity: "Tabs",
      match_status: "broadened",
    });
  });

  it("keeps host-rewritten Metric component prompts anchored on exact Metric without unrelated follow-through", () => {
    const query =
      "Metric component to display a key value with a label, indicator and direction";
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
      },
    });
    expect(result.workflow.implementation_gate).toEqual(
      expect.objectContaining({
        status: "clear",
        required_follow_through: [],
        next_call: null,
        rule_ids: [],
      }),
    );
  });

  it("keeps secondary named surfaces on exact follow-through for breadcrumbs plus table prompts", () => {
    const query = "file manager with breadcrumbs and table";
    const result = runCreateWorkflowFull({ query });

    expect(result.result).toMatchObject({
      solution_type: "component",
      decision: {
        name: "Table",
      },
    });
    expect(result.workflow.implementation_gate).toEqual(
      expect.objectContaining({
        status: "follow_through_required",
        required_follow_through: expect.arrayContaining([
          expect.objectContaining({ entity: "Breadcrumbs" }),
        ]),
        next_call: {
          workflow: "create_salt_ui",
          follow_up_mode: "exact_name",
          args: {
            query: "Breadcrumbs",
          },
        },
        rule_ids: ["create-follow-through-required"],
      }),
    );
  });

  it("falls back to component routing when a forced-pattern file-manager prompt still clearly names Table", () => {
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
        status: "follow_through_required",
        required_follow_through: expect.arrayContaining([
          expect.objectContaining({ entity: "Breadcrumbs" }),
        ]),
      }),
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
        next_call: {
          workflow: "create_salt_ui",
          follow_up_mode: "exact_name",
          args: {
            query: "Chart",
          },
        },
        rule_ids: ["create-follow-through-required"],
      }),
    );
  });

  it("keeps large metric create output grounded in the metric pattern anatomy", () => {
    const query = "create a large metric";
    const result = runCreateWorkflowFull({ query });

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
        status: "guidance_only",
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
    const result = runReviewWorkflowFull({
      code,
      projectPolicy,
    });

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

    const result = runCreateWorkflowFull({
      query: "navigate to another route",
      projectPolicy,
      contextChecked: true,
    });

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
    const result = runMigrateWorkflowFull({
      sourceOutline,
    });

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
        required_follow_through: expect.arrayContaining([
          expect.objectContaining({ entity: "Metric" }),
        ]),
      }),
    );
  });
});
