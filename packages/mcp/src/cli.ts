import path from "node:path";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createSaltMcpServer } from "./server/createServer.js";
import { getSaltMcpPackageManifest } from "./server/serverMetadata.js";

interface ParsedArgs {
  command: "help" | "serve" | "version";
  flags: Record<string, string>;
}

const VALUE_FLAGS = new Set(["registry-dir", "site-base-url"]);

const HELP_TEXT = `Usage: salt-mcp [serve] [options]

Commands:
  serve                   Start the Salt MCP server on stdio (default)
  help                    Show this help message
  version                 Show the package version

Options:
  --registry-dir <path>   Read the Salt registry from a custom directory
  --site-base-url <url>   Use a custom Salt docs base URL
  -h, --help              Show this help message
  --version               Show the package version`;

function waitForStdioShutdown(transport: StdioServerTransport): Promise<void> {
  return new Promise((resolve) => {
    const finish = () => {
      process.stdin.off("end", handleStdinClose);
      process.stdin.off("close", handleStdinClose);
      if (transport.onclose === finish) {
        transport.onclose = undefined;
      }
      resolve();
    };

    const handleStdinClose = () => {
      if (typeof transport.close === "function") {
        void transport.close();
        return;
      }
      finish();
    };

    transport.onclose = finish;
    process.stdin.once("end", handleStdinClose);
    process.stdin.once("close", handleStdinClose);
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
  const siteBaseUrl = flags["site-base-url"]?.trim() || undefined;
  const server = await createSaltMcpServer({ registryDir, siteBaseUrl });
  const transport = new StdioServerTransport();
  const shutdownPromise = waitForStdioShutdown(transport);
  await server.connect(transport);

  console.error("salt-mcp server running on stdio");
  await shutdownPromise;
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
