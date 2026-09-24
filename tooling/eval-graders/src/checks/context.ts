import type { FileAnalysis } from "../analysis/jsx";
import type { Biome } from "../lint/biome";
import type { CheckResult, Evidence } from "../protocol";
import type { Registry } from "../registry/build";
import type { TypecheckService } from "../typecheck/service";

/** Everything a check may look at. Expensive members are lazy so cheap checks stay cheap. */
export interface GradeContext {
  files: Record<string, string>;
  fixture: string;
  analyses(): Map<string, FileAnalysis>;
  registry(): Registry;
  typecheck(): TypecheckService;
  biome(): Biome;
}

export type Outcome = Omit<CheckResult, "id">;

export interface CheckDefinition<P> {
  /** Turn untyped params into P. Throw a ParamError for anything unusable. */
  parse(params: Record<string, unknown>): P;
  run(context: GradeContext, params: P): Outcome;
}

/** A check with its parameter type erased, so the registry can hold every kind in one table. */
export interface AnyCheck {
  parse(params: Record<string, unknown>): unknown;
  run(context: GradeContext, params: unknown): Outcome;
}

export function defineCheck<P>(definition: CheckDefinition<P>): AnyCheck {
  return {
    parse: definition.parse,
    run: (context, params) => definition.run(context, params as P),
  };
}

export class ParamError extends Error {}

export function requireString(
  params: Record<string, unknown>,
  key: string,
): string {
  const value = params[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new ParamError(`params.${key} must be a non-empty string`);
  }
  return value;
}

export function optionalString(
  params: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = params[key];
  if (value === undefined) return undefined;
  if (typeof value !== "string") {
    throw new ParamError(`params.${key} must be a string`);
  }
  return value;
}

export function optionalPositiveInteger(
  params: Record<string, unknown>,
  key: string,
  fallback: number,
): number {
  const value = params[key];
  if (value === undefined) return fallback;
  if (!Number.isInteger(value) || (value as number) < 1) {
    throw new ParamError(`params.${key} must be a positive integer`);
  }
  return value as number;
}

export function correct(diagnostics: string[] = []): Outcome {
  return { verdict: "correct", diagnostics, evidence: [] };
}

export function wrong(diagnostics: string[], evidence: Evidence[]): Outcome {
  return { verdict: "wrong", diagnostics, evidence };
}

export function undecidable(
  diagnostics: string[],
  evidence: Evidence[],
): Outcome {
  return { verdict: "error", diagnostics, evidence };
}

/**
 * Combine per-element findings: any violation is `wrong`; otherwise anything the
 * syntax alone cannot decide (spread props, computed values) is `error`, which the
 * harness reports as `review` rather than as an agent failure.
 */
export function decide(
  violations: { message: string; evidence: Evidence }[],
  unknowns: { message: string; evidence: Evidence }[],
): Outcome {
  if (violations.length > 0) {
    return wrong(
      violations.map((v) => v.message),
      violations.map((v) => v.evidence),
    );
  }
  if (unknowns.length > 0) {
    return undecidable(
      unknowns.map((u) => u.message),
      unknowns.map((u) => u.evidence),
    );
  }
  return correct();
}
