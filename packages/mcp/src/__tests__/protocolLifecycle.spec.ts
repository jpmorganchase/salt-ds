import path from "node:path";
import { Client, InMemoryTransport } from "@modelcontextprotocol/client";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { loadKnowledgeRuntimeContext } from "@salt-ds/knowledge";
import { describe, expect, it } from "vitest";
import { createSaltMcpServerWithContext } from "../server/createServer.js";
import { connectCurrentSpecClient } from "./mcpTestClient.js";

describe("protocol lifecycle", () => {
  it("rejects a 2025-era opening and closes cleanly", async () => {
    const knowledge = await loadKnowledgeRuntimeContext({
      bundleDir: path.resolve("packages/knowledge/generated"),
    });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const handle = serveStdio(
      () => createSaltMcpServerWithContext({}, knowledge),
      { legacy: "reject", transport: serverTransport },
    );
    const legacy = new Client(
      { name: "legacy-host", version: "1.0.0" },
      { versionNegotiation: { mode: "legacy" } },
    );
    await expect(legacy.connect(clientTransport)).rejects.toThrow(
      /unsupported.*protocol|2026-07-28/iu,
    );
    await legacy.close();
    await handle.close();
  });

  it("honors client cancellation and permits deterministic shutdown", async () => {
    const connected = await connectCurrentSpecClient();
    await connected.client.listTools();
    const controller = new AbortController();
    controller.abort();
    await expect(
      connected.client.callTool(
        { name: "search_salt", arguments: { query: "Button" } },
        { signal: controller.signal },
      ),
    ).rejects.toThrow(/abort/iu);
    await connected.close();
  });
});
