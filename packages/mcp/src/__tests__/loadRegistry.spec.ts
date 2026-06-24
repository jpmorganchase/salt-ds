import { describe, expect, it } from "vitest";
import { loadRegistry } from "../registry/loadRegistry.js";
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
// packages/semantic-core/src/__tests__/lazyRegistry.spec.ts.
describe("loadRegistry (prefetch mode — eager validation)", () => {
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
