import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { runMcpWorkflowCoverage } from "./consumer-smoke/checks.mjs";
import {
  createExistingSaltRepo,
  createNonSaltRepo,
  ensureBuildArtifacts,
  installLocalPackages,
  installPublishedPackage,
  loadExactPackReport,
  verifyInstalledMcpModuleExports,
  verifyInstalledMcpTypes,
  verifyStandaloneConsumerExample,
} from "./consumer-smoke/fixture.mjs";
import { parseArgs } from "./consumer-smoke/shared.mjs";

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
      const localInstallation = await installLocalPackages(
        installedToolsRoot,
        packReport,
      );
      standaloneMcpSpec = localInstallation.tarballPath;
      standaloneExpectedVersion = localInstallation.packMetadata.version;
      standaloneExpectedPackageTreeSha256 =
        localInstallation.installedTreeSha256;
      comparisonRegistryDir = packReport.comparisonRegistryDir;
    }
    await fs.mkdir(existingSaltRepo, { recursive: true });
    await fs.mkdir(nonSaltRepo, { recursive: true });
    await Promise.all([
      createExistingSaltRepo(existingSaltRepo),
      createNonSaltRepo(nonSaltRepo),
    ]);
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
        "Verified nonpublishable Unit 02 workflows from the exact two-package report; standalone publication replay remains embargoed.",
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
