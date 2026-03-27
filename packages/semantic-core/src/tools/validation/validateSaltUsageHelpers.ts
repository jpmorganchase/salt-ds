import semver from "semver";
import type { DeprecationRecord, SaltRegistry } from "../../types.js";
import { normalizeVersion } from "../codeAnalysisCommon.js";
import { unique } from "../utils.js";
import {
  getValidationIssueCanonicalSource,
  getValidationIssueSourceUrls,
} from "./issueCatalog.js";
import type { ValidationIssue, ValidationSeverity } from "./shared.js";

export interface ValidationSummary {
  errors: number;
  warnings: number;
  infos: number;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

export function buildEvidence(summary: string, matches: number): string[] {
  return [`${summary} (${matches} match${matches === 1 ? "" : "es"}).`];
}

export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function deprecationSeverity(
  deprecation: DeprecationRecord,
  version: { normalized: string | null },
): ValidationSeverity {
  if (!version.normalized) {
    return "warning";
  }

  const removedIn = normalizeVersion(deprecation.removed_in);
  if (removedIn && semver.gte(version.normalized, removedIn)) {
    return "error";
  }

  return "warning";
}

export function componentDocUrls(
  registry: SaltRegistry,
  name: string,
  preferred: Array<"overview" | "usage" | "accessibility" | "examples">,
): string[] {
  const component = registry.components.find((item) => item.name === name);
  if (!component) {
    return [];
  }

  const urls = preferred
    .map((key) => component.related_docs[key])
    .filter((url): url is string => Boolean(url));

  return unique(urls);
}

function prependCanonicalSource(
  canonicalSource: string | null,
  sources: string[],
): string[] {
  return canonicalSource
    ? unique([canonicalSource, ...sources])
    : unique(sources);
}

export function buildValidationIssueSources(
  registry: SaltRegistry,
  issueId: string,
  additionalSources: string[] = [],
): {
  canonical_source: string | null;
  source_urls: string[];
} {
  const canonicalSource = getValidationIssueCanonicalSource(registry, issueId);
  const sourceUrls = getValidationIssueSourceUrls(registry, issueId);

  return {
    canonical_source: canonicalSource,
    source_urls: prependCanonicalSource(canonicalSource, [
      ...sourceUrls,
      ...additionalSources,
    ]),
  };
}

export function buildDeprecationFix(
  deprecation: DeprecationRecord,
): string | null {
  const [firstMigration] = deprecation.migration.details;
  if (firstMigration) {
    return `Replace ${firstMigration.from} with ${firstMigration.to}.`;
  }

  if (deprecation.replacement.name) {
    const replacementType = deprecation.replacement.type
      ? `${deprecation.replacement.type} `
      : "";
    return `Use ${replacementType}${deprecation.replacement.name}.`;
  }

  if (deprecation.replacement.notes) {
    return deprecation.replacement.notes;
  }

  return null;
}

function severityRank(severity: ValidationSeverity): number {
  if (severity === "error") {
    return 0;
  }
  if (severity === "warning") {
    return 1;
  }
  return 2;
}

export function createIssueCollector(): {
  issueMap: Map<string, ValidationIssue>;
  addIssue: (issue: ValidationIssue) => void;
} {
  const issueMap = new Map<string, ValidationIssue>();

  const addIssue = (issue: ValidationIssue): void => {
    const existing = issueMap.get(issue.id);
    if (existing) {
      existing.matches += issue.matches;
      existing.confidence = Math.max(existing.confidence, issue.confidence);
      existing.evidence = unique([...existing.evidence, ...issue.evidence]);
      existing.source_urls = unique([
        ...existing.source_urls,
        ...issue.source_urls,
      ]);
      if (!existing.canonical_source && issue.canonical_source) {
        existing.canonical_source = issue.canonical_source;
      }
      if (!existing.suggested_fix && issue.suggested_fix) {
        existing.suggested_fix = issue.suggested_fix;
      }
      return;
    }
    issueMap.set(issue.id, issue);
  };

  return { issueMap, addIssue };
}

export function sortValidationIssues(
  issues: ValidationIssue[],
): ValidationIssue[] {
  return [...issues].sort((left, right) => {
    const severityDelta =
      severityRank(left.severity) - severityRank(right.severity);
    if (severityDelta !== 0) {
      return severityDelta;
    }
    if (left.matches !== right.matches) {
      return right.matches - left.matches;
    }
    return right.confidence - left.confidence;
  });
}

export function summarizeValidationIssues(
  issues: ValidationIssue[],
): ValidationSummary {
  return issues.reduce(
    (accumulator, issue) => {
      if (issue.severity === "error") {
        accumulator.errors += 1;
      } else if (issue.severity === "warning") {
        accumulator.warnings += 1;
      } else {
        accumulator.infos += 1;
      }
      return accumulator;
    },
    { errors: 0, warnings: 0, infos: 0 },
  );
}

export function finalizeValidationIssues(
  issueMap: Map<string, ValidationIssue>,
  maxIssues: number,
): {
  summary: ValidationSummary;
  issues: ValidationIssue[];
} {
  const sortedIssues = sortValidationIssues([...issueMap.values()]);
  return {
    summary: summarizeValidationIssues(sortedIssues),
    issues: sortedIssues.slice(0, maxIssues),
  };
}
