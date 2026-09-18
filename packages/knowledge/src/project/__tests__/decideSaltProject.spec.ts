import { describe, expect, it } from "vitest";
import type { KnowledgeManifestV1 } from "../../schemas/knowledgeManifestV1.js";
import {
  decideSaltProject,
  SALT_PROJECT_DECISION_REASONS,
  SALT_PROJECT_DECISION_STATUSES,
} from "../decideSaltProject.js";
import { createSaltProjectFacts } from "../projectFacts.js";

const manifest = {
  compatibility: {
    packages: [
      {
        name: "@salt-ds/core",
        required: true,
        tested_version: "1.70.0",
        supported_range: "1.70.0",
      },
      {
        name: "@salt-ds/theme",
        required: false,
        tested_version: "1.45.0",
        supported_range: "1.45.0",
      },
    ],
  },
} as KnowledgeManifestV1;

interface FixturePackage {
  name: string;
  declaredVersion: string;
  resolvedVersion: string | null;
  declarationResolution?: "verified" | "unverifiable";
  satisfiesDeclaredVersion?: boolean | null;
}

function projectFacts(
  packages: FixturePackage[],
  options: {
    inspectionStatus?: "succeeded" | "limited";
    detectionStatus?: "declared" | "ambiguous" | "invalid";
    multipleDeclaredVersions?: boolean;
    multipleResolvedVersions?: boolean;
    workspaceIssues?: string[];
  } = {},
) {
  const resolvedPackages = packages.map((entry) => ({
    name: entry.name,
    declaredVersion: entry.declaredVersion,
    effectiveDeclaredVersion: entry.declaredVersion,
    declarationResolution: entry.declarationResolution ?? "verified",
    resolvedVersion: entry.resolvedVersion,
    resolvedPath:
      entry.resolvedVersion === null
        ? null
        : `D:/fixture/node_modules/${entry.name}/package.json`,
    satisfiesDeclaredVersion:
      entry.satisfiesDeclaredVersion ??
      (entry.resolvedVersion === null ? null : true),
  }));
  const unverifiablePackages = resolvedPackages
    .filter(
      (entry) =>
        entry.declarationResolution === "unverifiable" ||
        entry.resolvedVersion === null,
    )
    .map((entry) => ({
      name: entry.name,
      declaredVersion: entry.declaredVersion,
      resolvedVersion: entry.resolvedVersion,
      resolvedPath: entry.resolvedPath,
    }));
  const workspaceIssues = options.workspaceIssues ?? [];
  return createSaltProjectFacts({
    rootDir: "D:/fixture",
    packageManifest: {
      status: "valid",
      path: "D:/fixture/package.json",
      name: "fixture",
      packageManager: "npm@11.0.0",
    },
    declaredSaltPackages: packages.map((entry) => ({
      name: entry.name,
      version: entry.declaredVersion,
    })),
    installation: {
      resolvedPackages,
      versionHealth: {
        declaredVersions: packages.map((entry) => entry.declaredVersion),
        resolvedVersions: packages.flatMap((entry) =>
          entry.resolvedVersion === null ? [] : [entry.resolvedVersion],
        ),
        multipleDeclaredVersions: options.multipleDeclaredVersions ?? false,
        multipleResolvedVersions: options.multipleResolvedVersions ?? false,
        mismatchedPackages: [],
        unverifiablePackages,
        issues: [],
      },
      inspection: {
        packageManager: "npm",
        packageManagerDetectionStatus: options.detectionStatus ?? "declared",
        strategy: "manifest-resolution",
        status: options.inspectionStatus ?? "succeeded",
        packageLayout: "node-modules",
        limitations: [],
        manifestOverrideFields: [],
      },
      workspace: {
        kind: "single-package",
        packageRoot: "D:/fixture",
        workspaceRoot: null,
        issueSourceHint:
          workspaceIssues.length === 0 ? "none" : "package-local",
        workspaceSaltPackages: [],
        workspaceIssues,
      },
    },
  });
}

const exactCore = {
  name: "@salt-ds/core",
  declaredVersion: "1.70.0",
  resolvedVersion: "1.70.0",
};

describe("closed Salt project decision", () => {
  it("exports the closed status and reason vocabularies", () => {
    expect(SALT_PROJECT_DECISION_STATUSES).toEqual([
      "selected",
      "not_salt",
      "unverifiable",
      "unsupported",
    ]);
    expect(SALT_PROJECT_DECISION_REASONS).toHaveLength(7);
  });

  it("selects exact Core while allowing optional families to be absent", () => {
    expect(decideSaltProject(projectFacts([exactCore]), manifest)).toEqual({
      contract: "salt-project-decision/1",
      schema_version: "1.0.0",
      status: "selected",
      reason_code: "SALT_PROJECT_SELECTED",
      installed_package_vector: [{ name: "@salt-ds/core", version: "1.70.0" }],
    });
  });

  it("selects independently versioned exact package families", () => {
    expect(
      decideSaltProject(
        projectFacts([
          exactCore,
          {
            name: "@salt-ds/theme",
            declaredVersion: "1.45.0",
            resolvedVersion: "1.45.0",
          },
        ]),
        manifest,
      ),
    ).toMatchObject({
      status: "selected",
      reason_code: "SALT_PROJECT_SELECTED",
      installed_package_vector: [
        { name: "@salt-ds/core", version: "1.70.0" },
        { name: "@salt-ds/theme", version: "1.45.0" },
      ],
    });
  });

  it("allows a verified declaration range but records only exact installed versions", () => {
    const result = decideSaltProject(
      projectFacts([
        {
          ...exactCore,
          declaredVersion: "^1.70.0",
          satisfiesDeclaredVersion: true,
        },
      ]),
      manifest,
    );
    expect(result.status).toBe("selected");
    expect(result.installed_package_vector[0]?.version).toBe("1.70.0");
    expect(JSON.stringify(result)).not.toContain("^1.70.0");
  });

  it("classifies no Salt evidence before incomplete inspection", () => {
    expect(
      decideSaltProject(
        projectFacts([], { inspectionStatus: "limited" }),
        manifest,
      ),
    ).toMatchObject({
      status: "not_salt",
      reason_code: "SALT_PROJECT_NO_SALT_PACKAGES",
    });
  });

  it("classifies ambiguous or incomplete evidence before support checks", () => {
    expect(
      decideSaltProject(
        projectFacts(
          [
            {
              name: "@salt-ds/theme",
              declaredVersion: "1.45.0",
              resolvedVersion: "1.45.0",
            },
          ],
          { detectionStatus: "ambiguous" },
        ),
        manifest,
      ),
    ).toMatchObject({
      status: "unverifiable",
      reason_code: "SALT_PROJECT_PACKAGE_EVIDENCE_AMBIGUOUS",
    });
    expect(
      decideSaltProject(
        projectFacts([
          {
            ...exactCore,
            resolvedVersion: null,
            declarationResolution: "unverifiable",
          },
        ]),
        manifest,
      ),
    ).toMatchObject({
      status: "unverifiable",
      reason_code: "SALT_PROJECT_INSPECTION_INCOMPLETE",
    });
  });

  it("rejects duplicate package evidence as ambiguous", () => {
    expect(
      decideSaltProject(projectFacts([exactCore, exactCore]), manifest),
    ).toMatchObject({
      status: "unverifiable",
      reason_code: "SALT_PROJECT_PACKAGE_EVIDENCE_AMBIGUOUS",
    });
  });

  it("rejects an exact optional family when Core is missing", () => {
    expect(
      decideSaltProject(
        projectFacts([
          {
            name: "@salt-ds/theme",
            declaredVersion: "1.45.0",
            resolvedVersion: "1.45.0",
          },
        ]),
        manifest,
      ),
    ).toMatchObject({
      status: "unsupported",
      reason_code: "SALT_PROJECT_CORE_REQUIRED",
    });
  });

  it("rejects unknown families after exact Core is established", () => {
    expect(
      decideSaltProject(
        projectFacts([
          exactCore,
          {
            name: "@salt-ds/unknown",
            declaredVersion: "1.0.0",
            resolvedVersion: "1.0.0",
          },
        ]),
        manifest,
      ),
    ).toMatchObject({
      status: "unsupported",
      reason_code: "SALT_PROJECT_PACKAGE_FAMILY_UNKNOWN",
    });
  });

  it("rejects observed versions that differ from the tested version", () => {
    expect(
      decideSaltProject(
        projectFacts([{ ...exactCore, resolvedVersion: "1.70.1" }]),
        manifest,
      ),
    ).toMatchObject({
      status: "unsupported",
      reason_code: "SALT_PROJECT_EXACT_VERSION_REQUIRED",
    });
  });
});
