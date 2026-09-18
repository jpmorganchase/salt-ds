import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  createSaltMcpServerMock,
  getAutomaticStdinEvent,
  getLastTransport,
  serveStdioMock,
  serverCloseMock,
  serverInstance,
  setAutomaticStdinEvent,
  setTransportStartError,
  StdioServerTransportFake,
  stdioHandleCloseMock,
} = vi.hoisted(() => {
  const serverClose = vi.fn(async () => {});
  let automaticStdinEvent: "close" | "end" | undefined = "end";
  let lastTransport:
    | {
        close(): Promise<void>;
        onclose?: () => void;
        onerror?: (error: Error) => void;
        start(): Promise<void>;
      }
    | undefined;
  let transportStartError: Error | undefined;

  class StdioServerTransportFake {
    private closed = false;

    onclose?: () => void;
    onerror?: (error: Error) => void;

    constructor() {
      lastTransport = this;
    }

    async start(): Promise<void> {
      if (transportStartError) {
        throw transportStartError;
      }
    }

    async close(): Promise<void> {
      if (this.closed) {
        return;
      }
      this.closed = true;
      this.onclose?.();
    }
  }

  return {
    createSaltMcpServerMock: vi.fn(),
    getAutomaticStdinEvent: () => automaticStdinEvent,
    getLastTransport: () => lastTransport,
    getTransportStartError: () => transportStartError,
    serveStdioMock: vi.fn(),
    serverCloseMock: serverClose,
    serverInstance: { close: serverClose },
    setAutomaticStdinEvent: (event: "close" | "end" | undefined): void => {
      automaticStdinEvent = event;
    },
    setTransportStartError: (error: Error | undefined): void => {
      transportStartError = error;
    },
    StdioServerTransportFake,
    stdioHandleCloseMock: vi.fn(async () => {}),
  };
});

vi.mock("../server/createServer.js", () => ({
  createSaltMcpServer: createSaltMcpServerMock,
}));

vi.mock("@modelcontextprotocol/server/stdio", () => ({
  serveStdio: serveStdioMock,
  StdioServerTransport: StdioServerTransportFake,
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
    setAutomaticStdinEvent("end");
    setTransportStartError(undefined);

    createSaltMcpServerMock.mockResolvedValue(serverInstance);
    serveStdioMock.mockImplementation((factory, options) => {
      const transport = options.transport as {
        close(): Promise<void>;
        start(): Promise<void>;
      };
      const started = transport.start();
      void started.then(() => factory({ era: "modern" })).catch(() => {});
      const stdinEvent = getAutomaticStdinEvent();
      if (stdinEvent) {
        queueMicrotask(() => process.stdin.emit(stdinEvent));
      }
      stdioHandleCloseMock.mockImplementation(async () => {
        await started.catch(() => {});
        await transport.close();
      });
      return { close: stdioHandleCloseMock };
    });
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([["help"], ["--help"], ["-h"], ["serve", "--help"]])(
    "prints help for %j without starting the stdio server",
    async (...argv) => {
      const log = vi.spyOn(console, "log").mockImplementation(() => {});

      await runCli(argv);

      expect(log).toHaveBeenCalledWith(
        expect.stringContaining("Usage: salt-mcp"),
      );
      expect(createSaltMcpServerMock).not.toHaveBeenCalled();
      expect(serveStdioMock).not.toHaveBeenCalled();
    },
  );

  it.each([["version"], ["--version"], ["serve", "--version"]])(
    "prints version for %j without starting the stdio server",
    async (...argv) => {
      const log = vi.spyOn(console, "log").mockImplementation(() => {});

      await runCli(argv);

      expect(log).toHaveBeenCalledWith(packageVersion);
      expect(createSaltMcpServerMock).not.toHaveBeenCalled();
      expect(serveStdioMock).not.toHaveBeenCalled();
    },
  );

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
      transport: expect.any(StdioServerTransportFake),
    });
    expect(createSaltMcpServerMock).toHaveBeenCalledWith({
      projectAccess: { mode: "unrestricted_local_stdio" },
      registryDir: undefined,
    });
    expect(stdioHandleCloseMock).toHaveBeenCalledTimes(1);
    expect(serverCloseMock).not.toHaveBeenCalled();
  });

  it("treats stdin close as a successful shutdown", async () => {
    setAutomaticStdinEvent("close");

    await runCli([]);

    expect(stdioHandleCloseMock).toHaveBeenCalledTimes(1);
  });

  it("rejects promptly when the transport closes before stdin", async () => {
    setAutomaticStdinEvent(undefined);
    const endListeners = process.stdin.listenerCount("end");
    const closeListeners = process.stdin.listenerCount("close");
    const running = runCli([]);

    await getLastTransport()?.close();

    await expect(running).rejects.toEqual(
      new Error("salt-mcp stdio transport closed unexpectedly."),
    );
    expect(stdioHandleCloseMock).toHaveBeenCalledTimes(1);
    expect(process.stdin.listenerCount("end")).toBe(endListeners);
    expect(process.stdin.listenerCount("close")).toBe(closeListeners);
  });

  it("preserves a transport startup error", async () => {
    const startupError = new Error("stdio startup failed");
    setAutomaticStdinEvent(undefined);
    setTransportStartError(startupError);
    const endListeners = process.stdin.listenerCount("end");
    const closeListeners = process.stdin.listenerCount("close");

    await expect(runCli([])).rejects.toBe(startupError);

    expect(stdioHandleCloseMock).toHaveBeenCalledTimes(1);
    expect(process.stdin.listenerCount("end")).toBe(endListeners);
    expect(process.stdin.listenerCount("close")).toBe(closeListeners);
  });

  it("logs recoverable transport errors and waits for stdin", async () => {
    setAutomaticStdinEvent(undefined);
    const running = runCli([]);
    let settled = false;
    void running.finally(() => {
      settled = true;
    });
    const options = serveStdioMock.mock.calls[0][1];

    options.onerror(new Error("recoverable parse error"));
    await Promise.resolve();

    expect(console.error).toHaveBeenCalledWith(
      "salt-mcp stdio error: recoverable parse error",
    );
    expect(settled).toBe(false);

    process.stdin.emit("end");
    await running;
    expect(stdioHandleCloseMock).toHaveBeenCalledTimes(1);
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

  it.each([["--verbose"], ["-v"], ["--site-base-url"]])(
    "rejects unknown option %s",
    async (flag) => {
      await expect(runCli([flag])).rejects.toThrow(`Unknown option: ${flag}.`);
    },
  );

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
