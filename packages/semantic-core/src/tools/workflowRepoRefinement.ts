import type {
  WorkflowProjectPolicyArtifact,
  WorkflowProjectPolicyImportReference,
  WorkflowProjectPolicyWrapperDetail,
} from "./workflowProjectPolicy.js";

export interface WorkflowRepoRefinementArtifact {
  status: "canonical_only" | "refined_by_project_policy";
  canonical_name: string | null;
  final_name: string | null;
  source: "canonical_salt" | "project_policy";
  reason: string;
  wrapper: WorkflowProjectPolicyWrapperDetail | null;
  source_urls: string[];
}

export interface ProjectConventionRepoRefinementInput {
  canonical_name: string | null;
  final_name: string | null;
  reason: string | null;
  import_reference: WorkflowProjectPolicyImportReference | null;
  source_urls: string[];
}

function unique(values: Array<string | null | undefined>): string[] {
  return [
    ...new Set(values.filter((value): value is string => Boolean(value))),
  ];
}

function findApprovedWrapper(
  projectPolicy: WorkflowProjectPolicyArtifact,
  canonicalName: string,
): WorkflowProjectPolicyWrapperDetail | null {
  const normalizedCanonicalName = canonicalName.trim().toLowerCase();

  return (
    projectPolicy.approvedWrapperDetails.find(
      (entry) => entry.wraps.trim().toLowerCase() === normalizedCanonicalName,
    ) ?? null
  );
}

export function buildCreateRepoRefinementArtifact(input: {
  canonical_name: string | null;
  project_policy?: WorkflowProjectPolicyArtifact | null;
}): WorkflowRepoRefinementArtifact | null {
  if (!input.project_policy) {
    return null;
  }

  const canonicalName = input.canonical_name?.trim() || null;
  if (!canonicalName) {
    return {
      status: "canonical_only",
      canonical_name: null,
      final_name: null,
      source: "canonical_salt",
      reason:
        "No canonical Salt decision was resolved, so repo policy could not refine the final answer.",
      wrapper: null,
      source_urls: [...input.project_policy.sourceUrls],
    };
  }

  const wrapper = findApprovedWrapper(input.project_policy, canonicalName);
  if (!wrapper) {
    return {
      status: "canonical_only",
      canonical_name: canonicalName,
      final_name: canonicalName,
      source: "canonical_salt",
      reason:
        "Repo policy was checked, but no approved wrapper matched the canonical Salt choice.",
      wrapper: null,
      source_urls: [...input.project_policy.sourceUrls],
    };
  }

  if (!wrapper.import) {
    return {
      status: "canonical_only",
      canonical_name: canonicalName,
      final_name: canonicalName,
      source: "canonical_salt",
      reason: `Repo policy prefers ${wrapper.name}, but no import metadata is declared, so the actionable workflow result stays on canonical Salt.`,
      wrapper,
      source_urls: unique([
        ...wrapper.sourceUrls,
        ...input.project_policy.sourceUrls,
      ]),
    };
  }

  return {
    status: "refined_by_project_policy",
    canonical_name: canonicalName,
    final_name: wrapper.name,
    source: "project_policy",
    reason: wrapper.reason,
    wrapper,
    source_urls: unique([
      ...wrapper.sourceUrls,
      ...input.project_policy.sourceUrls,
    ]),
  };
}

export function buildProjectConventionRepoRefinementArtifact(
  input: ProjectConventionRepoRefinementInput,
): WorkflowRepoRefinementArtifact | null {
  const canonicalName = input.canonical_name?.trim() || null;
  if (!canonicalName) {
    return null;
  }

  const finalName = input.final_name?.trim() || null;
  if (!finalName || finalName === canonicalName) {
    return {
      status: "canonical_only",
      canonical_name: canonicalName,
      final_name: canonicalName,
      source: "canonical_salt",
      reason:
        input.reason ??
        "Project conventions were checked but did not change the actionable workflow result.",
      wrapper: null,
      source_urls: [...input.source_urls],
    };
  }

  if (!input.import_reference) {
    return {
      status: "canonical_only",
      canonical_name: canonicalName,
      final_name: canonicalName,
      source: "canonical_salt",
      reason: input.reason
        ? `${input.reason} The repo-specific replacement was not applied because no import metadata was declared.`
        : "Project conventions prefer a repo-specific replacement, but no import metadata was declared, so the actionable workflow result stays on canonical Salt.",
      wrapper: null,
      source_urls: [...input.source_urls],
    };
  }

  return {
    status: "refined_by_project_policy",
    canonical_name: canonicalName,
    final_name: finalName,
    source: "project_policy",
    reason: input.reason ?? "Project conventions refine the final repo answer.",
    wrapper: null,
    source_urls: [...input.source_urls],
  };
}
