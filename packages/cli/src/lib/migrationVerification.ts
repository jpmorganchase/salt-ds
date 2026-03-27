import fs from "node:fs/promises";
import path from "node:path";
import type { RuntimeInspectResult } from "@salt-ds/runtime-inspector-core";
import type { LintCommandResult } from "../types.js";

export interface MigrationVerificationContract {
  sourceChecks: string[];
  runtimeChecks: string[];
  preserveChecks: string[];
  confirmationChecks: string[];
  suggestedWorkflow: string;
  suggestedCommand: string;
}

export interface LoadedMigrationVerificationContract {
  reportPath: string;
  contract: MigrationVerificationContract;
}

export interface MigrationVerificationCheck {
  check: string;
  status: "verified" | "manual_review" | "not_checked";
  evidence: string[];
}

export interface MigrationVerificationSummary {
  reportPath: string;
  runtimeCompared: boolean;
  sourceChecks: MigrationVerificationCheck[];
  runtimeChecks: MigrationVerificationCheck[];
  preserveChecks: MigrationVerificationCheck[];
  confirmationChecks: MigrationVerificationCheck[];
  summary: {
    verified: number;
    manualReview: number;
    notChecked: number;
  };
  nextStep: string;
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter(
        (entry): entry is string =>
          typeof entry === "string" && entry.trim().length > 0,
      )
    : [];
}

function includesKeyword(haystacks: string[], keywords: string[]): string[] {
  const loweredKeywords = keywords.map((keyword) => keyword.toLowerCase());
  return haystacks.filter((entry) => {
    const lowered = entry.toLowerCase();
    return loweredKeywords.some((keyword) => lowered.includes(keyword));
  });
}

function summarizeRuntime(runtimeResult: RuntimeInspectResult): string[] {
  return [
    runtimeResult.page.title,
    ...runtimeResult.accessibility.landmarks.map(
      (entry) => `${entry.role}:${entry.name}`,
    ),
    ...runtimeResult.accessibility.roles.map(
      (entry) => `${entry.role}:${entry.name}`,
    ),
    ...runtimeResult.structure.summary,
    ...runtimeResult.layout.hints,
  ];
}

function evaluatePreserveOrRuntimeCheck(
  check: string,
  runtimeResult: RuntimeInspectResult | null,
): MigrationVerificationCheck {
  if (!runtimeResult) {
    return {
      check,
      status: "not_checked",
      evidence: [],
    };
  }

  const runtimeSummary = summarizeRuntime(runtimeResult);
  const loweredCheck = check.toLowerCase();

  if (
    loweredCheck.includes("task flow") ||
    loweredCheck.includes("critical state") ||
    loweredCheck.includes("workflow")
  ) {
    return {
      check,
      status: "manual_review",
      evidence: [
        "This check still needs product or repo judgment even after runtime evidence is available.",
      ],
    };
  }

  const landmarkMatches =
    loweredCheck.includes("landmark") ||
    loweredCheck.includes("navigation") ||
    loweredCheck.includes("main") ||
    loweredCheck.includes("dialog") ||
    loweredCheck.includes("toolbar")
      ? includesKeyword(runtimeSummary, [
          "navigation",
          "main",
          "dialog",
          "toolbar",
          "header",
          "footer",
        ])
      : [];
  if (landmarkMatches.length > 0) {
    return {
      check,
      status: "verified",
      evidence: landmarkMatches.slice(0, 3),
    };
  }

  const actionMatches =
    loweredCheck.includes("action") ||
    loweredCheck.includes("button") ||
    loweredCheck.includes("link")
      ? includesKeyword(runtimeSummary, ["button", "link", "navigation"])
      : [];
  if (actionMatches.length > 0) {
    return {
      check,
      status: "verified",
      evidence: actionMatches.slice(0, 3),
    };
  }

  if (
    loweredCheck.includes("state") ||
    loweredCheck.includes("loading") ||
    loweredCheck.includes("error") ||
    loweredCheck.includes("empty")
  ) {
    return {
      check,
      status: "manual_review",
      evidence: [
        "Runtime evidence is available, but state visibility still needs explicit human confirmation.",
      ],
    };
  }

  return {
    check,
    status: "manual_review",
    evidence: [
      "Runtime evidence is available, but this migration contract item still needs manual review.",
    ],
  };
}

function evaluateSourceCheck(
  check: string,
  sourceValidation: LintCommandResult,
): MigrationVerificationCheck {
  const filesNeedingAttention = sourceValidation.summary.filesNeedingAttention;
  return {
    check,
    status: filesNeedingAttention === 0 ? "verified" : "manual_review",
    evidence:
      filesNeedingAttention === 0
        ? ["Source validation is clean for the reviewed targets."]
        : [
            `${filesNeedingAttention} file${filesNeedingAttention === 1 ? "" : "s"} still need source review attention.`,
          ],
  };
}

function evaluateConfirmationCheck(
  check: string,
  runtimeResult: RuntimeInspectResult | null,
): MigrationVerificationCheck {
  return {
    check,
    status: runtimeResult ? "manual_review" : "not_checked",
    evidence: runtimeResult
      ? [
          "Confirmation-required migration changes still need explicit approval even after runtime evidence is available.",
        ]
      : [],
  };
}

export async function loadMigrationVerificationContract(
  cwd: string,
  reportPathFlag: string | undefined,
): Promise<LoadedMigrationVerificationContract | null> {
  if (!reportPathFlag) {
    return null;
  }

  const reportPath = path.resolve(cwd, reportPathFlag);
  const raw = JSON.parse(await fs.readFile(reportPath, "utf8")) as {
    postMigrationVerification?: unknown;
  };
  const contractValue = raw.postMigrationVerification;
  if (!contractValue || typeof contractValue !== "object") {
    throw new Error(
      "The migration report does not contain postMigrationVerification.",
    );
  }

  const contractRecord = contractValue as Record<string, unknown>;
  return {
    reportPath: reportPath.split(path.sep).join("/"),
    contract: {
      sourceChecks: toStringArray(contractRecord.sourceChecks),
      runtimeChecks: toStringArray(contractRecord.runtimeChecks),
      preserveChecks: toStringArray(contractRecord.preserveChecks),
      confirmationChecks: toStringArray(contractRecord.confirmationChecks),
      suggestedWorkflow:
        typeof contractRecord.suggestedWorkflow === "string"
          ? contractRecord.suggestedWorkflow
          : "review",
      suggestedCommand:
        typeof contractRecord.suggestedCommand === "string"
          ? contractRecord.suggestedCommand
          : "salt-ds review <changed-path>",
    },
  };
}

export function assessMigrationVerification(input: {
  loadedContract: LoadedMigrationVerificationContract;
  sourceValidation: LintCommandResult;
  runtimeResult: RuntimeInspectResult | null;
}): MigrationVerificationSummary {
  const { loadedContract, sourceValidation, runtimeResult } = input;
  const sourceChecks = loadedContract.contract.sourceChecks.map((check) =>
    evaluateSourceCheck(check, sourceValidation),
  );
  const runtimeChecks = loadedContract.contract.runtimeChecks.map((check) =>
    evaluatePreserveOrRuntimeCheck(check, runtimeResult),
  );
  const preserveChecks = loadedContract.contract.preserveChecks.map((check) =>
    evaluatePreserveOrRuntimeCheck(check, runtimeResult),
  );
  const confirmationChecks = loadedContract.contract.confirmationChecks.map(
    (check) => evaluateConfirmationCheck(check, runtimeResult),
  );

  const allChecks = [
    ...sourceChecks,
    ...runtimeChecks,
    ...preserveChecks,
    ...confirmationChecks,
  ];
  const summary = {
    verified: allChecks.filter((check) => check.status === "verified").length,
    manualReview: allChecks.filter((check) => check.status === "manual_review")
      .length,
    notChecked: allChecks.filter((check) => check.status === "not_checked")
      .length,
  };

  return {
    reportPath: loadedContract.reportPath,
    runtimeCompared: Boolean(runtimeResult),
    sourceChecks,
    runtimeChecks,
    preserveChecks,
    confirmationChecks,
    summary,
    nextStep:
      summary.notChecked > 0
        ? "Add --url to compare the migrated result against the migration contract with runtime evidence."
        : summary.manualReview > 0
          ? "Review the migration verification items that still need explicit confirmation."
          : "The migrated result satisfies the current verification contract.",
  };
}
