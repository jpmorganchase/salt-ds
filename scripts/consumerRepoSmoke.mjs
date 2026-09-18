import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import {
  assertConsumerJourneyReceipt,
  runCliWorkflowCoverage,
  runJourneyDoctorCoverage,
  runRepositoryAuthorityCoverage,
} from "./consumer-smoke/checks.mjs";
import {
  createExactCliInfoRepo,
  createNonSaltRepo,
  ensureBuildArtifacts,
  hashConsumerFixtureTree,
  installLocalCliPackages,
  installPackedConsumerJourney,
  installToolingWorkspaceJourney,
  loadExactPackReport,
} from "./consumer-smoke/fixture.mjs";
import { parseArgs } from "./consumer-smoke/shared.mjs";
import { sha256, writeJsonAtomic } from "./saltAiEvidenceUtils.mjs";

async function runHistoricalSmoke(tempRoot, packReport) {
  const installedToolsRoot = path.join(tempRoot, "installed-tools");
  const existingSaltRepo = path.join(tempRoot, "existing-salt-app");
  const nonSaltRepo = path.join(tempRoot, "non-salt-app");
  await installLocalCliPackages(installedToolsRoot, packReport);
  await Promise.all([
    fs.mkdir(existingSaltRepo, { recursive: true }),
    fs.mkdir(nonSaltRepo, { recursive: true }),
  ]);
  await Promise.all([
    createExactCliInfoRepo(existingSaltRepo),
    createNonSaltRepo(nonSaltRepo),
  ]);
  const cliReceipt = await runCliWorkflowCoverage(
    installedToolsRoot,
    existingSaltRepo,
    nonSaltRepo,
    packReport,
  );
  const smokeReceiptPath = path.join(
    path.dirname(packReport.reportPath),
    "consumer-smoke-receipt.json",
  );
  await writeJsonAtomic(smokeReceiptPath, {
    contract: "salt-ai-consumer-smoke/1",
    schema_version: "1.0.0",
    adapters: ["@salt-ds/cli"],
    pack_report: {
      path: path.basename(packReport.reportPath),
      sha256: sha256(await fs.readFile(packReport.reportPath)),
    },
    result: "pass",
    workflows: { cli: cliReceipt },
  });
  console.log(
    `Verified nonpublishable packed workflows: ${JSON.stringify({ cli: cliReceipt })}`,
  );
  console.log(`Wrote consumer smoke receipt: ${smokeReceiptPath}`);
  console.log("");
  console.log("Consumer smoke test passed.");
  console.log(`Installed tools root: ${installedToolsRoot}`);
  console.log(`Exact Salt repo: ${existingSaltRepo}`);
  console.log(`Non-Salt repo: ${nonSaltRepo}`);
}

async function runConsumerJourney(tempRoot, packReport) {
  const appRoot = path.join(tempRoot, "same-project-app");
  const toolingWorkspaceRoot = path.join(tempRoot, "tooling-workspace");
  const nonSaltRoot = path.join(tempRoot, "non-salt-app");
  const sameProjectInstall = await installPackedConsumerJourney(
    appRoot,
    packReport,
  );
  const toolingWorkspaceInstall = await installToolingWorkspaceJourney(
    toolingWorkspaceRoot,
    packReport,
    sameProjectInstall.uiCohort,
    sameProjectInstall.sourceArtifactOverrides,
  );
  await fs.mkdir(nonSaltRoot, { recursive: true });
  await createNonSaltRepo(nonSaltRoot);
  const fixtureRoots = [appRoot, toolingWorkspaceRoot, nonSaltRoot];
  const before = await Promise.all(fixtureRoots.map(hashConsumerFixtureTree));
  const cliReceipt = await runCliWorkflowCoverage(
    appRoot,
    appRoot,
    nonSaltRoot,
    packReport,
    {
      expectedUiVersions: sameProjectInstall.uiCohort,
      includeDoctorPerformance: false,
      verifyIdentityTamper: true,
    },
  );
  cliReceipt.repository_authority = await runRepositoryAuthorityCoverage({
    installRoot: toolingWorkspaceRoot,
    authorityRoot: toolingWorkspaceRoot,
    project: "apps/child",
    invocationRoot: nonSaltRoot,
    packReport,
    expectedUiVersions: sameProjectInstall.uiCohort,
  });
  const projectDoctor = await runJourneyDoctorCoverage(
    appRoot,
    appRoot,
    toolingWorkspaceRoot,
    packReport,
    sameProjectInstall.uiCohort,
  );
  const after = await Promise.all(fixtureRoots.map(hashConsumerFixtureTree));
  const readOnly = before.every((digest, index) => digest === after[index]);
  if (!readOnly) {
    throw new Error(
      "Packed Salt invocation changed a same-project, tooling-root, or non-Salt fixture tree.",
    );
  }
  if (
    JSON.stringify(toolingWorkspaceInstall.installedVersions) !==
      JSON.stringify(sameProjectInstall.installedVersions) ||
    JSON.stringify(toolingWorkspaceInstall.installedSourceOverrideVersions) !==
      JSON.stringify(sameProjectInstall.installedSourceOverrideVersions)
  ) {
    throw new Error(
      "The tooling workspace did not install the same Knowledge-selected UI cohort.",
    );
  }
  const journeyReceipt = {
    contract: "salt-ai-consumer-journey/1",
    schema_version: "1.0.0",
    purpose: "packed_consumer_correctness",
    doctor_performance_qualification: "not_run",
    pack_report: {
      path: path.basename(packReport.reportPath),
      sha256: sha256(await fs.readFile(packReport.reportPath)),
    },
    installation: {
      package_manager: "npm",
      cli_dependency_section: "devDependencies",
      knowledge_selection_source: "installed_package_manifest",
      installed_tool_versions: {
        "@salt-ds/cli": packReport.cli.version,
        "@salt-ds/knowledge": packReport.knowledge.version,
      },
      framework_dependencies: sameProjectInstall.frameworkDependencies,
      ui_cohort: sameProjectInstall.uiCohort,
      installed_ui_versions: sameProjectInstall.installedVersions,
      resolved_ui_declarations: sameProjectInstall.resolvedEntrypoints,
      source_artifact_overrides: Object.fromEntries(
        Object.entries(sameProjectInstall.sourceArtifactOverrides).map(
          ([name, artifact]) => [
            name,
            {
              version: artifact.version,
              tarball_sha256: `sha256:${artifact.tarballSha256}`,
              disposition: artifact.disposition,
            },
          ],
        ),
      ),
      installed_source_override_versions:
        sameProjectInstall.installedSourceOverrideVersions,
      tooling_workspace_installed_source_override_versions:
        toolingWorkspaceInstall.installedSourceOverrideVersions,
      tooling_workspace_ui_versions: toolingWorkspaceInstall.installedVersions,
      installed_cli_tree_sha256: `sha256:${sameProjectInstall.installedCliTreeSha256}`,
      installed_knowledge_tree_sha256: `sha256:${sameProjectInstall.installedKnowledgeTreeSha256}`,
      tooling_workspace_installed_cli_tree_sha256: `sha256:${toolingWorkspaceInstall.installedCliTreeSha256}`,
      tooling_workspace_installed_knowledge_tree_sha256: `sha256:${toolingWorkspaceInstall.installedKnowledgeTreeSha256}`,
      lockfile_sha256: `sha256:${sameProjectInstall.lockfileSha256}`,
      tooling_workspace_lockfile_sha256: `sha256:${toolingWorkspaceInstall.lockfileSha256}`,
    },
    workflows: { cli: cliReceipt, project_doctor: projectDoctor },
    runtime: { offline: true, read_only: readOnly },
    result: "pass",
  };
  assertConsumerJourneyReceipt(journeyReceipt);
  const receiptPath = path.join(
    path.dirname(packReport.reportPath),
    "consumer-journey-receipt.json",
  );
  await writeJsonAtomic(receiptPath, journeyReceipt);
  console.log(
    `Verified packed consumer journey: ${JSON.stringify({
      installation: journeyReceipt.installation,
      project_doctor: projectDoctor,
    })}`,
  );
  console.log(`Wrote consumer journey receipt: ${receiptPath}`);
  console.log("");
  console.log("Consumer journey passed.");
  console.log(`Same-project app: ${appRoot}`);
  console.log(`Tooling workspace: ${toolingWorkspaceRoot}`);
  console.log(`Non-Salt repo: ${nonSaltRoot}`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const tempRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), "salt-consumer-smoke-"),
  );
  try {
    console.log(`Using temp smoke root: ${tempRoot}`);
    await ensureBuildArtifacts(options.skipBuild);
    const packReport = await loadExactPackReport(options.packReport);
    if (options.journey) {
      await runConsumerJourney(tempRoot, packReport);
    } else {
      await runHistoricalSmoke(tempRoot, packReport);
    }
  } catch (error) {
    console.error("");
    console.error("Consumer smoke test failed.");
    console.error(
      error instanceof Error ? (error.stack ?? error.message) : error,
    );
    console.error(`Temp root retained at: ${tempRoot}`);
    process.exitCode = 1;
    return;
  } finally {
    if (!options.keepTemp && !process.exitCode) {
      await fs.rm(tempRoot, { recursive: true, force: true });
    }
  }
}

await main();
