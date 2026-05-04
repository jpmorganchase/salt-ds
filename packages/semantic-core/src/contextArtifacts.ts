import {
  SALT_EVIDENCE_REF_CONTRACT,
  SALT_GENERATED_ARTIFACT_CONTRACT,
  type SaltEvidenceClaimKind,
  type SaltEvidenceRef,
  type SaltEvidenceSourceRef,
  type SaltGeneratedArtifact,
  type SaltGeneratedArtifactGenerator,
  type SaltGeneratedArtifactRegistry,
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
import type {
  ComponentProp,
  ComponentRecord,
  ExampleRecord,
  SaltRegistry,
} from "./types.js";

export const SALT_CONTEXT_COMPONENT_CONTRACT =
  "salt_context_component_v1" as const;

export interface BuildComponentContextArtifactInput {
  registry: Pick<SaltRegistry, "version" | "generated_at">;
  component: ComponentRecord;
  generated_at: string;
  generator: {
    name: string;
    version?: string | null;
  };
  registry_hash?: string | null;
}

export type BuildComponentContextArtifactSurfaceGateInput = Omit<
  BuildComponentContextArtifactInput,
  "registry"
> & {
  registry: SaltRegistry;
};

export type ComponentContextArtifactSurfaceGate =
  GeneratedSaltArtifactSurfaceGate;

export type BuildComponentContextInput =
  BuildComponentContextArtifactSurfaceGateInput;

export type SaltContextComponentSurfaceGate =
  SerializedGeneratedSaltArtifactSurfaceGate;

export interface SaltContextComponentEvidenceText {
  value: string;
  evidence_ref_ids: string[];
}

export interface SaltContextComponentImport {
  package_name: string;
  export_name: string;
  statement: string;
  evidence_ref_ids: string[];
}

export interface SaltContextComponentProp {
  name: string;
  type: string;
  required: boolean;
  description: string;
  allowed_values?: Array<string | number | boolean>;
  deprecated: boolean;
  deprecation_note?: string | null;
  evidence_ref_ids: string[];
}

export interface SaltContextComponentAccessibility {
  summary: SaltContextComponentEvidenceText[];
}

export interface SaltContextComponentExample {
  id: string;
  title: string;
  description: string;
  code: string;
  source_url: string;
  evidence_ref_ids: string[];
}

export interface SaltContextComponentRecord {
  id: string;
  name: SaltContextComponentEvidenceText;
  package_name: SaltContextComponentEvidenceText;
  status: SaltContextComponentEvidenceText;
  import: SaltContextComponentImport | null;
  summary: SaltContextComponentEvidenceText | null;
  props: SaltContextComponentProp[];
  accessibility: SaltContextComponentAccessibility;
  examples: SaltContextComponentExample[];
}

export interface SaltContextComponent {
  contract: typeof SALT_CONTEXT_COMPONENT_CONTRACT;
  generated_at: string;
  generator: SaltGeneratedArtifactGenerator;
  registry: SaltGeneratedArtifactRegistry;
  status: SaltContextComponentSurfaceGate["status"];
  component: SaltContextComponentRecord;
  evidence_refs: SaltEvidenceRef[];
  unsupported_claims: SaltUnsupportedClaim[];
  surface_gate: SaltContextComponentSurfaceGate;
  generated_artifact: SaltGeneratedArtifact;
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()))].filter(
    (value) => value.length > 0,
  );
}

function toSourceRef(component: ComponentRecord): SaltEvidenceSourceRef | null {
  const url =
    component.related_docs.usage ??
    component.related_docs.overview ??
    component.related_docs.examples ??
    component.related_docs.accessibility;

  if (!url && !component.source.repo_path) {
    return null;
  }

  return {
    url,
    repo_path: component.source.repo_path,
  };
}

function toAccessibilitySourceRef(
  component: ComponentRecord,
): SaltEvidenceSourceRef | null {
  const url =
    component.related_docs.accessibility ?? component.related_docs.usage;

  if (!url && !component.source.repo_path) {
    return null;
  }

  return {
    url,
    repo_path: component.source.repo_path,
  };
}

function toExampleSourceRef(
  component: ComponentRecord,
  example: ExampleRecord,
): SaltEvidenceSourceRef | null {
  if (!example.source_url && !component.source.repo_path) {
    return null;
  }

  return {
    url: example.source_url,
    repo_path: component.source.repo_path,
  };
}

function buildComponentEvidenceRef(
  input: BuildComponentContextArtifactInput,
  id: string,
  claimKind: SaltEvidenceClaimKind,
  fieldPath: string,
  sourceRef: SaltEvidenceSourceRef | null = toSourceRef(input.component),
): SaltEvidenceRef {
  return {
    contract: SALT_EVIDENCE_REF_CONTRACT,
    id,
    source_kind: "registry",
    claim_kind: claimKind,
    registry: {
      entity_type: "component",
      entity_id: input.component.id,
      entity_name: input.component.name,
      field_path: fieldPath,
      registry_version: input.registry.version,
      registry_hash: input.registry_hash ?? null,
    },
    source: sourceRef,
    confidence: "high",
    verified_at: input.component.last_verified_at,
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

function buildPropClaimText(
  component: ComponentRecord,
  prop: ComponentProp,
): string {
  const requiredText = prop.required ? "required" : "optional";
  return `${component.name} has ${requiredText} prop ${prop.name}.`;
}

function pushUnsupportedIfMissing(
  unsupportedClaims: SaltUnsupportedClaim[],
  component: ComponentRecord,
  fieldPath: string,
  kind: SaltEvidenceClaimKind,
  reason: string,
): void {
  unsupportedClaims.push({
    id: `${component.id}.${fieldPath}.unsupported`,
    kind,
    text: `${component.name} ${fieldPath}`,
    field_path: fieldPath,
    reason,
  });
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
      `Component context field '${fieldPath}' does not resolve to a generated evidence claim.`,
    );
  }

  return claim;
}

function toEvidenceText(
  artifact: SaltGeneratedArtifact,
  fieldPath: string,
  value: string,
): SaltContextComponentEvidenceText {
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
): SaltContextComponentEvidenceText | null {
  const claim = findClaimByFieldPath(artifact, fieldPath);

  return claim
    ? {
        value,
        evidence_ref_ids: claim.evidence_ref_ids,
      }
    : null;
}

function toContextImport(
  component: ComponentRecord,
  artifact: SaltGeneratedArtifact,
): SaltContextComponentImport | null {
  const claim = findClaimByFieldPath(artifact, "source.export_name");

  if (!claim || !component.source.export_name) {
    return null;
  }

  const packageClaim = requireClaimByFieldPath(artifact, "package.name");
  const statement = `import { ${component.source.export_name} } from "${component.package.name}";`;

  return {
    package_name: component.package.name,
    export_name: component.source.export_name,
    statement,
    evidence_ref_ids: uniqueStrings([
      ...claim.evidence_ref_ids,
      ...packageClaim.evidence_ref_ids,
    ]),
  };
}

function toContextProp(
  artifact: SaltGeneratedArtifact,
  prop: ComponentProp,
): SaltContextComponentProp {
  return {
    name: prop.name,
    type: prop.type,
    required: prop.required,
    description: prop.description,
    ...(prop.allowed_values ? { allowed_values: prop.allowed_values } : {}),
    deprecated: prop.deprecated,
    ...(prop.deprecation_note
      ? { deprecation_note: prop.deprecation_note }
      : {}),
    evidence_ref_ids: requireClaimByFieldPath(artifact, `props.${prop.name}`)
      .evidence_ref_ids,
  };
}

function toContextExamples(
  component: ComponentRecord,
  artifact: SaltGeneratedArtifact,
): SaltContextComponentExample[] {
  return component.examples.flatMap((example) => {
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

export function buildComponentContextArtifact(
  input: BuildComponentContextArtifactInput,
): SaltGeneratedArtifact {
  const claims: SaltGeneratedClaim[] = [];
  const evidenceRefs: SaltEvidenceRef[] = [];
  const unsupportedClaims: SaltUnsupportedClaim[] = [];
  const { component } = input;

  pushClaim(
    claims,
    evidenceRefs,
    {
      id: `${component.id}.name`,
      kind: "component",
      text: `Component: ${component.name}`,
      field_path: "name",
    },
    buildComponentEvidenceRef(
      input,
      `${component.id}.name.ref`,
      "component",
      "name",
    ),
  );

  pushClaim(
    claims,
    evidenceRefs,
    {
      id: `${component.id}.package`,
      kind: "package",
      text: `${component.name} package: ${component.package.name}`,
      field_path: "package.name",
    },
    buildComponentEvidenceRef(
      input,
      `${component.id}.package.ref`,
      "package",
      "package.name",
    ),
  );

  pushClaim(
    claims,
    evidenceRefs,
    {
      id: `${component.id}.status`,
      kind: "status",
      text: `${component.name} status: ${component.status}`,
      field_path: "status",
    },
    buildComponentEvidenceRef(
      input,
      `${component.id}.status.ref`,
      "status",
      "status",
    ),
  );

  if (component.source.export_name) {
    pushClaim(
      claims,
      evidenceRefs,
      {
        id: `${component.id}.import`,
        kind: "import",
        text: `Import ${component.source.export_name} from ${component.package.name}.`,
        field_path: "source.export_name",
      },
      buildComponentEvidenceRef(
        input,
        `${component.id}.import.ref`,
        "import",
        "source.export_name",
      ),
    );
  } else {
    pushUnsupportedIfMissing(
      unsupportedClaims,
      component,
      "source.export_name",
      "import",
      "Registry component source export_name is empty.",
    );
  }

  if (component.summary.trim().length > 0) {
    pushClaim(
      claims,
      evidenceRefs,
      {
        id: `${component.id}.summary`,
        kind: "component",
        text: component.summary,
        field_path: "summary",
      },
      buildComponentEvidenceRef(
        input,
        `${component.id}.summary.ref`,
        "component",
        "summary",
      ),
    );
  } else {
    pushUnsupportedIfMissing(
      unsupportedClaims,
      component,
      "summary",
      "component",
      "Registry component summary is empty.",
    );
  }

  for (const prop of component.props) {
    pushClaim(
      claims,
      evidenceRefs,
      {
        id: `${component.id}.props.${prop.name}`,
        kind: "prop",
        text: buildPropClaimText(component, prop),
        field_path: `props.${prop.name}`,
      },
      buildComponentEvidenceRef(
        input,
        `${component.id}.props.${prop.name}.ref`,
        "prop",
        `props.${prop.name}`,
      ),
    );
  }

  if (component.accessibility.summary.length > 0) {
    component.accessibility.summary.forEach((summary, index) => {
      if (summary.trim().length === 0) {
        pushUnsupportedIfMissing(
          unsupportedClaims,
          component,
          `accessibility.summary.${index}`,
          "accessibility",
          "Registry component accessibility summary entry is empty.",
        );
        return;
      }

      pushClaim(
        claims,
        evidenceRefs,
        {
          id: `${component.id}.accessibility.summary.${index}`,
          kind: "accessibility",
          text: summary,
          field_path: `accessibility.summary.${index}`,
        },
        buildComponentEvidenceRef(
          input,
          `${component.id}.accessibility.summary.${index}.ref`,
          "accessibility",
          `accessibility.summary.${index}`,
          toAccessibilitySourceRef(component),
        ),
      );
    });
  }

  if (component.examples.length > 0) {
    for (const example of component.examples) {
      if (example.source_url) {
        pushClaim(
          claims,
          evidenceRefs,
          {
            id: `${component.id}.examples.${example.id}`,
            kind: "example",
            text: `${component.name} has source-backed example ${example.title}.`,
            field_path: `examples.${example.id}`,
          },
          buildComponentEvidenceRef(
            input,
            `${component.id}.examples.${example.id}.ref`,
            "example",
            `examples.${example.id}`,
            toExampleSourceRef(component, example),
          ),
        );
      } else {
        pushUnsupportedIfMissing(
          unsupportedClaims,
          component,
          `examples.${example.id}`,
          "example",
          "Registry component example is missing source_url.",
        );
      }
    }
  } else {
    pushUnsupportedIfMissing(
      unsupportedClaims,
      component,
      "examples",
      "example",
      "Registry component examples are empty.",
    );
  }

  return {
    contract: SALT_GENERATED_ARTIFACT_CONTRACT,
    artifact_kind: "component-context",
    id: `component-context.${component.id}`,
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

export function buildComponentContextArtifactSurfaceGate(
  input: BuildComponentContextArtifactSurfaceGateInput,
): ComponentContextArtifactSurfaceGate {
  const registryHash =
    input.registry_hash ?? createSaltRegistryFingerprint(input.registry);

  return validateGeneratedSaltArtifactSurface({
    artifact: buildComponentContextArtifact({
      ...input,
      registry_hash: registryHash,
    }),
    registry: input.registry,
    artifact_label: "component context",
  });
}

export function buildComponentContext(
  input: BuildComponentContextInput,
): SaltContextComponent {
  const surfaceGate = buildComponentContextArtifactSurfaceGate(input);
  const artifact = surfaceGate.artifact;
  const serializedSurfaceGate =
    serializeGeneratedSaltArtifactSurfaceGate(surfaceGate);

  return {
    contract: SALT_CONTEXT_COMPONENT_CONTRACT,
    generated_at: input.generated_at,
    generator: input.generator,
    registry: artifact.registry,
    status: serializedSurfaceGate.status,
    component: {
      id: input.component.id,
      name: toEvidenceText(artifact, "name", input.component.name),
      package_name: toEvidenceText(
        artifact,
        "package.name",
        input.component.package.name,
      ),
      status: toEvidenceText(artifact, "status", input.component.status),
      import: toContextImport(input.component, artifact),
      summary: toOptionalEvidenceText(
        artifact,
        "summary",
        input.component.summary,
      ),
      props: input.component.props.map((prop) => toContextProp(artifact, prop)),
      accessibility: {
        summary: input.component.accessibility.summary.flatMap(
          (summary, index) => {
            const claim = findClaimByFieldPath(
              artifact,
              `accessibility.summary.${index}`,
            );

            return claim
              ? [
                  {
                    value: summary,
                    evidence_ref_ids: claim.evidence_ref_ids,
                  },
                ]
              : [];
          },
        ),
      },
      examples: toContextExamples(input.component, artifact),
    },
    evidence_refs: artifact.evidence_refs,
    unsupported_claims: artifact.unsupported_claims ?? [],
    surface_gate: serializedSurfaceGate,
    generated_artifact: artifact,
  };
}
