import {
  getRegistryIndexes,
  normalizeRegistryLookupKey,
} from "../registry/runtimeCache.js";
import type { ComponentRecord, PatternRecord, SaltRegistry } from "../types.js";
import { inferComponentCapabilities } from "./consumerSignals.js";

export interface ConsumerRecommendationFilters {
  production_ready?: boolean;
  prefer_stable?: boolean;
  a11y_required?: boolean;
  form_field_support?: boolean;
}

export function hasAccessibilityGuidance(
  component: Pick<ComponentRecord, "accessibility">,
): boolean {
  return (
    component.accessibility.summary.length > 0 ||
    component.accessibility.rules.length > 0
  );
}

export function isStableComponent(
  component: Pick<ComponentRecord, "status">,
): boolean {
  return component.status === "stable";
}

export function matchesComponentConsumerFilters(
  component: ComponentRecord,
  filters: ConsumerRecommendationFilters,
): boolean {
  if (filters.production_ready && !isStableComponent(component)) {
    return false;
  }

  if (filters.a11y_required && !hasAccessibilityGuidance(component)) {
    return false;
  }

  if (
    filters.form_field_support &&
    !inferComponentCapabilities(component).includes("form-field")
  ) {
    return false;
  }

  return true;
}

export function compareComponentsByConsumerPreference(
  left: ComponentRecord,
  right: ComponentRecord,
  filters: ConsumerRecommendationFilters,
): number {
  if (filters.prefer_stable || filters.production_ready) {
    const leftStable = isStableComponent(left);
    const rightStable = isStableComponent(right);

    if (leftStable !== rightStable) {
      return leftStable ? -1 : 1;
    }
  }

  if (filters.a11y_required) {
    const leftA11y = hasAccessibilityGuidance(left);
    const rightA11y = hasAccessibilityGuidance(right);

    if (leftA11y !== rightA11y) {
      return leftA11y ? -1 : 1;
    }
  }

  return 0;
}

export function resolvePatternComponents(
  registry: SaltRegistry,
  pattern: PatternRecord,
): ComponentRecord[] {
  const { componentsByNormalizedName } = getRegistryIndexes(registry);

  return pattern.composed_of
    .map((entry) => {
      return (
        componentsByNormalizedName.get(
          normalizeRegistryLookupKey(entry.component),
        )?.[0] ?? null
      );
    })
    .filter((component): component is ComponentRecord => Boolean(component));
}

export function isPatternProductionReady(
  registry: SaltRegistry,
  pattern: PatternRecord,
): boolean {
  if (pattern.status !== "stable") {
    return false;
  }

  return resolvePatternComponents(registry, pattern).every((component) =>
    isStableComponent(component),
  );
}

export function patternSupportsAccessibility(
  registry: SaltRegistry,
  pattern: PatternRecord,
): boolean {
  const resolvedComponents = resolvePatternComponents(registry, pattern);

  if (resolvedComponents.length === 0) {
    return pattern.accessibility.summary.length > 0;
  }

  return resolvedComponents.every((component) =>
    hasAccessibilityGuidance(component),
  );
}

export function patternSupportsFormFields(
  registry: SaltRegistry,
  pattern: PatternRecord,
): boolean {
  return resolvePatternComponents(registry, pattern).some((component) =>
    inferComponentCapabilities(component).includes("form-field"),
  );
}

export function matchesPatternConsumerFilters(
  registry: SaltRegistry,
  pattern: PatternRecord,
  filters: ConsumerRecommendationFilters,
): boolean {
  if (
    filters.production_ready &&
    !isPatternProductionReady(registry, pattern)
  ) {
    return false;
  }

  if (
    filters.a11y_required &&
    !patternSupportsAccessibility(registry, pattern)
  ) {
    return false;
  }

  if (
    filters.form_field_support &&
    !patternSupportsFormFields(registry, pattern)
  ) {
    return false;
  }

  return true;
}

export function comparePatternsByConsumerPreference(
  registry: SaltRegistry,
  left: PatternRecord,
  right: PatternRecord,
  filters: ConsumerRecommendationFilters,
): number {
  if (filters.prefer_stable || filters.production_ready) {
    const leftStable = isPatternProductionReady(registry, left);
    const rightStable = isPatternProductionReady(registry, right);

    if (leftStable !== rightStable) {
      return leftStable ? -1 : 1;
    }
  }

  if (filters.a11y_required) {
    const leftA11y = patternSupportsAccessibility(registry, left);
    const rightA11y = patternSupportsAccessibility(registry, right);

    if (leftA11y !== rightA11y) {
      return leftA11y ? -1 : 1;
    }
  }

  return 0;
}
