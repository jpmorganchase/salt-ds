import path from "node:path";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import { createSaltMcpServer } from "./server/createServer.js";
import { getSaltMcpPackageManifest } from "./server/serverMetadata.js";

interface ParsedArgs {
  command: "help" | "serve" | "version";
  flags: Record<string, string>;
}

const VALUE_FLAGS = new Set(["registry-dir"]);

const HELP_TEXT = `Usage: salt-mcp [serve] [options]

Commands:
  serve                   Start the Salt MCP server on stdio (default)
  help                    Show this help message
  version                 Show the package version

Options:
  --registry-dir <path>   Read the Salt registry from a custom directory
  -h, --help              Show this help message
  --version               Show the package version`;

function createObservedStdioTransport(): {
  transport: StdioServerTransport;
  closed: Promise<void>;
} {
  const transport = new StdioServerTransport();
  let signalClosed!: () => void;
  const closed = new Promise<void>((resolve) => {
    signalClosed = resolve;
  });
  const close = transport.close.bind(transport);
  transport.close = async () => {
    try {
      await close();
    } finally {
      signalClosed();
    }
  };
  return { transport, closed };
}

function waitForStdioShutdown(transportClosed: Promise<void>): Promise<void> {
  return new Promise((resolve) => {
    const finish = () => {
      process.stdin.off("end", handleStdinClose);
      process.stdin.off("close", handleStdinClose);
      resolve();
    };

    const handleStdinClose = () => finish();

    process.stdin.once("end", handleStdinClose);
    process.stdin.once("close", handleStdinClose);
    void transportClosed.then(finish, finish);
    process.stdin.resume();
  });
}

function parseArgs(argv: string[]): ParsedArgs {
  if (argv.length === 0) {
    return { command: "serve", flags: {} };
  }

  const first = argv[0];
  let valueTokens = argv;

  if (first === "help" || first === "--help" || first === "-h") {
    if (argv.length > 1) {
      throw new Error(`Unexpected argument after ${first}: ${argv[1]}.`);
    }
    return { command: "help", flags: {} };
  }

  if (first === "version" || first === "--version") {
    if (argv.length > 1) {
      throw new Error(`Unexpected argument after ${first}: ${argv[1]}.`);
    }
    return { command: "version", flags: {} };
  }

  if (first === "serve") {
    valueTokens = argv.slice(1);
  } else if (!first.startsWith("-")) {
    throw new Error(
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
      throw new Error(`Unexpected argument: ${token}.`);
    }

    if (!token.startsWith("--")) {
      throw new Error(`Unknown option: ${token}.`);
    }

    const key = token.slice(2);
    if (!VALUE_FLAGS.has(key)) {
      throw new Error(`Unknown option: ${token}.`);
    }

    if (Object.hasOwn(flags, key)) {
      throw new Error(`Duplicate option: ${token}.`);
    }

    const next = valueTokens[index + 1];
    if (!next || next.startsWith("-") || next.trim().length === 0) {
      throw new Error(`Option ${token} requires a value.`);
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
  const { transport, closed } = createObservedStdioTransport();
  const server = await createSaltMcpServer({
    registryDir,
    projectAccess: { mode: "unrestricted_local_stdio" },
  });
  await server.connect(transport);

  console.error("salt-mcp server running on stdio");
  await waitForStdioShutdown(closed);
  await server.close();
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
