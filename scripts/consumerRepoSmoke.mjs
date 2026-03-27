import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import {
  runDoctor,
  runMcpWorkflowCoverage,
  runPublicCliWorkflowCoverage,
  runRuntimeInspect,
} from "./consumer-smoke/checks.mjs";
import {
  createExistingSaltRepo,
  createNewProjectRepo,
  createNonSaltRepo,
  ensureBuildArtifacts,
  installLocalPackages,
  verifySkills,
} from "./consumer-smoke/fixture.mjs";
import {
  closeServer,
  parseArgs,
  startServer,
} from "./consumer-smoke/shared.mjs";

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const tempRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), "salt-consumer-smoke-"),
  );
  const installedToolsRoot = path.join(tempRoot, "installed-tools");
  const existingSaltRepo = path.join(tempRoot, "existing-salt-app");
  const nonSaltRepo = path.join(tempRoot, "non-salt-app");
  const newProjectRepo = path.join(tempRoot, "new-project-app");
  let runtimeServer = null;

  try {
    console.log(`Using temp smoke root: ${tempRoot}`);
    await ensureBuildArtifacts(options.skipBuild);
    await fs.mkdir(existingSaltRepo, { recursive: true });
    await fs.mkdir(nonSaltRepo, { recursive: true });
    await fs.mkdir(newProjectRepo, { recursive: true });
    await Promise.all([
      createExistingSaltRepo(existingSaltRepo),
      createNonSaltRepo(nonSaltRepo),
      createNewProjectRepo(newProjectRepo),
    ]);
    await installLocalPackages(installedToolsRoot);
    await verifySkills(existingSaltRepo, options.skillsSource);

    runtimeServer = await startServer(`
      <!doctype html>
      <html>
        <head><title>Salt Smoke Runtime</title></head>
        <body>
          <main>
            <button aria-label="Save">Save</button>
          </main>
        </body>
      </html>
    `);

    await Promise.all([
      runDoctor(installedToolsRoot, existingSaltRepo, runtimeServer.url),
      runRuntimeInspect(
        installedToolsRoot,
        existingSaltRepo,
        runtimeServer.url,
      ),
    ]);
    await Promise.all([
      runPublicCliWorkflowCoverage(
        existingSaltRepo,
        nonSaltRepo,
        newProjectRepo,
        runtimeServer.url,
      ),
      runMcpWorkflowCoverage(installedToolsRoot, existingSaltRepo),
    ]);

    console.log("");
    console.log("Consumer smoke test passed.");
    console.log(`Installed tools root: ${installedToolsRoot}`);
    console.log(`Existing Salt repo: ${existingSaltRepo}`);
    console.log(`Non-Salt repo: ${nonSaltRepo}`);
    console.log(`New-project repo: ${newProjectRepo}`);
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
    if (runtimeServer?.server) {
      await closeServer(runtimeServer.server);
    }

    if (!options.keepTemp && !process.exitCode) {
      await fs.rm(tempRoot, { recursive: true, force: true });
    }
  }
}

await main();
