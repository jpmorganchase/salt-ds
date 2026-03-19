import path from "node:path";
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

describe("runCli", () => {
  beforeEach(() => {
    connectMock.mockReset();
    createSaltMcpServerMock.mockReset();
    transportMock.mockReset();

    connectMock.mockResolvedValue(undefined);
    createSaltMcpServerMock.mockResolvedValue({ connect: connectMock });
    transportMock.mockImplementation(function MockTransport() {
      return transportInstance;
    });

    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
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
