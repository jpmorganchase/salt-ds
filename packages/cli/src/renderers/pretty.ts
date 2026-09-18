import type { SaltScanResult } from "../scan/result.js";

function terminalSafe(value: string): string {
  return JSON.stringify(
    Array.from(value, (character) => {
      const codePoint = character.codePointAt(0) ?? 0;
      return codePoint <= 0x1f || (codePoint >= 0x7f && codePoint <= 0x9f)
        ? "�"
        : character;
    }).join(""),
  );
}

export function renderPretty(
  result: SaltScanResult,
  rescanCommand: string,
): string {
  const lines = [
    `Salt scan: ${result.coverage.status}`,
    `Files: ${result.coverage.evaluated_files}/${result.coverage.selected_files} evaluated; ${result.coverage.failed_files} failed`,
    `Findings: ${result.summary.errors} error, ${result.summary.warnings} warning, ${result.summary.infos} info`,
  ];
  if (result.coverage.reasons.length > 0) {
    lines.push(`Coverage: ${result.coverage.reasons.join(", ")}`);
  }
  for (const finding of result.findings) {
    lines.push(
      "",
      `[${finding.severity}] ${finding.rule_id}`,
      `  ${terminalSafe(finding.location.path)}:${finding.location.start_line}:${finding.location.start_byte_column}`,
      `  ${finding.message}`,
      `  Remediation: ${finding.remediation ?? "Review the cited official evidence."}`,
      `  Acceptance: ${finding.acceptance_criterion}`,
    );
  }
  if (result.findings.length > 0) {
    lines.push("", `Rescan: ${rescanCommand}`);
  }
  return `${lines.join("\n")}\n`;
}
