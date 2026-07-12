export const REVIEW_RULE_DEFINITIONS = [
  {
    id: "review-canonical-mismatch",
    label: "canonical mismatch",
    description:
      "The code bypasses the nearest correct Salt component, pattern, or token guidance.",
  },
  {
    id: "review-composition-misuse",
    label: "composition misuse",
    description:
      "Salt primitives or patterns are combined incorrectly or required structure is missing.",
  },
  {
    id: "review-conventions-conflict",
    label: "conventions conflict",
    description:
      "Repo wrappers or local rules are ignored, or repo-local choices are treated as canonical Salt.",
  },
  {
    id: "review-migration-upgrade-risk",
    label: "migration or upgrade risk",
    description:
      "Deprecated, unstable, or version-sensitive Salt usage needs change before rollout.",
  },
  {
    id: "review-evidence-gap",
    label: "evidence gap",
    description:
      "Source review is not enough to close the question and runtime evidence is the right next step.",
  },
] as const;

export const MIGRATION_RULE_DEFINITIONS = [
  {
    id: "migrate-preserve-task-flow",
    label: "preserve task flow",
    description:
      "Preserve the user task flow, action order, and main outcome through migration.",
  },
  {
    id: "migrate-preserve-interaction-anchors",
    label: "preserve interaction anchors",
    description:
      "Preserve the key interaction anchors, landmarks, and critical states users rely on.",
  },
  {
    id: "migrate-move-toward-canonical-salt",
    label: "move toward canonical Salt",
    description:
      "Move the result toward canonical Salt patterns and primitives instead of cloning the previous system.",
  },
  {
    id: "migrate-apply-conventions-after-canonical",
    label: "apply conventions after canonical",
    description:
      "Apply wrappers and local shells only after the Salt direction is clear.",
  },
  {
    id: "migrate-use-runtime-for-current-experience",
    label: "use runtime for current experience",
    description:
      "Use runtime evidence when current landmarks, action hierarchy, or visible states must stay familiar.",
  },
  {
    id: "migrate-confirm-workflow-deltas",
    label: "confirm workflow deltas",
    description:
      "Call out workflow changes that need explicit confirmation instead of treating them as silent migration output.",
  },
] as const;

export type ReviewRuleId = (typeof REVIEW_RULE_DEFINITIONS)[number]["id"];
export type MigrationRuleId = (typeof MIGRATION_RULE_DEFINITIONS)[number]["id"];

export interface WorkflowIssueClass {
  ruleId: ReviewRuleId;
  label: string;
  description: string;
  count: number;
  semanticCategories: string[];
  semanticRules: string[];
}

const REVIEW_RULE_LOOKUP = new Map(
  REVIEW_RULE_DEFINITIONS.map((entry) => [entry.id, entry]),
);

function readString(
  record: Record<string, unknown>,
  key: string,
): string | null {
  const value = record[key];
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

export function getMigrationRuleIds(options: {
  projectConventionsMayMatter: boolean;
  runtimeScopingMatters: boolean;
  requiresConfirmation: boolean;
}): MigrationRuleId[] {
  const ruleIds: MigrationRuleId[] = [
    "migrate-preserve-task-flow",
    "migrate-preserve-interaction-anchors",
    "migrate-move-toward-canonical-salt",
  ];

  if (options.projectConventionsMayMatter) {
    ruleIds.push("migrate-apply-conventions-after-canonical");
  }

  if (options.runtimeScopingMatters) {
    ruleIds.push("migrate-use-runtime-for-current-experience");
  }

  if (options.requiresConfirmation) {
    ruleIds.push("migrate-confirm-workflow-deltas");
  }

  return ruleIds;
}

export function deriveReviewRuleId(input: {
  category?: string | null;
  rule?: string | null;
}): ReviewRuleId {
  const category = input.category?.trim() || null;
  const rule = input.rule?.trim() || null;

  if (category === "composition") {
    return "review-composition-misuse";
  }

  if (category === "deprecated" || category === "catalog-status") {
    return "review-migration-upgrade-risk";
  }

  if (category === "conventions") {
    return "review-conventions-conflict";
  }

  if (rule?.includes("wrapper")) {
    return "review-conventions-conflict";
  }

  return "review-canonical-mismatch";
}

export function buildReviewIssueClasses(
  issues: Array<Record<string, unknown>> | undefined,
  options: {
    includeEvidenceGap: boolean;
  },
): WorkflowIssueClass[] {
  const classes = new Map<ReviewRuleId, WorkflowIssueClass>();

  for (const issue of issues ?? []) {
    const ruleId = deriveReviewRuleId({
      category: readString(issue, "category"),
      rule: readString(issue, "rule"),
    });
    const definition = REVIEW_RULE_LOOKUP.get(ruleId);
    if (!definition) {
      continue;
    }

    const existing = classes.get(ruleId) ?? {
      ruleId,
      label: definition.label,
      description: definition.description,
      count: 0,
      semanticCategories: [],
      semanticRules: [],
    };

    existing.count += 1;
    const category = readString(issue, "category");
    const rule = readString(issue, "rule");
    if (category && !existing.semanticCategories.includes(category)) {
      existing.semanticCategories.push(category);
    }
    if (rule && !existing.semanticRules.includes(rule)) {
      existing.semanticRules.push(rule);
    }
    classes.set(ruleId, existing);
  }

  if (options.includeEvidenceGap) {
    const definition = REVIEW_RULE_LOOKUP.get("review-evidence-gap");
    if (definition) {
      const existing = classes.get("review-evidence-gap") ?? {
        ruleId: "review-evidence-gap" as const,
        label: definition.label,
        description: definition.description,
        count: 0,
        semanticCategories: [],
        semanticRules: [],
      };
      existing.count += 1;
      classes.set("review-evidence-gap", existing);
    }
  }

  return REVIEW_RULE_DEFINITIONS.map((definition) => classes.get(definition.id))
    .filter((entry): entry is WorkflowIssueClass => Boolean(entry))
    .filter((entry) => entry.count > 0);
}

export function collectReviewRuleIds(
  issueClasses: WorkflowIssueClass[],
): ReviewRuleId[] {
  return issueClasses.map((entry) => entry.ruleId);
}
