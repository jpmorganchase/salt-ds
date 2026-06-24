export function buildPolicyTemplate(
  projectName: string,
): Record<string, unknown> {
  return {
    contract: "project_conventions_v1",
    version: "1.0.0",
    project: projectName,
    preferred_components: [],
    approved_wrappers: [],
    pattern_preferences: [],
    banned_choices: [],
    notes: [
      "Start with .salt/team.json. Add .salt/stack.json only when shared upstream layers are real.",
      "Repo-aware Salt workflows apply declared project conventions automatically after bootstrap. Do not reimplement merge logic in normal consumer repos.",
      "Keep canonical Salt guidance visible when a project convention changes the final answer.",
      "Record only durable repo rules backed by code or docs evidence.",
    ],
  };
}

export interface ConventionsPackSource {
  requested: boolean;
  packageSource: string | null;
  packageSpecifier: string | null;
  exportName: string | null;
}

export function parseConventionsPackSource(
  createStack: boolean | undefined,
  rawValue: string | undefined,
): ConventionsPackSource {
  if (!createStack && !rawValue) {
    return {
      requested: false,
      packageSource: null,
      packageSpecifier: null,
      exportName: null,
    };
  }

  if (rawValue === "true") {
    return {
      requested: true,
      packageSource: null,
      packageSpecifier: null,
      exportName: null,
    };
  }

  if (!rawValue || rawValue.trim().length === 0) {
    return {
      requested: true,
      packageSource: null,
      packageSpecifier: null,
      exportName: null,
    };
  }

  const [packageSpecifier, ...rest] = rawValue.split("#");
  const exportName = rest.join("#").trim();
  return {
    requested: true,
    packageSource: rawValue.trim(),
    packageSpecifier: packageSpecifier.trim() || null,
    exportName: exportName.length > 0 ? exportName : null,
  };
}

export function buildStackTemplate(input: {
  projectName: string;
  packageSpecifier: string | null;
  exportName: string | null;
}): Record<string, unknown> {
  const layers: Array<Record<string, unknown>> = [];

  if (input.packageSpecifier) {
    layers.push({
      id: "org-defaults",
      scope: "line_of_business",
      source: {
        type: "package",
        specifier: input.packageSpecifier,
        ...(input.exportName ? { export: input.exportName } : {}),
      },
    });
  }

  layers.push({
    id: "team-checkout",
    scope: "team",
    source: {
      type: "file",
      path: "./team.json",
    },
  });

  return {
    contract: "project_conventions_stack_v1",
    project: input.projectName,
    layers,
    notes: input.packageSpecifier
      ? [
          "Conventions-pack bootstrap: keep the shared package-backed layer first and the repo-local team layer last.",
          "Repo-aware Salt workflows apply the declared layer order automatically after bootstrap.",
          "Each referenced layer still uses project_conventions_v1.",
        ]
      : [
          "Conventions-pack bootstrap: add a shared package-backed layer above the repo-local team layer when the upstream pack is known.",
          "Repo-aware Salt workflows apply the declared layer order automatically after bootstrap.",
          "Each referenced layer still uses project_conventions_v1.",
        ],
  };
}
