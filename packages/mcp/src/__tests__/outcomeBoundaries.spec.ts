import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { detectedValidationFindingCount } from "../core/review/reviewSaltCode.js";
import {
  reviewSaltCode,
  type SaltCatalogRuntimeContext,
  searchSalt,
} from "../core/runtime.js";
import { inspectSaltProject } from "../server/inspectSaltProject.js";
import {
  createVerifiedCatalogTestContext,
  VERIFIED_CATALOG_CONTEXT_TEST_TIMEOUT_MS,
} from "./registryTestUtils.js";

const PRIVATE_CONTROL_PATTERN =
  /salt_workflow_v1|post_action|implementation_ready|canonical_complete|exact_request_safe|repo_specific_workflows_ready|finish_without_changes|can_generate_fix|static_fix_blockers|choice_precedence|final_choice|final_recommendation|canonical_choice/iu;
let catalogDirectory = "";
let context: SaltCatalogRuntimeContext;
let projectRoot = "";
let disposeCatalogFixture: () => Promise<void> = async () => undefined;

beforeAll(async () => {
  const [verified, createdProjectRoot] = await Promise.all([
    createVerifiedCatalogTestContext("salt-outcome-boundaries-"),
    fs.mkdtemp(path.join(os.tmpdir(), "salt-outcome-project-")),
  ]);
  catalogDirectory = verified.registryDir;
  context = verified.runtime;
  disposeCatalogFixture = verified.dispose;
  projectRoot = createdProjectRoot;
  await fs.mkdir(path.join(projectRoot, ".salt"), { recursive: true });
  await Promise.all([
    fs.writeFile(
      path.join(projectRoot, "package.json"),
      JSON.stringify({
        name: "outcome-policy-fixture",
        private: true,
        dependencies: { "@salt-ds/core": "^2.0.0" },
      }),
      "utf8",
    ),
    fs.writeFile(
      path.join(projectRoot, ".salt", "team.json"),
      JSON.stringify({
        contract: "project_conventions_v1",
        version: "1.0.0",
        project: "outcome-policy-fixture",
        supported_salt_range: "^2.0.0",
        preferred_components: [
          {
            salt_name: "Button",
            prefer: "ProductButton",
            reason: "Use the established wrapper where applicable.",
          },
        ],
        approved_wrappers: [
          {
            name: "ProductButton",
            wraps: "Button",
            reason: "Use only for established product actions.",
            import: {
              from: "./src/ProductButton",
              name: "ProductButton",
            },
            use_when: ["product action is established"],
            avoid_when: ["applicability is unknown"],
          },
        ],
        token_aliases: [
          {
            salt_name: "--salt-spacing-100",
            prefer: "--product-space-small",
            reason: "Product semantic alias.",
          },
        ],
        token_family_policies: [
          {
            family: "spacing",
            mode: "allow-local-aliases",
            reason: "Aliases are allowed but not mandatory.",
          },
        ],
        theme_defaults: {
          provider: "SaltProvider",
          props: [{ name: "mode", value: "light" }],
          reason: "Project theme declaration.",
        },
        pattern_preferences: [
          {
            intent: "upload documents",
            prefer: "ProductUploadFlow",
            canonical_salt_start: "File upload",
            reason: "Product flow adds domain steps.",
          },
        ],
        banned_choices: [
          {
            name: "LegacyProductButton",
            reason: "Removed from this project.",
          },
        ],
      }),
      "utf8",
    ),
  ]);
}, VERIFIED_CATALOG_CONTEXT_TEST_TIMEOUT_MS);

afterAll(async () => {
  await Promise.all([
    disposeCatalogFixture(),
    ...(projectRoot
      ? [fs.rm(projectRoot, { recursive: true, force: true })]
      : []),
  ]);
});

describe("MCP negative outcome boundaries", () => {
  it("keeps detected review totals independent from materialized issue caps", () => {
    expect(
      detectedValidationFindingCount({ errors: 20, warnings: 30, infos: 25 }),
    ).toBe(75);
    expect(
      detectedValidationFindingCount({ errors: 0, warnings: 0, infos: 0 }),
    ).toBe(0);
  });

  it("R1 returns ranked candidates and evidence without choosing or sequencing work", () => {
    const result = searchSalt(context.store, {
      query: "button action",
      families: ["component", "pattern"],
      limit: 5,
    });

    expect(result.data.matches.length).toBeGreaterThan(0);
    expect(result.scope).toMatchObject({
      kind: "catalog_search",
      returned: result.data.matches.length,
    });
    for (const match of result.data.matches) {
      expect(match.uri).toMatch(
        /^salt:\/\/catalog\/v2\/sha256-[0-9a-f]{64}\//u,
      );
      expect(match.evidence.score).toBeGreaterThan(0);
      expect(match).not.toHaveProperty("selected");
      expect(match).not.toHaveProperty("recommended_action");
    }
    expect(JSON.stringify(result)).not.toMatch(PRIVATE_CONTROL_PATTERN);
  });

  it("R4 preserves bounded project-policy observations as labelled untrusted data without projecting a fix", async () => {
    const result = await inspectSaltProject(
      {
        root_dir: projectRoot,
        include_policy_ir: true,
      },
      {
        mode: "restricted",
        allowedRoots: [projectRoot],
        defaultRoot: projectRoot,
      },
    );
    const ir = result.data.policy?.ir;

    expect(ir).not.toBeNull();
    expect(ir?.untrusted_ir).toMatchObject({
      encoding: "json",
      text: expect.any(String),
    });
    const fullIr = JSON.parse(ir?.untrusted_ir?.text ?? "{}") as {
      occurrences?: Array<{
        category: string;
        declaration: Record<string, unknown>;
        provenance: { layer_id: string; json_pointer: string };
        rule_precedence: number | null;
      }>;
    };
    const occurrences = fullIr.occurrences ?? [];
    expect(occurrences.map((entry) => entry.category)).toEqual(
      expect.arrayContaining([
        "preferred_component",
        "approved_wrapper",
        "token_alias",
        "theme_defaults",
        "token_family_policy",
        "pattern_preference",
        "banned_choice",
      ]),
    );
    const approvedWrapper = occurrences.find(
      (entry) => entry.category === "approved_wrapper",
    );
    expect(approvedWrapper).toMatchObject({
      declaration: {
        name: "ProductButton",
        use_when: ["product action is established"],
        avoid_when: ["applicability is unknown"],
      },
      provenance: {
        layer_id: "team-policy",
        json_pointer: expect.any(String),
      },
    });
    const tokenFamilyPolicy = occurrences.find(
      (entry) => entry.category === "token_family_policy",
    );
    expect(tokenFamilyPolicy).toMatchObject({
      declaration: { mode: "allow-local-aliases" },
    });
    expect(result.scope).toMatchObject({
      kind: "configured_project_inspection",
      filesystem_access: "read_only",
      authorization: "restricted",
    });
    expect(result.data.policy).not.toHaveProperty("fix");
    expect(result.data.policy).not.toHaveProperty("selected_choice");
    expect(result.data.policy).not.toHaveProperty("evaluation");
    expect(result.data.installation).not.toHaveProperty("health");
    expect(result.data.installation).not.toHaveProperty("reasons");
    expect(result.data.installation).not.toHaveProperty("remediation");
    expect(result.data.installation).not.toHaveProperty("health_summary");
    expect(result.data.installation).not.toHaveProperty("recommended_action");
    expect(result.data.installation).not.toHaveProperty("blocking_workflows");
    for (const occurrence of occurrences) {
      expect(occurrence).not.toHaveProperty("can_generate_fix");
      expect(occurrence).not.toHaveProperty("static_fix_blockers");
      expect(occurrence).not.toHaveProperty("choice_precedence");
      expect(occurrence).toHaveProperty("rule_precedence");
    }
    expect(JSON.stringify(result)).not.toMatch(PRIVATE_CONTROL_PATTERN);
  });

  it("R4 evaluates policy while omitting inline details by default", async () => {
    const result = await inspectSaltProject(
      {
        root_dir: projectRoot,
        include_policy_ir: false,
      },
      {
        mode: "restricted",
        allowedRoots: [projectRoot],
        defaultRoot: projectRoot,
      },
    );

    expect(result.data.policy).toMatchObject({
      mode: "team",
      ir: {
        contract: "salt_project_policy_ir_v2",
        untrusted_ir: null,
      },
      import_targets: {
        untrusted_diagnostics: null,
      },
    });
    expect(result.coverage.policy).toBe("policy_ir_evaluated");
    expect(JSON.stringify(result)).not.toMatch(PRIVATE_CONTROL_PATTERN);
  });

  it("R9 reports no findings only within the submitted-text scope", () => {
    const result = reviewSaltCode(context, {
      artifacts: [
        {
          id: "clean.tsx",
          language: "tsx",
          text: [
            'import { Button } from "@salt-ds/core";',
            "export function Clean() {",
            "  return <Button>Save</Button>;",
            "}",
          ].join("\n"),
        },
      ],
    });

    expect(result.data.results[0]?.outcome).toBe(
      "no_findings_in_evaluated_scope",
    );
    expect(result.scope).toMatchObject({
      kind: "submitted_text_only",
      artifact_count: 1,
    });
    expect(result.limitations.join(" ")).toMatch(/not submitted/iu);
    expect(JSON.stringify(result)).not.toMatch(PRIVATE_CONTROL_PATTERN);
  });

  it("R9 never reports an unevaluated blank artifact as AST-reviewed", () => {
    const result = reviewSaltCode(context, {
      artifacts: [{ id: "blank.tsx", language: "tsx", text: " \n\t" }],
    });

    expect(result.data.results[0]).toMatchObject({
      outcome: "not_evaluated",
      summary: { errors: 0, warnings: 0, infos: 0 },
      findings: [],
      coverage: {
        parser: "not_run",
        evaluated_rule_ids: [],
        skipped_rule_matches: 0,
      },
      limitations: ["No submitted source text was available to parse."],
    });
    expect(result.coverage.location_encoding).toBe("utf8_bytes_end_exclusive");
  });

  it("R10 ignores comments, strings, and type-only text but detects real JSX", () => {
    const harmless = reviewSaltCode(context, {
      artifacts: [
        {
          id: "historical.tsx",
          language: "tsx",
          text: [
            'import type { ButtonProps } from "@salt-ds/core";',
            '// Historical example: <Button href="/next">Go</Button>',
            'const history = `<Button href="/next">Go</Button>`;',
            "export type Snapshot = ButtonProps & { history: typeof history };",
          ].join("\n"),
        },
      ],
    });
    const actualSource = [
      'import { Button } from "@salt-ds/core";',
      "export function Actual() {",
      '  return <Button href="/next">Go</Button>;',
      "}",
    ].join("\n");
    const actual = reviewSaltCode(context, {
      artifacts: [
        {
          id: "actual.tsx",
          language: "tsx",
          text: actualSource,
        },
      ],
    });

    expect(harmless.data.results[0]).toMatchObject({
      outcome: "no_findings_in_evaluated_scope",
      findings: [],
    });
    expect(actual.data.results[0]?.outcome).toBe("findings");
    expect(actual.data.results[0]?.artifact).toEqual({
      id: "actual.tsx",
      language: "tsx",
      utf8_bytes: Buffer.byteLength(actualSource, "utf8"),
      content_digest: `sha256:${createHash("sha256").update(actualSource, "utf8").digest("hex")}`,
    });
    expect(actual.data.results[0]?.findings.length).toBeGreaterThan(0);
    for (const finding of actual.data.results[0]?.findings ?? []) {
      expect(finding).toMatchObject({
        id: expect.any(String),
        rule_id: expect.any(String),
        parsed_fact: expect.objectContaining({ certainty: "known" }),
        location: expect.objectContaining({
          start_offset: expect.any(Number),
          end_offset: expect.any(Number),
        }),
        evidence: {
          submitted_artifact_id: "actual.tsx",
          references: expect.any(Array),
          validation: "source_bound",
        },
      });
      expect(finding.evidence.submitted_artifact_id).toBe(
        actual.data.results[0]?.artifact.id,
      );
      expect(JSON.stringify(finding.evidence.references)).not.toContain(
        "submitted_text",
      );
    }
  });
});
