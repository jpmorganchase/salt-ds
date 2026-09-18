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
    const first = analyzeSaltCode({ reviewCatalog: storeCatalog, store }, input);
    const second = analyzeSaltCode({ reviewCatalog: storeCatalog, store }, input);
    expect(canonicalJson(second)).toBe(canonicalJson(first));
  });
});
