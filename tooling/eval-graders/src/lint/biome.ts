/**
 * Biome's recommended rules over artifact files, through the in-process WASM API. The
 * repository's own biome.jsonc is deliberately not used: a Salt consumer gets Biome's
 * defaults, so that is what generated code is held to.
 */
import { spanInBytesToSpanInCodeUnits } from "@biomejs/js-api";
import { Biome as BiomeApi, type Diagnostic } from "@biomejs/js-api/nodejs";
import type { Evidence } from "../protocol";

export type LintLevel = "error" | "warning";

const SEVERITY_RANK: Record<string, number> = {
  hint: 0,
  information: 1,
  warning: 2,
  error: 3,
  fatal: 4,
};

export interface LintFinding {
  category: string;
  severity: string;
  message: string;
  evidence: Evidence;
}

export class Biome {
  private readonly api = new BiomeApi();
  private readonly projectKey: number;

  constructor() {
    this.projectKey = this.api.openProject().projectKey;
    this.api.applyConfiguration(this.projectKey, {
      linter: { enabled: true, rules: { recommended: true } },
      formatter: { enabled: false },
      assist: { enabled: false },
    });
  }

  lint(files: Record<string, string>, level: LintLevel): LintFinding[] {
    const threshold = SEVERITY_RANK[level];
    const findings: LintFinding[] = [];
    for (const [file, content] of Object.entries(files)) {
      if (!/\.[cm]?[jt]sx?$/.test(file)) continue;
      const result = this.api.lintContent(this.projectKey, content, {
        filePath: file,
      });
      for (const diagnostic of result.diagnostics) {
        if ((SEVERITY_RANK[diagnostic.severity] ?? 0) < threshold) continue;
        findings.push(this.finding(file, content, diagnostic));
      }
    }
    return findings;
  }

  private finding(
    file: string,
    content: string,
    diagnostic: Diagnostic,
  ): LintFinding {
    const evidence: Evidence = { file };
    const span = diagnostic.location?.span;
    if (span) {
      const [start, end] = spanInBytesToSpanInCodeUnits(span, content);
      const before = content.slice(0, start);
      evidence.line = before.split("\n").length;
      evidence.column = start - before.lastIndexOf("\n");
      evidence.text = content.slice(start, end).slice(0, 200);
    }
    return {
      category: diagnostic.category ?? "unknown",
      severity: diagnostic.severity,
      message: diagnostic.description,
      evidence,
    };
  }
}
