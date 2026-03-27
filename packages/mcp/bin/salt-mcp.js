#!/usr/bin/env node

const path = require("node:path");

function loadCliModule() {
  const candidatePaths = [
    path.resolve(__dirname, "../dist-cjs/mcp/src/index.js"),
    path.resolve(
      __dirname,
      "../../../dist/salt-ds-mcp/dist-cjs/mcp/src/index.js",
    ),
  ];

  for (const candidatePath of candidatePaths) {
    try {
      return require(candidatePath);
    } catch (error) {
      if (error && error.code === "MODULE_NOT_FOUND") {
        continue;
      }
      throw error;
    }
  }

  throw new Error(
    "Could not locate the built Salt MCP entrypoint. Run `yarn workspace @salt-ds/mcp build` first.",
  );
}

const { runCli } = loadCliModule();

runCli(process.argv.slice(2))
  .then((exitCode) => {
    process.exit(exitCode);
  })
  .catch((error) => {
    console.error("salt-mcp error:", error);
    process.exit(1);
  });
