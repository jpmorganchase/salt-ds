import process from "node:process";
import { runInstalledMcpModuleProbe } from "./fixture.mjs";

const [rootDir, projectRoot, registryDir] = process.argv.slice(2);
if (!rootDir || !projectRoot) {
  throw new Error(
    "Usage: installed-mcp-module-probe.mjs <installed-tools-root> <project-root> [comparison-registry-root]",
  );
}

const receipt = await runInstalledMcpModuleProbe(
  rootDir,
  projectRoot,
  registryDir,
);
process.stdout.write(
  `SALT_CONSUMER_MODULE_PROBE_RECEIPT=${JSON.stringify(receipt)}\n`,
);
