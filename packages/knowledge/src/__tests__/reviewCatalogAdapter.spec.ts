import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { canonicalJson } from "../catalog/catalogSerialization.js";
import {
  createKnowledgeStore,
  type KnowledgeStore,
} from "../manifest/knowledgeStore.js";
import {
  createReviewCatalogFromStore,
  type ReviewCatalog,
} from "../review/reviewCatalogAdapter.js";
import { analyzeSaltCode } from "../review/reviewSaltCode.js";

const REPO_ROOT = path.resolve(import.meta.dirname, "../../../..");
let storeCatalog: ReviewCatalog;
let store: KnowledgeStore;

beforeAll(() => {
  store = createKnowledgeStore({
    bundleDir: path.join(REPO_ROOT, "packages/knowledge/generated"),
  });
  store.ensureKnowledgeVerified();
  storeCatalog = createReviewCatalogFromStore(store);
});

describe("review catalog adapter", () => {
  it("exposes only the narrow Knowledge-v1 review view", () => {
    expect(Object.keys(storeCatalog).sort()).toEqual([
      "components",
      "deprecations",
      "semanticDigest",
      "tokens",
      "version",
    ]);
  });

  it("produces deterministic review results from the Knowledge-v1 store", () => {
    const input = {
      artifacts: [
        {
          id: "review.tsx",
          language: "tsx" as const,
          text: [
            'import { Button, LineChartIcon } from "@salt-ds/core";',
            "export function ReviewFixture() {",
            '  return <Button href="/next" variant="primary">',
            "    <LineChartIcon />",
            "  </Button>;",
            "}",
          ].join("\n"),
        },
        {
          id: "review.css",
          language: "css" as const,
          text: ".fixture { color: var(--salt-text-link-foreground-disabled); }",
        },
      ],
      package_versions: { "@salt-ds/core": "1.36.0" },
    };
    const first = analyzeSaltCode(
      { reviewCatalog: storeCatalog, store },
      input,
    );
    const second = analyzeSaltCode(
      { reviewCatalog: storeCatalog, store },
      input,
    );
    expect(canonicalJson(second)).toBe(canonicalJson(first));
    expect(canonicalJson(first)).not.toMatch(
      /policy_evaluation|project_policy|project_policy_digest/u,
    );
    expect(
      first.results.every((result) => !("policy" in result.coverage)),
    ).toBe(true);
  });

  it("allows the isolated scanner to lower per-file execution ceilings", () => {
    const result = analyzeSaltCode(
      { reviewCatalog: storeCatalog, store },
      {
        artifacts: [
          {
            id: "limited.tsx",
            language: "tsx",
            text: 'import { Button } from "@salt-ds/core"; export const Demo = () => <Button />;',
          },
        ],
      },
      null,
      "caller_package_versions",
      { max_ast_nodes_per_artifact: 1 },
    );
    expect(result.results[0]).toMatchObject({
      outcome: "not_evaluated",
      findings: [],
      coverage: { parser: "limited", evaluated_rule_ids: [] },
    });
  });

  it("keeps transport defaults intact while permitting a bounded scanner byte ceiling", () => {
    const text = " ".repeat(300 * 1024);
    const input = {
      artifacts: [{ id: "large.ts", language: "typescript" as const, text }],
    };
    expect(() =>
      analyzeSaltCode({ reviewCatalog: storeCatalog, store }, input),
    ).toThrow(/at most 262144 UTF-8 bytes per artifact/u);
    expect(() =>
      analyzeSaltCode(
        { reviewCatalog: storeCatalog, store },
        input,
        null,
        "caller_package_versions",
        { max_artifact_utf8_bytes: 300 * 1024 },
      ),
    ).not.toThrow();
  });

  it.each([
    { max_artifact_utf8_bytes: 0 },
    { max_ast_nodes_per_artifact: 1_000_001 },
    { max_facts_per_artifact: 100_001 },
    { max_rule_comparisons_per_artifact: 250_001 },
  ])("rejects an invalid scanner execution limit %#", (executionLimits) => {
    expect(() =>
      analyzeSaltCode(
        { reviewCatalog: storeCatalog, store },
        {
          artifacts: [
            { id: "valid.ts", language: "typescript", text: "export {};" },
          ],
        },
        null,
        "caller_package_versions",
        executionLimits,
      ),
    ).toThrow(RangeError);
  });
});
