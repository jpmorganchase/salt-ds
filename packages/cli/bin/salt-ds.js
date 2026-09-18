#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

function loadBuiltCliModule() {
  const entryPath = path.resolve(
    __dirname,
    "../../../dist/salt-ds-cli/dist-cjs/index.js",
  );
  if (!fs.existsSync(entryPath)) {
    throw new Error(
      "Could not locate the built Salt CLI entrypoint. Run `yarn workspace @salt-ds/cli build` first.",
    );
  }
  return require(entryPath);
}

const { runCli } = loadBuiltCliModule();

runCli(process.argv.slice(2))
  .then((exitCode) => {
    process.exit(exitCode);
  })
  .catch((error) => {
    const concise = [
      "SALT_CLI_USAGE",
      "SALT_PROJECT_ROOT_NOT_DIRECTORY",
      "SALT_PROJECT_ROOT_UNAVAILABLE",
    ].includes(error?.code);
    const rendered =
      concise && error instanceof Error
        ? error.message
        : (error?.stack ?? String(error));
    console.error("salt-ds error:", rendered);
    process.exit(Number.isSafeInteger(error?.exitCode) ? error.exitCode : 1);
  });
