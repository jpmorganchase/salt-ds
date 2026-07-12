import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";
import { loadRegistry } from "../core/registry/loadRegistry.js";
import { getPackageRoot } from "../core/registry/paths.js";
import {
  GENERATED_AT,
  VERSION,
  withRegistryDir,
  writeBaseArtifacts,
} from "./registryTestUtils.js";

// loadRegistry is lazy by default after Phase 0 task 0.2: per-artifact
// validation fires on first property touch, not during the loadRegistry
// call itself. These two tests assert the eager-validation contract via
// `prefetch: true`, which is the option hosts choose when they want a
// single bounded warm-up cost and want every consistency error surfaced
// at load time. The lazy/property-touch validation path is covered by
// packages/mcp/src/core/__tests__/lazyRegistry.spec.ts.
describe("loadRegistry (prefetch mode — eager validation)", () => {
  it("skips nested module-format markers when locating the package root", async () => {
    await withRegistryDir(
      async (tempRoot) => {
        const packageRoot = path.join(tempRoot, "package");
        const nestedModuleDir = path.join(
          packageRoot,
          "dist-cjs",
          "core",
          "registry",
        );
        await fs.mkdir(nestedModuleDir, { recursive: true });
        await fs.writeFile(
          path.join(packageRoot, "package.json"),
          JSON.stringify({ name: "@salt-ds/mcp" }),
        );
        await fs.writeFile(
          path.join(packageRoot, "dist-cjs", "package.json"),
          JSON.stringify({ type: "commonjs" }),
        );
      },
      async (tempRoot) => {
        const packageRoot = path.join(tempRoot, "package");
        const nestedModuleDir = path.join(
          packageRoot,
          "dist-cjs",
          "core",
          "registry",
        );
        expect(
          getPackageRoot(
            pathToFileURL(path.join(nestedModuleDir, "loadRegistry.js")).href,
          ),
        ).toBe(packageRoot);
      },
    );
  });

  it("fails clearly when no named package manifest can be found", async () => {
    await withRegistryDir(
      async (tempRoot) => {
        await fs.mkdir(path.join(tempRoot, "no-package", "nested"), {
          recursive: true,
        });
      },
      async (tempRoot) => {
        const modulePath = path.join(
          tempRoot,
          "no-package",
          "nested",
          "module.js",
        );
        expect(() => getPackageRoot(pathToFileURL(modulePath).href)).toThrow(
          /Could not locate a named package root/u,
        );
      },
    );
  });

  it("fails when an artifact has an invalid array field", async () => {
    await withRegistryDir(
      async (registryDir) => {
        await writeBaseArtifacts(registryDir, {
          "components.json": {
            generated_at: GENERATED_AT,
            version: VERSION,
            components: null,
          },
        });
      },
      async (registryDir) => {
        await expect(
          loadRegistry({ registryDir, prefetch: true }),
        ).rejects.toThrow("components.json");
      },
    );
  });

  it("fails when artifact metadata is inconsistent", async () => {
    await withRegistryDir(
      async (registryDir) => {
        await writeBaseArtifacts(registryDir, {
          "tokens.json": {
            generated_at: GENERATED_AT,
            version: "2.0.0",
            tokens: [],
          },
        });
      },
      async (registryDir) => {
        await expect(
          loadRegistry({ registryDir, prefetch: true }),
        ).rejects.toThrow(/version mismatch/i);
      },
    );
  });
});
