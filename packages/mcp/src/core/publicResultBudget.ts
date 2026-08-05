export const MAX_PUBLIC_TOOL_RESULT_UTF8_BYTES = 64 * 1024;

// Non-search results are represented once as structured content and once as a
// JSON text fallback. Producers enforce this cap together with the exact MCP
// wrapper size so escape-heavy input cannot exhaust the public wire budget.
export const MAX_NON_SEARCH_STRUCTURED_CONTENT_UTF8_BYTES = 28 * 1024;

export interface ResultBudgetOmission {
  section: string;
  available: number;
  returned: number;
}

export interface ResultBudgetCoverage {
  max_utf8_bytes: number;
  truncated: boolean;
  omissions: ResultBudgetOmission[];
}

export function jsonUtf8Bytes(value: unknown): number {
  return Buffer.byteLength(JSON.stringify(value), "utf8");
}

export function createNonSearchToolResult<T>(payload: T) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(payload),
      },
    ],
    structuredContent: payload,
  };
}

export function nonSearchToolResultUtf8Bytes(payload: unknown): number {
  return jsonUtf8Bytes(createNonSearchToolResult(payload));
}
