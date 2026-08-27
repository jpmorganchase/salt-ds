import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { SOURCE_REGISTRY_BUILD_TEST_TIMEOUT_MS } from "./registryTestUtils.js";
import { buildRegistry } from "../build/buildRegistry.js";
import { canonicalJson } from "../catalog/catalogSerialization.js";
import { createCatalogStoreV2 } from "../catalog/catalogStoreV2.js";
import { loadRegistry } from "../registry/loadRegistry.js";
import {
  createReviewCatalogFromStore,
  type ReviewCatalog,
} from "../review/reviewCatalogAdapter.js";
import { createReviewCatalogFromLegacyRegistry } from "../review/reviewLegacyCatalogAdapter.js";
import { analyzeSaltCode } from "../review/reviewSaltCode.js";

const REPO_ROOT = path.resolve(import.meta.dirname, "../../../..");
let outputDirectory = "";
let legacyCatalog: ReviewCatalog;
let storeCatalog: ReviewCatalog;
let store: ReturnType<typeof createCatalogStoreV2>;

beforeAll(async () => {
  outputDirectory = await fs.mkdtemp(
    path.join(os.tmpdir(), "salt-review-catalog-adapter-"),
  );
  await buildRegistry({
    sourceRoot: REPO_ROOT,
    outputDir: outputDirectory,
    sourceRevision: "review-catalog-adapter-test-source",
    generatorVersion: "2.0.0-test",
    generatorDigest: `sha256:${"3".repeat(64)}`,
  });
  const legacy = await loadRegistry({
    registryDir: outputDirectory,
    prefetch: true,
  });
  store = createCatalogStoreV2({ registryDir: outputDirectory });
  store.ensureCatalogVerified();
  legacyCatalog = createReviewCatalogFromLegacyRegistry(legacy);
  storeCatalog = createReviewCatalogFromStore(store);
}, SOURCE_REGISTRY_BUILD_TEST_TIMEOUT_MS);

afterAll(async () => {
  if (outputDirectory) {
    await fs.rm(outputDirectory, { recursive: true, force: true });
  }
});

describe("review catalog adapter", () => {
  it("matches the narrow legacy review view", () => {
    expect(canonicalJson(storeCatalog)).toBe(canonicalJson(legacyCatalog));
    expect(Object.keys(storeCatalog).sort()).toEqual([
      "components",
      "deprecations",
      "semanticDigest",
      "tokens",
      "version",
    ]);
  });

  it("preserves review results across legacy and store-backed views", () => {
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
    const legacyResult = analyzeSaltCode(
      { reviewCatalog: legacyCatalog, store },
      input,
    );
    const storeResult = analyzeSaltCode(
      { reviewCatalog: storeCatalog, store },
      input,
    );
    expect(canonicalJson(storeResult)).toBe(canonicalJson(legacyResult));
  });
});
