import {
  applyProjectPolicyToStarterCodeSnippets,
  buildCreatePublicContract,
  buildCreateSaltUiWorkflowContract,
  buildMigratePublicContract,
  buildMigrateToSaltWorkflowContract,
  buildReviewPublicContract,
  buildReviewSaltUiWorkflowContract,
  type CreateSaltUiResult,
  type MigrateToSaltResult,
  type NormalizedVisualEvidenceInput,
  type ReviewExpectedTargets,
  type ReviewSaltUiResult,
  type SaltRegistry,
  type SourceUiOutlineInput,
  type WorkflowProjectPolicyArtifact,
} from "../core/runtime.js";

function buildCreateWorkflowEnvelope(
  registry: SaltRegistry,
  result: CreateSaltUiResult,
  input: {
    query?: string;
    package?: string;
    context_checked?: boolean;
    context_retry_with_root_dir?: string | null;
    root_dir?: string;
    project_policy?: WorkflowProjectPolicyArtifact | null;
    resolved_entities?: string[];
  } = {},
) {
  const starter_code = applyProjectPolicyToStarterCodeSnippets(
    result.starter_code,
    input.project_policy,
  );
  const contract = buildCreateSaltUiWorkflowContract(registry, result, {
    ...input,
    starter_code,
  });

  return buildCreatePublicContract(result, contract, {
    registry,
    query: input.query,
    package: input.package,
    resolved_entities: input.resolved_entities,
    root_dir: input.root_dir,
    starter_code,
  });
}

function buildReviewWorkflowEnvelope(
  registry: SaltRegistry,
  result: ReviewSaltUiResult,
  input: {
    code?: string;
    expected_targets?: ReviewExpectedTargets;
    project_policy?: WorkflowProjectPolicyArtifact | null;
    root_dir?: string | null;
    context_checked?: boolean;
  } = {},
) {
  const contract = buildReviewSaltUiWorkflowContract(result, {
    code: input.code,
    expected_targets: input.expected_targets,
    project_policy: input.project_policy,
  });
  return buildReviewPublicContract(result, contract, {
    registry,
    root_dir: input.root_dir ?? undefined,
    context_checked: input.context_checked,
  });
}

function buildMigrateWorkflowEnvelope(
  registry: SaltRegistry,
  result: MigrateToSaltResult,
  input: {
    source_outline?: SourceUiOutlineInput;
    visual_evidence?: NormalizedVisualEvidenceInput[];
    context_checked?: boolean;
    context_retry_with_root_dir?: string | null;
    project_policy?: WorkflowProjectPolicyArtifact | null;
  } = {},
) {
  const starter_code = applyProjectPolicyToStarterCodeSnippets(
    result.starter_code,
    input.project_policy,
  );
  const combined_scaffold = applyProjectPolicyToStarterCodeSnippets(
    result.combined_scaffold,
    input.project_policy,
  );
  // `include_starter_code: false` is represented by an absent domain starter
  // payload even though the translation engine can still build an internal
  // combined scaffold. Keep that opt-out authoritative at the public boundary.
  // Otherwise validate and advertise the same policy-transformed payload.
  const public_starter_code =
    result.starter_code === undefined
      ? []
      : (((combined_scaffold?.length ?? 0) > 0
          ? combined_scaffold
          : starter_code
        )?.map((snippet) =>
          snippet.language === "tsx" &&
          !snippet.label.toLowerCase().includes("starter")
            ? { ...snippet, label: `${snippet.label} starter` }
            : snippet,
        ) ?? []);
  const contract = buildMigrateToSaltWorkflowContract(registry, result, {
    ...input,
    starter_code: public_starter_code,
  });
  return buildMigratePublicContract(result, contract, {
    starter_code: public_starter_code,
  });
}

export function withChooseWorkflowGuidance(
  registry: SaltRegistry,
  result: CreateSaltUiResult,
  input: {
    query?: string;
    package?: string;
    context_checked?: boolean;
    context_retry_with_root_dir?: string | null;
    root_dir?: string;
    project_policy?: WorkflowProjectPolicyArtifact | null;
    resolved_entities?: string[];
  } = {},
) {
  return buildCreateWorkflowEnvelope(registry, result, input);
}

export function withAnalyzeWorkflowGuidance(
  registry: SaltRegistry,
  result: ReviewSaltUiResult,
  input: {
    code?: string;
    expected_targets?: ReviewExpectedTargets;
    project_policy?: WorkflowProjectPolicyArtifact | null;
    root_dir?: string | null;
    context_checked?: boolean;
  } = {},
) {
  return buildReviewWorkflowEnvelope(registry, result, input);
}

export function withTranslateWorkflowGuidance(
  registry: SaltRegistry,
  result: MigrateToSaltResult,
  input: {
    source_outline?: SourceUiOutlineInput;
    visual_evidence?: NormalizedVisualEvidenceInput[];
    context_checked?: boolean;
    context_retry_with_root_dir?: string | null;
    project_policy?: WorkflowProjectPolicyArtifact | null;
  } = {},
) {
  return buildMigrateWorkflowEnvelope(registry, result, input);
}
