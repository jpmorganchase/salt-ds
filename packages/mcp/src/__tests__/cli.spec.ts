import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  createSaltMcpServerMock,
  serveStdioMock,
  serverCloseMock,
  serverInstance,
  stdioHandleCloseMock,
} = vi.hoisted(() => {
  const serverClose = vi.fn(async () => {});
  return {
    createSaltMcpServerMock: vi.fn(),
    serveStdioMock: vi.fn(),
    serverCloseMock: serverClose,
    serverInstance: { close: serverClose },
    stdioHandleCloseMock: vi.fn(async () => {}),
  };
});

vi.mock("../server/createServer.js", () => ({
  createSaltMcpServer: createSaltMcpServerMock,
}));

vi.mock("@modelcontextprotocol/server/stdio", () => ({
  serveStdio: serveStdioMock,
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
    serveStdioMock.mockReset();
    stdioHandleCloseMock.mockClear();

    createSaltMcpServerMock.mockResolvedValue(serverInstance);
    serveStdioMock.mockImplementation((factory) => {
      void factory({ era: "modern" });
      queueMicrotask(() => process.stdin.emit("end"));
      return { close: stdioHandleCloseMock };
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
    expect(serveStdioMock).not.toHaveBeenCalled();
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
    expect(serveStdioMock).not.toHaveBeenCalled();
  });

  it("rejects arguments combined with help", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});

    await expect(runCli(["--help", "extra"])).rejects.toThrow(
      "Unexpected argument after --help: extra.",
    );

    expect(log).not.toHaveBeenCalled();
    expect(serveStdioMock).not.toHaveBeenCalled();
  });

  it("rejects arguments combined with version", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});

    await expect(runCli(["version", "extra"])).rejects.toThrow(
      "Unexpected argument after version: extra.",
    );

    expect(log).not.toHaveBeenCalled();
    expect(serveStdioMock).not.toHaveBeenCalled();
  });

  it("defaults to a dual-era stdio factory and closes its serving handle", async () => {
    await runCli([]);

    expect(serveStdioMock).toHaveBeenCalledTimes(1);
    expect(serveStdioMock).toHaveBeenCalledWith(expect.any(Function), {
      legacy: "serve",
      onerror: expect.any(Function),
    });
    expect(createSaltMcpServerMock).toHaveBeenCalledWith({
      projectAccess: { mode: "unrestricted_local_stdio" },
      registryDir: undefined,
    });
    expect(stdioHandleCloseMock).toHaveBeenCalledTimes(1);
    expect(serverCloseMock).not.toHaveBeenCalled();
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

  it("accepts an explicit workspace boundary for child-package inspection", async () => {
    await runCli(["serve", "--workspace-root", "./workspace"]);

    expect(createSaltMcpServerMock).toHaveBeenCalledWith({
      projectAccess: {
        mode: "unrestricted_local_stdio",
        defaultRoot: path.resolve("./workspace"),
      },
      registryDir: undefined,
    });
  });

  it("rejects build-registry as a public CLI command", async () => {
    await expect(runCli(["build-registry"])).rejects.toMatchObject({
      code: "SALT_MCP_CLI_USAGE",
      message:
        "Unknown command: build-registry. Supported commands: serve, help, version.",
    });
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
    ["--workspace-root"],
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
