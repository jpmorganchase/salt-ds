import { createHash } from "node:crypto";

export type Sha256Digest = `sha256:${string}`;
export type Sha256PathSegment = `sha256-${string}`;

const DIGEST_PATTERN = /^sha256:[0-9a-f]{64}$/u;
const SEGMENT_PATTERN = /^sha256-[0-9a-f]{64}$/u;

export function parseSha256Digest(value: unknown): Sha256Digest {
  if (typeof value !== "string" || !DIGEST_PATTERN.test(value)) {
    throw new Error(
      "SHA-256 digest must use canonical lowercase sha256:<64-hex> form.",
    );
  }
  return value as Sha256Digest;
}

export function parseSha256PathSegment(value: unknown): Sha256PathSegment {
  if (typeof value !== "string" || !SEGMENT_PATTERN.test(value)) {
    throw new Error(
      "SHA-256 path segment must use canonical lowercase sha256-<64-hex> form.",
    );
  }
  return value as Sha256PathSegment;
}

export function digestToPathSegment(digest: Sha256Digest): Sha256PathSegment {
  return parseSha256PathSegment(`sha256-${parseSha256Digest(digest).slice(7)}`);
}

export function pathSegmentToDigest(
  segment: Sha256PathSegment,
): Sha256Digest {
  return parseSha256Digest(
    `sha256:${parseSha256PathSegment(segment).slice(7)}`,
  );
}

export function sha256Digest(bytes: Uint8Array | string): Sha256Digest {
  return parseSha256Digest(
    `sha256:${createHash("sha256").update(bytes).digest("hex")}`,
  );
}
