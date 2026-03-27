import type { SaltRegistry } from "../types.js";
import {
  appendProjectConventionsNextStep,
  buildGuidanceBoundary,
  type ProjectConventionsTopic,
} from "./guidanceBoundary.js";
import { getRelevantGuidesForRecords } from "./guideAwareness.js";
import {
  createEmptySourceAnalysis,
  detectFromCode,
  detectFromOutline,
  detectFromQuery,
  mergeDetectionBundle,
} from "./translation/sourceUiDetection.js";
import { buildTranslationRecords } from "./translation/sourceUiMapping.js";
import {
  buildSourceUiModel,
  getSourceFlavor,
} from "./translation/sourceUiModel.js";
import {
  buildAssumptions,
  buildClarifyingQuestions,
  buildCombinedScaffoldOutput,
  buildDecisionGates,
  buildFamiliarityContract,
  buildImplementationPlan,
  buildMigrationCheckpoints,
  buildMigrationPlan,
  buildStarterCodeOutput,
  buildSuggestedFollowUps,
} from "./translation/sourceUiPlanning.js";
import type {
  MigrateToSaltInput,
  MigrateToSaltResult,
} from "./translation/sourceUiTypes.js";
import { unique } from "./utils.js";

export type {
  MigrateToSaltInput,
  MigrateToSaltResult,
} from "./translation/sourceUiTypes.js";

function mergeOutlineField(
  values: Array<string[] | undefined>,
): string[] | undefined {
  const merged = unique(
    values.flatMap((entries) =>
      (entries ?? []).filter((entry) => entry.trim().length > 0),
    ),
  );

  return merged.length > 0 ? merged : undefined;
}

function mergeSourceOutlineInputs(input: MigrateToSaltInput): {
  merged_source_outline: MigrateToSaltInput["source_outline"];
  visual_evidence_provided: boolean;
} {
  const visualEvidence = input.visual_evidence ?? [];
  const mergedSourceOutline = {
    regions: mergeOutlineField([
      input.source_outline?.regions,
      ...visualEvidence.map((entry) => entry.derived_outline.regions),
    ]),
    actions: mergeOutlineField([
      input.source_outline?.actions,
      ...visualEvidence.map((entry) => entry.derived_outline.actions),
    ]),
    states: mergeOutlineField([
      input.source_outline?.states,
      ...visualEvidence.map((entry) => entry.derived_outline.states),
    ]),
    notes: mergeOutlineField([
      input.source_outline?.notes,
      ...visualEvidence.map((entry) => entry.derived_outline.notes),
    ]),
  };
  const hasMergedSignals =
    Boolean(mergedSourceOutline.regions?.length) ||
    Boolean(mergedSourceOutline.actions?.length) ||
    Boolean(mergedSourceOutline.states?.length) ||
    Boolean(mergedSourceOutline.notes?.length);

  return {
    merged_source_outline: hasMergedSignals ? mergedSourceOutline : undefined,
    visual_evidence_provided: visualEvidence.length > 0,
  };
}

function getTranslationProjectConventionTopics(
  sourceUiModel: MigrateToSaltResult["source_ui_model"],
  translations: MigrateToSaltResult["translations"],
): ProjectConventionsTopic[] {
  const topics = new Set<ProjectConventionsTopic>();

  if (
    sourceUiModel.page_regions.some(
      (region) => region.kind === "sidebar" || region.kind === "header",
    )
  ) {
    topics.add("navigation-shell");
    topics.add("local-layout");
  }

  if (
    sourceUiModel.page_regions.length > 0 ||
    sourceUiModel.groupings.length > 0
  ) {
    topics.add("page-patterns");
  }

  if (
    translations.some(
      (translation) =>
        translation.migration_kind === "direct" &&
        translation.salt_target.solution_type === "component",
    )
  ) {
    topics.add("wrappers");
  }

  return [...topics];
}

export function migrateToSalt(
  registry: SaltRegistry,
  input: MigrateToSaltInput,
): MigrateToSaltResult {
  const { merged_source_outline, visual_evidence_provided } =
    mergeSourceOutlineInputs(input);
  const normalizedInput: MigrateToSaltInput = {
    ...input,
    source_outline: merged_source_outline,
    include_starter_code: input.include_starter_code !== false,
  };
  const code = input.code?.trim() ?? "";
  const query = input.query?.trim() ?? "";
  const sourceOutlineProvided =
    Boolean(merged_source_outline?.regions?.length) ||
    Boolean(merged_source_outline?.actions?.length) ||
    Boolean(merged_source_outline?.states?.length) ||
    Boolean(merged_source_outline?.notes?.length);
  const codeProvided = code.length > 0;
  const queryProvided = query.length > 0;

  const codeAnalysis = codeProvided
    ? detectFromCode(code)
    : createEmptySourceAnalysis();
  const queryDetections = queryProvided
    ? detectFromQuery(query)
    : {
        detections: new Map(),
        region_signals: new Map(),
        state_signals: new Map(),
      };
  const outlineDetections = sourceOutlineProvided
    ? detectFromOutline(merged_source_outline ?? {})
    : {
        detections: new Map(),
        region_signals: new Map(),
        state_signals: new Map(),
      };
  const codeAndQueryDetections = mergeDetectionBundle(
    codeAnalysis,
    queryDetections,
  );
  const detectionBundle = mergeDetectionBundle(
    {
      ...codeAnalysis,
      detections: codeAndQueryDetections.detections,
      region_signals: codeAndQueryDetections.region_signals,
      state_signals: codeAndQueryDetections.state_signals,
    },
    outlineDetections,
  );
  const uiFlavor = getSourceFlavor({
    codeProvided,
    queryProvided:
      queryProvided || sourceOutlineProvided || visual_evidence_provided,
    detectedLibraries: codeAnalysis.detected_libraries,
    containsSalt: codeAnalysis.contains_salt,
  });
  const sourceProfile = {
    code_provided: codeProvided,
    query_provided:
      queryProvided || sourceOutlineProvided || visual_evidence_provided,
    detected_libraries: codeAnalysis.detected_libraries,
    contains_salt: codeAnalysis.contains_salt,
    ui_flavor: uiFlavor,
  };
  const sourceUiModel = buildSourceUiModel(detectionBundle, {
    codeProvided,
    queryProvided:
      queryProvided || sourceOutlineProvided || visual_evidence_provided,
    uiFlavor,
  });
  const translations = buildTranslationRecords(
    registry,
    normalizedInput,
    sourceUiModel,
  );
  const guidanceBoundary = buildGuidanceBoundary({
    workflow: "migrate_to_salt",
    has_translation_input:
      codeProvided || queryProvided || sourceOutlineProvided,
    ui_flavor: uiFlavor,
    project_conventions_topics: getTranslationProjectConventionTopics(
      sourceUiModel,
      translations,
    ),
  });
  const implementationPlan = buildImplementationPlan(
    translations,
    sourceUiModel,
    codeProvided,
  );
  const relatedGuides = getRelevantGuidesForRecords(registry, translations, {
    top_k: 4,
  });
  const redesignHotspots = implementationPlan.manual_reviews.map(
    (translation) => `${translation.source_label}: ${translation.reason}`,
  );
  const starterCode = buildStarterCodeOutput(translations);
  const combinedScaffold = buildCombinedScaffoldOutput(
    translations,
    sourceUiModel,
    implementationPlan,
  );
  const assumptions = buildAssumptions(sourceProfile, sourceUiModel);
  const clarifyingQuestions = buildClarifyingQuestions({
    sourceProfile,
    sourceModel: sourceUiModel,
    translations,
  });
  const decisionGates = buildDecisionGates(translations);
  const familiarityContract = buildFamiliarityContract(
    sourceProfile,
    sourceUiModel,
    translations,
  );
  const migrationCheckpoints = buildMigrationCheckpoints(
    sourceUiModel,
    translations,
  );
  const summary = {
    detections: translations.length,
    direct_replacements: translations.filter(
      (translation) => translation.migration_kind === "direct",
    ).length,
    pattern_rewrites: translations.filter(
      (translation) => translation.migration_kind === "pattern",
    ).length,
    foundation_mappings: translations.filter(
      (translation) => translation.migration_kind === "foundation",
    ).length,
    manual_reviews: translations.filter(
      (translation) => translation.migration_kind === "manual-review",
    ).length,
    confirmation_required: translations.filter(
      (translation) =>
        translation.delta_category === "workflow-change-requires-confirmation",
    ).length,
  };
  const sourceUrls = unique([
    ...translations.flatMap((translation) => translation.salt_target.docs),
    ...relatedGuides.flatMap((guide) =>
      guide.overview ? [guide.overview] : [],
    ),
  ]);

  if (!codeProvided && !queryProvided && !sourceOutlineProvided) {
    return {
      guidance_boundary: guidanceBoundary,
      source_profile: sourceProfile,
      source_ui_model: sourceUiModel,
      summary,
      translations: [],
      implementation_plan: {
        direct_swaps: [],
        pattern_rewrites: [],
        foundation_mappings: [],
        manual_reviews: [],
        workstreams: [],
        phases: [],
        validation_sequence: [],
      },
      migration_plan: [],
      familiarity_contract: {
        preserve: [],
        allow_salt_changes: [],
        requires_confirmation: [],
      },
      migration_checkpoints: [],
      next_step:
        "Provide source UI code or describe the interface you want to translate into Salt.",
      source_urls: [],
    };
  }

  return {
    guidance_boundary: guidanceBoundary,
    source_profile: sourceProfile,
    source_ui_model: sourceUiModel,
    summary,
    translations,
    implementation_plan: implementationPlan,
    migration_plan: buildMigrationPlan(implementationPlan, codeProvided),
    familiarity_contract: familiarityContract,
    migration_checkpoints: migrationCheckpoints,
    assumptions,
    clarifying_questions: clarifyingQuestions,
    decision_gates: decisionGates,
    redesign_hotspots:
      redesignHotspots.length > 0 ? redesignHotspots : undefined,
    related_guides: relatedGuides.length > 0 ? relatedGuides : undefined,
    starter_code: starterCode,
    combined_scaffold: combinedScaffold,
    suggested_follow_ups: buildSuggestedFollowUps(
      translations,
      normalizedInput,
      guidanceBoundary,
    ),
    next_step: appendProjectConventionsNextStep(
      sourceProfile.ui_flavor === "salt" && codeProvided
        ? "This already looks Salt-native. Use review_salt_ui for validation and cleanup after choosing any remaining replacements."
        : decisionGates?.[0]
          ? `Resolve the first decision gate for ${decisionGates[0].source_kind} before finalizing the scaffold, then validate the migrated code with examples and review_salt_ui.`
          : translations[0]
            ? `Start with the translation map, implement ${translations[0].label.toLowerCase()} -> ${translations[0].salt_target.name ?? "the nearest Salt target"}, then validate the migrated code with examples and review_salt_ui.`
            : "Refine the source description so the UI intent can be translated into Salt targets.",
      guidanceBoundary,
    ),
    source_urls: sourceUrls,
    raw:
      normalizedInput.view === "full"
        ? {
            detections: [...detectionBundle.detections.values()].map(
              (detection) => ({
                kind: detection.kind,
                evidence: [...detection.evidence],
                matched_sources: [...detection.matched_sources],
                from_code: detection.from_code,
                from_query: detection.from_query,
              }),
            ),
            page_regions: [...detectionBundle.region_signals.values()].map(
              (region) => ({
                kind: region.kind,
                evidence: [...region.evidence],
                matched_sources: [...region.matched_sources],
                from_code: region.from_code,
                from_query: region.from_query,
              }),
            ),
            states: [...detectionBundle.state_signals.values()].map(
              (state) => ({
                kind: state.kind,
                evidence: [...state.evidence],
                matched_sources: [...state.matched_sources],
                from_code: state.from_code,
                from_query: state.from_query,
              }),
            ),
          }
        : undefined,
  };
}
