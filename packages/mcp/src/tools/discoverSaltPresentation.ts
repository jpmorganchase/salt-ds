import type { SuggestedFollowUp } from "./consumerPresentation.js";
import type { DiscoverSaltDecision } from "./discoverSalt.js";
import type { getCompositionRecipe } from "./getCompositionRecipe.js";
import type { recommendComponent } from "./recommendComponent.js";
import type { recommendTokens } from "./recommendTokens.js";
import type { searchApiSurface } from "./searchApiSurface.js";
import type { searchSaltDocs } from "./searchSaltDocs.js";
import type { StarterCodeSnippet } from "./starterCode.js";

function toRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];
}

export function toCompactDocs(
  results: ReturnType<typeof searchSaltDocs>["results"],
): Array<Record<string, unknown>> {
  return results.map((result) => ({
    title: result.name,
    type: result.type,
    package: result.package,
    summary: result.summary,
    why: result.matched_excerpt ?? result.summary,
    docs: result.source_url ? [result.source_url] : [],
  }));
}

export function toCompactComponentOptions(
  result: ReturnType<typeof recommendComponent>,
): Array<Record<string, unknown>> {
  if (result.recommended || result.alternatives) {
    return [
      ...(result.recommended ? [result.recommended] : []),
      ...(result.alternatives ?? []),
    ];
  }

  return (result.recommendations ?? []).map((recommendation) => {
    const recommendationRecord = toRecord(recommendation);
    const component = toRecord(recommendationRecord?.component);
    const relatedDocs = toRecord(component?.related_docs);

    return {
      name: component?.name ?? "Component",
      package: component?.package ?? null,
      status: component?.status ?? null,
      summary: component?.summary ?? "",
      why:
        toStringArray(recommendationRecord?.why)[0] ??
        (typeof component?.summary === "string" ? component.summary : ""),
      tradeoffs: toStringArray(recommendationRecord?.tradeoffs).slice(0, 2),
      docs: relatedDocs
        ? Object.values(relatedDocs).filter(
            (entry): entry is string =>
              typeof entry === "string" && entry.length > 0,
          )
        : [],
      caveats: toStringArray(recommendationRecord?.caveats),
      ship_check: toRecord(recommendationRecord?.ship_check),
    };
  });
}

export function toCompactPatternOptions(
  result: ReturnType<typeof getCompositionRecipe>,
): Array<Record<string, unknown>> {
  if (result.recommended || result.alternatives) {
    return [
      ...(result.recommended ? [result.recommended] : []),
      ...(result.alternatives ?? []),
    ];
  }

  return (result.recipes ?? []).map((recipe) => {
    const recipeRecord = toRecord(recipe);

    return {
      name:
        typeof recipeRecord?.recipe_name === "string"
          ? recipeRecord.recipe_name
          : typeof recipeRecord?.name === "string"
            ? recipeRecord.name
            : "Pattern",
      type:
        typeof recipeRecord?.recipe_type === "string"
          ? recipeRecord.recipe_type
          : "pattern",
      summary:
        typeof recipeRecord?.summary === "string" ? recipeRecord.summary : "",
      steps: Array.isArray(recipeRecord?.steps) ? recipeRecord.steps : [],
      components: Array.isArray(recipeRecord?.components)
        ? recipeRecord.components
        : [],
      docs: toStringArray(recipeRecord?.docs),
      caveats: toStringArray(recipeRecord?.caveats),
      ship_check: toRecord(recipeRecord?.ship_check),
    };
  });
}

export function toCompactFoundationOption(
  foundation: Record<string, unknown> | null | undefined,
): Record<string, unknown> | null {
  const record = toRecord(foundation);
  if (!record) {
    return null;
  }

  return {
    title:
      typeof record.title === "string" ? record.title : "Suggested foundation",
    summary: typeof record.summary === "string" ? record.summary : "",
    topics:
      toStringArray(record.topics).length > 0
        ? toStringArray(record.topics).slice(0, 6)
        : toStringArray(record.section_headings).slice(0, 6),
    guidance:
      toStringArray(record.guidance).length > 0
        ? toStringArray(record.guidance).slice(0, 3)
        : toStringArray(record.content).slice(0, 3),
    docs:
      toStringArray(record.docs).length > 0
        ? toStringArray(record.docs)
        : typeof record.route === "string"
          ? [record.route]
          : [],
    next_step:
      typeof record.next_step === "string"
        ? record.next_step
        : typeof record.title === "string"
          ? `Apply the ${record.title.toLowerCase()} guidance to the current layout or component.`
          : undefined,
  };
}

export function toCompactTokenOptions(
  result: ReturnType<typeof recommendTokens>,
): Array<Record<string, unknown>> {
  if (result.recommended || result.alternatives) {
    return [
      ...(result.recommended ? [result.recommended] : []),
      ...(result.alternatives ?? []),
    ];
  }

  return (result.recommendations ?? []).map((recommendation) => {
    const recommendationRecord = toRecord(recommendation);
    const token = toRecord(recommendationRecord?.token);

    return {
      name: token?.name ?? "Token",
      category: token?.category ?? null,
      semantic_intent: token?.semantic_intent ?? null,
      why:
        toStringArray(token?.guidance)[0] ??
        (typeof token?.semantic_intent === "string"
          ? token.semantic_intent
          : "Matches the requested styling need."),
      applies_to: toStringArray(token?.applies_to),
      docs: [result.source_url],
      ...(token?.deprecated ? { status: "deprecated" } : {}),
    };
  });
}

export function toCompactApiMatches(
  result: ReturnType<typeof searchApiSurface>,
): Array<Record<string, unknown>> {
  return result.matches.map((match) => ({
    component: match.component.name,
    package: match.component.package,
    prop: match.prop.name,
    summary: match.prop.description,
    why:
      match.match_reasons[0] ??
      `API surface match on ${match.component.name}.${match.prop.name}.`,
    docs: match.component.source_url ? [match.component.source_url] : [],
  }));
}

export function getDiscoverySuggestedFollowUps(
  decision: DiscoverSaltDecision | null,
  query: string,
  docs: Array<Record<string, unknown>>,
): SuggestedFollowUp[] | undefined {
  if (!decision) {
    return undefined;
  }

  if (decision.tool === "choose_salt_solution") {
    return [
      {
        tool: "get_salt_examples",
        reason:
          "Review the best implementation examples after choosing a Salt direction.",
        args: {
          query,
        },
      },
    ];
  }

  if (decision.tool === "get_salt_entity") {
    return [
      {
        tool: "get_salt_entity",
        reason: "Inspect the closest resolved Salt entity in full detail.",
        args: {
          ...(decision.args ?? {}),
          view: "full",
        },
      },
    ];
  }

  if (docs[0]) {
    return [
      {
        tool: "discover_salt",
        reason: "Narrow the query after checking the closest docs result.",
        args: {
          query,
        },
      },
    ];
  }

  return undefined;
}

export function resolveDiscoverStarterCode(input: {
  decision: DiscoverSaltDecision | null;
  foundationStarterCode?: StarterCodeSnippet[];
  patternStarterCode?: StarterCodeSnippet[];
  componentStarterCode?: StarterCodeSnippet[];
}): StarterCodeSnippet[] | undefined {
  const { decision } = input;

  if (
    decision?.tool === "get_salt_entity" &&
    decision.args?.entity_type === "foundation"
  ) {
    return input.foundationStarterCode;
  }

  if (
    decision?.tool === "choose_salt_solution" &&
    decision.args?.solution_type === "pattern"
  ) {
    return input.patternStarterCode;
  }

  if (
    decision?.tool === "choose_salt_solution" &&
    decision.args?.solution_type === "component"
  ) {
    return input.componentStarterCode;
  }

  return undefined;
}

export function resolveDiscoverNextStep(input: {
  decision: DiscoverSaltDecision | null;
  firstFoundation?: Record<string, unknown>;
  foundationNextStep?: string;
  componentNextStep?: string;
  patternNextStep?: string;
  tokenNextStep?: string;
}): string {
  const { decision } = input;

  if (
    decision?.tool === "get_salt_entity" &&
    decision.args?.entity_type === "foundation"
  ) {
    return (
      input.foundationNextStep ??
      (typeof input.firstFoundation?.next_step === "string"
        ? input.firstFoundation.next_step
        : typeof input.firstFoundation?.title === "string"
          ? `Apply the ${input.firstFoundation.title.toLowerCase()} guidance to the current layout or component.`
          : "Inspect the closest Salt entity next.")
    );
  }

  if (
    decision?.tool === "choose_salt_solution" &&
    decision.args?.solution_type === "component"
  ) {
    return (
      input.componentNextStep ??
      "Review the recommended Salt direction and validate it with examples."
    );
  }

  if (
    decision?.tool === "choose_salt_solution" &&
    decision.args?.solution_type === "pattern"
  ) {
    return (
      input.patternNextStep ??
      "Review the recommended Salt direction and validate it with examples."
    );
  }

  if (
    decision?.tool === "choose_salt_solution" &&
    decision.args?.solution_type === "token"
  ) {
    return (
      input.tokenNextStep ??
      "Review the recommended Salt direction and validate it with examples."
    );
  }

  if (decision?.tool === "get_salt_examples") {
    return "Inspect the best example and adapt it to the current use case.";
  }

  if (decision?.tool === "compare_salt_versions") {
    return "Compare the relevant versions and review the breaking changes first.";
  }

  return "Inspect the closest Salt entity next.";
}
