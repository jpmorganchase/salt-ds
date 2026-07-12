import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { loadRegistry } from "../core/registry/loadRegistry.js";
import {
  buildSaltExportIndex,
  type EvidenceSprintReport,
  hasAncestorForEveryChild,
  passesEvidenceSprintComparison,
  runEvidenceSprint,
} from "../evals/evidenceSprint.js";
import { REPO_ROOT } from "./registryTestUtils.js";

describe("Salt MCP evidence-scorer regression fixtures", () => {
  let report: EvidenceSprintReport;
  let registry: Awaited<ReturnType<typeof loadRegistry>>;

  beforeAll(async () => {
    registry = await loadRegistry({ prefetch: true });
    report = await runEvidenceSprint({
      repoRoot: REPO_ROOT,
      fixtureDir: path.join(
        REPO_ROOT,
        "packages",
        "mcp",
        "eval-fixtures",
        "evidence-sprint",
      ),
      registry,
    });
  }, 30_000);

  it("scores seeded artifacts without presenting them as a product comparison", () => {
    expect(report.passed).toBe(true);
    expect(report.version).toBe(3);
    expect(report.evidence_provenance).toBe("synthetic_scorer_regression");
    expect(report.valid_as_product_comparison).toBe(false);
    expect(report.tasks).toHaveLength(3);
    expect(report.scorecard).toMatchObject({
      score_basis: "artifact_quality",
      task_count: 3,
      condition_count: 9,
      condition_scores: {
        closed_book: {
          average_score: 0.11,
          passed: 0,
          failed: 3,
        },
        docs_context_dump: {
          average_score: 0.44,
          passed: 0,
          failed: 3,
        },
        mcp_assisted: {
          average_score: 1,
          passed: 3,
          failed: 0,
        },
      },
      workflow_integrity: {
        closed_book: {
          applicable: 0,
          passed: 0,
          failed: 0,
          not_applicable: 3,
        },
        docs_context_dump: {
          applicable: 0,
          passed: 0,
          failed: 0,
          not_applicable: 3,
        },
        mcp_assisted: {
          applicable: 3,
          passed: 3,
          failed: 0,
          not_applicable: 0,
        },
      },
      comparison: {
        outperformed: 3,
        matched: 0,
        regressed: 0,
      },
    });

    for (const task of report.tasks) {
      expect(task.comparison).toMatchObject({
        score_basis: "artifact_quality",
        mcp_score: 1,
        score_delta: expect.any(Number),
        mcp_outperformed_baselines: true,
        mcp_matched_or_outperformed_baselines: true,
      });
      expect(task.practical_gates).toEqual(
        expect.arrayContaining([
          "yarn typecheck",
          "yarn workspace @salt-ds/mcp build",
        ]),
      );

      const mcp = task.conditions.find(
        (condition) => condition.condition_id === "mcp_assisted",
      );
      expect(mcp).toMatchObject({
        score: 1,
        passed: true,
        artifact_quality: {
          score: 1,
          passed: true,
          compile_gate_passed: true,
        },
        workflow_integrity: {
          applicable: true,
          passed: true,
        },
      });

      for (const baseline of task.conditions.filter(
        (condition) => condition.condition_id !== "mcp_assisted",
      )) {
        expect(baseline.passed).toBe(false);
        expect(baseline.workflow_integrity).toMatchObject({
          applicable: false,
          passed: null,
        });
        expect(
          baseline.workflow_integrity.criteria.every(
            (criterion) => criterion.status === "not_applicable",
          ),
        ).toBe(true);
        expect(
          baseline.findings.some((finding) =>
            finding.code.startsWith("contract."),
          ),
        ).toBe(false);
      }
    }
  });

  it("requires aggregate uplift without allowing any task to regress", () => {
    const tied = structuredClone(report.tasks);
    for (const task of tied) {
      task.comparison.best_baseline_score = task.comparison.mcp_score;
      task.comparison.score_delta = 0;
      task.comparison.mcp_outperformed_baselines = false;
      task.comparison.mcp_matched_or_outperformed_baselines = true;
    }
    expect(passesEvidenceSprintComparison(tied)).toBe(false);

    const improved = tied[0];
    const regressed = tied[1];
    expect(improved).toBeDefined();
    expect(regressed).toBeDefined();
    if (!improved || !regressed)
      throw new Error("Expected three sprint tasks.");

    improved.comparison.best_baseline_score = 0;
    improved.comparison.score_delta = improved.comparison.mcp_score;
    improved.comparison.mcp_outperformed_baselines = true;
    expect(passesEvidenceSprintComparison(tied)).toBe(true);

    regressed.comparison.best_baseline_score = 1;
    regressed.comparison.mcp_score = 0.5;
    regressed.comparison.score_delta = -0.5;
    regressed.comparison.mcp_matched_or_outperformed_baselines = false;
    expect(passesEvidenceSprintComparison(tied)).toBe(false);
  });

  it("scores successful TypeScript compilation as an artifact-quality criterion", () => {
    const dashboardDocs = report.tasks
      .find((task) => task.id === "dashboard-layout")
      ?.conditions.find(
        (condition) => condition.condition_id === "docs_context_dump",
      );
    const compileCriterion = dashboardDocs?.artifact_quality.criteria.find(
      (criterion) => criterion.id === "artifact_compiles",
    );

    expect(compileCriterion).toMatchObject({
      status: "passed",
      passed: true,
      scored: true,
    });
    expect(compileCriterion?.findings).toEqual([]);
    expect(dashboardDocs).toMatchObject({
      score: 0.3333,
      passed: false,
      artifact_quality: {
        score: 0.3333,
        compile_gate_passed: true,
      },
    });
  });

  it("reports missing artifacts and MCP histories without requiring baseline histories", async () => {
    const sourceFixtureDir = path.join(
      REPO_ROOT,
      "packages",
      "mcp",
      "eval-fixtures",
      "evidence-sprint",
    );
    const fixtureDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-evidence-scorer-missing-"),
    );

    try {
      await fs.cp(sourceFixtureDir, fixtureDir, { recursive: true });
      const manifestPath = path.join(fixtureDir, "tasks.json");
      const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8")) as {
        tasks: Array<{
          conditions: Record<
            "closed_book" | "docs_context_dump" | "mcp_assisted",
            { artifact: string; contract_history?: string }
          >;
        }>;
      };
      for (const task of manifest.tasks) {
        delete task.conditions.closed_book.contract_history;
        delete task.conditions.docs_context_dump.contract_history;
      }
      await fs.writeFile(
        manifestPath,
        `${JSON.stringify(manifest, null, 2)}\n`,
        "utf8",
      );
      await fs.rm(
        path.join(
          fixtureDir,
          "artifacts",
          "app-shell-vertical-navigation",
          "mcp_assisted",
          "AppShell.tsx.fixture",
        ),
      );
      await fs.rm(
        path.join(
          fixtureDir,
          "artifacts",
          "dashboard-layout",
          "mcp_assisted",
          "contract-history.json",
        ),
      );

      const missingReport = await runEvidenceSprint({
        repoRoot: REPO_ROOT,
        fixtureDir,
      });
      const appMcp = missingReport.tasks
        .find((task) => task.id === "app-shell-vertical-navigation")
        ?.conditions.find(
          (condition) => condition.condition_id === "mcp_assisted",
        );
      const dashboardMcp = missingReport.tasks
        .find((task) => task.id === "dashboard-layout")
        ?.conditions.find(
          (condition) => condition.condition_id === "mcp_assisted",
        );

      expect(missingReport.passed).toBe(false);
      expect(appMcp?.findings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ code: "compile.missing-artifact" }),
        ]),
      );
      expect(dashboardMcp?.findings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ code: "contract.missing-history" }),
        ]),
      );
      for (const task of missingReport.tasks) {
        for (const baseline of task.conditions.filter(
          (condition) => condition.condition_id !== "mcp_assisted",
        )) {
          expect(baseline.contract_history_path).toBeNull();
          expect(
            baseline.findings.some((finding) =>
              finding.code.startsWith("contract."),
            ),
          ).toBe(false);
        }
      }
    } finally {
      await fs.rm(fixtureDir, { recursive: true, force: true });
    }
  }, 30_000);

  it("keeps the import census diagnostic and includes canonical-example imports", async () => {
    const registry = await loadRegistry({ prefetch: true });
    const exportIndex = buildSaltExportIndex(registry);
    const coreExports = exportIndex.get("@salt-ds/core");

    expect([...(coreExports ?? [])]).toEqual(
      expect.arrayContaining([
        "BorderItem",
        "GridItem",
        "H1",
        "H2",
        "VerticalNavigation",
        "VerticalNavigationItemContent",
        "FormField",
        "Switch",
      ]),
    );

    for (const task of report.tasks) {
      for (const condition of task.conditions) {
        expect(
          condition.diagnostics.find(
            (criterion) => criterion.id === "real_salt_imports",
          )?.scored,
        ).toBe(false);
      }
    }
  });

  it("parses Salt named imports independently from preceding React imports", async () => {
    const registry = await loadRegistry({ prefetch: true });
    const example = registry.examples[0];
    expect(example).toBeDefined();
    if (!example) {
      throw new Error("Expected at least one registry example");
    }

    const exportIndex = buildSaltExportIndex({
      ...registry,
      components: [],
      icons: [],
      country_symbols: [],
      examples: [
        {
          ...example,
          code: [
            'import { useState } from "react";',
            'import { FixturePart as LocalFixturePart, type FixtureProps } from "@salt-ds/fixture";',
          ].join("\n"),
        },
      ],
    });

    expect([...(exportIndex.get("@salt-ds/fixture") ?? [])]).toEqual([
      "FixturePart",
      "FixtureProps",
    ]);
  });

  it("supports prompt-aligned import alternatives and non-vacuous required ancestors", () => {
    const settingsMcp = report.tasks
      .find((task) => task.id === "settings-list-workflow")
      ?.conditions.find(
        (condition) => condition.condition_id === "mcp_assisted",
      );
    expect(
      settingsMcp?.artifact_quality.criteria.find(
        (criterion) => criterion.id === "required_salt_surface_present",
      ),
    ).toMatchObject({ passed: true });

    expect(
      hasAncestorForEveryChild("<FormField />", "Input", "FormField", true),
    ).toBe(false);
    expect(
      hasAncestorForEveryChild("<FormField />", "Input", "FormField", false),
    ).toBe(true);
    expect(
      hasAncestorForEveryChild(
        "<FormField><Input /></FormField>",
        "Input",
        "FormField",
        true,
      ),
    ).toBe(true);
  });

  it("keeps seeded bad artifacts diagnostic without letting evaluator checks affect score", () => {
    const appShellClosedBook = report.tasks
      .find((task) => task.id === "app-shell-vertical-navigation")
      ?.conditions.find(
        (condition) => condition.condition_id === "closed_book",
      );
    const dashboardDocsDump = report.tasks
      .find((task) => task.id === "dashboard-layout")
      ?.conditions.find(
        (condition) => condition.condition_id === "docs_context_dump",
      );
    const settingsDocsDump = report.tasks
      .find((task) => task.id === "settings-list-workflow")
      ?.conditions.find(
        (condition) => condition.condition_id === "docs_context_dump",
      );

    expect(appShellClosedBook?.findings.map((finding) => finding.code)).toEqual(
      expect.arrayContaining([
        "imports.required-salt-surface-missing",
        "composition.vertical-navigation-item-content",
        "navigation.fake-href",
      ]),
    );
    expect(dashboardDocsDump?.findings.map((finding) => finding.code)).toEqual(
      expect.arrayContaining([
        "imports.required-salt-surface-missing",
        "primitive-choice.native-table",
        "systemic.nested-card",
      ]),
    );
    expect(settingsDocsDump?.findings.map((finding) => finding.code)).toEqual(
      expect.arrayContaining([
        "imports.required-salt-surface-missing",
        "composition.form-control-requires-form-field",
      ]),
    );

    for (const condition of [
      appShellClosedBook,
      dashboardDocsDump,
      settingsDocsDump,
    ]) {
      expect(
        condition?.diagnostics.find(
          (criterion) => criterion.id === "review_findings_actionable",
        ),
      ).toMatchObject({ passed: true, scored: false });
      expect(
        condition?.diagnostics.find(
          (criterion) => criterion.id === "practical_gate_labels_declared",
        ),
      ).toMatchObject({
        passed: true,
        scored: false,
        summary: expect.stringContaining("does not execute"),
      });
    }
  });

  describe("synthetic contract-history and artifact gaming regressions", () => {
    let fixtureRoot: string;
    let gamingReport: EvidenceSprintReport;

    beforeAll(async () => {
      fixtureRoot = await fs.mkdtemp(
        path.join(REPO_ROOT, ".salt-evidence-scorer-live-"),
      );
      const fixtureDir = path.join(fixtureRoot, "fixture");
      const consumerRoot = path.join(fixtureRoot, "consumer");
      const artifactDir = path.join(fixtureDir, "artifacts");
      const historyDir = path.join(fixtureDir, "histories");
      const componentTypesDir = path.join(consumerRoot, "src", "components");
      await Promise.all([
        fs.mkdir(artifactDir, { recursive: true }),
        fs.mkdir(historyDir, { recursive: true }),
        fs.mkdir(componentTypesDir, { recursive: true }),
        fs.mkdir(path.join(consumerRoot, ".salt"), { recursive: true }),
      ]);

      await fs.writeFile(
        path.join(fixtureDir, "protocol.json"),
        `${JSON.stringify({ root_dir: consumerRoot }, null, 2)}\n`,
        "utf8",
      );
      await fs.writeFile(
        path.join(consumerRoot, "tsconfig.json"),
        `${JSON.stringify(
          {
            compilerOptions: {
              target: "ES2020",
              lib: ["ES2020", "DOM"],
              strict: true,
              module: "ESNext",
              moduleResolution: "Bundler",
              jsx: "react-jsx",
              paths: { "@/*": ["./src/*"] },
              noEmit: true,
              skipLibCheck: true,
            },
            include: ["src/**/*.d.ts"],
          },
          null,
          2,
        )}\n`,
        "utf8",
      );
      await fs.writeFile(
        path.join(componentTypesDir, "AppButton.d.ts"),
        [
          'import type { ComponentType, ReactNode } from "react";',
          "declare const AppButton: ComponentType<{ children?: ReactNode }> ;",
          "export default AppButton;",
          "",
        ].join("\n"),
        "utf8",
      );
      await fs.writeFile(
        path.join(componentTypesDir, "OtherButton.d.ts"),
        [
          'import type { ComponentType, ReactNode } from "react";',
          "declare const OtherButton: ComponentType<{ children?: ReactNode }> ;",
          "export default OtherButton;",
          "",
        ].join("\n"),
        "utf8",
      );
      await fs.writeFile(
        path.join(consumerRoot, "src", "globals.d.ts"),
        "declare const CONSUMER_DECLARATION: string;\n",
        "utf8",
      );
      await fs.writeFile(
        path.join(consumerRoot, ".salt", "team.json"),
        `${JSON.stringify(
          {
            approved_wrappers: [
              {
                name: "AppButton",
                wraps: "Button",
                reason: "Consumer actions use the approved wrapper.",
                import: {
                  from: "@/components/AppButton",
                  name: "AppButton",
                },
              },
            ],
          },
          null,
          2,
        )}\n`,
        "utf8",
      );

      await fs.writeFile(
        path.join(artifactDir, "approved.tsx.fixture"),
        [
          'import { StackLayout } from "@salt-ds/core";',
          'import ConsumerAction from "@/components/AppButton";',
          "export function ApprovedFixture() {",
          "  return <StackLayout><ConsumerAction>{CONSUMER_DECLARATION}</ConsumerAction></StackLayout>;",
          "}",
          "",
        ].join("\n"),
        "utf8",
      );
      await fs.writeFile(
        path.join(artifactDir, "wrong-wrapper.tsx.fixture"),
        [
          'import { StackLayout } from "@salt-ds/core";',
          'import AppButton from "@/components/OtherButton";',
          "export function WrongWrapperFixture() {",
          "  return <StackLayout><AppButton>{CONSUMER_DECLARATION}</AppButton></StackLayout>;",
          "}",
          "",
        ].join("\n"),
        "utf8",
      );
      await fs.writeFile(
        path.join(artifactDir, "settings-native-text.tsx.fixture"),
        [
          'import { Button, FormField, Input } from "@salt-ds/core";',
          "export function SettingsWithSemanticText() {",
          "  return (",
          "    <section>",
          "      <h1>Notification settings</h1>",
          "      <p>Choose how the team contacts you.</p>",
          '      <FormField label="Email address"><Input /></FormField>',
          "      <Button>Save</Button>",
          "    </section>",
          "  );",
          "}",
          "",
        ].join("\n"),
        "utf8",
      );
      await fs.writeFile(
        path.join(artifactDir, "aliased-used-surface.tsx.fixture"),
        [
          'import { Button as Action, StackLayout as Layout } from "@salt-ds/core";',
          "export function AliasedUsedSurface() {",
          "  return <Layout><Action>Save</Action></Layout>;",
          "}",
          "",
        ].join("\n"),
        "utf8",
      );
      await fs.writeFile(
        path.join(artifactDir, "unused-surface.tsx.fixture"),
        [
          'import { Button, StackLayout } from "@salt-ds/core";',
          "const decoy = <Button>Not rendered</Button>;",
          "export function UnusedSurface() {",
          "  void decoy;",
          "  return <StackLayout><main>Consumer content</main></StackLayout>;",
          "}",
          "",
        ].join("\n"),
        "utf8",
      );

      const implementAction = {
        kind: "implement",
        post_action: {
          kind: "review",
          tool: "review_salt_ui",
          required_input: ["complete_updated_file"],
        },
      };
      const completeSafety = { exact_request_safe: true };
      const completeEvidence = { status: "complete" };
      const referenceResults = [
        { name: "Button", status: "found" },
        { name: "StackLayout", status: "found" },
        { name: "MissingLiveProbe", status: "not_found" },
      ];
      const resolvedArgs = { resolved_entities: ["Button", "StackLayout"] };
      await fs.writeFile(
        path.join(historyDir, "normalized.json"),
        `${JSON.stringify(
          {
            reference_results: referenceResults,
            workflow_calls: [
              {
                tool: "create_salt_ui",
                args: resolvedArgs,
                contract: {
                  contract: "salt_workflow_v1",
                  status: "success",
                  action: implementAction,
                  safety: completeSafety,
                  evidence: completeEvidence,
                },
              },
              {
                tool: "review_salt_ui",
                args: {},
                contract: {
                  contract: "salt_workflow_v1",
                  status: "success",
                  action: { kind: "complete" },
                  safety: completeSafety,
                  evidence: completeEvidence,
                },
              },
            ],
          },
          null,
          2,
        )}\n`,
        "utf8",
      );
      await fs.writeFile(
        path.join(historyDir, "missing-review.json"),
        `${JSON.stringify(
          {
            reference_results: referenceResults,
            workflow_calls: [
              {
                tool: "create_salt_ui",
                args: resolvedArgs,
                contract: {
                  contract: "salt_workflow_v1",
                  status: "success",
                  action: implementAction,
                  safety: completeSafety,
                  evidence: completeEvidence,
                },
              },
            ],
          },
          null,
          2,
        )}\n`,
        "utf8",
      );
      await fs.writeFile(
        path.join(historyDir, "missing-review-input.json"),
        `${JSON.stringify(
          {
            reference_results: referenceResults,
            workflow_calls: [
              {
                tool: "create_salt_ui",
                args: resolvedArgs,
                contract: {
                  contract: "salt_workflow_v1",
                  status: "success",
                  action: {
                    kind: "implement",
                    post_action: {
                      kind: "review",
                      tool: "review_salt_ui",
                    },
                  },
                  safety: completeSafety,
                  evidence: completeEvidence,
                },
              },
              {
                tool: "review_salt_ui",
                args: {},
                contract: {
                  contract: "salt_workflow_v1",
                  status: "success",
                  action: { kind: "complete" },
                  safety: completeSafety,
                  evidence: completeEvidence,
                },
              },
            ],
          },
          null,
          2,
        )}\n`,
        "utf8",
      );
      await fs.writeFile(
        path.join(historyDir, "blocked-review.json"),
        `${JSON.stringify(
          {
            reference_results: referenceResults,
            workflow_calls: [
              {
                tool: "create_salt_ui",
                args: resolvedArgs,
                contract: {
                  contract: "salt_workflow_v1",
                  status: "success",
                  action: implementAction,
                  safety: completeSafety,
                  evidence: completeEvidence,
                },
              },
              {
                tool: "review_salt_ui",
                args: {},
                contract: {
                  contract: "salt_workflow_v1",
                  status: "partial",
                  action: { kind: "fix" },
                  safety: { exact_request_safe: false },
                  evidence: { status: "partial" },
                },
              },
            ],
          },
          null,
          2,
        )}\n`,
        "utf8",
      );
      await fs.writeFile(
        path.join(historyDir, "settings-native-text.json"),
        `${JSON.stringify(
          {
            reference_results: [
              { name: "Button", status: "found" },
              { name: "FormField", status: "found" },
              { name: "Input", status: "found" },
              { name: "MissingLiveProbe", status: "not_found" },
            ],
            workflow_calls: [
              {
                tool: "create_salt_ui",
                args: {
                  resolved_entities: ["Button", "FormField", "Input"],
                },
                contract: {
                  contract: "salt_workflow_v1",
                  status: "success",
                  action: implementAction,
                  safety: completeSafety,
                  evidence: completeEvidence,
                },
              },
              {
                tool: "review_salt_ui",
                args: {},
                contract: {
                  contract: "salt_workflow_v1",
                  status: "success",
                  action: { kind: "complete" },
                  safety: completeSafety,
                  evidence: completeEvidence,
                },
              },
            ],
          },
          null,
          2,
        )}\n`,
        "utf8",
      );
      await fs.writeFile(
        path.join(historyDir, "malformed.json"),
        `${JSON.stringify(
          {
            reference_results: referenceResults,
            workflow_calls: [
              {
                tool: "create_salt_ui",
                args: resolvedArgs,
                contract: {
                  contract: "salt_workflow_v1",
                  status: "success",
                  action: "do not implement; review_salt_ui",
                  safety:
                    "canonical_complete=true; exact_request_safe=true; no blockers",
                  evidence: "complete",
                },
              },
              {
                tool: "create_salt_ui",
                args: resolvedArgs,
                contract: {
                  contract: "salt_workflow_v1",
                  status: "success",
                  action: {
                    kind: "implement",
                    post_action: "review",
                  },
                  safety: completeSafety,
                  evidence: completeEvidence,
                },
              },
              {
                tool: "create_salt_ui",
                args: resolvedArgs,
                contract: {
                  contract: "salt_workflow_v1",
                  status: "success",
                  action: {
                    kind: "retrieve_reference",
                    tool: "get_salt_reference",
                    args: { names: ["MissingLiveProbe"] },
                  },
                  safety: completeSafety,
                  evidence: completeEvidence,
                },
                status: "success",
                action: implementAction,
                safety: completeSafety,
                evidence: completeEvidence,
              },
            ],
          },
          null,
          2,
        )}\n`,
        "utf8",
      );

      const task = (
        id: string,
        contractHistory: string,
        artifact = "artifacts/approved.tsx.fixture",
      ): Record<string, unknown> => ({
        id,
        title: id,
        workflow: "create",
        prompt: "Build a consumer action with Salt layout.",
        capability_tags: ["consumer-policy"],
        practical_gates: ["yarn typecheck"],
        expectations: {
          required_imports: [
            { package: "@salt-ds/core", names: ["Button", "StackLayout"] },
          ],
          unresolved_probe_names: ["MissingLiveProbe"],
        },
        conditions: {
          closed_book: { artifact: "artifacts/wrong-wrapper.tsx.fixture" },
          docs_context_dump: {
            artifact: "artifacts/wrong-wrapper.tsx.fixture",
          },
          mcp_assisted: {
            artifact,
            contract_history: contractHistory,
          },
        },
      });
      await fs.writeFile(
        path.join(fixtureDir, "tasks.json"),
        `${JSON.stringify(
          {
            sprint_id: "synthetic-gaming-regression",
            version: 1,
            evidence_provenance: "synthetic_scorer_regression",
            conditions: [
              {
                id: "closed_book",
                label: "Closed book",
                description: "No context.",
              },
              {
                id: "docs_context_dump",
                label: "Docs context",
                description: "Static context.",
              },
              {
                id: "mcp_assisted",
                label: "MCP assisted",
                description: "MCP workflow.",
              },
            ],
            tasks: [
              task("normalized-contract-shapes", "histories/normalized.json"),
              task("malformed-contract-shapes", "histories/malformed.json"),
              task("missing-executed-review", "histories/missing-review.json"),
              task(
                "missing-review-required-input",
                "histories/missing-review-input.json",
              ),
              task("blocked-terminal-review", "histories/blocked-review.json"),
              task(
                "aliased-used-surface",
                "histories/normalized.json",
                "artifacts/aliased-used-surface.tsx.fixture",
              ),
              task(
                "unused-import-gaming",
                "histories/normalized.json",
                "artifacts/unused-surface.tsx.fixture",
              ),
              {
                id: "settings-native-semantic-text",
                title: "settings-native-semantic-text",
                workflow: "create",
                prompt:
                  "Build a settings form with a semantic heading and supporting paragraph.",
                capability_tags: ["forms", "semantic-html"],
                practical_gates: ["yarn typecheck"],
                expectations: {
                  required_imports: [
                    {
                      package: "@salt-ds/core",
                      names: ["Button", "FormField", "Input"],
                    },
                  ],
                  required_ancestors: [
                    {
                      child: "Input",
                      ancestor: "FormField",
                      rule_id: "composition.form-control-requires-form-field",
                      required: true,
                    },
                  ],
                  unresolved_probe_names: ["MissingLiveProbe"],
                },
                conditions: {
                  closed_book: {
                    artifact: "artifacts/settings-native-text.tsx.fixture",
                  },
                  docs_context_dump: {
                    artifact: "artifacts/settings-native-text.tsx.fixture",
                  },
                  mcp_assisted: {
                    artifact: "artifacts/settings-native-text.tsx.fixture",
                    contract_history: "histories/settings-native-text.json",
                  },
                },
              },
            ],
          },
          null,
          2,
        )}\n`,
        "utf8",
      );

      gamingReport = await runEvidenceSprint({
        repoRoot: REPO_ROOT,
        fixtureDir,
        registry,
      });
    }, 30_000);

    afterAll(async () => {
      await fs.rm(fixtureRoot, { recursive: true, force: true });
    });

    it("uses the protocol consumer tsconfig, path aliases, declarations, and approved wrappers", () => {
      const normalizedTask = gamingReport.tasks.find(
        (task) => task.id === "normalized-contract-shapes",
      );
      const mcp = normalizedTask?.conditions.find(
        (condition) => condition.condition_id === "mcp_assisted",
      );
      const closedBook = normalizedTask?.conditions.find(
        (condition) => condition.condition_id === "closed_book",
      );

      expect(
        mcp?.artifact_quality.criteria.find(
          (criterion) => criterion.id === "artifact_compiles",
        ),
      ).toMatchObject({ passed: true });
      expect(
        mcp?.artifact_quality.criteria.find(
          (criterion) => criterion.id === "required_salt_surface_present",
        ),
      ).toMatchObject({ passed: true });
      expect(
        closedBook?.artifact_quality.criteria.find(
          (criterion) => criterion.id === "required_salt_surface_present",
        ),
      ).toMatchObject({
        passed: false,
        findings: [
          expect.objectContaining({
            code: "imports.required-salt-surface-missing",
          }),
        ],
      });
    });

    it("accepts structured workflow contracts and rejects narrative or top-level substitutes", () => {
      const normalized = gamingReport.tasks
        .find((task) => task.id === "normalized-contract-shapes")
        ?.conditions.find(
          (condition) => condition.condition_id === "mcp_assisted",
        );
      const malformed = gamingReport.tasks
        .find((task) => task.id === "malformed-contract-shapes")
        ?.conditions.find(
          (condition) => condition.condition_id === "mcp_assisted",
        );

      expect(normalized?.workflow_integrity).toMatchObject({
        applicable: true,
        passed: true,
      });
      expect(malformed?.workflow_integrity).toMatchObject({
        applicable: true,
        passed: false,
      });
      expect(malformed?.findings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: "contract.invalid-workflow-contract",
          }),
          expect.objectContaining({
            code: "contract.missing-post-create-review",
          }),
        ]),
      );
    });

    it("requires imported Salt bindings to be used in output and respects aliases", () => {
      const aliased = gamingReport.tasks
        .find((task) => task.id === "aliased-used-surface")
        ?.conditions.find(
          (condition) => condition.condition_id === "mcp_assisted",
        );
      const unused = gamingReport.tasks
        .find((task) => task.id === "unused-import-gaming")
        ?.conditions.find(
          (condition) => condition.condition_id === "mcp_assisted",
        );

      expect(
        aliased?.artifact_quality.criteria.find(
          (criterion) => criterion.id === "required_salt_surface_present",
        ),
      ).toMatchObject({ passed: true, findings: [] });
      expect(
        unused?.artifact_quality.criteria.find(
          (criterion) => criterion.id === "required_salt_surface_present",
        ),
      ).toMatchObject({
        passed: false,
        findings: expect.arrayContaining([
          expect.objectContaining({
            code: "imports.required-salt-surface-missing",
          }),
        ]),
      });
    });

    it("requires an executed, clean terminal review after an implement pointer", () => {
      const missingReview = gamingReport.tasks
        .find((task) => task.id === "missing-executed-review")
        ?.conditions.find(
          (condition) => condition.condition_id === "mcp_assisted",
        );
      const blockedReview = gamingReport.tasks
        .find((task) => task.id === "blocked-terminal-review")
        ?.conditions.find(
          (condition) => condition.condition_id === "mcp_assisted",
        );
      const missingReviewInput = gamingReport.tasks
        .find((task) => task.id === "missing-review-required-input")
        ?.conditions.find(
          (condition) => condition.condition_id === "mcp_assisted",
        );

      expect(missingReview?.workflow_integrity).toMatchObject({
        applicable: true,
        passed: false,
      });
      expect(missingReview?.findings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: "contract.post-action-review-not-captured",
          }),
        ]),
      );
      expect(blockedReview?.workflow_integrity).toMatchObject({
        applicable: true,
        passed: false,
      });
      expect(blockedReview?.findings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: "contract.terminal-review-not-clean",
          }),
        ]),
      );
      expect(missingReviewInput?.workflow_integrity).toMatchObject({
        applicable: true,
        passed: false,
      });
      expect(missingReviewInput?.findings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: "contract.review-input-not-required",
          }),
        ]),
      );
    });

    it("accepts native semantic headings and paragraphs without requiring Salt Text", () => {
      const mcp = gamingReport.tasks
        .find((task) => task.id === "settings-native-semantic-text")
        ?.conditions.find(
          (condition) => condition.condition_id === "mcp_assisted",
        );

      expect(
        mcp?.artifact_quality.criteria.find(
          (criterion) => criterion.id === "required_salt_surface_present",
        ),
      ).toMatchObject({ passed: true, findings: [] });
      expect(
        mcp?.artifact_quality.criteria.find(
          (criterion) => criterion.id === "composition_valid",
        ),
      ).toMatchObject({ passed: true, findings: [] });
      expect(mcp?.workflow_integrity).toMatchObject({ passed: true });
    });
  });
});
