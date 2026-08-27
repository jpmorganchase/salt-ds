import crypto from "node:crypto";

export function compareOrdinalStrings(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

export function sha256Bytes(value: string | Uint8Array): string {
  return `sha256:${crypto.createHash("sha256").update(value).digest("hex")}`;
}

function sortJsonValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortJsonValue);
  }

  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, entry]) => entry !== undefined)
        .sort(([left], [right]) => compareOrdinalStrings(left, right))
        .map(([key, entry]) => [key, sortJsonValue(entry)]),
    );
  }

  return value;
}

export function canonicalJson(value: unknown): string {
  return JSON.stringify(sortJsonValue(value));
}

export function canonicalJsonFile(value: unknown): string {
  return `${canonicalJson(value)}\n`;
}

export function shortStableId(namespace: string, value: unknown): string {
  const digest = sha256Bytes(`${namespace}\0${canonicalJson(value)}`).slice(
    "sha256:".length,
    "sha256:".length + 24,
  );
  return `${namespace}.${digest}`;
}

export function stableShaId(namespace: string, value: unknown): string {
  return `${namespace}.${sha256Bytes(
    `${namespace}\0${canonicalJson(value)}`,
  ).slice("sha256:".length)}`;
}

export function compareCatalogIds(
  left: { id: string },
  right: { id: string },
): number {
  return compareOrdinalStrings(left.id, right.id);
}
