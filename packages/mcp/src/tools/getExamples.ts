import type { ExampleRecord, SaltRegistry } from "../types.js";
import {
  getExampleSuggestedFollowUps,
  type SuggestedFollowUp,
} from "./consumerPresentation.js";
import {
  inferExampleFrameworkHints,
  inferExamplePackageHints,
  inferExampleRepoSourceCandidates,
  inferExampleScenarioTags,
} from "./consumerSignals.js";
import {
  isComponentAllowedByDocsPolicy,
  isExampleAllowedByDocsPolicy,
} from "./utils.js";

export interface GetExamplesInput {
  target_type?: ExampleRecord["target_type"];
  target_name?: string;
  package?: string;
  intent?: string;
  complexity?: ExampleRecord["complexity"];
  max_results?: number;
  include_code?: boolean;
  view?: "compact" | "full";
}

export interface GetExamplesResult {
  examples: Array<Record<string, unknown>>;
  best_example?: Record<string, unknown> | null;
  nearby_examples?: Array<Record<string, unknown>>;
  why_this_example?: string;
  suggested_follow_ups?: SuggestedFollowUp[];
  next_step?: string;
  did_you_mean?: string[];
  resolved_target?: {
    query: string;
    target_type: ExampleRecord["target_type"];
    name: string;
    package: string | null;
    matched_by?: Array<"name" | "alias" | "slug">;
  };
  ambiguity?: {
    query: string;
    matches: Array<{
      target_type: ExampleRecord["target_type"];
      name: string;
      package: string | null;
      matched_by: Array<"name" | "alias" | "slug">;
    }>;
  };
}

interface ExampleTargetCandidate {
  target_type: ExampleRecord["target_type"];
  name: string;
  package: string | null;
  matched_by: Array<"name" | "alias" | "slug">;
  lookup_keys: string[];
}

function normalizeTargetLookup(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getRouteSlug(route: string | null): string | null {
  if (!route) {
    return null;
  }

  const parts = route.split("/").filter((part) => part.length > 0);
  return parts.at(-1) ?? null;
}

function collectComponentTargetCandidates(
  registry: SaltRegistry,
  normalizedTargetName: string,
): ExampleTargetCandidate[] {
  const candidates: ExampleTargetCandidate[] = [];

  for (const component of registry.components) {
    if (!isComponentAllowedByDocsPolicy(component)) {
      continue;
    }

    const matchedBy: Array<"name" | "alias" | "slug"> = [];
    if (normalizeTargetLookup(component.name) === normalizedTargetName) {
      matchedBy.push("name");
    }
    if (
      component.aliases.some(
        (alias) => normalizeTargetLookup(alias) === normalizedTargetName,
      )
    ) {
      matchedBy.push("alias");
    }

    const routeSlug = getRouteSlug(component.related_docs.overview);
    if (
      routeSlug &&
      normalizeTargetLookup(routeSlug) === normalizedTargetName
    ) {
      matchedBy.push("slug");
    }

    if (matchedBy.length === 0) {
      continue;
    }

    candidates.push({
      target_type: "component",
      name: component.name,
      package: component.package.name,
      matched_by: matchedBy,
      lookup_keys: [component.name, ...component.aliases, routeSlug]
        .filter((value): value is string => Boolean(value))
        .map(normalizeTargetLookup),
    });
  }

  return candidates;
}

function collectPatternTargetCandidates(
  registry: SaltRegistry,
  normalizedTargetName: string,
): ExampleTargetCandidate[] {
  const candidates: ExampleTargetCandidate[] = [];

  for (const pattern of registry.patterns) {
    const matchedBy: Array<"name" | "alias" | "slug"> = [];
    if (normalizeTargetLookup(pattern.name) === normalizedTargetName) {
      matchedBy.push("name");
    }
    if (
      pattern.aliases.some(
        (alias) => normalizeTargetLookup(alias) === normalizedTargetName,
      )
    ) {
      matchedBy.push("alias");
    }

    const routeSlug = getRouteSlug(pattern.related_docs.overview);
    if (
      routeSlug &&
      normalizeTargetLookup(routeSlug) === normalizedTargetName
    ) {
      matchedBy.push("slug");
    }

    if (matchedBy.length === 0) {
      continue;
    }

    candidates.push({
      target_type: "pattern",
      name: pattern.name,
      package: null,
      matched_by: matchedBy,
      lookup_keys: [pattern.name, ...pattern.aliases, routeSlug]
        .filter((value): value is string => Boolean(value))
        .map(normalizeTargetLookup),
    });
  }

  return candidates;
}

function resolveTargetLookup(
  registry: SaltRegistry,
  targetName: string | undefined,
  targetType: ExampleRecord["target_type"] | undefined,
):
  | {
      targetKeys: Set<string> | null;
      resolvedTarget?: GetExamplesResult["resolved_target"];
      ambiguity?: GetExamplesResult["ambiguity"];
    }
  | {
      targetKeys: null;
      ambiguity: NonNullable<GetExamplesResult["ambiguity"]>;
      resolvedTarget?: undefined;
    } {
  if (!targetName) {
    return { targetKeys: null };
  }

  const trimmedTargetName = targetName.trim();
  if (trimmedTargetName.length === 0) {
    return { targetKeys: null };
  }

  const normalizedTargetName = normalizeTargetLookup(trimmedTargetName);
  const candidates: ExampleTargetCandidate[] = [];

  if (targetType === undefined || targetType === "component") {
    candidates.push(
      ...collectComponentTargetCandidates(registry, normalizedTargetName),
    );
  }

  if (targetType === undefined || targetType === "pattern") {
    candidates.push(
      ...collectPatternTargetCandidates(registry, normalizedTargetName),
    );
  }

  if (candidates.length === 0) {
    return {
      targetKeys: new Set<string>([normalizedTargetName]),
    };
  }

  if (candidates.length > 1) {
    return {
      targetKeys: null,
      ambiguity: {
        query: trimmedTargetName,
        matches: candidates.map((candidate) => ({
          target_type: candidate.target_type,
          name: candidate.name,
          package: candidate.package,
          matched_by: candidate.matched_by,
        })),
      },
    };
  }

  const [candidate] = candidates;
  return {
    targetKeys: new Set(candidate.lookup_keys),
    resolvedTarget: {
      query: trimmedTargetName,
      target_type: candidate.target_type,
      name: candidate.name,
      package: candidate.package,
      matched_by: candidate.matched_by,
    },
  };
}

function toCompactExample(
  example: ExampleRecord,
  includeCode: boolean,
): Record<string, unknown> {
  const compact: Record<string, unknown> = {
    title: example.title,
    intent: example.intent,
    complexity: example.complexity,
    target: {
      type: example.target_type,
      name: example.target_name,
    },
    source_url: example.source_url,
    tags: inferExampleScenarioTags(example),
  };

  if (includeCode) {
    compact.code = example.code;
  }

  return compact;
}

function toFullExample(
  example: ExampleRecord,
  includeCode: boolean,
): Record<string, unknown> {
  const full: Record<string, unknown> = {
    id: example.id,
    title: example.title,
    intent: example.intent,
    complexity: example.complexity,
    package: example.package,
    target_type: example.target_type,
    target_name: example.target_name,
    source_url: example.source_url,
    scenario_tags: inferExampleScenarioTags(example),
    framework_hints: inferExampleFrameworkHints(example),
    package_hints: inferExamplePackageHints(example),
    repo_source_candidates: inferExampleRepoSourceCandidates(example),
  };

  if (includeCode) {
    full.code = example.code;
  }

  return full;
}

function toResolvedTarget(
  resolvedTarget: GetExamplesResult["resolved_target"] | undefined,
  view: "compact" | "full",
): GetExamplesResult["resolved_target"] | undefined {
  if (!resolvedTarget) {
    return undefined;
  }

  if (view === "full") {
    return resolvedTarget;
  }

  return {
    query: resolvedTarget.query,
    target_type: resolvedTarget.target_type,
    name: resolvedTarget.name,
    package: resolvedTarget.package,
  };
}

function getComplexityRank(complexity: ExampleRecord["complexity"]): number {
  switch (complexity) {
    case "basic":
      return 0;
    case "intermediate":
      return 1;
    case "advanced":
      return 2;
    default:
      return 3;
  }
}

function getExampleScore(
  example: ExampleRecord,
  intent: string | undefined,
): number {
  let score = 0;
  const combined = [
    example.title,
    example.code,
    example.source_url,
    ...example.intent,
  ]
    .filter((value): value is string => Boolean(value))
    .join(" ")
    .toLowerCase();

  if (intent) {
    for (const exampleIntent of example.intent) {
      const normalizedIntent = exampleIntent.toLowerCase();
      if (normalizedIntent === intent) {
        score += 8;
      } else if (
        normalizedIntent.includes(intent) ||
        intent.includes(normalizedIntent)
      ) {
        score += 5;
      }
    }

    if (combined.includes(intent)) {
      score += 3;
    }
  }

  if (example.source_url) {
    score += 2;
  }

  if (example.code.trim().length > 0) {
    score += 2;
  }

  if (inferExampleScenarioTags(example).length > 0) {
    score += 1;
  }

  score += Math.max(0, 3 - getComplexityRank(example.complexity));

  return score;
}

function formatExample(
  example: ExampleRecord,
  includeCode: boolean,
  view: "compact" | "full",
): Record<string, unknown> {
  return view === "full"
    ? toFullExample(example, includeCode)
    : toCompactExample(example, includeCode);
}

function getWhyThisExample(
  bestExample: ExampleRecord | undefined,
  resolvedTarget: GetExamplesResult["resolved_target"] | undefined,
  intent: string | undefined,
): string | undefined {
  if (!bestExample) {
    return undefined;
  }

  const reasons: string[] = [];

  if (resolvedTarget) {
    reasons.push(`it directly targets ${resolvedTarget.name}`);
  }

  if (intent) {
    const matchingIntent = bestExample.intent.find((exampleIntent) =>
      exampleIntent.toLowerCase().includes(intent),
    );
    if (matchingIntent) {
      reasons.push(`it covers intent like "${matchingIntent}"`);
    }
  }

  if (bestExample.source_url) {
    reasons.push("it links back to docs-ready example guidance");
  }

  if (bestExample.code.trim().length > 0) {
    reasons.push("it includes implementation code");
  }

  return reasons.length > 0
    ? `Best example because ${reasons.join(", ")}.`
    : "Best example because it is the closest match in the current Salt registry.";
}

export function getExamples(
  registry: SaltRegistry,
  input: GetExamplesInput,
): GetExamplesResult {
  const maxResults = Math.max(1, Math.min(input.max_results ?? 10, 50));
  const includeCode = input.include_code ?? false;
  const view = input.view ?? "compact";
  const intent = input.intent?.trim().toLowerCase();
  const targetResolution = resolveTargetLookup(
    registry,
    input.target_name,
    input.target_type,
  );
  if (targetResolution.ambiguity) {
    return {
      examples: [],
      next_step:
        "Choose one of the suggested targets and retry with the exact name.",
      did_you_mean: targetResolution.ambiguity.matches.map((match) =>
        match.package ? `${match.name} (${match.package})` : match.name,
      ),
      ambiguity: targetResolution.ambiguity,
    };
  }

  const rankedExamples = registry.examples
    .filter((example) => isExampleAllowedByDocsPolicy(registry, example))
    .filter((example) =>
      input.target_type ? example.target_type === input.target_type : true,
    )
    .filter((example) =>
      targetResolution.targetKeys
        ? targetResolution.targetKeys.has(
            normalizeTargetLookup(example.target_name),
          )
        : true,
    )
    .filter((example) =>
      input.package ? example.package === input.package : true,
    )
    .filter((example) =>
      input.complexity ? example.complexity === input.complexity : true,
    )
    .filter((example) =>
      intent
        ? example.intent.some((exampleIntent) =>
            exampleIntent.toLowerCase().includes(intent),
          )
        : true,
    )
    .map((example) => ({
      example,
      score: getExampleScore(example, intent),
    }))
    .sort((left, right) => {
      if (left.score !== right.score) {
        return right.score - left.score;
      }

      const complexityDifference =
        getComplexityRank(left.example.complexity) -
        getComplexityRank(right.example.complexity);
      if (complexityDifference !== 0) {
        return complexityDifference;
      }

      return left.example.title.localeCompare(right.example.title);
    });

  const limitedExamples = rankedExamples.slice(0, maxResults);
  const examples = limitedExamples.map(({ example }) =>
    formatExample(example, includeCode, view),
  );
  const bestExample = limitedExamples[0]?.example;
  const resolvedTarget = toResolvedTarget(
    targetResolution.resolvedTarget,
    view,
  );

  const suggestedFollowUps = targetResolution.resolvedTarget
    ? getExampleSuggestedFollowUps(registry, {
        target_type: targetResolution.resolvedTarget.target_type,
        name: targetResolution.resolvedTarget.name,
        package: targetResolution.resolvedTarget.package,
      })
    : undefined;

  return {
    examples,
    best_example: bestExample
      ? formatExample(bestExample, includeCode, view)
      : null,
    nearby_examples: limitedExamples
      .slice(1, 3)
      .map(({ example }) => formatExample(example, includeCode, view)),
    why_this_example: getWhyThisExample(
      bestExample,
      targetResolution.resolvedTarget,
      intent,
    ),
    suggested_follow_ups:
      suggestedFollowUps && suggestedFollowUps.length > 0
        ? suggestedFollowUps
        : undefined,
    resolved_target: resolvedTarget,
    next_step:
      bestExample?.source_url && targetResolution.resolvedTarget
        ? `Open the examples for ${targetResolution.resolvedTarget.name} and adapt the closest scenario.`
        : examples.length > 0
          ? "Open the closest example and adapt it to your use case."
          : undefined,
  };
}
