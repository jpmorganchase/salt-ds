export const MAX_UNTRUSTED_MARKDOWN_EVIDENCE_UTF8_BYTES = 64 * 1024;

export interface UntrustedMarkdownEvidenceOptions {
  mode: "inline" | "block";
  max_utf8_bytes?: number;
}

function utf8Prefix(value: string, maximumBytes: number): string {
  const bytes = Buffer.from(value, "utf8");
  if (bytes.byteLength <= maximumBytes) return value;
  let boundary = maximumBytes;
  while (boundary > 0 && (bytes[boundary] & 0xc0) === 0x80) boundary -= 1;
  return bytes.subarray(0, boundary).toString("utf8");
}

function escapedEvidence(value: unknown): string {
  const serialized =
    typeof value === "string"
      ? JSON.stringify(value).slice(1, -1)
      : (JSON.stringify(value, null, 2) ?? String(value));
  return serialized.replace(
    /[`\u007f-\u009f\u2028\u2029]/gu,
    (character) =>
      `\\u${character.codePointAt(0)!.toString(16).padStart(4, "0")}`,
  );
}

/**
 * Renders repository-derived values as bounded, inert Markdown evidence.
 * Escapes are deliberately visible and reversible; evidence is never silently
 * removed or interpreted as Markdown structure.
 */
export function renderUntrustedMarkdownEvidence(
  value: unknown,
  options: UntrustedMarkdownEvidenceOptions,
): string {
  const maximumBytes =
    options.max_utf8_bytes ?? MAX_UNTRUSTED_MARKDOWN_EVIDENCE_UTF8_BYTES;
  if (
    !Number.isSafeInteger(maximumBytes) ||
    maximumBytes < 16 ||
    maximumBytes > MAX_UNTRUSTED_MARKDOWN_EVIDENCE_UTF8_BYTES
  ) {
    throw new RangeError(
      `Untrusted Markdown evidence must be bounded between 16 and ${MAX_UNTRUSTED_MARKDOWN_EVIDENCE_UTF8_BYTES} UTF-8 bytes.`,
    );
  }
  const payload = escapedEvidence(value);
  const originalBytes = Buffer.byteLength(payload, "utf8");
  const [opening, closing] =
    options.mode === "inline" ? ["`", "`"] : ["```text\n", "\n```"];
  const complete = `${opening}${payload}${closing}`;
  if (Buffer.byteLength(complete, "utf8") <= maximumBytes) return complete;

  const notice = `\\n[truncated; original encoded UTF-8 bytes: ${originalBytes}]`;
  const payloadBudget =
    maximumBytes -
    Buffer.byteLength(opening, "utf8") -
    Buffer.byteLength(closing, "utf8") -
    Buffer.byteLength(notice, "utf8");
  if (payloadBudget < 0) {
    throw new RangeError("Untrusted Markdown evidence bound is too small.");
  }
  return `${opening}${utf8Prefix(payload, payloadBudget)}${notice}${closing}`;
}
