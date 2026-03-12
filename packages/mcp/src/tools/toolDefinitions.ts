import * as z from "zod/v4";
import type { SaltRegistry } from "../types.js";
import { compareOptions } from "./compareOptions.js";
import { compareVersions } from "./compareVersions.js";
import { discoverSalt } from "./discoverSalt.js";
import { getChanges } from "./getChanges.js";
import { getComponent } from "./getComponent.js";
import { getCompositionRecipe } from "./getCompositionRecipe.js";
import { getCountrySymbol } from "./getCountrySymbol.js";
import { getCountrySymbols } from "./getCountrySymbols.js";
import { getExamples } from "./getExamples.js";
import { getFoundation } from "./getFoundation.js";
import { getGuide } from "./getGuide.js";
import { getIcon } from "./getIcon.js";
import { getIcons } from "./getIcons.js";
import { getPackage } from "./getPackage.js";
import { getPage } from "./getPage.js";
import { getPattern } from "./getPattern.js";
import { getRelatedEntities } from "./getRelatedEntities.js";
import { getToken } from "./getToken.js";
import { listFoundations } from "./listFoundations.js";
import { listSaltCatalog } from "./listSaltCatalog.js";
import { recommendComponent } from "./recommendComponent.js";
import { recommendFixRecipes } from "./recommendFixRecipes.js";
import { recommendTokens } from "./recommendTokens.js";
import { searchApiSurface } from "./searchApiSurface.js";
import { searchComponentCapabilities } from "./searchComponentCapabilities.js";
import { searchSaltDocs } from "./searchSaltDocs.js";
import { suggestMigration } from "./suggestMigration.js";
import { validateSaltUsage } from "./validateSaltUsage.js";

const SEARCH_AREAS = [
  "all",
  "packages",
  "components",
  "icons",
  "country_symbols",
  "pages",
  "foundations",
  "patterns",
  "guides",
  "tokens",
  "examples",
  "changes",
] as const;

const STATUSES = ["stable", "beta", "lab", "deprecated"] as const;
const VIEWS = ["compact", "full"] as const;
const CHANGE_KINDS = [
  "added",
  "changed",
  "fixed",
  "deprecated",
  "removed",
] as const;
const COMPONENT_INCLUDES = [
  "examples",
  "props",
  "tokens",
  "accessibility",
  "deprecations",
  "changes",
] as const;
const PATTERN_INCLUDES = ["examples", "accessibility"] as const;
const COMPLEXITIES = ["basic", "intermediate", "advanced"] as const;
const EXAMPLE_TARGET_TYPES = ["component", "pattern"] as const;
const COMPARE_OPTION_TYPES = ["component", "pattern"] as const;
const RELATED_ENTITY_TARGET_TYPES = [
  "component",
  "pattern",
  "token",
  "guide",
  "page",
] as const;
const CONSUMER_DEFAULT_TOOL_ORDER = [
  "discover_salt",
  "recommend_component",
  "get_composition_recipe",
  "get_component",
  "get_examples",
  "get_foundation",
  "recommend_tokens",
  "recommend_fix_recipes",
  "compare_versions",
  "search_salt_docs",
] as const;

type ToolInputSchema = Record<string, z.ZodType>;

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: ToolInputSchema;
  execute: (registry: SaltRegistry, args: object) => Promise<unknown> | unknown;
}

function defineTool<Args extends object>(
  definition: Omit<ToolDefinition, "execute"> & {
    execute: (registry: SaltRegistry, args: Args) => Promise<unknown> | unknown;
  },
): ToolDefinition {
  return definition as ToolDefinition;
}

const RAW_TOOL_DEFINITIONS: readonly ToolDefinition[] = [
  defineTool<Parameters<typeof discoverSalt>[1]>({
    name: "discover_salt",
    description:
      "Route a broad Salt consumer query to the best starting point across component choice, composition recipes, foundations, tokens, and docs search.",
    inputSchema: {
      query: z
        .string()
        .describe("Describe the Salt problem, UI need, or styling goal."),
      package: z
        .string()
        .optional()
        .describe("Optional package filter (e.g. @salt-ds/core)."),
      status: z.enum(STATUSES).optional().describe("Status filter."),
      top_k: z.number().int().min(1).max(10).optional(),
      production_ready: z
        .boolean()
        .optional()
        .describe("Require stable, shipping-oriented recommendations only."),
      prefer_stable: z
        .boolean()
        .optional()
        .describe("Prefer stable recommendations when scores are close."),
      a11y_required: z
        .boolean()
        .optional()
        .describe("Require accessibility guidance in recommendations."),
      form_field_support: z
        .boolean()
        .optional()
        .describe("Require form-field style labeling/validation support."),
      include_starter_code: z
        .boolean()
        .optional()
        .describe("Include a minimal starter scaffold for the best match."),
      view: z
        .enum(VIEWS)
        .optional()
        .describe(
          "Use full to include routed tool results and intent signals.",
        ),
    },
    execute: discoverSalt,
  }),
  defineTool<Parameters<typeof searchSaltDocs>[1]>({
    name: "search_salt_docs",
    description:
      "Search Salt package, component, icon, country symbol, page, pattern, token, and example metadata.",
    inputSchema: {
      query: z.string().describe("Search query."),
      area: z
        .enum(SEARCH_AREAS)
        .optional()
        .describe("Limit search to one area."),
      package: z
        .string()
        .optional()
        .describe("Package filter (e.g. @salt-ds/core)."),
      status: z.enum(STATUSES).optional().describe("Status filter."),
      top_k: z.number().int().min(1).max(25).optional(),
    },
    execute: searchSaltDocs,
  }),
  defineTool<Parameters<typeof listSaltCatalog>[1]>({
    name: "list_salt_catalog",
    description:
      "Browse Salt packages, components, icons, country symbols, pages, patterns, guides, tokens, and examples without requiring a search query.",
    inputSchema: {
      area: z
        .enum(SEARCH_AREAS)
        .optional()
        .describe("Limit browsing to one area."),
      package: z
        .string()
        .optional()
        .describe("Package filter (e.g. @salt-ds/core)."),
      status: z.enum(STATUSES).optional().describe("Optional status filter."),
      max_results: z.number().int().min(1).max(200).optional(),
    },
    execute: listSaltCatalog,
  }),
  defineTool<Parameters<typeof getPackage>[1]>({
    name: "get_package",
    description: "Get a normalized Salt package record by package name.",
    inputSchema: {
      name: z.string().describe("Package name (e.g. @salt-ds/core)."),
      include: z.array(z.enum(["changes"])).optional(),
      change_limit: z.number().int().min(1).max(50).optional(),
      since_version: z
        .string()
        .optional()
        .describe("Only include changes at or after this version."),
    },
    execute: getPackage,
  }),
  defineTool<Parameters<typeof getGuide>[1]>({
    name: "get_guide",
    description: "Get structured Salt guidance for setup and theming topics.",
    inputSchema: {
      name: z.string().describe("Guide name or alias."),
      view: z.enum(VIEWS).optional(),
    },
    execute: getGuide,
  }),
  defineTool<Parameters<typeof listFoundations>[1]>({
    name: "list_foundations",
    description:
      "Browse Salt foundation pages such as typography, spacing, density, size, and responsiveness.",
    inputSchema: {
      query: z
        .string()
        .optional()
        .describe("Optional search query for narrowing foundation topics."),
      max_results: z.number().int().min(1).max(100).optional(),
    },
    execute: listFoundations,
  }),
  defineTool<Parameters<typeof getFoundation>[1]>({
    name: "get_foundation",
    description:
      "Get a Salt foundation page by title, route, or slug with content focused on foundation guidance.",
    inputSchema: {
      name: z.string().describe("Foundation page title, route, or slug."),
      include_starter_code: z
        .boolean()
        .optional()
        .describe(
          "Include a small starter scaffold for applying this foundation.",
        ),
      view: z.enum(VIEWS).optional(),
    },
    execute: getFoundation,
  }),
  defineTool<Parameters<typeof getPage>[1]>({
    name: "get_page",
    description:
      "Get a Salt site page by title or route, including pages from the homepage and broader docs site.",
    inputSchema: {
      name: z.string().describe("Page title, route, or route slug."),
      view: z.enum(VIEWS).optional(),
    },
    execute: getPage,
  }),
  defineTool<Parameters<typeof getComponent>[1]>({
    name: "get_component",
    description:
      "Get a normalized Salt component record by canonical name or alias.",
    inputSchema: {
      name: z.string().describe("Component name or alias."),
      package: z.string().optional(),
      view: z.enum(VIEWS).optional(),
      include: z.array(z.enum(COMPONENT_INCLUDES)).optional(),
      change_limit: z.number().int().min(1).max(25).optional(),
      since_version: z
        .string()
        .optional()
        .describe("Only include changes at or after this version."),
    },
    execute: getComponent,
  }),
  defineTool<Parameters<typeof getChanges>[1]>({
    name: "get_changes",
    description:
      "Get changelog-derived Salt changes for a package or component, with optional version and kind filters.",
    inputSchema: {
      target_type: z.enum(["package", "component"]).optional(),
      target_name: z
        .string()
        .optional()
        .describe("Canonical name or alias of the package/component target."),
      package: z
        .string()
        .optional()
        .describe("Optional package filter (e.g. @salt-ds/core)."),
      kinds: z.array(z.enum(CHANGE_KINDS)).optional(),
      since_version: z
        .string()
        .optional()
        .describe("Only include changes at or after this version."),
      limit: z.number().int().min(1).max(50).optional(),
    },
    execute: getChanges,
  }),
  defineTool<Parameters<typeof getIcon>[1]>({
    name: "get_icon",
    description:
      "Get a normalized Salt icon record by export name, base name, figma name, or alias.",
    inputSchema: {
      name: z.string().describe("Icon name, figma name, or alias."),
      view: z.enum(VIEWS).optional(),
    },
    execute: getIcon,
  }),
  defineTool<Parameters<typeof getIcons>[1]>({
    name: "get_icons",
    description:
      "List Salt icons filtered by query, category, variant, and status.",
    inputSchema: {
      query: z.string().optional().describe("Optional icon search query."),
      category: z
        .string()
        .optional()
        .describe("Optional icon category filter."),
      variant: z.enum(["outline", "solid"]).optional(),
      status: z
        .enum(STATUSES)
        .optional()
        .describe("Optional icon status filter."),
      max_results: z.number().int().min(1).max(1000).optional(),
    },
    execute: getIcons,
  }),
  defineTool<Parameters<typeof getCountrySymbol>[1]>({
    name: "get_country_symbol",
    description:
      "Get a normalized Salt country symbol record by country code, country name, export name, or alias.",
    inputSchema: {
      name: z
        .string()
        .describe("Country code, country name, export name, or alias."),
      view: z.enum(VIEWS).optional(),
    },
    execute: getCountrySymbol,
  }),
  defineTool<Parameters<typeof getCountrySymbols>[1]>({
    name: "get_country_symbols",
    description: "List Salt country symbols filtered by query and status.",
    inputSchema: {
      query: z
        .string()
        .optional()
        .describe("Optional country symbol search query."),
      status: z
        .enum(STATUSES)
        .optional()
        .describe("Optional country symbol status filter."),
      max_results: z.number().int().min(1).max(500).optional(),
    },
    execute: getCountrySymbols,
  }),
  defineTool<Parameters<typeof getPattern>[1]>({
    name: "get_pattern",
    description: "Get a normalized Salt pattern record by name.",
    inputSchema: {
      name: z.string().describe("Pattern name."),
      view: z.enum(VIEWS).optional(),
      include: z.array(z.enum(PATTERN_INCLUDES)).optional(),
    },
    execute: getPattern,
  }),
  defineTool<Parameters<typeof getToken>[1]>({
    name: "get_token",
    description:
      "Get Salt design token metadata by name or by category and semantic intent, with explicit semantic-intent matching.",
    inputSchema: {
      name: z.string().optional(),
      category: z.string().optional(),
      semantic_intent: z.string().optional(),
      semantic_intent_match: z
        .enum(["exact", "contains"])
        .optional()
        .describe("Semantic-intent match mode. Defaults to exact."),
      include_deprecated: z.boolean().optional(),
      max_results: z.number().int().min(1).max(500).optional(),
    },
    execute: getToken,
  }),
  defineTool<Parameters<typeof getExamples>[1]>({
    name: "get_examples",
    description:
      "Get Salt example metadata filtered by target, intent, complexity, and package, with a best example, nearby variants, and explicit ambiguity handling.",
    inputSchema: {
      target_type: z.enum(EXAMPLE_TARGET_TYPES).optional(),
      target_name: z.string().optional(),
      package: z.string().optional(),
      intent: z.string().optional(),
      complexity: z.enum(COMPLEXITIES).optional(),
      max_results: z.number().int().min(1).max(50).optional(),
      include_code: z.boolean().optional(),
      view: z
        .enum(VIEWS)
        .optional()
        .describe("Use full to include richer metadata and source hints."),
    },
    execute: getExamples,
  }),
  defineTool<Parameters<typeof compareOptions>[1]>({
    name: "compare_options",
    description:
      "Compare Salt components or patterns side by side, with ship checks, caveats, and a recommended default fit.",
    inputSchema: {
      names: z.array(z.string()).min(2).max(10).describe("Names to compare."),
      option_type: z
        .enum(COMPARE_OPTION_TYPES)
        .optional()
        .describe("Compare components or patterns. Defaults to component."),
      package: z
        .string()
        .optional()
        .describe("Optional package filter for component comparisons."),
      task: z
        .string()
        .optional()
        .describe("Optional task description to bias the recommendation."),
      production_ready: z
        .boolean()
        .optional()
        .describe("Prefer or require shipping-oriented options."),
      prefer_stable: z
        .boolean()
        .optional()
        .describe("Prefer stable options when the comparison is close."),
      a11y_required: z
        .boolean()
        .optional()
        .describe("Prefer options with stronger accessibility guidance."),
      form_field_support: z
        .boolean()
        .optional()
        .describe("Prefer options with form-field style support."),
      view: z
        .enum(VIEWS)
        .optional()
        .describe("Use full to include task-scoring evidence."),
    },
    execute: compareOptions,
  }),
  defineTool<Parameters<typeof recommendComponent>[1]>({
    name: "recommend_component",
    description:
      "Recommend Salt components for a consumer task, with ranked matches, caveats, ship checks, and supporting docs metadata.",
    inputSchema: {
      task: z.string().describe("Describe the user task or interaction need."),
      package: z
        .string()
        .optional()
        .describe("Optional package filter (e.g. @salt-ds/core)."),
      status: z.enum(STATUSES).optional().describe("Status filter."),
      top_k: z.number().int().min(1).max(25).optional(),
      production_ready: z
        .boolean()
        .optional()
        .describe("Require stable, shipping-oriented component matches only."),
      prefer_stable: z
        .boolean()
        .optional()
        .describe("Prefer stable components when scores are close."),
      a11y_required: z
        .boolean()
        .optional()
        .describe(
          "Require accessibility guidance in the recommended components.",
        ),
      form_field_support: z
        .boolean()
        .optional()
        .describe(
          "Require form-field style support in the recommended components.",
        ),
      include_starter_code: z
        .boolean()
        .optional()
        .describe(
          "Include a minimal starter scaffold for the primary recommendation.",
        ),
      view: z
        .enum(VIEWS)
        .optional()
        .describe("Use full to include ranking evidence and match metadata."),
    },
    execute: recommendComponent,
  }),
  defineTool<Parameters<typeof getCompositionRecipe>[1]>({
    name: "get_composition_recipe",
    description:
      "Recommend a Salt composition recipe for a consumer task using patterns first, with caveats, ship checks, and a component-set fallback.",
    inputSchema: {
      query: z
        .string()
        .describe("Describe the UI or flow you want to compose."),
      top_k: z.number().int().min(1).max(10).optional(),
      production_ready: z
        .boolean()
        .optional()
        .describe("Require stable, shipping-oriented recipes only."),
      prefer_stable: z
        .boolean()
        .optional()
        .describe("Prefer stable recipes when scores are close."),
      a11y_required: z
        .boolean()
        .optional()
        .describe(
          "Require accessibility guidance across the recommended recipe.",
        ),
      form_field_support: z
        .boolean()
        .optional()
        .describe(
          "Require form-field-capable controls in the recommended recipe.",
        ),
      include_starter_code: z
        .boolean()
        .optional()
        .describe("Include a minimal starter scaffold for the best recipe."),
      view: z
        .enum(VIEWS)
        .optional()
        .describe("Use full to include match metadata and full recipe detail."),
    },
    execute: getCompositionRecipe,
  }),
  defineTool<Parameters<typeof searchApiSurface>[1]>({
    name: "search_api_surface",
    description:
      "Search Salt component props and API metadata across names, descriptions, types, and allowed values.",
    inputSchema: {
      query: z
        .string()
        .describe(
          "Search query for prop names, descriptions, types, and allowed values.",
        ),
      component_name: z
        .string()
        .optional()
        .describe("Optional component name or alias filter."),
      package: z
        .string()
        .optional()
        .describe("Optional package filter (e.g. @salt-ds/core)."),
      status: z.enum(STATUSES).optional().describe("Status filter."),
      deprecated: z
        .boolean()
        .optional()
        .describe("Optional filter for deprecated props only."),
      required: z
        .boolean()
        .optional()
        .describe("Optional filter for required props only."),
      top_k: z.number().int().min(1).max(100).optional(),
    },
    execute: searchApiSurface,
  }),
  defineTool<Parameters<typeof searchComponentCapabilities>[1]>({
    name: "search_component_capabilities",
    description:
      "Search Salt components by consumer-facing capabilities such as form-field support, validation, accessibility, and keyboard guidance.",
    inputSchema: {
      query: z
        .string()
        .describe("Capability query, for example validation or form-field."),
      package: z
        .string()
        .optional()
        .describe("Optional package filter (e.g. @salt-ds/core)."),
      status: z.enum(STATUSES).optional().describe("Status filter."),
      top_k: z.number().int().min(1).max(50).optional(),
    },
    execute: searchComponentCapabilities,
  }),
  defineTool<Parameters<typeof compareVersions>[1]>({
    name: "compare_versions",
    description:
      "Compare Salt package or component changes between two versions, with optional deprecation details.",
    inputSchema: {
      package: z
        .string()
        .optional()
        .describe("Optional package filter (e.g. @salt-ds/core)."),
      component_name: z
        .string()
        .optional()
        .describe("Optional component name or alias filter."),
      from_version: z.string().describe("Starting version boundary."),
      to_version: z.string().describe("Ending version boundary."),
      include_deprecations: z.boolean().optional(),
      max_results: z.number().int().min(1).max(100).optional(),
      view: z
        .enum(VIEWS)
        .optional()
        .describe("Use full to return raw change and deprecation records."),
    },
    execute: compareVersions,
  }),
  defineTool<Parameters<typeof recommendTokens>[1]>({
    name: "recommend_tokens",
    description:
      "Recommend Salt design tokens for a styling need, with support for category, component, theme, and density filters.",
    inputSchema: {
      query: z.string().describe("Describe the styling or semantic need."),
      category: z.string().optional(),
      component_name: z.string().optional(),
      theme: z.string().optional(),
      density: z.string().optional(),
      include_deprecated: z.boolean().optional(),
      top_k: z.number().int().min(1).max(50).optional(),
      view: z
        .enum(VIEWS)
        .optional()
        .describe(
          "Use full to include ranking evidence and detailed token metadata.",
        ),
    },
    execute: recommendTokens,
  }),
  defineTool<Parameters<typeof getRelatedEntities>[1]>({
    name: "get_related_entities",
    description:
      "Get related Salt components, patterns, tokens, guides, and pages for a target entity.",
    inputSchema: {
      target_type: z.enum(RELATED_ENTITY_TARGET_TYPES),
      name: z.string().describe("Target name to resolve."),
      package: z
        .string()
        .optional()
        .describe("Optional package filter for component targets."),
      max_results: z.number().int().min(1).max(50).optional(),
    },
    execute: getRelatedEntities,
  }),
  defineTool<Parameters<typeof suggestMigration>[1]>({
    name: "suggest_migration",
    description:
      "Suggest Salt import, component, and prop migrations for deprecated APIs.",
    inputSchema: {
      code: z.string().describe("Code to analyze for migrations."),
      from_version: z
        .string()
        .optional()
        .describe("Optional current package version context."),
      to_version: z
        .string()
        .optional()
        .describe("Optional target package version context."),
      max_migrations: z
        .number()
        .int()
        .min(1)
        .max(50)
        .optional()
        .describe("Maximum number of migration suggestions returned."),
    },
    execute: suggestMigration,
  }),
  defineTool<Parameters<typeof validateSaltUsage>[1]>({
    name: "validate_salt_usage",
    description:
      "Validate Salt usage in code for component-choice alignment, deprecations, accessibility, and token usage.",
    inputSchema: {
      code: z.string().describe("Code to validate."),
      framework: z
        .string()
        .optional()
        .describe("Code framework, defaults to react."),
      package_version: z
        .string()
        .optional()
        .describe("Optional package version context."),
      max_issues: z
        .number()
        .int()
        .min(1)
        .max(50)
        .optional()
        .describe("Maximum number of issues returned."),
    },
    execute: validateSaltUsage,
  }),
  defineTool<Parameters<typeof recommendFixRecipes>[1]>({
    name: "recommend_fix_recipes",
    description:
      "Recommend consumer-facing remediation recipes by combining Salt validation issues, migration suggestions, docs, and examples.",
    inputSchema: {
      code: z.string().describe("Code to analyze and remediate."),
      framework: z
        .string()
        .optional()
        .describe("Code framework, defaults to react."),
      package_version: z
        .string()
        .optional()
        .describe("Optional package version context."),
      max_recipes: z
        .number()
        .int()
        .min(1)
        .max(50)
        .optional()
        .describe("Maximum number of remediation recipes returned."),
      view: z
        .enum(VIEWS)
        .optional()
        .describe(
          "Use full to include raw validation, migration, and example evidence.",
        ),
    },
    execute: recommendFixRecipes,
  }),
];

const toolPriorityByName = new Map<string, number>(
  CONSUMER_DEFAULT_TOOL_ORDER.map((name, index) => [name, index] as const),
);

export const TOOL_DEFINITIONS: readonly ToolDefinition[] =
  RAW_TOOL_DEFINITIONS.map((definition, index) => ({
    definition,
    index,
    priority:
      toolPriorityByName.get(definition.name) ??
      CONSUMER_DEFAULT_TOOL_ORDER.length + index,
  }))
    .sort((left, right) => {
      if (left.priority !== right.priority) {
        return left.priority - right.priority;
      }

      return left.index - right.index;
    })
    .map(({ definition }) => definition);
