import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { runCliWorkflowCoverage } from "./consumer-smoke/checks.mjs";
import { runMcpWorkflowCoverage } from "./consumer-smoke/mcp-checks.mjs";
import {
  createExactCliInfoRepo,
  createExistingSaltRepo,
  createNonSaltRepo,
  ensureBuildArtifacts,
  installLocalCliPackages,
  installLocalPackages,
  installPublishedPackage,
  loadExactPackReport,
  verifyInstalledMcpModuleExports,
  verifyInstalledMcpTypes,
  verifyStandaloneConsumerExample,
} from "./consumer-smoke/fixture.mjs";
import { parseArgs } from "./consumer-smoke/shared.mjs";
import {
  sha256,
  writeJsonAtomic,
} from "./saltAiEvidenceUtils.mjs";

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const tempRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), "salt-consumer-smoke-"),
  );
  const installedToolsRoot = path.join(tempRoot, "installed-tools");
  const existingSaltRepo = path.join(tempRoot, "existing-salt-app");
  const nonSaltRepo = path.join(tempRoot, "non-salt-app");

  try {
    console.log(`Using temp smoke root: ${tempRoot}`);
    let standaloneMcpSpec = options.mcpSpec;
    let standaloneExpectedVersion = options.expectedVersion ?? null;
    let standaloneExpectedPackageTreeSha256 = null;
    let comparisonRegistryDir = null;
    let localCliInstallation = null;
    let localMcpInstallation = null;
    let localPackReport = null;
    if (options.published) {
      const identity = await installPublishedPackage(
        installedToolsRoot,
        options,
      );
      standaloneExpectedPackageTreeSha256 = identity.installedTreeSha256;
      console.log(`Verified registry identity: ${JSON.stringify(identity)}`);
    } else {
      await ensureBuildArtifacts(options.skipBuild);
      const packReport = await loadExactPackReport(options.packReport);
      localPackReport = packReport;
      if (packReport.cli) {
        localCliInstallation = await installLocalCliPackages(
          path.join(installedToolsRoot, "cli"),
          packReport,
        );
      }
      if (packReport.mcp) {
        localMcpInstallation = await installLocalPackages(
          path.join(installedToolsRoot, "mcp"),
          packReport,
        );
        standaloneMcpSpec = localMcpInstallation.tarballPath;
        standaloneExpectedVersion = localMcpInstallation.packMetadata.version;
        standaloneExpectedPackageTreeSha256 =
          localMcpInstallation.installedTreeSha256;
        comparisonRegistryDir = packReport.comparisonRegistryDir;
      }
    }
    await fs.mkdir(existingSaltRepo, { recursive: true });
    await fs.mkdir(nonSaltRepo, { recursive: true });
    await Promise.all([
      localCliInstallation
        ? createExactCliInfoRepo(existingSaltRepo)
        : createExistingSaltRepo(existingSaltRepo),
      createNonSaltRepo(nonSaltRepo),
    ]);
    if (localCliInstallation) {
      const cliReceipt = await runCliWorkflowCoverage(
        path.join(installedToolsRoot, "cli"),
        existingSaltRepo,
        nonSaltRepo,
        localPackReport,
      );
      let mcpReceipt = null;
      if (localMcpInstallation) {
        const mcpRoot = path.join(installedToolsRoot, "mcp");
        const moduleFingerprint = await verifyInstalledMcpModuleExports(
          mcpRoot,
          existingSaltRepo,
        );
        await verifyInstalledMcpTypes(mcpRoot);
        mcpReceipt = await runMcpWorkflowCoverage(
          mcpRoot,
          existingSaltRepo,
          nonSaltRepo,
          moduleFingerprint,
        );
      }
      const smokeReceiptPath = path.join(
        path.dirname(localPackReport.reportPath),
        "consumer-smoke-receipt.json",
      );
      await writeJsonAtomic(smokeReceiptPath, {
        contract: "salt-ai-consumer-smoke/1",
        schema_version: "1.0.0",
        adapters: localMcpInstallation
          ? ["@salt-ds/cli", "@salt-ds/mcp"]
          : ["@salt-ds/cli"],
        pack_report: {
          path: path.basename(localPackReport.reportPath),
          sha256: sha256(await fs.readFile(localPackReport.reportPath)),
        },
        result: "pass",
        workflows: {
          cli: cliReceipt,
          ...(mcpReceipt ? { mcp: mcpReceipt } : {}),
        },
      });
      console.log(
        `Verified nonpublishable packed workflows: ${JSON.stringify({ cli: cliReceipt, ...(mcpReceipt ? { mcp: mcpReceipt } : {}) })}`,
      );
      console.log(`Wrote consumer smoke receipt: ${smokeReceiptPath}`);
      console.log("");
      console.log("Consumer smoke test passed.");
      console.log(`Installed tools root: ${installedToolsRoot}`);
      console.log(`Exact Salt repo: ${existingSaltRepo}`);
      console.log(`Non-Salt repo: ${nonSaltRepo}`);
      return;
    }
    const moduleFingerprint = await verifyInstalledMcpModuleExports(
      installedToolsRoot,
      existingSaltRepo,
      comparisonRegistryDir,
    );
    await verifyInstalledMcpTypes(installedToolsRoot);

    await runMcpWorkflowCoverage(
      installedToolsRoot,
      existingSaltRepo,
      nonSaltRepo,
      moduleFingerprint,
      comparisonRegistryDir,
    );
    if (options.published) {
      const standaloneReceipt = await verifyStandaloneConsumerExample(
        tempRoot,
        standaloneMcpSpec,
        {
          expectedPackageTreeSha256: standaloneExpectedPackageTreeSha256,
          expectedVersion: standaloneExpectedVersion,
        },
      );
      console.log(
        `Verified standalone exact-package replay: ${JSON.stringify(standaloneReceipt)}`,
      );
    } else {
      console.log(
        "Verified nonpublishable workflows from the exact two-package report; standalone publication replay remains embargoed.",
      );
    }

    console.log("");
    console.log("Consumer smoke test passed.");
    console.log(`Installed tools root: ${installedToolsRoot}`);
    console.log(`Existing Salt repo: ${existingSaltRepo}`);
    console.log(`Non-Salt repo: ${nonSaltRepo}`);
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
