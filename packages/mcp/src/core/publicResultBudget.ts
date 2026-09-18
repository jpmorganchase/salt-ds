export const MAX_PUBLIC_TOOL_RESULT_UTF8_BYTES = 64 * 1024;

// Non-search domain payloads are bounded before protocol adaptation. The MCP
// adapter supplies the exact final-envelope measurement where it is required.
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
