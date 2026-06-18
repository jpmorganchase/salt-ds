import { createHash } from "node:crypto";
import type { SaltGeneratedArtifactRegistry } from "../evidence.js";
import type { SaltRegistry } from "../types.js";

function normalizeForStableJson(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) =>
      entry === undefined ? null : normalizeForStableJson(entry),
    );
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;

    return Object.fromEntries(
      Object.keys(record)
        .sort()
        .flatMap((key) =>
          record[key] === undefined
            ? []
            : [[key, normalizeForStableJson(record[key])]],
        ),
    );
  }

  return value;
}

export function stableRegistryJson(value: unknown): string {
  return JSON.stringify(normalizeForStableJson(value));
}

export function createSaltRegistryFingerprint(registry: SaltRegistry): string {
  const payload = {
    build_info: registry.build_info,
    packages: registry.packages,
    components: registry.components,
    pages: registry.pages,
    patterns: registry.patterns,
    guides: registry.guides,
    tokens: registry.tokens,
    deprecations: registry.deprecations,
    examples: registry.examples,
    create_retrieval_index: registry.create_retrieval_index ?? [],
    pattern_validation_rule_pack: registry.pattern_validation_rule_pack ?? null,
    token_policy_structural_role_rule_pack:
      registry.token_policy_structural_role_rule_pack ?? null,
  };
  const digest = createHash("sha256")
    .update(stableRegistryJson(payload))
    .digest("hex");

  return `sha256:${digest}`;
}

export function toSaltGeneratedArtifactRegistry(
  registry: SaltRegistry,
): SaltGeneratedArtifactRegistry {
  return {
    version: registry.version,
    hash: createSaltRegistryFingerprint(registry),
    generated_at: registry.generated_at,
  };
}
