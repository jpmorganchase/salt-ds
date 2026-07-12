import type { IconLiteRecord, IconRecord, SaltRegistry } from "../types.js";
import type { SaltCodeAnalysis } from "./codeAnalysisCommon.js";
import type { StarterCodeSnippet } from "./starterCode.js";
import type { ValidationIssue } from "./validation/shared.js";

interface IconIntentDefinition {
  id: string;
  label: string;
  patterns: RegExp[];
  preferred_exports: string[];
  query_terms: string[];
}

export interface GroundedSaltIcon {
  intent: string;
  label: string;
  name: string;
  export_name: string;
  package: string;
  status: IconLiteRecord["status"];
  category: string;
  variant: IconLiteRecord["variant"];
  source_urls: string[];
  confidence: number;
}

export interface IconGroundingPlan {
  grounded: GroundedSaltIcon[];
  placeholders: Array<{
    intent: string;
    label: string;
    reason: string;
  }>;
}

const COMMON_ICON_INTENTS: IconIntentDefinition[] = [
  {
    id: "search",
    label: "search",
    patterns: [/\b(search|find|lookup|magnifier)\b/i],
    preferred_exports: ["SearchIcon"],
    query_terms: ["search", "find", "lookup", "magnifier"],
  },
  {
    id: "close",
    label: "close",
    patterns: [/\b(close|dismiss|cancel|clear|x icon)\b/i],
    preferred_exports: ["CloseIcon"],
    query_terms: ["close", "dismiss", "cancel", "clear"],
  },
  {
    id: "add",
    label: "add",
    patterns: [/\b(add button|add action|plus|new item|create action)\b/i],
    preferred_exports: ["AddIcon"],
    query_terms: ["add", "plus", "new", "create"],
  },
  {
    id: "delete",
    label: "delete",
    patterns: [/\b(delete|remove|trash|discard)\b/i],
    preferred_exports: ["DeleteIcon"],
    query_terms: ["delete", "remove", "trash", "discard"],
  },
  {
    id: "edit",
    label: "edit",
    patterns: [/\b(edit|modify|write|draft)\b/i],
    preferred_exports: ["EditIcon", "DocumentEditIcon"],
    query_terms: ["edit", "modify", "write", "draft"],
  },
  {
    id: "settings",
    label: "settings",
    patterns: [/\b(settings|preferences|configuration|gear)\b/i],
    preferred_exports: ["SettingsIcon"],
    query_terms: ["settings", "preferences", "configuration", "gear"],
  },
  {
    id: "menu",
    label: "menu",
    patterns: [/\b(menu|overflow|more actions|kebab|ellipsis)\b/i],
    preferred_exports: ["MenuIcon", "OverflowMenuIcon"],
    query_terms: ["menu", "overflow", "more", "actions"],
  },
  {
    id: "filter",
    label: "filter",
    patterns: [/\b(filter|funnel|refine)\b/i],
    preferred_exports: ["FilterIcon"],
    query_terms: ["filter", "funnel", "refine"],
  },
  {
    id: "sort",
    label: "sort",
    patterns: [/\b(sort|sortable|ascending|descending)\b/i],
    preferred_exports: ["SortIcon"],
    query_terms: ["sort", "sortable", "ascending", "descending"],
  },
  {
    id: "upload",
    label: "upload",
    patterns: [/\b(upload|attach file|cloud upload)\b/i],
    preferred_exports: ["UploadIcon", "CloudUploadIcon"],
    query_terms: ["upload", "attach", "file"],
  },
  {
    id: "download",
    label: "download",
    patterns: [/\b(download|export|save file)\b/i],
    preferred_exports: ["DownloadIcon", "CloudDownloadIcon"],
    query_terms: ["download", "export", "save"],
  },
  {
    id: "warning",
    label: "warning",
    patterns: [/\b(warning|alert|caution|danger)\b/i],
    preferred_exports: ["WarningIcon"],
    query_terms: ["warning", "alert", "caution", "danger"],
  },
  {
    id: "success",
    label: "success",
    patterns: [/\b(success|complete|completed|checkmark|tick)\b/i],
    preferred_exports: ["SuccessIcon", "SuccessCircleIcon", "CheckmarkIcon"],
    query_terms: ["success", "complete", "checkmark", "tick"],
  },
  {
    id: "info",
    label: "info",
    patterns: [/\b(info|information|help|support)\b/i],
    preferred_exports: ["InfoIcon", "HelpCircleIcon"],
    query_terms: ["info", "information", "help", "support"],
  },
  {
    id: "calendar",
    label: "calendar",
    patterns: [/\b(calendar|date|schedule|planner)\b/i],
    preferred_exports: ["CalendarIcon", "ScheduleIcon"],
    query_terms: ["calendar", "date", "schedule", "planner"],
  },
  {
    id: "user",
    label: "user",
    patterns: [/\b(user|person|profile|account)\b/i],
    preferred_exports: ["UserIcon", "AccountIcon"],
    query_terms: ["user", "person", "profile", "account"],
  },
  {
    id: "navigation",
    label: "navigation",
    patterns: [/\b(navigation|back|next|arrow)\b/i],
    preferred_exports: ["ArrowRightIcon", "ArrowLeftIcon"],
    query_terms: ["navigation", "back", "next", "arrow"],
  },
];

function normalize(value: string): string {
  return value
    .replace(/Icon$/i, "")
    .replace(/[^a-z0-9]+/gi, " ")
    .trim()
    .toLowerCase();
}

function normalizeKey(value: string): string {
  return normalize(value).replace(/\s+/g, "");
}

function expandIconIntentText(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/Icon\b/g, " icon");
}

function toIconLiteRecord(icon: IconRecord): IconLiteRecord {
  return {
    name: icon.name,
    export_name: icon.source.export_name ?? icon.name,
    package: icon.package.name,
    status: icon.status,
    category: icon.category,
    variant: icon.variant,
    aliases: icon.aliases,
    synonyms: icon.synonyms,
  };
}

function getAvailableIconRecords(registry: SaltRegistry): IconLiteRecord[] {
  try {
    return Array.isArray(registry.icons)
      ? registry.icons.map(toIconLiteRecord)
      : [];
  } catch {
    return [];
  }
}

function scoreIcon(icon: IconLiteRecord, intent: IconIntentDefinition): number {
  const exportKey = normalizeKey(icon.export_name);
  const nameKey = normalizeKey(icon.name);
  const preferredKeys = intent.preferred_exports.map(normalizeKey);
  if (preferredKeys.includes(exportKey) || preferredKeys.includes(nameKey)) {
    return 100 + (icon.variant === "outline" ? 2 : 0);
  }

  const exactTerms = new Set(intent.query_terms.map(normalizeKey));
  const searchable = [
    icon.name,
    icon.export_name,
    icon.category,
    ...icon.aliases,
    ...icon.synonyms,
  ];
  let score = 0;
  for (const value of searchable) {
    const valueKey = normalizeKey(value);
    const valueText = normalize(value);
    if (exactTerms.has(valueKey)) {
      score = Math.max(score, 82);
    } else if (
      intent.query_terms.some((term) =>
        valueText.split(/\s+/).includes(normalize(term)),
      )
    ) {
      score = Math.max(score, 64);
    } else if (
      intent.query_terms.some((term) => valueText.includes(normalize(term)))
    ) {
      score = Math.max(score, 48);
    }
  }

  if (icon.status === "deprecated") {
    score -= 20;
  }
  if (icon.variant === "outline") {
    score += 2;
  }
  return score;
}

function detectRequestedIconIntents(text: string): IconIntentDefinition[] {
  const normalizedText = expandIconIntentText(text).trim();
  if (!normalizedText) {
    return [];
  }

  const matches = COMMON_ICON_INTENTS.filter((intent) =>
    intent.patterns.some((pattern) => pattern.test(normalizedText)),
  );
  return matches.filter(
    (intent, index) =>
      matches.findIndex((candidate) => candidate.id === intent.id) === index,
  );
}

function detectGenericUnknownIcon(text: string): boolean {
  return /\b(icon|symbol|glyph)\b/i.test(expandIconIntentText(text));
}

export function buildIconGroundingPlan(
  registry: SaltRegistry,
  text: string,
  options: { max_icons?: number } = {},
): IconGroundingPlan {
  const intents = detectRequestedIconIntents(text).slice(
    0,
    Math.max(1, options.max_icons ?? 4),
  );
  const grounded: GroundedSaltIcon[] = [];
  const placeholders: IconGroundingPlan["placeholders"] = [];

  if (intents.length === 0) {
    return detectGenericUnknownIcon(text)
      ? {
          grounded,
          placeholders: [
            {
              intent: "unknown-icon",
              label: "requested icon",
              reason:
                "The request mentions an icon, but no specific grounded Salt icon intent was detected.",
            },
          ],
        }
      : { grounded, placeholders };
  }

  const iconRecords = getAvailableIconRecords(registry);
  for (const intent of intents) {
    const ranked = iconRecords
      .map((icon) => ({ icon, score: scoreIcon(icon, intent) }))
      .filter((entry) => entry.score >= 50)
      .sort((left, right) => {
        if (left.score !== right.score) {
          return right.score - left.score;
        }
        return left.icon.name.localeCompare(right.icon.name);
      });
    const best = ranked[0]?.icon;
    if (!best) {
      placeholders.push({
        intent: intent.id,
        label: intent.label,
        reason: `No Salt icon in the bundled offline catalog confidently matched ${intent.label}.`,
      });
      continue;
    }

    grounded.push({
      intent: intent.id,
      label: intent.label,
      name: best.name,
      export_name: best.export_name,
      package: best.package,
      status: best.status,
      category: best.category,
      variant: best.variant,
      source_urls: [],
      confidence: ranked[0]?.score ?? 0,
    });
  }

  return { grounded, placeholders };
}

function toIconSlotsSnippet(
  plan: IconGroundingPlan,
): StarterCodeSnippet | null {
  if (plan.grounded.length === 0 && plan.placeholders.length === 0) {
    return null;
  }

  const groundedByExport = [
    ...new Map(
      plan.grounded.map((icon) => [icon.export_name, icon] as const),
    ).values(),
  ];
  const importLine =
    groundedByExport.length > 0
      ? `import { ${groundedByExport
          .map((icon) => icon.export_name)
          .sort((left, right) => left.localeCompare(right))
          .join(", ")} } from "@salt-ds/icons";`
      : null;
  const groundedLines = plan.grounded.map(
    (icon) =>
      `  ${JSON.stringify(icon.intent)}: <${icon.export_name} aria-hidden />,`,
  );
  const placeholderLines = plan.placeholders.map(
    (placeholder) =>
      `  ${JSON.stringify(placeholder.intent)}: null, // ${placeholder.reason}`,
  );
  const code = [
    ...(importLine ? [importLine, ""] : []),
    "export const groundedSaltIconSlots = {",
    ...groundedLines,
    ...placeholderLines,
    "};",
  ].join("\n");
  const sourceUrls = [
    ...new Set(plan.grounded.flatMap((icon) => icon.source_urls)),
  ];

  return {
    label: "Grounded Salt icon slots",
    language: "tsx",
    code,
    ...(sourceUrls.length > 0 ? { source_urls: sourceUrls } : {}),
    notes: [
      "Icon imports are limited to exports found in the bundled offline Salt catalog.",
      "Treat these as slots: place decorative icons with aria-hidden, and give icon-only controls their own accessible label.",
      ...plan.placeholders.map(
        (placeholder) =>
          `${placeholder.label}: ${placeholder.reason} Use a project placeholder until a grounded Salt icon is selected.`,
      ),
    ],
  };
}

export function appendGroundedIconStarterSnippet(
  registry: SaltRegistry,
  snippets: StarterCodeSnippet[] | undefined,
  text: string,
): StarterCodeSnippet[] | undefined {
  const plan = buildIconGroundingPlan(registry, text);
  const snippet = toIconSlotsSnippet(plan);
  if (!snippet) {
    return snippets;
  }
  return [...(snippets ?? []), snippet];
}

export function buildSaltIconImportIssues(
  registry: SaltRegistry,
  analysis: SaltCodeAnalysis | null,
): { issues: ValidationIssue[]; missing_data: string[] } {
  if (!analysis) {
    return { issues: [], missing_data: [] };
  }

  const saltIconImports = analysis.saltImports.filter(
    (imported) =>
      !imported.typeOnly &&
      imported.packageName === "@salt-ds/icons" &&
      imported.imported !== "*" &&
      imported.imported !== "default",
  );
  if (saltIconImports.length === 0) {
    return { issues: [], missing_data: [] };
  }

  const iconRecords = getAvailableIconRecords(registry);
  if (iconRecords.length === 0) {
    return {
      issues: [],
      missing_data: [
        "Salt icon imports were not grounded because the bundled offline icon catalog is unavailable.",
      ],
    };
  }

  const iconByExport = new Map(
    iconRecords.map((icon) => [normalizeKey(icon.export_name), icon] as const),
  );
  const issues: ValidationIssue[] = [];
  const seen = new Set<string>();

  for (const imported of saltIconImports) {
    const key = normalizeKey(imported.imported);
    if (iconByExport.has(key) || seen.has(key)) {
      continue;
    }
    seen.add(key);

    const suggestion = buildIconGroundingPlan(registry, imported.imported, {
      max_icons: 1,
    }).grounded[0];
    issues.push({
      id: `catalog-status.unknown-salt-icon.${key || "import"}`,
      category: "catalog-status",
      rule: "unknown-salt-icon-import",
      severity: "warning",
      title: "Unknown Salt icon import",
      message: `${imported.imported} is imported from @salt-ds/icons, but it is not present in the bundled offline Salt icon catalog.`,
      evidence: [
        `Detected import { ${imported.imported} } from "@salt-ds/icons".`,
        "Salt icon imports are checked against the bundled offline icon catalog.",
        ...(suggestion
          ? [`Closest grounded Salt icon candidate: ${suggestion.export_name}.`]
          : []),
      ],
      canonical_source: suggestion?.source_urls[0] ?? null,
      suggested_fix: suggestion
        ? `Use ${suggestion.export_name} from @salt-ds/icons if it matches the intended visual metaphor; otherwise keep a project-local placeholder until a grounded Salt icon is chosen.`
        : "Replace the import with a grounded Salt icon from the bundled catalog, or keep it as a project-local wrapper outside @salt-ds/icons.",
      confidence: suggestion ? 0.8 : 0.72,
      source_urls: suggestion?.source_urls ?? [],
      matches: 1,
      fix_hints: {
        guide_lookups: [],
        related_components: [],
        extra_steps: suggestion
          ? [`Confirm ${suggestion.export_name} is the intended icon metaphor.`]
          : ["Resolve the intended visual metaphor before selecting an icon."],
      },
    });
  }

  return { issues, missing_data: [] };
}
