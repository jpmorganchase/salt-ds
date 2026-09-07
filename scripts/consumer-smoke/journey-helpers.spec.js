import { describe, expect, it } from "vitest";

import {
  assertConsumerJourneyReceipt,
  assertJourneyDoctorSelection,
  assertRepositoryAuthorityInfo,
} from "./checks.mjs";
import {
  selectJourneySourceOverrideCohort,
  selectJourneyUiCohort,
} from "./fixture.mjs";
import { parseArgs } from "./shared.mjs";

const uiCohort = Object.freeze({
  "@salt-ds/core": "1.70.0",
  "@salt-ds/theme": "1.45.0",
});

const packReport = Object.freeze({
  cli: { version: "0.1.0" },
  knowledge: { version: "0.2.0" },
  report: {
    knowledge_bundle: {
      bundle_digest: "sha256:bundle",
      semantic_digest: "sha256:semantic",
    },
  },
});

function createSelectedWorkspace(workspaceUnitId) {
  return {
    workspace_unit_id: workspaceUnitId,
    package_vector: Object.entries(uiCohort).map(([name, observedVersion]) => ({
      name,
      observed_version: observedVersion,
    })),
    project_decision: {
      status: "selected",
      reason_code: "SALT_PROJECT_SELECTED",
    },
  };
}

function createDoctorResult(selectedWorkspace, toolingRoot = false) {
  const workspaceUnits = [createSelectedWorkspace(selectedWorkspace)];
  if (toolingRoot) {
    workspaceUnits.unshift({
      workspace_unit_id: ".",
      package_vector: [],
      project_decision: {
        status: "not_salt",
        reason_code: "SALT_PROJECT_NO_SALT_PACKAGES",
      },
    });
  }
  return {
    contract: "salt-doctor-result/1",
    status: "complete",
    reason_code: "SALT_PROJECT_SELECTED",
    tool: { package: "@salt-ds/cli", version: packReport.cli.version },
    knowledge: {
      package: "@salt-ds/knowledge",
      version: packReport.knowledge.version,
      bundle_digest: packReport.report.knowledge_bundle.bundle_digest,
      semantic_digest: packReport.report.knowledge_bundle.semantic_digest,
    },
    workspace_units: workspaceUnits,
    coverage: { status: "complete", timeout: false },
  };
}

function createJourneyReceipt() {
  return {
    contract: "salt-ai-consumer-journey/1",
    schema_version: "1.0.0",
    purpose: "packed_consumer_correctness",
    doctor_performance_qualification: "not_run",
    installation: {
      ui_cohort: { ...uiCohort },
      installed_ui_versions: { ...uiCohort },
      tooling_workspace_ui_versions: { ...uiCohort },
      resolved_ui_declarations: {
        "@salt-ds/core": "node_modules/@salt-ds/core/package.json",
        "@salt-ds/theme": "node_modules/@salt-ds/theme/package.json",
      },
      source_artifact_overrides: {
        "@salt-ds/icons": {
          version: "1.18.2",
          tarball_sha256: `sha256:${"e".repeat(64)}`,
          disposition: "local_built_source_artifact",
        },
        "@salt-ds/styles": {
          version: "0.4.0",
          tarball_sha256: `sha256:${"f".repeat(64)}`,
          disposition: "local_built_source_artifact",
        },
      },
      installed_source_override_versions: {
        "@salt-ds/icons": "1.18.2",
        "@salt-ds/styles": "0.4.0",
      },
      tooling_workspace_installed_source_override_versions: {
        "@salt-ds/icons": "1.18.2",
        "@salt-ds/styles": "0.4.0",
      },
      installed_tool_versions: {
        "@salt-ds/cli": packReport.cli.version,
        "@salt-ds/knowledge": packReport.knowledge.version,
      },
      framework_dependencies: {
        react: "18.3.1",
        "react-dom": "18.3.1",
      },
      cli_dependency_section: "devDependencies",
      installed_cli_tree_sha256: `sha256:${"a".repeat(64)}`,
      installed_knowledge_tree_sha256: `sha256:${"b".repeat(64)}`,
      tooling_workspace_installed_cli_tree_sha256: `sha256:${"a".repeat(64)}`,
      tooling_workspace_installed_knowledge_tree_sha256: `sha256:${"b".repeat(
        64,
      )}`,
      lockfile_sha256: `sha256:${"c".repeat(64)}`,
      tooling_workspace_lockfile_sha256: `sha256:${"d".repeat(64)}`,
    },
    workflows: {
      cli: {
        aliases: { help: 3, version: 2, broken_pipe: 1 },
        invalid_argument_cases: 33,
        terminal_safety: { control_characters: "sanitized" },
        repository_authority: {
          project_root: "apps/child",
          invocation_outside_repository: true,
          info_paths: "repository_relative",
          docs: "resolved",
          context: "resolved",
        },
        exact_info: {
          cli_version: packReport.cli.version,
          knowledge_version: packReport.knowledge.version,
        },
        agent_support: {
          integrity: "manifest_verified",
          tamper_rejected: true,
        },
        rejected_retrieval: {
          docs: "SALT_PROJECT_NO_SALT_PACKAGES",
          context: "SALT_PROJECT_NO_SALT_PACKAGES",
        },
        doctor: {
          contract: "salt-ai-packed-doctor-correctness/1",
          offline: true,
          read_only: true,
        },
      },
      project_doctor: {
        same_project: {
          selected_workspace: ".",
          status: "complete",
        },
        tooling_root: {
          selected_workspace: "apps/child",
          status: "complete",
        },
        performance_qualification: "not_run",
      },
    },
    runtime: { offline: true, read_only: true },
    result: "pass",
  };
}

describe("consumer journey argument parsing", () => {
  it("accepts --journey while retaining exact pack-report requirements", () => {
    expect(
      parseArgs([
        "--journey",
        "--skip-build",
        "--pack-report",
        "dist/salt-ai-pack/plan-032.json",
      ]),
    ).toEqual({
      journey: true,
      keepTemp: false,
      skipBuild: true,
      packReport: "dist/salt-ai-pack/plan-032.json",
    });

    expect(() => parseArgs(["--journey"])).toThrow(/requires --pack-report/u);
    expect(() =>
      parseArgs(["--journey", "--unknown", "--pack-report", "report.json"]),
    ).toThrow(/Unknown consumer smoke option/u);
  });
});

describe("journey UI cohort selection", () => {
  it("derives only the exact tested Core and Theme versions", () => {
    expect(
      selectJourneyUiCohort({
        compatibility: {
          packages: [
            { name: "@salt-ds/core", tested_version: "1.70.0" },
            { name: "@salt-ds/lab", tested_version: "1.2.3" },
            { name: "@salt-ds/theme", tested_version: "1.45.0" },
          ],
        },
      }),
    ).toEqual(uiCohort);
  });

  it("derives the exact source override from the same installed cohort", () => {
    expect(
      selectJourneySourceOverrideCohort({
        compatibility: {
          packages: [
            { name: "@salt-ds/core", tested_version: "1.70.0" },
            { name: "@salt-ds/icons", tested_version: "1.18.2" },
            { name: "@salt-ds/styles", tested_version: "0.4.0" },
          ],
        },
      }),
    ).toEqual({
      "@salt-ds/icons": "1.18.2",
      "@salt-ds/styles": "0.4.0",
    });
  });

  it("rejects an incomplete source override cohort", () => {
    expect(() =>
      selectJourneySourceOverrideCohort({
        compatibility: {
          packages: [{ name: "@salt-ds/icons", tested_version: "1.18.2" }],
        },
      }),
    ).toThrow(/did not select exactly one @salt-ds\/styles/u);
  });

  it.each([
    ["missing", [{ name: "@salt-ds/core", tested_version: "1.70.0" }]],
    [
      "duplicate",
      [
        { name: "@salt-ds/core", tested_version: "1.70.0" },
        { name: "@salt-ds/core", tested_version: "1.71.0" },
        { name: "@salt-ds/theme", tested_version: "1.45.0" },
      ],
    ],
    [
      "malformed",
      [
        { name: "@salt-ds/core", tested_version: "1.70.0" },
        { name: "@salt-ds/theme", tested_version: "" },
      ],
    ],
  ])("rejects a %s compatibility cohort", (_label, packages) => {
    expect(() =>
      selectJourneyUiCohort({ compatibility: { packages } }),
    ).toThrow(/did not select exactly one/u);
  });
});

describe("journey Doctor selection proof", () => {
  it("accepts minimal valid same-project and tooling-root results", () => {
    expect(() =>
      assertJourneyDoctorSelection(createDoctorResult("."), {
        selectedWorkspace: ".",
        uiCohort,
        packReport,
      }),
    ).not.toThrow();
    expect(() =>
      assertJourneyDoctorSelection(createDoctorResult("apps/child", true), {
        selectedWorkspace: "apps/child",
        uiCohort,
        packReport,
        toolingRoot: true,
      }),
    ).not.toThrow();
  });

  it("rejects tooling in the selected UI vector", () => {
    const result = createDoctorResult(".");
    result.workspace_units[0].package_vector.push({
      name: "@salt-ds/cli",
      observed_version: packReport.cli.version,
    });

    expect(() =>
      assertJourneyDoctorSelection(result, {
        selectedWorkspace: ".",
        uiCohort,
        packReport,
      }),
    ).toThrow(/independently of tooling packages/u);
  });

  it("rejects a broken selected workspace", () => {
    const result = createDoctorResult("apps/child", true);
    result.workspace_units[1].project_decision.status = "unsupported";

    expect(() =>
      assertJourneyDoctorSelection(result, {
        selectedWorkspace: "apps/child",
        uiCohort,
        packReport,
        toolingRoot: true,
      }),
    ).toThrow(/did not select the real apps\/child UI cohort/u);
  });
});

describe("consumer journey receipt proof", () => {
  it("accepts a minimal valid correctness receipt", () => {
    expect(() =>
      assertConsumerJourneyReceipt(createJourneyReceipt()),
    ).not.toThrow();
  });

  it.each([
    [
      "retained terminal safety",
      (receipt) => {
        receipt.workflows.cli.terminal_safety.control_characters = "raw";
      },
    ],
    [
      "installed-package identity",
      (receipt) => {
        receipt.installation.installed_cli_tree_sha256 = "unverified";
      },
    ],
    [
      "local source artifact identity",
      (receipt) => {
        delete receipt.installation.source_artifact_overrides[
          "@salt-ds/styles"
        ];
      },
    ],
    [
      "same-project selection",
      (receipt) => {
        receipt.workflows.project_doctor.same_project.status = "incomplete";
      },
    ],
    [
      "tooling-root selection",
      (receipt) => {
        receipt.workflows.project_doctor.tooling_root.selected_workspace = ".";
      },
    ],
    [
      "Doctor performance payload separation",
      (receipt) => {
        receipt.workflows.cli.doctor.performance = { p90_wall_ms: 1 };
      },
    ],
    [
      "Doctor performance qualification separation",
      (receipt) => {
        receipt.workflows.project_doctor.performance_qualification = "passed";
      },
    ],
  ])("rejects broken %s proof", (_label, mutate) => {
    const receipt = createJourneyReceipt();
    mutate(receipt);

    expect(() => assertConsumerJourneyReceipt(receipt)).toThrow(
      /omitted a required installation, safety, identity, or selection proof/u,
    );
  });
});

describe("repository authority info proof", () => {
  function authorityInfo() {
    return {
      project: {
        root: "apps/child",
        package_manifest: { path: "apps/child/package.json" },
        workspace: { packageRoot: "apps/child", workspaceRoot: "." },
        packages: Object.entries(uiCohort).map(([name, observedVersion]) => ({
          name,
          observed_version: observedVersion,
          observed_manifest_path: `node_modules/${name}/package.json`,
        })),
      },
      selection: {
        status: "selected",
        reason_code: "SALT_PROJECT_SELECTED",
      },
    };
  }

  it("accepts repository-relative observations for an explicit child", () => {
    expect(() =>
      assertRepositoryAuthorityInfo(authorityInfo(), {
        project: "apps/child",
        expectedUiVersions: uiCohort,
        authorityRoot: "C:\\private\\repository",
      }),
    ).not.toThrow();
  });

  it.each([
    ["an absolute leak", "C:\\private\\repository\\package.json"],
    ["a traversal", "../package.json"],
  ])("rejects %s in observed paths", (_label, observedPath) => {
    const info = authorityInfo();
    info.project.packages[0].observed_manifest_path = observedPath;
    expect(() =>
      assertRepositoryAuthorityInfo(info, {
        project: "apps/child",
        expectedUiVersions: uiCohort,
        authorityRoot: "C:\\private\\repository",
      }),
    ).toThrow(/leaked its authority/u);
  });
});
