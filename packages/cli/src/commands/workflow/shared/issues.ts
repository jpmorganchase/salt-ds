import { isWorkflowExpectedReviewIssueId } from "@salt-ds/semantic-core/tools/reviewSaltUi";
import type { ValidationSeverity } from "@salt-ds/semantic-core/validation/shared";

export function uniqueStrings(values: string[]): string[] {
  return [...new Set(values)];
}

export function readStringRecordValue(
  record: Record<string, unknown>,
  key: string,
): string | null {
  const value = record[key];
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

export function readStringArrayRecordValue(
  record: Record<string, unknown>,
  key: string,
): string[] {
  const value = record[key];
  return Array.isArray(value)
    ? value.filter(
        (entry): entry is string =>
          typeof entry === "string" && entry.trim().length > 0,
      )
    : [];
}

export function dedupeIssueRecords(
  issues: Array<Record<string, unknown>>,
): Array<Record<string, unknown>> {
  const issueMap = new Map<string, Record<string, unknown>>();

  for (const issue of issues) {
    const id =
      readStringRecordValue(issue, "id") ??
      `${readStringRecordValue(issue, "rule") ?? "issue"}:${readStringRecordValue(issue, "title") ?? "unknown"}`;
    if (!issueMap.has(id)) {
      issueMap.set(id, issue);
    }
  }

  return [...issueMap.values()];
}

export function sortIssueRecords(
  issues: Array<Record<string, unknown>>,
): Array<Record<string, unknown>> {
  const severityRank = (severity: ValidationSeverity | null): number => {
    if (severity === "error") {
      return 0;
    }
    if (severity === "warning") {
      return 1;
    }
    return 2;
  };

  return [...issues].sort((left, right) => {
    const leftSeverity = readStringRecordValue(
      left,
      "severity",
    ) as ValidationSeverity | null;
    const rightSeverity = readStringRecordValue(
      right,
      "severity",
    ) as ValidationSeverity | null;
    const severityDelta =
      severityRank(leftSeverity) - severityRank(rightSeverity);
    if (severityDelta !== 0) {
      return severityDelta;
    }

    const leftMatches = Number(left.matches ?? 0);
    const rightMatches = Number(right.matches ?? 0);
    if (leftMatches !== rightMatches) {
      return rightMatches - leftMatches;
    }

    return Number(right.confidence ?? 0) - Number(left.confidence ?? 0);
  });
}

export function summarizeIssueRecords(issues: Array<Record<string, unknown>>): {
  errors: number;
  warnings: number;
  infos: number;
} {
  return issues.reduce<{
    errors: number;
    warnings: number;
    infos: number;
  }>(
    (summary, issue) => {
      const severity = readStringRecordValue(issue, "severity");
      if (severity === "error") {
        summary.errors += 1;
      } else if (severity === "warning") {
        summary.warnings += 1;
      } else {
        summary.infos += 1;
      }
      return summary;
    },
    { errors: 0, warnings: 0, infos: 0 },
  );
}

export function extractWorkflowExpectedIssues(
  issues: Array<Record<string, unknown>> | undefined,
): Array<Record<string, unknown>> {
  return (issues ?? []).filter((issue) => {
    const id = readStringRecordValue(issue, "id");
    return id ? isWorkflowExpectedReviewIssueId(id) : false;
  });
}
