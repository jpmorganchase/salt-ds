import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  deriveComparableSaltVersion,
  evaluatePackCompatibility,
  MAX_PROJECT_POLICY_FILE_BYTES,
  parseProjectConventionsStackPayload,
  readProjectConventionsStackFile,
  resolveProjectConventionsFileLayer,
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
  it("uses only an exact observed @salt-ds/core version", () => {
    expect(
      deriveComparableSaltVersion({
        resolvedPackages: [
          { name: "@salt-ds/core", resolvedVersion: "1.2.3" },
          { name: "@salt-ds/lab", resolvedVersion: "9.9.9" },
        ],
      }),
    ).toBe("1.2.3");
  });

  it("does not infer compatibility from another Salt package", () => {
    expect(
      deriveComparableSaltVersion({
        resolvedPackages: [
          { name: "@salt-ds/lab", resolvedVersion: "1.2.3" },
        ],
      }),
    ).toBeNull();
  });

  it("treats unresolved, range-like, or conflicting Core versions as unknown", () => {
    expect(
      deriveComparableSaltVersion({
        resolvedPackages: [
          { name: "@salt-ds/core", resolvedVersion: null },
        ],
      }),
    ).toBeNull();
    expect(
      deriveComparableSaltVersion({
        resolvedPackages: [
          { name: "@salt-ds/core", resolvedVersion: "^1.2.3" },
        ],
      }),
    ).toBeNull();
    expect(
      deriveComparableSaltVersion({
        resolvedPackages: [
          { name: "@salt-ds/core", resolvedVersion: "1.2.3" },
          { name: "@salt-ds/core", resolvedVersion: "2.0.0" },
        ],
      }),
    ).toBeNull();
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

  it("requires an explicit prerelease comparator for prerelease compatibility", () => {
    expect(
      evaluatePackCompatibility({
        supportedSaltRange: "^2.0.0",
        currentSaltVersion: "2.1.0-beta.1",
      }),
    ).toMatchObject({ status: "unsupported" });
    expect(
      evaluatePackCompatibility({
        supportedSaltRange: ">=2.1.0-beta.1 <2.1.0",
        currentSaltVersion: "2.1.0-beta.1",
      }),
    ).toMatchObject({ status: "compatible" });
  });
});

describe("layerDiagnostics policy boundary", () => {
  it("rejects package-backed policy layers as data before resolution", () => {
    const result = parseProjectConventionsStackPayload({
      contract: "project_conventions_stack_v1",
      layers: [
        {
          id: "package-policy",
          scope: "team",
          source: { type: "package", specifier: "example-policy" },
        },
      ],
    });

    expect(result).toMatchObject({
      stack: null,
      reason: expect.stringContaining("invalid source"),
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
      reason: expect.stringContaining("outside the authorized root"),
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
      reason: expect.stringContaining("outside the authorized root"),
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
