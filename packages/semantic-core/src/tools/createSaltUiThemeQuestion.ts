import type { SaltRegistry } from "../types.js";
import type { WorkflowOpenQuestion } from "./compositionContract.js";

/**
 * Narrow keyword set that signals the create prompt is theme- or brand-
 * ambiguous. Matched as a case-insensitive substring on the normalized
 * query; no fuzzy expansion is performed (the prompt explicitly forbids
 * inference soup).
 */
const THEME_AMBIGUOUS_KEYWORDS: readonly string[] = [
  "theme",
  "themed",
  "theming",
  "brand",
  "branded",
  "branding",
  "salt provider",
  "saltprovider",
  "primary color",
  "primary colour",
  "accent",
  "jpm",
  "dark mode",
];

/**
 * Brand-aware provider props that callers most often need to set. We only
 * surface the prop defaults that Salt exposes through the registry — no
 * invented values — so the choice payload is fully evidence-backed.
 */
const PROVIDER_NEXT_BRAND_PROP_NAMES: readonly string[] = [
  "accent",
  "actionFont",
  "corner",
  "density",
  "headingFont",
  "mode",
];

type ComponentRecord = SaltRegistry["components"][number];

interface BrandPropEvidence {
  name: string;
  type?: string;
  default?: unknown;
}

export interface CreateThemeProviderQuestionOptions {
  /** Free-form create query. Matched case-insensitively. */
  query?: string;
  /**
   * Three-valued provider-declaration signal:
   * - `true` — the host detected a declared theme provider; suppress the question.
   * - `false` — the host confirmed no provider is declared; the question is
   *   eligible whenever the query is theme-ambiguous.
   * - `undefined` — the host has no signal; ambiguity alone triggers the
   *   question because there is no evidence either way.
   */
  repoHasThemeProvider?: boolean;
}

export interface ThemeProviderChoiceOption {
  id: "salt-provider" | "salt-provider-next";
  /** Salt registry component name backing the option. */
  component: string;
  /** Short label suitable for chat-style hosts. */
  label: string;
  /** One-line reason summarizing the trade-off. */
  why: string;
  /** Brand-aware prop defaults pulled from the SaltProviderNext entity. */
  brand_prop_defaults?: BrandPropEvidence[];
}

export interface CreateThemeProviderQuestion extends WorkflowOpenQuestion {
  kind: "theme-provider-choice";
  options: ThemeProviderChoiceOption[];
}

function normalize(value: string | null | undefined): string {
  return (value ?? "").toLowerCase().replace(/\s+/g, " ").trim();
}

function findComponent(
  registry: SaltRegistry,
  name: string,
): ComponentRecord | undefined {
  return registry.components.find((component) => component.name === name);
}

/**
 * Registry-canonical name for the stable Salt provider. The registry stores
 * this as a display name with whitespace ("Salt provider") rather than the
 * React export ("SaltProvider"); query both so the lookup survives a future
 * normalization change.
 */
const SALT_PROVIDER_NAMES: readonly string[] = ["Salt provider", "SaltProvider"];
const SALT_PROVIDER_NEXT_NAMES: readonly string[] = [
  "SaltProviderNext",
  "Salt provider next",
];

function findFirstComponent(
  registry: SaltRegistry,
  names: readonly string[],
): ComponentRecord | undefined {
  for (const name of names) {
    const match = findComponent(registry, name);
    if (match) {
      return match;
    }
  }
  return undefined;
}

function extractBrandPropDefaults(
  component: ComponentRecord | undefined,
): BrandPropEvidence[] {
  if (!component || !Array.isArray(component.props)) {
    return [];
  }
  const props: BrandPropEvidence[] = [];
  for (const propName of PROVIDER_NEXT_BRAND_PROP_NAMES) {
    const match = component.props.find((entry) => entry?.name === propName);
    if (!match) {
      continue;
    }
    props.push({
      name: propName,
      type: typeof match.type === "string" ? match.type : undefined,
      default: match.default ?? undefined,
    });
  }
  return props;
}

export function isThemeAmbiguousQuery(query: string | undefined): boolean {
  const normalized = normalize(query);
  if (!normalized) {
    return false;
  }
  // Avoid matching the literal word `provider` when it appears inside an
  // unrelated multi-word noun like "tab-provider grid"; only match on its
  // own or with the salt- prefix.
  return THEME_AMBIGUOUS_KEYWORDS.some((keyword) => {
    if (keyword === "provider") {
      return /\bprovider\b/.test(normalized);
    }
    return normalized.includes(keyword);
  });
}

/**
 * Evaluate whether the create workflow should ask the user to choose between
 * `SaltProvider` and `SaltProviderNext`. Returns `null` when no question is
 * warranted; returns a structured `WorkflowOpenQuestion` (with extra
 * `options`) when it is.
 *
 * Triggering conditions:
 * - the query contains at least one keyword from `THEME_AMBIGUOUS_KEYWORDS`,
 *   AND
 * - the host has not signalled a declared theme provider
 *   (`repoHasThemeProvider !== true`).
 *
 * The question is grounded in the live registry: brand-prop defaults are
 * pulled from the `SaltProviderNext` component entity that lookup-side
 * tooling already exposes, so the choice payload never invents prop values.
 */
export function evaluateCreateThemeProviderQuestion(
  registry: SaltRegistry,
  { query, repoHasThemeProvider }: CreateThemeProviderQuestionOptions,
): CreateThemeProviderQuestion | null {
  if (repoHasThemeProvider === true) {
    return null;
  }
  if (!isThemeAmbiguousQuery(query)) {
    return null;
  }

  const providerNext = findFirstComponent(registry, SALT_PROVIDER_NEXT_NAMES);
  const provider = findFirstComponent(registry, SALT_PROVIDER_NAMES);

  // If the registry never resolved SaltProviderNext we cannot ground the
  // brand-prop defaults; emit no question rather than a synthetic one.
  if (!providerNext) {
    return null;
  }

  const brandPropDefaults = extractBrandPropDefaults(providerNext);
  const sourceUrls: string[] = [];
  const providerNextUrl = (providerNext as { source_url?: unknown }).source_url;
  if (typeof providerNextUrl === "string" && providerNextUrl.length > 0) {
    sourceUrls.push(providerNextUrl);
  }
  if (provider) {
    const providerUrl = (provider as { source_url?: unknown }).source_url;
    if (typeof providerUrl === "string" && providerUrl.length > 0) {
      sourceUrls.push(providerUrl);
    }
  }

  return {
    kind: "theme-provider-choice",
    topic: "theme-provider",
    prompt:
      "Which theme provider should this Salt UI wrap with: the stable SaltProvider (base theme) or SaltProviderNext (JPM Brand)?",
    choices: [
      "SaltProvider (stable, base theme)",
      "SaltProviderNext (JPM Brand, exposes brand props such as accent, density, mode)",
    ],
    reason:
      "Create prompt mentions theme, brand, or provider terms and the host did not signal a declared theme provider. Choosing between SaltProvider and SaltProviderNext changes which props are available and which theme stylesheet must be imported.",
    ask_before_proceeding: true,
    source_urls: sourceUrls,
    options: [
      {
        id: "salt-provider",
        component: "SaltProvider",
        label: "SaltProvider (stable, base theme)",
        why: "Default Salt theming. Use when the consumer does not need brand-aware accent, font, or corner overrides.",
      },
      {
        id: "salt-provider-next",
        component: "SaltProviderNext",
        label: "SaltProviderNext (JPM Brand)",
        why: "Brand-aware theming with accent, font, corner, density, and mode props surfaced directly on the provider.",
        brand_prop_defaults: brandPropDefaults,
      },
    ],
  };
}
