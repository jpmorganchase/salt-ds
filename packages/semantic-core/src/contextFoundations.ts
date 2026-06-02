import {
  SALT_EVIDENCE_REF_CONTRACT,
  SALT_GENERATED_ARTIFACT_CONTRACT,
  type SaltEvidenceClaimKind,
  type SaltEvidenceRef,
  type SaltEvidenceSourceRef,
  type SaltGeneratedArtifact,
  type SaltGeneratedArtifactGenerator,
  type SaltGeneratedClaim,
  type SaltUnsupportedClaim,
} from "./evidence.js";
import {
  type GeneratedSaltArtifactSurfaceGate,
  type SerializedGeneratedSaltArtifactSurfaceGate,
  serializeGeneratedSaltArtifactSurfaceGate,
  validateGeneratedSaltArtifactSurface,
} from "./generatedArtifactSurface.js";
import { createSaltRegistryFingerprint } from "./registry/fingerprint.js";
import type { SaltRegistry, TokenRecord } from "./types.js";

export const SALT_CONTEXT_FOUNDATION_CONTRACT =
  "salt_context_foundation_v1" as const;

export interface BuildFoundationContextArtifactInput {
  registry: Pick<SaltRegistry, "version" | "generated_at">;
  category: string;
  tokens: TokenRecord[];
  generated_at: string;
  generator: SaltGeneratedArtifactGenerator;
  registry_hash?: string | null;
}

export type BuildFoundationContextArtifactSurfaceGateInput = Omit<
  BuildFoundationContextArtifactInput,
  "registry"
> & {
  registry: SaltRegistry;
};

export type FoundationContextArtifactSurfaceGate =
  GeneratedSaltArtifactSurfaceGate;

export type BuildFoundationContextInput =
  BuildFoundationContextArtifactSurfaceGateInput;

export type SaltContextFoundationSurfaceGate =
  SerializedGeneratedSaltArtifactSurfaceGate;

export interface SaltContextFoundationEvidenceText {
  value: string;
  evidence_ref_ids: string[];
}

export interface SaltContextFoundationEvidenceBoolean {
  value: boolean;
  evidence_ref_ids: string[];
}

export interface SaltContextFoundationTokenDoc {
  href: string;
  evidence_ref_ids: string[];
}

export interface SaltContextFoundationTokenPairing {
  family: string;
  role: string;
  level: string | null;
  evidence_ref_ids: string[];
}

export interface SaltContextFoundationTokenPolicy {
  usage_tier: SaltContextFoundationEvidenceText | null;
  direct_component_use: SaltContextFoundationEvidenceText | null;
  preferred_for: SaltContextFoundationEvidenceText[];
  avoid_for: SaltContextFoundationEvidenceText[];
  notes: SaltContextFoundationEvidenceText[];
  docs: SaltContextFoundationTokenDoc[];
  structural_roles: SaltContextFoundationEvidenceText[];
  pairing: SaltContextFoundationTokenPairing | null;
}

export interface SaltContextFoundationToken {
  name: SaltContextFoundationEvidenceText;
  category: SaltContextFoundationEvidenceText;
  type: SaltContextFoundationEvidenceText;
  value: SaltContextFoundationEvidenceText;
  semantic_intent: SaltContextFoundationEvidenceText | null;
  deprecated: SaltContextFoundationEvidenceBoolean;
  guidance: SaltContextFoundationEvidenceText[];
  policy: SaltContextFoundationTokenPolicy | null;
}

export interface SaltContextFoundationRecord {
  id: string;
  kind: "tokens";
  category: SaltContextFoundationEvidenceText;
  tokens: SaltContextFoundationToken[];
}

export interface SaltContextFoundation {
  contract: typeof SALT_CONTEXT_FOUNDATION_CONTRACT;
  generated_at: string;
  generator: SaltGeneratedArtifactGenerator;
  registry: SaltGeneratedArtifact["registry"];
  status: SaltContextFoundationSurfaceGate["status"];
  foundation: SaltContextFoundationRecord;
  evidence_refs: SaltEvidenceRef[];
  unsupported_claims: SaltUnsupportedClaim[];
  surface_gate: SaltContextFoundationSurfaceGate;
  generated_artifact: SaltGeneratedArtifact;
}

function hasText(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function tokenId(token: TokenRecord): string {
  return (
    token.name
      .replace(/^--/u, "")
      .replace(/[^a-zA-Z0-9._-]+/gu, "-")
      .replace(/^-|-$/gu, "") || "token"
  );
}

function fieldId(fieldPath: string): string {
  return (
    fieldPath.replace(/[^a-zA-Z0-9._-]+/gu, "-").replace(/^-|-$/gu, "") ||
    "field"
  );
}

function toTokenSourceRef(token: TokenRecord): SaltEvidenceSourceRef | null {
  const sourceRef = token.policy?.evidence_refs?.find(
    (ref) => hasText(ref.source?.url) || hasText(ref.source?.repo_path),
  )?.source;

  if (sourceRef) {
    return sourceRef;
  }

  const doc = token.policy?.docs.find(hasText);

  return doc ? { url: doc } : null;
}

function toTokenDocSourceRef(doc: string): SaltEvidenceSourceRef {
  return { url: doc };
}

function buildTokenEvidenceRef(
  input: BuildFoundationContextArtifactInput,
  token: TokenRecord,
  claimKind: SaltEvidenceClaimKind,
  fieldPath: string,
  sourceRef: SaltEvidenceSourceRef | null = toTokenSourceRef(token),
): SaltEvidenceRef {
  const id = `${tokenId(token)}.${fieldId(fieldPath)}.ref`;

  return {
    contract: SALT_EVIDENCE_REF_CONTRACT,
    id,
    source_kind: "registry",
    claim_kind: claimKind,
    registry: {
      entity_type: "token",
      entity_id: token.name,
      entity_name: token.name,
      field_path: fieldPath,
      registry_version: input.registry.version,
      registry_hash: input.registry_hash ?? null,
    },
    source: sourceRef,
    confidence: "high",
    verified_at: token.last_verified_at,
  };
}

function pushClaim(
  claims: SaltGeneratedClaim[],
  evidenceRefs: SaltEvidenceRef[],
  claim: Omit<SaltGeneratedClaim, "evidence_ref_ids">,
  evidenceRef: SaltEvidenceRef,
): void {
  evidenceRefs.push(evidenceRef);
  claims.push({
    ...claim,
    evidence_ref_ids: [evidenceRef.id],
  });
}

function pushUnsupported(
  unsupportedClaims: SaltUnsupportedClaim[],
  token: TokenRecord | null,
  fieldPath: string,
  kind: SaltEvidenceClaimKind,
  reason: string,
): void {
  const idPrefix = token ? tokenId(token) : "foundation";
  const textPrefix = token?.name ?? "foundation token context";

  unsupportedClaims.push({
    id: `${idPrefix}.${fieldId(fieldPath)}.unsupported`,
    kind,
    text: `${textPrefix} ${fieldPath}`,
    field_path: fieldPath,
    reason,
  });
}

function pushTokenTextClaim(input: {
  artifactInput: BuildFoundationContextArtifactInput;
  token: TokenRecord;
  claims: SaltGeneratedClaim[];
  evidenceRefs: SaltEvidenceRef[];
  unsupportedClaims: SaltUnsupportedClaim[];
  fieldPath: string;
  kind?: SaltEvidenceClaimKind;
  value: string | null | undefined;
  missingReason?: string;
  sourceRef?: SaltEvidenceSourceRef | null;
}): void {
  if (!hasText(input.value)) {
    if (input.missingReason) {
      pushUnsupported(
        input.unsupportedClaims,
        input.token,
        input.fieldPath,
        input.kind ?? "token",
        input.missingReason,
      );
    }
    return;
  }

  pushClaim(
    input.claims,
    input.evidenceRefs,
    {
      id: `${tokenId(input.token)}.${fieldId(input.fieldPath)}`,
      kind: input.kind ?? "token",
      text: input.value,
      field_path: input.fieldPath,
    },
    buildTokenEvidenceRef(
      input.artifactInput,
      input.token,
      input.kind ?? "token",
      input.fieldPath,
      input.sourceRef,
    ),
  );
}

function pushTokenTextArrayClaims(input: {
  artifactInput: BuildFoundationContextArtifactInput;
  token: TokenRecord;
  claims: SaltGeneratedClaim[];
  evidenceRefs: SaltEvidenceRef[];
  unsupportedClaims: SaltUnsupportedClaim[];
  fieldPath: string;
  values: string[];
  missingReason?: string;
}): void {
  if (input.values.length === 0) {
    if (input.missingReason) {
      pushUnsupported(
        input.unsupportedClaims,
        input.token,
        input.fieldPath,
        "token",
        input.missingReason,
      );
    }
    return;
  }

  input.values.forEach((value, index) => {
    pushTokenTextClaim({
      artifactInput: input.artifactInput,
      token: input.token,
      claims: input.claims,
      evidenceRefs: input.evidenceRefs,
      unsupportedClaims: input.unsupportedClaims,
      fieldPath: `${input.fieldPath}.${index}`,
      value,
      missingReason: `Registry token ${input.fieldPath} entry is empty.`,
    });
  });
}

function findClaimByFieldPath(
  artifact: SaltGeneratedArtifact,
  token: TokenRecord,
  fieldPath: string,
): SaltGeneratedClaim | null {
  const ref = artifact.evidence_refs.find(
    (candidate) =>
      candidate.registry?.entity_type === "token" &&
      candidate.registry.entity_id === token.name &&
      candidate.registry.field_path === fieldPath,
  );

  return ref
    ? (artifact.claims.find((claim) =>
        claim.evidence_ref_ids.includes(ref.id),
      ) ?? null)
    : null;
}

function requireClaimByFieldPath(
  artifact: SaltGeneratedArtifact,
  token: TokenRecord,
  fieldPath: string,
): SaltGeneratedClaim {
  const claim = findClaimByFieldPath(artifact, token, fieldPath);

  if (!claim) {
    throw new Error(
      `Foundation context token field '${token.name}.${fieldPath}' does not resolve to a generated evidence claim.`,
    );
  }

  return claim;
}

function toEvidenceText(
  artifact: SaltGeneratedArtifact,
  token: TokenRecord,
  fieldPath: string,
  value: string,
): SaltContextFoundationEvidenceText {
  return {
    value,
    evidence_ref_ids: requireClaimByFieldPath(artifact, token, fieldPath)
      .evidence_ref_ids,
  };
}

function toOptionalEvidenceText(
  artifact: SaltGeneratedArtifact,
  token: TokenRecord,
  fieldPath: string,
  value: string | null | undefined,
): SaltContextFoundationEvidenceText | null {
  const claim = findClaimByFieldPath(artifact, token, fieldPath);

  return claim && hasText(value)
    ? {
        value,
        evidence_ref_ids: claim.evidence_ref_ids,
      }
    : null;
}

function toEvidenceBoolean(
  artifact: SaltGeneratedArtifact,
  token: TokenRecord,
  fieldPath: string,
  value: boolean,
): SaltContextFoundationEvidenceBoolean {
  return {
    value,
    evidence_ref_ids: requireClaimByFieldPath(artifact, token, fieldPath)
      .evidence_ref_ids,
  };
}

function toEvidenceTextArray(
  artifact: SaltGeneratedArtifact,
  token: TokenRecord,
  fieldPath: string,
  values: string[],
): SaltContextFoundationEvidenceText[] {
  return values.flatMap((value, index) => {
    const claim = findClaimByFieldPath(
      artifact,
      token,
      `${fieldPath}.${index}`,
    );

    return claim
      ? [
          {
            value,
            evidence_ref_ids: claim.evidence_ref_ids,
          },
        ]
      : [];
  });
}

function toTokenDocs(
  artifact: SaltGeneratedArtifact,
  token: TokenRecord,
): SaltContextFoundationTokenDoc[] {
  return (token.policy?.docs ?? []).flatMap((doc, index) => {
    const claim = findClaimByFieldPath(artifact, token, `policy.docs.${index}`);

    return claim
      ? [
          {
            href: doc,
            evidence_ref_ids: claim.evidence_ref_ids,
          },
        ]
      : [];
  });
}

function toTokenPairing(
  artifact: SaltGeneratedArtifact,
  token: TokenRecord,
): SaltContextFoundationTokenPairing | null {
  const claim = findClaimByFieldPath(artifact, token, "policy.pairing");
  const pairing = token.policy?.pairing;

  return claim && pairing
    ? {
        family: pairing.family,
        role: pairing.role,
        level: pairing.level ?? null,
        evidence_ref_ids: claim.evidence_ref_ids,
      }
    : null;
}

function toContextToken(
  artifact: SaltGeneratedArtifact,
  token: TokenRecord,
): SaltContextFoundationToken {
  return {
    name: toEvidenceText(artifact, token, "name", token.name),
    category: toEvidenceText(artifact, token, "category", token.category),
    type: toEvidenceText(artifact, token, "type", token.type),
    value: toEvidenceText(artifact, token, "value", token.value),
    semantic_intent: toOptionalEvidenceText(
      artifact,
      token,
      "semantic_intent",
      token.semantic_intent,
    ),
    deprecated: toEvidenceBoolean(
      artifact,
      token,
      "deprecated",
      token.deprecated,
    ),
    guidance: toEvidenceTextArray(artifact, token, "guidance", token.guidance),
    policy: token.policy
      ? {
          usage_tier: toOptionalEvidenceText(
            artifact,
            token,
            "policy.usage_tier",
            token.policy.usage_tier,
          ),
          direct_component_use: toOptionalEvidenceText(
            artifact,
            token,
            "policy.direct_component_use",
            token.policy.direct_component_use,
          ),
          preferred_for: toEvidenceTextArray(
            artifact,
            token,
            "policy.preferred_for",
            token.policy.preferred_for,
          ),
          avoid_for: toEvidenceTextArray(
            artifact,
            token,
            "policy.avoid_for",
            token.policy.avoid_for,
          ),
          notes: toEvidenceTextArray(
            artifact,
            token,
            "policy.notes",
            token.policy.notes,
          ),
          docs: toTokenDocs(artifact, token),
          structural_roles: toEvidenceTextArray(
            artifact,
            token,
            "policy.structural_roles",
            token.policy.structural_roles ?? [],
          ),
          pairing: toTokenPairing(artifact, token),
        }
      : null,
  };
}

export function buildFoundationContextArtifact(
  input: BuildFoundationContextArtifactInput,
): SaltGeneratedArtifact {
  const claims: SaltGeneratedClaim[] = [];
  const evidenceRefs: SaltEvidenceRef[] = [];
  const unsupportedClaims: SaltUnsupportedClaim[] = [];

  if (input.tokens.length === 0) {
    pushUnsupported(
      unsupportedClaims,
      null,
      "tokens",
      "token",
      "Foundation token context has no selected registry tokens.",
    );
  }

  for (const token of input.tokens) {
    pushTokenTextClaim({
      artifactInput: input,
      token,
      claims,
      evidenceRefs,
      unsupportedClaims,
      fieldPath: "name",
      value: token.name,
      missingReason: "Registry token name is empty.",
    });
    pushTokenTextClaim({
      artifactInput: input,
      token,
      claims,
      evidenceRefs,
      unsupportedClaims,
      fieldPath: "category",
      value: token.category,
      missingReason: "Registry token category is empty.",
    });
    pushTokenTextClaim({
      artifactInput: input,
      token,
      claims,
      evidenceRefs,
      unsupportedClaims,
      fieldPath: "type",
      value: token.type,
      missingReason: "Registry token type is empty.",
    });
    pushTokenTextClaim({
      artifactInput: input,
      token,
      claims,
      evidenceRefs,
      unsupportedClaims,
      fieldPath: "value",
      value: token.value,
      missingReason: "Registry token value is empty.",
    });
    pushTokenTextClaim({
      artifactInput: input,
      token,
      claims,
      evidenceRefs,
      unsupportedClaims,
      fieldPath: "semantic_intent",
      value: token.semantic_intent,
    });

    pushClaim(
      claims,
      evidenceRefs,
      {
        id: `${tokenId(token)}.deprecated`,
        kind: "token",
        text: `${token.name} deprecated: ${String(token.deprecated)}`,
        field_path: "deprecated",
      },
      buildTokenEvidenceRef(input, token, "token", "deprecated"),
    );

    pushTokenTextArrayClaims({
      artifactInput: input,
      token,
      claims,
      evidenceRefs,
      unsupportedClaims,
      fieldPath: "guidance",
      values: token.guidance,
    });

    if (!token.policy) {
      pushUnsupported(
        unsupportedClaims,
        token,
        "policy",
        "token",
        "Registry token policy is missing.",
      );
      continue;
    }

    pushTokenTextClaim({
      artifactInput: input,
      token,
      claims,
      evidenceRefs,
      unsupportedClaims,
      fieldPath: "policy.usage_tier",
      value: token.policy.usage_tier,
      missingReason: "Registry token policy usage_tier is empty.",
    });
    pushTokenTextClaim({
      artifactInput: input,
      token,
      claims,
      evidenceRefs,
      unsupportedClaims,
      fieldPath: "policy.direct_component_use",
      value: token.policy.direct_component_use,
      missingReason: "Registry token policy direct_component_use is empty.",
    });
    pushTokenTextArrayClaims({
      artifactInput: input,
      token,
      claims,
      evidenceRefs,
      unsupportedClaims,
      fieldPath: "policy.preferred_for",
      values: token.policy.preferred_for,
    });
    pushTokenTextArrayClaims({
      artifactInput: input,
      token,
      claims,
      evidenceRefs,
      unsupportedClaims,
      fieldPath: "policy.avoid_for",
      values: token.policy.avoid_for,
    });
    pushTokenTextArrayClaims({
      artifactInput: input,
      token,
      claims,
      evidenceRefs,
      unsupportedClaims,
      fieldPath: "policy.notes",
      values: token.policy.notes,
    });

    if (token.policy.docs.length === 0) {
      pushUnsupported(
        unsupportedClaims,
        token,
        "policy.docs",
        "token",
        "Registry token policy docs are empty.",
      );
    } else {
      token.policy.docs.forEach((doc, index) => {
        pushTokenTextClaim({
          artifactInput: input,
          token,
          claims,
          evidenceRefs,
          unsupportedClaims,
          fieldPath: `policy.docs.${index}`,
          value: doc,
          missingReason: "Registry token policy doc entry is empty.",
          sourceRef: toTokenDocSourceRef(doc),
        });
      });
    }

    pushTokenTextArrayClaims({
      artifactInput: input,
      token,
      claims,
      evidenceRefs,
      unsupportedClaims,
      fieldPath: "policy.structural_roles",
      values: token.policy.structural_roles ?? [],
    });

    if (token.policy.pairing) {
      pushTokenTextClaim({
        artifactInput: input,
        token,
        claims,
        evidenceRefs,
        unsupportedClaims,
        fieldPath: "policy.pairing",
        value: token.policy.pairing.role,
        missingReason: "Registry token policy pairing role is empty.",
      });
    }
  }

  return {
    contract: SALT_GENERATED_ARTIFACT_CONTRACT,
    artifact_kind: "foundation-context",
    id: `foundation-context.tokens.${input.category}`,
    generated_at: input.generated_at,
    generator: input.generator,
    registry: {
      version: input.registry.version,
      hash: input.registry_hash ?? null,
      generated_at: input.registry.generated_at,
    },
    claims,
    evidence_refs: evidenceRefs,
    unsupported_claims: unsupportedClaims,
  };
}

export function buildFoundationContextArtifactSurfaceGate(
  input: BuildFoundationContextArtifactSurfaceGateInput,
): FoundationContextArtifactSurfaceGate {
  const registryHash =
    input.registry_hash ?? createSaltRegistryFingerprint(input.registry);

  return validateGeneratedSaltArtifactSurface({
    artifact: buildFoundationContextArtifact({
      ...input,
      registry_hash: registryHash,
    }),
    registry: input.registry,
    artifact_label: "foundation context",
  });
}

export function buildFoundationContext(
  input: BuildFoundationContextInput,
): SaltContextFoundation {
  const surfaceGate = buildFoundationContextArtifactSurfaceGate(input);
  const artifact = surfaceGate.artifact;
  const serializedSurfaceGate =
    serializeGeneratedSaltArtifactSurfaceGate(surfaceGate);
  const categoryEvidenceRefIds = [
    ...new Set(
      input.tokens.flatMap(
        (token) =>
          findClaimByFieldPath(artifact, token, "category")?.evidence_ref_ids ??
          [],
      ),
    ),
  ];

  return {
    contract: SALT_CONTEXT_FOUNDATION_CONTRACT,
    generated_at: input.generated_at,
    generator: input.generator,
    registry: artifact.registry,
    status: serializedSurfaceGate.status,
    foundation: {
      id: `tokens.${input.category}`,
      kind: "tokens",
      category: {
        value: input.category,
        evidence_ref_ids: categoryEvidenceRefIds,
      },
      tokens: input.tokens.map((token) => toContextToken(artifact, token)),
    },
    evidence_refs: artifact.evidence_refs,
    unsupported_claims: artifact.unsupported_claims ?? [],
    surface_gate: serializedSurfaceGate,
    generated_artifact: artifact,
  };
}
