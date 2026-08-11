const primaryExportByComponentRoute: Readonly<Record<string, string | null>> =
  Object.freeze({
    "/salt/components/ag-grid-theme": null,
    "/salt/components/chart": null,
    "/salt/components/date-input": null,
    "/salt/components/date-picker/range-date-picker": null,
    "/salt/components/progress": null,
    "/salt/components/splitter": null,
    "/salt/components/tokenized-input-next": "TokenizedInputNext",
  });

export function componentPrimaryExportOverride(
  componentRoute: string,
): { configured: true; value: string | null } | { configured: false } {
  if (!Object.hasOwn(primaryExportByComponentRoute, componentRoute)) {
    return { configured: false };
  }
  return {
    configured: true,
    value: primaryExportByComponentRoute[componentRoute] ?? null,
  };
}

export function assertComponentPrimaryExportOverridesResolved(
  componentRoutes: Iterable<string>,
): void {
  const resolvedRoutes = new Set(componentRoutes);
  const staleRoutes = Object.keys(primaryExportByComponentRoute).filter(
    (route) => !resolvedRoutes.has(route),
  );
  if (staleRoutes.length > 0) {
    throw new Error(
      `Component primary-export overrides do not match authored component routes: ${staleRoutes.join(", ")}.`,
    );
  }
}
