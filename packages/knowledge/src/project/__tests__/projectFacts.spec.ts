import { describe, expect, it } from "vitest";
import { createSaltProjectFacts } from "../projectFacts.js";

describe("protocol-neutral Salt project facts", () => {
  it("preserves installed-package facts without transport authority", () => {
    const facts = createSaltProjectFacts({
      rootDir: "D:/fixture",
      packageManifest: {
        status: "valid",
        path: "D:/fixture/package.json",
        name: "fixture",
        packageManager: "yarn@4.17.0",
      },
      declaredSaltPackages: [{ name: "@salt-ds/core", version: "^1.0.0" }],
      installation: {
        resolvedPackages: [
          {
            name: "@salt-ds/core",
            declaredVersion: "^1.0.0",
            effectiveDeclaredVersion: "^1.0.0",
            declarationResolution: "verified",
            resolvedVersion: "1.2.3",
            resolvedPath: "D:/fixture/node_modules/@salt-ds/core/package.json",
            satisfiesDeclaredVersion: true,
          },
        ],
        versionHealth: {
          declaredVersions: ["^1.0.0"],
          resolvedVersions: ["1.2.3"],
          multipleDeclaredVersions: false,
          multipleResolvedVersions: false,
          mismatchedPackages: [],
          unverifiablePackages: [],
          issues: [],
        },
        inspection: {
          packageManager: "yarn",
          packageManagerDetectionStatus: "declared",
          strategy: "manifest-resolution",
          status: "succeeded",
          packageLayout: "node-modules",
          limitations: [],
          manifestOverrideFields: [],
        },
        workspace: {
          kind: "single-package",
          packageRoot: "D:/fixture",
          workspaceRoot: null,
          issueSourceHint: "none",
          workspaceSaltPackages: [],
          workspaceIssues: [],
        },
      },
    });

    expect(facts.installation.resolvedPackages[0]).toMatchObject({
      name: "@salt-ds/core",
      resolvedVersion: "1.2.3",
      satisfiesDeclaredVersion: true,
    });
    expect(facts).not.toHaveProperty("policy");
    expect(JSON.stringify(facts)).not.toMatch(
      /resource_uri|snapshot|handle|authorization|transport/iu,
    );
  });
});
