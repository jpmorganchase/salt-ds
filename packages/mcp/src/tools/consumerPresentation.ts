import type {
  ComponentRecord,
  PageRecord,
  PatternRecord,
  SaltRegistry,
} from "../types.js";
import {
  hasAccessibilityGuidance,
  isPatternProductionReady,
  isStableComponent,
  patternSupportsAccessibility,
  patternSupportsFormFields,
  resolvePatternComponents,
} from "./consumerFilters.js";
import { inferComponentCapabilities } from "./consumerSignals.js";

export interface ShipCheck {
  stable_for_production: boolean;
  accessibility_guidance: boolean;
  usage_guidance: boolean;
  examples_available: boolean;
  form_field_support: boolean;
}

export interface SuggestedFollowUp {
  tool: string;
  reason: string;
  args: Record<string, unknown>;
}

export function getFoundationSuggestedFollowUpsByTitle(
  title: string,
): SuggestedFollowUp[] {
  return [
    {
      tool: "discover_salt",
      reason: `Find related Salt docs and nearby entities that apply ${title.toLowerCase()} to real components and patterns.`,
      args: {
        query: title,
      },
    },
    {
      tool: "discover_salt",
      reason: `Route your UI task through Salt after reviewing ${title.toLowerCase()}.`,
      args: {
        query: `${title} for a component or layout`,
      },
    },
  ];
}

function getComponentDocs(component: ComponentRecord): string[] {
  return [
    component.related_docs.overview,
    component.related_docs.usage,
    component.related_docs.accessibility,
    component.related_docs.examples,
  ].filter((value): value is string => Boolean(value));
}

function getPatternDocs(pattern: PatternRecord): string[] {
  return [
    pattern.related_docs.overview,
    ...pattern.resources.map((resource) => resource.href),
  ].filter((value): value is string => Boolean(value));
}

function hasUsageGuidance(docs: string[], statements: string[]): boolean {
  return docs.length > 0 || statements.length > 0;
}

export function getComponentShipCheck(component: ComponentRecord): ShipCheck {
  const capabilities = inferComponentCapabilities(component);
  const docs = getComponentDocs(component);

  return {
    stable_for_production: isStableComponent(component),
    accessibility_guidance: hasAccessibilityGuidance(component),
    usage_guidance: hasUsageGuidance(docs, component.when_to_use),
    examples_available:
      component.examples.length > 0 || Boolean(component.related_docs.examples),
    form_field_support: capabilities.includes("form-field"),
  };
}

export function getPatternShipCheck(
  registry: SaltRegistry,
  pattern: PatternRecord,
): ShipCheck {
  const docs = getPatternDocs(pattern);

  return {
    stable_for_production: isPatternProductionReady(registry, pattern),
    accessibility_guidance: patternSupportsAccessibility(registry, pattern),
    usage_guidance: hasUsageGuidance(docs, [
      ...pattern.when_to_use,
      ...pattern.how_to_build,
      ...pattern.how_it_works,
    ]),
    examples_available:
      pattern.examples.length > 0 ||
      pattern.resources.some((resource) => /example/i.test(resource.label)),
    form_field_support: patternSupportsFormFields(registry, pattern),
  };
}

export function getComponentCaveats(component: ComponentRecord): string[] {
  const shipCheck = getComponentShipCheck(component);
  const caveats: string[] = [];

  if (component.status !== "stable") {
    caveats.push(
      `${component.name} is ${component.status}; confirm that status is acceptable before shipping.`,
    );
  }

  if (!shipCheck.accessibility_guidance) {
    caveats.push(
      `${component.name} has limited accessibility guidance in the registry.`,
    );
  }

  if (!shipCheck.examples_available) {
    caveats.push(`${component.name} has limited example coverage.`);
  }

  if (!shipCheck.usage_guidance) {
    caveats.push(
      `${component.name} has limited usage guidance in the registry.`,
    );
  }

  if (
    component.deprecations.length > 0 ||
    component.props.some((prop) => prop.deprecated)
  ) {
    caveats.push(
      `${component.name} includes deprecated APIs; review upgrade guidance before adopting new usage.`,
    );
  }

  return caveats;
}

export function getPatternCaveats(
  registry: SaltRegistry,
  pattern: PatternRecord,
): string[] {
  const shipCheck = getPatternShipCheck(registry, pattern);
  const caveats: string[] = [];
  const resolvedComponents = resolvePatternComponents(registry, pattern);

  if (pattern.status !== "stable") {
    caveats.push(
      `${pattern.name} is ${pattern.status}; confirm that status is acceptable before shipping.`,
    );
  }

  if (
    resolvedComponents.some((component) => component.status !== "stable") &&
    pattern.status === "stable"
  ) {
    caveats.push(
      `${pattern.name} depends on non-stable components, so treat it as a provisional composition.`,
    );
  }

  if (!shipCheck.accessibility_guidance) {
    caveats.push(
      `${pattern.name} has limited accessibility guidance across the pattern or its constituent components.`,
    );
  }

  if (!shipCheck.examples_available) {
    caveats.push(`${pattern.name} has limited example coverage.`);
  }

  if (!shipCheck.usage_guidance) {
    caveats.push(`${pattern.name} has limited implementation guidance.`);
  }

  return caveats;
}

export function getFoundationSuggestedFollowUps(
  page: PageRecord,
): SuggestedFollowUp[] {
  return getFoundationSuggestedFollowUpsByTitle(page.title);
}

export function getComponentSuggestedFollowUps(
  component: ComponentRecord,
  alternatives: string[] = [],
  options: {
    include_lookup?: boolean;
  } = {},
): SuggestedFollowUp[] {
  const followUps: SuggestedFollowUp[] = [];
  const includeLookup = options.include_lookup ?? true;

  if (component.related_docs.examples || component.examples.length > 0) {
    followUps.push({
      tool: "get_salt_examples",
      reason: `Find the best implementation example for ${component.name}.`,
      args: {
        target_type: "component",
        target_name: component.name,
        max_results: 5,
      },
    });
  }

  if (includeLookup) {
    followUps.push({
      tool: "get_salt_entity",
      reason: `Review ${component.name} guidance, alternatives, and docs links.`,
      args: {
        entity_type: "component",
        name: component.name,
      },
    });
  }

  if (alternatives[0]) {
    followUps.push({
      tool: "choose_salt_solution",
      reason: `Compare ${component.name} with ${alternatives[0]} before committing.`,
      args: {
        solution_type: "component",
        names: [component.name, alternatives[0]],
      },
    });
  }

  return followUps.slice(0, 3);
}

export function getPatternSuggestedFollowUps(
  pattern: PatternRecord,
  options: {
    include_lookup?: boolean;
  } = {},
): SuggestedFollowUp[] {
  const followUps: SuggestedFollowUp[] = [
    {
      tool: "get_salt_examples",
      reason: `Find examples that illustrate ${pattern.name}.`,
      args: {
        target_type: "pattern",
        target_name: pattern.name,
        max_results: 5,
      },
    },
  ];
  const includeLookup = options.include_lookup ?? true;

  if (includeLookup) {
    followUps.push({
      tool: "get_salt_entity",
      reason: `Review the full ${pattern.name} pattern guidance.`,
      args: {
        entity_type: "pattern",
        name: pattern.name,
      },
    });
  }

  if (pattern.related_patterns[0]) {
    followUps.push({
      tool: "choose_salt_solution",
      reason: `Compare ${pattern.name} with the nearest related pattern.`,
      args: {
        solution_type: "pattern",
        names: [pattern.name, pattern.related_patterns[0]],
      },
    });
  }

  return followUps.slice(0, 3);
}

export function getExampleSuggestedFollowUps(
  registry: SaltRegistry,
  target:
    | { target_type: "component"; name: string; package: string | null }
    | { target_type: "pattern"; name: string; package: string | null },
): SuggestedFollowUp[] {
  if (target.target_type === "component") {
    const component = registry.components.find(
      (entry) =>
        entry.name === target.name &&
        (target.package ? entry.package.name === target.package : true),
    );
    if (component) {
      return getComponentSuggestedFollowUps(
        component,
        component.alternatives.map((alternative) => alternative.use),
      );
    }
  }

  const pattern = registry.patterns.find((entry) => entry.name === target.name);
  if (pattern) {
    return getPatternSuggestedFollowUps(pattern);
  }

  return [];
}
