import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  inspectSaltProjectFacts,
  SaltProjectInspectionError,
} from "../inspectSaltProjectFacts.js";

const tempDirectories: string[] = [];

async function fixtureRoot(): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "salt-info-fixture-"));
  tempDirectories.push(root);
  await fs.mkdir(path.join(root, "node_modules", "@salt-ds", "core"), {
    recursive: true,
  });
  await fs.writeFile(
    path.join(root, "package.json"),
    JSON.stringify({
      name: "fixture",
      packageManager: "npm@11.0.0",
      dependencies: { "@salt-ds/core": "1.69.0" },
    }),
    "utf8",
  );
  await fs.writeFile(
    path.join(root, "node_modules", "@salt-ds", "core", "package.json"),
    JSON.stringify({ name: "@salt-ds/core", version: "1.69.0" }),
    "utf8",
  );
  return root;
}

afterEach(async () => {
  await Promise.all(
    tempDirectories.splice(0).map((directory) =>
      fs.rm(directory, { recursive: true, force: true }),
    ),
  );
});

describe("inspectSaltProjectFacts", () => {
  it("returns a canonical exact package vector without executing project code", async () => {
    const root = await fixtureRoot();
    await fs.writeFile(
      path.join(root, "install.js"),
      "throw new Error('must not execute');\n",
      "utf8",
    );

    const result = await inspectSaltProjectFacts({ rootDir: root });

    expect(result.facts.root_dir).toBe(root.replaceAll("\\", "/"));
    expect(result.facts.declared_salt_packages).toEqual([
      { name: "@salt-ds/core", version: "1.69.0" },
    ]);
    expect(result.facts.installation.resolvedPackages).toEqual([
      expect.objectContaining({
        name: "@salt-ds/core",
        resolvedVersion: "1.69.0",
        satisfiesDeclaredVersion: true,
      }),
    ]);
    expect(result.facts.installation.inspection.status).toBe("succeeded");
  });

  it("reports an absent package manifest as bounded partial facts", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "salt-info-empty-"));
    tempDirectories.push(root);
    const result = await inspectSaltProjectFacts({ rootDir: root });
    expect(result.facts.package_manifest.status).toBe("absent");
    expect(result.limitations).toContain("SALT_PACKAGE_MANIFEST_ABSENT");
  });

  it("rejects unavailable and non-directory roots", async () => {
    const root = await fixtureRoot();
    await expect(
      inspectSaltProjectFacts({ rootDir: path.join(root, "missing") }),
    ).rejects.toMatchObject({ code: "SALT_PROJECT_ROOT_UNAVAILABLE" });
    await expect(
      inspectSaltProjectFacts({ rootDir: path.join(root, "package.json") }),
    ).rejects.toBeInstanceOf(SaltProjectInspectionError);
  });
});
