#!/usr/bin/env node

const { runCli } = require("../dist-cjs/index.js");

runCli(process.argv.slice(2)).catch((error) => {
  console.error("salt-mcp error:", error);
  process.exit(1);
});
