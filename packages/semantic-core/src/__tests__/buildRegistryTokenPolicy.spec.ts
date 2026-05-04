import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildTokenPolicySourceRegistry,
  getTokenPolicy,
} from "../build/buildRegistryTokenPolicy.js";
import { extractTokens } from "../build/buildRegistryTokens.js";

// All Salt-looking strings in this file are intentionally tiny fixture facts.

async function writeFixturePolicyRepo(repoRoot: string): Promise<void> {
  await fs.mkdir(path.join(repoRoot, "site/docs/themes/design-tokens"), {
    recursive: true,
  });
  await fs.mkdir(path.join(repoRoot, "site/docs/foundations/fixture-area"), {
    recursive: true,
  });
  await fs.writeFile(
    path.join(repoRoot, "site/docs/themes/design-tokens/index.mdx"),
    `---
title: Fixture design tokens
---

Foundation tokens are the base-level tokens that reference raw values at the core of the fixture design system. Foundations can sometimes be referenced directly, depending on the fixture use case.
`,
    "utf8",
  );
  await fs.writeFile(
    path.join(repoRoot, "site/docs/foundations/fixture-area/index.mdx"),
    `---
title: Fixture area
---

Fixture tokens help manage fixture spacing in fixture layouts.

- Use the \`--salt-fixture-gap\` token to set fixture gaps.
`,
    "utf8",
  );
}

describe("token policy source registry", () => {
  it("indexes fixture foundation docs by exact token families and preserves EvidenceRefs", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-token-policy-fixture-"),
    );

    try {
      await writeFixturePolicyRepo(repoRoot);

      const sources = await buildTokenPolicySourceRegistry(repoRoot);
      const policy = getTokenPolicy(
        {
          name: "--salt-fixture-gap",
          category: "fixture",
        },
        sources,
      );

      expect(policy).toEqual(
        expect.objectContaining({
          usage_tier: "foundation",
          direct_component_use: "conditional",
          docs: [
            "/salt/foundations/fixture-area/index",
            "/salt/themes/design-tokens/index",
          ],
          preferred_for: expect.arrayContaining([
            expect.stringContaining(
              "Fixture tokens help manage fixture spacing",
            ),
          ]),
          evidence_refs: expect.arrayContaining([
            expect.objectContaining({
              source_kind: "docs",
              claim_kind: "token",
              source: expect.objectContaining({
                url: "/salt/foundations/fixture-area/index",
                repo_path: "site/docs/foundations/fixture-area/index.mdx",
              }),
            }),
          ]),
        }),
      );
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("keeps fixture token families without source-backed docs unsupported", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-token-policy-gap-fixture-"),
    );

    try {
      await writeFixturePolicyRepo(repoRoot);

      const sources = await buildTokenPolicySourceRegistry(repoRoot);

      expect(
        getTokenPolicy(
          {
            name: "--salt-undocumented-gap",
            category: "undocumented",
          },
          sources,
        ),
      ).toBeNull();
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("builds fixture deprecated replacement policy from source-backed token comments and docs", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-token-policy-deprecated-fixture-"),
    );

    try {
      await writeFixturePolicyRepo(repoRoot);

      const sources = await buildTokenPolicySourceRegistry(repoRoot);
      const policy = getTokenPolicy(
        {
          name: "--salt-legacyfixture-icon",
          category: "legacyfixture",
          source_paths: ["packages/theme/css/deprecated/fixture.css"],
          deprecated_replacements: ["--salt-fixture-gap"],
        },
        sources,
      );

      expect(policy).toEqual(
        expect.objectContaining({
          usage_tier: "foundation",
          direct_component_use: "conditional",
          docs: [
            "/salt/foundations/fixture-area/index",
            "/salt/themes/design-tokens/index",
          ],
          notes: expect.arrayContaining([
            expect.stringContaining(
              "Use the --salt-fixture-gap token to set fixture gaps",
            ),
          ]),
          evidence_refs: expect.arrayContaining([
            expect.objectContaining({
              source_kind: "docs",
              claim_kind: "token",
              source: expect.objectContaining({
                url: "/salt/foundations/fixture-area/index",
              }),
            }),
            expect.objectContaining({
              source_kind: "token",
              claim_kind: "token",
              source: {
                repo_path: "packages/theme/css/deprecated/fixture.css",
              },
            }),
          ]),
        }),
      );
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("extracts fixture deprecated replacement comments from token CSS into policy evidence", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-token-policy-css-fixture-"),
    );

    try {
      await writeFixturePolicyRepo(repoRoot);
      await fs.mkdir(path.join(repoRoot, "packages/theme/css/foundations"), {
        recursive: true,
      });
      await fs.mkdir(path.join(repoRoot, "packages/theme/css/deprecated"), {
        recursive: true,
      });
      await fs.writeFile(
        path.join(repoRoot, "packages/theme/css/foundations/fixture.css"),
        `.salt-theme {
  --salt-fixture-gap: 8px;
}
`,
        "utf8",
      );
      await fs.writeFile(
        path.join(repoRoot, "packages/theme/css/deprecated/foundations.css"),
        `.salt-theme {
  --salt-legacyfixture-icon: 10px; /* Use --salt-fixture-gap */
}
`,
        "utf8",
      );

      const sources = await buildTokenPolicySourceRegistry(repoRoot);
      const tokens = await extractTokens(
        repoRoot,
        "2026-05-04T00:00:00Z",
        sources,
      );
      const token = tokens.find(
        (candidate) => candidate.name === "--salt-legacyfixture-icon",
      );

      expect(token).toEqual(
        expect.objectContaining({
          deprecated: true,
          policy: expect.objectContaining({
            docs: [
              "/salt/foundations/fixture-area/index",
              "/salt/themes/design-tokens/index",
            ],
            evidence_refs: expect.arrayContaining([
              expect.objectContaining({
                source_kind: "token",
                source: {
                  repo_path: "packages/theme/css/deprecated/foundations.css",
                },
              }),
            ]),
          }),
        }),
      );
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("extracts fixture deprecated category replacement comments from token CSS into policy evidence", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-token-policy-css-category-fixture-"),
    );

    try {
      await writeFixturePolicyRepo(repoRoot);
      await fs.mkdir(path.join(repoRoot, "packages/theme/css/foundations"), {
        recursive: true,
      });
      await fs.mkdir(path.join(repoRoot, "packages/theme/css/deprecated"), {
        recursive: true,
      });
      await fs.writeFile(
        path.join(repoRoot, "packages/theme/css/foundations/fixture.css"),
        `.salt-theme {
  --salt-fixture-gap: 8px;
}
`,
        "utf8",
      );
      await fs.writeFile(
        path.join(repoRoot, "packages/theme/css/deprecated/foundations.css"),
        `/*
* **Deprecated:** Use fixture instead
*/
.salt-theme {
  /* Legacyfixture */
  --salt-legacyfixture-gap: 10px;

  /* Otherfixture */
  --salt-otherfixture-gap: 12px;
}
`,
        "utf8",
      );

      const sources = await buildTokenPolicySourceRegistry(repoRoot);
      const tokens = await extractTokens(
        repoRoot,
        "2026-05-04T00:00:00Z",
        sources,
      );
      const closedToken = tokens.find(
        (candidate) => candidate.name === "--salt-legacyfixture-gap",
      );
      const unsupportedToken = tokens.find(
        (candidate) => candidate.name === "--salt-otherfixture-gap",
      );

      expect(closedToken).toEqual(
        expect.objectContaining({
          deprecated: true,
          policy: expect.objectContaining({
            docs: [
              "/salt/foundations/fixture-area/index",
              "/salt/themes/design-tokens/index",
            ],
            evidence_refs: expect.arrayContaining([
              expect.objectContaining({
                source_kind: "token",
                source: {
                  repo_path: "packages/theme/css/deprecated/foundations.css",
                },
              }),
            ]),
          }),
        }),
      );
      expect(unsupportedToken?.policy).toBeNull();
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });
});
