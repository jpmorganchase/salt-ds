import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { buildRegistry } from "@salt-ds/semantic-core/build/buildRegistry";
import { afterEach, describe, expect, it } from "vitest";
import { loadRegistry } from "../registry/loadRegistry.js";
import { buildSaltProjectContextId } from "../server/projectContext.js";
import {
  createToolExecutionRuntime,
  TOOL_DEFINITIONS,
} from "../server/toolDefinitions.js";
import { REPO_ROOT, withRegistryDir } from "./registryTestUtils.js";

/**
 * Regression test for Phase 0 task 0.9 (gold-standard roadmap M12 / session
 * findings #4 root cause F5).
 *
 * Before the fix, a host-side trace was three steps:
 *
 *   1. create_salt_ui returned `install_dependencies` because @salt-ds/*
 *      packages were not declared in the repo.
 *   2. Host ran `npm install`. The MCP's cached project context still showed
 *      no Salt packages, so a rerun of create_salt_ui returned the same
 *      install_dependencies action.
 *   3. Host had to manually call get_salt_project_context to refresh, then
 *      call create_salt_ui a third time before getting status=success.
 *
 * The expectation is that the MCP transparently invalidates cached project
 * context for the affected `root_dir` the moment a workflow emits
 * `install_dependencies`. The next workflow turn that touches the same
 * `context_id` then refetches fresh package state without any explicit
 * `get_salt_project_context` call between the install and the rerun.
 */

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
  action?: { kind?: string };
  next_required_action?: { kind?: string };
}

describe("install_dependencies auto-invalidates cached project context", () => {
  it("collapses install -> rerun loop to one step (Phase 0 task 0.9, F5)", async () => {
    await withRegistryDir(
      async (registryDir) => {
        await buildRegistry({
          sourceRoot: REPO_ROOT,
          outputDir: registryDir,
          timestamp: "2026-03-28T00:00:00Z",
        });
      },
      async (registryDir) => {
        const rootDir = await createTempDir(
          "salt-mcp-install-deps-invalidation",
        );
        // Repo starts without any @salt-ds packages declared so create_salt_ui
        // must hand back action.kind === install_dependencies.
        await fs.writeFile(
          path.join(rootDir, "package.json"),
          JSON.stringify(
            {
              name: "install-deps-invalidation",
              private: true,
              packageManager: "npm@10.0.0",
              dependencies: {
                react: "^18.3.1",
                vite: "^7.1.0",
              },
            },
            null,
            2,
          ),
          "utf8",
        );

        const registry = await loadRegistry({ registryDir });
        const createTool = TOOL_DEFINITIONS.find(
          (definition) => definition.name === "create_salt_ui",
        );
        const contextTool = TOOL_DEFINITIONS.find(
          (definition) => definition.name === "get_salt_project_context",
        );
        const entityTool = TOOL_DEFINITIONS.find(
          (definition) => definition.name === "get_salt_entities",
        );
        expect(createTool).toBeDefined();
        expect(contextTool).toBeDefined();
        expect(entityTool).toBeDefined();

        const runtime = createToolExecutionRuntime();

        // 1. First create_salt_ui call: the workflow demands install_dependencies.
        const firstResult = (await createTool!.execute(
          registry,
          {
            query: "analytical dashboard body",
            root_dir: rootDir,
            view: "compact",
          },
          runtime,
        )) as WorkflowEnvelope;
        expect(firstResult.action?.kind).toBe("install_dependencies");

        // The runtime should now hold a fresh cached context AND mark it stale
        // because we just emitted install_dependencies. The next call that
        // touches the same context_id must refetch transparently.
        const normalizedRootDir = rootDir.replaceAll("\\", "/");
        const contextId = buildSaltProjectContextId(normalizedRootDir);
        expect(runtime.projectContexts.has(contextId)).toBe(true);
        expect(runtime.staleProjectContextIds.has(contextId)).toBe(true);
        const cachedBeforeInstall = runtime.projectContexts.get(contextId);
        expect(cachedBeforeInstall?.salt.packages).toEqual([]);

        // 2. Host runs `npm install` (simulated): @salt-ds/core and
        //    @salt-ds/theme are added to package.json.
        await fs.writeFile(
          path.join(rootDir, "package.json"),
          JSON.stringify(
            {
              name: "install-deps-invalidation",
              private: true,
              packageManager: "npm@10.0.0",
              dependencies: {
                react: "^18.3.1",
                vite: "^7.1.0",
                "@salt-ds/core": "^2.0.0",
                "@salt-ds/theme": "^2.0.0",
              },
            },
            null,
            2,
          ),
          "utf8",
        );

        // The cached context is still the pre-install snapshot. Without the
        // auto-invalidation fix, the next workflow turn would reuse it and
        // re-emit install_dependencies, forcing the host into the three-step
        // loop documented in session-findings-2026-06.md root cause #4.
        const sameCached = runtime.projectContexts.get(contextId);
        expect(sameCached?.salt.packages).toEqual([]);

        // 3. Follow-up workflow turn: rerun create_salt_ui with the same
        //    context_id and WITHOUT first calling get_salt_project_context.
        //    With the fix, the MCP detects the stale flag, refetches, and the
        //    workflow result no longer asks for install_dependencies.
        const secondResult = (await createTool!.execute(
          registry,
          {
            query: "analytical dashboard body",
            context_id: contextId,
            view: "compact",
          },
          runtime,
        )) as WorkflowEnvelope;
        expect(secondResult.action?.kind).not.toBe("install_dependencies");
        expect(secondResult.next_required_action?.kind).not.toBe(
          "install_dependencies",
        );

        // After the refetch, the cache should hold the new snapshot with
        // both @salt-ds packages and the stale flag must be cleared so we do
        // not refetch on every subsequent call.
        const refreshedContext = runtime.projectContexts.get(contextId);
        expect(
          refreshedContext?.salt.packages.map((entry) => entry.name),
        ).toEqual(expect.arrayContaining(["@salt-ds/core", "@salt-ds/theme"]));
        expect(runtime.staleProjectContextIds.has(contextId)).toBe(false);

        // 4. A follow-up get_salt_entities call (the lightweight lookup the
        //    host would naturally make next) must continue to work without any
        //    manual rerun of get_salt_project_context between the install and
        //    the rerun. get_salt_entities does not depend on the cached
        //    context, so it has to succeed independently of the stale-cache
        //    fix.
        const entityResult = (await entityTool!.execute(
          registry,
          { names: ["Button"] },
          runtime,
        )) as {
          decision?: { status?: string };
          found_count?: number;
          results?: Array<{
            name: string;
            result: {
              decision?: { status?: string };
              entity?: { name?: string } | null;
            };
          }>;
        };
        expect(entityResult).toBeDefined();
        expect(entityResult.decision?.status).toBe("results");
        expect(entityResult.found_count).toBe(1);
        const buttonRow = entityResult.results?.[0];
        expect(buttonRow?.result.decision?.status).toBe("found");
        expect(buttonRow?.result.entity?.name).toBe("Button");

        // 5. Defensive assertion: confirm the host never had to call
        //    get_salt_project_context between turns. We re-invoke the rerun
        //    path one more time and assert it remains a single-step
        //    success-path call (no install_dependencies action regression).
        const thirdResult = (await createTool!.execute(
          registry,
          {
            query: "analytical dashboard body",
            context_id: contextId,
            view: "compact",
          },
          runtime,
        )) as WorkflowEnvelope;
        expect(thirdResult.action?.kind).not.toBe("install_dependencies");
      },
    );
  }, 30000);

  it("invalidates cached context even when install_dependencies fails on the host side", async () => {
    // The contract says invalidation must happen on completion regardless of
    // success or failure. From the MCP's perspective, "completion" is the
    // moment we emit install_dependencies: the host owns the install and the
    // next call back to us is the only completion signal we can observe. So
    // simulate the failure path by re-emitting install_dependencies on the
    // rerun (the install did not actually add the packages) and assert the
    // runtime still refetches transparently rather than serving stale state.
    await withRegistryDir(
      async (registryDir) => {
        await buildRegistry({
          sourceRoot: REPO_ROOT,
          outputDir: registryDir,
          timestamp: "2026-03-28T00:00:00Z",
        });
      },
      async (registryDir) => {
        const rootDir = await createTempDir(
          "salt-mcp-install-deps-invalidation-failure",
        );
        await fs.writeFile(
          path.join(rootDir, "package.json"),
          JSON.stringify(
            {
              name: "install-deps-invalidation-failure",
              private: true,
              dependencies: {
                react: "^18.3.1",
                vite: "^7.1.0",
              },
            },
            null,
            2,
          ),
          "utf8",
        );

        const registry = await loadRegistry({ registryDir });
        const createTool = TOOL_DEFINITIONS.find(
          (definition) => definition.name === "create_salt_ui",
        )!;
        const runtime = createToolExecutionRuntime();
        const normalizedRootDir = rootDir.replaceAll("\\", "/");
        const contextId = buildSaltProjectContextId(normalizedRootDir);

        const firstResult = (await createTool.execute(
          registry,
          {
            query: "analytical dashboard body",
            root_dir: rootDir,
            view: "compact",
          },
          runtime,
        )) as WorkflowEnvelope;
        expect(firstResult.action?.kind).toBe("install_dependencies");
        expect(runtime.staleProjectContextIds.has(contextId)).toBe(true);

        // Simulate a failed install: package.json is unchanged. The rerun
        // should still flow through the refresh path (refetch from disk),
        // re-emit install_dependencies, and re-mark the context stale so the
        // next turn keeps trying with current state instead of any older
        // cached snapshot.
        const secondResult = (await createTool.execute(
          registry,
          {
            query: "analytical dashboard body",
            context_id: contextId,
            view: "compact",
          },
          runtime,
        )) as WorkflowEnvelope;
        expect(secondResult.action?.kind).toBe("install_dependencies");
        expect(runtime.staleProjectContextIds.has(contextId)).toBe(true);
      },
    );
  }, 30000);
});
