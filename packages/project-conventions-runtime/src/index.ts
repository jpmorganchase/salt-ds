export type GuidanceSource = "canonical_salt";
export type ProjectConventionsContract = "project_conventions_v1";
export type ProjectConventionsStackContract = "project_conventions_stack_v1";
export type ProjectConventionTopic = string;

export type GuidanceBoundary = {
  guidance_source: GuidanceSource;
  scope: "official_salt_only";
  project_conventions: {
    supported: true;
    contract: ProjectConventionsContract;
    check_recommended: boolean;
    topics: ProjectConventionTopic[];
    reason: string;
  };
};

export type ProjectConventionRuleType =
  | "preferred-component"
  | "approved-wrapper"
  | "pattern-preference"
  | "banned-choice";

export type ProjectConventionsLayerScope =
  | "line_of_business"
  | "team"
  | "repo"
  | "other";

export type ProjectConventionsStackLayerSource =
  | {
      type: "file";
      path: string;
    }
  | {
      type: "package";
      specifier: string;
      export?: string;
    };

export type ProjectConventionsStackLayerDefinition = {
  id: string;
  scope: ProjectConventionsLayerScope;
  source: ProjectConventionsStackLayerSource;
  description?: string;
  optional?: boolean;
};

export type ProjectConventionsStack = {
  $schema?: string;
  contract: ProjectConventionsStackContract;
  layers: ProjectConventionsStackLayerDefinition[];
  notes?: string[];
};

export type CanonicalSaltResult = {
  decision: {
    name: string | null;
    why: string;
  };
  guidance_boundary: GuidanceBoundary;
  related_guides?: Array<{ name: string; overview?: string }>;
};

export type PreferredComponentConvention = {
  salt_name: string;
  prefer: string;
  reason: string;
  docs?: string[];
};

export type ProjectConventionImportReference = {
  from: string;
  name: string;
};

export type ApprovedWrapperConvention = {
  name: string;
  wraps: string;
  reason: string;
  import?: ProjectConventionImportReference;
  use_when?: string[];
  avoid_when?: string[];
  migration_shim?: boolean;
  docs?: string[];
};

export type PatternPreferenceConvention = {
  intent: string;
  prefer: string;
  canonical_salt_start?: string;
  reason: string;
  docs?: string[];
};

export type BannedChoiceConvention = {
  name: string;
  reason: string;
  replacement?: string;
  docs?: string[];
};

export type ProjectConventions = {
  $schema?: string;
  contract?: ProjectConventionsContract;
  version?: string;
  project?: string;
  preferred_components?: PreferredComponentConvention[];
  approved_wrappers?: ApprovedWrapperConvention[];
  pattern_preferences?: PatternPreferenceConvention[];
  banned_choices?: BannedChoiceConvention[];
  notes?: string[];
};

export type ProjectConventionsLayerReference = {
  id: string;
  scope: ProjectConventionsLayerScope;
  source?: string | null;
};

export type ProjectConventionsLayer = ProjectConventionsLayerReference & {
  conventions: ProjectConventions | null | undefined;
  description?: string;
};

export type ProjectConventionStackResolver = (
  layer: ProjectConventionsStackLayerDefinition,
) =>
  | ProjectConventions
  | null
  | undefined
  | Promise<ProjectConventions | null | undefined>;

export type AppliedProjectConvention = {
  type: ProjectConventionRuleType;
  name: string | null;
  replacement: string | null;
  wraps?: string | null;
  import?: ProjectConventionImportReference | null;
  use_when?: string[];
  avoid_when?: string[];
  migration_shim?: boolean;
  reason: string;
  docs?: string[];
  precedence: 1 | 2 | 3 | 4;
  layer: ProjectConventionsLayerReference | null;
};

export type ComposedProjectConventionsResult = {
  conventions: ProjectConventions | null;
  layers_consulted: ProjectConventionsLayerReference[];
  rule_sources: Array<{
    rule_type: ProjectConventionRuleType;
    key: string;
    layer: ProjectConventionsLayerReference;
  }>;
};

export type MergedProjectConventionsResult = {
  canonical: {
    source: GuidanceSource;
    recommendation: string | null;
    why: string;
  };
  canonical_choice: {
    source: GuidanceSource;
    name: string | null;
    why: string;
  };
  project_conventions: {
    consulted: boolean;
    check_recommended: boolean;
    topics: ProjectConventionTopic[];
    reason: string;
    layers_consulted: ProjectConventionsLayerReference[];
    effective_conventions: ProjectConventions | null;
    applied: boolean;
    applied_rule: AppliedProjectConvention | null;
  };
  project_convention_applied: AppliedProjectConvention | null;
  project_convention_layer_applied: ProjectConventionsLayerReference | null;
  merge_reason: ProjectConventionRuleType | "canonical-only";
  why_changed: string | null;
  final_choice: {
    name: string | null;
    source: "project_conventions" | GuidanceSource;
    changed: boolean;
    based_on: string | null;
    import: ProjectConventionImportReference | null;
  };
  final_recommendation: string | null;
};

type RuleSourceMap = Map<string, ProjectConventionsLayerReference>;

function uniqueStrings(values: string[] | undefined): string[] | undefined {
  if (!values || values.length === 0) {
    return undefined;
  }

  return [...new Set(values)];
}

export function formatProjectConventionStackLayerSource(
  source: ProjectConventionsStackLayerSource,
): string {
  if (source.type === "file") {
    return source.path;
  }

  return source.export
    ? `${source.specifier}#${source.export}`
    : source.specifier;
}

function toLayerReference(
  layer: ProjectConventionsLayer,
): ProjectConventionsLayerReference {
  return {
    id: layer.id,
    scope: layer.scope,
    source: layer.source ?? null,
  };
}

function stackLayerToLayerReference(
  layer: ProjectConventionsStackLayerDefinition,
): ProjectConventionsLayerReference {
  return {
    id: layer.id,
    scope: layer.scope,
    source: formatProjectConventionStackLayerSource(layer.source),
  };
}

function preferredComponentKey(entry: PreferredComponentConvention): string {
  return entry.salt_name;
}

function approvedWrapperKey(entry: ApprovedWrapperConvention): string {
  return entry.wraps;
}

function patternPreferenceKey(entry: PatternPreferenceConvention): string {
  return entry.canonical_salt_start ?? entry.intent;
}

function bannedChoiceKey(entry: BannedChoiceConvention): string {
  return entry.name;
}

function getRuleSource(
  sources: RuleSourceMap,
  type: ProjectConventionRuleType,
  key: string,
): ProjectConventionsLayerReference | null {
  return sources.get(`${type}:${key}`) ?? null;
}

function toRuleSourceLookup(
  composed: ComposedProjectConventionsResult,
): RuleSourceMap {
  return new Map(
    composed.rule_sources.map((entry) => [
      `${entry.rule_type}:${entry.key}`,
      entry.layer,
    ]),
  );
}

function setRuleSource(
  sources: RuleSourceMap,
  type: ProjectConventionRuleType,
  key: string,
  layer: ProjectConventionsLayerReference,
): void {
  sources.set(`${type}:${key}`, layer);
}

function hasConventionData(conventions: ProjectConventions | null): boolean {
  if (!conventions) {
    return false;
  }

  return Boolean(
    conventions.contract ||
      conventions.version ||
      conventions.project ||
      (conventions.preferred_components?.length ?? 0) > 0 ||
      (conventions.approved_wrappers?.length ?? 0) > 0 ||
      (conventions.pattern_preferences?.length ?? 0) > 0 ||
      (conventions.banned_choices?.length ?? 0) > 0 ||
      (conventions.notes?.length ?? 0) > 0,
  );
}

export function composeProjectConventionLayers(
  layers: ProjectConventionsLayer[],
): ComposedProjectConventionsResult {
  const preferredComponents = new Map<string, PreferredComponentConvention>();
  const approvedWrappers = new Map<string, ApprovedWrapperConvention>();
  const patternPreferences = new Map<string, PatternPreferenceConvention>();
  const bannedChoices = new Map<string, BannedChoiceConvention>();
  const ruleSources: RuleSourceMap = new Map();
  const consultedLayers = layers.map(toLayerReference);
  const notes: string[] = [];
  let contract: ProjectConventionsContract | undefined;
  let version: string | undefined;
  let project: string | undefined;

  for (const layer of layers) {
    const layerReference = toLayerReference(layer);
    const conventions = layer.conventions;

    if (!conventions) {
      continue;
    }

    contract = conventions.contract ?? contract;
    version = conventions.version ?? version;
    project = conventions.project ?? project;

    for (const note of conventions.notes ?? []) {
      if (!notes.includes(note)) {
        notes.push(note);
      }
    }

    for (const entry of conventions.preferred_components ?? []) {
      const key = preferredComponentKey(entry);
      preferredComponents.set(key, entry);
      setRuleSource(ruleSources, "preferred-component", key, layerReference);
    }

    for (const entry of conventions.approved_wrappers ?? []) {
      const key = approvedWrapperKey(entry);
      approvedWrappers.set(key, entry);
      setRuleSource(ruleSources, "approved-wrapper", key, layerReference);
    }

    for (const entry of conventions.pattern_preferences ?? []) {
      const key = patternPreferenceKey(entry);
      patternPreferences.set(key, entry);
      setRuleSource(ruleSources, "pattern-preference", key, layerReference);
    }

    for (const entry of conventions.banned_choices ?? []) {
      const key = bannedChoiceKey(entry);
      bannedChoices.set(key, entry);
      setRuleSource(ruleSources, "banned-choice", key, layerReference);
    }
  }

  const composedConventions: ProjectConventions = {
    ...(contract ? { contract } : {}),
    ...(version ? { version } : {}),
    ...(project ? { project } : {}),
    ...(preferredComponents.size > 0
      ? { preferred_components: [...preferredComponents.values()] }
      : {}),
    ...(approvedWrappers.size > 0
      ? { approved_wrappers: [...approvedWrappers.values()] }
      : {}),
    ...(patternPreferences.size > 0
      ? { pattern_preferences: [...patternPreferences.values()] }
      : {}),
    ...(bannedChoices.size > 0
      ? { banned_choices: [...bannedChoices.values()] }
      : {}),
    ...(notes.length > 0 ? { notes: uniqueStrings(notes) } : {}),
  };

  return {
    conventions: hasConventionData(composedConventions)
      ? composedConventions
      : null,
    layers_consulted: consultedLayers,
    rule_sources: [...ruleSources.entries()].map(([compositeKey, layer]) => {
      const separatorIndex = compositeKey.indexOf(":");
      return {
        rule_type: compositeKey.slice(
          0,
          separatorIndex,
        ) as ProjectConventionRuleType,
        key: compositeKey.slice(separatorIndex + 1),
        layer,
      };
    }),
  };
}

export function materializeProjectConventionStackLayers(
  stack: ProjectConventionsStack,
  conventionsByLayerId: Record<string, ProjectConventions | null | undefined>,
): ProjectConventionsLayer[] {
  return stack.layers.map((layer) => ({
    ...stackLayerToLayerReference(layer),
    description: layer.description,
    conventions: conventionsByLayerId[layer.id],
  }));
}

export async function resolveProjectConventionStackLayers(
  stack: ProjectConventionsStack,
  resolveLayer: ProjectConventionStackResolver,
): Promise<ProjectConventionsLayer[]> {
  const resolvedLayers: ProjectConventionsLayer[] = [];

  for (const layer of stack.layers) {
    resolvedLayers.push({
      ...stackLayerToLayerReference(layer),
      description: layer.description,
      conventions: await resolveLayer(layer),
    });
  }

  return resolvedLayers;
}

export async function composeProjectConventionStack(
  stack: ProjectConventionsStack,
  resolveLayer: ProjectConventionStackResolver,
): Promise<ComposedProjectConventionsResult> {
  return composeProjectConventionLayers(
    await resolveProjectConventionStackLayers(stack, resolveLayer),
  );
}

function resolveAppliedProjectConvention(
  canonicalName: string | null,
  composed: ComposedProjectConventionsResult,
): AppliedProjectConvention | null {
  if (!canonicalName || !composed.conventions) {
    return null;
  }

  const ruleSources = toRuleSourceLookup(composed);

  const bannedChoice = composed.conventions.banned_choices?.find(
    (entry) => entry.name === canonicalName,
  );
  if (bannedChoice) {
    return {
      type: "banned-choice",
      name: bannedChoice.name,
      replacement: bannedChoice.replacement ?? null,
      reason: bannedChoice.reason,
      docs: bannedChoice.docs,
      precedence: 1,
      layer: getRuleSource(
        ruleSources,
        "banned-choice",
        bannedChoiceKey(bannedChoice),
      ),
    };
  }

  const componentOverride = composed.conventions.preferred_components?.find(
    (entry) => entry.salt_name === canonicalName,
  );
  if (componentOverride) {
    return {
      type: "preferred-component",
      name: componentOverride.salt_name,
      replacement: componentOverride.prefer,
      reason: componentOverride.reason,
      docs: componentOverride.docs,
      precedence: 2,
      layer: getRuleSource(
        ruleSources,
        "preferred-component",
        preferredComponentKey(componentOverride),
      ),
    };
  }

  const wrapperOverride = composed.conventions.approved_wrappers?.find(
    (entry) => entry.wraps === canonicalName,
  );
  if (wrapperOverride) {
    return {
      type: "approved-wrapper",
      name: wrapperOverride.wraps,
      replacement: wrapperOverride.name,
      wraps: wrapperOverride.wraps,
      import: wrapperOverride.import ?? null,
      use_when: wrapperOverride.use_when,
      avoid_when: wrapperOverride.avoid_when,
      migration_shim: wrapperOverride.migration_shim,
      reason: wrapperOverride.reason,
      docs: wrapperOverride.docs,
      precedence: 3,
      layer: getRuleSource(
        ruleSources,
        "approved-wrapper",
        approvedWrapperKey(wrapperOverride),
      ),
    };
  }

  const patternPreference = composed.conventions.pattern_preferences?.find(
    (entry) => entry.canonical_salt_start === canonicalName,
  );
  if (patternPreference) {
    return {
      type: "pattern-preference",
      name: patternPreference.canonical_salt_start ?? canonicalName,
      replacement: patternPreference.prefer,
      reason: patternPreference.reason,
      docs: patternPreference.docs,
      precedence: 4,
      layer: getRuleSource(
        ruleSources,
        "pattern-preference",
        patternPreferenceKey(patternPreference),
      ),
    };
  }

  return null;
}

export function mergeCanonicalAndProjectConventionLayers(
  canonical: CanonicalSaltResult,
  layers: ProjectConventionsLayer[],
): MergedProjectConventionsResult {
  const composed = composeProjectConventionLayers(layers);
  const appliedRule = resolveAppliedProjectConvention(
    canonical.decision.name,
    composed,
  );
  const finalName = appliedRule?.replacement ?? canonical.decision.name;

  return {
    canonical: {
      source: canonical.guidance_boundary.guidance_source,
      recommendation: canonical.decision.name,
      why: canonical.decision.why,
    },
    canonical_choice: {
      source: canonical.guidance_boundary.guidance_source,
      name: canonical.decision.name,
      why: canonical.decision.why,
    },
    project_conventions: {
      consulted: composed.layers_consulted.length > 0,
      check_recommended:
        canonical.guidance_boundary.project_conventions.check_recommended,
      topics: canonical.guidance_boundary.project_conventions.topics,
      reason: canonical.guidance_boundary.project_conventions.reason,
      layers_consulted: composed.layers_consulted,
      effective_conventions: composed.conventions,
      applied: Boolean(appliedRule),
      applied_rule: appliedRule,
    },
    project_convention_applied: appliedRule,
    project_convention_layer_applied: appliedRule?.layer ?? null,
    merge_reason: appliedRule?.type ?? "canonical-only",
    why_changed: appliedRule?.reason ?? null,
    final_choice: {
      name: finalName,
      source: appliedRule ? "project_conventions" : "canonical_salt",
      changed: Boolean(appliedRule),
      based_on: canonical.decision.name,
      import: appliedRule?.import ?? null,
    },
    final_recommendation: finalName,
  };
}

export async function mergeCanonicalAndProjectConventionStack(
  canonical: CanonicalSaltResult,
  stack: ProjectConventionsStack,
  resolveLayer: ProjectConventionStackResolver,
): Promise<MergedProjectConventionsResult> {
  return mergeCanonicalAndProjectConventionLayers(
    canonical,
    await resolveProjectConventionStackLayers(stack, resolveLayer),
  );
}
