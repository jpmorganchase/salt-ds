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

  it("prints help without starting the stdio server", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});

    await runCli(["--help"]);

    expect(log).toHaveBeenCalledWith(
      expect.stringContaining("Usage: salt-mcp"),
    );
    expect(createSaltMcpServerMock).not.toHaveBeenCalled();
    expect(transportMock).not.toHaveBeenCalled();
  });

  it("prints version without starting the stdio server", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});

    await runCli(["--version"]);

    expect(log).toHaveBeenCalledWith(packageVersion);
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
      "packages/salt-mcp/generated",
      "--site-base-url",
      "https://www.saltdesignsystem.com",
    ]);

    expect(createSaltMcpServerMock).toHaveBeenCalledWith({
      registryDir: path.resolve("packages/salt-mcp/generated"),
      siteBaseUrl: "https://www.saltdesignsystem.com",
    });
  });

  it("rejects build-registry as a public CLI command", async () => {
    await expect(runCli(["build-registry"])).rejects.toThrow(
      "Unknown command: build-registry. Supported command: serve.",
    );
  });
});
