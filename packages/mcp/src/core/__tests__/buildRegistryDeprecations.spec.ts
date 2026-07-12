import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { extractDeprecations } from "../build/buildRegistryDeprecations.js";
import type { PackageRecord } from "../types.js";

const tempRoots: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempRoots
      .splice(0, tempRoots.length)
      .map((root) => fs.rm(root, { recursive: true, force: true })),
  );
});

describe("buildRegistryDeprecations", () => {
  it("retains deprecated_in inference from a package changelog", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-deprecation-build-"),
    );
    tempRoots.push(repoRoot);
    await fs.mkdir(path.join(repoRoot, "packages/core/src"), {
      recursive: true,
    });
    await fs.writeFile(
      path.join(repoRoot, "packages/core/src/LegacyThing.ts"),
      "/** @deprecated Use ModernThing instead. */\nexport const LegacyThing = 1;\n",
      "utf8",
    );
    await fs.writeFile(
      path.join(repoRoot, "packages/core/CHANGELOG.md"),
      "## 1.2.3\n\n### Minor Changes\n\n- Deprecated `LegacyThing`; use `ModernThing` instead.\n",
      "utf8",
    );
    const packages: PackageRecord[] = [
      {
        id: "package.salt-ds-core",
        name: "@salt-ds/core",
        status: "stable",
        version: "2.0.0",
        summary: "Core",
        source_root: "packages/core",
        changelog_path: "packages/core/CHANGELOG.md",
        docs_root: null,
      },
    ];

    const deprecations = await extractDeprecations(
      repoRoot,
      packages,
      new Set(),
    );

    expect(deprecations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "LegacyThing",
          deprecated_in: "1.2.3",
        }),
      ]),
    );
  });
});
