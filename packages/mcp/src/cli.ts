import path from "node:path";
import {
  StdioServerTransport,
  serveStdio,
} from "@modelcontextprotocol/server/stdio";
import { createSaltMcpServer } from "./server/createServer.js";
import { getSaltMcpPackageManifest } from "./server/serverMetadata.js";

interface ParsedArgs {
  command: "help" | "serve" | "version";
  flags: Record<string, string>;
}

const VALUE_FLAGS = new Set(["registry-dir", "workspace-root"]);

class CliUsageError extends Error {
  readonly code = "SALT_MCP_CLI_USAGE";
}

const HELP_TEXT = `Usage: salt-mcp [serve] [options]

Commands:
  serve                   Start the Salt MCP server on stdio (default)
  help                    Show this help message
  version                 Show the package version

Options:
  --registry-dir <path>   Read the Salt registry from a custom directory
  --workspace-root <path> Bound ancestor workspace discovery to this directory
  -h, --help              Show this help message
  --version               Show the package version`;

type TransportLifecycle =
  | { kind: "closed" }
  | { error: unknown; kind: "startup_failure" };

class ObservableStdioServerTransport extends StdioServerTransport {
  readonly lifecycle: Promise<TransportLifecycle>;

  private resolveLifecycle!: (result: TransportLifecycle) => void;

  constructor() {
    super();
    this.lifecycle = new Promise((resolve) => {
      this.resolveLifecycle = resolve;
    });
  }

  override async start(): Promise<void> {
    try {
      await super.start();
    } catch (error) {
      this.resolveLifecycle({ error, kind: "startup_failure" });
      throw error;
    }
  }

  override async close(): Promise<void> {
    try {
      await super.close();
    } finally {
      this.resolveLifecycle({ kind: "closed" });
    }
  }
}

function waitForStdioShutdown(): {
  cleanup: () => void;
  promise: Promise<void>;
} {
  let cleanup = () => {};
  const promise = new Promise<void>((resolve) => {
    let settled = false;
    const handleStdinClose = () => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      resolve();
    };

    cleanup = () => {
      process.stdin.off("end", handleStdinClose);
      process.stdin.off("close", handleStdinClose);
    };

    process.stdin.once("end", handleStdinClose);
    process.stdin.once("close", handleStdinClose);
    process.stdin.resume();
  });

  return { cleanup, promise };
}

function parseArgs(argv: string[]): ParsedArgs {
  if (argv.length === 0) {
    return { command: "serve", flags: {} };
  }

  const first = argv[0];
  let valueTokens = argv;

  if (first === "help" || first === "--help" || first === "-h") {
    if (argv.length > 1) {
      throw new CliUsageError(
        `Unexpected argument after ${first}: ${argv[1]}.`,
      );
    }
    return { command: "help", flags: {} };
  }

  if (first === "version" || first === "--version") {
    if (argv.length > 1) {
      throw new CliUsageError(
        `Unexpected argument after ${first}: ${argv[1]}.`,
      );
    }
    return { command: "version", flags: {} };
  }

  if (first === "serve") {
    valueTokens = argv.slice(1);
  } else if (!first.startsWith("-")) {
    throw new CliUsageError(
      `Unknown command: ${first}. Supported commands: serve, help, version.`,
    );
  }

  if (
    valueTokens.length === 1 &&
    (valueTokens[0] === "--help" || valueTokens[0] === "-h")
  ) {
    return { command: "help", flags: {} };
  }

  if (valueTokens.length === 1 && valueTokens[0] === "--version") {
    return { command: "version", flags: {} };
  }

  const flags: Record<string, string> = {};

  for (let index = 0; index < valueTokens.length; index += 1) {
    const token = valueTokens[index];
    if (!token.startsWith("-")) {
      throw new CliUsageError(`Unexpected argument: ${token}.`);
    }

    if (!token.startsWith("--")) {
      throw new CliUsageError(`Unknown option: ${token}.`);
    }

    const key = token.slice(2);
    if (!VALUE_FLAGS.has(key)) {
      throw new CliUsageError(`Unknown option: ${token}.`);
    }

    if (Object.hasOwn(flags, key)) {
      throw new CliUsageError(`Duplicate option: ${token}.`);
    }

    const next = valueTokens[index + 1];
    if (!next || next.startsWith("-") || next.trim().length === 0) {
      throw new CliUsageError(`Option ${token} requires a value.`);
    }

    flags[key] = next;
    index += 1;
  }

  return { command: "serve", flags };
}

async function runServe(flags: Record<string, string>): Promise<void> {
  const registryDir = flags["registry-dir"]
    ? path.resolve(flags["registry-dir"])
    : undefined;
  const workspaceRoot = flags["workspace-root"]
    ? path.resolve(flags["workspace-root"])
    : undefined;
  const transport = new ObservableStdioServerTransport();
  const stdinShutdown = waitForStdioShutdown();
  const handle = serveStdio(
    () =>
      createSaltMcpServer({
        registryDir,
        projectAccess: {
          mode: "unrestricted_local_stdio",
          ...(workspaceRoot ? { defaultRoot: workspaceRoot } : {}),
        },
      }),
    {
      legacy: "serve",
      onerror: (error) =>
        console.error(`salt-mcp stdio error: ${error.message}`),
      transport,
    },
  );

  console.error("salt-mcp server running on stdio (MCP 2026 and legacy)");
  try {
    const result = await Promise.race([
      stdinShutdown.promise.then(() => ({ kind: "stdin" }) as const),
      transport.lifecycle,
    ]);

    if (result.kind === "startup_failure") {
      throw result.error;
    }

    if (result.kind === "closed") {
      throw new Error("salt-mcp stdio transport closed unexpectedly.");
    }
  } finally {
    stdinShutdown.cleanup();
    await handle.close();
  }
}

export async function runCli(
  argv: string[] = process.argv.slice(2),
): Promise<void> {
  const { command, flags } = parseArgs(argv);

  if (command === "help") {
    console.log(HELP_TEXT);
    return;
  }

  if (command === "version") {
    console.log(getSaltMcpPackageManifest().version);
    return;
  }

  await runServe(flags);
}
