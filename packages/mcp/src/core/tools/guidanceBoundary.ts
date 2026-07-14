export type GuidanceSource = "canonical_salt";
export type GuidanceScope = "official_salt_only";
export type ProjectConventionsContract = "project_conventions_v1";
export type ProjectConventionsTopic =
  | "wrappers"
  | "page-patterns"
  | "navigation-shell"
  | "local-layout"
  | "migration-shims";

export interface ProjectConventionsHint {
  supported: true;
  contract: ProjectConventionsContract;
  check_recommended: boolean;
  topics: ProjectConventionsTopic[];
  reason: string;
}

export interface GuidanceBoundary {
  guidance_source: GuidanceSource;
  scope: GuidanceScope;
  project_conventions: ProjectConventionsHint;
}

const PROJECT_CONVENTIONS_TOPIC_LABELS: Record<
  ProjectConventionsTopic,
  string
> = {
  wrappers: "repo wrappers",
  "page-patterns": "page patterns",
  "navigation-shell": "navigation shell conventions",
  "local-layout": "local layout conventions",
  "migration-shims": "migration shims",
};

const PROJECT_CONVENTIONS_TOPIC_HINTS: Record<ProjectConventionsTopic, string> =
  {
    wrappers:
      "approved repo wrappers for analytics, defaults, or shared behavior",
    "page-patterns": "approved page patterns and workflow scaffolds",
    "navigation-shell": "approved navigation shells or workspace rails",
    "local-layout": "local layout containers and screen skeletons",
    "migration-shims": "migration shims or compatibility rules",
  };

type GuidanceBoundaryOptions = {
  solution_type?: "component" | "pattern" | "foundation" | "token";
  entity_type?:
    | "component"
    | "pattern"
    | "foundation"
    | "token"
    | "guide"
    | "page"
    | "package"
    | "icon"
    | "country_symbol";
  has_translation_input?: boolean;
  ui_flavor?:
    | "description"
    | "salt"
    | "mixed"
    | "external-ui"
    | "generic-react";
  issue_categories?: string[];
  has_deprecations?: boolean;
  project_conventions_topics?: ProjectConventionsTopic[];
  workflow:
    | "get_salt_reference"
    | "create_salt_ui"
    | "migrate_to_salt"
    | "review_salt_ui";
};

function uniqueTopics(
  topics: Array<ProjectConventionsTopic | null | undefined>,
): ProjectConventionsTopic[] {
  return [...new Set(topics.filter(Boolean))] as ProjectConventionsTopic[];
}

function isProjectConventionsTopic(
  topic: string,
): topic is ProjectConventionsTopic {
  return (
    topic === "wrappers" ||
    topic === "page-patterns" ||
    topic === "navigation-shell" ||
    topic === "local-layout" ||
    topic === "migration-shims"
  );
}

export function describeProjectConventionsTopics(
  topics: ProjectConventionsTopic[],
): string | null {
  const labels = uniqueTopics(topics).map(
    (topic) => PROJECT_CONVENTIONS_TOPIC_LABELS[topic],
  );

  if (labels.length === 0) {
    return null;
  }

  if (labels.length === 1) {
    return labels[0];
  }

  if (labels.length === 2) {
    return `${labels[0]} and ${labels[1]}`;
  }

  return `${labels.slice(0, -1).join(", ")}, and ${labels.at(-1)}`;
}

export function describeProjectConventionsChecks(
  topics: ProjectConventionsTopic[],
): string | null {
  const hints = uniqueTopics(topics).map(
    (topic) => PROJECT_CONVENTIONS_TOPIC_HINTS[topic],
  );

  if (hints.length === 0) {
    return null;
  }

  if (hints.length === 1) {
    return hints[0];
  }

  if (hints.length === 2) {
    return `${hints[0]} and ${hints[1]}`;
  }

  return `${hints.slice(0, -1).join(", ")}, and ${hints.at(-1)}`;
}

export function appendProjectConventionsNextStep(
  nextStep: string | undefined,
  boundary: GuidanceBoundary,
): string | undefined {
  return appendProjectConventionsCheckNextStep(
    nextStep,
    boundary.project_conventions,
  );
}

export function appendProjectConventionsCheckNextStep(
  nextStep: string | undefined,
  projectConventions: {
    check_recommended: boolean;
    topics: readonly string[];
  },
): string | undefined {
  if (!nextStep) {
    return nextStep;
  }

  if (!projectConventions.check_recommended) {
    return nextStep;
  }

  if (/\bproject[- ]conventions\b/i.test(nextStep)) {
    return nextStep;
  }

  const topicSummary = describeProjectConventionsChecks(
    projectConventions.topics.filter(isProjectConventionsTopic),
  );

  if (!topicSummary) {
    return `${nextStep} Then confirm any relevant project conventions before finalizing the implementation.`;
  }

  return `${nextStep} Then confirm ${topicSummary} through project conventions before finalizing the implementation.`;
}

function getCreateSaltUiConventionsHint(
  solutionType: GuidanceBoundaryOptions["solution_type"],
  extraTopics: ProjectConventionsTopic[] = [],
): ProjectConventionsHint {
  if (solutionType === "pattern") {
    return {
      supported: true,
      contract: "project_conventions_v1",
      check_recommended: true,
      topics: uniqueTopics(["page-patterns", "local-layout", ...extraTopics]),
      reason:
        "Pattern and composition recommendations are canonical Salt guidance only. Confirm approved repo-level wrappers, page patterns, or workflow conventions through separate project conventions before finalizing the implementation.",
    };
  }

  if (solutionType === "component") {
    return {
      supported: true,
      contract: "project_conventions_v1",
      check_recommended: true,
      topics: uniqueTopics(["wrappers", ...extraTopics]),
      reason:
        "This is the nearest canonical Salt primitive recommendation. Confirm whether the repo uses an approved wrapper or local composition rule before landing the final component choice.",
    };
  }

  return {
    supported: true,
    contract: "project_conventions_v1",
    check_recommended: false,
    topics: uniqueTopics(extraTopics),
    reason:
      "This is canonical Salt guidance. Project conventions can still refine local usage, but no repo-specific pattern check is typically required for this result.",
  };
}

function getMigrateToSaltConventionsHint(
  options: GuidanceBoundaryOptions,
): ProjectConventionsHint {
  const translationTopics = uniqueTopics([
    "wrappers",
    "page-patterns",
    ...((options.project_conventions_topics ??
      []) as ProjectConventionsTopic[]),
  ]);

  if (!options.has_translation_input) {
    return {
      supported: true,
      contract: "project_conventions_v1",
      check_recommended: false,
      topics: uniqueTopics(options.project_conventions_topics ?? []),
      reason:
        "No translation plan was produced yet. Project conventions become relevant after a concrete Salt direction exists.",
    };
  }

  if (options.ui_flavor === "salt") {
    return {
      supported: true,
      contract: "project_conventions_v1",
      check_recommended: translationTopics.length > 0,
      topics: translationTopics,
      reason:
        "The source already looks Salt-native, so this output stays within canonical Salt guidance. Check project conventions only if the repo has local wrapper or composition rules that are not visible in the current code.",
    };
  }

  return {
    supported: true,
    contract: "project_conventions_v1",
    check_recommended: true,
    topics: translationTopics,
    reason:
      "This translation plan is a canonical Salt starter direction. Confirm repo-local wrappers, app-shell patterns, and approved abstractions through separate project conventions before final implementation work.",
  };
}

function getSaltEntityConventionsHint(
  options: GuidanceBoundaryOptions,
): ProjectConventionsHint {
  const entityType = options.entity_type;

  if (entityType === "component") {
    return {
      supported: true,
      contract: "project_conventions_v1",
      check_recommended: true,
      topics: uniqueTopics([
        "wrappers",
        ...(options.project_conventions_topics ?? []),
      ]),
      reason:
        "This lookup resolves canonical Salt component guidance. Confirm whether the repo wraps or narrows this primitive through project conventions before treating it as the final project answer.",
    };
  }

  if (
    entityType === "pattern" ||
    entityType === "guide" ||
    entityType === "page"
  ) {
    return {
      supported: true,
      contract: "project_conventions_v1",
      check_recommended: true,
      topics: uniqueTopics([
        "page-patterns",
        "local-layout",
        ...(options.project_conventions_topics ?? []),
      ]),
      reason:
        "This lookup resolves canonical Salt flow or page guidance. Confirm whether the repo has approved page patterns or shell conventions before treating it as the final project structure.",
    };
  }

  return {
    supported: true,
    contract: "project_conventions_v1",
    check_recommended: false,
    topics: uniqueTopics(options.project_conventions_topics ?? []),
    reason:
      "This lookup resolves canonical Salt reference guidance. Project conventions usually matter later only if the repo layers local abstractions on top of the resolved entity.",
  };
}

function getReviewSaltUiConventionsHint(
  options: GuidanceBoundaryOptions,
): ProjectConventionsHint {
  const categories = new Set(options.issue_categories ?? []);
  const topics = uniqueTopics([
    categories.has("composition") || categories.has("primitive-choice")
      ? "wrappers"
      : null,
    categories.has("composition") ? "page-patterns" : null,
    categories.has("deprecated") || options.has_deprecations
      ? "migration-shims"
      : null,
    ...(options.project_conventions_topics ?? []),
  ]);

  return {
    supported: true,
    contract: "project_conventions_v1",
    check_recommended: topics.length > 0,
    topics,
    reason:
      topics.length > 0
        ? "This analysis is canonical Salt validation. If the repo uses wrappers, local page patterns, or migration shims that affect these findings, confirm them through project conventions before finalizing the fix plan."
        : "This analysis is canonical Salt validation. No project-conventions check is usually required unless the repo layers local abstractions on top of the analyzed code.",
  };
}

export function buildGuidanceBoundary(
  options: GuidanceBoundaryOptions,
): GuidanceBoundary {
  const projectConventions =
    options.workflow === "create_salt_ui"
      ? getCreateSaltUiConventionsHint(options.solution_type)
      : options.workflow === "migrate_to_salt"
        ? getMigrateToSaltConventionsHint(options)
        : options.workflow === "get_salt_reference"
          ? getSaltEntityConventionsHint(options)
          : getReviewSaltUiConventionsHint(options);

  return {
    guidance_source: "canonical_salt",
    scope: "official_salt_only",
    project_conventions: projectConventions,
  };
}
