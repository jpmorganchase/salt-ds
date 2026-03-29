import type { SaltRegistry, SearchIndexEntry } from "../types.js";
import type {
  ClarifyingQuestion,
  DiscoverSaltDecision,
} from "./discoverSalt.js";
import type { getRelatedEntities } from "./getRelatedEntities.js";
import {
  type GuideReference,
  getRelevantGuidesForRecords,
} from "./guideAwareness.js";
import type { listSaltCatalog } from "./listSaltCatalog.js";
import type { searchSaltDocs } from "./searchSaltDocs.js";

type SearchResultLike = ReturnType<typeof searchSaltDocs>["results"][number];
type CatalogResult = ReturnType<typeof listSaltCatalog>;
type RelatedEntitiesResult = ReturnType<typeof getRelatedEntities>;

export function getDiscoverRelatedGuides(
  registry: SaltRegistry,
  records: unknown[],
): GuideReference[] | undefined {
  const guides = getRelevantGuidesForRecords(registry, records, {
    top_k: 4,
  });

  return guides.length > 0 ? guides : undefined;
}

export function toGuideReferenceArray(
  value: Array<Record<string, unknown>>,
): GuideReference[] {
  return value.flatMap((guide) => {
    const relatedDocs =
      guide.related_docs && typeof guide.related_docs === "object"
        ? (guide.related_docs as { overview?: unknown })
        : null;
    const name = typeof guide.name === "string" ? guide.name : null;
    const kind = typeof guide.kind === "string" ? guide.kind : null;
    const summary = typeof guide.summary === "string" ? guide.summary : null;
    const overview =
      typeof relatedDocs?.overview === "string" ? relatedDocs.overview : null;

    return name && kind && summary
      ? [
          {
            name,
            kind: kind as GuideReference["kind"],
            summary,
            overview,
          },
        ]
      : [];
  });
}

export function getDecisionGuidanceSources(
  decision: DiscoverSaltDecision | null,
): string[] | undefined {
  const record =
    decision?.result && typeof decision.result === "object"
      ? (decision.result as Record<string, unknown>)
      : null;
  const guidanceSources = Array.isArray(record?.guidance_sources)
    ? record.guidance_sources.filter(
        (entry): entry is string => typeof entry === "string",
      )
    : [];

  return guidanceSources.length > 0 ? [...new Set(guidanceSources)] : undefined;
}

function getRecordGuidanceSources(
  record: Record<string, unknown> | undefined,
): string[] {
  return Array.isArray(record?.guidance_sources)
    ? [
        ...new Set(
          record.guidance_sources.filter(
            (entry): entry is string => typeof entry === "string",
          ),
        ),
      ]
    : [];
}

export function buildRoutingDebug(input: {
  decision: DiscoverSaltDecision | null;
  components?: Array<Record<string, unknown>>;
  patterns?: Array<Record<string, unknown>>;
  foundations?: Array<Record<string, unknown>>;
  tokens?: Array<Record<string, unknown>>;
  docs?: Array<Record<string, unknown>>;
}) {
  return {
    chosen_workflow: input.decision?.workflow ?? null,
    decision_guidance_sources: getDecisionGuidanceSources(input.decision) ?? [],
    top_component_guidance_sources: getRecordGuidanceSources(
      input.components?.[0],
    ),
    top_pattern_guidance_sources: getRecordGuidanceSources(input.patterns?.[0]),
    top_foundation_guidance_sources: getRecordGuidanceSources(
      input.foundations?.[0],
    ),
    top_token_guidance_sources: getRecordGuidanceSources(input.tokens?.[0]),
    top_doc_guidance_sources: getRecordGuidanceSources(input.docs?.[0]),
  };
}

function toDecisionFromSearchResult(
  result: SearchResultLike | undefined,
): DiscoverSaltDecision | null {
  if (!result) {
    return null;
  }

  switch (result.type) {
    case "component":
      return {
        workflow: "get_salt_entity",
        why: "The closest match looks like a specific Salt component.",
        args: {
          entity_type: "component",
          name: result.name,
          package: result.package ?? undefined,
        },
        result: {
          name: result.name,
          summary: result.summary,
          package: result.package,
        },
      };
    case "pattern":
      return {
        workflow: "get_salt_entity",
        why: "The closest match looks like a specific Salt pattern.",
        args: {
          entity_type: "pattern",
          name: result.name,
        },
        result: {
          name: result.name,
          summary: result.summary,
        },
      };
    case "guide":
    case "page":
    case "token":
    case "package":
    case "icon":
    case "country_symbol":
      return {
        workflow: "get_salt_entity",
        why: "The closest match looks like a specific Salt entity.",
        args: {
          entity_type:
            result.type === "country_symbol" ? "country_symbol" : result.type,
          name: result.name,
        },
        result: {
          name: result.name,
          summary: result.summary,
          package: result.package,
        },
      };
    case "example":
      return {
        workflow: "get_salt_examples",
        why: "The closest match is an implementation example.",
        args: {
          query: result.name,
        },
        result: {
          title: result.name,
          summary: result.summary,
        },
      };
    case "change":
      return {
        workflow: "compare_salt_versions",
        why: "The closest match is upgrade or change history content.",
        args: {
          package: result.package ?? undefined,
          from_version: "1.0.0",
        },
        result: {
          title: result.name,
          summary: result.summary,
        },
      };
    default:
      return {
        workflow: "discover_salt",
        why: "Stay in discovery mode and narrow further from the nearest docs result.",
        args: {
          query: result.name,
        },
        result: {
          title: result.name,
          summary: result.summary,
        },
      };
  }
}

function toDecisionFromDocOption(
  doc: Record<string, unknown> | undefined,
): DiscoverSaltDecision | null {
  if (!doc || typeof doc.type !== "string") {
    return null;
  }

  const type = doc.type as SearchIndexEntry["type"];
  const name = String(doc.title ?? "");
  const summary = String(doc.summary ?? "");
  const packageName = typeof doc.package === "string" ? doc.package : null;

  return toDecisionFromSearchResult({
    id: "search-result",
    type,
    name,
    package: packageName,
    status:
      doc.status === "stable" ||
      doc.status === "beta" ||
      doc.status === "lab" ||
      doc.status === "deprecated"
        ? doc.status
        : null,
    summary,
    score: 0,
    match_reasons: [],
    score_breakdown: {
      name_exact: 0,
      name_phrase: 0,
      summary_phrase: 0,
      content_phrase: 0,
      name_tokens: 0,
      summary_tokens: 0,
      content_tokens: 0,
      keyword_tokens: 0,
    },
    matched_keywords: [],
    matched_excerpt: typeof doc.why === "string" ? doc.why : null,
    source_url:
      Array.isArray(doc.docs) && typeof doc.docs[0] === "string"
        ? doc.docs[0]
        : null,
  });
}

export function chooseRouteDecision(input: {
  query: string;
  foundationScore: number;
  tokenScore: number;
  patternScore: number;
  foundations: Array<Record<string, unknown>>;
  tokens: Array<Record<string, unknown>>;
  patterns: Array<Record<string, unknown>>;
  components: Array<Record<string, unknown>>;
  docs: Array<Record<string, unknown>>;
  apiSurface: Array<Record<string, unknown>>;
}): DiscoverSaltDecision | null {
  const {
    query,
    foundationScore,
    tokenScore,
    patternScore,
    foundations,
    tokens,
    patterns,
    components,
    docs,
    apiSurface,
  } = input;
  const looksLikeScreenTranslation =
    /\b(screen|page|layout|dashboard|form|app shell|app-shell|wireframe)\b/.test(
      query,
    ) &&
    /\b(sidebar|header|footer|content|toolbar|filter|dialog|modal|loading|error|validation)\b/.test(
      query,
    );

  if (
    /\b(figma|mockup|screenshot)\b/.test(query) ||
    looksLikeScreenTranslation ||
    ((/\b(convert|translate|port|adopt|replace|rewrite|rebuild)\b/.test(
      query,
    ) ||
      /\bmigrate\b.*\bto salt\b/.test(query)) &&
      /\b(salt|design system|component library|ui library|external ui|third-party ui|third-party component library|legacy app|existing app)\b/.test(
        query,
      ))
  ) {
    return {
      workflow: "translate_ui_to_salt",
      why: "The request sounds like translating external UI into Salt, so start from a Salt adoption plan before narrowing to specific components.",
      args: {
        query,
        include_starter_code: true,
        view: "full",
      },
      result: patterns[0] ?? components[0] ?? docs[0] ?? null,
    };
  }

  if (
    foundations.length > 0 &&
    foundationScore >= tokenScore &&
    foundationScore >= patternScore &&
    foundationScore > 0
  ) {
    return {
      workflow: "get_salt_entity",
      why: "The query looks foundation-oriented, so start from the closest foundation guidance.",
      args: {
        entity_type: "foundation",
        name: foundations[0]?.title,
      },
      result: foundations[0] ?? null,
    };
  }

  if (tokens.length > 0 && tokenScore >= patternScore && tokenScore > 0) {
    return {
      workflow: "choose_salt_solution",
      why: "The query looks styling-oriented, so start from token selection.",
      args: {
        solution_type: "token",
        query,
      },
      result: tokens[0] ?? null,
    };
  }

  if (patterns.length > 0 && patternScore > 0) {
    return {
      workflow: "choose_salt_solution",
      why: "The query sounds like a pattern or flow problem, so start from composition guidance.",
      args: {
        solution_type: "pattern",
        query,
      },
      result: patterns[0] ?? null,
    };
  }

  if (components.length > 0) {
    return {
      workflow: "choose_salt_solution",
      why: "The query sounds like a component choice problem, so start from the strongest component fit.",
      args: {
        solution_type: "component",
        query,
      },
      result: components[0] ?? null,
    };
  }

  if (apiSurface.length > 0) {
    return {
      workflow: "get_salt_entity",
      why: "The query looks like a prop or API lookup, so start from the component that exposes the closest prop match.",
      args: {
        entity_type: "component",
        name: apiSurface[0]?.component,
        include: ["props"],
      },
      result: apiSurface[0] ?? null,
    };
  }

  return toDecisionFromDocOption(docs[0]);
}

export function getClarifyingQuestions(input: {
  query: string;
  production_ready?: boolean;
  prefer_stable?: boolean;
  a11y_required?: boolean;
  form_field_support?: boolean;
  components: Array<Record<string, unknown>>;
  foundationScore: number;
  tokenScore: number;
  patternScore: number;
}): ClarifyingQuestion[] {
  const questions: ClarifyingQuestion[] = [];
  const { query } = input;

  if (
    /\b(select|choose|pick|option|dropdown|combo)\b/.test(query) &&
    !/\b(single|multi|multiple)\b/.test(query)
  ) {
    questions.push({
      id: "selection-mode",
      question: "Is this a single-select or multi-select interaction?",
      why: "That changes the likely Salt component family.",
      options: ["Single-select", "Multi-select", "Not sure yet"],
    });
  }

  if (
    /\b(button|link|action|cta|target)\b/.test(query) &&
    !/\b(route|href|navigation|navigate)\b/.test(query)
  ) {
    questions.push({
      id: "navigation-vs-action",
      question:
        "Should this navigate somewhere, or trigger an in-place action?",
      why: "Navigation and action intent usually map to different Salt primitives.",
      options: ["Navigation", "In-place action", "Both"],
    });
  }

  if (
    /\b(form|input|field|login|sign in|signin|picker)\b/.test(query) &&
    input.form_field_support === undefined
  ) {
    questions.push({
      id: "form-field-support",
      question:
        "Does this need FormField-style labeling and validation support?",
      why: "That narrows the best examples and starter scaffolds.",
      options: ["Yes", "No", "Not sure"],
    });
  }

  if (
    input.production_ready === undefined &&
    input.prefer_stable === undefined &&
    input.components.some(
      (item) => typeof item.status === "string" && item.status !== "stable",
    )
  ) {
    questions.push({
      id: "stable-only",
      question: "Do you need production-ready stable components only?",
      why: "Some close matches may still be beta or lab.",
      options: ["Stable only", "Stable preferred", "Open to beta or lab"],
    });
  }

  const strongSignals = [
    input.foundationScore > 0,
    input.tokenScore > 0,
    input.patternScore > 0,
  ].filter(Boolean).length;
  const scores = [input.foundationScore, input.tokenScore, input.patternScore]
    .filter((score) => score > 0)
    .sort((left, right) => right - left);

  if (strongSignals > 1 && scores.length > 1 && scores[0] - scores[1] <= 1) {
    questions.push({
      id: "guidance-vs-implementation",
      question:
        "Do you want design guidance, a specific implementation direction, or both?",
      why: "The query is pulling equally toward foundations and implementation help.",
      options: ["Design guidance", "Implementation direction", "Both"],
    });
  }

  if (
    input.a11y_required === undefined &&
    /\b(form|input|action|menu|dialog)\b/.test(query)
  ) {
    questions.push({
      id: "a11y-priority",
      question:
        "Should accessibility guidance be treated as a hard requirement?",
      why: "That can remove candidates with thinner accessibility coverage.",
      options: ["Required", "Preferred", "Not a filter"],
    });
  }

  return questions.slice(0, 3);
}

export function getCatalogDecision(
  catalog: CatalogResult,
): DiscoverSaltDecision | null {
  const [first] = catalog.items;
  if (!first) {
    return null;
  }

  if (first.type === "change") {
    return {
      workflow: "compare_salt_versions",
      why: "The current browse view is change-oriented, so version comparison is the next step.",
      args: {
        package: first.package ?? undefined,
        from_version: "1.0.0",
      },
      result: {
        title: first.name,
        summary: first.summary,
      },
    };
  }

  if (first.type === "example") {
    return {
      workflow: "get_salt_examples",
      why: "The current browse view is example-oriented, so jump straight to examples.",
      args: {
        query: first.name,
      },
      result: {
        title: first.name,
        summary: first.summary,
      },
    };
  }

  return {
    workflow: "get_salt_entity",
    why: "The current browse view already has a likely Salt entity to inspect next.",
    args: {
      entity_type:
        first.type === "country_symbol" ? "country_symbol" : first.type,
      name: first.name,
      package: first.package ?? undefined,
    },
    result: {
      name: first.name,
      type: first.type,
      summary: first.summary,
    },
  };
}

export function getRelatedDecision(
  related: RelatedEntitiesResult,
): DiscoverSaltDecision | null {
  const firstComponent = related.related.components[0];
  if (firstComponent) {
    return {
      workflow: "get_salt_entity",
      why: "The related component is the closest next lookup.",
      args: {
        entity_type: "component",
        name: firstComponent.name,
        package:
          typeof firstComponent.package === "string"
            ? firstComponent.package
            : undefined,
      },
      result: firstComponent,
    };
  }

  const firstPattern = related.related.patterns[0];
  if (firstPattern) {
    return {
      workflow: "get_salt_entity",
      why: "The related pattern is the closest next lookup.",
      args: {
        entity_type: "pattern",
        name: firstPattern.name,
      },
      result: firstPattern,
    };
  }

  const firstToken = related.related.tokens[0];
  if (firstToken) {
    return {
      workflow: "get_salt_entity",
      why: "The related token is the closest next lookup.",
      args: {
        entity_type: "token",
        name: firstToken.name,
      },
      result: firstToken,
    };
  }

  return null;
}
