import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  deriveComparableSaltVersion,
  evaluatePackCompatibility,
  MAX_PROJECT_POLICY_FILE_BYTES,
  readProjectConventionsStackFile,
  resolveProjectConventionsFileLayer,
  resolveProjectConventionsPackageLayer,
} from "../layerDiagnostics.js";

const tempDirs: string[] = [];

async function createTempDir(name: string): Promise<string> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), `${name}-`));
  tempDirs.push(dir);
  return dir;
}

afterEach(async () => {
  await Promise.all(
    tempDirs
      .splice(0, tempDirs.length)
      .map((dir) => fs.rm(dir, { recursive: true, force: true })),
  );
});

describe("layerDiagnostics version normalization", () => {
  it("treats bare workspace protocol ranges as unknown comparable versions", () => {
    expect(
      deriveComparableSaltVersion({
        declaredVersion: "workspace:^",
      }),
    ).toBeNull();
  });

  it("normalizes workspace protocol specs that include a real semver range", () => {
    expect(
      deriveComparableSaltVersion({
        declaredVersion: "workspace:^1.2.3",
      }),
    ).toBe("1.2.3");
  });

  it("does not throw when compatibility checks see workspace protocol versions", () => {
    expect(
      evaluatePackCompatibility({
        supportedSaltRange: "^1.0.0",
        currentSaltVersion: "workspace:^",
      }),
    ).toMatchObject({
      status: "unknown-current-version",
      checkedVersion: null,
    });
  });
});

describe("layerDiagnostics policy boundary", () => {
  it("never imports or requires package-backed policy code", async () => {
    const rootDir = await createTempDir("salt-policy-package");
    const markerPath = path.join(rootDir, "executed.txt");
    const packageDir = path.join(rootDir, "node_modules", "example-policy");
    await fs.mkdir(packageDir, { recursive: true });
    await fs.writeFile(
      path.join(packageDir, "package.json"),
      JSON.stringify({ name: "example-policy", main: "index.js" }),
    );
    await fs.writeFile(
      path.join(packageDir, "index.js"),
      `require("node:fs").writeFileSync(${JSON.stringify(markerPath)}, "executed"); module.exports = {};`,
    );

    const result = await resolveProjectConventionsPackageLayer({
      rootDir,
      specifier: "example-policy",
      currentSaltVersion: "2.0.0",
    });

    expect(result).toMatchObject({
      status: "invalid",
      conventions: null,
      reason: expect.stringContaining("data-only JSON"),
    });
    await expect(fs.access(markerPath)).rejects.toMatchObject({
      code: "ENOENT",
    });
  });

  it("rejects lexical and symlink escapes from the declared repo root", async () => {
    const rootDir = await createTempDir("salt-policy-root");
    const outsideDir = await createTempDir("salt-policy-outside");
    const outsidePolicy = path.join(outsideDir, "policy.json");
    await fs.writeFile(
      outsidePolicy,
      JSON.stringify({ contract: "project_conventions_v1" }),
    );

    const lexical = await resolveProjectConventionsFileLayer({
      rootDir,
      filePath: outsidePolicy,
      currentSaltVersion: null,
    });
    expect(lexical).toMatchObject({
      status: "invalid",
      reason: expect.stringContaining("leaves the declared root_dir"),
    });

    const linkDir = path.join(rootDir, ".salt", "linked");
    await fs.mkdir(path.dirname(linkDir), { recursive: true });
    await fs.symlink(outsideDir, linkDir, "junction");
    const symlinked = await resolveProjectConventionsFileLayer({
      rootDir,
      filePath: path.join(linkDir, "policy.json"),
      currentSaltVersion: null,
    });
    expect(symlinked).toMatchObject({
      status: "invalid",
      reason: expect.stringContaining("Symlink escapes are not supported"),
    });
  });

  it("bounds policy files and validates payloads before composition", async () => {
    const rootDir = await createTempDir("salt-policy-bounds");
    const saltDir = path.join(rootDir, ".salt");
    await fs.mkdir(saltDir, { recursive: true });
    const malformedTeam = path.join(saltDir, "team.json");
    await fs.writeFile(
      malformedTeam,
      JSON.stringify({ approved_wrappers: ["AppButton"] }),
    );
    const malformed = await resolveProjectConventionsFileLayer({
      rootDir,
      filePath: malformedTeam,
      currentSaltVersion: null,
    });
    expect(malformed).toMatchObject({
      status: "invalid",
      conventions: null,
      reason: expect.stringContaining("bounded project_conventions_v1"),
    });

    const unknownField = path.join(saltDir, "unknown-field.json");
    await fs.writeFile(
      unknownField,
      JSON.stringify({
        contract: "project_conventions_v1",
        version: "1.0.0",
        unexpected: true,
      }),
    );
    await expect(
      resolveProjectConventionsFileLayer({
        rootDir,
        filePath: unknownField,
        currentSaltVersion: null,
      }),
    ).resolves.toMatchObject({
      status: "invalid",
      conventions: null,
    });

    const validTeam = path.join(saltDir, "valid.json");
    await fs.writeFile(
      validTeam,
      JSON.stringify({
        contract: "project_conventions_v1",
        version: "1.0.0",
        approved_wrappers: [
          {
            name: "AppButton",
            wraps: "Button",
            reason: "Approved repo wrapper.",
          },
        ],
      }),
    );
    await expect(
      resolveProjectConventionsFileLayer({
        rootDir,
        filePath: validTeam,
        currentSaltVersion: null,
      }),
    ).resolves.toMatchObject({
      status: "resolved",
      conventions: { version: "1.0.0" },
    });

    const oversized = path.join(saltDir, "oversized.json");
    await fs.writeFile(
      oversized,
      " ".repeat(MAX_PROJECT_POLICY_FILE_BYTES + 1),
    );
    const oversizedResult = await resolveProjectConventionsFileLayer({
      rootDir,
      filePath: oversized,
      currentSaltVersion: null,
    });
    expect(oversizedResult).toMatchObject({
      status: "invalid",
      reason: expect.stringContaining("inspection limit"),
    });

    const stackPath = path.join(saltDir, "stack.json");
    await fs.writeFile(
      stackPath,
      JSON.stringify({
        contract: "project_conventions_stack_v1",
        layers: [{ id: "broken", scope: "team", source: null }],
      }),
    );
    const stack = await readProjectConventionsStackFile({
      rootDir,
      filePath: stackPath,
    });
    expect(stack).toMatchObject({
      stack: null,
      reason: expect.stringContaining("invalid or duplicate layer"),
    });

    await fs.writeFile(
      stackPath,
      JSON.stringify({
        contract: "project_conventions_stack_v1",
        layers: [],
      }),
    );
    await expect(
      readProjectConventionsStackFile({ rootDir, filePath: stackPath }),
    ).resolves.toMatchObject({
      stack: null,
      reason: expect.stringContaining("between 1 and"),
    });
  });
});
