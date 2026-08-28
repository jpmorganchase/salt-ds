import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { connectCurrentSpecClient } from "./mcpTestClient.js";

const closeCallbacks: Array<() => Promise<void>> = [];
const tempRoots: string[] = [];

afterEach(async () => {
  await Promise.allSettled(closeCallbacks.splice(0).map((close) => close()));
  await Promise.allSettled(
    tempRoots.splice(0).map((root) =>
      fs.rm(root, { recursive: true, force: true }),
    ),
  );
});

async function createProject(name: string): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "salt-mcp-root-"));
  tempRoots.push(root);
  await fs.writeFile(
    path.join(root, "package.json"),
    JSON.stringify({
      name,
      packageManager: "yarn@4.10.3",
      dependencies: { "@salt-ds/core": "1.70.0" },
    }),
    "utf8",
  );
  return root;
}

describe("startup-only project authority", () => {
  it("keeps static knowledge usable but rejects project reads without a root", async () => {
    const connected = await connectCurrentSpecClient();
    closeCallbacks.push(connected.close);
    expect((await connected.client.listResources()).resources.length).toBeGreaterThan(0);
    await connected.client.listTools();
    const result = await connected.client.callTool({
      name: "inspect_salt_project",
      arguments: {},
    });
    expect(result.isError).toBe(true);
    expect(JSON.stringify(result.content)).toMatch(/restart salt-mcp with --root/iu);
  });

  it("selects one root implicitly and requires an index for multiple roots", async () => {
    const firstRoot = await createProject("first-project");
    const secondRoot = await createProject("second-project");

    const single = await connectCurrentSpecClient({ projectRoots: [firstRoot] });
    closeCallbacks.push(single.close);
    await single.client.listTools();
    const singleResult = await single.client.callTool({
      name: "inspect_salt_project",
      arguments: {},
    });
    expect(singleResult.structuredContent).toMatchObject({
      project_root_index: 0,
      project: { package_manifest: { name: "first-project" } },
    });

    const multiple = await connectCurrentSpecClient({
      projectRoots: [firstRoot, secondRoot],
    });
    closeCallbacks.push(multiple.close);
    await multiple.client.listTools();
    const ambiguous = await multiple.client.callTool({
      name: "inspect_salt_project",
      arguments: {},
    });
    expect(ambiguous.isError).toBe(true);
    expect(JSON.stringify(ambiguous.content)).toMatch(/multiple project roots/iu);

    const selected = await multiple.client.callTool({
      name: "inspect_salt_project",
      arguments: { project_root_index: 1 },
    });
    expect(selected.structuredContent).toMatchObject({
      project_root_index: 1,
      project: { package_manifest: { name: "second-project" } },
    });
    expect(JSON.stringify(selected.structuredContent)).not.toContain(secondRoot);
  });

  it("rejects client paths and does not follow a dependency junction outside authority", async () => {
    const root = await createProject("junction-project");
    const outside = await fs.mkdtemp(path.join(os.tmpdir(), "salt-mcp-outside-"));
    tempRoots.push(outside);
    await fs.writeFile(
      path.join(outside, "package.json"),
      JSON.stringify({ name: "@salt-ds/core", version: "9.9.9" }),
      "utf8",
    );
    const packageParent = path.join(root, "node_modules", "@salt-ds");
    await fs.mkdir(packageParent, { recursive: true });
    await fs.symlink(outside, path.join(packageParent, "core"), "junction");

    const connected = await connectCurrentSpecClient({ projectRoots: [root] });
    closeCallbacks.push(connected.close);
    await connected.client.listTools();
    const rejectedPath = await connected.client.callTool({
      name: "inspect_salt_project",
      arguments: { root_dir: "../outside" },
    });
    expect(rejectedPath.isError).toBe(true);
    expect(JSON.stringify(rejectedPath.content)).toMatch(/unrecognized key.*root_dir/iu);

    const inspected = await connected.client.callTool({
      name: "inspect_salt_project",
      arguments: {},
    });
    const resolved = (inspected.structuredContent as any).project.installation
      .resolved_packages;
    expect(resolved.find((entry: any) => entry.name === "@salt-ds/core"))
      .not.toMatchObject({ resolved_version: "9.9.9" });
  });
});
