import { describe, expect, it } from "vitest";
import { parseDoctorResult, parseRuntimeInspectResult } from "../schemas.js";

describe("runtime inspector schemas", () => {
  it("accepts a valid doctor result payload", () => {
    const result = parseDoctorResult({
      toolVersion: "1.0.0",
      timestamp: "2026-03-25T12:00:00Z",
      rootDir: "D:/repo",
      environment: {
        os: "Windows",
        nodeVersion: "v22.0.0",
        packageManager: "yarn",
      },
      saltPackages: [{ name: "@salt-ds/core", version: "1.2.3" }],
      saltInstallation: {
        nodeModulesRoots: ["D:/repo/node_modules"],
        resolvedPackages: [
          {
            name: "@salt-ds/core",
            declaredVersion: "1.2.3",
            resolvedVersion: "1.2.3",
            resolvedPath: "D:/repo/node_modules/@salt-ds/core/package.json",
            satisfiesDeclaredVersion: true,
          },
        ],
        installedPackages: [
          {
            name: "@salt-ds/core",
            version: "1.2.3",
            path: "D:/repo/node_modules/@salt-ds/core/package.json",
          },
        ],
        versionHealth: {
          declaredVersions: ["1.2.3"],
          resolvedVersions: ["1.2.3"],
          installedVersions: ["1.2.3"],
          multipleDeclaredVersions: false,
          multipleResolvedVersions: false,
          multipleInstalledVersions: false,
          mismatchedPackages: [],
          issues: [],
        },
        inspection: {
          packageManager: "yarn",
          strategy: "package-manager-command",
          status: "succeeded",
          listCommand: "yarn list --json --pattern @salt-ds",
          discoveredVersions: ["1.2.3"],
          error: null,
          packageLayout: "node-modules",
          limitations: [],
          manifestOverrideFields: [],
        },
        remediation: {
          explainCommand: "yarn why @salt-ds/core",
          dedupeCommand: "yarn dedupe",
          reinstallCommand: "yarn install",
        },
        workspace: {
          kind: "single-package",
          packageRoot: "D:/repo",
          workspaceRoot: null,
          issueSourceHint: "none",
          workspaceSaltPackages: [],
          workspaceIssues: [],
        },
        duplicatePackages: [],
        healthSummary: {
          health: "pass",
          recommendedAction: "none",
          blockingWorkflows: [],
          reasons: [],
        },
      },
      repoSignals: {
        storybookDetected: true,
        appRuntimeDetected: false,
        saltTeamConfigFound: true,
        saltStackConfigFound: false,
      },
      runtimeTargets: [],
      policyLayers: {
        teamConfigPath: "D:/repo/.salt/team.json",
        stackConfigPath: null,
        layers: [],
      },
      checks: [
        {
          id: "storybook-present",
          status: "pass",
          summary: "Storybook detected",
        },
      ],
      artifacts: [],
      redactionsApplied: true,
    });

    expect(result.environment.packageManager).toBe("yarn");
    expect(result.repoSignals.storybookDetected).toBe(true);
  });

  it("rejects an invalid doctor result payload", () => {
    expect(() =>
      parseDoctorResult({
        toolVersion: "1.0.0",
        timestamp: "2026-03-25T12:00:00Z",
        rootDir: "D:/repo",
        environment: {
          os: "Windows",
          nodeVersion: "v22.0.0",
          packageManager: "yarn",
        },
        saltPackages: [],
        saltInstallation: {
          nodeModulesRoots: [],
          resolvedPackages: [],
          installedPackages: [],
          versionHealth: {
            declaredVersions: [],
            resolvedVersions: [],
            installedVersions: [],
            multipleDeclaredVersions: false,
            multipleResolvedVersions: false,
            multipleInstalledVersions: false,
            mismatchedPackages: [],
            issues: [],
          },
          inspection: {
            packageManager: "yarn",
            strategy: "package-manager-command",
            status: "succeeded",
            listCommand: "yarn list --json --pattern @salt-ds",
            discoveredVersions: [],
            error: null,
            packageLayout: "node-modules",
            limitations: [],
            manifestOverrideFields: [],
          },
          remediation: {
            explainCommand: "yarn why @salt-ds/core",
            dedupeCommand: "yarn dedupe",
            reinstallCommand: "yarn install",
          },
          workspace: {
            kind: "single-package",
            packageRoot: "D:/repo",
            workspaceRoot: null,
            issueSourceHint: "none",
            workspaceSaltPackages: [],
            workspaceIssues: [],
          },
          duplicatePackages: [],
          healthSummary: {
            health: "pass",
            recommendedAction: "none",
            blockingWorkflows: [],
            reasons: [],
          },
        },
        repoSignals: {
          storybookDetected: true,
          appRuntimeDetected: false,
          saltTeamConfigFound: true,
          saltStackConfigFound: false,
        },
        runtimeTargets: [],
        policyLayers: {
          teamConfigPath: "D:/repo/.salt/team.json",
          stackConfigPath: null,
          layers: [],
        },
        checks: [{ id: "storybook-present", summary: "missing status" }],
        artifacts: [],
        redactionsApplied: true,
      }),
    ).toThrow();
  });

  it("accepts a valid runtime inspect result payload", () => {
    const result = parseRuntimeInspectResult({
      toolVersion: "1.0.0",
      timestamp: "2026-03-25T12:00:00Z",
      inspectionMode: "fetched-html",
      notes: [],
      target: {
        url: "http://localhost:6006/?path=/story/button--default",
      },
      page: {
        title: "Button story",
        loadState: "complete",
        statusCode: 200,
        contentType: "text/html",
      },
      errors: [{ kind: "console", level: "error", message: "Boom" }],
      accessibility: {
        roles: [{ role: "button", name: "Save", count: 1 }],
        landmarks: [{ role: "main", name: "" }],
      },
      structure: {
        summary: ["main > button"],
      },
      layout: {
        available: true,
        mode: "computed-style",
        hints: ['navigation("Primary") uses flex centering.'],
        nodes: [
          {
            selector: "nav.primary-nav",
            label: 'navigation("Primary")',
            role: "navigation",
            name: "Primary",
            box: {
              x: 0,
              y: 0,
              width: 1200,
              height: 64,
            },
            computedStyle: {
              display: "flex",
              position: "static",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "start",
              overflowX: "visible",
              overflowY: "visible",
            },
            ancestorChain: [],
            hints: ['navigation("Primary") uses flex centering.'],
          },
        ],
      },
      screenshots: [
        {
          path: "./artifacts/runtime/button.png",
          label: "full-page",
        },
      ],
      artifacts: [
        {
          kind: "json",
          path: "./artifacts/runtime/report.json",
        },
      ],
    });

    expect(result.accessibility.roles[0]?.role).toBe("button");
    expect(result.screenshots[0]?.label).toBe("full-page");
    expect(result.inspectionMode).toBe("fetched-html");
    expect(result.notes).toEqual([]);
    expect(result.layout.available).toBe(true);
  });
});
