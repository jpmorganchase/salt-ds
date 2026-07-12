import type {
  RetrievalContrastRelation,
  RetrievalContrastTarget,
  RetrievalSignalsRecord,
} from "../types.js";
import { cleanMarkdownText, uniqueStrings } from "./buildRegistryShared.js";

function cleanContrastTargetCandidate(value: string): string {
  return cleanMarkdownText(value)
    .replace(/^[\s"'`([{<]+/, "")
    .replace(/[\s"'`)\]}>.,;:]+$/g, "")
    .replace(/^(?:the|a|an)\s+/i, "")
    .trim();
}

function looksLikeContrastTarget(value: string): boolean {
  if (!value || value.length < 2 || value.length > 60) {
    return false;
  }

  if (!/^[A-Z]/.test(value)) {
    return false;
  }

  if (/^(?:Instead|Use|When|To|For|If)\b/.test(value)) {
    return false;
  }

  return true;
}

function inferContrastRelation(statement: string): RetrievalContrastRelation {
  if (/\bcomplement(?:s|ing)?\b/i.test(statement)) {
    return "complements";
  }

  if (/\binstead\b/i.test(statement) || /\buse\b/i.test(statement)) {
    return "prefer-instead";
  }

  return "not-for";
}

function extractContrastTargetCandidates(statement: string): string[] {
  const cleaned = cleanMarkdownText(statement);
  if (!cleaned) {
    return [];
  }

  const afterUseMatch = cleaned.match(/\buse\s+(.+)$/i);
  const contrastSegment = afterUseMatch?.[1] ?? "";
  if (!contrastSegment) {
    return [];
  }

  const trimmedSegment = contrastSegment
    .replace(/\b(?:instead|rather than)\b[\s\S]*$/i, "")
    .replace(/\bto complement\b[\s\S]*$/i, "")
    .trim();

  return uniqueStrings(
    trimmedSegment
      .split(/\s+(?:or|and)\s+|,/i)
      .map((part) => cleanContrastTargetCandidate(part))
      .filter(looksLikeContrastTarget),
  );
}

export function buildRetrievalSignals(input: {
  caution_statements: string[];
}): RetrievalSignalsRecord | undefined {
  const contrastTargetMap = new Map<
    string,
    {
      target: string;
      relation: RetrievalContrastRelation;
      evidence: Set<string>;
    }
  >();

  for (const statement of input.caution_statements) {
    const cleanedStatement = cleanMarkdownText(statement).trim();
    if (!cleanedStatement) {
      continue;
    }

    const relation = inferContrastRelation(cleanedStatement);
    for (const target of extractContrastTargetCandidates(cleanedStatement)) {
      const key = target.toLowerCase();
      const existing = contrastTargetMap.get(key);
      if (existing) {
        existing.evidence.add(cleanedStatement);
        if (
          existing.relation !== "prefer-instead" &&
          relation === "prefer-instead"
        ) {
          existing.relation = relation;
        }
        continue;
      }

      contrastTargetMap.set(key, {
        target,
        relation,
        evidence: new Set([cleanedStatement]),
      });
    }
  }

  const contrastTargets: RetrievalContrastTarget[] = [
    ...contrastTargetMap.values(),
  ]
    .map((target) => ({
      target: target.target,
      relation: target.relation,
      evidence: [...target.evidence].sort((left, right) =>
        left.localeCompare(right),
      ),
    }))
    .sort((left, right) => left.target.localeCompare(right.target));

  if (contrastTargets.length === 0) {
    return undefined;
  }

  return {
    contrast_targets: contrastTargets,
  };
}
