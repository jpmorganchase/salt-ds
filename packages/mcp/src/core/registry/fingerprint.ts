import { createHash } from "node:crypto";
import type { SaltGeneratedArtifactRegistry } from "../evidence.js";
import type { SaltRegistry } from "../types.js";
import {
  REGISTRY_ARRAY_ARTIFACTS,
  REGISTRY_TOKEN_POLICY_STRUCTURAL_ROLE_RULE_PACK_ARTIFACT,
} from "./artifacts.js";

const VOLATILE_SEMANTIC_KEYS = new Set([
  "generated_at",
  "last_modified_at",
  "last_verified_at",
  "newest_file_modified_at",
  "verified_at",
]);

function normalizeForStableJson(
  value: unknown,
  omittedKeys: ReadonlySet<string> = new Set(),
): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) =>
      entry === undefined ? null : normalizeForStableJson(entry, omittedKeys),
    );
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;

    return Object.fromEntries(
      Object.keys(record)
        .filter((key) => !omittedKeys.has(key))
        .sort()
        .flatMap((key) =>
          record[key] === undefined
            ? []
            : [[key, normalizeForStableJson(record[key], omittedKeys)]],
        ),
    );
  }

  return value;
}

export function stableRegistryJson(value: unknown): string {
  return JSON.stringify(normalizeForStableJson(value));
}

export function createSaltRegistryFingerprint(registry: SaltRegistry): string {
  const publishedCollections = Object.fromEntries(
    REGISTRY_ARRAY_ARTIFACTS.map(({ key }) => [key, registry[key]]),
  );
  const tokenPolicyKey =
    REGISTRY_TOKEN_POLICY_STRUCTURAL_ROLE_RULE_PACK_ARTIFACT.key;
  const payload = {
    ...publishedCollections,
    [tokenPolicyKey]: registry[tokenPolicyKey] ?? null,
  };
  const digest = createHash("sha256")
    .update(
      JSON.stringify(normalizeForStableJson(payload, VOLATILE_SEMANTIC_KEYS)),
    )
    .digest("hex");

  return `sha256:${digest}`;
}

export function getSaltRegistryFingerprint(registry: SaltRegistry): string {
  return typeof registry.semantic_hash === "string" &&
    /^sha256:[0-9a-f]{64}$/u.test(registry.semantic_hash)
    ? registry.semantic_hash
    : createSaltRegistryFingerprint(registry);
}

export function toSaltGeneratedArtifactRegistry(
  registry: SaltRegistry,
): SaltGeneratedArtifactRegistry {
  return {
    version: registry.version,
    hash: getSaltRegistryFingerprint(registry),
    generated_at: registry.generated_at,
  };
}
