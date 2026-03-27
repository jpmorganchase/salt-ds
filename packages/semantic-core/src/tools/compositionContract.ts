import type { SaltRegistry } from "../types.js";
import { normalizeQuery, unique } from "./utils.js";

export type WorkflowCompositionCertainty =
  | "explicitly_requested"
  | "strongly_implied"
  | "optional"
  | "confirmation_needed";

export interface WorkflowCompositionContract {
  primary_target: {
    solution_type: "component" | "pattern" | "foundation" | "token";
    name: string | null;
  };
  expected_patterns: string[];
  expected_components: string[];
  slots: WorkflowCompositionSlot[];
  avoid: string[];
  source_urls: string[];
}

export interface WorkflowCompositionSlot {
  id: string;
  label: string;
  certainty: WorkflowCompositionCertainty;
  preferred_patterns: string[];
  preferred_components: string[];
  reason: string;
  source_urls: string[];
  notes: string[];
}

export interface WorkflowOpenQuestion {
  kind: "component-choice" | "pattern-scope" | "layout-choice" | "evidence-gap";
  topic: string;
  prompt: string;
  choices: string[];
  reason: string;
  ask_before_proceeding: true;
  source_urls: string[];
}

export interface BuildCreateCompositionContractInput {
  query?: string;
  solution_type: "component" | "pattern" | "foundation" | "token";
  decision_name: string | null;
}

interface CompositionGuidanceResult {
  composition_contract: WorkflowCompositionContract | null;
  open_questions: WorkflowOpenQuestion[];
}

type PatternRecord = SaltRegistry["patterns"][number];
type ComponentRecord = SaltRegistry["components"][number];

function tokenize(value: string | null | undefined): string[] {
  const normalized = normalizeQuery(value ?? "");
  if (!normalized) {
    return [];
  }

  return normalized.split(/\s+/).filter(Boolean);
}

function tokenMatches(left: string, right: string): boolean {
  return left === right || left.startsWith(right) || right.startsWith(left);
}

function includesAllTokens(
  haystackTokens: string[],
  needleTokens: string[],
): boolean {
  if (needleTokens.length === 0) {
    return false;
  }

  return needleTokens.every((needle) =>
    haystackTokens.some((haystack) => tokenMatches(haystack, needle)),
  );
}

function overlapsAnyToken(left: string[], right: string[]): boolean {
  return left.some((leftToken) =>
    right.some((rightToken) => tokenMatches(leftToken, rightToken)),
  );
}

function toSlotLabel(slotId: string): string {
  return slotId
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function collectPatternSourceUrls(
  registry: SaltRegistry,
  patternName: string,
): string[] {
  const pattern = registry.patterns.find((entry) => entry.name === patternName);
  if (!pattern) {
    return [];
  }

  return unique(
    [
      pattern.related_docs.overview,
      ...(pattern.starter_scaffold?.source_urls ?? []),
      ...(pattern.starter_scaffold?.example_source_urls ?? []),
      ...pattern.resources
        .filter((resource) => resource.internal)
        .map((resource) => resource.href),
    ].filter((value): value is string => Boolean(value)),
  );
}

function collectComponentSourceUrls(
  registry: SaltRegistry,
  componentName: string,
): string[] {
  const component = registry.components.find(
    (entry) =>
      entry.name === componentName || entry.aliases.includes(componentName),
  );
  if (!component) {
    return [];
  }

  return unique(
    [
      component.related_docs.overview,
      component.related_docs.usage,
      component.related_docs.accessibility,
      component.related_docs.examples,
      ...component.examples
        .map((example) => example.source_url)
        .filter((value): value is string => Boolean(value)),
    ].filter((value): value is string => Boolean(value)),
  );
}

function getPatternTextTokens(pattern: PatternRecord): string[] {
  return tokenize(
    [
      pattern.summary,
      ...pattern.when_to_use,
      ...pattern.when_not_to_use,
      ...(pattern.semantics?.preferred_for ?? []),
      ...(pattern.semantics?.not_for ?? []),
      ...(pattern.starter_scaffold?.semantics.build_around ?? []),
      ...(pattern.starter_scaffold?.semantics.preserve_constraints ?? []),
    ].join(" "),
  );
}

function getPatternSearchTokens(pattern: PatternRecord): string[][] {
  return [
    pattern.name,
    ...pattern.aliases.filter((alias) => !alias.includes("/")),
  ]
    .map((value) => tokenize(value))
    .filter((tokens) => tokens.length > 0);
}

function getComponentSearchTokens(component: ComponentRecord): string[][] {
  return [
    component.name,
    ...component.aliases.filter((alias) => !alias.includes("/")),
  ]
    .map((value) => tokenize(value))
    .filter((tokens) => tokens.length > 0);
}

function findQueryMatchedPatternNames(
  registry: SaltRegistry,
  queryTokens: string[],
): string[] {
  return registry.patterns
    .filter((pattern) =>
      getPatternSearchTokens(pattern).some((tokens) =>
        includesAllTokens(queryTokens, tokens),
      ),
    )
    .map((pattern) => pattern.name);
}

function findQueryMatchedComponentNames(
  registry: SaltRegistry,
  queryTokens: string[],
): string[] {
  return registry.components
    .filter((component) =>
      getComponentSearchTokens(component).some((tokens) =>
        includesAllTokens(queryTokens, tokens),
      ),
    )
    .map((component) => component.name);
}

function findPatternByName(
  registry: SaltRegistry,
  name: string,
): PatternRecord | null {
  return (
    registry.patterns.find(
      (entry) => entry.name === name || entry.aliases.includes(name),
    ) ?? null
  );
}

function findComponentByName(
  registry: SaltRegistry,
  name: string,
): ComponentRecord | null {
  return (
    registry.components.find(
      (entry) => entry.name === name || entry.aliases.includes(name),
    ) ?? null
  );
}

function slotAcceptsQueryComponents(slotId: string): boolean {
  return /(main|body|content|module|panel|table|grid|data)/.test(slotId);
}

function inferPreferredPatternsForSlot(input: {
  registry: SaltRegistry;
  pattern: PatternRecord;
  slotTokens: string[];
  queryMatchedPatternNames: string[];
}): string[] {
  const queryMatchedPatternSet = new Set(input.queryMatchedPatternNames);
  const docsBackedPatternTokens = getPatternTextTokens(input.pattern);

  return unique(
    input.registry.patterns
      .filter((candidate) => candidate.name !== input.pattern.name)
      .filter((candidate) => {
        const candidateTokens = tokenize(candidate.name);
        if (candidateTokens.length === 0) {
          return false;
        }

        if (queryMatchedPatternSet.has(candidate.name)) {
          return true;
        }

        return (
          overlapsAnyToken(input.slotTokens, candidateTokens) &&
          overlapsAnyToken(docsBackedPatternTokens, candidateTokens)
        );
      })
      .map((candidate) => candidate.name),
  );
}

function inferPreferredComponentsForSlot(input: {
  pattern: PatternRecord;
  slotId: string;
  slotTokens: string[];
  queryMatchedComponentNames: string[];
}): string[] {
  const composedOfMatches = input.pattern.composed_of
    .filter((entry) => {
      const roleTokens = tokenize(entry.role ?? "");
      const componentTokens = tokenize(entry.component);
      return (
        overlapsAnyToken(input.slotTokens, roleTokens) ||
        overlapsAnyToken(input.slotTokens, componentTokens)
      );
    })
    .map((entry) => entry.component);

  const queryMatches = input.queryMatchedComponentNames.filter((name) => {
    const componentTokens = tokenize(name);
    return (
      overlapsAnyToken(input.slotTokens, componentTokens) ||
      slotAcceptsQueryComponents(input.slotId)
    );
  });

  return unique([...composedOfMatches, ...queryMatches]);
}

function buildSlotNotes(input: {
  label: string;
  slotId: string;
  isRequired: boolean;
  buildAround: string[];
  preserveConstraints: string[];
}): string[] {
  const labelTokens = tokenize(input.label);
  const matchingBuildAround = input.buildAround.filter((entry) =>
    overlapsAnyToken(labelTokens, tokenize(entry)),
  );

  return unique([
    input.isRequired
      ? `Treat ${input.label} as a required scaffold region from the Salt pattern guidance.`
      : `Add ${input.label} only when it improves the task flow or requested evidence.`,
    ...matchingBuildAround,
    ...input.preserveConstraints,
  ]);
}

function buildSlotReason(input: {
  label: string;
  isRequired: boolean;
  preferredPatterns: string[];
  preferredComponents: string[];
}): string {
  const baseReason = input.isRequired
    ? `${input.label} is a required region in the pattern scaffold and should stay recognizable in the first implementation pass.`
    : `${input.label} is an optional Salt pattern region that becomes relevant when the task or supporting evidence calls for it.`;

  const recommendations = unique([
    ...input.preferredPatterns,
    ...input.preferredComponents,
  ]);
  if (recommendations.length === 0) {
    return baseReason;
  }

  return `${baseReason} The current request and docs-backed scaffold point to ${recommendations.join(", ")} here.`;
}

function buildPatternContract(
  registry: SaltRegistry,
  decisionName: string,
  query: string | undefined,
): CompositionGuidanceResult {
  const pattern = findPatternByName(registry, decisionName);
  if (!pattern) {
    return {
      composition_contract: {
        primary_target: {
          solution_type: "pattern",
          name: decisionName,
        },
        expected_patterns: [decisionName],
        expected_components: [],
        slots: [],
        avoid: [],
        source_urls: collectPatternSourceUrls(registry, decisionName),
      },
      open_questions: [],
    };
  }

  const queryTokens = tokenize(query);
  const queryMatchedPatternNames = findQueryMatchedPatternNames(
    registry,
    queryTokens,
  ).filter((name) => name !== decisionName);
  const queryMatchedComponentNames = findQueryMatchedComponentNames(
    registry,
    queryTokens,
  );
  const scaffold = pattern.starter_scaffold;
  const requiredRegions = new Set(scaffold?.semantics.required_regions ?? []);
  const buildAround = scaffold?.semantics.build_around ?? [];
  const preserveConstraints = scaffold?.semantics.preserve_constraints ?? [];
  const sourceUrls = collectPatternSourceUrls(registry, decisionName);
  const slots =
    scaffold?.semantics.regions.map((slotId) => {
      const label = toSlotLabel(slotId);
      const slotTokens = tokenize(`${slotId} ${label}`);
      const preferredPatterns = inferPreferredPatternsForSlot({
        registry,
        pattern,
        slotTokens,
        queryMatchedPatternNames,
      });
      const preferredComponents = inferPreferredComponentsForSlot({
        pattern,
        slotId,
        slotTokens,
        queryMatchedComponentNames,
      });
      const tabularChoiceNeedsConfirmation =
        preferredComponents.includes("Data grid") &&
        preferredComponents.includes("Table");
      const queryMentionsSlot =
        overlapsAnyToken(queryTokens, slotTokens) ||
        preferredPatterns.length > 0 ||
        preferredComponents.length > 0;
      const isRequired = requiredRegions.has(slotId);

      return {
        id: slotId,
        label,
        certainty: tabularChoiceNeedsConfirmation
          ? ("confirmation_needed" as const)
          : queryMentionsSlot
            ? isRequired
              ? ("explicitly_requested" as const)
              : ("strongly_implied" as const)
            : isRequired
              ? ("strongly_implied" as const)
              : ("optional" as const),
        preferred_patterns: preferredPatterns,
        preferred_components: preferredComponents,
        reason: buildSlotReason({
          label,
          isRequired,
          preferredPatterns,
          preferredComponents,
        }),
        source_urls: unique([
          ...sourceUrls,
          ...preferredPatterns.flatMap((name) =>
            collectPatternSourceUrls(registry, name),
          ),
          ...preferredComponents.flatMap((name) =>
            collectComponentSourceUrls(registry, name),
          ),
        ]),
        notes: buildSlotNotes({
          label,
          slotId,
          isRequired,
          buildAround,
          preserveConstraints,
        }),
      };
    }) ?? [];

  const openQuestions: WorkflowOpenQuestion[] = [];
  const tabularSlot = slots.find(
    (slot) =>
      slot.preferred_components.includes("Data grid") &&
      slot.preferred_components.includes("Table"),
  );
  if (tabularSlot) {
    openQuestions.push({
      kind: "component-choice",
      topic: "tabular-data",
      prompt:
        "Should the tabular area use the richer Salt Data grid, or stay on the simpler Table path?",
      choices: ["Data grid", "Table"],
      reason:
        "The current request names both Data grid and Table for the same tabular region, so the first implementation pass should confirm which Salt data surface is intended.",
      ask_before_proceeding: true,
      source_urls: unique([
        ...collectComponentSourceUrls(registry, "Data grid"),
        ...collectComponentSourceUrls(registry, "Table"),
      ]),
    });
  }

  return {
    composition_contract: {
      primary_target: {
        solution_type: "pattern",
        name: decisionName,
      },
      expected_patterns: unique(
        slots.flatMap((slot) => slot.preferred_patterns),
      ),
      expected_components: unique(
        slots.flatMap((slot) => slot.preferred_components),
      ),
      slots,
      avoid: unique([
        ...preserveConstraints,
        ...(tabularSlot
          ? [
              "Do not lock in a tabular surface until the workflow confirms whether Table or Data grid is the better fit.",
            ]
          : []),
      ]),
      source_urls: sourceUrls,
    },
    open_questions: openQuestions,
  };
}

function buildComponentContract(
  registry: SaltRegistry,
  decisionName: string,
): CompositionGuidanceResult {
  const sourceUrls = collectComponentSourceUrls(registry, decisionName);

  return {
    composition_contract: {
      primary_target: {
        solution_type: "component",
        name: decisionName,
      },
      expected_patterns: [],
      expected_components: [decisionName],
      slots: [],
      avoid: [],
      source_urls: sourceUrls,
    },
    open_questions: [],
  };
}

export function buildCreateCompositionGuidance(
  registry: SaltRegistry,
  input: BuildCreateCompositionContractInput,
): CompositionGuidanceResult {
  if (!input.decision_name) {
    return {
      composition_contract: null,
      open_questions: [],
    };
  }

  switch (input.solution_type) {
    case "pattern":
      return buildPatternContract(registry, input.decision_name, input.query);
    case "component":
      return buildComponentContract(registry, input.decision_name);
    case "foundation":
    case "token":
      return {
        composition_contract: {
          primary_target: {
            solution_type: input.solution_type,
            name: input.decision_name,
          },
          expected_patterns: [],
          expected_components: [],
          slots: [],
          avoid: [],
          source_urls: [],
        },
        open_questions: [],
      };
  }
}
