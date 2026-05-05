import type {
  SaltContextCoverageAudit,
  SaltContextCoverageGap,
  SaltContextCoverageGapKind,
  SaltContextCoverageGapReasonCode,
} from "./contextCoverageAudit.js";

export const SALT_CONTEXT_COVERAGE_GAP_CATALOG_CONTRACT =
  "salt_context_coverage_gap_catalog_v1" as const;

export type SaltContextCoverageGapCatalogResolution =
  | "add_source_backed_docs_or_registry_evidence"
  | "keep_unsupported_until_source_evidence_exists";

export interface SaltContextCoverageGapCatalogCounts {
  total: number;
  component: number;
  pattern: number;
  foundation: number;
}

export interface SaltContextCoverageGapCatalogEntry {
  kind: SaltContextCoverageGapKind;
  id: string;
  name: string;
  missing: string[];
  cause: string;
  cause_codes: SaltContextCoverageGapReasonCode[];
  resolution: SaltContextCoverageGapCatalogResolution;
  record_count: number;
  records: SaltContextCoverageGapCatalogRecord[];
}

export interface SaltContextCoverageGapCatalogRecord {
  id: string;
  name: string;
  missing: string[];
  cause: string;
  cause_code: SaltContextCoverageGapReasonCode;
}

export interface SaltContextCoverageGapCatalog {
  contract: typeof SALT_CONTEXT_COVERAGE_GAP_CATALOG_CONTRACT;
  generated_at: string;
  audit_contract: SaltContextCoverageAudit["contract"];
  audit_generated_at: string;
  audit_status: SaltContextCoverageAudit["status"];
  counts: SaltContextCoverageGapCatalogCounts;
  gaps: SaltContextCoverageGapCatalogEntry[];
}

function uniqueStrings<T extends string>(values: T[]): T[] {
  return [...new Set(values.map((value) => value.trim() as T))].filter(
    (value) => value.length > 0,
  );
}

function inferCauseCodes(
  gap: SaltContextCoverageGap,
): SaltContextCoverageGapReasonCode[] {
  const recordCodes = uniqueStrings(
    gap.records.map((record) => record.reason_code),
  );
  if (recordCodes.length > 0) {
    return recordCodes;
  }

  if (/surface gate/i.test(gap.reason)) {
    return ["evidence_surface_gate_failed"];
  }
  if (/source locator/i.test(gap.reason)) {
    return ["missing_source_locator"];
  }

  return ["missing_optional_evidence"];
}

function inferResolution(
  causeCodes: SaltContextCoverageGapReasonCode[],
): SaltContextCoverageGapCatalogResolution {
  return causeCodes.includes("evidence_surface_gate_failed")
    ? "keep_unsupported_until_source_evidence_exists"
    : "add_source_backed_docs_or_registry_evidence";
}

function buildCatalogEntry(
  gap: SaltContextCoverageGap,
): SaltContextCoverageGapCatalogEntry {
  const causeCodes = inferCauseCodes(gap);

  return {
    kind: gap.kind,
    id: gap.id,
    name: gap.name,
    missing: gap.missing,
    cause: gap.reason,
    cause_codes: causeCodes,
    resolution: inferResolution(causeCodes),
    record_count: gap.records.length,
    records: gap.records.map((record) => ({
      id: record.id,
      name: record.name,
      missing: record.missing,
      cause: record.reason,
      cause_code: record.reason_code,
    })),
  };
}

function countGaps(
  gaps: SaltContextCoverageGapCatalogEntry[],
): SaltContextCoverageGapCatalogCounts {
  return {
    total: gaps.length,
    component: gaps.filter((gap) => gap.kind === "component").length,
    pattern: gaps.filter((gap) => gap.kind === "pattern").length,
    foundation: gaps.filter((gap) => gap.kind === "foundation").length,
  };
}

export function buildContextCoverageGapCatalog(input: {
  audit: SaltContextCoverageAudit;
  generated_at?: string;
}): SaltContextCoverageGapCatalog {
  const gaps = input.audit.docs_registry_gaps.map(buildCatalogEntry);

  return {
    contract: SALT_CONTEXT_COVERAGE_GAP_CATALOG_CONTRACT,
    generated_at: input.generated_at ?? input.audit.generated_at,
    audit_contract: input.audit.contract,
    audit_generated_at: input.audit.generated_at,
    audit_status: input.audit.status,
    counts: countGaps(gaps),
    gaps,
  };
}

function markdownEscape(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function formatList(values: string[]): string {
  return values.length > 0
    ? values.map(markdownEscape).join("<br>")
    : "None";
}

function formatRecords(records: SaltContextCoverageGapCatalogRecord[]): string {
  return records.length > 0
    ? records
        .map(
          (record) =>
            `${markdownEscape(record.id)} (${record.cause_code}: ${formatList(
              record.missing,
            )})`,
        )
        .join("<br>")
    : "None";
}

export function formatContextCoverageGapCatalogMarkdown(
  catalog: SaltContextCoverageGapCatalog,
): string {
  const lines = [
    "# Salt AI Tooling Context Coverage Gap Catalog",
    "",
    "Status: generated from semantic-core context coverage audit",
    "",
    `Generated: ${catalog.generated_at}`,
    "",
    `Audit generated: ${catalog.audit_generated_at}`,
    "",
    `Audit status: ${catalog.audit_status}`,
    "",
    "## Counts",
    "",
    `- Total: ${catalog.counts.total}`,
    `- Component: ${catalog.counts.component}`,
    `- Pattern: ${catalog.counts.pattern}`,
    `- Foundation: ${catalog.counts.foundation}`,
    "",
    "## Gaps",
    "",
    "| Kind | ID | Name | Missing | Cause codes | Resolution | Records |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    ...catalog.gaps.map(
      (gap) =>
        `| ${gap.kind} | ${markdownEscape(gap.id)} | ${markdownEscape(
          gap.name,
        )} | ${formatList(
          gap.missing,
        )} | ${formatList(gap.cause_codes)} | ${gap.resolution} | ${formatRecords(
          gap.records,
        )} |`,
    ),
    "",
  ];

  return `${lines.join("\n")}\n`;
}
