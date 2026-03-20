import * as t from "@babel/types";
import {
  analyzeSaltCode as analyzeParsedSaltCode,
  parseSaltCode,
  traverseAst,
} from "../codeAnalysisCommon.js";
import { normalizeQuery } from "../utils.js";
import {
  ARCHETYPE_PRIORITY,
  UI_ARCHETYPES,
  getArchetype,
} from "./sourceUiArchetypes.js";
import type {
  DetectionBundle,
  DetectionSignal,
  RegionSignal,
  SourceAnalysis,
  SourceUiKind,
  SourceUiOutlineInput,
  SourceUiRegionKind,
  SourceUiStateKind,
  StateSignal,
} from "./sourceUiTypes.js";

const REGION_PATTERNS: Array<{
  kind: SourceUiRegionKind;
  label: string;
  query_patterns: RegExp[];
  jsx_name_patterns: RegExp[];
}> = [
  {
    kind: "header",
    label: "Header region",
    query_patterns: [/\b(header|top bar|app header|masthead)\b/i],
    jsx_name_patterns: [/^header$/i, /header/i, /appbar/i, /topbar/i, /masthead/i],
  },
  {
    kind: "sidebar",
    label: "Sidebar region",
    query_patterns: [/\b(sidebar|side nav|sidenav|navigation rail|left nav)\b/i],
    jsx_name_patterns: [/sidebar/i, /sidenav/i, /navrail/i, /^aside$/i],
  },
  {
    kind: "content",
    label: "Main content region",
    query_patterns: [/\b(main content|content area|main panel|body area)\b/i],
    jsx_name_patterns: [/^main$/i, /content/i, /body/i, /panel/i],
  },
  {
    kind: "footer",
    label: "Footer region",
    query_patterns: [/\b(footer|bottom bar|action footer)\b/i],
    jsx_name_patterns: [/^footer$/i, /footer/i, /buttonbar/i, /actionfooter/i],
  },
  {
    kind: "toolbar",
    label: "Toolbar region",
    query_patterns: [/\b(toolbar|command bar|action bar|app bar)\b/i],
    jsx_name_patterns: [/toolbar/i, /commandbar/i, /actionbar/i, /appbar/i],
  },
  {
    kind: "filter-bar",
    label: "Filter bar",
    query_patterns: [/\b(filter bar|filters?|search bar)\b/i],
    jsx_name_patterns: [/filterbar/i, /filters?/i, /searchbar/i],
  },
  {
    kind: "form-section",
    label: "Form section",
    query_patterns: [/\b(form section|fieldset|form area|field group)\b/i],
    jsx_name_patterns: [/^form$/i, /fieldset/i, /formsection/i, /fieldgroup/i],
  },
  {
    kind: "dialog-header",
    label: "Dialog header",
    query_patterns: [/\b(dialog header|modal header|overlay header)\b/i],
    jsx_name_patterns: [/dialogheader/i, /modalheader/i, /drawerheader/i],
  },
  {
    kind: "dialog-body",
    label: "Dialog body",
    query_patterns: [/\b(dialog body|dialog content|modal body)\b/i],
    jsx_name_patterns: [/dialogcontent/i, /dialogbody/i, /modalbody/i, /drawerbody/i],
  },
  {
    kind: "dialog-footer",
    label: "Dialog footer",
    query_patterns: [/\b(dialog footer|dialog actions|modal footer)\b/i],
    jsx_name_patterns: [/dialogactions/i, /dialogfooter/i, /modalfooter/i, /drawerfooter/i],
  },
];

const STATE_PATTERNS: Array<{
  kind: SourceUiStateKind;
  label: string;
  query_patterns: RegExp[];
  jsx_name_patterns: RegExp[];
  attribute_patterns: RegExp[];
}> = [
  {
    kind: "loading",
    label: "Loading state",
    query_patterns: [/\b(loading|spinner|progress|skeleton|pending)\b/i],
    jsx_name_patterns: [/spinner/i, /progress/i, /loading/i, /skeleton/i],
    attribute_patterns: [/loading/i, /isloading/i, /pending/i, /ariabusy/i],
  },
  {
    kind: "empty",
    label: "Empty state",
    query_patterns: [/\b(empty state|no results|empty list|no data)\b/i],
    jsx_name_patterns: [/empty/i, /emptystate/i, /noresults/i, /nodata/i],
    attribute_patterns: [/empty/i, /noresults/i],
  },
  {
    kind: "error",
    label: "Error state",
    query_patterns: [/\b(error state|error|failure|alert)\b/i],
    jsx_name_patterns: [/error/i, /alert/i, /failure/i],
    attribute_patterns: [/error/i, /haserror/i],
  },
  {
    kind: "validation",
    label: "Validation state",
    query_patterns: [/\b(validation|helper text|field error|warning state)\b/i],
    jsx_name_patterns: [/validation/i, /helper/i, /fieldmessage/i],
    attribute_patterns: [/validation/i, /validationstatus/i, /helpertext/i, /warning/i],
  },
];

function getJsxTagName(
  name: t.JSXIdentifier | t.JSXMemberExpression | t.JSXNamespacedName,
): string | null {
  if (t.isJSXIdentifier(name)) {
    return name.name;
  }
  if (t.isJSXMemberExpression(name) && t.isJSXIdentifier(name.property)) {
    return name.property.name;
  }
  return null;
}

function getJsxAttributeNames(
  attributes: t.JSXOpeningElement["attributes"],
): Set<string> {
  return new Set(
    attributes
      .filter((attribute): attribute is t.JSXAttribute => t.isJSXAttribute(attribute))
      .map((attribute) =>
        t.isJSXIdentifier(attribute.name) ? attribute.name.name.toLowerCase() : null,
      )
      .filter((value): value is string => Boolean(value)),
  );
}

function addDetectionSignal(
  detections: Map<SourceUiKind, DetectionSignal>,
  kind: SourceUiKind,
  evidence: string,
  matchedSource: string | null,
  source: "code" | "query",
): void {
  const current =
    detections.get(kind) ??
    {
      kind,
      evidence: new Set<string>(),
      matched_sources: new Set<string>(),
      from_code: false,
      from_query: false,
    };

  current.evidence.add(evidence);
  if (matchedSource) {
    current.matched_sources.add(matchedSource);
  }
  if (source === "code") {
    current.from_code = true;
  } else {
    current.from_query = true;
  }

  detections.set(kind, current);
}

function addRegionSignal(
  signals: Map<SourceUiRegionKind, RegionSignal>,
  kind: SourceUiRegionKind,
  evidence: string,
  matchedSource: string | null,
  source: "code" | "query",
): void {
  const current =
    signals.get(kind) ??
    {
      kind,
      evidence: new Set<string>(),
      matched_sources: new Set<string>(),
      from_code: false,
      from_query: false,
    };

  current.evidence.add(evidence);
  if (matchedSource) {
    current.matched_sources.add(matchedSource);
  }
  if (source === "code") {
    current.from_code = true;
  } else {
    current.from_query = true;
  }

  signals.set(kind, current);
}

function addStateSignal(
  signals: Map<SourceUiStateKind, StateSignal>,
  kind: SourceUiStateKind,
  evidence: string,
  matchedSource: string | null,
  source: "code" | "query",
): void {
  const current =
    signals.get(kind) ??
    {
      kind,
      evidence: new Set<string>(),
      matched_sources: new Set<string>(),
      from_code: false,
      from_query: false,
    };

  current.evidence.add(evidence);
  if (matchedSource) {
    current.matched_sources.add(matchedSource);
  }
  if (source === "code") {
    current.from_code = true;
  } else {
    current.from_query = true;
  }

  signals.set(kind, current);
}

function collectSourceLibraries(ast: t.File): string[] {
  const detected = new Set<string>();

  traverseAst(ast, {
    ImportDeclaration(path) {
      const source = path.node.source.value;
      if (
        typeof source === "string" &&
        !source.startsWith("@salt-ds/") &&
        !source.startsWith(".") &&
        !source.startsWith("/")
      ) {
        detected.add(source);
      }
    },
  });

  return [...detected];
}

function detectPageRegionsFromCode(
  tagName: string,
  attributeNames: Set<string>,
  regionSignals: Map<SourceUiRegionKind, RegionSignal>,
): void {
  const lowerTagName = tagName.toLowerCase();

  for (const region of REGION_PATTERNS) {
    const matched = region.jsx_name_patterns.some((pattern) =>
      pattern.test(lowerTagName),
    );
    if (!matched) {
      continue;
    }

    addRegionSignal(
      regionSignals,
      region.kind,
      `Detected ${tagName} as a ${region.label.toLowerCase()}.`,
      tagName,
      "code",
    );
  }

  if (attributeNames.has("onsubmit")) {
    addRegionSignal(
      regionSignals,
      "form-section",
      `Detected ${tagName} with submit handling.`,
      tagName,
      "code",
    );
  }
}

function detectStatesFromCode(
  tagName: string,
  attributeNames: Set<string>,
  stateSignals: Map<SourceUiStateKind, StateSignal>,
): void {
  const lowerTagName = tagName.toLowerCase();

  for (const state of STATE_PATTERNS) {
    if (
      state.jsx_name_patterns.some((pattern) => pattern.test(lowerTagName)) ||
      [...attributeNames].some((attribute) =>
        state.attribute_patterns.some((pattern) => pattern.test(attribute)),
      )
    ) {
      addStateSignal(
        stateSignals,
        state.kind,
        `Detected ${tagName} as a ${state.label.toLowerCase()}.`,
        tagName,
        "code",
      );
    }
  }
}

export function detectFromCode(code: string): SourceAnalysis {
  const ast = parseSaltCode(code);
  const parsedSalt = analyzeParsedSaltCode(code);
  const detections = new Map<SourceUiKind, DetectionSignal>();
  const regionSignals = new Map<SourceUiRegionKind, RegionSignal>();
  const stateSignals = new Map<SourceUiStateKind, StateSignal>();
  let hasMenuLike = false;
  let hasActionLike = false;

  traverseAst(ast, {
    JSXOpeningElement(path) {
      const tagName = getJsxTagName(path.node.name);
      if (!tagName) {
        return;
      }

      const lowerTagName = tagName.toLowerCase();
      const attributeNames = getJsxAttributeNames(path.node.attributes);

      for (const archetype of UI_ARCHETYPES) {
        if (
          archetype.jsx_name_patterns?.some((pattern) =>
            pattern.test(lowerTagName),
          )
        ) {
          addDetectionSignal(
            detections,
            archetype.kind,
            `Detected ${tagName} in JSX.`,
            tagName,
            "code",
          );
        }
      }

      if (attributeNames.has("href") || attributeNames.has("to")) {
        addDetectionSignal(
          detections,
          "navigation",
          `Detected ${tagName} with a navigation target prop.`,
          tagName,
          "code",
        );
      }

      if (
        attributeNames.has("onclick") &&
        !attributeNames.has("href") &&
        !attributeNames.has("to")
      ) {
        addDetectionSignal(
          detections,
          "action",
          `Detected ${tagName} with an in-place click handler.`,
          tagName,
          "code",
        );
      }

      detectPageRegionsFromCode(tagName, attributeNames, regionSignals);
      detectStatesFromCode(tagName, attributeNames, stateSignals);

      if (/(menu|dropdown|popover)/i.test(lowerTagName)) {
        hasMenuLike = true;
      }
      if (
        /button/i.test(lowerTagName) ||
        attributeNames.has("onclick") ||
        attributeNames.has("onpress")
      ) {
        hasActionLike = true;
      }
    },
  });

  if (hasActionLike && hasMenuLike) {
    addDetectionSignal(
      detections,
      "split-action",
      "Detected action and menu-like elements together in the same source.",
      null,
      "code",
    );
  }

  return {
    detected_libraries: collectSourceLibraries(ast),
    contains_salt: parsedSalt.saltImports.length > 0,
    detections,
    region_signals: regionSignals,
    state_signals: stateSignals,
  };
}

export function detectFromQuery(query: string): DetectionBundle {
  const normalized = normalizeQuery(query);
  const detections = new Map<SourceUiKind, DetectionSignal>();
  const regionSignals = new Map<SourceUiRegionKind, RegionSignal>();
  const stateSignals = new Map<SourceUiStateKind, StateSignal>();

  for (const archetype of UI_ARCHETYPES) {
    for (const pattern of archetype.query_patterns ?? []) {
      if (!pattern.test(normalized)) {
        continue;
      }

      addDetectionSignal(
        detections,
        archetype.kind,
        `The request language matches ${archetype.label.toLowerCase()}.`,
        null,
        "query",
      );
      break;
    }
  }

  for (const region of REGION_PATTERNS) {
    for (const pattern of region.query_patterns) {
      if (!pattern.test(normalized)) {
        continue;
      }

      addRegionSignal(
        regionSignals,
        region.kind,
        `The request language matches ${region.label.toLowerCase()}.`,
        null,
        "query",
      );
      break;
    }
  }

  for (const state of STATE_PATTERNS) {
    for (const pattern of state.query_patterns) {
      if (!pattern.test(normalized)) {
        continue;
      }

      addStateSignal(
        stateSignals,
        state.kind,
        `The request language matches ${state.label.toLowerCase()}.`,
        null,
        "query",
      );
      break;
    }
  }

  if (
    /\b(primary action|main action)\b/i.test(normalized) &&
    /\b(menu|dropdown|secondary actions|more actions)\b/i.test(normalized)
  ) {
    addDetectionSignal(
      detections,
      "split-action",
      "The request describes a primary action with a related menu or fallback actions.",
      null,
      "query",
    );
  }

  return {
    detections,
    region_signals: regionSignals,
    state_signals: stateSignals,
  };
}

export function detectFromOutline(
  outline: SourceUiOutlineInput,
): DetectionBundle {
  const detections = new Map<SourceUiKind, DetectionSignal>();
  const regionSignals = new Map<SourceUiRegionKind, RegionSignal>();
  const stateSignals = new Map<SourceUiStateKind, StateSignal>();

  for (const regionValue of outline.regions ?? []) {
    const normalized = normalizeQuery(regionValue);
    for (const region of REGION_PATTERNS) {
      if (!region.query_patterns.some((pattern) => pattern.test(normalized))) {
        continue;
      }

      addRegionSignal(
        regionSignals,
        region.kind,
        `The structured outline includes ${region.label.toLowerCase()}.`,
        regionValue,
        "query",
      );
      break;
    }
  }

  for (const actionValue of outline.actions ?? []) {
    const normalized = normalizeQuery(actionValue);
    for (const archetype of UI_ARCHETYPES) {
      if (!archetype.query_patterns?.some((pattern) => pattern.test(normalized))) {
        continue;
      }

      addDetectionSignal(
        detections,
        archetype.kind,
        `The structured outline includes ${archetype.label.toLowerCase()}.`,
        actionValue,
        "query",
      );
      break;
    }
  }

  for (const stateValue of outline.states ?? []) {
    const normalized = normalizeQuery(stateValue);
    for (const state of STATE_PATTERNS) {
      if (!state.query_patterns.some((pattern) => pattern.test(normalized))) {
        continue;
      }

      addStateSignal(
        stateSignals,
        state.kind,
        `The structured outline includes ${state.label.toLowerCase()}.`,
        stateValue,
        "query",
      );
      break;
    }
  }

  for (const note of outline.notes ?? []) {
    const noteDetections = detectFromQuery(note);
    const merged = mergeDetectionBundle(
      {
        detected_libraries: [],
        contains_salt: false,
        detections,
        region_signals: regionSignals,
        state_signals: stateSignals,
      },
      noteDetections,
    );
    merged.detections.forEach((value, key) => detections.set(key, value));
    merged.region_signals.forEach((value, key) => regionSignals.set(key, value));
    merged.state_signals.forEach((value, key) => stateSignals.set(key, value));
  }

  return {
    detections,
    region_signals: regionSignals,
    state_signals: stateSignals,
  };
}

function mergeSignalMap<K extends string, T extends {
  kind: K;
  evidence: Set<string>;
  matched_sources: Set<string>;
  from_code: boolean;
  from_query: boolean;
}>(
  sources: Array<Map<K, T>>,
): Map<K, T> {
  const merged = new Map<K, T>();

  for (const source of sources) {
    for (const [kind, signal] of source.entries()) {
      const current = merged.get(kind);
      if (current) {
        signal.evidence.forEach((evidence) => current.evidence.add(evidence));
        signal.matched_sources.forEach((value) =>
          current.matched_sources.add(value),
        );
        current.from_code = current.from_code || signal.from_code;
        current.from_query = current.from_query || signal.from_query;
        continue;
      }

      merged.set(kind, {
        kind: signal.kind,
        evidence: new Set(signal.evidence),
        matched_sources: new Set(signal.matched_sources),
        from_code: signal.from_code,
        from_query: signal.from_query,
      } as T);
    }
  }

  return merged;
}

export function mergeDetectionBundle(
  codeAnalysis: SourceAnalysis,
  queryDetections: DetectionBundle,
): DetectionBundle {
  const detections = mergeSignalMap<SourceUiKind, DetectionSignal>([
    codeAnalysis.detections,
    queryDetections.detections,
  ]);

  if (detections.has("split-action")) {
    detections.delete("action");
  }
  if (detections.has("vertical-navigation")) {
    detections.delete("navigation");
  }

  const sortedDetections = new Map<SourceUiKind, DetectionSignal>();
  [...detections.values()]
    .sort((left, right) => {
      const priorityDelta =
        ARCHETYPE_PRIORITY.indexOf(left.kind) - ARCHETYPE_PRIORITY.indexOf(right.kind);
      if (priorityDelta !== 0) {
        return priorityDelta;
      }
      return right.evidence.size - left.evidence.size;
    })
    .forEach((signal) => sortedDetections.set(signal.kind, signal));

  return {
    detections: sortedDetections,
    region_signals: mergeSignalMap<SourceUiRegionKind, RegionSignal>([
      codeAnalysis.region_signals,
      queryDetections.region_signals,
    ]),
    state_signals: mergeSignalMap<SourceUiStateKind, StateSignal>([
      codeAnalysis.state_signals,
      queryDetections.state_signals,
    ]),
  };
}

export function createEmptySourceAnalysis(): SourceAnalysis {
  return {
    detected_libraries: [],
    contains_salt: false,
    detections: new Map<SourceUiKind, DetectionSignal>(),
    region_signals: new Map<SourceUiRegionKind, RegionSignal>(),
    state_signals: new Map<SourceUiStateKind, StateSignal>(),
  };
}
