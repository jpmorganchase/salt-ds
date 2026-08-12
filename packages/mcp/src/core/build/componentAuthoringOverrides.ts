export interface ComponentExportAliasOverride {
  exportName: string;
  sourceRepoPath?: string;
}

interface ComponentAuthoringOverride {
  route: string;
  primaryExport?: string | null;
  exportAliases?: readonly ComponentExportAliasOverride[];
}

const componentAuthoringOverrides = [
  { route: "/salt/components/ag-grid-theme", primaryExport: null },
  {
    route: "/salt/components/card",
    exportAliases: [
      {
        exportName: "InteractableCard",
        sourceRepoPath: "packages/core/src/interactable-card",
      },
      {
        exportName: "InteractableCardGroup",
        sourceRepoPath: "packages/core/src/interactable-card",
      },
      {
        exportName: "LinkCard",
        sourceRepoPath: "packages/core/src/link-card",
      },
    ],
  },
  { route: "/salt/components/chart", primaryExport: null },
  { route: "/salt/components/date-input", primaryExport: null },
  {
    route: "/salt/components/date-picker/range-date-picker",
    primaryExport: null,
  },
  {
    route: "/salt/components/layouts/border-layout",
    exportAliases: [
      {
        exportName: "BorderItem",
        sourceRepoPath: "packages/core/src/border-item",
      },
    ],
  },
  {
    route: "/salt/components/layouts/flex-layout",
    exportAliases: [
      {
        exportName: "FlexItem",
        sourceRepoPath: "packages/core/src/flex-item",
      },
    ],
  },
  {
    route: "/salt/components/layouts/grid-layout",
    exportAliases: [
      {
        exportName: "GridItem",
        sourceRepoPath: "packages/core/src/grid-item",
      },
    ],
  },
  {
    route: "/salt/components/list-box",
    exportAliases: [
      {
        exportName: "Option",
        sourceRepoPath: "packages/core/src/option",
      },
      {
        exportName: "OptionGroup",
        sourceRepoPath: "packages/core/src/option",
      },
    ],
  },
  { route: "/salt/components/progress", primaryExport: null },
  { route: "/salt/components/splitter", primaryExport: null },
  {
    route: "/salt/components/text",
    exportAliases: [
      { exportName: "Code" },
      { exportName: "Display1" },
      { exportName: "Display2" },
      { exportName: "Display3" },
      { exportName: "Display4" },
      { exportName: "H1" },
      { exportName: "H2" },
      { exportName: "H3" },
      { exportName: "H4" },
      { exportName: "Label" },
      { exportName: "TextAction" },
      { exportName: "TextNotation" },
    ],
  },
  {
    route: "/salt/components/toggle-button",
    exportAliases: [
      {
        exportName: "ToggleButtonGroup",
        sourceRepoPath: "packages/core/src/toggle-button-group",
      },
    ],
  },
  {
    route: "/salt/components/tokenized-input-next",
    primaryExport: "TokenizedInputNext",
  },
] as const satisfies readonly ComponentAuthoringOverride[];

const overrideByRoute = new Map<string, ComponentAuthoringOverride>();
for (const override of componentAuthoringOverrides) {
  if (overrideByRoute.has(override.route)) {
    throw new Error(
      `Duplicate component authoring override route '${override.route}'.`,
    );
  }
  overrideByRoute.set(override.route, override);
}

export function componentPrimaryExportOverride(
  componentRoute: string,
): { configured: true; value: string | null } | { configured: false } {
  const override = overrideByRoute.get(componentRoute);
  if (!override || !Object.hasOwn(override, "primaryExport")) {
    return { configured: false };
  }
  return {
    configured: true,
    value: override.primaryExport ?? null,
  };
}

export function componentExportAliasOverrides(
  componentRoute: string,
): readonly ComponentExportAliasOverride[] {
  return overrideByRoute.get(componentRoute)?.exportAliases ?? [];
}

export function assertComponentAuthoringOverridesResolved(
  componentRoutes: Iterable<string>,
): void {
  const resolvedRoutes = new Set(componentRoutes);
  const staleRoutes = [...overrideByRoute.keys()].filter(
    (route) => !resolvedRoutes.has(route),
  );
  if (staleRoutes.length > 0) {
    throw new Error(
      `Component authoring overrides do not match authored component routes: ${staleRoutes.join(", ")}.`,
    );
  }
}
