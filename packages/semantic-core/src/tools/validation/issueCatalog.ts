import type { SaltRegistry } from "../../types.js";
import { findGuideByIdentifier } from "../guideLookup.js";
import type {
  ValidationIssue,
  ValidationIssueDescriptor,
  ValidationIssueFixHints,
} from "./shared.js";

export const DESIGN_TOKENS_DOC_URL = "/salt/themes/design-tokens/index";
export const SIZE_FOUNDATION_DOC_URL = "/salt/foundations/size";
export const CONTAINER_CHARACTERISTIC_DOC_URL =
  "/salt/themes/design-tokens/container-characteristic";
export const SEPARABLE_CHARACTERISTIC_DOC_URL =
  "/salt/themes/design-tokens/separable-characteristic";

export const CHOOSING_PRIMITIVE_GUIDE_LOOKUP = "choosing-the-right-primitive";
export const COMPOSITION_PITFALLS_GUIDE_LOOKUP = "composition-pitfalls";
export const CUSTOM_WRAPPERS_GUIDE_LOOKUP = "custom-wrappers";

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function resolveGuideUrls(registry: SaltRegistry, lookups: string[]): string[] {
  return unique(
    lookups
      .map((lookup) => findGuideByIdentifier(registry.guides, lookup))
      .flatMap((guide) =>
        guide?.related_docs.overview ? [guide.related_docs.overview] : [],
      ),
  );
}

function mergeValidationIssueFixHints(
  descriptorHints?: ValidationIssueFixHints,
  overrideHints?: ValidationIssueFixHints,
): ValidationIssueFixHints | undefined {
  if (!descriptorHints && !overrideHints) {
    return undefined;
  }

  const merged: ValidationIssueFixHints = {
    related_components: unique([
      ...(descriptorHints?.related_components ?? []),
      ...(overrideHints?.related_components ?? []),
    ]),
    guide_lookups: unique([
      ...(descriptorHints?.guide_lookups ?? []),
      ...(overrideHints?.guide_lookups ?? []),
    ]),
    extra_steps: unique([
      ...(descriptorHints?.extra_steps ?? []),
      ...(overrideHints?.extra_steps ?? []),
    ]),
    token_recommendation:
      overrideHints?.token_recommendation ??
      descriptorHints?.token_recommendation,
  };

  if (
    (merged.related_components?.length ?? 0) === 0 &&
    (merged.guide_lookups?.length ?? 0) === 0 &&
    (merged.extra_steps?.length ?? 0) === 0 &&
    !merged.token_recommendation
  ) {
    return undefined;
  }

  return merged;
}

function createGuideBackedDescriptor(input: {
  category: ValidationIssueDescriptor["category"];
  rule: string;
  severity: ValidationIssueDescriptor["severity"];
  title: string;
  message: string;
  suggested_fix: string | null;
  confidence: number;
  canonical_guide_lookup: string;
  guide_lookups?: string[];
  related_components?: string[];
  extra_steps?: string[];
}): ValidationIssueDescriptor {
  return {
    category: input.category,
    rule: input.rule,
    severity: input.severity,
    title: input.title,
    message: input.message,
    suggested_fix: input.suggested_fix,
    confidence: input.confidence,
    canonical_source: null,
    canonical_guide_lookup: input.canonical_guide_lookup,
    fix_hints: {
      guide_lookups: unique([
        input.canonical_guide_lookup,
        ...(input.guide_lookups ?? []),
      ]),
      related_components: input.related_components ?? [],
      extra_steps: input.extra_steps ?? [],
    },
  };
}

function createPrimitiveChoiceDescriptor(input: {
  rule: string;
  severity: ValidationIssueDescriptor["severity"];
  title: string;
  message: string;
  suggested_fix: string | null;
  confidence: number;
  related_components: string[];
  extra_steps?: string[];
}): ValidationIssueDescriptor {
  return createGuideBackedDescriptor({
    category: "primitive-choice",
    canonical_guide_lookup: CHOOSING_PRIMITIVE_GUIDE_LOOKUP,
    ...input,
  });
}

function createPrimitiveRecreationDescriptor(input: {
  rule: string;
  title: string;
  recreated_with: string;
  component_name: "Button" | "Link";
  suggested_fix: string;
  confidence: number;
}): ValidationIssueDescriptor {
  const componentLabel = input.component_name;
  const lowerComponentLabel = componentLabel.toLowerCase();

  return createPrimitiveChoiceDescriptor({
    rule: input.rule,
    severity: "warning",
    title: input.title,
    message: `This Salt UI recreates a standard ${lowerComponentLabel} with ${input.recreated_with}.`,
    suggested_fix: input.suggested_fix,
    confidence: input.confidence,
    related_components: [componentLabel],
    extra_steps: [
      `Replace the ${lowerComponentLabel}-like element with Salt ${componentLabel} so interaction, semantics, and styling come from the design system.`,
    ],
  });
}

function createCompositionDescriptor(input: {
  rule: string;
  severity: ValidationIssueDescriptor["severity"];
  title: string;
  message: string;
  suggested_fix: string | null;
  confidence: number;
  canonical_guide_lookup?: string;
  guide_lookups?: string[];
  related_components?: string[];
  extra_steps?: string[];
}): ValidationIssueDescriptor {
  return createGuideBackedDescriptor({
    category: "composition",
    canonical_guide_lookup:
      input.canonical_guide_lookup ?? COMPOSITION_PITFALLS_GUIDE_LOOKUP,
    guide_lookups: input.guide_lookups,
    related_components: input.related_components,
    extra_steps: input.extra_steps,
    rule: input.rule,
    severity: input.severity,
    title: input.title,
    message: input.message,
    suggested_fix: input.suggested_fix,
    confidence: input.confidence,
  });
}

const VALIDATION_ISSUE_CATALOG: Record<string, ValidationIssueDescriptor> = {
  "tokens.hardcoded-size": {
    category: "tokens",
    rule: "no-hardcoded-size-values",
    severity: "warning",
    title: "Hard-coded sizing value detected",
    message:
      "Hard-coded sizing values were detected. Prefer semantic Salt tokens for control size and spacing.",
    suggested_fix:
      "Replace hard-coded CSS values with semantic Salt tokens (for example --salt-size-base).",
    confidence: 0.82,
    canonical_source: SIZE_FOUNDATION_DOC_URL,
    source_urls: [SIZE_FOUNDATION_DOC_URL, DESIGN_TOKENS_DOC_URL],
    fix_hints: {
      token_recommendation: {
        query: "size spacing control",
        category: "size",
        top_k: 3,
      },
    },
  },
  "tokens.hardcoded-color": {
    category: "tokens",
    rule: "no-hardcoded-color-values",
    severity: "warning",
    title: "Hard-coded color value detected",
    message:
      "Hard-coded color values were detected. Prefer Salt semantic color tokens.",
    suggested_fix:
      "Replace hard-coded color literals with semantic Salt color tokens.",
    confidence: 0.82,
    canonical_source: DESIGN_TOKENS_DOC_URL,
    source_urls: [DESIGN_TOKENS_DOC_URL],
    fix_hints: {
      token_recommendation: {
        query: "semantic color foreground background",
        category: "color",
        top_k: 3,
      },
    },
  },
  "tokens.palette-direct-use": {
    category: "tokens",
    rule: "no-direct-palette-token-use",
    severity: "warning",
    title: "Palette token used directly in component styling",
    message:
      "Styling references palette tokens directly. Palette tokens are internal mapping tokens; choose a semantic characteristic token instead.",
    suggested_fix:
      "Replace direct palette token references with characteristic tokens that match the UI role, such as content, container, separable, navigable, or actionable.",
    confidence: 0.9,
    canonical_source: DESIGN_TOKENS_DOC_URL,
    source_urls: [DESIGN_TOKENS_DOC_URL],
    fix_hints: {
      token_recommendation: {
        query: "semantic characteristic color foreground background border",
        top_k: 3,
      },
    },
  },
  "tokens.deprecated-use": {
    category: "deprecated",
    rule: "no-deprecated-token-use",
    severity: "warning",
    title: "Deprecated token used in styling",
    message:
      "Styling references one or more deprecated Salt tokens. Replace them with current semantic or foundation tokens from the same documented family.",
    suggested_fix:
      "Replace deprecated token references with non-deprecated tokens recommended by the current theme, characteristic, or foundation guidance.",
    confidence: 0.9,
    canonical_source: DESIGN_TOKENS_DOC_URL,
    source_urls: [DESIGN_TOKENS_DOC_URL],
  },
  "tokens.border-thickness-not-fixed": {
    category: "tokens",
    rule: "border-thickness-uses-fixed-size-token",
    severity: "warning",
    title: "Border thickness should use fixed size tokens",
    message:
      "Border styling uses a hard-coded value or a non-fixed size token. Use fixed size tokens for border and separator thickness so line weight stays stable across densities.",
    suggested_fix:
      "Replace the border thickness with a fixed size token such as var(--salt-size-fixed-100) unless an established Salt pattern calls for a stronger fixed line.",
    confidence: 0.9,
    canonical_source: SIZE_FOUNDATION_DOC_URL,
    source_urls: [SIZE_FOUNDATION_DOC_URL],
    fix_hints: {
      token_recommendation: {
        query: "fixed size border separator thickness",
        category: "size",
        top_k: 3,
      },
    },
  },
  "tokens.container-level-mismatch": {
    category: "tokens",
    rule: "container-background-border-levels-match",
    severity: "warning",
    title: "Container background and border levels should match",
    message:
      "Styling mixes container background and border tokens from different levels. Pair container background and border tokens from the same level.",
    suggested_fix:
      "Use matching container background and border tokens, such as primary with primary or secondary with secondary.",
    confidence: 0.9,
    canonical_source: CONTAINER_CHARACTERISTIC_DOC_URL,
    source_urls: [CONTAINER_CHARACTERISTIC_DOC_URL, DESIGN_TOKENS_DOC_URL],
    fix_hints: {
      token_recommendation: {
        query: "container surface background border",
        category: "container",
        top_k: 4,
      },
    },
  },
  "tokens.separator-color-not-separable": {
    category: "tokens",
    rule: "separators-use-separable-tokens",
    severity: "warning",
    title: "Separators should use separable tokens",
    message:
      "Separator or divider styling appears to use a non-separable color token. Use separable tokens for separator and divider lines.",
    suggested_fix:
      "Replace the separator color with a separable token such as var(--salt-separable-secondary-borderColor) unless canonical Salt guidance calls for a different separator treatment.",
    confidence: 0.84,
    canonical_source: SEPARABLE_CHARACTERISTIC_DOC_URL,
    source_urls: [SEPARABLE_CHARACTERISTIC_DOC_URL, DESIGN_TOKENS_DOC_URL],
    fix_hints: {
      token_recommendation: {
        query: "separator divider border color",
        category: "separable",
        top_k: 3,
      },
    },
  },
  "component-choice.navigation": {
    ...createPrimitiveChoiceDescriptor({
      rule: "button-must-not-handle-navigation",
      severity: "error",
      title: "Button used for navigation",
      message:
        "This interaction looks like navigation rather than an in-place action.",
      suggested_fix:
        "Use Link for navigation and keep Button for in-place actions.",
      confidence: 0.98,
      related_components: ["Button", "Link"],
    }),
  },
  "component-choice.navigation-handler": {
    ...createPrimitiveChoiceDescriptor({
      rule: "button-click-navigation-should-prefer-link",
      severity: "warning",
      title: "Button click handler appears to navigate",
      message:
        "The Button click handler appears to navigate instead of performing an in-place action.",
      suggested_fix: "Use Link when the primary intent is navigation.",
      confidence: 0.78,
      related_components: ["Button", "Link"],
    }),
  },
  "primitive-choice.link-action": {
    ...createPrimitiveChoiceDescriptor({
      rule: "link-without-navigation-target-should-prefer-button",
      severity: "warning",
      title: "Link used as an action without a navigation target",
      message:
        "This interaction looks action-oriented rather than navigational.",
      suggested_fix:
        "Use Button for actions, or add a real navigation target if this element is meant to navigate.",
      confidence: 0.86,
      related_components: ["Button", "Link"],
      extra_steps: [
        "Replace Link with Button when the element triggers work instead of navigation.",
        "Keep Link only when it has a real navigation target such as href or to.",
      ],
    }),
  },
  "primitive-choice.native-button": {
    ...createPrimitiveRecreationDescriptor({
      rule: "native-button-should-prefer-salt-button",
      title: "Native button detected in Salt UI code",
      recreated_with: "a native element",
      component_name: "Button",
      suggested_fix:
        "Replace native button elements with Salt Button unless a native-only behavior is required.",
      confidence: 0.8,
    }),
  },
  "primitive-choice.native-link": {
    ...createPrimitiveRecreationDescriptor({
      rule: "native-anchor-should-prefer-salt-link",
      title: "Native anchor detected in Salt UI code",
      recreated_with: "a native anchor",
      component_name: "Link",
      suggested_fix:
        "Replace native anchor elements with Salt Link unless a native-only behavior is required.",
      confidence: 0.8,
    }),
  },
  "primitive-choice.custom-button-role": {
    ...createPrimitiveRecreationDescriptor({
      rule: "custom-button-role-should-prefer-salt-button",
      title: 'Custom element with role="button" detected',
      recreated_with: "a custom role",
      component_name: "Button",
      suggested_fix:
        "Replace the custom button-like element with Salt Button unless there is a strong reason to manage button semantics manually.",
      confidence: 0.86,
    }),
  },
  "primitive-choice.custom-link-role": {
    ...createPrimitiveRecreationDescriptor({
      rule: "custom-link-role-should-prefer-salt-link",
      title: 'Custom element with role="link" detected',
      recreated_with: "a custom role",
      component_name: "Link",
      suggested_fix:
        "Replace the custom link-like element with Salt Link unless there is a strong reason to manage link semantics manually.",
      confidence: 0.86,
    }),
  },
  "composition.nested-interactive-primitives": {
    ...createCompositionDescriptor({
      rule: "avoid-nesting-interactive-salt-primitives",
      severity: "error",
      title: "Nested interactive Salt primitives detected",
      message: "This interaction nests more than one interactive primitive.",
      suggested_fix:
        "Remove the nested interactive structure and keep a single Button or Link that matches the intended interaction.",
      confidence: 0.94,
      related_components: ["Button", "Link"],
      extra_steps: [
        "Flatten the nested Button or Link structure so a single Salt interactive primitive owns the interaction.",
        "Move layout or text content inside the chosen primitive rather than nesting another interactive Salt component.",
      ],
    }),
  },
  "composition.pass-through-wrapper": {
    ...createCompositionDescriptor({
      rule: "avoid-pass-through-wrapper-over-salt-primitive",
      severity: "warning",
      title: "Pass-through wrapper over a Salt primitive detected",
      message: "This wrapper only forwards props to a Salt primitive.",
      suggested_fix:
        "Use the underlying Salt primitive directly unless the wrapper is establishing meaningful shared behavior, semantics, or a stable public API.",
      confidence: 0.88,
      canonical_guide_lookup: CUSTOM_WRAPPERS_GUIDE_LOOKUP,
      guide_lookups: [COMPOSITION_PITFALLS_GUIDE_LOOKUP],
    }),
  },
  "a11y.button-accessible-name": {
    category: "accessibility",
    rule: "icon-only-buttons-need-accessible-name",
    severity: "error",
    title: "Icon-only Button missing accessible name",
    message:
      "Button appears icon-only without aria-label, aria-labelledby, or title.",
    suggested_fix:
      "Add aria-label/aria-labelledby, or provide visible text for the Button.",
    confidence: 0.88,
    canonical_source: null,
    fix_hints: {
      related_components: ["Button"],
    },
  },
  "a11y.button-decorative-icon-hidden": {
    category: "accessibility",
    rule: "decorative-button-icons-should-be-aria-hidden",
    severity: "warning",
    title: "Decorative Button icon should be hidden from assistive tech",
    message:
      "Decorative icons inside Button should use aria-hidden to avoid duplicate announcements.",
    suggested_fix:
      "Add aria-hidden to decorative Button icons when the Button already has visible text or another accessible name.",
    confidence: 0.9,
    canonical_source: null,
    fix_hints: {
      related_components: ["Button"],
    },
  },
};

export function getValidationIssueDescriptor(
  issueId: string,
): ValidationIssueDescriptor | undefined {
  return VALIDATION_ISSUE_CATALOG[issueId];
}

export function getValidationIssueCanonicalSource(
  registry: SaltRegistry,
  issueId: string,
): string | null {
  const descriptor = getValidationIssueDescriptor(issueId);
  if (!descriptor) {
    return null;
  }

  if (!descriptor.canonical_guide_lookup) {
    return descriptor.canonical_source ?? null;
  }

  const [resolvedGuideUrl] = resolveGuideUrls(registry, [
    descriptor.canonical_guide_lookup,
  ]);
  return resolvedGuideUrl ?? descriptor.canonical_source ?? null;
}

export function getValidationIssueSourceUrls(
  registry: SaltRegistry,
  issueId: string,
): string[] {
  const descriptor = getValidationIssueDescriptor(issueId);
  if (!descriptor) {
    return [];
  }

  const guideUrls = resolveGuideUrls(
    registry,
    descriptor.fix_hints?.guide_lookups ?? [],
  );

  return unique([...(descriptor.source_urls ?? []), ...guideUrls]);
}

export function buildCatalogValidationIssue(
  issueId: string,
  overrides: {
    matches: number;
    evidence: string[];
    canonical_source?: string | null;
    source_urls?: string[];
    title?: string;
    message?: string;
    suggested_fix?: string | null;
    confidence?: number;
    fix_hints?: ValidationIssueFixHints;
  },
): ValidationIssue {
  const descriptor = getValidationIssueDescriptor(issueId);
  if (!descriptor) {
    throw new Error(`Unknown validation issue catalog entry: ${issueId}`);
  }

  return {
    id: issueId,
    category: descriptor.category,
    rule: descriptor.rule,
    severity: descriptor.severity,
    title: overrides.title ?? descriptor.title,
    message: overrides.message ?? descriptor.message,
    evidence: overrides.evidence,
    canonical_source:
      overrides.canonical_source ?? descriptor.canonical_source ?? null,
    suggested_fix:
      overrides.suggested_fix !== undefined
        ? overrides.suggested_fix
        : descriptor.suggested_fix,
    confidence: overrides.confidence ?? descriptor.confidence,
    source_urls: overrides.source_urls ?? descriptor.source_urls ?? [],
    matches: overrides.matches,
    fix_hints: mergeValidationIssueFixHints(
      descriptor.fix_hints,
      overrides.fix_hints,
    ),
  };
}
