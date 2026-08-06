import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  authorizeProjectRoot,
  createProjectAccessPolicy,
} from "../projectAccess.js";

const tempDirs: string[] = [];

async function tempDir(prefix: string): Promise<string> {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), prefix));
  tempDirs.push(directory);
  return directory;
}

afterEach(async () => {
  await Promise.all(
    tempDirs
      .splice(0)
      .map((directory) => fs.rm(directory, { recursive: true, force: true })),
  );
});

describe("server-configured project access", () => {
  it("defaults omitted requests to the one configured workspace", async () => {
    const allowed = await tempDir("salt-project-access-");
    const policy = await createProjectAccessPolicy({
      mode: "restricted",
      allowedRoots: [allowed],
    });

    await expect(
      authorizeProjectRoot(policy, undefined),
    ).resolves.toMatchObject({
      status: "authorized",
      mode: "restricted",
      rootDir: await fs.realpath(allowed),
    });
  });

  it("fails closed without allowed roots or an unambiguous default", async () => {
    const first = await tempDir("salt-project-access-first-");
    const second = await tempDir("salt-project-access-second-");
    const disabled = await createProjectAccessPolicy({
      mode: "restricted",
      allowedRoots: [],
    });
    const ambiguous = await createProjectAccessPolicy({
      mode: "restricted",
      allowedRoots: [first, second],
    });

    await expect(authorizeProjectRoot(disabled, undefined)).resolves.toEqual({
      status: "denied",
      reason: "no_allowed_roots",
    });
    await expect(authorizeProjectRoot(ambiguous, undefined)).resolves.toEqual({
      status: "denied",
      reason: "no_default_root",
    });
  });

  it("rejects sibling-prefix and symlink escapes after realpath resolution", async () => {
    const parent = await tempDir("salt-project-boundary-");
    const allowed = path.join(parent, "app");
    const sibling = path.join(parent, "app-secrets");
    await fs.mkdir(allowed);
    await fs.mkdir(sibling);
    const policy = await createProjectAccessPolicy({
      mode: "restricted",
      allowedRoots: [allowed],
    });

    await expect(authorizeProjectRoot(policy, sibling)).resolves.toEqual({
      status: "denied",
      reason: "outside_allowed_roots",
    });

    const escapePath = path.join(allowed, "escape");
    await fs.symlink(
      sibling,
      escapePath,
      process.platform === "win32" ? "junction" : "dir",
    );
    await expect(authorizeProjectRoot(policy, escapePath)).resolves.toEqual({
      status: "denied",
      reason: "outside_allowed_roots",
    });
  });

  it("keeps unrestricted local stdio an explicit separate mode", async () => {
    const localRoot = await tempDir("salt-project-local-stdio-");
    const policy = await createProjectAccessPolicy({
      mode: "unrestricted_local_stdio",
      defaultRoot: localRoot,
    });

    await expect(authorizeProjectRoot(policy, undefined)).resolves.toMatchObject({
      status: "authorized",
      mode: "unrestricted_local_stdio",
      rootDir: await fs.realpath(localRoot),
      authorityRoot: await fs.realpath(localRoot),
    });
  });

  it("retains the launch root as the authority boundary for a selected child package", async () => {
    const workspaceRoot = await tempDir("salt-project-workspace-");
    const packageRoot = path.join(workspaceRoot, "packages", "app");
    await fs.mkdir(packageRoot, { recursive: true });
    const policy = await createProjectAccessPolicy({
      mode: "unrestricted_local_stdio",
      defaultRoot: workspaceRoot,
    });

    await expect(authorizeProjectRoot(policy, packageRoot)).resolves.toEqual({
      status: "authorized",
      mode: "unrestricted_local_stdio",
      rootDir: await fs.realpath(packageRoot),
      authorityRoot: await fs.realpath(workspaceRoot),
    });
  });
});
