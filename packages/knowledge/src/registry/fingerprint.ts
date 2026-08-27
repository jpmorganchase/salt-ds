import { createHash } from "node:crypto";
import type { SaltGeneratedArtifactRegistry } from "../evidence.js";
import type { SaltRegistry } from "../types.js";

const VOLATILE_SEMANTIC_KEYS = new Set([
  "generated_at",
  "last_modified_at",
  "last_verified_at",
  "newest_file_modified_at",
  "verified_at",
]);

const SALT_REGISTRY_SEMANTIC_COLLECTIONS = [
  "packages",
  "components",
  "icons",
  "country_symbols",
  "pages",
  "patterns",
  "guides",
  "tokens",
  "deprecations",
  "token_policy_structural_role_rule_pack",
] as const satisfies readonly (keyof SaltRegistry)[];

const verifiedRegistryFingerprints = new WeakMap<SaltRegistry, string>();
const pendingRegistryFingerprintVerifiers = new WeakMap<
  SaltRegistry,
  {
    fingerprint: string;
    verify: () => void;
  }
>();
const verifyingRegistryFingerprints = new WeakSet<SaltRegistry>();

function assertValidFingerprint(fingerprint: string): void {
  if (!/^sha256:[0-9a-f]{64}$/u.test(fingerprint)) {
    throw new Error(
      `Cannot register invalid Salt registry fingerprint '${fingerprint}'.`,
    );
  }
}

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
  const payload = Object.fromEntries(
    SALT_REGISTRY_SEMANTIC_COLLECTIONS.map((key) => [
      key,
      key === "token_policy_structural_role_rule_pack" &&
      registry.token_policy_structural_role_rule_pack
        ? {
            contract: registry.token_policy_structural_role_rule_pack.contract,
            id: registry.token_policy_structural_role_rule_pack.id,
            generator:
              registry.token_policy_structural_role_rule_pack.generator,
            rules: registry.token_policy_structural_role_rule_pack.rules,
          }
        : (registry[key] ?? null),
    ]),
  );
  const digest = createHash("sha256")
    .update(
      JSON.stringify(normalizeForStableJson(payload, VOLATILE_SEMANTIC_KEYS)),
    )
    .digest("hex");

  return `sha256:${digest}`;
}

export function getSaltRegistryFingerprint(registry: SaltRegistry): string {
  const verified = verifiedRegistryFingerprints.get(registry);
  if (verified) return verified;

  const pending = pendingRegistryFingerprintVerifiers.get(registry);
  if (!pending) return createSaltRegistryFingerprint(registry);
  if (verifyingRegistryFingerprints.has(registry)) {
    throw new Error("Salt registry fingerprint verification re-entered.");
  }

  verifyingRegistryFingerprints.add(registry);
  try {
    pending.verify();
    pendingRegistryFingerprintVerifiers.delete(registry);
    verifiedRegistryFingerprints.set(registry, pending.fingerprint);
    return pending.fingerprint;
  } finally {
    verifyingRegistryFingerprints.delete(registry);
  }
}

export function registerVerifiedSaltRegistryFingerprint(
  registry: SaltRegistry,
  fingerprint: string,
): void {
  assertValidFingerprint(fingerprint);
  if (pendingRegistryFingerprintVerifiers.has(registry)) {
    throw new Error(
      "Cannot bypass pending Salt registry fingerprint verification.",
    );
  }
  const verified = verifiedRegistryFingerprints.get(registry);
  if (verified && verified !== fingerprint) {
    throw new Error(
      `Salt registry fingerprint is already registered as '${verified}'.`,
    );
  }
  verifiedRegistryFingerprints.set(registry, fingerprint);
}

export function registerSaltRegistryFingerprintVerifier(
  registry: SaltRegistry,
  fingerprint: string,
  verify: () => void,
): void {
  assertValidFingerprint(fingerprint);
  if (verifiedRegistryFingerprints.has(registry)) {
    throw new Error(
      "Cannot register a verifier for an already verified Salt registry fingerprint.",
    );
  }
  if (pendingRegistryFingerprintVerifiers.has(registry)) {
    throw new Error(
      "Salt registry fingerprint verifier is already registered.",
    );
  }
  pendingRegistryFingerprintVerifiers.set(registry, {
    fingerprint,
    verify,
  });
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

export function toSaltEvidenceRegistryIdentity(registry: SaltRegistry): {
  registry_version: string;
  registry_hash: string;
} {
  return {
    registry_version: registry.version,
    registry_hash: getSaltRegistryFingerprint(registry),
  };
}
