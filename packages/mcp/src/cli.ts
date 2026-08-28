import { StdioServerTransport, serveStdio } from "@modelcontextprotocol/server/stdio";
import { createSaltMcpServer } from "./index.js";
import { getSaltMcpPackageManifest } from "./server/serverMetadata.js";

const HELP_TEXT = `Usage: salt-mcp [serve] [options]

Commands:
  serve                   Start the Salt MCP server on stdio (default)
  help                    Show this help message
  version                 Show the package version

Options:
  --root <path>           Authorize one project root (repeatable)
  -h, --help              Show this help message
  --version               Show the package version`;

export class SaltMcpCliUsageError extends Error {
  readonly code = "SALT_MCP_CLI_USAGE";
}

export type ParsedSaltMcpArgs =
  | { command: "help" | "version"; projectRoots: [] }
  | { command: "serve"; projectRoots: string[] };

export function parseSaltMcpArgs(argv: readonly string[]): ParsedSaltMcpArgs {
  if (argv.length === 0) return { command: "serve", projectRoots: [] };
  const first = argv[0];
  if (first === "help" || first === "--help" || first === "-h") {
    if (argv.length !== 1) {
      throw new SaltMcpCliUsageError(`Unexpected argument after ${first}: ${argv[1]}.`);
    }
    return { command: "help", projectRoots: [] };
  }
  if (first === "version" || first === "--version") {
    if (argv.length !== 1) {
      throw new SaltMcpCliUsageError(`Unexpected argument after ${first}: ${argv[1]}.`);
    }
    return { command: "version", projectRoots: [] };
  }

  const tokens = first === "serve" ? argv.slice(1) : argv;
  if (!first.startsWith("-") && first !== "serve") {
    throw new SaltMcpCliUsageError(
      `Unknown command: ${first}. Supported commands: serve, help, version.`,
    );
  }
  if (tokens.length === 1 && (tokens[0] === "--help" || tokens[0] === "-h")) {
    return { command: "help", projectRoots: [] };
  }
  if (tokens.length === 1 && tokens[0] === "--version") {
    return { command: "version", projectRoots: [] };
  }

  const projectRoots: string[] = [];
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token !== "--root") {
      throw new SaltMcpCliUsageError(`Unknown option: ${token}.`);
    }
    const value = tokens[index + 1];
    if (!value || value.startsWith("-") || value.trim().length === 0) {
      throw new SaltMcpCliUsageError("Option --root requires a value.");
    }
    projectRoots.push(value);
    index += 1;
  }
  return { command: "serve", projectRoots };
}

class ObservableStdioServerTransport extends StdioServerTransport {
  readonly closed: Promise<void>;
  private resolveClosed!: () => void;

  constructor() {
    super();
    this.closed = new Promise((resolve) => {
      this.resolveClosed = resolve;
    });
  }

  override async close(): Promise<void> {
    try {
      await super.close();
    } finally {
      this.resolveClosed();
    }
  }
}

async function serve(projectRoots: string[]): Promise<void> {
  const transport = new ObservableStdioServerTransport();
  const handle = serveStdio(() => createSaltMcpServer({ projectRoots }), {
    legacy: "reject",
    transport,
    onerror: (error) => console.error(`salt-mcp stdio error: ${error.message}`),
  });
  console.error("salt-mcp server running on stdio (MCP 2026-07-28)");
  await transport.closed;
  await handle.close();
}

/** Internal binary entrypoint. The package root intentionally does not export it. */
export async function runSaltMcpCli(
  argv: readonly string[] = process.argv.slice(2),
): Promise<void> {
  const parsed = parseSaltMcpArgs(argv);
  if (parsed.command === "help") {
    console.log(HELP_TEXT);
    return;
  }
  if (parsed.command === "version") {
    console.log(getSaltMcpPackageManifest().version);
    return;
  }
  await serve(parsed.projectRoots);
}
