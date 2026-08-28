import { Client, InMemoryTransport } from "@modelcontextprotocol/client";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { loadKnowledgeRuntimeContext } from "@salt-ds/knowledge";
import path from "node:path";
import type { CreateSaltMcpServerOptions } from "../index.js";
import { createSaltMcpServerWithContext } from "../server/createServer.js";

export async function connectCurrentSpecClient(
  options: CreateSaltMcpServerOptions = {},
) {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const knowledge = await loadKnowledgeRuntimeContext({
    bundleDir: path.resolve("packages/knowledge/generated"),
  });
  const handle = serveStdio(
    () => createSaltMcpServerWithContext(options, knowledge),
    { legacy: "reject", transport: serverTransport },
  );
  const client = new Client(
    { name: "salt-mcp-test-host", version: "1.0.0" },
    {
      enforceStrictCapabilities: true,
      versionNegotiation: { mode: { pin: "2026-07-28" } },
    },
  );
  await client.connect(clientTransport);
  return {
    client,
    async close() {
      await client.close();
      await handle.close();
    },
  };
}
