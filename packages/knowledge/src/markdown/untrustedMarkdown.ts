export const MAX_UNTRUSTED_MARKDOWN_EVIDENCE_UTF8_BYTES = 64 * 1024;

/** Escape an authored text node while keeping Markdown structure compiler-owned. */
export function escapeUntrustedMarkdownText(value: string): string {
  return value
    .replace(/\r\n?/gu, "\n")
    .replace(
      // biome-ignore lint/suspicious/noControlCharactersInRegex: Escape control and directional formatting characters in untrusted prose.
      /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/gu,
      (character) =>
        `\\u${character.codePointAt(0)!.toString(16).padStart(4, "0")}`,
    )
    .replace(/&/gu, "&amp;")
    .replace(/</gu, "&lt;")
    .replace(/>/gu, "&gt;")
    .replace(/[\\`*_{}[\]()#+.!|~-]/gu, "\\$&");
}

/** A whole code block is evidence. Its fence cannot be closed by source bytes. */
export function renderUntrustedMarkdownCode(
  value: string,
  language = "",
): string {
  // biome-ignore lint/suspicious/noControlCharactersInRegex: A Markdown fence does not stop terminal controls; reject rather than alter a complete file.
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/u.test(value)) {
    throw new Error("Code evidence contains unsupported control characters.");
  }
  const longestRun = Math.max(
    0,
    ...Array.from(value.matchAll(/`+/gu), (match) => match[0].length),
  );
  const fence = "`".repeat(Math.max(3, longestRun + 1));
  const safeLanguage = /^[a-zA-Z0-9_+-]{0,32}$/u.test(language) ? language : "";
  return `${fence}${safeLanguage}\n${value}\n${fence}`;
}

/** Resolve documentation links without executing expressions or loading a URL. */
export function resolveUntrustedMarkdownLink(
  value: string,
  route: string,
): string | null {
  if (
    // biome-ignore lint/suspicious/noControlCharactersInRegex: Reject URL control characters before normalization can erase them.
    /[\u0000-\u0020\u007f<>\\]/u.test(value) ||
    /^(?:javascript|data|file):/iu.test(value)
  )
    return null;
  try {
    const base = new URL(route, "https://www.saltdesignsystem.com");
    const target = new URL(value, base);
    if (target.protocol !== "https:" || target.username || target.password)
      return null;
    return target.href.replace(/\(/gu, "%28").replace(/\)/gu, "%29");
  } catch {
    return null;
  }
}

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
