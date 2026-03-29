import type {
  SourceUiGrouping,
  SourceUiModel,
  SourceUiNode,
  SourceUiRegion,
} from "./sourceUiTypes.js";

function uniqueStrings(values: Array<string | null | undefined>): string[] {
  return [
    ...new Set(values.filter((value): value is string => Boolean(value))),
  ];
}

export function getRelatedPageRegionRefs(
  source: SourceUiNode,
  sourceModel: SourceUiModel,
): string[] {
  switch (source.kind) {
    case "vertical-navigation":
      return sourceModel.page_regions
        .filter(
          (region) => region.kind === "sidebar" || region.kind === "header",
        )
        .map((region) => region.id);
    case "dialog":
      return sourceModel.page_regions
        .filter((region) => region.kind.startsWith("dialog-"))
        .map((region) => region.id);
    case "toolbar":
      return sourceModel.page_regions
        .filter(
          (region) => region.kind === "toolbar" || region.kind === "filter-bar",
        )
        .map((region) => region.id);
    case "text-input":
    case "selection-control":
      return sourceModel.page_regions
        .filter((region) => region.kind === "form-section")
        .map((region) => region.id);
    case "data-table":
      return sourceModel.page_regions
        .filter(
          (region) =>
            region.kind === "content" ||
            region.kind === "toolbar" ||
            region.kind === "filter-bar",
        )
        .map((region) => region.id);
    case "navigation":
      return sourceModel.page_regions
        .filter(
          (region) =>
            region.kind === "header" ||
            region.kind === "sidebar" ||
            region.kind === "content",
        )
        .map((region) => region.id);
    case "split-action":
    case "action":
      return sourceModel.page_regions
        .filter(
          (region) =>
            region.kind === "toolbar" ||
            region.kind === "footer" ||
            region.kind === "form-section" ||
            region.kind === "dialog-footer",
        )
        .map((region) => region.id);
    case "tabs":
      return sourceModel.page_regions
        .filter((region) => region.kind === "content")
        .map((region) => region.id);
  }
}

export function getRelatedGroupingRefs(
  source: SourceUiNode,
  sourceModel: SourceUiModel,
): string[] {
  const relatedPageRegionRefs = getRelatedPageRegionRefs(source, sourceModel);

  return sourceModel.groupings
    .filter(
      (grouping) =>
        grouping.ui_region_refs.includes(source.id) ||
        relatedPageRegionRefs.some((regionId) =>
          grouping.region_refs.includes(regionId),
        ),
    )
    .map((grouping) => grouping.id);
}

export function getRelatedPageRegions(
  sourceModel: SourceUiModel,
  pageRegionRefs: string[],
): SourceUiRegion[] {
  return sourceModel.page_regions.filter((region) =>
    pageRegionRefs.includes(region.id),
  );
}

export function getRelatedGroupings(
  sourceModel: SourceUiModel,
  groupingRefs: string[],
): SourceUiGrouping[] {
  return sourceModel.groupings.filter((grouping) =>
    groupingRefs.includes(grouping.id),
  );
}

export function getRelatedGroupingMembers(
  source: SourceUiNode,
  sourceModel: SourceUiModel,
  groupingRefs: string[],
): SourceUiNode[] {
  return sourceModel.ui_regions.filter(
    (candidate) =>
      candidate.id !== source.id &&
      sourceModel.groupings.some(
        (grouping) =>
          groupingRefs.includes(grouping.id) &&
          grouping.ui_region_refs.includes(candidate.id),
      ),
  );
}

export function buildContextualSourceNode(
  source: SourceUiNode,
  relatedGroupings: SourceUiGrouping[],
): SourceUiNode {
  const groupingKinds = new Set(
    relatedGroupings.map((grouping) => grouping.kind),
  );
  const insideFlowGrouping =
    groupingKinds.has("dialog-flow") ||
    groupingKinds.has("form-flow") ||
    groupingKinds.has("data-surface");
  const insideAppShell = groupingKinds.has("app-shell");

  if (insideFlowGrouping) {
    return {
      ...source,
      scope: "flow",
      complexity: "multi-part",
      notes: uniqueStrings([
        ...source.notes,
        "Treat this control as part of a grouped flow instead of an isolated primitive.",
      ]),
    };
  }

  if (
    insideAppShell &&
    (source.role === "navigation" || source.kind === "vertical-navigation")
  ) {
    return {
      ...source,
      scope: "app-structure",
      complexity: "multi-part",
      notes: uniqueStrings([
        ...source.notes,
        "Treat this control as part of a persistent app-shell structure.",
      ]),
    };
  }

  if (insideAppShell) {
    return {
      ...source,
      complexity: "multi-part",
      notes: uniqueStrings([
        ...source.notes,
        "Keep the surrounding app shell in view while translating this local part.",
      ]),
    };
  }

  return source;
}

export function buildContextualHints(input: {
  relatedPageRegions: SourceUiRegion[];
  relatedGroupings: SourceUiGrouping[];
  relatedUiMembers: SourceUiNode[];
}): string[] {
  return uniqueStrings([
    ...input.relatedPageRegions.flatMap((region) => [
      region.kind,
      region.label,
      ...region.evidence,
      ...region.matched_sources,
    ]),
    ...input.relatedGroupings.flatMap((grouping) => [
      grouping.kind,
      grouping.label,
      grouping.reason,
    ]),
    ...input.relatedUiMembers.flatMap((member) => [
      member.kind,
      member.label,
      ...member.evidence,
      ...member.matched_sources,
      ...member.notes,
    ]),
  ]);
}

export function buildContextualQueryHints(input: {
  source: SourceUiNode;
  relatedPageRegions: SourceUiRegion[];
  relatedGroupings: SourceUiGrouping[];
  relatedUiMembers: SourceUiNode[];
}): string[] {
  const groupingKinds = new Set(
    input.relatedGroupings.map((grouping) => grouping.kind),
  );
  const regionKinds = new Set(
    input.relatedPageRegions.map((region) => region.kind),
  );
  const relatedKinds = new Set(
    input.relatedUiMembers.map((member) => member.kind),
  );
  const relatedText = input.relatedUiMembers
    .flatMap((member) => [
      ...member.evidence,
      ...member.matched_sources,
      ...member.notes,
    ])
    .join(" ")
    .toLowerCase();
  const hints: string[] = [];

  if (
    groupingKinds.has("app-shell") &&
    (input.source.kind === "navigation" ||
      input.source.kind === "vertical-navigation")
  ) {
    hints.push(
      "app shell",
      "structured navigation",
      "persistent navigation",
      "sidebar navigation",
      "main content",
    );
  }

  if (
    groupingKinds.has("data-surface") &&
    (input.source.kind === "data-table" ||
      input.source.kind === "toolbar" ||
      input.source.kind === "text-input" ||
      input.source.kind === "selection-control")
  ) {
    hints.push(
      "data surface",
      "dense data display",
      "rows and columns",
      "toolbar and results",
      "filtering controls",
    );

    if (
      regionKinds.has("filter-bar") &&
      (relatedKinds.has("text-input") || relatedKinds.has("selection-control"))
    ) {
      hints.push("list filtering", "filter results", "refine a list");
    }
  }

  if (
    groupingKinds.has("form-flow") &&
    (input.source.kind === "text-input" ||
      input.source.kind === "selection-control" ||
      input.source.kind === "action" ||
      input.source.kind === "split-action")
  ) {
    hints.push("form flow", "grouped fields");
    if (regionKinds.has("footer")) {
      hints.push("task-end actions", "form completion actions");
    }
    if (/\b(previous|next|step|wizard|multi-step)\b/.test(relatedText)) {
      hints.push("wizard", "multi-step form", "stepper");
    }
  }

  if (groupingKinds.has("dialog-flow")) {
    if (
      input.source.kind === "action" ||
      input.source.kind === "split-action"
    ) {
      hints.push("dialog actions", "contained interaction flow");
    }

    if (
      input.source.kind === "dialog" &&
      (relatedKinds.has("navigation") ||
        relatedKinds.has("vertical-navigation"))
    ) {
      hints.push(
        "preferences dialog",
        "settings panels",
        "dialog navigation and content",
      );
    }
  }

  if (regionKinds.has("filter-bar")) {
    hints.push("filter bar");
  }

  return uniqueStrings(hints);
}
