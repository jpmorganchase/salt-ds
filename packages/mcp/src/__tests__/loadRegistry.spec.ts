import { describe, expect, it } from "vitest";
import { loadRegistry } from "../registry/loadRegistry.js";
import {
  GENERATED_AT,
  VERSION,
  withRegistryDir,
  writeBaseArtifacts,
} from "./registryTestUtils.js";

describe("loadRegistry", () => {
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
        await expect(loadRegistry({ registryDir })).rejects.toThrow(
          "components.json",
        );
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
        await expect(loadRegistry({ registryDir })).rejects.toThrow(
          /version mismatch/i,
        );
      },
    );
  });
});
