import type { CanonicalScanFinding, SaltScanResult } from "../scan/result.js";

function sarifLevel(severity: CanonicalScanFinding["severity"]) {
  return severity === "error"
    ? "error"
    : severity === "warning"
      ? "warning"
      : "note";
}

function characterColumn(
  source: string,
  line: number,
  byteColumn: number,
): number {
  const textLine = source.replaceAll("\r\n", "\n").split("\n")[line - 1] ?? "";
  const prefix = Buffer.from(textLine, "utf8")
    .subarray(0, Math.max(0, byteColumn - 1))
    .toString("utf8");
  return prefix.length + 1;
}

export function renderSarif(
  result: SaltScanResult,
  sourceByPath: ReadonlyMap<string, string>,
): string {
  const rules = [
    ...new Map(
      result.findings.map((finding) => [
        finding.rule_id,
        {
          id: finding.rule_id,
          shortDescription: { text: finding.rule_description },
          fullDescription: { text: finding.rule_description },
          help: {
            text:
              finding.remediation ?? "Review the cited official Salt evidence.",
          },
          properties: {
            acceptanceCriterion: finding.acceptance_criterion,
            evidenceReferences: finding.evidence.references,
          },
        },
      ]),
    ).values(),
  ].sort((left, right) => left.id.localeCompare(right.id));
  const results = result.findings.map((finding) => {
    const source = sourceByPath.get(finding.location.path) ?? "";
    return {
      ruleId: finding.rule_id,
      level: sarifLevel(finding.severity),
      message: { text: finding.message },
      locations: [
        {
          physicalLocation: {
            artifactLocation: {
              uri: finding.location.path,
              uriBaseId: "%SRCROOT%",
            },
            region: {
              startLine: finding.location.start_line,
              startColumn: characterColumn(
                source,
                finding.location.start_line,
                finding.location.start_byte_column,
              ),
              endLine: finding.location.end_line,
              endColumn: characterColumn(
                source,
                finding.location.end_line,
                finding.location.end_byte_column,
              ),
            },
          },
        },
      ],
      partialFingerprints: { saltFindingId: finding.id },
      properties: {
        workspaceUnitId: finding.workspace_unit_id,
        acceptanceCriterion: finding.acceptance_criterion,
        remediation: finding.remediation,
        evidence: finding.evidence,
      },
    };
  });
  return `${JSON.stringify({
    $schema: "https://json.schemastore.org/sarif-2.1.0.json",
    version: "2.1.0",
    runs: [
      {
        tool: {
          driver: {
            name: "Salt Design System CLI",
            semanticVersion: result.tool.version,
            informationUri: "https://www.saltdesignsystem.com/",
            rules,
          },
        },
        originalUriBaseIds: {
          "%SRCROOT%": { uri: "./" },
        },
        invocations: [
          {
            executionSuccessful: result.coverage.status !== "failed",
            properties: { coverage: result.coverage },
          },
        ],
        results,
      },
    ],
  })}\n`;
}
