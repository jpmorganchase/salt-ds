import type {
  ComponentRecord,
  ExampleRecord,
  PatternRecord,
  TokenRecord,
  UsageSemanticsRecord,
} from "../types.js";
import { tokenize, unique } from "./utils.js";

export interface QueryField {
  key: string;
  value: string;
  exact_weight?: number;
  phrase_weight: number;
  token_weight: number;
}

export interface QueryScore {
  score: number;
  matched_terms: string[];
  match_reasons: string[];
}

export interface SemanticsQueryScore {
  score_adjustment: number;
  matched_terms: string[];
  match_reasons: string[];
}

export function getEffectiveUsageSemantics(
  record: Pick<
    ComponentRecord | PatternRecord,
    "category" | "when_to_use" | "when_not_to_use" | "semantics"
  >,
): UsageSemanticsRecord | undefined {
  const category = record.category ?? [];

  if (record.semantics) {
    return record.semantics;
  }

  if (
    category.length === 0 &&
    record.when_to_use.length === 0 &&
    record.when_not_to_use.length === 0
  ) {
    return undefined;
  }

  return {
    category,
    preferred_for: record.when_to_use,
    not_for: record.when_not_to_use,
    derived_from: [],
  };
}

function normalizeLookup(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function scoreQueryFields(
  query: string,
  fields: QueryField[],
): QueryScore {
  if (!query) {
    return { score: 0, matched_terms: [], match_reasons: [] };
  }

  const queryTokens = tokenize(query);
  const matchedTerms = new Set<string>();
  const matchReasons = new Set<string>();
  let score = 0;

  for (const field of fields) {
    const normalizedValue = field.value.toLowerCase();
    if (!normalizedValue) {
      continue;
    }

    if (field.exact_weight && normalizedValue === query) {
      score += field.exact_weight;
      matchReasons.add(`${field.key}_exact`);
    } else if (normalizedValue.includes(query)) {
      score += field.phrase_weight;
      matchReasons.add(`${field.key}_phrase`);
    }

    for (const token of queryTokens) {
      if (!normalizedValue.includes(token)) {
        continue;
      }

      score += field.token_weight;
      matchedTerms.add(token);
      matchReasons.add(`${field.key}_tokens`);
    }
  }

  return {
    score,
    matched_terms: [...matchedTerms].sort((left, right) =>
      left.localeCompare(right),
    ),
    match_reasons: [...matchReasons].sort((left, right) =>
      left.localeCompare(right),
    ),
  };
}

export function scoreUsageSemantics(
  query: string,
  semantics?: UsageSemanticsRecord,
): SemanticsQueryScore {
  if (!query || !semantics) {
    return {
      score_adjustment: 0,
      matched_terms: [],
      match_reasons: [],
    };
  }

  const positiveSignals = scoreQueryFields(query, [
    {
      key: "semantics_preferred_for",
      value: semantics.preferred_for.join(" "),
      phrase_weight: 10,
      token_weight: 4,
    },
    {
      key: "semantics_category",
      value: semantics.category.join(" "),
      phrase_weight: 7,
      token_weight: 3,
    },
  ]);
  const negativeSignals = scoreQueryFields(query, [
    {
      key: "semantics_not_for",
      value: semantics.not_for.join(" "),
      phrase_weight: 10,
      token_weight: 4,
    },
  ]);

  return {
    score_adjustment: positiveSignals.score - negativeSignals.score,
    matched_terms: unique([
      ...positiveSignals.matched_terms,
      ...negativeSignals.matched_terms,
    ]).sort((left, right) => left.localeCompare(right)),
    match_reasons: unique([
      ...positiveSignals.match_reasons,
      ...(negativeSignals.score > 0 ? ["semantics_not_for_penalty"] : []),
    ]).sort((left, right) => left.localeCompare(right)),
  };
}

export function inferExampleScenarioTags(example: ExampleRecord): string[] {
  const combined = [
    example.title,
    example.source_url,
    example.code,
    ...example.intent,
  ]
    .filter((value): value is string => Boolean(value))
    .join(" ")
    .toLowerCase();
  const tags = new Set<string>();

  if (/form[\s-]?field|helper text|label placement/.test(combined)) {
    tags.add("form-field");
  }
  if (/validation|error|warning|success/.test(combined)) {
    tags.add("validation");
  }
  if (/responsive|breakpoint|xs|sm|md|lg|xl/.test(combined)) {
    tags.add("responsive");
  }
  if (/a11y|accessibility|aria-|keyboard/.test(combined)) {
    tags.add("accessibility");
  }
  if (/async|loading|promise|fetch|await/.test(combined)) {
    tags.add("async");
  }
  if (/disabled/.test(combined)) {
    tags.add("disabled");
  }
  if (/read[\s-]?only|readonly/.test(combined)) {
    tags.add("read-only");
  }
  if (/keyboard/.test(combined)) {
    tags.add("keyboard");
  }
  if (/grid|layout|splitlayout|stacklayout|flowlayout/.test(combined)) {
    tags.add("layout");
  }

  return [...tags].sort((left, right) => left.localeCompare(right));
}

export function inferExampleFrameworkHints(example: ExampleRecord): string[] {
  const code = example.code ?? "";
  const hints = new Set<string>();

  if (
    /<[A-Z][A-Za-z0-9]*/.test(code) ||
    /from\s+["']react["']/.test(code) ||
    /from\s+["']@salt-ds\//.test(code)
  ) {
    hints.add("react");
  }

  if (example.source_url?.includes("storybook")) {
    hints.add("storybook");
  }

  return [...hints].sort((left, right) => left.localeCompare(right));
}

export function inferExamplePackageHints(example: ExampleRecord): string[] {
  const matches = [
    ...(example.package ? [example.package] : []),
    ...[...example.code.matchAll(/@salt-ds\/[a-z0-9-]+/gi)].map(
      (match) => match[0],
    ),
  ];

  return unique(matches).sort((left, right) => left.localeCompare(right));
}

export function inferExampleRepoSourceCandidates(
  example: ExampleRecord,
): string[] {
  const slug = normalizeLookup(example.target_name);
  if (!slug) {
    return [];
  }

  if (example.target_type === "pattern") {
    return [`packages/core/stories/patterns/${slug}/${slug}.stories.tsx`];
  }

  if (example.package === "@salt-ds/lab") {
    return [`packages/lab/stories/${slug}/${slug}.stories.tsx`];
  }
  if (example.package === "@salt-ds/core") {
    return [`packages/core/stories/${slug}/${slug}.stories.tsx`];
  }

  return example.package
    ? [
        `packages/${example.package.replace(/^@salt-ds\//, "")}/stories/${slug}/${slug}.stories.tsx`,
      ]
    : [];
}

export function inferComponentCapabilities(
  component: ComponentRecord,
): string[] {
  const exampleText = component.examples
    .flatMap((example) => [
      example.title,
      example.code,
      example.source_url,
      ...example.intent,
    ])
    .filter((value): value is string => Boolean(value))
    .join(" ")
    .toLowerCase();
  const propNames = component.props.map((prop) => prop.name.toLowerCase());
  const accessibilityText = [
    ...component.accessibility.summary,
    ...component.accessibility.rules.map((rule) => rule.rule),
  ]
    .join(" ")
    .toLowerCase();
  const capabilities = new Set<string>();

  if (
    /form[\s-]?field/.test(exampleText) ||
    propNames.includes("validationstatus") ||
    component.tags.includes("form")
  ) {
    capabilities.add("form-field");
  }
  if (
    propNames.includes("validationstatus") ||
    /validation|error|warning|success/.test(exampleText)
  ) {
    capabilities.add("validation");
  }
  if (
    component.accessibility.summary.length > 0 ||
    component.accessibility.rules.length > 0
  ) {
    capabilities.add("accessibility-guidance");
  }
  if (/keyboard/.test(accessibilityText) || /keyboard/.test(exampleText)) {
    capabilities.add("keyboard-guidance");
  }
  if (
    propNames.includes("readonly") ||
    /read[\s-]?only|readonly/.test(exampleText)
  ) {
    capabilities.add("read-only");
  }
  if (propNames.includes("disabled") || /disabled/.test(exampleText)) {
    capabilities.add("disabled");
  }
  if (/async|loading|promise|fetch|await/.test(exampleText)) {
    capabilities.add("async");
  }
  if (
    component.props.some((prop) => prop.deprecated) ||
    component.deprecations.length > 0
  ) {
    capabilities.add("deprecations");
  }
  if (component.tokens.length > 0) {
    capabilities.add("theming");
  }
  if (component.examples.length > 0) {
    capabilities.add("examples");
  }
  if (component.patterns.length > 0) {
    capabilities.add("patterns");
  }

  return [...capabilities].sort((left, right) => left.localeCompare(right));
}

export function getComponentQueryFields(
  component: ComponentRecord,
): QueryField[] {
  const capabilities = inferComponentCapabilities(component).join(" ");
  const semantics = component.semantics;

  return [
    {
      key: "name",
      value: component.name,
      exact_weight: 20,
      phrase_weight: 12,
      token_weight: 5,
    },
    {
      key: "summary",
      value: component.summary,
      phrase_weight: 8,
      token_weight: 3,
    },
    {
      key: "when_to_use",
      value: component.when_to_use.join(" "),
      phrase_weight: 9,
      token_weight: 4,
    },
    {
      key: "tags",
      value: [
        ...component.category,
        ...component.tags,
        ...component.patterns,
      ].join(" "),
      phrase_weight: 6,
      token_weight: 3,
    },
    {
      key: "props",
      value: component.props
        .flatMap((prop) => [
          prop.name,
          prop.type,
          prop.description,
          ...(prop.allowed_values ?? []).map(String),
        ])
        .join(" "),
      phrase_weight: 5,
      token_weight: 2,
    },
    {
      key: "examples",
      value: component.examples
        .flatMap((example) => [example.title, ...example.intent])
        .join(" "),
      phrase_weight: 6,
      token_weight: 2,
    },
    {
      key: "capabilities",
      value: capabilities,
      phrase_weight: 6,
      token_weight: 3,
    },
    {
      key: "semantics_preferred_for",
      value: semantics?.preferred_for.join(" ") ?? "",
      phrase_weight: 10,
      token_weight: 4,
    },
    {
      key: "semantics_category",
      value: semantics?.category.join(" ") ?? "",
      phrase_weight: 7,
      token_weight: 3,
    },
  ];
}

export function getPatternQueryFields(pattern: PatternRecord): QueryField[] {
  const semantics = pattern.semantics;

  return [
    {
      key: "name",
      value: pattern.name,
      exact_weight: 18,
      phrase_weight: 10,
      token_weight: 4,
    },
    {
      key: "summary",
      value: pattern.summary,
      phrase_weight: 8,
      token_weight: 3,
    },
    {
      key: "aliases",
      value: pattern.aliases.join(" "),
      phrase_weight: 8,
      token_weight: 3,
    },
    {
      key: "when_to_use",
      value: pattern.when_to_use.join(" "),
      phrase_weight: 9,
      token_weight: 4,
    },
    {
      key: "category",
      value: (pattern.category ?? []).join(" "),
      phrase_weight: 6,
      token_weight: 3,
    },
    {
      key: "how_to_build",
      value: [...pattern.how_to_build, ...pattern.how_it_works].join(" "),
      phrase_weight: 7,
      token_weight: 3,
    },
    {
      key: "related_patterns",
      value: pattern.related_patterns.join(" "),
      phrase_weight: 6,
      token_weight: 2,
    },
    {
      key: "examples",
      value: pattern.examples
        .flatMap((example) => [example.title, ...example.intent])
        .join(" "),
      phrase_weight: 6,
      token_weight: 2,
    },
    {
      key: "components",
      value: pattern.composed_of
        .map((entry) => `${entry.component} ${entry.role ?? ""}`)
        .join(" "),
      phrase_weight: 6,
      token_weight: 3,
    },
    {
      key: "accessibility",
      value: pattern.accessibility.summary.join(" "),
      phrase_weight: 5,
      token_weight: 2,
    },
    {
      key: "docs",
      value: pattern.related_docs.overview ?? "",
      phrase_weight: 4,
      token_weight: 2,
    },
    {
      key: "semantics_preferred_for",
      value: semantics?.preferred_for.join(" ") ?? "",
      phrase_weight: 10,
      token_weight: 4,
    },
    {
      key: "semantics_category",
      value: semantics?.category.join(" ") ?? "",
      phrase_weight: 7,
      token_weight: 3,
    },
  ];
}

export function getTokenQueryFields(token: TokenRecord): QueryField[] {
  return [
    {
      key: "name",
      value: token.name,
      exact_weight: 18,
      phrase_weight: 10,
      token_weight: 4,
    },
    {
      key: "semantic_intent",
      value: token.semantic_intent ?? "",
      phrase_weight: 8,
      token_weight: 3,
    },
    {
      key: "guidance",
      value: token.guidance.join(" "),
      phrase_weight: 7,
      token_weight: 2,
    },
    {
      key: "applies_to",
      value: token.applies_to.join(" "),
      phrase_weight: 6,
      token_weight: 3,
    },
    {
      key: "variants",
      value: [token.category, ...token.themes, ...token.densities].join(" "),
      phrase_weight: 5,
      token_weight: 2,
    },
  ];
}
