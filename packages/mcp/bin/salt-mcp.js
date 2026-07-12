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
    console.error("salt-mcp error:", error);
    process.exit(1);
  });
