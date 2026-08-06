#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

function loadBuiltMcpModule() {
  const entryPath = path.resolve(
    __dirname,
    "../../../dist/salt-ds-mcp/dist-cjs/index.js",
  );

  if (!fs.existsSync(entryPath)) {
    throw new Error(
      "Could not locate the built Salt MCP entrypoint. Run `yarn workspace @salt-ds/mcp build` first.",
    );
  }

  return require(entryPath);
}

const { runCli } = loadBuiltMcpModule();

runCli(process.argv.slice(2))
  .then((exitCode) => {
    process.exit(exitCode);
  })
  .catch((error) => {
    const concise = ["SALT_MCP_CLI_USAGE"].includes(error?.code);
    const rendered =
      concise && error instanceof Error
        ? error.message
        : (error?.stack ?? String(error));
    console.error("salt-mcp error:", rendered);
    process.exit(1);
  });
