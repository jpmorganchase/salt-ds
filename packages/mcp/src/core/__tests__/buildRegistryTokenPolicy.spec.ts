import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildTokenPolicySourceRegistry,
  getTokenPolicy,
  getTokenPolicyGap,
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
- Use the \`--salt-fixture-primary-gap\` token to set primary fixture gaps.
`,
    "utf8",
  );
}

async function writeFixtureThemeChangelog(
  repoRoot: string,
  content: string,
): Promise<void> {
  await fs.mkdir(path.join(repoRoot, "packages/theme"), {
    recursive: true,
  });
  await fs.writeFile(
    path.join(repoRoot, "packages/theme/CHANGELOG.md"),
    content,
    "utf8",
  );
}

async function writeFixtureTokenReplacementMetadata(
  repoRoot: string,
  entries: unknown[],
): Promise<void> {
  await fs.mkdir(path.join(repoRoot, "packages/theme/css/deprecated"), {
    recursive: true,
  });
  await fs.writeFile(
    path.join(
      repoRoot,
      "packages/theme/css/deprecated/token-replacements.json",
    ),
    `${JSON.stringify(
      {
        schema: "salt_theme_deprecated_token_replacements_v1",
        entries,
      },
      null,
      2,
    )}\n`,
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

  it("maps characteristic docs from canonical category lists and token tables", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-token-policy-characteristic-fixture-"),
    );

    try {
      await fs.mkdir(path.join(repoRoot, "site/docs/themes/design-tokens"), {
        recursive: true,
      });
      await fs.mkdir(
        path.join(repoRoot, "packages/theme/css/next/characteristics"),
        { recursive: true },
      );
      await fs.writeFile(
        path.join(repoRoot, "site/docs/themes/design-tokens/index.mdx"),
        `---
title: Fixture design tokens
---

Characteristics are groups of semantic tokens with a specific purpose. These tokens are always referenced in components and patterns.
`,
        "utf8",
      );
      await fs.writeFile(
        path.join(
          repoRoot,
          "site/docs/themes/design-tokens/container-characteristic.mdx",
        ),
        `---
title: Container characteristic
---

## Drop target

Target tokens identify an eligible fixture drop target.

<TokenTableWithControls
  tokens={["--salt-target-background-hover", "--salt-size-fixed-100"]}
/>
`,
        "utf8",
      );
      await fs.writeFile(
        path.join(
          repoRoot,
          "site/docs/themes/design-tokens/how-to-read-tokens.mdx",
        ),
        `---
title: How to read fixture tokens
---

## Characteristic

Characteristics are groups of semantic tokens that share a purpose.

- [Container](/salt/themes/design-tokens/container-characteristic)
- Focused
- Target
- Text

### Focused

Focused fixture tokens define the shared fixture focus outline.

### Text

Text fixture tokens define fixture typography roles.
`,
        "utf8",
      );
      await Promise.all(
        ["container", "focused", "target", "text"].map((category) =>
          fs.writeFile(
            path.join(
              repoRoot,
              `packages/theme/css/next/characteristics/${category}.css`,
            ),
            ".salt-theme {}\n",
            "utf8",
          ),
        ),
      );

      const sources = await buildTokenPolicySourceRegistry(repoRoot);
      const targetPolicy = getTokenPolicy(
        {
          name: "--salt-target-background-hover",
          category: "target",
        },
        sources,
      );
      const focusedPolicy = getTokenPolicy(
        {
          name: "--salt-focused-outlineColor",
          category: "focused",
        },
        sources,
      );
      const textPolicy = getTokenPolicy(
        {
          name: "--salt-text-fontWeight",
          category: "text",
        },
        sources,
      );

      expect(targetPolicy?.docs).toEqual([
        "/salt/themes/design-tokens/container-characteristic",
        "/salt/themes/design-tokens/index",
      ]);
      expect(focusedPolicy?.docs).toEqual([
        "/salt/themes/design-tokens/how-to-read-tokens",
        "/salt/themes/design-tokens/index",
      ]);
      expect(textPolicy?.docs).toEqual([
        "/salt/themes/design-tokens/how-to-read-tokens",
        "/salt/themes/design-tokens/index",
      ]);
      expect(focusedPolicy?.preferred_for).toContain(
        "Focused fixture tokens define the shared fixture focus outline.",
      );
      expect(textPolicy?.preferred_for).toContain(
        "Text fixture tokens define fixture typography roles.",
      );
      expect(
        getTokenPolicy(
          {
            name: "--salt-size-fixed-100",
            category: "size",
          },
          sources,
        ),
      ).toBeNull();
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

  it("extracts fixture deprecated value references from token CSS into policy evidence", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-token-policy-css-value-fixture-"),
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
  --salt-legacyfixture-gap: var(--salt-fixture-gap);
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
        (candidate) => candidate.name === "--salt-legacyfixture-gap",
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
                source: expect.objectContaining({
                  repo_path: "packages/theme/css/deprecated/foundations.css",
                  section: expect.stringContaining(
                    "--salt-legacyfixture-gap: var(--salt-fixture-gap)",
                  ),
                  line_start: 2,
                  line_end: 2,
                }),
              }),
            ]),
          }),
        }),
      );
      expect(
        [
          ...(token?.policy?.preferred_for ?? []),
          ...(token?.policy?.notes ?? []),
        ].some((claim) => claim.includes("--salt-legacyfixture-gap:")),
      ).toBe(false);
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("keeps fixture explicit replacement comments ahead of deprecated value references", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-token-policy-css-value-comment-fixture-"),
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
  --salt-legacyfixture-gap: var(--salt-fixture-gap); /* Use --salt-undocumented-gap */
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
        (candidate) => candidate.name === "--salt-legacyfixture-gap",
      );

      expect(token).toEqual(
        expect.objectContaining({
          deprecated: true,
          policy: null,
        }),
      );
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("keeps fixture metadata replacements ahead of deprecated value references", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-token-policy-css-value-metadata-fixture-"),
    );

    try {
      await writeFixturePolicyRepo(repoRoot);
      await writeFixtureTokenReplacementMetadata(repoRoot, [
        {
          deprecated: "--salt-legacyfixture-gap",
          replacements: ["--salt-fixture-gap"],
          replacement_kind: "direct",
          basis: {
            source_path: "packages/theme/CHANGELOG.md",
            line_start: 5,
            line_end: 5,
          },
        },
      ]);
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
  --salt-legacyfixture-gap: var(--salt-undocumented-gap);
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
        (candidate) => candidate.name === "--salt-legacyfixture-gap",
      );

      expect(token).toEqual(
        expect.objectContaining({
          deprecated: true,
          policy: expect.objectContaining({
            evidence_refs: expect.arrayContaining([
              expect.objectContaining({
                source: expect.objectContaining({
                  repo_path:
                    "packages/theme/css/deprecated/token-replacements.json",
                }),
              }),
            ]),
          }),
        }),
      );
      expect(
        token?.policy?.evidence_refs?.some((ref) =>
          ref.source?.section?.includes("--salt-undocumented-gap"),
        ),
      ).toBe(false);
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

  it("extracts fixture deprecated replacement tables from source-backed changelog evidence", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-token-policy-changelog-fixture-"),
    );

    try {
      await writeFixturePolicyRepo(repoRoot);
      await writeFixtureThemeChangelog(
        repoRoot,
        `## Fixture

| Name                         | Replacement          |
| ---------------------------- | -------------------- |
| \`--salt-legacyfixture-gap\` | \`--salt-fixture-gap\` |
`,
      );

      const sources = await buildTokenPolicySourceRegistry(repoRoot);
      const policy = getTokenPolicy(
        {
          name: "--salt-legacyfixture-gap",
          category: "legacyfixture",
        },
        sources,
      );

      expect(policy).toEqual(
        expect.objectContaining({
          usage_tier: "foundation",
          direct_component_use: "conditional",
          evidence_refs: expect.arrayContaining([
            expect.objectContaining({
              source_kind: "docs",
              claim_kind: "token",
              source: expect.objectContaining({
                repo_path: "packages/theme/CHANGELOG.md",
                line_start: 5,
                line_end: 5,
              }),
            }),
          ]),
        }),
      );
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("extracts fixture deprecated replacements from theme-owned token metadata", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-token-policy-metadata-fixture-"),
    );

    try {
      await writeFixturePolicyRepo(repoRoot);
      await writeFixtureTokenReplacementMetadata(repoRoot, [
        {
          deprecated: "--salt-legacyfixture-gap",
          replacements: ["--salt-fixture-gap"],
          replacement_kind: "direct",
          note: "Fixture replacement metadata.",
          basis: {
            source_path: "packages/theme/CHANGELOG.md",
            line_start: 5,
            line_end: 5,
          },
        },
      ]);

      const sources = await buildTokenPolicySourceRegistry(repoRoot);
      const policy = getTokenPolicy(
        {
          name: "--salt-legacyfixture-gap",
          category: "legacyfixture",
        },
        sources,
      );

      expect(policy).toEqual(
        expect.objectContaining({
          docs: [
            "/salt/foundations/fixture-area/index",
            "/salt/themes/design-tokens/index",
          ],
          evidence_refs: expect.arrayContaining([
            expect.objectContaining({
              source_kind: "token",
              claim_kind: "token",
              source: expect.objectContaining({
                repo_path:
                  "packages/theme/css/deprecated/token-replacements.json",
                section: expect.stringContaining(
                  "--salt-legacyfixture-gap -> --salt-fixture-gap",
                ),
                line_start: 5,
                line_end: 5,
              }),
            }),
          ]),
        }),
      );
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("uses fixture current CSS token declarations as final replacement evidence without adding raw-value guidance", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-token-policy-css-source-fixture-"),
    );

    try {
      await writeFixturePolicyRepo(repoRoot);
      await fs.mkdir(path.join(repoRoot, "packages/theme/css/foundations"), {
        recursive: true,
      });
      await fs.writeFile(
        path.join(repoRoot, "packages/theme/css/foundations/fixture.css"),
        `.salt-theme {
  --salt-fixture-source-backed-gap: 12px;
}
`,
        "utf8",
      );
      await writeFixtureTokenReplacementMetadata(repoRoot, [
        {
          deprecated: "--salt-legacyfixture-gap",
          replacements: ["--salt-fixture-source-backed-gap"],
          replacement_kind: "direct",
          basis: {
            source_path: "packages/theme/CHANGELOG.md",
            line_start: 5,
            line_end: 5,
          },
        },
      ]);

      const sources = await buildTokenPolicySourceRegistry(repoRoot);
      const policy = getTokenPolicy(
        {
          name: "--salt-legacyfixture-gap",
          category: "legacyfixture",
        },
        sources,
      );

      expect(policy).toEqual(
        expect.objectContaining({
          docs: [
            "/salt/foundations/fixture-area/index",
            "/salt/themes/design-tokens/index",
          ],
          evidence_refs: expect.arrayContaining([
            expect.objectContaining({
              source_kind: "token",
              source: expect.objectContaining({
                repo_path: "packages/theme/css/foundations/fixture.css",
                section: expect.stringContaining(
                  "--salt-fixture-source-backed-gap",
                ),
                line_start: 2,
                line_end: 2,
              }),
            }),
          ]),
        }),
      );
      expect(
        [...(policy?.preferred_for ?? []), ...(policy?.notes ?? [])].some(
          (claim) =>
            claim.includes("--salt-fixture-source-backed-gap:") ||
            claim.includes("12px"),
        ),
      ).toBe(false);
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("keeps fixture metadata replacements unsupported when the final token declaration is deprecated-only", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-token-policy-deprecated-source-fixture-"),
    );

    try {
      await writeFixturePolicyRepo(repoRoot);
      await fs.mkdir(path.join(repoRoot, "packages/theme/css/deprecated"), {
        recursive: true,
      });
      await fs.writeFile(
        path.join(repoRoot, "packages/theme/css/deprecated/foundations.css"),
        `.salt-theme {
  --salt-fixture-deprecated-gap: 12px;
}
`,
        "utf8",
      );
      await writeFixtureTokenReplacementMetadata(repoRoot, [
        {
          deprecated: "--salt-legacyfixture-gap",
          replacements: ["--salt-fixture-deprecated-gap"],
          replacement_kind: "direct",
          basis: {
            source_path: "packages/theme/CHANGELOG.md",
            line_start: 5,
            line_end: 5,
          },
        },
      ]);

      const sources = await buildTokenPolicySourceRegistry(repoRoot);

      expect(
        getTokenPolicy(
          {
            name: "--salt-legacyfixture-gap",
            category: "legacyfixture",
          },
          sources,
        ),
      ).toBeNull();
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("keeps fixture manual replacement metadata unsupported even if replacements are present", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-token-policy-manual-metadata-fixture-"),
    );

    try {
      await writeFixturePolicyRepo(repoRoot);
      await writeFixtureTokenReplacementMetadata(repoRoot, [
        {
          deprecated: "--salt-legacyfixture-gap",
          replacements: ["--salt-fixture-gap"],
          replacement_kind: "manual",
          unsupported_reason:
            "Fixture manual replacement metadata must not emit policy.",
          basis: {
            source_path: "packages/theme/CHANGELOG.md",
            line_start: 5,
            line_end: 5,
          },
        },
      ]);

      const sources = await buildTokenPolicySourceRegistry(repoRoot);

      expect(
        getTokenPolicy(
          {
            name: "--salt-legacyfixture-gap",
            category: "legacyfixture",
          },
          sources,
        ),
      ).toBeNull();
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("records fixture manual replacement metadata as an evidence-backed policy gap", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-token-policy-gap-metadata-fixture-"),
    );

    try {
      await writeFixturePolicyRepo(repoRoot);
      await writeFixtureTokenReplacementMetadata(repoRoot, [
        {
          deprecated: "--salt-legacyfixture-gap",
          replacement_kind: "manual",
          unsupported_reason:
            "Fixture manual replacement metadata must not emit policy.",
          basis: {
            source_path: "packages/theme/CHANGELOG.md",
            line_start: 5,
            line_end: 5,
          },
        },
      ]);

      const sources = await buildTokenPolicySourceRegistry(repoRoot);
      const policyGap = getTokenPolicyGap(
        {
          name: "--salt-legacyfixture-gap",
          category: "legacyfixture",
        },
        sources,
      );

      expect(
        getTokenPolicy(
          {
            name: "--salt-legacyfixture-gap",
            category: "legacyfixture",
          },
          sources,
        ),
      ).toBeNull();
      expect(policyGap).toEqual(
        expect.objectContaining({
          reason: expect.stringContaining(
            "Fixture manual replacement metadata must not emit policy.",
          ),
          missing: expect.arrayContaining([
            "token policy",
            "source-backed replacement token",
          ]),
          evidence_refs: [
            expect.objectContaining({
              source_kind: "token",
              claim_kind: "token",
              source: expect.objectContaining({
                repo_path:
                  "packages/theme/css/deprecated/token-replacements.json",
                section: expect.stringContaining(
                  "Fixture manual replacement metadata must not emit policy.",
                ),
              }),
            }),
          ],
        }),
      );
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("records fixture replacement chains to unsupported metadata without generating policy", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-token-policy-gap-chain-fixture-"),
    );

    try {
      await writeFixturePolicyRepo(repoRoot);
      await writeFixtureTokenReplacementMetadata(repoRoot, [
        {
          deprecated: "--salt-legacyfixture-gap",
          replacements: ["--salt-intermediatefixture-gap"],
          replacement_kind: "direct",
          basis: {
            source_path: "packages/theme/CHANGELOG.md",
            line_start: 5,
            line_end: 5,
          },
        },
        {
          deprecated: "--salt-intermediatefixture-gap",
          replacement_kind: "unsupported",
          unsupported_reason:
            "Fixture replacement target has no source-backed policy docs.",
          basis: {
            source_path: "packages/theme/CHANGELOG.md",
            line_start: 6,
            line_end: 6,
          },
        },
      ]);

      const sources = await buildTokenPolicySourceRegistry(repoRoot);
      const policyGap = getTokenPolicyGap(
        {
          name: "--salt-legacyfixture-gap",
          category: "legacyfixture",
        },
        sources,
      );

      expect(
        getTokenPolicy(
          {
            name: "--salt-legacyfixture-gap",
            category: "legacyfixture",
          },
          sources,
        ),
      ).toBeNull();
      expect(policyGap).toEqual(
        expect.objectContaining({
          reason: expect.stringContaining(
            "Fixture replacement target has no source-backed policy docs.",
          ),
          missing: expect.arrayContaining([
            "token policy",
            "source-backed policy docs",
          ]),
          evidence_refs: expect.arrayContaining([
            expect.objectContaining({
              id: expect.stringContaining("deprecated-replacement"),
              source: expect.objectContaining({
                repo_path:
                  "packages/theme/css/deprecated/token-replacements.json",
              }),
            }),
            expect.objectContaining({
              id: expect.stringContaining("unsupported"),
              source: expect.objectContaining({
                repo_path:
                  "packages/theme/css/deprecated/token-replacements.json",
              }),
            }),
          ]),
        }),
      );
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("records fixture scale replacement chains to unsupported policy docs without generating policy", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-token-policy-gap-scale-chain-fixture-"),
    );

    try {
      await writeFixturePolicyRepo(repoRoot);
      await writeFixtureTokenReplacementMetadata(repoRoot, [
        {
          deprecated: "--salt-legacyfixture-opacity-1",
          replacements: ["--salt-legacyfixture-opacity-15"],
          replacement_kind: "scale",
          basis: {
            source_path: "packages/theme/css/deprecated/foundations.css",
            line_start: 5,
            line_end: 5,
          },
        },
        {
          deprecated: "--salt-legacyfixture-opacity-15",
          replacement_kind: "unsupported",
          unsupported_reason:
            "No source-backed policy docs resolve this fixture opacity token for generated policy.",
          basis: {
            source_path: "packages/theme/css/deprecated/foundations.css",
            line_start: 6,
            line_end: 6,
          },
        },
      ]);

      const sources = await buildTokenPolicySourceRegistry(repoRoot);
      const input = {
        name: "--salt-legacyfixture-opacity-1",
        category: "legacyfixture",
      };
      const policyGap = getTokenPolicyGap(input, sources);

      expect(getTokenPolicy(input, sources)).toBeNull();
      expect(policyGap).toEqual(
        expect.objectContaining({
          reason: expect.stringContaining(
            "No source-backed policy docs resolve this fixture opacity token for generated policy.",
          ),
          missing: expect.arrayContaining([
            "token policy",
            "source-backed policy docs",
          ]),
          evidence_refs: expect.arrayContaining([
            expect.objectContaining({
              id: expect.stringContaining("deprecated-replacement"),
              source: expect.objectContaining({
                repo_path:
                  "packages/theme/css/deprecated/token-replacements.json",
                section: expect.stringContaining("kind: scale"),
              }),
            }),
            expect.objectContaining({
              id: expect.stringContaining("unsupported"),
              source: expect.objectContaining({
                repo_path:
                  "packages/theme/css/deprecated/token-replacements.json",
                section: expect.stringContaining(
                  "No source-backed policy docs resolve this fixture opacity token for generated policy.",
                ),
              }),
            }),
          ]),
        }),
      );
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("keeps fixture metadata replacements unsupported when replacement docs are missing", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-token-policy-metadata-gap-fixture-"),
    );

    try {
      await writeFixturePolicyRepo(repoRoot);
      await writeFixtureTokenReplacementMetadata(repoRoot, [
        {
          deprecated: "--salt-legacyfixture-gap",
          replacements: ["--salt-undocumented-gap"],
          replacement_kind: "direct",
          basis: {
            source_path: "packages/theme/CHANGELOG.md",
            line_start: 5,
            line_end: 5,
          },
        },
      ]);

      const sources = await buildTokenPolicySourceRegistry(repoRoot);

      expect(
        getTokenPolicy(
          {
            name: "--salt-legacyfixture-gap",
            category: "legacyfixture",
          },
          sources,
        ),
      ).toBeNull();
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("resolves fixture deprecated replacement chains through source-backed CSS and changelog evidence", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-token-policy-chain-fixture-"),
    );

    try {
      await writeFixturePolicyRepo(repoRoot);
      await writeFixtureThemeChangelog(
        repoRoot,
        `## Fixture

| Name                                  | Replacement          |
| ------------------------------------- | -------------------- |
| \`--salt-intermediatefixture-gap\`    | \`--salt-fixture-gap\` |
`,
      );
      await fs.mkdir(path.join(repoRoot, "packages/theme/css/deprecated"), {
        recursive: true,
      });
      await fs.writeFile(
        path.join(repoRoot, "packages/theme/css/deprecated/fixture.css"),
        `.salt-theme {
  --salt-legacyfixture-gap: 10px; /* Use --salt-intermediatefixture-gap */
}
`,
        "utf8",
      );

      const sources = await buildTokenPolicySourceRegistry(repoRoot);
      const policy = getTokenPolicy(
        {
          name: "--salt-legacyfixture-gap",
          category: "legacyfixture",
        },
        sources,
      );

      expect(policy).toEqual(
        expect.objectContaining({
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
              source_kind: "token",
              source: expect.objectContaining({
                repo_path: "packages/theme/css/deprecated/fixture.css",
              }),
            }),
            expect.objectContaining({
              source_kind: "docs",
              source: expect.objectContaining({
                repo_path: "packages/theme/CHANGELOG.md",
              }),
            }),
          ]),
        }),
      );
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("extracts fixture direct replacement diff blocks without using fallback facts", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-token-policy-diff-fixture-"),
    );

    try {
      await writeFixturePolicyRepo(repoRoot);
      await writeFixtureThemeChangelog(
        repoRoot,
        `## Fixture

- fixture: Deprecated old fixture tokens; replaced tokens with below

  \`\`\`diff
  - --salt-oldfixture-primary-gap
  + --salt-fixture-primary-gap
  + --salt-fixture-extra-gap
  \`\`\`
`,
      );

      const sources = await buildTokenPolicySourceRegistry(repoRoot);
      const policy = getTokenPolicy(
        {
          name: "--salt-oldfixture-primary-gap",
          category: "oldfixture",
        },
        sources,
      );

      expect(policy).toEqual(
        expect.objectContaining({
          docs: [
            "/salt/foundations/fixture-area/index",
            "/salt/themes/design-tokens/index",
          ],
          evidence_refs: expect.arrayContaining([
            expect.objectContaining({
              source_kind: "docs",
              source: expect.objectContaining({
                repo_path: "packages/theme/CHANGELOG.md",
              }),
            }),
          ]),
        }),
      );
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });

  it("keeps fixture changelog replacements unsupported when replacement docs are missing", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-token-policy-changelog-gap-fixture-"),
    );

    try {
      await writeFixturePolicyRepo(repoRoot);
      await writeFixtureThemeChangelog(
        repoRoot,
        `## Fixture

| Name                         | Replacement                |
| ---------------------------- | -------------------------- |
| \`--salt-legacyfixture-gap\` | \`--salt-undocumented-gap\` |
`,
      );

      const sources = await buildTokenPolicySourceRegistry(repoRoot);

      expect(
        getTokenPolicy(
          {
            name: "--salt-legacyfixture-gap",
            category: "legacyfixture",
          },
          sources,
        ),
      ).toBeNull();
    } finally {
      await fs.rm(repoRoot, { recursive: true, force: true });
    }
  });
});
