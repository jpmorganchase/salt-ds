import type { SaltRegistry, SearchArea, SearchIndexEntry } from "../types.js";
import { getComponent } from "./getComponent.js";
import { getCountrySymbol } from "./getCountrySymbol.js";
import { getCountrySymbols } from "./getCountrySymbols.js";
import { getFoundation } from "./getFoundation.js";
import { getGuide } from "./getGuide.js";
import { getIcon } from "./getIcon.js";
import { getIcons } from "./getIcons.js";
import { getPackage } from "./getPackage.js";
import { getPage } from "./getPage.js";
import { getPattern } from "./getPattern.js";
import { getRelatedEntities } from "./getRelatedEntities.js";
import type {
  GetSaltEntityInput,
  GetSaltEntityResult,
  SaltEntityType,
} from "./getSaltEntity.js";
import { getToken, getTokenNextStep } from "./getToken.js";
import { listFoundations } from "./listFoundations.js";
import { searchSaltDocs } from "./searchSaltDocs.js";
import {
  createComponentStarterCode,
  createRecipeStarterCode,
  type StarterCodeSnippet,
} from "./starterCode.js";

type KnownSaltEntityType = Exclude<SaltEntityType, "auto">;

export interface GetSaltEntityContext {
  registry: SaltRegistry;
  input: GetSaltEntityInput;
  view: "compact" | "full";
  maxResults: number;
  lookupValue: string;
}

type EntityResolver = (context: GetSaltEntityContext) => GetSaltEntityResult;

function clampMaxResults(value: number | undefined, fallback = 5, max = 50) {
  return Math.max(1, Math.min(value ?? fallback, max));
}

function searchAreaForEntityType(entityType: KnownSaltEntityType): SearchArea {
  switch (entityType) {
    case "component":
      return "components";
    case "pattern":
      return "patterns";
    case "foundation":
      return "foundations";
    case "token":
      return "tokens";
    case "guide":
      return "guides";
    case "page":
      return "pages";
    case "package":
      return "packages";
    case "icon":
      return "icons";
    case "country_symbol":
      return "country_symbols";
  }
}

function toSearchMatches(
  results: ReturnType<typeof searchSaltDocs>["results"],
): Array<Record<string, unknown>> {
  return results.map((result) => ({
    name: result.name,
    type: result.type,
    package: result.package,
    status: result.status,
    summary: result.summary,
    why: result.matched_excerpt ?? result.summary,
    docs: result.source_url ? [result.source_url] : [],
  }));
}

function mapSearchTypeToEntityType(
  type: SearchIndexEntry["type"],
): KnownSaltEntityType | null {
  switch (type) {
    case "component":
      return "component";
    case "pattern":
      return "pattern";
    case "page":
      return "page";
    case "guide":
      return "guide";
    case "token":
      return "token";
    case "package":
      return "package";
    case "icon":
      return "icon";
    case "country_symbol":
      return "country_symbol";
    default:
      return null;
  }
}

function shouldResolveNearMatch(
  results: ReturnType<typeof searchSaltDocs>["results"],
): boolean {
  const [first, second] = results;
  if (!first) {
    return false;
  }

  return !second || first.score - second.score >= 4;
}

function getSuggestedRelated(
  registry: SaltRegistry,
  entityType: KnownSaltEntityType,
  name: string,
  packageName?: string,
) {
  switch (entityType) {
    case "component":
    case "pattern":
    case "token":
    case "guide":
    case "page":
      return getRelatedEntities(registry, {
        target_type: entityType,
        name,
        package: packageName,
      }).related;
    case "foundation":
      return getRelatedEntities(registry, {
        target_type: "page",
        name,
      }).related;
    default:
      return undefined;
  }
}

function createPatternStarterCode(
  registry: SaltRegistry,
  patternName: string,
): StarterCodeSnippet[] | undefined {
  const pattern =
    registry.patterns.find((entry) => entry.name === patternName) ?? null;
  if (!pattern) {
    return undefined;
  }

  return createRecipeStarterCode({
    recipeName: pattern.name,
    components: pattern.composed_of.map((entry) => ({
      name: entry.component,
      package: null,
      role: entry.role,
    })),
    supporting_example: pattern.examples[0]
      ? {
          title: pattern.examples[0].title,
          code: pattern.examples[0].code,
          source_url: pattern.examples[0].source_url,
        }
      : null,
  });
}

function buildNearMatchResult(
  entityType: KnownSaltEntityType,
  matches: Array<Record<string, unknown>>,
  raw: Record<string, unknown> | undefined,
): GetSaltEntityResult {
  return {
    entity_type: entityType,
    decision: {
      status: matches.length > 0 ? "results" : "not_found",
      why:
        matches.length > 0
          ? "No exact Salt entity match was found, so nearby matches are returned instead."
          : "No matching Salt entity was found.",
    },
    entity: null,
    matches: matches.length > 0 ? matches : undefined,
    next_step:
      matches.length > 0
        ? "Choose one of the nearby matches and retry with the exact name."
        : "Broaden the lookup or start from discover_salt.",
    raw,
  };
}

function buildRawPayload(
  view: GetSaltEntityContext["view"],
  key: string,
  payload: unknown,
): Record<string, unknown> | undefined {
  return view === "full"
    ? ({ [key]: payload } as Record<string, unknown>)
    : undefined;
}

function buildFoundResult(input: {
  entityType: KnownSaltEntityType;
  why: string;
  entity: Record<string, unknown>;
  nextStep?: string;
  related?: GetSaltEntityResult["related"];
  starterCode?: StarterCodeSnippet[];
  suggestedFollowUps?: GetSaltEntityResult["suggested_follow_ups"];
  raw?: Record<string, unknown>;
}): GetSaltEntityResult {
  return {
    entity_type: input.entityType,
    decision: {
      status: "found",
      why: input.why,
    },
    entity: input.entity,
    related: input.related,
    starter_code: input.starterCode,
    suggested_follow_ups: input.suggestedFollowUps,
    next_step: input.nextStep,
    raw: input.raw,
  };
}

function buildAmbiguityResult(input: {
  entityType: KnownSaltEntityType;
  why: string;
  matches: Array<Record<string, unknown>>;
  ambiguity: Record<string, unknown>;
  nextStep: string;
  didYouMean?: string[];
}): GetSaltEntityResult {
  return {
    entity_type: input.entityType,
    decision: {
      status: "multiple_matches",
      why: input.why,
    },
    entity: null,
    matches: input.matches,
    did_you_mean: input.didYouMean,
    ambiguity: input.ambiguity,
    next_step: input.nextStep,
  };
}

function buildSearchNearMatchResult(
  context: GetSaltEntityContext,
  entityType: KnownSaltEntityType,
  options: {
    package?: string;
    status?: GetSaltEntityInput["status"];
  } = {},
): GetSaltEntityResult {
  const search = searchSaltDocs(context.registry, {
    query: context.lookupValue,
    area: searchAreaForEntityType(entityType),
    package: options.package,
    status: options.status,
    top_k: context.maxResults,
  });

  return buildNearMatchResult(
    entityType,
    toSearchMatches(search.results),
    context.view === "full" ? { search } : undefined,
  );
}

function resolveComponentEntity(
  context: GetSaltEntityContext,
): GetSaltEntityResult {
  const { registry, input, view, maxResults, lookupValue } = context;
  const result = input.name
    ? getComponent(registry, {
        name: input.name,
        package: input.package,
        view,
        include: input.include?.filter((item) =>
          [
            "examples",
            "props",
            "tokens",
            "accessibility",
            "deprecations",
            "changes",
          ].includes(item),
        ) as typeof input.include,
      })
    : ({ component: null } as ReturnType<typeof getComponent>);

  if (result.component) {
    const componentName = String(result.component.name);
    const packageName =
      typeof result.component.package === "string"
        ? result.component.package
        : input.package;
    const component =
      registry.components.find(
        (entry) =>
          entry.name === componentName &&
          (packageName ? entry.package.name === packageName : true),
      ) ?? null;

    return buildFoundResult({
      entityType: "component",
      why: `Resolved ${componentName} as a Salt component.`,
      entity: result.component,
      related:
        input.include_related && componentName
          ? getSuggestedRelated(
              registry,
              "component",
              componentName,
              packageName,
            )
          : undefined,
      starterCode:
        input.include_starter_code && component
          ? createComponentStarterCode(component)
          : undefined,
      suggestedFollowUps: result.suggested_follow_ups,
      nextStep: result.next_step,
      raw: buildRawPayload(view, "component", result),
    });
  }

  if (result.ambiguity) {
    return buildAmbiguityResult({
      entityType: "component",
      why: "Multiple Salt components share that alias.",
      matches: result.ambiguity.matches,
      didYouMean: result.did_you_mean,
      ambiguity: result.ambiguity as Record<string, unknown>,
      nextStep:
        "Choose one of the suggested component names and retry with the exact name.",
    });
  }

  const search = searchSaltDocs(registry, {
    query: lookupValue,
    area: searchAreaForEntityType("component"),
    package: input.package,
    status: input.status,
    top_k: maxResults,
  });

  return buildNearMatchResult(
    "component",
    toSearchMatches(search.results),
    view === "full" ? { search } : undefined,
  );
}

function resolvePatternEntity(
  context: GetSaltEntityContext,
): GetSaltEntityResult {
  const { registry, input, view } = context;
  const result = input.name
    ? getPattern(registry, {
        name: input.name,
        view,
        include: input.include?.filter((item) =>
          ["examples", "accessibility"].includes(item),
        ) as Array<"examples" | "accessibility"> | undefined,
      })
    : ({ pattern: null } as ReturnType<typeof getPattern>);

  if (result.pattern) {
    const patternName = String(result.pattern.name);
    return buildFoundResult({
      entityType: "pattern",
      why: `Resolved ${patternName} as a Salt pattern.`,
      entity: result.pattern,
      related: input.include_related
        ? getSuggestedRelated(registry, "pattern", patternName)
        : undefined,
      starterCode: input.include_starter_code
        ? createPatternStarterCode(registry, patternName)
        : undefined,
      suggestedFollowUps: result.suggested_follow_ups,
      nextStep: result.next_step,
      raw: buildRawPayload(view, "pattern", result),
    });
  }

  if (result.ambiguity) {
    return buildAmbiguityResult({
      entityType: "pattern",
      why: "Multiple Salt patterns share that alias or slug.",
      matches: result.ambiguity.matches,
      didYouMean: result.did_you_mean,
      ambiguity: result.ambiguity as Record<string, unknown>,
      nextStep:
        "Choose one of the suggested pattern names and retry with the exact name.",
    });
  }

  return buildSearchNearMatchResult(context, "pattern");
}

function resolveFoundationEntity(
  context: GetSaltEntityContext,
): GetSaltEntityResult {
  const { registry, input, view, maxResults, lookupValue } = context;
  const exact = input.name
    ? getFoundation(registry, {
        name: input.name,
        include_starter_code: input.include_starter_code,
        view,
      })
    : ({ foundation: null } as ReturnType<typeof getFoundation>);

  if (exact.foundation) {
    const title = String(exact.foundation.title);
    return buildFoundResult({
      entityType: "foundation",
      why: `Resolved ${title} as Salt foundation guidance.`,
      entity: exact.foundation,
      related: input.include_related
        ? getSuggestedRelated(registry, "foundation", title)
        : undefined,
      starterCode: exact.starter_code,
      suggestedFollowUps: exact.suggested_follow_ups,
      nextStep: exact.next_step,
      raw: buildRawPayload(view, "foundation", exact),
    });
  }

  if (exact.ambiguity) {
    return buildAmbiguityResult({
      entityType: "foundation",
      why: "Multiple Salt foundation pages share that title or slug.",
      matches: exact.ambiguity.matches,
      didYouMean: exact.did_you_mean,
      ambiguity: exact.ambiguity as Record<string, unknown>,
      nextStep:
        "Choose one of the suggested foundation titles and retry with the exact name.",
    });
  }

  const list = listFoundations(registry, {
    query: lookupValue,
    max_results: maxResults,
  });

  return buildNearMatchResult(
    "foundation",
    list.foundations,
    view === "full" ? { foundations: list } : undefined,
  );
}

function resolveTokenEntity(
  context: GetSaltEntityContext,
): GetSaltEntityResult {
  const { registry, input, view, maxResults, lookupValue } = context;
  const tokenResult = input.name
    ? getToken(registry, {
        name: input.name,
        include_deprecated: input.include_deprecated,
        max_results: maxResults,
      })
    : null;

  if (tokenResult && tokenResult.tokens.length === 1) {
    const tokenName = String(tokenResult.tokens[0]?.name ?? "Token");
    return buildFoundResult({
      entityType: "token",
      why: `Resolved ${tokenName} as a Salt design token.`,
      entity: tokenResult.tokens[0] ?? {},
      related: input.include_related
        ? getSuggestedRelated(registry, "token", tokenName)
        : undefined,
      nextStep: getTokenNextStep(
        tokenResult.tokens[0] as Parameters<typeof getTokenNextStep>[0],
      ),
      raw: buildRawPayload(view, "token_result", tokenResult),
    });
  }

  const search = searchSaltDocs(registry, {
    query: lookupValue,
    area: searchAreaForEntityType("token"),
    top_k: maxResults,
  });
  const tokenMatches = search.results.filter(
    (result) => result.type === "token",
  );

  if (!input.name && shouldResolveNearMatch(tokenMatches)) {
    const resolvedTokenName = tokenMatches[0]?.name;
    const resolvedToken = resolvedTokenName
      ? getToken(registry, {
          name: resolvedTokenName,
          include_deprecated: input.include_deprecated,
          max_results: 1,
        })
      : null;

    if (resolvedToken && resolvedToken.tokens.length === 1) {
      const tokenName = String(resolvedToken.tokens[0]?.name ?? "Token");
      return buildFoundResult({
        entityType: "token",
        why: `Resolved ${lookupValue} to the closest Salt design token, ${tokenName}.`,
        entity: resolvedToken.tokens[0] ?? {},
        related: input.include_related
          ? getSuggestedRelated(registry, "token", tokenName)
          : undefined,
        nextStep: getTokenNextStep(
          resolvedToken.tokens[0] as Parameters<typeof getTokenNextStep>[0],
        ),
        raw:
          view === "full"
            ? {
                search,
                token_result: resolvedToken,
              }
            : undefined,
      });
    }
  }

  if (tokenResult && tokenResult.tokens.length > 1) {
    return {
      entity_type: "token",
      decision: {
        status: "results",
        why: "Multiple Salt tokens match the provided lookup.",
      },
      entity: null,
      matches: tokenResult.tokens,
      next_step:
        "Choose the closest token name and retry with an exact token lookup.",
      raw: view === "full" ? { token_result: tokenResult } : undefined,
    };
  }

  return buildNearMatchResult(
    "token",
    toSearchMatches(tokenMatches.length > 0 ? tokenMatches : search.results),
    view === "full" ? { search } : undefined,
  );
}

function resolveGuideEntity(
  context: GetSaltEntityContext,
): GetSaltEntityResult {
  const { registry, input, view } = context;
  const result = input.name
    ? getGuide(registry, {
        name: input.name,
        view,
      })
    : ({ guide: null } as ReturnType<typeof getGuide>);

  if (result.guide) {
    const guideName = String(result.guide.name);
    return buildFoundResult({
      entityType: "guide",
      why: `Resolved ${guideName} as Salt guide content.`,
      entity: result.guide,
      related: input.include_related
        ? getSuggestedRelated(registry, "guide", guideName)
        : undefined,
      nextStep: `Review the ${guideName} guidance and apply the relevant setup steps.`,
      raw: buildRawPayload(view, "guide", result),
    });
  }

  if (result.ambiguity) {
    return buildAmbiguityResult({
      entityType: "guide",
      why: "Multiple Salt guides share that alias.",
      matches: result.ambiguity.matches,
      didYouMean: result.did_you_mean,
      ambiguity: result.ambiguity as Record<string, unknown>,
      nextStep:
        "Choose one of the suggested guide names and retry with the exact name.",
    });
  }

  return buildSearchNearMatchResult(context, "guide");
}

function resolvePageEntity(context: GetSaltEntityContext): GetSaltEntityResult {
  const { registry, input, view } = context;
  const result = input.name
    ? getPage(registry, {
        name: input.name,
        view,
      })
    : ({ page: null } as ReturnType<typeof getPage>);

  if (result.page) {
    const pageTitle = String(result.page.title);
    return buildFoundResult({
      entityType: "page",
      why: `Resolved ${pageTitle} as a Salt docs page.`,
      entity: result.page,
      related: input.include_related
        ? getSuggestedRelated(registry, "page", pageTitle)
        : undefined,
      nextStep: `Review ${pageTitle} and apply the referenced Salt guidance.`,
      raw: buildRawPayload(view, "page", result),
    });
  }

  if (result.ambiguity) {
    return buildAmbiguityResult({
      entityType: "page",
      why: "Multiple Salt pages share that title or slug.",
      matches: result.ambiguity.matches,
      didYouMean: result.did_you_mean,
      ambiguity: result.ambiguity as Record<string, unknown>,
      nextStep:
        "Choose one of the suggested page titles and retry with the exact name.",
    });
  }

  return buildSearchNearMatchResult(context, "page");
}

function resolvePackageEntity(
  context: GetSaltEntityContext,
): GetSaltEntityResult {
  const { registry, input, view } = context;
  const result = input.name
    ? getPackage(registry, {
        name: input.name,
        include: input.include?.includes("changes") ? ["changes"] : undefined,
      })
    : ({ package: null } as ReturnType<typeof getPackage>);

  if (result.package) {
    return buildFoundResult({
      entityType: "package",
      why: `Resolved ${String(result.package.name)} as a Salt package.`,
      entity: result.package,
      nextStep: `Review ${String(result.package.name)} before upgrading or importing from it.`,
      raw: buildRawPayload(view, "package", result),
    });
  }

  return buildSearchNearMatchResult(context, "package");
}

function resolveIconEntity(context: GetSaltEntityContext): GetSaltEntityResult {
  const { registry, input, view, maxResults, lookupValue } = context;
  const exact = input.name
    ? getIcon(registry, {
        name: input.name,
        view,
      })
    : ({ icon: null } as ReturnType<typeof getIcon>);

  if (exact.icon) {
    return buildFoundResult({
      entityType: "icon",
      why: `Resolved ${String(exact.icon.name)} as a Salt icon.`,
      entity: exact.icon,
      nextStep: `Confirm ${String(exact.icon.name)} is the right visual metaphor before using it.`,
      raw: buildRawPayload(view, "icon", exact),
    });
  }

  if (exact.ambiguity) {
    return buildAmbiguityResult({
      entityType: "icon",
      why: "Multiple Salt icons share that base name or alias.",
      matches: exact.ambiguity.matches,
      ambiguity: exact.ambiguity as Record<string, unknown>,
      nextStep:
        "Choose one of the suggested icons and retry with the exact export name.",
    });
  }

  const icons = getIcons(registry, {
    query: lookupValue,
    status: input.status,
    max_results: maxResults,
  });

  return buildNearMatchResult(
    "icon",
    icons.icons,
    view === "full" ? { icons } : undefined,
  );
}

function resolveCountrySymbolEntity(
  context: GetSaltEntityContext,
): GetSaltEntityResult {
  const { registry, input, view, maxResults, lookupValue } = context;
  const exact = input.name
    ? getCountrySymbol(registry, {
        name: input.name,
        view,
      })
    : ({ country_symbol: null } as ReturnType<typeof getCountrySymbol>);

  if (exact.country_symbol) {
    return buildFoundResult({
      entityType: "country_symbol",
      why: `Resolved ${String(exact.country_symbol.name)} as a Salt country symbol.`,
      entity: exact.country_symbol,
      nextStep: `Confirm the ${String(exact.country_symbol.code)} symbol variant you need before using it.`,
      raw: buildRawPayload(view, "country_symbol", exact),
    });
  }

  if (exact.ambiguity) {
    return buildAmbiguityResult({
      entityType: "country_symbol",
      why: "Multiple Salt country symbols share that alias.",
      matches: exact.ambiguity.matches,
      ambiguity: exact.ambiguity as Record<string, unknown>,
      nextStep:
        "Choose one of the suggested country symbols and retry with the exact code or name.",
    });
  }

  const countrySymbols = getCountrySymbols(registry, {
    query: lookupValue,
    status: input.status,
    max_results: maxResults,
  });

  return buildNearMatchResult(
    "country_symbol",
    countrySymbols.country_symbols,
    view === "full" ? { country_symbols: countrySymbols } : undefined,
  );
}

const ENTITY_RESOLVERS: Record<KnownSaltEntityType, EntityResolver> = {
  component: resolveComponentEntity,
  pattern: resolvePatternEntity,
  foundation: resolveFoundationEntity,
  token: resolveTokenEntity,
  guide: resolveGuideEntity,
  page: resolvePageEntity,
  package: resolvePackageEntity,
  icon: resolveIconEntity,
  country_symbol: resolveCountrySymbolEntity,
};

export function createGetSaltEntityContext(
  registry: SaltRegistry,
  input: GetSaltEntityInput,
): GetSaltEntityContext {
  return {
    registry,
    input,
    view: input.view ?? "compact",
    maxResults: clampMaxResults(input.max_results, 5, 50),
    lookupValue: input.name?.trim() || input.query?.trim() || "",
  };
}

export function resolveAutoSaltEntity(
  context: GetSaltEntityContext,
): GetSaltEntityResult {
  const { registry, input, lookupValue, maxResults, view } = context;

  if (!lookupValue) {
    return {
      entity_type: null,
      decision: {
        status: "not_found",
        why: "Provide a Salt entity name or query to resolve.",
      },
      entity: null,
      next_step:
        "Pass a component, pattern, token, guide, page, icon, or country symbol name.",
    };
  }

  const search = searchSaltDocs(registry, {
    query: lookupValue,
    package: input.package,
    status: input.status,
    top_k: maxResults,
  });
  const resolvedType = search.results[0]?.type
    ? mapSearchTypeToEntityType(search.results[0].type)
    : null;

  if (resolvedType) {
    const resolved = resolveKnownSaltEntity(
      createGetSaltEntityContext(registry, {
        ...input,
        entity_type: resolvedType,
        name: search.results[0]?.name ?? lookupValue,
        query: undefined,
        package:
          resolvedType === "component"
            ? (search.results[0]?.package ?? input.package)
            : input.package,
      }),
      resolvedType,
    );

    return {
      ...resolved,
      raw:
        view === "full"
          ? {
              auto_search: search,
              resolved: resolved.raw ?? resolved.entity,
            }
          : resolved.raw,
    };
  }

  return {
    entity_type: null,
    decision: {
      status: search.results.length > 0 ? "results" : "not_found",
      why:
        search.results.length > 0
          ? "The query matched Salt content, but not a canonical lookup entity."
          : "No matching Salt entity was found.",
    },
    entity: null,
    matches:
      search.results.length > 0 ? toSearchMatches(search.results) : undefined,
    next_step:
      search.results.length > 0
        ? "Use discover_salt for broader routing, or retry with a more exact entity name."
        : "Broaden the query or start from discover_salt.",
    raw: view === "full" ? { search } : undefined,
  };
}

export function resolveKnownSaltEntity(
  context: GetSaltEntityContext,
  entityType: KnownSaltEntityType,
): GetSaltEntityResult {
  return ENTITY_RESOLVERS[entityType](context);
}
