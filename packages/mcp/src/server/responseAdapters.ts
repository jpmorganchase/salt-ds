import type { CallToolResult } from "@modelcontextprotocol/server";
import {
  digestToPathSegment,
  type KnowledgeManifestV1,
  type KnowledgeRecordFamily,
} from "@salt-ds/knowledge";
import {
  MAX_TOOL_RESULT_UTF8_BYTES,
  MAX_TOOL_STRUCTURED_UTF8_BYTES,
  MAX_TOOL_TEXT_UTF8_BYTES,
} from "./toolDefinitions.js";

export function knowledgeBaseUri(manifest: KnowledgeManifestV1): string {
  return `salt-knowledge://v1/${digestToPathSegment(manifest.bundle_digest)}`;
}

export function knowledgeRecordUri(
  manifest: KnowledgeManifestV1,
  family: KnowledgeRecordFamily,
  id: string,
): string {
  return `${knowledgeBaseUri(manifest)}/records/${family}/${encodeURIComponent(id)}`;
}

export function evidenceLocatorResourceUri(
  manifest: KnowledgeManifestV1,
  locator: string,
): string | null {
  const match = /^knowledge-record:([^:]+):(.+)$/u.exec(locator);
  if (!match?.[1] || !match[2]) return null;
  try {
    return knowledgeRecordUri(
      manifest,
      match[1] as KnowledgeRecordFamily,
      decodeURIComponent(match[2]),
    );
  } catch {
    return null;
  }
}

function truncateUtf8(value: string, maxBytes: number): string {
  if (Buffer.byteLength(value, "utf8") <= maxBytes) return value;
  const suffix = "\n… output text truncated; structuredContent is authoritative.";
  const budget = maxBytes - Buffer.byteLength(suffix, "utf8");
  let text = "";
  for (const character of value) {
    if (Buffer.byteLength(text + character, "utf8") > budget) break;
    text += character;
  }
  return text + suffix;
}

export function structuredUtf8Bytes(value: unknown): number {
  return Buffer.byteLength(JSON.stringify(value), "utf8");
}

export function assertStructuredBudget(value: unknown): void {
  const bytes = structuredUtf8Bytes(value);
  if (bytes > MAX_TOOL_STRUCTURED_UTF8_BYTES) {
    throw new Error(
      `Salt MCP structured result is ${bytes} UTF-8 bytes; the limit is ${MAX_TOOL_STRUCTURED_UTF8_BYTES}.`,
    );
  }
}

export function createToolResult(
  structuredContent: Record<string, unknown>,
  text: string,
): CallToolResult {
  assertStructuredBudget(structuredContent);
  const result: CallToolResult = {
    content: [
      {
        type: "text",
        text: truncateUtf8(text, MAX_TOOL_TEXT_UTF8_BYTES),
      },
    ],
    structuredContent,
  };
  const bytes = structuredUtf8Bytes(result);
  if (bytes > MAX_TOOL_RESULT_UTF8_BYTES) {
    throw new Error(
      `Salt MCP tool result is ${bytes} UTF-8 bytes; the limit is ${MAX_TOOL_RESULT_UTF8_BYTES}.`,
    );
  }
  return result;
}
