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
  | "project_policy"
  | "workflow_input"
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
  | "status"
  | "workflow"
  | "project_policy";

export type SaltEvidenceConfidence = "high" | "medium" | "low";

export type SaltEvidenceRegistryEntityType =
  | "component"
  | "pattern"
  | "guide"
  | "token"
  | "example"
  | "package"
  | "page"
  | "deprecation"
  | "change";

export interface SaltEvidenceRegistryRef {
  entity_type: SaltEvidenceRegistryEntityType;
  entity_id: string;
  entity_name?: string | null;
  field_path?: string | null;
  registry_version?: string | null;
  registry_hash?: string | null;
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

export interface SaltEvidenceProjectPolicyRef {
  path: string;
  layer?: string | null;
  field_path?: string | null;
}

export interface SaltEvidenceWorkflowInputRef {
  field_path: string;
  captured_at?: string | null;
}

export interface SaltEvidenceRef {
  contract: typeof SALT_EVIDENCE_REF_CONTRACT;
  id: string;
  source_kind: SaltEvidenceSourceKind;
  claim_kind: SaltEvidenceClaimKind;
  registry?: SaltEvidenceRegistryRef | null;
  source?: SaltEvidenceSourceRef | null;
  package?: SaltEvidencePackageRef | null;
  project_policy?: SaltEvidenceProjectPolicyRef | null;
  workflow_input?: SaltEvidenceWorkflowInputRef | null;
  confidence: SaltEvidenceConfidence;
  verified_at?: string | null;
  note?: string | null;
}

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
  generated_at: string;
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
  | "missing_registry_field_path"
  | "missing_registry_field"
  | "missing_source_locator"
  | "missing_project_policy_locator"
  | "missing_workflow_input_locator"
  | "missing_runtime_locator"
  | "missing_package_locator"
  | "stale_registry"
  | "missing_claim_evidence"
  | "unknown_claim_evidence_ref"
  | "missing_matching_claim_evidence_ref"
  | "invalid_claim_evidence_ref"
  | "missing_structural_role_rule_evidence";

export interface SaltEvidenceValidationIssue {
  code: SaltEvidenceValidationIssueCode;
  message: string;
  path: string;
}

function hasText(value: string | null | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

export function validateEvidenceRef(
  ref: SaltEvidenceRef,
  path: string,
): SaltEvidenceValidationIssue[] {
  const issues: SaltEvidenceValidationIssue[] = [];

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
    !hasText(ref.source?.url) &&
    !hasText(ref.source?.repo_path)
  ) {
    issues.push({
      code: "missing_source_locator",
      message: `Source-backed evidence ref '${ref.id}' must include source.url or source.repo_path.`,
      path: `${path}.source`,
    });
  }

  if (
    ref.source_kind === "project_policy" &&
    !hasText(ref.project_policy?.path)
  ) {
    issues.push({
      code: "missing_project_policy_locator",
      message: `Project policy evidence ref '${ref.id}' must include project_policy.path.`,
      path: `${path}.project_policy.path`,
    });
  }

  if (
    ref.source_kind === "workflow_input" &&
    !hasText(ref.workflow_input?.field_path)
  ) {
    issues.push({
      code: "missing_workflow_input_locator",
      message: `Workflow input evidence ref '${ref.id}' must include workflow_input.field_path.`,
      path: `${path}.workflow_input.field_path`,
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
  const refById = new Map(
    artifact.evidence_refs.map((ref) => [ref.id, ref] as const),
  );

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
