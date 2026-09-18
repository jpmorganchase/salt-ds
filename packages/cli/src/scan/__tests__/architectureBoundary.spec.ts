import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const scanRoot = path.resolve(import.meta.dirname, "..");

describe("scanner isolation boundary", () => {
  it("allows worker_threads only in the main pool and named worker entry", () => {
    const pool = fs.readFileSync(
      path.join(scanRoot, "analyzeFiles.ts"),
      "utf8",
    );
    const worker = fs.readFileSync(
      path.join(scanRoot, "scannerWorker.ts"),
      "utf8",
    );
    expect(pool).toContain('new URL("./scannerWorker.js", import.meta.url)');
    expect(pool).toContain('from "node:worker_threads"');
    expect(worker).toContain('from "node:worker_threads"');
    expect(worker).not.toMatch(/\bnew\s+Worker\b/u);
  });

  it("keeps the worker closure free of network, subprocess, MCP, and Storybook", () => {
    const files = ["scannerWorker.ts"];
    const forbidden = [
      "node:http",
      "node:https",
      "node:net",
      "node:tls",
      "node:dns",
      "node:dgram",
      "node:child_process",
      "@modelcontextprotocol",
      "@storybook",
    ];
    for (const file of files) {
      const source = fs.readFileSync(path.join(scanRoot, file), "utf8");
      for (const marker of forbidden) expect(source).not.toContain(marker);
    }
  });

  it("does not pass repository project policy into static review", () => {
    const worker = fs.readFileSync(
      path.join(scanRoot, "scannerWorker.ts"),
      "utf8",
    );
    expect(worker).not.toMatch(/\bpolicy\b/iu);
    expect(worker).not.toMatch(
      /\n\s*null,\s*\n\s*null,\s*\n\s*"caller_package_versions"/u,
    );
  });
});
