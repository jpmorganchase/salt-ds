import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  createSaltMcpServerMock,
  serverCloseMock,
  serverConnectMock,
  serverInstance,
  transportCloseMock,
  transportInstance,
  transportMock,
} = vi.hoisted(() => {
  const transportClose = vi.fn(async () => {});
  const serverClose = vi.fn(async () => {});
  const serverConnect = vi.fn(
    async (_transport: { close: () => Promise<void> }) => {},
  );
  return {
    createSaltMcpServerMock: vi.fn(),
    serverCloseMock: serverClose,
    serverConnectMock: serverConnect,
    serverInstance: { close: serverClose, connect: serverConnect },
    transportCloseMock: transportClose,
    transportInstance: { kind: "stdio", close: transportClose },
    transportMock: vi.fn(),
  };
});

vi.mock("../server/createServer.js", () => ({
  createSaltMcpServer: createSaltMcpServerMock,
}));

vi.mock("@modelcontextprotocol/server/stdio", () => ({
  StdioServerTransport: transportMock,
}));

import { runCli } from "../cli.js";

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
    createSaltMcpServerMock.mockReset();
    serverCloseMock.mockClear();
    serverConnectMock.mockReset();
    transportCloseMock.mockClear();
    transportMock.mockReset();

    createSaltMcpServerMock.mockResolvedValue(serverInstance);
    transportMock.mockImplementation(function MockTransport() {
      transportInstance.close = transportCloseMock;
      return transportInstance;
    });
    serverConnectMock.mockImplementation(async (transport) => {
      queueMicrotask(() => void transport.close());
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
    expect(serverConnectMock).not.toHaveBeenCalled();
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
    expect(serverConnectMock).not.toHaveBeenCalled();
  });

  it("rejects arguments combined with help", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});

    await expect(runCli(["--help", "extra"])).rejects.toThrow(
      "Unexpected argument after --help: extra.",
    );

    expect(log).not.toHaveBeenCalled();
    expect(serverConnectMock).not.toHaveBeenCalled();
  });

  it("rejects arguments combined with version", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});

    await expect(runCli(["version", "extra"])).rejects.toThrow(
      "Unexpected argument after version: extra.",
    );

    expect(log).not.toHaveBeenCalled();
    expect(serverConnectMock).not.toHaveBeenCalled();
  });

  it("defaults to serve and exits when the owned transport closes", async () => {
    await runCli([]);

    expect(transportMock).toHaveBeenCalledTimes(1);
    expect(serverConnectMock).toHaveBeenCalledWith(transportInstance);
    expect(createSaltMcpServerMock).toHaveBeenCalledWith({
      projectAccess: { mode: "unrestricted_local_stdio" },
      registryDir: undefined,
    });
    expect(transportCloseMock).toHaveBeenCalledTimes(1);
    expect(serverCloseMock).toHaveBeenCalledTimes(1);
  });

  it("treats a leading registry flag as a serve argument", async () => {
    await runCli(["--registry-dir", "packages/mcp/generated"]);

    expect(createSaltMcpServerMock).toHaveBeenCalledWith({
      projectAccess: { mode: "unrestricted_local_stdio" },
      registryDir: path.resolve("packages/mcp/generated"),
    });
  });

  it("accepts the explicit serve command with the retained option", async () => {
    await runCli(["serve", "--registry-dir", "./generated"]);

    expect(createSaltMcpServerMock).toHaveBeenCalledWith({
      projectAccess: { mode: "unrestricted_local_stdio" },
      registryDir: path.resolve("./generated"),
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
    ["--site-base-url"],
  ])("rejects unknown option %s", async (flag) => {
    await expect(runCli([flag])).rejects.toThrow(`Unknown option: ${flag}.`);
  });

  it.each([
    ["--registry-dir"],
    ["--registry-dir", "--verbose"],
  ])("rejects a missing value in %j", async (...argv) => {
    await expect(runCli(argv)).rejects.toThrow(/requires a value/u);
  });

  it.each([
    ["serve", "extra"],
    ["--registry-dir", "./generated", "extra"],
    ["serve", "--registry-dir", "./generated", "extra"],
  ])("rejects unexpected positional arguments in %j", async (...argv) => {
    await expect(runCli(argv)).rejects.toThrow("Unexpected argument: extra.");
  });

  it("rejects duplicate options", async () => {
    await expect(
      runCli([
        "--registry-dir",
        "./generated",
        "--registry-dir",
        "./other-generated",
      ]),
    ).rejects.toThrow("Duplicate option: --registry-dir.");
  });
});
