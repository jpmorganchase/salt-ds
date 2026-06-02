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
import type { ExampleRecord, PatternRecord, SaltRegistry } from "./types.js";

export const SALT_CONTEXT_PATTERN_CONTRACT = "salt_context_pattern_v1" as const;

export interface BuildPatternContextArtifactInput {
  registry: Pick<SaltRegistry, "version" | "generated_at">;
  pattern: PatternRecord;
  generated_at: string;
  generator: SaltGeneratedArtifactGenerator;
  registry_hash?: string | null;
}

export type BuildPatternContextArtifactSurfaceGateInput = Omit<
  BuildPatternContextArtifactInput,
  "registry"
> & {
  registry: SaltRegistry;
};

export type PatternContextArtifactSurfaceGate =
  GeneratedSaltArtifactSurfaceGate;

export type BuildPatternContextInput =
  BuildPatternContextArtifactSurfaceGateInput;

export type SaltContextPatternSurfaceGate =
  SerializedGeneratedSaltArtifactSurfaceGate;

export interface SaltContextPatternEvidenceText {
  value: string;
  evidence_ref_ids: string[];
}

export interface SaltContextPatternComposition {
  component: string;
  role: string | null;
  evidence_ref_ids: string[];
}

export interface SaltContextPatternResource {
  label: string;
  href: string;
  internal: boolean;
  evidence_ref_ids: string[];
}

export interface SaltContextPatternAccessibilitySignal {
  kind: NonNullable<
    PatternRecord["accessibility"]["implementation_signals"]
  >[number]["kind"];
  values: string[];
  source_kind: NonNullable<
    PatternRecord["accessibility"]["implementation_signals"]
  >[number]["source_kind"];
  source_url: string;
  evidence_ref_ids: string[];
}

export interface SaltContextPatternAccessibility {
  summary: SaltContextPatternEvidenceText[];
  implementation_signals: SaltContextPatternAccessibilitySignal[];
}

export interface SaltContextPatternExample {
  id: string;
  title: string;
  description: string;
  code: string;
  source_url: string;
  evidence_ref_ids: string[];
}

export interface SaltContextPatternRecord {
  id: string;
  name: SaltContextPatternEvidenceText;
  status: SaltContextPatternEvidenceText;
  summary: SaltContextPatternEvidenceText | null;
  when_to_use: SaltContextPatternEvidenceText[];
  when_not_to_use: SaltContextPatternEvidenceText[];
  composed_of: SaltContextPatternComposition[];
  how_to_build: SaltContextPatternEvidenceText[];
  how_it_works: SaltContextPatternEvidenceText[];
  accessibility: SaltContextPatternAccessibility;
  resources: SaltContextPatternResource[];
  examples: SaltContextPatternExample[];
}

export interface SaltContextPattern {
  contract: typeof SALT_CONTEXT_PATTERN_CONTRACT;
  generated_at: string;
  generator: SaltGeneratedArtifactGenerator;
  registry: SaltGeneratedArtifact["registry"];
  status: SaltContextPatternSurfaceGate["status"];
  pattern: SaltContextPatternRecord;
  evidence_refs: SaltEvidenceRef[];
  unsupported_claims: SaltUnsupportedClaim[];
  surface_gate: SaltContextPatternSurfaceGate;
  generated_artifact: SaltGeneratedArtifact;
}

function hasText(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function toPatternSourceRef(
  pattern: PatternRecord,
): SaltEvidenceSourceRef | null {
  const url =
    pattern.related_docs.overview ??
    pattern.resources.find((resource) => hasText(resource.href))?.href ??
    null;

  return url ? { url } : null;
}

function toPatternAccessibilitySourceRef(
  pattern: PatternRecord,
  fieldPath: string,
): SaltEvidenceSourceRef | null {
  const fieldSourceUrl = pattern.accessibility.summary_sources?.find(
    (source) => source.field_path === fieldPath,
  )?.source_url;

  if (fieldSourceUrl) {
    return { url: fieldSourceUrl };
  }

  return toPatternSourceRef(pattern);
}

function toPatternAccessibilitySignalSourceRef(
  signal: NonNullable<
    PatternRecord["accessibility"]["implementation_signals"]
  >[number],
): SaltEvidenceSourceRef | null {
  return signal.source_url ? { url: signal.source_url } : null;
}

function toPatternExampleSourceRef(
  example: ExampleRecord,
): SaltEvidenceSourceRef | null {
  return example.source_url ? { url: example.source_url } : null;
}

function toPatternResourceSourceRef(
  resource: PatternRecord["resources"][number],
): SaltEvidenceSourceRef | null {
  return resource.href ? { url: resource.href } : null;
}

function buildPatternEvidenceRef(
  input: BuildPatternContextArtifactInput,
  id: string,
  claimKind: SaltEvidenceClaimKind,
  fieldPath: string,
  sourceRef: SaltEvidenceSourceRef | null = toPatternSourceRef(input.pattern),
): SaltEvidenceRef {
  return {
    contract: SALT_EVIDENCE_REF_CONTRACT,
    id,
    source_kind: "registry",
    claim_kind: claimKind,
    registry: {
      entity_type: "pattern",
      entity_id: input.pattern.id,
      entity_name: input.pattern.name,
      field_path: fieldPath,
      registry_version: input.registry.version,
      registry_hash: input.registry_hash ?? null,
    },
    source: sourceRef,
    confidence: "high",
    verified_at: input.pattern.last_verified_at,
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
  pattern: PatternRecord,
  fieldPath: string,
  kind: SaltEvidenceClaimKind,
  reason: string,
): void {
  unsupportedClaims.push({
    id: `${pattern.id}.${fieldPath}.unsupported`,
    kind,
    text: `${pattern.name} ${fieldPath}`,
    field_path: fieldPath,
    reason,
  });
}

function pushIndexedTextClaims(input: {
  artifactInput: BuildPatternContextArtifactInput;
  claims: SaltGeneratedClaim[];
  evidenceRefs: SaltEvidenceRef[];
  unsupportedClaims: SaltUnsupportedClaim[];
  fieldPath:
    | "when_to_use"
    | "when_not_to_use"
    | "how_to_build"
    | "how_it_works";
  kind: SaltEvidenceClaimKind;
  missingReason: string;
  values: string[];
  required?: boolean;
}): void {
  if (input.values.length === 0) {
    if (input.required ?? true) {
      pushUnsupported(
        input.unsupportedClaims,
        input.artifactInput.pattern,
        input.fieldPath,
        input.kind,
        input.missingReason,
      );
    }
    return;
  }

  input.values.forEach((value, index) => {
    if (!hasText(value)) {
      pushUnsupported(
        input.unsupportedClaims,
        input.artifactInput.pattern,
        `${input.fieldPath}.${index}`,
        input.kind,
        `Registry pattern ${input.fieldPath} entry is empty.`,
      );
      return;
    }

    pushClaim(
      input.claims,
      input.evidenceRefs,
      {
        id: `${input.artifactInput.pattern.id}.${input.fieldPath}.${index}`,
        kind: input.kind,
        text: value,
        field_path: `${input.fieldPath}.${index}`,
      },
      buildPatternEvidenceRef(
        input.artifactInput,
        `${input.artifactInput.pattern.id}.${input.fieldPath}.${index}.ref`,
        input.kind,
        `${input.fieldPath}.${index}`,
      ),
    );
  });
}

function formatPatternAccessibilitySignal(
  pattern: PatternRecord,
  signal: NonNullable<
    PatternRecord["accessibility"]["implementation_signals"]
  >[number],
): string {
  const signalLabel =
    signal.kind === "aria_attribute"
      ? "ARIA attributes"
      : signal.kind === "aria_role"
        ? "ARIA roles"
        : signal.kind === "aria_announcement"
          ? "ARIA announcement APIs"
          : "semantic HTML elements";
  const sourceLabel = signal.source_kind === "example" ? "examples" : "source";

  return `${pattern.name} ${sourceLabel} expose ${signalLabel}: ${signal.values.join(", ")}.`;
}

function findClaimByFieldPath(
  artifact: SaltGeneratedArtifact,
  fieldPath: string,
): SaltGeneratedClaim | null {
  return (
    artifact.claims.find((claim) => claim.field_path === fieldPath) ?? null
  );
}

function requireClaimByFieldPath(
  artifact: SaltGeneratedArtifact,
  fieldPath: string,
): SaltGeneratedClaim {
  const claim = findClaimByFieldPath(artifact, fieldPath);

  if (!claim) {
    throw new Error(
      `Pattern context field '${fieldPath}' does not resolve to a generated evidence claim.`,
    );
  }

  return claim;
}

function toEvidenceText(
  artifact: SaltGeneratedArtifact,
  fieldPath: string,
  value: string,
): SaltContextPatternEvidenceText {
  return {
    value,
    evidence_ref_ids: requireClaimByFieldPath(artifact, fieldPath)
      .evidence_ref_ids,
  };
}

function toOptionalEvidenceText(
  artifact: SaltGeneratedArtifact,
  fieldPath: string,
  value: string,
): SaltContextPatternEvidenceText | null {
  const claim = findClaimByFieldPath(artifact, fieldPath);

  return claim
    ? {
        value,
        evidence_ref_ids: claim.evidence_ref_ids,
      }
    : null;
}

function toEvidenceTextArray(
  artifact: SaltGeneratedArtifact,
  fieldPath: string,
  values: string[],
): SaltContextPatternEvidenceText[] {
  return values.flatMap((value, index) => {
    const claim = findClaimByFieldPath(artifact, `${fieldPath}.${index}`);

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

function toContextCompositions(
  pattern: PatternRecord,
  artifact: SaltGeneratedArtifact,
): SaltContextPatternComposition[] {
  return pattern.composed_of.flatMap((composition, index) => {
    const claim = findClaimByFieldPath(artifact, `composed_of.${index}`);

    return claim
      ? [
          {
            component: composition.component,
            role: composition.role,
            evidence_ref_ids: claim.evidence_ref_ids,
          },
        ]
      : [];
  });
}

function toContextResources(
  pattern: PatternRecord,
  artifact: SaltGeneratedArtifact,
): SaltContextPatternResource[] {
  return pattern.resources.flatMap((resource, index) => {
    const claim = findClaimByFieldPath(artifact, `resources.${index}`);

    return claim
      ? [
          {
            label: resource.label,
            href: resource.href,
            internal: resource.internal,
            evidence_ref_ids: claim.evidence_ref_ids,
          },
        ]
      : [];
  });
}

function toContextExamples(
  pattern: PatternRecord,
  artifact: SaltGeneratedArtifact,
): SaltContextPatternExample[] {
  return pattern.examples.flatMap((example) => {
    const claim = findClaimByFieldPath(artifact, `examples.${example.id}`);

    if (!claim || !example.source_url) {
      return [];
    }

    return [
      {
        id: example.id,
        title: example.title,
        description: example.description,
        code: example.code,
        source_url: example.source_url,
        evidence_ref_ids: claim.evidence_ref_ids,
      },
    ];
  });
}

function toContextAccessibilitySignals(
  pattern: PatternRecord,
  artifact: SaltGeneratedArtifact,
): SaltContextPatternAccessibilitySignal[] {
  return (pattern.accessibility.implementation_signals ?? []).flatMap(
    (signal, index) => {
      const claim = findClaimByFieldPath(
        artifact,
        `accessibility.implementation_signals.${index}`,
      );

      return claim
        ? [
            {
              kind: signal.kind,
              values: signal.values,
              source_kind: signal.source_kind,
              source_url: signal.source_url,
              evidence_ref_ids: claim.evidence_ref_ids,
            },
          ]
        : [];
    },
  );
}

export function buildPatternContextArtifact(
  input: BuildPatternContextArtifactInput,
): SaltGeneratedArtifact {
  const claims: SaltGeneratedClaim[] = [];
  const evidenceRefs: SaltEvidenceRef[] = [];
  const unsupportedClaims: SaltUnsupportedClaim[] = [];
  const { pattern } = input;

  pushClaim(
    claims,
    evidenceRefs,
    {
      id: `${pattern.id}.name`,
      kind: "pattern",
      text: `Pattern: ${pattern.name}`,
      field_path: "name",
    },
    buildPatternEvidenceRef(input, `${pattern.id}.name.ref`, "pattern", "name"),
  );

  pushClaim(
    claims,
    evidenceRefs,
    {
      id: `${pattern.id}.status`,
      kind: "status",
      text: `${pattern.name} status: ${pattern.status}`,
      field_path: "status",
    },
    buildPatternEvidenceRef(
      input,
      `${pattern.id}.status.ref`,
      "status",
      "status",
    ),
  );

  if (hasText(pattern.summary)) {
    pushClaim(
      claims,
      evidenceRefs,
      {
        id: `${pattern.id}.summary`,
        kind: "pattern",
        text: pattern.summary,
        field_path: "summary",
      },
      buildPatternEvidenceRef(
        input,
        `${pattern.id}.summary.ref`,
        "pattern",
        "summary",
      ),
    );
  } else {
    pushUnsupported(
      unsupportedClaims,
      pattern,
      "summary",
      "pattern",
      "Registry pattern summary is empty.",
    );
  }

  pushIndexedTextClaims({
    artifactInput: input,
    claims,
    evidenceRefs,
    unsupportedClaims,
    fieldPath: "when_to_use",
    kind: "pattern",
    missingReason: "Registry pattern when_to_use guidance is empty.",
    values: pattern.when_to_use,
  });
  pushIndexedTextClaims({
    artifactInput: input,
    claims,
    evidenceRefs,
    unsupportedClaims,
    fieldPath: "when_not_to_use",
    kind: "pattern",
    missingReason: "Registry pattern when_not_to_use guidance is empty.",
    values: pattern.when_not_to_use,
    required: false,
  });

  if (pattern.composed_of.length > 0) {
    pattern.composed_of.forEach((composition, index) => {
      if (!hasText(composition.component)) {
        pushUnsupported(
          unsupportedClaims,
          pattern,
          `composed_of.${index}`,
          "composition",
          "Registry pattern composition component is empty.",
        );
        return;
      }

      pushClaim(
        claims,
        evidenceRefs,
        {
          id: `${pattern.id}.composed_of.${index}`,
          kind: "composition",
          text: `${pattern.name} composes ${composition.component}${
            composition.role ? ` as ${composition.role}` : ""
          }.`,
          field_path: `composed_of.${index}`,
        },
        buildPatternEvidenceRef(
          input,
          `${pattern.id}.composed_of.${index}.ref`,
          "composition",
          `composed_of.${index}`,
        ),
      );
    });
  } else {
    pushUnsupported(
      unsupportedClaims,
      pattern,
      "composed_of",
      "composition",
      "Registry pattern composition is empty.",
    );
  }

  pushIndexedTextClaims({
    artifactInput: input,
    claims,
    evidenceRefs,
    unsupportedClaims,
    fieldPath: "how_to_build",
    kind: "pattern",
    missingReason: "Registry pattern how_to_build guidance is empty.",
    values: pattern.how_to_build,
    required: false,
  });
  pushIndexedTextClaims({
    artifactInput: input,
    claims,
    evidenceRefs,
    unsupportedClaims,
    fieldPath: "how_it_works",
    kind: "pattern",
    missingReason: "Registry pattern how_it_works guidance is empty.",
    values: pattern.how_it_works,
    required: false,
  });

  if (pattern.accessibility.summary.length > 0) {
    pattern.accessibility.summary.forEach((summary, index) => {
      const fieldPath = `accessibility.summary.${index}`;
      const accessibilitySourceRef = toPatternAccessibilitySourceRef(
        pattern,
        fieldPath,
      );

      if (!hasText(summary) || !accessibilitySourceRef) {
        pushUnsupported(
          unsupportedClaims,
          pattern,
          fieldPath,
          "accessibility",
          !hasText(summary)
            ? "Registry pattern accessibility summary entry is empty."
            : "Registry pattern accessibility summary is missing a source locator.",
        );
        return;
      }

      pushClaim(
        claims,
        evidenceRefs,
        {
          id: `${pattern.id}.accessibility.summary.${index}`,
          kind: "accessibility",
          text: summary,
          field_path: fieldPath,
        },
        buildPatternEvidenceRef(
          input,
          `${pattern.id}.accessibility.summary.${index}.ref`,
          "accessibility",
          fieldPath,
          accessibilitySourceRef,
        ),
      );
    });
  }

  (pattern.accessibility.implementation_signals ?? []).forEach(
    (signal, index) => {
      const fieldPath = `accessibility.implementation_signals.${index}`;
      const signalSourceRef = toPatternAccessibilitySignalSourceRef(signal);

      if (
        !hasText(signal.kind) ||
        signal.values.length === 0 ||
        !signal.values.every(hasText) ||
        !hasText(signal.source_kind) ||
        !signalSourceRef
      ) {
        pushUnsupported(
          unsupportedClaims,
          pattern,
          fieldPath,
          "accessibility",
          "Registry pattern accessibility implementation signal is missing kind, values, source kind, or source locator.",
        );
        return;
      }

      pushClaim(
        claims,
        evidenceRefs,
        {
          id: `${pattern.id}.accessibility.implementation_signals.${index}`,
          kind: "accessibility",
          text: formatPatternAccessibilitySignal(pattern, signal),
          field_path: fieldPath,
        },
        buildPatternEvidenceRef(
          input,
          `${pattern.id}.accessibility.implementation_signals.${index}.ref`,
          "accessibility",
          fieldPath,
          signalSourceRef,
        ),
      );
    },
  );

  for (const [index, resource] of pattern.resources.entries()) {
    if (!hasText(resource.label) || !hasText(resource.href)) {
      pushUnsupported(
        unsupportedClaims,
        pattern,
        `resources.${index}`,
        "pattern",
        "Registry pattern resource is missing label or href.",
      );
      continue;
    }

    pushClaim(
      claims,
      evidenceRefs,
      {
        id: `${pattern.id}.resources.${index}`,
        kind: "pattern",
        text: `${pattern.name} resource: ${resource.label}.`,
        field_path: `resources.${index}`,
      },
      buildPatternEvidenceRef(
        input,
        `${pattern.id}.resources.${index}.ref`,
        "pattern",
        `resources.${index}`,
        toPatternResourceSourceRef(resource),
      ),
    );
  }

  if (pattern.examples.length > 0) {
    for (const example of pattern.examples) {
      const sourceRef = toPatternExampleSourceRef(example);

      if (!sourceRef) {
        pushUnsupported(
          unsupportedClaims,
          pattern,
          `examples.${example.id}`,
          "example",
          "Registry pattern example is missing source_url.",
        );
        continue;
      }

      pushClaim(
        claims,
        evidenceRefs,
        {
          id: `${pattern.id}.examples.${example.id}`,
          kind: "example",
          text: `${pattern.name} has source-backed example ${example.title}.`,
          field_path: `examples.${example.id}`,
        },
        buildPatternEvidenceRef(
          input,
          `${pattern.id}.examples.${example.id}.ref`,
          "example",
          `examples.${example.id}`,
          sourceRef,
        ),
      );
    }
  } else {
    pushUnsupported(
      unsupportedClaims,
      pattern,
      "examples",
      "example",
      "Registry pattern examples are empty.",
    );
  }

  return {
    contract: SALT_GENERATED_ARTIFACT_CONTRACT,
    artifact_kind: "pattern-context",
    id: `pattern-context.${pattern.id}`,
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

export function buildPatternContextArtifactSurfaceGate(
  input: BuildPatternContextArtifactSurfaceGateInput,
): PatternContextArtifactSurfaceGate {
  const registryHash =
    input.registry_hash ?? createSaltRegistryFingerprint(input.registry);

  return validateGeneratedSaltArtifactSurface({
    artifact: buildPatternContextArtifact({
      ...input,
      registry_hash: registryHash,
    }),
    registry: input.registry,
    artifact_label: "pattern context",
  });
}

export function buildPatternContext(
  input: BuildPatternContextInput,
): SaltContextPattern {
  const surfaceGate = buildPatternContextArtifactSurfaceGate(input);
  const artifact = surfaceGate.artifact;
  const serializedSurfaceGate =
    serializeGeneratedSaltArtifactSurfaceGate(surfaceGate);

  return {
    contract: SALT_CONTEXT_PATTERN_CONTRACT,
    generated_at: input.generated_at,
    generator: input.generator,
    registry: artifact.registry,
    status: serializedSurfaceGate.status,
    pattern: {
      id: input.pattern.id,
      name: toEvidenceText(artifact, "name", input.pattern.name),
      status: toEvidenceText(artifact, "status", input.pattern.status),
      summary: toOptionalEvidenceText(
        artifact,
        "summary",
        input.pattern.summary,
      ),
      when_to_use: toEvidenceTextArray(
        artifact,
        "when_to_use",
        input.pattern.when_to_use,
      ),
      when_not_to_use: toEvidenceTextArray(
        artifact,
        "when_not_to_use",
        input.pattern.when_not_to_use,
      ),
      composed_of: toContextCompositions(input.pattern, artifact),
      how_to_build: toEvidenceTextArray(
        artifact,
        "how_to_build",
        input.pattern.how_to_build,
      ),
      how_it_works: toEvidenceTextArray(
        artifact,
        "how_it_works",
        input.pattern.how_it_works,
      ),
      accessibility: {
        summary: toEvidenceTextArray(
          artifact,
          "accessibility.summary",
          input.pattern.accessibility.summary,
        ),
        implementation_signals: toContextAccessibilitySignals(
          input.pattern,
          artifact,
        ),
      },
      resources: toContextResources(input.pattern, artifact),
      examples: toContextExamples(input.pattern, artifact),
    },
    evidence_refs: artifact.evidence_refs,
    unsupported_claims: artifact.unsupported_claims ?? [],
    surface_gate: serializedSurfaceGate,
    generated_artifact: artifact,
  };
}
