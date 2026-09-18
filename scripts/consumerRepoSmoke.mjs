import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { runCliWorkflowCoverage } from "./consumer-smoke/checks.mjs";
import {
  createExactCliInfoRepo,
  createNonSaltRepo,
  ensureBuildArtifacts,
  installLocalCliPackages,
  loadExactPackReport,
} from "./consumer-smoke/fixture.mjs";
import { parseArgs } from "./consumer-smoke/shared.mjs";
import { sha256, writeJsonAtomic } from "./saltAiEvidenceUtils.mjs";

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
    await ensureBuildArtifacts(options.skipBuild);
    const packReport = await loadExactPackReport(options.packReport);
    await installLocalCliPackages(
      installedToolsRoot,
      packReport,
    );
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
