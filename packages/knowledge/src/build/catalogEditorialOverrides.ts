export interface PatternEditorialOverride {
  aliases?: readonly string[];
  componentRoles?: Readonly<Record<string, string>>;
}

const guideRoutes = [
  "/salt/getting-started/choosing-the-right-primitive",
  "/salt/getting-started/composition-pitfalls",
  "/salt/getting-started/custom-wrappers",
  "/salt/getting-started/developing",
] as const;

const patternOverrides = [
  {
    route: "/salt/patterns/content-status",
    value: {
      componentRoles: {
        "Stack layout":
          "Arranges the visual indicator, title, supporting message, and optional action in one vertically centered content-status group.",
      },
    },
  },
  {
    route: "/salt/patterns/metric",
    value: {
      aliases: ["large metric", "kpi", "key metric", "dashboard metric"],
    },
  },
  {
    route: "/salt/patterns/vertical-navigation",
    value: {
      aliases: [
        "sidebar navigation",
        "navigation pane",
        "left-hand navigation",
        "nested navigation",
      ],
    },
  },
] as const satisfies readonly {
  route: string;
  value: PatternEditorialOverride;
}[];

const selectedGuideRoutes = new Set<string>();
for (const route of guideRoutes) {
  if (selectedGuideRoutes.has(route)) {
    throw new Error(`Duplicate MCP guide override route '${route}'.`);
  }
  selectedGuideRoutes.add(route);
}

const patternOverrideByRoute = new Map<string, PatternEditorialOverride>();
for (const override of patternOverrides) {
  if (patternOverrideByRoute.has(override.route)) {
    throw new Error(
      `Duplicate MCP pattern override route '${override.route}'.`,
    );
  }
  patternOverrideByRoute.set(override.route, override.value);
}

export function isSelectedMcpGuideRoute(route: string): boolean {
  return selectedGuideRoutes.has(route);
}

export function patternEditorialOverride(
  route: string,
): PatternEditorialOverride | null {
  return patternOverrideByRoute.get(route) ?? null;
}

function staleRoutes(
  configuredRoutes: Iterable<string>,
  authoredRoutes: Iterable<string>,
): string[] {
  const authored = new Set(authoredRoutes);
  return [...configuredRoutes].filter((route) => !authored.has(route));
}

export function assertGuideEditorialOverridesResolved(
  authoredRoutes: Iterable<string>,
): void {
  const stale = staleRoutes(selectedGuideRoutes, authoredRoutes);
  if (stale.length > 0) {
    throw new Error(
      `MCP guide overrides do not match authored getting-started routes: ${stale.join(", ")}.`,
    );
  }
}

export function assertPatternEditorialOverridesResolved(
  authoredRoutes: Iterable<string>,
): void {
  const stale = staleRoutes(patternOverrideByRoute.keys(), authoredRoutes);
  if (stale.length > 0) {
    throw new Error(
      `MCP pattern overrides do not match authored pattern routes: ${stale.join(", ")}.`,
    );
  }
}
