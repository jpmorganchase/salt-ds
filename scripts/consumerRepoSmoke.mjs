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
  verifyInstalledMcpModuleExports,
  verifyInstalledMcpTypes,
  verifySkills,
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
    if (options.published) {
      const identity = await installPublishedPackage(
        installedToolsRoot,
        options,
      );
      console.log(`Verified registry identity: ${JSON.stringify(identity)}`);
    } else {
      await ensureBuildArtifacts(options.skipBuild);
      await installLocalPackages(installedToolsRoot);
    }
    await fs.mkdir(existingSaltRepo, { recursive: true });
    await fs.mkdir(nonSaltRepo, { recursive: true });
    await Promise.all([
      createExistingSaltRepo(existingSaltRepo),
      createNonSaltRepo(nonSaltRepo),
    ]);
    await verifyInstalledMcpModuleExports(installedToolsRoot);
    await verifyInstalledMcpTypes(installedToolsRoot);
    if (options.skillsSource) {
      await verifySkills(
        existingSaltRepo,
        options.skillsSource,
        options.expectedSkillTreeHash,
      );
    }

    await runMcpWorkflowCoverage(
      installedToolsRoot,
      existingSaltRepo,
      nonSaltRepo,
    );
    if (options.published) {
      await verifyStandaloneConsumerExample(tempRoot);
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
