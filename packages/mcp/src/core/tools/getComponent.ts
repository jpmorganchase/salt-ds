import {
  getRegistryIndexes,
  normalizeRegistryLookupKey,
} from "../registry/runtimeCache.js";
import type { ComponentRecord, SaltRegistry } from "../types.js";
import {
  getComponentSuggestedFollowUps,
  type SuggestedFollowUp,
} from "./consumerPresentation.js";
import { projectLookupRecord, resolveLookup } from "./lookupResolver.js";
import {
  buildComponentPresentationBase,
  getComponentRelatedGuides,
} from "./solutionPresentation.js";
import { isComponentAllowedByDocsPolicy } from "./utils.js";

export interface GetComponentInput {
  name: string;
  package?: string;
  view?: "compact" | "full";
  include?: Array<"examples" | "props" | "accessibility" | "deprecations">;
}

export interface GetComponentResult {
  component: Record<string, unknown> | null;
  suggested_follow_ups?: SuggestedFollowUp[];
  next_step?: string;
  did_you_mean?: string[];
  ambiguity?: {
    query: string;
    matched_by: "name" | "alias";
    matches: Array<{
      name: string;
      package: string;
      status: ComponentRecord["status"];
    }>;
  };
}

const MAX_COMPACT_COMPONENT_EXAMPLES = 3;

function getComponentNextStep(component: ComponentRecord): string {
  if (component.related_docs.examples) {
    return `Review examples for ${component.name} before implementing.`;
  }

  if (component.related_docs.usage) {
    return `Review usage guidance for ${component.name}.`;
  }

  return `Review the ${component.name} overview before implementing.`;
}

function getDeprecationRecords(
  registry: SaltRegistry,
  component: ComponentRecord,
) {
  const { deprecationById } = getRegistryIndexes(registry);

  return component.deprecations
    .map((deprecationId) => deprecationById.get(deprecationId) ?? null)
    .filter((deprecation): deprecation is NonNullable<typeof deprecation> =>
      Boolean(deprecation),
    );
}

function toCompactComponent(
  registry: SaltRegistry,
  component: ComponentRecord,
  input: GetComponentInput,
): Record<string, unknown> {
  const include = input.include ?? [];
  const presentation = buildComponentPresentationBase(registry, component);
  const compact: Record<string, unknown> = {
    name: component.name,
    summary: component.summary,
    why: component.when_to_use[0] ?? component.summary,
    tradeoffs: component.when_not_to_use.slice(0, 2),
    alternatives: component.alternatives,
    ...presentation,
    next_step: getComponentNextStep(component),
  };

  const activeProps = component.props.filter((prop) => !prop.deprecated);
  if (activeProps.length > 0) {
    compact.key_props = activeProps.slice(0, 5).map((prop) => ({
      name: prop.name,
      type: prop.type,
      ...(prop.description ? { description: prop.description } : {}),
      ...(prop.required ? { required: true } : {}),
    }));
    compact.prop_count = component.props.length;
  }

  const deprecatedPropCount = component.props.filter(
    (prop) => prop.deprecated,
  ).length;
  if (deprecatedPropCount > 0) {
    compact.deprecated_prop_count = deprecatedPropCount;
  }

  // Surface sub-component names and composition rules in compact view so
  // agents know the component is compound without needing the full record.
  if (component.sub_components && component.sub_components.length > 0) {
    compact.sub_component_names = component.sub_components.map(
      (sub) => sub.export_name,
    );
  }
  if (component.composition) {
    compact.composition = component.composition;
  }
  if (component.implementation_requirements) {
    compact.implementation_requirements = component.implementation_requirements;
  }

  if (component.package.name !== "@salt-ds/core") {
    compact.package = component.package.name;
  }

  if (component.status !== "stable") {
    compact.status = component.status;
  }

  if (include.includes("accessibility")) {
    compact.accessibility = component.accessibility;
  }
  if (include.includes("examples")) {
    compact.examples = component.examples.slice(
      0,
      MAX_COMPACT_COMPONENT_EXAMPLES,
    );
    compact.example_count = component.examples.length;
    compact.examples_truncated =
      component.examples.length > MAX_COMPACT_COMPONENT_EXAMPLES;
  }
  if (include.includes("deprecations")) {
    compact.deprecations = component.deprecations;
    compact.deprecation_records = getDeprecationRecords(registry, component);
  }
  if (include.includes("props")) {
    compact.props = component.props;
    // When props are explicitly requested, also include full sub-component
    // details so the agent has the complete API surface.
    if (component.sub_components && component.sub_components.length > 0) {
      compact.sub_components = component.sub_components;
    }
  }
  return compact;
}

function toFullComponent(
  registry: SaltRegistry,
  component: ComponentRecord,
  input: GetComponentInput,
): Record<string, unknown> {
  const fullComponent = {
    ...component,
    related_guides: getComponentRelatedGuides(registry, component),
    next_step: getComponentNextStep(component),
  } as Record<string, unknown>;

  if (input.include?.includes("deprecations")) {
    fullComponent.deprecation_records = getDeprecationRecords(
      registry,
      component,
    );
  }
  return fullComponent;
}

export function getComponent(
  registry: SaltRegistry,
  input: GetComponentInput,
): GetComponentResult {
  const normalizedName = normalizeRegistryLookupKey(input.name);
  const { componentsByNormalizedAlias, componentsByNormalizedName } =
    getRegistryIndexes(registry);
  const packageScoped = (components: ComponentRecord[]) =>
    components
      .filter((component) =>
        input.package ? component.package.name === input.package : true,
      )
      .filter((component) => isComponentAllowedByDocsPolicy(component));
  const exactNameMatches = packageScoped(
    componentsByNormalizedName.get(normalizedName) ?? [],
  );
  const aliasMatches = packageScoped(
    componentsByNormalizedAlias.get(normalizedName) ?? [],
  );
  const resolution = resolveLookup(input.name, [
    {
      matchedBy: "name",
      matches: exactNameMatches,
      toAmbiguityMatch: (match) => ({
        name: match.name,
        package: match.package.name,
        status: match.status,
      }),
    },
    {
      matchedBy: "alias",
      matches: aliasMatches,
      ambiguityWhen: "if_unresolved",
      toAmbiguityMatch: (match) => ({
        name: match.name,
        package: match.package.name,
        status: match.status,
      }),
    },
  ]);

  if (resolution.ambiguity) {
    return {
      component: null,
      next_step:
        "Choose one of the suggested matches and retry with the exact name.",
      did_you_mean: resolution.ambiguity.matches.map(
        (match) => `${match.name} (${match.package})`,
      ),
      ambiguity: resolution.ambiguity,
    };
  }

  if (!resolution.candidate) {
    return { component: null };
  }

  return {
    component: projectLookupRecord(resolution.candidate, input.view, {
      toCompact: (component) => toCompactComponent(registry, component, input),
      toFull: (component) => toFullComponent(registry, component, input),
    }),
    suggested_follow_ups: getComponentSuggestedFollowUps(
      resolution.candidate,
      resolution.candidate.alternatives.map((alternative) => alternative.use),
      {
        include_lookup: false,
      },
    ),
    next_step: getComponentNextStep(resolution.candidate),
  };
}
