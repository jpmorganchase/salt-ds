import { unique } from "../utils.js";
import { getArchetype } from "./sourceUiArchetypes.js";
import type {
  DetectionBundle,
  RegionSignal,
  SourceUiComplexity,
  SourceUiFlavor,
  SourceUiGrouping,
  SourceUiKind,
  SourceUiModel,
  SourceUiNode,
  SourceUiRegion,
  SourceUiRegionKind,
  SourceUiRole,
  SourceUiScope,
  SourceUiSignalOrigin,
  SourceUiState,
  StateSignal,
  TranslationMode,
} from "./sourceUiTypes.js";

function getSourceRole(kind: SourceUiKind): SourceUiRole {
  switch (kind) {
    case "action":
    case "split-action":
      return "action";
    case "vertical-navigation":
    case "navigation":
    case "tabs":
      return "navigation";
    case "toolbar":
      return "commanding";
    case "dialog":
      return "overlay";
    case "text-input":
      return "data-entry";
    case "selection-control":
      return "selection";
    case "data-table":
      return "data-display";
  }
}

function getSourceScope(kind: SourceUiKind): SourceUiScope {
  switch (kind) {
    case "vertical-navigation":
      return "app-structure";
    case "split-action":
    case "dialog":
    case "tabs":
    case "data-table":
    case "toolbar":
      return "flow";
    case "text-input":
    case "selection-control":
    case "navigation":
    case "action":
      return "control";
  }
}

function getSourceComplexity(kind: SourceUiKind): SourceUiComplexity {
  switch (kind) {
    case "split-action":
    case "vertical-navigation":
    case "dialog":
    case "tabs":
    case "data-table":
    case "toolbar":
      return "multi-part";
    case "text-input":
    case "selection-control":
    case "navigation":
    case "action":
      return "single-part";
  }
}

function getTranslationMode(input: {
  codeProvided: boolean;
  queryProvided: boolean;
  uiFlavor: SourceUiFlavor;
}): TranslationMode {
  if (!input.codeProvided && input.queryProvided) {
    return "map-from-description";
  }
  if (input.uiFlavor === "salt") {
    return "validate-existing-salt";
  }
  if (input.uiFlavor === "mixed") {
    return "refine-mixed-code";
  }
  return "scaffold-from-code";
}

function summarizeDominant<T extends string>(
  values: T[],
): T | "mixed" | "unknown" {
  if (values.length === 0) {
    return "unknown";
  }

  const counts = new Map<T, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  const ranked = [...counts.entries()].sort(
    (left, right) => right[1] - left[1],
  );
  if (ranked.length > 1 && ranked[0][1] === ranked[1][1]) {
    return "mixed";
  }

  return ranked[0][0];
}

function toOrigins(signal: {
  from_code: boolean;
  from_query: boolean;
}): SourceUiSignalOrigin[] {
  return [
    ...(signal.from_code ? (["code"] as const) : []),
    ...(signal.from_query ? (["query"] as const) : []),
  ];
}

function getRegionLabel(kind: SourceUiRegionKind): string {
  switch (kind) {
    case "header":
      return "Header region";
    case "sidebar":
      return "Sidebar region";
    case "content":
      return "Main content region";
    case "footer":
      return "Footer region";
    case "toolbar":
      return "Toolbar region";
    case "filter-bar":
      return "Filter bar";
    case "form-section":
      return "Form section";
    case "dialog-header":
      return "Dialog header";
    case "dialog-body":
      return "Dialog body";
    case "dialog-footer":
      return "Dialog footer";
  }
}

function getStateLabel(kind: SourceUiState["kind"]): string {
  switch (kind) {
    case "loading":
      return "Loading state";
    case "empty":
      return "Empty state";
    case "error":
      return "Error state";
    case "validation":
      return "Validation state";
  }
}

function buildUiRegions(
  detections: DetectionBundle["detections"],
): SourceUiNode[] {
  return [...detections.values()].map((detection, index) => {
    const archetype = getArchetype(detection.kind);
    return {
      id: `source-ui-${index + 1}`,
      kind: detection.kind,
      label: archetype.label,
      role: getSourceRole(detection.kind),
      scope: getSourceScope(detection.kind),
      complexity: getSourceComplexity(detection.kind),
      likely_solution_type: archetype.solution_type,
      evidence: [...detection.evidence],
      matched_sources: [...detection.matched_sources],
      detected_from: toOrigins(detection),
      notes: archetype.notes ?? [],
    };
  });
}

function buildPageRegions(
  regionSignals: Map<SourceUiRegionKind, RegionSignal>,
): SourceUiRegion[] {
  return [...regionSignals.values()].map((signal, index) => ({
    id: `page-region-${index + 1}`,
    kind: signal.kind,
    label: getRegionLabel(signal.kind),
    evidence: [...signal.evidence],
    matched_sources: [...signal.matched_sources],
    detected_from: toOrigins(signal),
  }));
}

function buildStates(
  stateSignals: Map<SourceUiState["kind"], StateSignal>,
): SourceUiState[] {
  return [...stateSignals.values()].map((signal, index) => ({
    id: `state-signal-${index + 1}`,
    kind: signal.kind,
    label: getStateLabel(signal.kind),
    evidence: [...signal.evidence],
    matched_sources: [...signal.matched_sources],
    detected_from: toOrigins(signal),
  }));
}

function pushGrouping(
  groupings: SourceUiGrouping[],
  input: Omit<SourceUiGrouping, "id">,
): void {
  groupings.push({
    id: `source-grouping-${groupings.length + 1}`,
    ...input,
  });
}

function buildGroupings(
  uiRegions: SourceUiNode[],
  pageRegions: SourceUiRegion[],
): SourceUiGrouping[] {
  const groupings: SourceUiGrouping[] = [];
  const regionIdsByKind = new Map(
    pageRegions.map((region) => [region.kind, region.id]),
  );
  const uiIdsByKind = new Map(
    uiRegions.map((region) => [region.kind, region.id]),
  );

  if (regionIdsByKind.has("sidebar") && regionIdsByKind.has("content")) {
    pushGrouping(groupings, {
      kind: "app-shell",
      label: "App shell",
      region_refs: [
        regionIdsByKind.get("sidebar") as string,
        ...(regionIdsByKind.has("header")
          ? [regionIdsByKind.get("header") as string]
          : []),
        regionIdsByKind.get("content") as string,
      ],
      ui_region_refs: [
        ...(uiIdsByKind.has("vertical-navigation")
          ? [uiIdsByKind.get("vertical-navigation") as string]
          : []),
        ...(uiIdsByKind.has("navigation")
          ? [uiIdsByKind.get("navigation") as string]
          : []),
      ],
      reason:
        "The source includes persistent navigation and a main content area, which suggests an app-shell level translation.",
    });
  }

  if (
    uiIdsByKind.has("dialog") ||
    regionIdsByKind.has("dialog-header") ||
    regionIdsByKind.has("dialog-body") ||
    regionIdsByKind.has("dialog-footer")
  ) {
    pushGrouping(groupings, {
      kind: "dialog-flow",
      label: "Dialog flow",
      region_refs: [
        ...(regionIdsByKind.has("dialog-header")
          ? [regionIdsByKind.get("dialog-header") as string]
          : []),
        ...(regionIdsByKind.has("dialog-body")
          ? [regionIdsByKind.get("dialog-body") as string]
          : []),
        ...(regionIdsByKind.has("dialog-footer")
          ? [regionIdsByKind.get("dialog-footer") as string]
          : []),
      ],
      ui_region_refs: [
        ...(uiIdsByKind.has("dialog")
          ? [uiIdsByKind.get("dialog") as string]
          : []),
        ...(uiIdsByKind.has("navigation")
          ? [uiIdsByKind.get("navigation") as string]
          : []),
        ...(uiIdsByKind.has("vertical-navigation")
          ? [uiIdsByKind.get("vertical-navigation") as string]
          : []),
        ...(uiIdsByKind.has("text-input")
          ? [uiIdsByKind.get("text-input") as string]
          : []),
        ...(uiIdsByKind.has("selection-control")
          ? [uiIdsByKind.get("selection-control") as string]
          : []),
        ...(uiIdsByKind.has("action")
          ? [uiIdsByKind.get("action") as string]
          : []),
        ...(uiIdsByKind.has("split-action")
          ? [uiIdsByKind.get("split-action") as string]
          : []),
      ],
      reason:
        "The source suggests an overlay with structural regions that should be translated as one dialog flow.",
    });
  }

  if (
    regionIdsByKind.has("form-section") &&
    (uiIdsByKind.has("text-input") || uiIdsByKind.has("selection-control"))
  ) {
    pushGrouping(groupings, {
      kind: "form-flow",
      label: "Form flow",
      region_refs: [
        regionIdsByKind.get("form-section") as string,
        ...(regionIdsByKind.has("footer")
          ? [regionIdsByKind.get("footer") as string]
          : []),
      ],
      ui_region_refs: [
        ...(uiIdsByKind.has("text-input")
          ? [uiIdsByKind.get("text-input") as string]
          : []),
        ...(uiIdsByKind.has("selection-control")
          ? [uiIdsByKind.get("selection-control") as string]
          : []),
        ...(uiIdsByKind.has("action")
          ? [uiIdsByKind.get("action") as string]
          : []),
        ...(uiIdsByKind.has("split-action")
          ? [uiIdsByKind.get("split-action") as string]
          : []),
      ],
      reason:
        "The source includes grouped fields and possible end-of-task actions that should be translated as one form flow rather than isolated primitives.",
    });
  }

  if (
    uiIdsByKind.has("data-table") &&
    (regionIdsByKind.has("toolbar") || regionIdsByKind.has("filter-bar"))
  ) {
    pushGrouping(groupings, {
      kind: "data-surface",
      label: "Data surface",
      region_refs: [
        ...(regionIdsByKind.has("content")
          ? [regionIdsByKind.get("content") as string]
          : []),
        ...(regionIdsByKind.has("toolbar")
          ? [regionIdsByKind.get("toolbar") as string]
          : []),
        ...(regionIdsByKind.has("filter-bar")
          ? [regionIdsByKind.get("filter-bar") as string]
          : []),
      ],
      ui_region_refs: [
        uiIdsByKind.get("data-table") as string,
        ...(uiIdsByKind.has("toolbar")
          ? [uiIdsByKind.get("toolbar") as string]
          : []),
        ...(uiIdsByKind.has("text-input")
          ? [uiIdsByKind.get("text-input") as string]
          : []),
        ...(uiIdsByKind.has("selection-control")
          ? [uiIdsByKind.get("selection-control") as string]
          : []),
      ],
      reason:
        "The source combines dense data display with control regions, which usually needs a coordinated table or data-surface translation.",
    });
  }

  return groupings;
}

export function getSourceFlavor(input: {
  codeProvided: boolean;
  queryProvided: boolean;
  detectedLibraries: string[];
  containsSalt: boolean;
}): SourceUiFlavor {
  if (!input.codeProvided && input.queryProvided) {
    return "description";
  }
  if (input.containsSalt && input.detectedLibraries.length > 0) {
    return "mixed";
  }
  if (input.containsSalt) {
    return "salt";
  }
  if (input.detectedLibraries.length > 0) {
    return "external-ui";
  }
  return "generic-react";
}

export function buildSourceUiModel(
  bundle: DetectionBundle,
  input: {
    codeProvided: boolean;
    queryProvided: boolean;
    uiFlavor: SourceUiFlavor;
  },
): SourceUiModel {
  const uiRegions = buildUiRegions(bundle.detections);
  const pageRegions = buildPageRegions(bundle.region_signals);
  const states = buildStates(bundle.state_signals);
  const groupings = buildGroupings(uiRegions, pageRegions);

  return {
    ui_regions: uiRegions,
    page_regions: pageRegions,
    states,
    groupings,
    summary: {
      dominant_scope: summarizeDominant(
        uiRegions.map((region) => region.scope),
      ),
      dominant_role: summarizeDominant(uiRegions.map((region) => region.role)),
      primitive_candidates: uiRegions.filter(
        (region) => region.scope === "control",
      ).length,
      structured_flows: uiRegions.filter((region) => region.scope !== "control")
        .length,
      page_regions: pageRegions.length,
      state_signals: states.length,
      groupings: groupings.length,
      signal_sources: unique([
        ...uiRegions.flatMap((region) => region.detected_from),
        ...pageRegions.flatMap((region) => region.detected_from),
        ...states.flatMap((state) => state.detected_from),
      ]) as SourceUiSignalOrigin[],
      translation_mode: getTranslationMode(input),
    },
  };
}
