import path from "node:path";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createSaltMcpServer } from "./server/createServer.js";

interface ParsedArgs {
  command: string;
  flags: Record<string, string>;
}

function parseArgs(argv: string[]): ParsedArgs {
  if (argv.length === 0) {
    return { command: "serve", flags: {} };
  }

  const [first, ...rest] = argv;
  const command = first.startsWith("--") ? "serve" : first;
  const valueTokens = first.startsWith("--") ? argv : rest;
  const flags: Record<string, string> = {};

  for (let index = 0; index < valueTokens.length; index += 1) {
    const token = valueTokens[index];
    if (!token.startsWith("--")) {
      continue;
    }

    const key = token.slice(2);
    const next = valueTokens[index + 1];
    if (!next || next.startsWith("--")) {
      flags[key] = "true";
      continue;
    }

    flags[key] = next;
    index += 1;
  }

  return { command, flags };
}

async function runServe(flags: Record<string, string>): Promise<void> {
  const registryDir = flags["registry-dir"]
    ? path.resolve(flags["registry-dir"])
    : undefined;
  const siteBaseUrl = flags["site-base-url"]?.trim() || undefined;
  const server = await createSaltMcpServer({ registryDir, siteBaseUrl });
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("salt-mcp server running on stdio");
}

export async function runCli(
  argv: string[] = process.argv.slice(2),
): Promise<void> {
  const { command, flags } = parseArgs(argv);

  if (command === "serve") {
    await runServe(flags);
    return;
  }

  const message = `Unknown command: ${command}. Supported command: serve.`;
  console.error(message);
  throw new Error(message);
}
