import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  connectMock,
  createSaltMcpServerMock,
  transportInstance,
  transportMock,
} = vi.hoisted(() => ({
  connectMock: vi.fn(),
  createSaltMcpServerMock: vi.fn(),
  transportInstance: { kind: "stdio" },
  transportMock: vi.fn(),
}));

vi.mock("../server/createServer.js", () => ({
  createSaltMcpServer: createSaltMcpServerMock,
}));

vi.mock("@modelcontextprotocol/sdk/server/stdio.js", () => ({
  StdioServerTransport: transportMock,
}));

import { runCli } from "../cli.js";

// Resolve packages/mcp/package.json relative to this spec so the test works
// regardless of whether vitest is invoked from the repo root or from
// packages/mcp directly. The previous path.resolve("packages/mcp/package.json")
// only worked when cwd was the repo root.
const packageVersion = JSON.parse(
  fs.readFileSync(
    path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      "../../package.json",
    ),
    "utf8",
  ),
).version as string;

describe("runCli", () => {
  beforeEach(() => {
    connectMock.mockReset();
    createSaltMcpServerMock.mockReset();
    transportMock.mockReset();

    connectMock.mockImplementation(async (transport) => {
      transport.onclose?.();
    });
    createSaltMcpServerMock.mockResolvedValue({ connect: connectMock });
    transportMock.mockImplementation(function MockTransport() {
      return transportInstance;
    });

    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    ["help"],
    ["--help"],
    ["-h"],
    ["serve", "--help"],
  ])("prints help for %j without starting the stdio server", async (...argv) => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});

    await runCli(argv);

    expect(log).toHaveBeenCalledWith(
      expect.stringContaining("Usage: salt-mcp"),
    );
    expect(createSaltMcpServerMock).not.toHaveBeenCalled();
    expect(transportMock).not.toHaveBeenCalled();
  });

  it.each([
    ["version"],
    ["--version"],
    ["serve", "--version"],
  ])("prints version for %j without starting the stdio server", async (...argv) => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});

    await runCli(argv);

    expect(log).toHaveBeenCalledWith(packageVersion);
    expect(createSaltMcpServerMock).not.toHaveBeenCalled();
    expect(transportMock).not.toHaveBeenCalled();
  });

  it("rejects arguments combined with help", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});

    await expect(runCli(["--help", "extra"])).rejects.toThrow(
      "Unexpected argument after --help: extra.",
    );

    expect(log).not.toHaveBeenCalled();
    expect(createSaltMcpServerMock).not.toHaveBeenCalled();
    expect(transportMock).not.toHaveBeenCalled();
  });

  it("rejects arguments combined with version", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});

    await expect(runCli(["version", "extra"])).rejects.toThrow(
      "Unexpected argument after version: extra.",
    );

    expect(log).not.toHaveBeenCalled();
    expect(createSaltMcpServerMock).not.toHaveBeenCalled();
    expect(transportMock).not.toHaveBeenCalled();
  });

  it("defaults to serve when no command is provided", async () => {
    await runCli([]);

    expect(createSaltMcpServerMock).toHaveBeenCalledWith({
      registryDir: undefined,
      siteBaseUrl: undefined,
    });
    expect(transportMock).toHaveBeenCalledTimes(1);
    expect(connectMock).toHaveBeenCalledWith(transportInstance);
  });

  it("treats leading flags as serve arguments", async () => {
    await runCli([
      "--registry-dir",
      "packages/mcp/generated",
      "--site-base-url",
      "https://www.saltdesignsystem.com",
    ]);

    expect(createSaltMcpServerMock).toHaveBeenCalledWith({
      registryDir: path.resolve("packages/mcp/generated"),
      siteBaseUrl: "https://www.saltdesignsystem.com",
    });
  });

  it("accepts the explicit serve command with supported options", async () => {
    await runCli([
      "serve",
      "--site-base-url",
      " https://www.saltdesignsystem.com ",
      "--registry-dir",
      "./generated",
    ]);

    expect(createSaltMcpServerMock).toHaveBeenCalledWith({
      registryDir: path.resolve("./generated"),
      siteBaseUrl: "https://www.saltdesignsystem.com",
    });
  });

  it("rejects build-registry as a public CLI command", async () => {
    await expect(runCli(["build-registry"])).rejects.toThrow(
      "Unknown command: build-registry. Supported commands: serve, help, version.",
    );
  });

  it.each([
    ["--verbose"],
    ["-v"],
  ])("rejects unknown option %s", async (flag) => {
    await expect(runCli([flag])).rejects.toThrow(`Unknown option: ${flag}.`);
  });

  it.each([
    ["--registry-dir"],
    ["--site-base-url"],
    ["--registry-dir", "--site-base-url", "https://example.com"],
    ["--site-base-url", "   "],
  ])("rejects a missing value in %j", async (...argv) => {
    await expect(runCli(argv)).rejects.toThrow(/requires a value/);
  });

  it.each([
    ["serve", "extra"],
    ["--registry-dir", "./generated", "extra"],
    ["serve", "--registry-dir", "./generated", "extra"],
  ])("rejects unexpected positional arguments in %j", async (...argv) => {
    await expect(runCli(argv)).rejects.toThrow("Unexpected argument: extra.");
  });

  it.each([
    ["--registry-dir", "./generated", "--registry-dir", "./other-generated"],
    [
      "serve",
      "--site-base-url",
      "https://example.com",
      "--site-base-url",
      "https://other.example.com",
    ],
  ])("rejects duplicate options in %j", async (...argv) => {
    await expect(runCli(argv)).rejects.toThrow(/Duplicate option:/);
  });
});
