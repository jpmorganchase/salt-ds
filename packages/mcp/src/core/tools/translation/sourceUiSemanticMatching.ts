import type {
  ComponentRecord,
  PatternRecord,
  SaltRegistry,
} from "../../types.js";
import type { GuidanceSignals } from "./sourceUiSemanticSignals.js";
import {
  buildSourceIntentProfile,
  extractDocs,
  getRejectedTargetWhy,
  hasPreferredCategoryMatch,
  hasSemanticallyAlignedTarget,
  inferPreferredCategoriesForSource,
  refinePreferredCategoriesForSource,
} from "./sourceUiSemanticSignals.js";
import type { SaltSolutionType } from "./sourceUiTypes.js";

export interface TranslationSemanticIndex {
  componentRecords: ComponentRecord[];
  patternRecords: PatternRecord[];
  componentByName: Map<string, ComponentRecord>;
  patternByName: Map<string, PatternRecord>;
  signalCache: WeakMap<Record<string, unknown>, GuidanceSignals>;
  guidanceTextCache: WeakMap<Record<string, unknown>, string>;
}

export function createTranslationSemanticIndex(
  registry: SaltRegistry,
): TranslationSemanticIndex {
  return {
    componentRecords: registry.components,
    patternRecords: registry.patterns,
    componentByName: new Map(
      registry.components.map((component) => [component.name, component]),
    ),
    patternByName: new Map(
      registry.patterns.map((pattern) => [pattern.name, pattern]),
    ),
    signalCache: new WeakMap(),
    guidanceTextCache: new WeakMap(),
  };
}

export function resolveCanonicalDecisionRecord(
  index: TranslationSemanticIndex,
  solutionType: Exclude<SaltSolutionType, "auto" | "token"> | null,
  decisionName: string | null,
): Record<string, unknown> | null {
  if (!decisionName || !solutionType) {
    return null;
  }

  if (solutionType === "component") {
    return (index.componentByName.get(decisionName) ?? null) as Record<
      string,
      unknown
    > | null;
  }

  if (solutionType === "pattern") {
    return (index.patternByName.get(decisionName) ?? null) as Record<
      string,
      unknown
    > | null;
  }

  return null;
}

export {
  buildSourceIntentProfile,
  extractDocs,
  getRejectedTargetWhy,
  hasPreferredCategoryMatch,
  hasSemanticallyAlignedTarget,
  inferPreferredCategoriesForSource,
  refinePreferredCategoriesForSource,
};
