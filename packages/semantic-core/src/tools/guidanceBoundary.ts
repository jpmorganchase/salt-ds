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

interface GuidanceBoundaryOptions {
  workflow:
    | "choose_salt_solution"
    | "translate_ui_to_salt"
    | "discover_salt"
    | "get_salt_entity"
    | "get_salt_examples"
    | "analyze_salt_code"
    | "compare_salt_versions";
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
  target_type?: "component" | "pattern";
  routed_workflow?:
    | "discover_salt"
    | "translate_ui_to_salt"
    | "choose_salt_solution"
    | "get_salt_entity"
    | "get_salt_examples"
    | "compare_salt_versions";
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
}

function uniqueTopics(
  topics: Array<ProjectConventionsTopic | null | undefined>,
): ProjectConventionsTopic[] {
  return [...new Set(topics.filter(Boolean))] as ProjectConventionsTopic[];
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
  if (!nextStep) {
    return nextStep;
  }

  if (!boundary.project_conventions.check_recommended) {
    return nextStep;
  }

  const topicSummary = describeProjectConventionsChecks(
    boundary.project_conventions.topics,
  );

  if (!topicSummary) {
    return `${nextStep} Then confirm any relevant project conventions before finalizing the implementation.`;
  }

  return `${nextStep} Then confirm ${topicSummary} through project conventions before finalizing the implementation.`;
}

function getChooseSaltSolutionConventionsHint(
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

function getTranslateUiToSaltConventionsHint(
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

function getDiscoverSaltConventionsHint(
  options: GuidanceBoundaryOptions,
): ProjectConventionsHint {
  if (options.routed_workflow === "translate_ui_to_salt") {
    return {
      supported: true,
      contract: "project_conventions_v1",
      check_recommended: true,
      topics: uniqueTopics([
        "wrappers",
        "page-patterns",
        "local-layout",
        ...(options.project_conventions_topics ?? []),
      ]),
      reason:
        "Discovery is routing into a canonical Salt translation plan. Confirm local wrappers and project-specific patterns through separate project conventions before implementation starts.",
    };
  }

  if (options.routed_workflow === "choose_salt_solution") {
    return getChooseSaltSolutionConventionsHint(
      options.solution_type,
      options.project_conventions_topics,
    );
  }

  return {
    supported: true,
    contract: "project_conventions_v1",
    check_recommended: false,
    topics: uniqueTopics(options.project_conventions_topics ?? []),
    reason:
      "Discovery is returning canonical Salt navigation or lookup guidance. Project conventions matter later only if the chosen direction needs repo-specific patterns or wrappers.",
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

function getSaltExamplesConventionsHint(
  options: GuidanceBoundaryOptions,
): ProjectConventionsHint {
  if (options.target_type === "pattern") {
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
        "These are canonical Salt examples. Confirm repo-specific page patterns or layout conventions before copying the composition directly into product code.",
    };
  }

  if (options.target_type === "component") {
    return {
      supported: true,
      contract: "project_conventions_v1",
      check_recommended: true,
      topics: uniqueTopics([
        "wrappers",
        ...(options.project_conventions_topics ?? []),
      ]),
      reason:
        "These are canonical Salt examples. Confirm whether the repo expects an approved wrapper or narrowed variant around the component before copying the example directly.",
    };
  }

  return {
    supported: true,
    contract: "project_conventions_v1",
    check_recommended: false,
    topics: uniqueTopics(options.project_conventions_topics ?? []),
    reason:
      "These are canonical Salt examples. Project conventions matter only if the repo imposes extra wrappers or composition rules around the chosen target.",
  };
}

function getAnalyzeSaltCodeConventionsHint(
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

function getCompareSaltVersionsConventionsHint(
  options: GuidanceBoundaryOptions,
): ProjectConventionsHint {
  const topics = uniqueTopics([
    options.has_deprecations ? "migration-shims" : null,
    ...(options.project_conventions_topics ?? []),
  ]);

  return {
    supported: true,
    contract: "project_conventions_v1",
    check_recommended: topics.length > 0,
    topics,
    reason:
      topics.length > 0
        ? "This is canonical Salt upgrade guidance. Confirm whether the repo uses migration shims, wrappers, or compatibility conventions before finalizing the rollout plan."
        : "This is canonical Salt upgrade guidance. Project conventions matter only if the repo layers local compatibility work on top of the standard migration path.",
  };
}

export function buildGuidanceBoundary(
  options: GuidanceBoundaryOptions,
): GuidanceBoundary {
  const projectConventions =
    options.workflow === "choose_salt_solution"
      ? getChooseSaltSolutionConventionsHint(options.solution_type)
      : options.workflow === "translate_ui_to_salt"
        ? getTranslateUiToSaltConventionsHint(options)
        : options.workflow === "get_salt_entity"
          ? getSaltEntityConventionsHint(options)
          : options.workflow === "get_salt_examples"
            ? getSaltExamplesConventionsHint(options)
            : options.workflow === "analyze_salt_code"
              ? getAnalyzeSaltCodeConventionsHint(options)
              : options.workflow === "compare_salt_versions"
                ? getCompareSaltVersionsConventionsHint(options)
                : getDiscoverSaltConventionsHint(options);

  return {
    guidance_source: "canonical_salt",
    scope: "official_salt_only",
    project_conventions: projectConventions,
  };
}
