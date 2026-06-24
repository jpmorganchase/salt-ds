// Advanced custom-host example only.
// Most consumers should scaffold `.salt` policy with `salt-ds init`
// and let repo-aware Salt workflows apply declared project conventions.

type RuleType =
  | "banned-choice"
  | "preferred-component"
  | "approved-wrapper"
  | "pattern-preference";

type LayerReference = {
  id: string;
  scope: "line_of_business" | "team" | "repo" | "other";
  source: string | null;
};

type WrapperImport = {
  from: string;
  name: string;
};

type ConventionRules = {
  banned_choices?: Array<{
    name: string;
    reason: string;
    replacement?: string;
  }>;
  preferred_components?: Array<{
    salt_name: string;
    prefer: string;
    reason: string;
  }>;
  approved_wrappers?: Array<{
    name: string;
    wraps: string;
    reason: string;
    import?: WrapperImport;
    use_when?: string[];
    avoid_when?: string[];
    migration_shim?: boolean;
  }>;
  pattern_preferences?: Array<{
    canonical_salt_start?: string;
    prefer: string;
    reason: string;
  }>;
};

export type CanonicalGuidance = {
  name: string | null;
  why: string;
  check_recommended?: boolean;
};

export type LoadedConventionLayer = {
  id: string;
  scope: LayerReference["scope"];
  source?: string | null;
  rules?: ConventionRules | null;
};

export type MergeResult = {
  canonical_choice: {
    source: "canonical_salt";
    name: string | null;
    why: string;
  };
  project_conventions: {
    consulted: boolean;
    check_recommended: boolean;
    layers_consulted: LayerReference[];
    applied: boolean;
  };
  project_convention_applied: {
    type: RuleType;
    name: string | null;
    replacement: string | null;
    reason: string;
    precedence: 1 | 2 | 3 | 4;
    layer: LayerReference | null;
    import?: WrapperImport | null;
    use_when?: string[];
    avoid_when?: string[];
    migration_shim?: boolean;
  } | null;
  merge_reason: RuleType | "canonical-only";
  final_choice: {
    name: string | null;
    source: "project_conventions" | "canonical_salt";
    changed: boolean;
    based_on: string | null;
    import: WrapperImport | null;
  };
  final_recommendation: string | null;
};

function toLayerReference(layer: LoadedConventionLayer): LayerReference {
  return {
    id: layer.id,
    scope: layer.scope,
    source: layer.source ?? null,
  };
}

function findAppliedRule(
  canonicalName: string | null,
  layers: LoadedConventionLayer[],
): MergeResult["project_convention_applied"] {
  if (!canonicalName) {
    return null;
  }

  for (let index = layers.length - 1; index >= 0; index -= 1) {
    const layer = layers[index];
    const rules = layer.rules;
    const layerReference = toLayerReference(layer);

    const bannedChoice = rules?.banned_choices?.find(
      (rule) => rule.name === canonicalName,
    );
    if (bannedChoice) {
      return {
        type: "banned-choice",
        name: bannedChoice.name,
        replacement: bannedChoice.replacement ?? null,
        reason: bannedChoice.reason,
        precedence: 1,
        layer: layerReference,
      };
    }
  }

  for (let index = layers.length - 1; index >= 0; index -= 1) {
    const layer = layers[index];
    const preferredComponent = layer.rules?.preferred_components?.find(
      (rule) => rule.salt_name === canonicalName,
    );
    if (preferredComponent) {
      return {
        type: "preferred-component",
        name: preferredComponent.salt_name,
        replacement: preferredComponent.prefer,
        reason: preferredComponent.reason,
        precedence: 2,
        layer: toLayerReference(layer),
      };
    }
  }

  for (let index = layers.length - 1; index >= 0; index -= 1) {
    const layer = layers[index];
    const approvedWrapper = layer.rules?.approved_wrappers?.find(
      (rule) => rule.wraps === canonicalName,
    );
    if (approvedWrapper) {
      return {
        type: "approved-wrapper",
        name: approvedWrapper.wraps,
        replacement: approvedWrapper.name,
        reason: approvedWrapper.reason,
        precedence: 3,
        layer: toLayerReference(layer),
        import: approvedWrapper.import ?? null,
        use_when: approvedWrapper.use_when,
        avoid_when: approvedWrapper.avoid_when,
        migration_shim: approvedWrapper.migration_shim,
      };
    }
  }

  for (let index = layers.length - 1; index >= 0; index -= 1) {
    const layer = layers[index];
    const patternPreference = layer.rules?.pattern_preferences?.find(
      (rule) => rule.canonical_salt_start === canonicalName,
    );
    if (patternPreference) {
      return {
        type: "pattern-preference",
        name: patternPreference.canonical_salt_start ?? canonicalName,
        replacement: patternPreference.prefer,
        reason: patternPreference.reason,
        precedence: 4,
        layer: toLayerReference(layer),
      };
    }
  }

  return null;
}

export function mergeCanonicalAndProjectConventions(
  canonical: CanonicalGuidance,
  layers: LoadedConventionLayer[],
): MergeResult {
  const layersConsulted = layers.map(toLayerReference);
  const appliedRule = findAppliedRule(canonical.name, layers);
  const finalName = appliedRule?.replacement ?? canonical.name;

  return {
    canonical_choice: {
      source: "canonical_salt",
      name: canonical.name,
      why: canonical.why,
    },
    project_conventions: {
      consulted: layersConsulted.length > 0,
      check_recommended: canonical.check_recommended ?? true,
      layers_consulted: layersConsulted,
      applied: Boolean(appliedRule),
    },
    project_convention_applied: appliedRule,
    merge_reason: appliedRule?.type ?? "canonical-only",
    final_choice: {
      name: finalName,
      source: appliedRule ? "project_conventions" : "canonical_salt",
      changed: Boolean(appliedRule),
      based_on: canonical.name,
      import: appliedRule?.import ?? null,
    },
    final_recommendation: finalName,
  };
}
