import { Buffer } from "node:buffer";

export const MAX_PUBLIC_RESOURCE_UTF8_BYTES = 64 * 1024;

export function publicResourceUtf8Bytes(serializedText: string): number {
  return Buffer.byteLength(serializedText, "utf8");
}

export function assertPublicResourceText(
  subject: string,
  serializedText: string,
): string {
  const bytes = publicResourceUtf8Bytes(serializedText);
  if (bytes > MAX_PUBLIC_RESOURCE_UTF8_BYTES) {
    throw new Error(
      `Public resource '${subject}' is ${bytes} UTF-8 bytes; the limit is ${MAX_PUBLIC_RESOURCE_UTF8_BYTES} bytes.`,
    );
  }
  return serializedText;
}

export function serializePublicResourceJson(
  subject: string,
  value: unknown,
): string {
  return assertPublicResourceText(subject, JSON.stringify(value));
}
