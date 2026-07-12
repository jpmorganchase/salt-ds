import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { loadRegistry } from "../core/registry/loadRegistry.js";
import { TOOL_DEFINITIONS } from "../server/toolDefinitions.js";
import {
  copyV1CatalogArtifactsFromGenerated,
  withRegistryDir,
} from "./registryTestUtils.js";

const tempDirs: string[] = [];

async function createTempDir(name: string): Promise<string> {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), `${name}-`));
  const resolvedDir = await fs.realpath(tempDir);
  tempDirs.push(resolvedDir);
  return resolvedDir;
}

afterEach(async () => {
  await Promise.all(
    tempDirs
      .splice(0, tempDirs.length)
      .map((dir) => fs.rm(dir, { recursive: true, force: true })),
  );
});

interface WorkflowEnvelope {
  status?: string;
  action?: {
    kind?: string;
    tool?: string;
    args?: { names?: string[] };
  } | null;
  safety?: { blocking_reasons?: string[] };
}

describe("repo-aware workflows collect fresh manifest-only context", () => {
  it("keeps dependency installation outside the semantic workflow action contract", async () => {
    await withRegistryDir(
      copyV1CatalogArtifactsFromGenerated,
      async (registryDir) => {
        const rootDir = await createTempDir("salt-mcp-fresh-dependencies");
        const packageJsonPath = path.join(rootDir, "package.json");
        await fs.writeFile(
          packageJsonPath,
          JSON.stringify({
            name: "fresh-dependencies",
            private: true,
            dependencies: { react: "^18.3.1", vite: "^7.1.0" },
          }),
          "utf8",
        );

        const registry = await loadRegistry({ registryDir });
        const createTool = TOOL_DEFINITIONS.find(
          (definition) => definition.name === "create_salt_ui",
        );
        expect(createTool).toBeDefined();

        const first = (await createTool?.execute(registry, {
          query: "Metric",
          root_dir: rootDir,
        })) as WorkflowEnvelope;
        expect(first.action).toMatchObject({
          kind: "implement",
        });

        await fs.writeFile(
          packageJsonPath,
          JSON.stringify({
            name: "fresh-dependencies",
            private: true,
            dependencies: {
              react: "^18.3.1",
              vite: "^7.1.0",
              "@salt-ds/core": "^2.0.0",
              "@salt-ds/theme": "^2.0.0",
            },
          }),
          "utf8",
        );

        const second = (await createTool?.execute(registry, {
          query: "Metric",
          root_dir: rootDir,
        })) as WorkflowEnvelope;
        expect(second.action).toMatchObject({
          kind: "implement",
        });
      },
    );
  });

  it("observes a newly declared broken policy between workflow turns", async () => {
    await withRegistryDir(
      copyV1CatalogArtifactsFromGenerated,
      async (registryDir) => {
        const rootDir = await createTempDir("salt-mcp-fresh-policy");
        await fs.writeFile(
          path.join(rootDir, "package.json"),
          JSON.stringify({
            name: "fresh-policy",
            private: true,
            dependencies: {
              react: "^18.3.1",
              "@salt-ds/core": "^2.0.0",
              "@salt-ds/theme": "^2.0.0",
            },
          }),
          "utf8",
        );

        const registry = await loadRegistry({ registryDir });
        const createTool = TOOL_DEFINITIONS.find(
          (definition) => definition.name === "create_salt_ui",
        );
        expect(createTool).toBeDefined();

        const before = (await createTool?.execute(registry, {
          query: "Metric",
          root_dir: rootDir,
        })) as WorkflowEnvelope;
        expect(before.safety?.blocking_reasons ?? []).not.toEqual(
          expect.arrayContaining([
            expect.stringContaining("required project context is missing"),
          ]),
        );

        await fs.mkdir(path.join(rootDir, ".salt"), { recursive: true });
        await fs.writeFile(
          path.join(rootDir, ".salt", "team.json"),
          JSON.stringify({
            contract: "project_conventions_v1",
            version: "1.0.0",
            approved_wrappers: [
              {
                name: "AppButton",
                wraps: "Button",
                reason: "Use the repo action wrapper.",
                import: {
                  from: "./src/components/AppButton",
                  name: "AppButton",
                },
              },
            ],
          }),
          "utf8",
        );

        const after = (await createTool?.execute(registry, {
          query: "Metric",
          root_dir: rootDir,
        })) as WorkflowEnvelope;
        expect(after.status).toBe("blocked");
        expect(after.safety?.blocking_reasons ?? []).toEqual(
          expect.arrayContaining([
            expect.stringContaining("required project context is missing"),
          ]),
        );
      },
    );
  });
});
