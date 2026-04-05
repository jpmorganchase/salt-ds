#!/usr/bin/env node

const path = require("node:path");

function loadBuiltMcpModule() {
  const entryPath = path.resolve(
    __dirname,
    "../../../dist/salt-ds-mcp/dist-cjs/mcp/src/index.js",
  );

  try {
    return require(entryPath);
  } catch (error) {
    if (error && error.code === "MODULE_NOT_FOUND") {
      throw new Error(
        "Could not locate the built Salt MCP entrypoint. Run `yarn workspace @salt-ds/mcp build` first.",
      );
    }

    throw error;
  }
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
