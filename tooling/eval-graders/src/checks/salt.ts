/**
 * Checks that need repository knowledge: the export census (salt:*), the fixture
 * typechecker (ts:typecheck) and Biome (lint:biome).
 */
import type { FileAnalysis, ImportBinding } from "../analysis/jsx";
import type { LintLevel } from "../lint/biome";
import type { Evidence } from "../protocol";
import {
  correct,
  defineCheck,
  optionalString,
  ParamError,
  wrong,
} from "./context";

const SALT_SCOPE = "@salt-ds/";

function importEvidence(
  analysis: FileAnalysis,
  binding: ImportBinding,
): Evidence {
  return {
    file: analysis.file,
    line: binding.line,
    column: binding.column,
    text: binding.text,
  };
}

/** Salt package imports whose specifier is a package root (subpaths such as CSS are not in the census). */
function saltImports(analysis: FileAnalysis): ImportBinding[] {
  return analysis.imports.filter(
    (binding) =>
      binding.from.startsWith(SALT_SCOPE) &&
      binding.from.split("/").length === 2,
  );
}

export const importsResolve = defineCheck({
  parse: () => ({}),
  run(context) {
    const registry = context.registry();
    const problems: { message: string; evidence: Evidence }[] = [];
    for (const analysis of context.analyses().values()) {
      for (const binding of saltImports(analysis)) {
        const exports = registry.packages[binding.from];
        if (!exports) {
          problems.push({
            message: `${binding.from} is not a package this census knows (${Object.keys(registry.packages).join(", ")})`,
            evidence: importEvidence(analysis, binding),
          });
        } else if (binding.imported === "default") {
          problems.push({
            message: `${binding.from} has no default export`,
            evidence: importEvidence(analysis, binding),
          });
        } else if (binding.imported !== "*" && !(binding.imported in exports)) {
          problems.push({
            message: `${binding.from} does not export ${binding.imported}`,
            evidence: importEvidence(analysis, binding),
          });
        }
      }
    }
    if (problems.length === 0) return correct();
    return wrong(
      problems.map((p) => p.message),
      problems.map((p) => p.evidence),
    );
  },
});

export const noDeprecated = defineCheck({
  parse: () => ({}),
  run(context) {
    const registry = context.registry();
    const problems: { message: string; evidence: Evidence }[] = [];
    for (const analysis of context.analyses().values()) {
      for (const binding of saltImports(analysis)) {
        const entry = registry.packages[binding.from]?.[binding.imported];
        if (entry?.deprecated) {
          problems.push({
            message: `${binding.imported} from ${binding.from} is deprecated: ${entry.deprecated}`,
            evidence: importEvidence(analysis, binding),
          });
        }
      }
    }
    if (problems.length === 0) return correct();
    return wrong(
      problems.map((p) => p.message),
      problems.map((p) => p.evidence),
    );
  },
});

export const typecheck = defineCheck({
  parse: () => ({}),
  run(context) {
    const findings = context.typecheck().check(context.files);
    if (findings.length === 0) return correct();
    return wrong(
      findings.map(
        (f) => `${f.evidence.file}:${f.evidence.line ?? "?"} ${f.message}`,
      ),
      findings.map((f) => f.evidence),
    );
  },
});

export const lintBiome = defineCheck({
  parse(params) {
    const level = optionalString(params, "level") ?? "error";
    if (level !== "error" && level !== "warning") {
      throw new ParamError("params.level must be 'error' or 'warning'");
    }
    return { level: level as LintLevel };
  },
  run(context, params) {
    const findings = context.biome().lint(context.files, params.level);
    if (findings.length === 0) return correct();
    return wrong(
      findings.map(
        (f) =>
          `${f.evidence.file}:${f.evidence.line ?? "?"} ${f.category} (${f.severity}): ${f.message}`,
      ),
      findings.map((f) => f.evidence),
    );
  },
});
