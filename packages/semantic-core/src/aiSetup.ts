import type { SaltGeneratedContextHealth } from "./contextChecks.js";

export const SALT_AI_SETUP_CONTRACT = "salt_ai_setup_v1" as const;

export type SaltAiSetupStatus = "ready" | "degraded";
export type SaltAiSetupStepStatus =
  | "current"
  | "action_required"
  | "unsupported";
type SaltAiSetupCompatibilityStatus =
  | "compatible"
  | "degraded"
  | "unsupported";

export interface SaltAiSetupStep {
  id:
    | "repo-policy"
    | "repo-instructions"
    | "host-adapters"
    | "ui-verify"
    | "generated-context"
    | "release-gate"
    | "doctor";
  status: SaltAiSetupStepStatus;
  summary: string;
  command: string | null;
  evidence_source:
    | "project_policy"
    | "generated_context"
    | "workflow_input"
    | "runtime_check";
  missing: string[];
}

interface SaltAiSetupCompatibilityCheck {
  id: SaltAiSetupStep["id"];
  status: SaltAiSetupCompatibilityStatus;
  evidence_source: SaltAiSetupStep["evidence_source"];
  missing: string[];
}

export interface SaltAiSetupCompatibilityMatrix {
  status: "compatible" | "degraded";
  checks: SaltAiSetupCompatibilityCheck[];
}

export interface SaltAiSetupSummary {
  contract: typeof SALT_AI_SETUP_CONTRACT;
  status: SaltAiSetupStatus;
  root_dir: string;
  next_command: string;
  compatibility: SaltAiSetupCompatibilityMatrix;
  steps: SaltAiSetupStep[];
}

export interface BuildSaltAiSetupSummaryInput {
  root_dir: string;
  policy_mode?: "team" | "stack" | "none" | string | null;
  repo_instructions_path?: string | null;
  host_adapters?: string[];
  ui_verify_command?: string | null;
  generated_context?: SaltGeneratedContextHealth | null;
  include_release_gate?: boolean;
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()))].filter(
    (value) => value.length > 0,
  );
}

function generatedContextStep(
  generatedContext: SaltGeneratedContextHealth | null | undefined,
): SaltAiSetupStep {
  if (!generatedContext) {
    return {
      id: "generated-context",
      status: "action_required",
      summary: "Generated context has not been checked",
      command: "salt-ds export-context . --manifest --json",
      evidence_source: "generated_context",
      missing: ["generated context health check"],
    };
  }

  if (generatedContext.status === "current") {
    return {
      id: "generated-context",
      status: "current",
      summary: "Generated context manifest is current",
      command: null,
      evidence_source: "generated_context",
      missing: [],
    };
  }

  return {
    id: "generated-context",
    status:
      generatedContext.status === "unsupported"
        ? "unsupported"
        : "action_required",
    summary: `Generated context is ${generatedContext.status}`,
    command:
      generatedContext.status === "missing" ||
      generatedContext.status === "stale"
        ? "salt-ds export-context . --manifest --json"
        : "salt-ds export-context . --manifest --check --json",
    evidence_source: "generated_context",
    missing: uniqueStrings([
      ...generatedContext.missingOutputs,
      ...generatedContext.coverageGaps.flatMap((gap) => gap.missing),
      ...(generatedContext.recommendedAction === "none"
        ? []
        : [generatedContext.recommendedAction]),
    ]),
  };
}

function releaseGateStep(
  generatedContext: SaltGeneratedContextHealth | null | undefined,
): SaltAiSetupStep {
  if (!generatedContext?.present) {
    return {
      id: "release-gate",
      status: "action_required",
      summary: "Generated context release gate is waiting for a manifest",
      command:
        "salt-ds export-context . --release-gate .salt/context/manifest.json --json",
      evidence_source: "generated_context",
      missing: ["generated context manifest"],
    };
  }

  return {
    id: "release-gate",
    status:
      generatedContext.status === "current" ? "current" : "action_required",
    summary: "Generated context release gate can validate the manifest",
    command:
      "salt-ds export-context . --release-gate .salt/context/manifest.json --json",
    evidence_source: "generated_context",
    missing:
      generatedContext.status === "current"
        ? []
        : ["current generated context manifest"],
  };
}

function buildCompatibilityMatrix(
  steps: SaltAiSetupStep[],
): SaltAiSetupCompatibilityMatrix {
  const checks = steps.map((step): SaltAiSetupCompatibilityCheck => {
    const status: SaltAiSetupCompatibilityStatus =
      step.status === "current"
        ? "compatible"
        : step.status === "unsupported"
          ? "unsupported"
          : "degraded";

    return {
      id: step.id,
      status,
      evidence_source: step.evidence_source,
      missing: step.missing,
    };
  });

  return {
    status: checks.every((check) => check.status === "compatible")
      ? "compatible"
      : "degraded",
    checks,
  };
}

export function buildSaltAiSetupSummary(
  input: BuildSaltAiSetupSummaryInput,
): SaltAiSetupSummary {
  const steps: SaltAiSetupStep[] = [
    {
      id: "repo-policy",
      status:
        input.policy_mode === "team" || input.policy_mode === "stack"
          ? "current"
          : "action_required",
      summary:
        input.policy_mode === "team" || input.policy_mode === "stack"
          ? "Repo policy is configured"
          : "Repo policy has not been configured",
      command: "salt-ds init . --ai --json",
      evidence_source: "project_policy",
      missing:
        input.policy_mode === "team" || input.policy_mode === "stack"
          ? []
          : [".salt policy"],
    },
    {
      id: "repo-instructions",
      status: input.repo_instructions_path ? "current" : "action_required",
      summary: input.repo_instructions_path
        ? "Repo instructions are configured"
        : "Repo instructions have not been configured",
      command: "salt-ds init . --ai --json",
      evidence_source: "workflow_input",
      missing: input.repo_instructions_path ? [] : ["repo instruction file"],
    },
    {
      id: "host-adapters",
      status:
        (input.host_adapters?.length ?? 0) > 0 ? "current" : "action_required",
      summary:
        (input.host_adapters?.length ?? 0) > 0
          ? "Requested host adapters are configured"
          : "No host adapters were requested",
      command: "salt-ds init . --ai --json",
      evidence_source: "workflow_input",
      missing:
        (input.host_adapters?.length ?? 0) > 0 ? [] : ["host adapter request"],
    },
    {
      id: "ui-verify",
      status: input.ui_verify_command ? "current" : "action_required",
      summary: input.ui_verify_command
        ? "UI verification command is configured"
        : "UI verification command has not been configured",
      command: "salt-ds init . --ai --json",
      evidence_source: "workflow_input",
      missing: input.ui_verify_command ? [] : ["ui:verify script"],
    },
    generatedContextStep(input.generated_context),
    ...(input.include_release_gate
      ? [releaseGateStep(input.generated_context)]
      : []),
    {
      id: "doctor",
      status: "current",
      summary: "Doctor can verify local setup without network access",
      command: "salt-ds doctor . --ai --json",
      evidence_source: "runtime_check",
      missing: [],
    },
  ];
  const compatibility = buildCompatibilityMatrix(steps);
  const firstAction = steps.find((step) => step.status !== "current");

  return {
    contract: SALT_AI_SETUP_CONTRACT,
    status: compatibility.status === "compatible" ? "ready" : "degraded",
    root_dir: input.root_dir,
    next_command:
      firstAction?.command ??
      'create_salt_ui via the @salt-ds/mcp server (args: { query: "describe the Salt UI task" })',
    compatibility,
    steps,
  };
}
