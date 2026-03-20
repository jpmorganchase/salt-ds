export type GuidanceSource = "canonical_salt";
export type GuidanceScope = "official_salt_only";
export type ProjectConventionsContract = "project_conventions_v1";

export interface ProjectConventionsHint {
  supported: true;
  contract: ProjectConventionsContract;
  check_recommended: boolean;
  reason: string;
}

export interface GuidanceBoundary {
  guidance_source: GuidanceSource;
  scope: GuidanceScope;
  project_conventions: ProjectConventionsHint;
}

interface GuidanceBoundaryOptions {
  workflow: "choose_salt_solution" | "translate_ui_to_salt" | "discover_salt";
  solution_type?: "component" | "pattern" | "foundation" | "token";
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
}

function getChooseSaltSolutionConventionsHint(
  solutionType: GuidanceBoundaryOptions["solution_type"],
): ProjectConventionsHint {
  if (solutionType === "pattern") {
    return {
      supported: true,
      contract: "project_conventions_v1",
      check_recommended: true,
      reason:
        "Pattern and composition recommendations are canonical Salt guidance only. Confirm approved repo-level wrappers, page patterns, or workflow conventions through separate project conventions before finalizing the implementation.",
    };
  }

  if (solutionType === "component") {
    return {
      supported: true,
      contract: "project_conventions_v1",
      check_recommended: true,
      reason:
        "This is the nearest canonical Salt primitive recommendation. Confirm whether the repo uses an approved wrapper or local composition rule before landing the final component choice.",
    };
  }

  return {
    supported: true,
    contract: "project_conventions_v1",
    check_recommended: false,
    reason:
      "This is canonical Salt guidance. Project conventions can still refine local usage, but no repo-specific pattern check is typically required for this result.",
  };
}

function getTranslateUiToSaltConventionsHint(
  options: GuidanceBoundaryOptions,
): ProjectConventionsHint {
  if (!options.has_translation_input) {
    return {
      supported: true,
      contract: "project_conventions_v1",
      check_recommended: false,
      reason:
        "No translation plan was produced yet. Project conventions become relevant after a concrete Salt direction exists.",
    };
  }

  if (options.ui_flavor === "salt") {
    return {
      supported: true,
      contract: "project_conventions_v1",
      check_recommended: false,
      reason:
        "The source already looks Salt-native, so this output stays within canonical Salt guidance. Check project conventions only if the repo has local wrapper or composition rules that are not visible in the current code.",
    };
  }

  return {
    supported: true,
    contract: "project_conventions_v1",
    check_recommended: true,
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
      reason:
        "Discovery is routing into a canonical Salt translation plan. Confirm local wrappers and project-specific patterns through separate project conventions before implementation starts.",
    };
  }

  if (options.routed_workflow === "choose_salt_solution") {
    return getChooseSaltSolutionConventionsHint(options.solution_type);
  }

  return {
    supported: true,
    contract: "project_conventions_v1",
    check_recommended: false,
    reason:
      "Discovery is returning canonical Salt navigation or lookup guidance. Project conventions matter later only if the chosen direction needs repo-specific patterns or wrappers.",
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
        : getDiscoverSaltConventionsHint(options);

  return {
    guidance_source: "canonical_salt",
    scope: "official_salt_only",
    project_conventions: projectConventions,
  };
}
