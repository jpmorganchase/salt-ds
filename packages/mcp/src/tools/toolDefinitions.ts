import * as z from "zod/v4";
import type { SaltRegistry } from "../types.js";
import { analyzeSaltCode } from "./analyzeSaltCode.js";
import { chooseSaltSolution } from "./chooseSaltSolution.js";
import { compareSaltVersions } from "./compareSaltVersions.js";
import { discoverSalt } from "./discoverSalt.js";
import { getSaltEntity } from "./getSaltEntity.js";
import { getSaltExamples } from "./getSaltExamples.js";
import { translateUiToSalt } from "./translateUiToSalt.js";

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
const INCLUDE_SECTIONS = [
  "examples",
  "props",
  "tokens",
  "accessibility",
  "deprecations",
  "changes",
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

const DEFAULT_TOOL_ORDER = [
  "discover_salt",
  "translate_ui_to_salt",
  "choose_salt_solution",
  "get_salt_entity",
  "get_salt_examples",
  "analyze_salt_code",
  "compare_salt_versions",
] as const;

const RAW_TOOL_DEFINITIONS: readonly ToolDefinition[] = [
  defineTool<Parameters<typeof discoverSalt>[1]>({
    name: "discover_salt",
    description:
      "Use this for broad, ambiguous, or exploratory Salt requests when the caller is not yet sure which Salt entity or workflow they need. It searches, clarifies intent, and routes to the best next Salt workflow. Returns canonical Salt guidance only; project-specific conventions belong in separate project conventions. Do not use this for direct recommendation or known-entity lookup.",
    inputSchema: {
      query: z
        .string()
        .optional()
        .describe(
          "Broad Salt question or exploratory UI request. Use this when the user is still figuring out the right Salt entity or workflow.",
        ),
      area: z
        .enum(SEARCH_AREAS)
        .optional()
        .describe(
          "Optional high-level Salt area to browse or search within, such as components, foundations, patterns, or tokens.",
        ),
      package: z
        .string()
        .optional()
        .describe(
          "Optional package filter when discovery should stay within one Salt package, such as @salt-ds/core or @salt-ds/lab.",
        ),
      status: z
        .enum(STATUSES)
        .optional()
        .describe(
          "Optional release-status filter. Use stable when discovery should avoid beta, lab, or deprecated results.",
        ),
      related_to: z
        .object({
          entity_type: z.enum([
            "component",
            "pattern",
            "token",
            "guide",
            "page",
          ]),
          name: z.string(),
          package: z.string().optional(),
        })
        .optional()
        .describe(
          "Start from a known Salt entity and explore nearby related entities instead of resolving one exact item.",
        ),
      view: z
        .enum(VIEWS)
        .optional()
        .describe(
          "Use full to include routing evidence and raw search payloads.",
        ),
    },
    execute: discoverSalt,
  }),
  defineTool<Parameters<typeof translateUiToSalt>[1]>({
    name: "translate_ui_to_salt",
    description:
      "Use this when the input is non-Salt UI code, a foreign component library, native/custom React UI, or a rough interface description that needs to be translated into Salt primitives, patterns, and migration steps. It returns a canonical Salt starter plan only; project-specific patterns and wrappers belong in separate project conventions. Do not use it for Salt-native validation or version-to-version upgrade analysis.",
    inputSchema: {
      code: z
        .string()
        .optional()
        .describe(
          "Optional source UI code to inspect before translating it into Salt targets.",
        ),
      query: z
        .string()
        .optional()
        .describe(
          "Optional description of the source UI, mockup, or migration goal when code is partial or unavailable.",
        ),
      source_outline: z
        .object({
          regions: z.array(z.string()).optional(),
          actions: z.array(z.string()).optional(),
          states: z.array(z.string()).optional(),
          notes: z.array(z.string()).optional(),
        })
        .optional()
        .describe(
          "Optional structured mockup or design outline with regions, actions, and states when you want to translate a screen description into Salt more explicitly.",
        ),
      package: z
        .string()
        .optional()
        .describe(
          "Restrict package-backed Salt targets to a specific Salt package such as @salt-ds/core or @salt-ds/lab.",
        ),
      prefer_stable: z.boolean().optional(),
      a11y_required: z.boolean().optional(),
      form_field_support: z.boolean().optional(),
      include_starter_code: z.boolean().optional(),
      view: z
        .enum(VIEWS)
        .optional()
        .describe(
          "Use full to include the raw detection signals and recommendation payloads.",
        ),
    },
    execute: translateUiToSalt,
  }),
  defineTool<Parameters<typeof chooseSaltSolution>[1]>({
    name: "choose_salt_solution",
    description:
      "Use this for Salt recommendation or side-by-side comparison. If names is present, comparison mode wins; otherwise query drives recommendation mode. Recommendations are canonical Salt guidance only; project-specific conventions belong in separate project conventions.",
    inputSchema: {
      query: z
        .string()
        .optional()
        .describe(
          "Recommendation mode only. Describe the user need, task, flow, styling need, or capability requirement when you want Salt to suggest the best fit.",
        ),
      names: z
        .array(z.string())
        .optional()
        .describe(
          "Comparison mode. Provide 2 or more exact Salt names to compare side by side. If present, this tool compares those names instead of recommending from query.",
        ),
      solution_type: z
        .enum(["auto", "component", "pattern", "foundation", "token"])
        .optional()
        .describe(
          "Optional solution-family hint when the request already points to components, patterns, foundations, or tokens.",
        ),
      package: z
        .string()
        .optional()
        .describe(
          "Restrict package-backed candidates to a specific Salt package such as @salt-ds/core or @salt-ds/lab.",
        ),
      status: z
        .enum(STATUSES)
        .optional()
        .describe(
          "Restrict candidates by release status. Use stable when the request must avoid beta, lab, or deprecated options.",
        ),
      top_k: z.number().int().min(1).max(25).optional(),
      production_ready: z.boolean().optional(),
      prefer_stable: z.boolean().optional(),
      a11y_required: z.boolean().optional(),
      form_field_support: z.boolean().optional(),
      include_starter_code: z.boolean().optional(),
      view: z
        .enum(VIEWS)
        .optional()
        .describe(
          "Use full to include raw comparison or recommendation evidence.",
        ),
    },
    execute: chooseSaltSolution,
  }),
  defineTool<Parameters<typeof getSaltEntity>[1]>({
    name: "get_salt_entity",
    description:
      "Use this for known or near-known Salt entity lookup. Resolve a specific or almost-specific component, pattern, foundation, token, guide, page, package, icon, or country symbol. Do not use this for broad discovery or recommendation/comparison.",
    inputSchema: {
      entity_type: z
        .enum([
          "auto",
          "component",
          "pattern",
          "foundation",
          "token",
          "guide",
          "page",
          "package",
          "icon",
          "country_symbol",
        ])
        .optional()
        .describe(
          "Set this when you already know the Salt entity family. Leave it as auto when the name or query could match different entity types.",
        ),
      name: z
        .string()
        .optional()
        .describe(
          "Known or near-known Salt entity name. Prefer this when the caller already has a specific component, token, guide, icon, or other entity in mind.",
        ),
      query: z
        .string()
        .optional()
        .describe(
          "Near-known backup query when the caller roughly knows the entity but not the exact Salt name.",
        ),
      package: z
        .string()
        .optional()
        .describe(
          "Optional package filter when the entity should resolve within a specific Salt package, such as @salt-ds/core or @salt-ds/lab.",
        ),
      status: z
        .enum(STATUSES)
        .optional()
        .describe(
          "Optional release-status filter. Use stable when the lookup should avoid beta, lab, or deprecated matches.",
        ),
      include: z
        .array(z.enum(INCLUDE_SECTIONS))
        .optional()
        .describe(
          "Optional extra sections to include on the resolved entity, such as examples, props, tokens, accessibility, deprecations, or changes.",
        ),
      include_related: z
        .boolean()
        .optional()
        .describe(
          "Include nearby related Salt entities after resolving the main match.",
        ),
      include_starter_code: z
        .boolean()
        .optional()
        .describe(
          "Include a lightweight starter snippet when the resolved entity already has one.",
        ),
      max_results: z
        .number()
        .int()
        .min(1)
        .max(50)
        .optional()
        .describe(
          "Maximum nearby matches to return when the lookup is not exact.",
        ),
      include_deprecated: z
        .boolean()
        .optional()
        .describe("Include deprecated token matches when looking up tokens."),
      view: z
        .enum(VIEWS)
        .optional()
        .describe(
          "Use full to include raw lookup and fallback search payloads.",
        ),
    },
    execute: getSaltEntity,
  }),
  defineTool<Parameters<typeof getSaltExamples>[1]>({
    name: "get_salt_examples",
    description:
      "Find the best Salt implementation examples and nearby variants for a component or pattern, with optional lightweight starter snippets.",
    inputSchema: {
      target_type: z.enum(["component", "pattern"]).optional(),
      target_name: z.string().optional(),
      package: z.string().optional(),
      query: z
        .string()
        .optional()
        .describe("Scenario or intent query used to rank examples."),
      complexity: z.enum(["basic", "intermediate", "advanced"]).optional(),
      include_code: z.boolean().optional(),
      include_starter_code: z.boolean().optional(),
      max_results: z.number().int().min(1).max(50).optional(),
      view: z
        .enum(VIEWS)
        .optional()
        .describe("Use full to include the ranked example list."),
    },
    execute: getSaltExamples,
  }),
  defineTool<Parameters<typeof analyzeSaltCode>[1]>({
    name: "analyze_salt_code",
    description:
      "Analyze existing React and Salt code. Validate usage, detect deprecated APIs and patterns, suggest fixes, and surface migration guidance.",
    inputSchema: {
      code: z.string().describe("Source code to analyze."),
      framework: z.string().optional(),
      package_version: z
        .string()
        .optional()
        .describe("Version-aware context for validation and fix guidance."),
      from_version: z
        .string()
        .optional()
        .describe(
          "Optional source version boundary for migration suggestions.",
        ),
      to_version: z
        .string()
        .optional()
        .describe(
          "Optional target version boundary for migration suggestions.",
        ),
      max_issues: z.number().int().min(1).max(50).optional(),
      view: z
        .enum(VIEWS)
        .optional()
        .describe(
          "Use full to include raw validation, fix, and migration payloads.",
        ),
    },
    execute: analyzeSaltCode,
  }),
  defineTool<Parameters<typeof compareSaltVersions>[1]>({
    name: "compare_salt_versions",
    description:
      "Explain Salt upgrade impact between versions, highlight breaking changes, and suggest the next migration actions.",
    inputSchema: {
      package: z.string().optional(),
      component_name: z.string().optional(),
      from_version: z.string().describe("Lower version boundary."),
      to_version: z
        .string()
        .optional()
        .describe(
          "Upper version boundary. Defaults to the latest known boundary.",
        ),
      include_deprecations: z.boolean().optional(),
      kinds: z.array(z.enum(CHANGE_KINDS)).optional(),
      max_results: z.number().int().min(1).max(100).optional(),
      view: z
        .enum(VIEWS)
        .optional()
        .describe(
          "Use full to include the filtered change and deprecation records.",
        ),
    },
    execute: compareSaltVersions,
  }),
];

const toolPriorityByName = new Map<string, number>(
  DEFAULT_TOOL_ORDER.map((name, index) => [name, index] as const),
);

export const TOOL_DEFINITIONS: readonly ToolDefinition[] =
  RAW_TOOL_DEFINITIONS.map((definition, index) => ({
    definition,
    index,
    priority: toolPriorityByName.get(definition.name) ?? index,
  }))
    .sort((left, right) => {
      if (left.priority !== right.priority) {
        return left.priority - right.priority;
      }

      return left.index - right.index;
    })
    .map(({ definition }) => definition);
