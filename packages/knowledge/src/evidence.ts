export const SALT_EVIDENCE_REF_CONTRACT = "salt_evidence_ref_v1" as const;
export const SALT_GENERATED_ARTIFACT_CONTRACT =
  "salt_generated_artifact_v1" as const;

export type SaltEvidenceSourceKind =
  | "registry"
  | "docs"
  | "source"
  | "example"
  | "token"
  | "package"
  | "submitted_text"
  | "runtime";

export type SaltEvidenceClaimKind =
  | "component"
  | "pattern"
  | "prop"
  | "token"
  | "import"
  | "package"
  | "provider"
  | "accessibility"
  | "example"
  | "composition"
  | "status";

export type SaltEvidenceRegistryEntityType =
  | "component"
  | "pattern"
  | "guide"
  | "token"
  | "example"
  | "package"
  | "page"
  | "deprecation";

export interface SaltEvidenceRegistryRef {
  entity_type: SaltEvidenceRegistryEntityType;
  entity_id: string;
  entity_name?: string | null;
  field_path: string;
  registry_version: string;
  registry_hash: string;
}

export interface SaltEvidenceSourceRef {
  url?: string | null;
  repo_path?: string | null;
  section?: string | null;
  line_start?: number | null;
  line_end?: number | null;
}

export interface SaltEvidencePackageRef {
  name: string;
  version?: string | null;
}

export interface SaltEvidenceSubmittedTextRef {
  field_path: string;
  captured_at?: string | null;
}

interface SaltEvidenceRefBase {
  contract: typeof SALT_EVIDENCE_REF_CONTRACT;
  id: string;
  claim_kind: SaltEvidenceClaimKind;
  registry?: SaltEvidenceRegistryRef | null;
  source?: SaltEvidenceSourceRef | null;
  package?: SaltEvidencePackageRef | null;
  submitted_text?: SaltEvidenceSubmittedTextRef | null;
  note?: string | null;
}

export type SaltRegistryEvidenceRef = SaltEvidenceRefBase & {
  source_kind: "registry";
  registry: SaltEvidenceRegistryRef;
};

export type SaltNonRegistryEvidenceRef = SaltEvidenceRefBase & {
  source_kind: Exclude<SaltEvidenceSourceKind, "registry">;
};

export type SaltEvidenceRef =
  | SaltRegistryEvidenceRef
  | SaltNonRegistryEvidenceRef;

function normalizeEvidenceValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) =>
      entry === undefined ? null : normalizeEvidenceValue(entry),
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
            : [[key, normalizeEvidenceValue(record[key])]],
        ),
    );
  }
  return value;
}

export function saltEvidenceRefsEqual(
  left: SaltEvidenceRef,
  right: SaltEvidenceRef,
): boolean {
  return (
    JSON.stringify(normalizeEvidenceValue(left)) ===
    JSON.stringify(normalizeEvidenceValue(right))
  );
}

export function deduplicateSaltEvidenceRefs(
  refs: readonly SaltEvidenceRef[],
): SaltEvidenceRef[] {
  const byId = new Map<string, SaltEvidenceRef>();
  for (const ref of refs) {
    const existing = byId.get(ref.id);
    if (existing && !saltEvidenceRefsEqual(existing, ref)) {
      throw new Error(
        `Conflicting Salt evidence references share id '${ref.id}'.`,
      );
    }
    if (!existing) {
      byId.set(ref.id, ref);
    }
  }
  return [...byId.values()];
}

export type SaltTokenPolicyEvidenceSource = Omit<
  SaltEvidenceSourceRef,
  "url" | "repo_path"
> &
  (
    | {
        url: string;
        repo_path?: string | null;
      }
    | {
        url?: string | null;
        repo_path: string;
      }
  );

/**
 * Source-backed evidence accepted by catalog token-policy normalization.
 * Submitted text and runtime observations use separate evidence locators.
 */
export type SaltTokenPolicyEvidenceRef = Omit<
  SaltEvidenceRef,
  | "source_kind"
  | "claim_kind"
  | "source"
  | "registry"
  | "package"
  | "submitted_text"
> & {
  source_kind: "docs" | "token";
  claim_kind: "token";
  source: SaltTokenPolicyEvidenceSource;
};

export type SaltGeneratedArtifactKind =
  | "pattern-guidance"
  | "review-report"
  | "validation-report";

export interface SaltGeneratedClaim {
  id: string;
  kind: SaltEvidenceClaimKind;
  text: string;
  field_path?: string | null;
  evidence_ref_ids: string[];
}

export interface SaltUnsupportedClaim {
  id: string;
  kind: SaltEvidenceClaimKind;
  text: string;
  reason: string;
  field_path?: string | null;
}

export interface SaltGeneratedArtifactGenerator {
  name: string;
  version?: string | null;
}

export interface SaltGeneratedArtifactRegistry {
  version?: string | null;
  hash?: string | null;
  generated_at?: string | null;
}

export interface SaltGeneratedArtifact {
  contract: typeof SALT_GENERATED_ARTIFACT_CONTRACT;
  artifact_kind: SaltGeneratedArtifactKind;
  id: string;
  generated_at: string | null;
  generator: SaltGeneratedArtifactGenerator;
  registry: SaltGeneratedArtifactRegistry;
  claims: SaltGeneratedClaim[];
  evidence_refs: SaltEvidenceRef[];
  unsupported_claims?: SaltUnsupportedClaim[];
}

export type SaltEvidenceValidationIssueCode =
  | "invalid_evidence_contract"
  | "missing_registry_locator"
  | "missing_registry_entity"
  | "ambiguous_registry_entity"
  | "missing_registry_field_path"
  | "missing_registry_field"
  | "missing_source_locator"
  | "invalid_source_locator"
  | "conflicting_evidence_ref"
  | "missing_submitted_text_locator"
  | "missing_runtime_locator"
  | "missing_package_locator"
  | "missing_registry_identity"
  | "stale_registry"
  | "missing_claim_evidence"
  | "unknown_claim_evidence_ref"
  | "missing_matching_claim_evidence_ref"
  | "invalid_claim_evidence_ref"
  | "invalid_structural_role_rule_pack"
  | "missing_structural_role_rule_evidence";

export interface SaltEvidenceValidationIssue {
  code: SaltEvidenceValidationIssueCode;
  message: string;
  path: string;
}

function hasText(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

const EVIDENCE_SOURCE_KINDS = new Set<SaltEvidenceSourceKind>([
  "registry",
  "docs",
  "source",
  "example",
  "token",
  "package",
  "submitted_text",
  "runtime",
]);
const EVIDENCE_CLAIM_KINDS = new Set<SaltEvidenceClaimKind>([
  "component",
  "pattern",
  "prop",
  "token",
  "import",
  "package",
  "provider",
  "accessibility",
  "example",
  "composition",
  "status",
]);
const REGISTRY_ENTITY_TYPES = new Set<SaltEvidenceRegistryEntityType>([
  "component",
  "pattern",
  "guide",
  "token",
  "example",
  "package",
  "page",
  "deprecation",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function invalidContractIssue(
  path: string,
  message: string,
): SaltEvidenceValidationIssue {
  return { code: "invalid_evidence_contract", message, path };
}

function rejectUnknownKeys(
  record: Record<string, unknown>,
  allowed: ReadonlySet<string>,
  path: string,
): SaltEvidenceValidationIssue[] {
  return Object.keys(record)
    .filter((key) => !allowed.has(key))
    .map((key) =>
      invalidContractIssue(
        `${path}.${key}`,
        `Evidence contract field '${path}.${key}' is not allowed.`,
      ),
    );
}

function validateNullableStringField(
  record: Record<string, unknown>,
  key: string,
  path: string,
  required = false,
  nonEmpty = false,
): SaltEvidenceValidationIssue[] {
  const present = Object.hasOwn(record, key);
  const value = record[key];
  if (!present) {
    return required
      ? [
          invalidContractIssue(
            `${path}.${key}`,
            `Evidence contract field '${path}.${key}' is required.`,
          ),
        ]
      : [];
  }
  if (
    value !== null &&
    (typeof value !== "string" || (nonEmpty && value.trim().length === 0))
  ) {
    return [
      invalidContractIssue(
        `${path}.${key}`,
        `Evidence contract field '${path}.${key}' has an invalid value.`,
      ),
    ];
  }
  if (required && value === null) {
    return [
      invalidContractIssue(
        `${path}.${key}`,
        `Evidence contract field '${path}.${key}' must be a string.`,
      ),
    ];
  }
  return [];
}

function validateNestedEvidenceObject(
  value: unknown,
  path: string,
  allowedKeys: readonly string[],
): {
  record: Record<string, unknown> | null;
  issues: SaltEvidenceValidationIssue[];
} {
  if (value === null || value === undefined)
    return { record: null, issues: [] };
  if (!isRecord(value)) {
    return {
      record: null,
      issues: [
        invalidContractIssue(
          path,
          `Evidence contract field '${path}' must be an object or null.`,
        ),
      ],
    };
  }
  return {
    record: value,
    issues: rejectUnknownKeys(value, new Set(allowedKeys), path),
  };
}

function validateEvidenceRefStructure(
  value: unknown,
  path: string,
): SaltEvidenceValidationIssue[] {
  if (!isRecord(value)) {
    return [invalidContractIssue(path, "Evidence ref must be an object.")];
  }
  const issues = rejectUnknownKeys(
    value,
    new Set([
      "contract",
      "id",
      "source_kind",
      "claim_kind",
      "registry",
      "source",
      "package",
      "submitted_text",
      "note",
    ]),
    path,
  );

  issues.push(
    ...validateNullableStringField(value, "contract", path, true, true),
    ...validateNullableStringField(value, "id", path, true, true),
    ...validateNullableStringField(value, "note", path),
  );
  if (!EVIDENCE_SOURCE_KINDS.has(value.source_kind as SaltEvidenceSourceKind)) {
    issues.push(
      invalidContractIssue(
        `${path}.source_kind`,
        `Evidence contract field '${path}.source_kind' is missing or unknown.`,
      ),
    );
  }
  if (!EVIDENCE_CLAIM_KINDS.has(value.claim_kind as SaltEvidenceClaimKind)) {
    issues.push(
      invalidContractIssue(
        `${path}.claim_kind`,
        `Evidence contract field '${path}.claim_kind' is missing or unknown.`,
      ),
    );
  }

  const registry = validateNestedEvidenceObject(
    value.registry,
    `${path}.registry`,
    [
      "entity_type",
      "entity_id",
      "entity_name",
      "field_path",
      "registry_version",
      "registry_hash",
    ],
  );
  issues.push(...registry.issues);
  if (registry.record) {
    if (
      !REGISTRY_ENTITY_TYPES.has(
        registry.record.entity_type as SaltEvidenceRegistryEntityType,
      )
    ) {
      issues.push(
        invalidContractIssue(
          `${path}.registry.entity_type`,
          "Registry evidence entity_type is missing or unknown.",
        ),
      );
    }
    issues.push(
      ...validateNullableStringField(
        registry.record,
        "entity_id",
        `${path}.registry`,
        true,
        true,
      ),
      ...validateNullableStringField(
        registry.record,
        "entity_name",
        `${path}.registry`,
      ),
      ...validateNullableStringField(
        registry.record,
        "field_path",
        `${path}.registry`,
        true,
        true,
      ),
      ...validateNullableStringField(
        registry.record,
        "registry_version",
        `${path}.registry`,
        true,
        true,
      ),
      ...validateNullableStringField(
        registry.record,
        "registry_hash",
        `${path}.registry`,
        true,
        true,
      ),
    );
  }

  const source = validateNestedEvidenceObject(value.source, `${path}.source`, [
    "url",
    "repo_path",
    "section",
    "line_start",
    "line_end",
  ]);
  issues.push(...source.issues);
  if (source.record) {
    issues.push(
      ...validateNullableStringField(
        source.record,
        "url",
        `${path}.source`,
        false,
        true,
      ),
      ...validateNullableStringField(
        source.record,
        "repo_path",
        `${path}.source`,
        false,
        true,
      ),
      ...validateNullableStringField(
        source.record,
        "section",
        `${path}.source`,
        false,
        true,
      ),
    );
    for (const key of ["line_start", "line_end"] as const) {
      const line = source.record[key];
      if (
        line !== undefined &&
        line !== null &&
        (!Number.isInteger(line) || (line as number) < 1)
      ) {
        issues.push(
          invalidContractIssue(
            `${path}.source.${key}`,
            `Evidence contract field '${path}.source.${key}' must be a positive integer or null.`,
          ),
        );
      }
    }
  }

  const packageRef = validateNestedEvidenceObject(
    value.package,
    `${path}.package`,
    ["name", "version"],
  );
  issues.push(...packageRef.issues);
  if (packageRef.record) {
    issues.push(
      ...validateNullableStringField(
        packageRef.record,
        "name",
        `${path}.package`,
        true,
        true,
      ),
      ...validateNullableStringField(
        packageRef.record,
        "version",
        `${path}.package`,
      ),
    );
  }

  const submitted = validateNestedEvidenceObject(
    value.submitted_text,
    `${path}.submitted_text`,
    ["field_path", "captured_at"],
  );
  issues.push(...submitted.issues);
  if (submitted.record) {
    issues.push(
      ...validateNullableStringField(
        submitted.record,
        "field_path",
        `${path}.submitted_text`,
        true,
        true,
      ),
      ...validateNullableStringField(
        submitted.record,
        "captured_at",
        `${path}.submitted_text`,
      ),
    );
  }
  return issues;
}

export function validateEvidenceRef(
  ref: SaltEvidenceRef,
  path: string,
): SaltEvidenceValidationIssue[] {
  const issues = validateEvidenceRefStructure(ref, path);
  const sourceUrl = ref.source?.url;
  const sourceRepoPath = ref.source?.repo_path;

  if (ref.contract !== SALT_EVIDENCE_REF_CONTRACT) {
    issues.push({
      code: "invalid_evidence_contract",
      message: `Evidence ref '${ref.id}' must use ${SALT_EVIDENCE_REF_CONTRACT}.`,
      path: `${path}.contract`,
    });
  }

  if (ref.source_kind === "registry" && !hasText(ref.registry?.entity_id)) {
    issues.push({
      code: "missing_registry_locator",
      message: `Registry evidence ref '${ref.id}' must include registry.entity_id.`,
      path: `${path}.registry.entity_id`,
    });
  }

  if (
    ["docs", "source", "example", "token"].includes(ref.source_kind) &&
    !hasText(sourceUrl) &&
    !hasText(sourceRepoPath)
  ) {
    issues.push({
      code: "missing_source_locator",
      message: `Source-backed evidence ref '${ref.id}' must include source.url or source.repo_path.`,
      path: `${path}.source`,
    });
  }
  if (ref.source_kind === "registry" && !hasText(ref.registry?.field_path)) {
    issues.push({
      code: "missing_registry_field_path",
      message: `Registry evidence ref '${ref.id}' must include registry.field_path.`,
      path: `${path}.registry.field_path`,
    });
  }
  if (
    ref.source_kind === "registry" &&
    !hasText(ref.registry?.registry_version)
  ) {
    issues.push({
      code: "missing_registry_identity",
      message: `Registry evidence ref '${ref.id}' must include registry.registry_version.`,
      path: `${path}.registry.registry_version`,
    });
  }
  if (ref.source_kind === "registry" && !hasText(ref.registry?.registry_hash)) {
    issues.push({
      code: "missing_registry_identity",
      message: `Registry evidence ref '${ref.id}' must include registry.registry_hash.`,
      path: `${path}.registry.registry_hash`,
    });
  }
  if (
    hasText(sourceUrl) &&
    !isCanonicalSiteRoute(sourceUrl) &&
    !isSafeAbsoluteHttpsUrl(sourceUrl)
  ) {
    issues.push({
      code: "invalid_source_locator",
      message: `Evidence ref '${ref.id}' source.url must be a canonical Salt route or absolute HTTPS URL.`,
      path: `${path}.source.url`,
    });
  }
  if (hasText(sourceRepoPath) && !isPortableRepositoryPath(sourceRepoPath)) {
    issues.push({
      code: "invalid_source_locator",
      message: `Evidence ref '${ref.id}' source.repo_path must be a portable repository path.`,
      path: `${path}.source.repo_path`,
    });
  }
  if (
    (ref.source?.line_start == null) !== (ref.source?.line_end == null) ||
    (ref.source?.line_start != null &&
      ref.source.line_end != null &&
      (!Number.isInteger(ref.source.line_start) ||
        !Number.isInteger(ref.source.line_end) ||
        ref.source.line_start < 1 ||
        ref.source.line_end < ref.source.line_start))
  ) {
    issues.push({
      code: "invalid_source_locator",
      message: `Evidence ref '${ref.id}' source line range must have ordered start and end lines.`,
      path: `${path}.source`,
    });
  }

  if (
    ref.source_kind === "submitted_text" &&
    !hasText(ref.submitted_text?.field_path)
  ) {
    issues.push({
      code: "missing_submitted_text_locator",
      message: `Submitted-text evidence ref '${ref.id}' must include submitted_text.field_path.`,
      path: `${path}.submitted_text.field_path`,
    });
  }

  if (
    ref.source_kind === "runtime" &&
    !hasText(ref.source?.url) &&
    !hasText(ref.source?.repo_path) &&
    !hasText(ref.source?.section)
  ) {
    issues.push({
      code: "missing_runtime_locator",
      message: `Runtime evidence ref '${ref.id}' must include source.url, source.repo_path, or source.section.`,
      path: `${path}.source`,
    });
  }

  if (ref.source_kind === "package" && !hasText(ref.package?.name)) {
    issues.push({
      code: "missing_package_locator",
      message: `Package evidence ref '${ref.id}' must include package.name.`,
      path: `${path}.package.name`,
    });
  }

  return issues;
}

export function validateGeneratedArtifactEvidence(
  artifact: SaltGeneratedArtifact,
): SaltEvidenceValidationIssue[] {
  const issues: SaltEvidenceValidationIssue[] = [];
  const refById = new Map<string, SaltEvidenceRef>();
  artifact.evidence_refs.forEach((ref, refIndex) => {
    const existing = refById.get(ref.id);
    if (existing && !saltEvidenceRefsEqual(existing, ref)) {
      issues.push({
        code: "conflicting_evidence_ref",
        message: `Evidence ref id '${ref.id}' is reused for conflicting provenance.`,
        path: `evidence_refs[${refIndex}].id`,
      });
      return;
    }
    if (!existing) {
      refById.set(ref.id, ref);
    }
  });

  artifact.evidence_refs.forEach((ref, index) => {
    issues.push(...validateEvidenceRef(ref, `evidence_refs[${index}]`));
  });

  artifact.claims.forEach((claim, claimIndex) => {
    if (claim.evidence_ref_ids.length === 0) {
      issues.push({
        code: "missing_claim_evidence",
        message: `Generated Salt claim '${claim.id}' must include at least one evidence ref.`,
        path: `claims[${claimIndex}].evidence_ref_ids`,
      });
      return;
    }

    claim.evidence_ref_ids.forEach((refId, refIndex) => {
      const ref = refById.get(refId);
      const path = `claims[${claimIndex}].evidence_ref_ids[${refIndex}]`;

      if (!ref) {
        issues.push({
          code: "unknown_claim_evidence_ref",
          message: `Generated Salt claim '${claim.id}' references unknown evidence ref '${refId}'.`,
          path,
        });
        return;
      }

      const refIssues = validateEvidenceRef(ref, path);
      for (const refIssue of refIssues) {
        issues.push({
          code: "invalid_claim_evidence_ref",
          message: `Generated Salt claim '${claim.id}' references invalid evidence ref '${refId}': ${refIssue.message}`,
          path,
        });
      }
    });

    if (
      claim.evidence_ref_ids.length > 0 &&
      !claim.evidence_ref_ids.some(
        (refId) => refById.get(refId)?.claim_kind === claim.kind,
      )
    ) {
      issues.push({
        code: "missing_matching_claim_evidence_ref",
        message: `Generated Salt claim '${claim.id}' must reference at least one evidence ref with claim_kind '${claim.kind}'.`,
        path: `claims[${claimIndex}].evidence_ref_ids`,
      });
    }
  });

  return issues;
}

import { isSafeAbsoluteHttpsUrl } from "./catalog/catalogHttpsUrl.js";
import { isPortableRepositoryPath } from "./catalog/catalogPortablePath.js";
import { isCanonicalSiteRoute } from "./catalog/catalogSiteRoute.js";
