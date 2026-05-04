import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildTokenPolicySourceRegistry,
  getTokenPolicy,
} from "../build/buildRegistryTokenPolicy.js";

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
            expect.stringContaining("Fixture tokens help manage fixture spacing"),
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
});
