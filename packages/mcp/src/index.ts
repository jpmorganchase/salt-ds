/// <reference types="node" preserve="true" />

import type { McpServer } from "@modelcontextprotocol/server";
import { loadKnowledgeRuntimeContext } from "@salt-ds/knowledge";
import * as z from "zod/v4";
import { MAX_PROJECT_ROOTS } from "./server/projectAccess.js";
import { createSaltMcpServerWithContext } from "./server/createServer.js";

const createSaltMcpServerOptionsSchema = z
  .object({
    projectRoots: z.array(z.string().min(1)).max(MAX_PROJECT_ROOTS).optional(),
  })
  .strict();

/** Startup-only filesystem authority for the local read-only MCP adapter. */
export type CreateSaltMcpServerOptions = z.infer<
  typeof createSaltMcpServerOptionsSchema
>;

/** Create one offline, read-only Salt MCP 2026-07-28 server instance. */
export const createSaltMcpServer: (
  options?: CreateSaltMcpServerOptions,
) => Promise<McpServer> = async (options = {}) =>
  createSaltMcpServerWithContext(
    createSaltMcpServerOptionsSchema.parse(options),
    await loadKnowledgeRuntimeContext(),
  );
