import type { SaltRegistry } from "../types.js";
import { getRelevantGuidesForRecords } from "./guideAwareness.js";
import { buildGuidanceBoundary } from "./guidanceBoundary.js";
import {
  detectFromOutline,
  createEmptySourceAnalysis,
  detectFromCode,
  detectFromQuery,
  mergeDetectionBundle,
} from "./translation/sourceUiDetection.js";
import { buildTranslationRecords } from "./translation/sourceUiMapping.js";
import {
  buildAssumptions,
  buildCombinedScaffoldOutput,
  buildDecisionGates,
  buildClarifyingQuestions,
  buildImplementationPlan,
  buildMigrationPlan,
  buildStarterCodeOutput,
  buildSuggestedFollowUps,
} from "./translation/sourceUiPlanning.js";
import {
  buildSourceUiModel,
  getSourceFlavor,
} from "./translation/sourceUiModel.js";
import type {
  TranslateUiToSaltInput,
  TranslateUiToSaltResult,
} from "./translation/sourceUiTypes.js";
import { unique } from "./utils.js";

export type {
  TranslateUiToSaltInput,
  TranslateUiToSaltResult,
} from "./translation/sourceUiTypes.js";

export function translateUiToSalt(
  registry: SaltRegistry,
  input: TranslateUiToSaltInput,
): TranslateUiToSaltResult {
  const code = input.code?.trim() ?? "";
  const query = input.query?.trim() ?? "";
  const sourceOutlineProvided =
    Boolean(input.source_outline?.regions?.length) ||
    Boolean(input.source_outline?.actions?.length) ||
    Boolean(input.source_outline?.states?.length) ||
    Boolean(input.source_outline?.notes?.length);
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
    ? detectFromOutline(input.source_outline ?? {})
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
    queryProvided: queryProvided || sourceOutlineProvided,
    detectedLibraries: codeAnalysis.detected_libraries,
    containsSalt: codeAnalysis.contains_salt,
  });
  const sourceProfile = {
    code_provided: codeProvided,
    query_provided: queryProvided || sourceOutlineProvided,
    detected_libraries: codeAnalysis.detected_libraries,
    contains_salt: codeAnalysis.contains_salt,
    ui_flavor: uiFlavor,
  };
  const guidanceBoundary = buildGuidanceBoundary({
    workflow: "translate_ui_to_salt",
    has_translation_input:
      codeProvided || queryProvided || sourceOutlineProvided,
    ui_flavor: uiFlavor,
  });
  const sourceUiModel = buildSourceUiModel(detectionBundle, {
    codeProvided,
    queryProvided: queryProvided || sourceOutlineProvided,
    uiFlavor,
  });
  const translations = buildTranslationRecords(registry, input, sourceUiModel);
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
  const clarifyingQuestions = buildClarifyingQuestions(translations);
  const decisionGates = buildDecisionGates(translations);
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
    assumptions,
    clarifying_questions: clarifyingQuestions,
    decision_gates: decisionGates,
    redesign_hotspots:
      redesignHotspots.length > 0 ? redesignHotspots : undefined,
    related_guides: relatedGuides.length > 0 ? relatedGuides : undefined,
    starter_code: starterCode,
    combined_scaffold: combinedScaffold,
    suggested_follow_ups: buildSuggestedFollowUps(translations, input),
    next_step:
      sourceProfile.ui_flavor === "salt" && codeProvided
        ? "This already looks Salt-native. Use analyze_salt_code for validation and cleanup after choosing any remaining replacements."
        : decisionGates?.[0]
          ? `Resolve the first decision gate for ${decisionGates[0].source_kind} before finalizing the scaffold, then validate the migrated code with examples and analyze_salt_code.`
        : translations[0]
          ? `Start with the translation map, implement ${translations[0].label.toLowerCase()} -> ${translations[0].salt_target.name ?? "the nearest Salt target"}, then validate the migrated code with examples and analyze_salt_code.`
          : "Refine the source description so the UI intent can be translated into Salt targets.",
    source_urls: sourceUrls,
    raw:
      input.view === "full"
        ? {
            detections: [...detectionBundle.detections.values()].map((detection) => ({
              kind: detection.kind,
              evidence: [...detection.evidence],
              matched_sources: [...detection.matched_sources],
              from_code: detection.from_code,
              from_query: detection.from_query,
            })),
            page_regions: [...detectionBundle.region_signals.values()].map((region) => ({
              kind: region.kind,
              evidence: [...region.evidence],
              matched_sources: [...region.matched_sources],
              from_code: region.from_code,
              from_query: region.from_query,
            })),
            states: [...detectionBundle.state_signals.values()].map((state) => ({
              kind: state.kind,
              evidence: [...state.evidence],
              matched_sources: [...state.matched_sources],
              from_code: state.from_code,
              from_query: state.from_query,
            })),
          }
        : undefined,
  };
}
