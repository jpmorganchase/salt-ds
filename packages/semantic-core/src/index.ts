export { buildRegistry } from "./build/buildRegistry.js";
export { loadRegistry } from "./registry/loadRegistry.js";
export {
  createComponentPackageKey,
  getCachedPageSearchIndex,
  getRegistryIndexes,
  getSerializedPageSearchIndex,
  normalizeRegistryLookupKey,
  type RegistryIndexes,
  setCachedPageSearchIndex,
  setSerializedPageSearchIndex,
} from "./registry/runtimeCache.js";
export {
  buildSerializedPageSearchIndex,
  createPageSearchIndex,
  getPageSearchIndexOptions,
  getPageSearchQueryOptions,
  loadSerializedPageSearchIndex,
  type PageSearchDocument,
  type SerializedPageSearchIndex,
  toPageSearchDocument,
} from "./search/pageSearchIndex.js";
export {
  buildThemeAppStarterCode,
  buildThemeSetupSnippet,
  DEFAULT_NEW_WORK_THEME_PRESET_ID,
  formatThemePresetImports,
  formatThemePresetPropAssignments,
  getThemePreset,
  listThemePresets,
  type ThemeFontSetup,
  type ThemePreset,
  type ThemePresetId,
  type ThemeProviderProp,
} from "./themePresets.js";
export {
  type AnalyzeSaltCodeInput,
  type AnalyzeSaltCodeResult,
  analyzeSaltCode,
} from "./tools/analyzeSaltCode.js";
export {
  clampChangeLimit,
  filterChangesSinceVersion,
  getChangesForComponent,
  getChangesForPackage,
  sortChangesNewestFirst,
  toChangeResultRecord,
} from "./tools/changeUtils.js";
export {
  type ChooseSaltSolutionInput,
  type ChooseSaltSolutionResult,
  chooseSaltSolution,
  type SaltSolutionType,
} from "./tools/chooseSaltSolution.js";
export {
  type CompareOptionsInput,
  type CompareOptionsResult,
  compareOptions,
} from "./tools/compareOptions.js";
export {
  type CompareSaltVersionsInput,
  type CompareSaltVersionsResult,
  compareSaltVersions,
} from "./tools/compareSaltVersions.js";
export {
  type CompareVersionsInput,
  type CompareVersionsResult,
  compareVersions,
} from "./tools/compareVersions.js";
export {
  type ComponentLookupAmbiguity,
  findReferencedComponent,
  type ResolvedComponentTarget,
  resolveComponentTarget,
} from "./tools/componentLookup.js";
export {
  type ConsumerRecommendationFilters,
  compareComponentsByConsumerPreference,
  comparePatternsByConsumerPreference,
  hasAccessibilityGuidance,
  isPatternProductionReady,
  isStableComponent,
  matchesComponentConsumerFilters,
  matchesPatternConsumerFilters,
  patternSupportsAccessibility,
  patternSupportsFormFields,
  resolvePatternComponents,
} from "./tools/consumerFilters.js";
export {
  getComponentCaveats,
  getComponentShipCheck,
  getComponentSuggestedFollowUps,
  getExampleSuggestedFollowUps,
  getFoundationSuggestedFollowUps,
  getFoundationSuggestedFollowUpsByTitle,
  getPatternCaveats,
  getPatternShipCheck,
  getPatternSuggestedFollowUps,
  type ShipCheck,
  type SuggestedFollowUp,
} from "./tools/consumerPresentation.js";
export { scoreCountrySymbol } from "./tools/countrySymbolSearch.js";
export {
  type ClarifyingQuestion,
  type DiscoverSaltDecision,
  type DiscoverSaltInput,
  type DiscoverSaltResult,
  discoverSalt,
} from "./tools/discoverSalt.js";
export {
  type DiscoveryPreferences,
  FOUNDATION_DISCOVERY_KEYWORDS,
  inferDiscoveryPreferences,
  RECIPE_DISCOVERY_KEYWORDS,
  scoreDiscoveryKeywordIntent,
  TOKEN_DISCOVERY_KEYWORDS,
} from "./tools/discoverSaltSignals.js";
export {
  type GetChangesInput,
  type GetChangesResult,
  getChanges,
} from "./tools/getChanges.js";
export {
  type GetComponentInput,
  type GetComponentResult,
  getComponent,
} from "./tools/getComponent.js";
export {
  type GetCompositionRecipeInput,
  type GetCompositionRecipeResult,
  getCompositionRecipe,
} from "./tools/getCompositionRecipe.js";
export {
  type GetCountrySymbolInput,
  type GetCountrySymbolResult,
  getCountrySymbol,
} from "./tools/getCountrySymbol.js";
export {
  type GetCountrySymbolsInput,
  type GetCountrySymbolsResult,
  getCountrySymbols,
} from "./tools/getCountrySymbols.js";
export {
  type GetExamplesInput,
  type GetExamplesResult,
  getExamples,
} from "./tools/getExamples.js";
export {
  type GetFoundationInput,
  type GetFoundationResult,
  getFoundation,
} from "./tools/getFoundation.js";
export {
  type GetGuideInput,
  type GetGuideResult,
  getGuide,
} from "./tools/getGuide.js";
export {
  type GetIconInput,
  type GetIconResult,
  getIcon,
} from "./tools/getIcon.js";
export {
  type GetIconsInput,
  type GetIconsResult,
  getIcons,
} from "./tools/getIcons.js";
export {
  type GetPackageInput,
  type GetPackageResult,
  getPackage,
} from "./tools/getPackage.js";
export {
  type GetPageInput,
  type GetPageResult,
  getPage,
} from "./tools/getPage.js";
export {
  type GetPatternInput,
  type GetPatternResult,
  getPattern,
} from "./tools/getPattern.js";
export {
  type GetRelatedEntitiesInput,
  type GetRelatedEntitiesResult,
  getRelatedEntities,
} from "./tools/getRelatedEntities.js";
export {
  type GetSaltEntityInput,
  type GetSaltEntityResult,
  getSaltEntity,
  type SaltEntityType,
} from "./tools/getSaltEntity.js";
export {
  createGetSaltEntityContext,
  type GetSaltEntityContext,
  resolveAutoSaltEntity,
  resolveKnownSaltEntity,
} from "./tools/getSaltEntityResolvers.js";
export {
  type GetSaltExamplesInput,
  type GetSaltExamplesResult,
  getSaltExamples,
} from "./tools/getSaltExamples.js";
export {
  type GetTokenInput,
  type GetTokenResult,
  getToken,
  getTokenNextStep,
} from "./tools/getToken.js";
export {
  appendProjectConventionsNextStep,
  buildGuidanceBoundary,
  describeProjectConventionsChecks,
  describeProjectConventionsTopics,
  type GuidanceBoundary,
  type GuidanceScope,
  type GuidanceSource,
  type ProjectConventionsContract,
  type ProjectConventionsHint,
  type ProjectConventionsTopic,
} from "./tools/guidanceBoundary.js";
export {
  extractGuideContext,
  extractGuideReferences,
  type GuideContext,
  type GuideReference,
  getRelevantGuides,
  getRelevantGuidesForContext,
  getRelevantGuidesForRecords,
  mergeGuideContexts,
  uniqueGuideReferences,
} from "./tools/guideAwareness.js";
export {
  findGuideByIdentifier,
  type GuideLookupAmbiguity,
  type GuideLookupResult,
  resolveGuideLookup,
} from "./tools/guideLookup.js";
export {
  type ListFoundationsInput,
  type ListFoundationsResult,
  listFoundations,
} from "./tools/listFoundations.js";
export {
  type ListSaltCatalogInput,
  type ListSaltCatalogResult,
  listSaltCatalog,
} from "./tools/listSaltCatalog.js";
export {
  projectLookupRecord,
  resolveLookup,
} from "./tools/lookupResolver.js";
export {
  getPageSlug,
  normalizePageRoute,
  normalizePageRouteBase,
  normalizePageTitle,
  type PageLookupAmbiguity,
  type PageLookupResult,
  resolvePageLookup,
} from "./tools/pageLookup.js";
export {
  type PageSearchResult,
  searchPages,
} from "./tools/pageSearch.js";
export {
  type PatternLookupAmbiguity,
  type ResolvedPatternTarget,
  resolvePatternTarget,
} from "./tools/patternLookup.js";
export {
  type RecommendComponentInput,
  type RecommendComponentResult,
  recommendComponent,
} from "./tools/recommendComponent.js";
export {
  type RecommendFixRecipesInput,
  type RecommendFixRecipesResult,
  recommendFixRecipes,
} from "./tools/recommendFixRecipes.js";
export {
  type RecommendTokensInput,
  type RecommendTokensResult,
  recommendTokens,
} from "./tools/recommendTokens.js";
export {
  type SearchApiSurfaceInput,
  type SearchApiSurfaceResult,
  searchApiSurface,
} from "./tools/searchApiSurface.js";
export {
  areaIncludes,
  createEmptyCounts,
  filterSearchEntries,
  type SearchEntryFilterInput,
} from "./tools/searchCommon.js";
export {
  type SearchComponentCapabilitiesInput,
  type SearchComponentCapabilitiesResult,
  searchComponentCapabilities,
} from "./tools/searchComponentCapabilities.js";
export {
  type SearchSaltDocsInput,
  type SearchSaltDocsResult,
  searchSaltDocs,
} from "./tools/searchSaltDocs.js";
export {
  buildComponentPresentationBase,
  buildPatternPresentationBase,
  getComponentDocs,
  getComponentGuideContext,
  getComponentRelatedGuides,
  getPatternDocs,
  getPatternGuideContext,
  getPatternRelatedGuides,
} from "./tools/solutionPresentation.js";
export {
  createComponentStarterCode,
  createFoundationStarterCode,
  createRecipeStarterCode,
  type StarterCodeSnippet,
} from "./tools/starterCode.js";
export {
  type SuggestMigrationInput,
  type SuggestMigrationResult,
  suggestMigration,
} from "./tools/suggestMigration.js";
export {
  type TranslateUiToSaltInput,
  type TranslateUiToSaltResult,
  translateUiToSalt,
} from "./tools/translateUiToSalt.js";
export {
  ARCHETYPE_PRIORITY,
  getArchetype,
  UI_ARCHETYPES,
} from "./tools/translation/sourceUiArchetypes.js";
export {
  buildConfidenceDetail,
  getMigrationKind,
  getTranslationConfidence,
  getTranslationReadiness,
} from "./tools/translation/sourceUiConfidence.js";
export {
  buildContextualHints,
  buildContextualQueryHints,
  buildContextualSourceNode,
  getRelatedGroupingMembers,
  getRelatedGroupingRefs,
  getRelatedGroupings,
  getRelatedPageRegionRefs,
  getRelatedPageRegions,
} from "./tools/translation/sourceUiContextualHints.js";
export {
  createEmptySourceAnalysis,
  detectFromCode,
  detectFromOutline,
  detectFromQuery,
  mergeDetectionBundle,
} from "./tools/translation/sourceUiDetection.js";
export { buildTranslationRecords } from "./tools/translation/sourceUiMapping.js";
export {
  buildSourceUiModel,
  getSourceFlavor,
} from "./tools/translation/sourceUiModel.js";
export {
  buildAssumptions,
  buildClarifyingQuestions,
  buildCombinedScaffoldOutput,
  buildDecisionGates,
  buildImplementationPlan,
  buildMigrationPlan,
  buildStarterCodeOutput,
  buildSuggestedFollowUps,
} from "./tools/translation/sourceUiPlanning.js";
export { getBlockerQuestion } from "./tools/translation/sourceUiQuestions.js";
export {
  buildSourceIntentProfile,
  createTranslationSemanticIndex,
  extractDocs,
  getRejectedTargetWhy,
  hasPreferredCategoryMatch,
  hasSemanticallyAlignedTarget,
  refinePreferredCategoriesForSource,
  resolveCanonicalDecisionRecord,
  type TranslationSemanticIndex,
} from "./tools/translation/sourceUiSemanticMatching.js";
export type {
  DetectionBundle,
  DetectionSignal,
  ImplementationPhase,
  ImplementationWorkItem,
  ImplementationWorkstream,
  ManualReviewWorkItem,
  RegionSignal,
  ScaffoldHandoff,
  SourceAnalysis,
  SourceIntentProfile,
  SourceUiComplexity,
  SourceUiFlavor,
  SourceUiGrouping,
  SourceUiGroupingKind,
  SourceUiKind,
  SourceUiModel,
  SourceUiNode,
  SourceUiOutlineInput,
  SourceUiRegion,
  SourceUiRegionKind,
  SourceUiRole,
  SourceUiScope,
  SourceUiSignalOrigin,
  SourceUiState,
  SourceUiStateKind,
  StateSignal,
  TranslateImplementationPlan,
  TranslationConfidenceBlocker,
  TranslationConfidenceDetail,
  TranslationMigrationKind,
  TranslationMode,
  TranslationReadiness,
  TranslationRecord,
  UiArchetype,
} from "./tools/translation/sourceUiTypes.js";
export {
  type ValidateSaltUsageInput,
  type ValidateSaltUsageResult,
  type ValidationIssue,
  validateSaltUsage,
} from "./tools/validateSaltUsage.js";
export {
  buildCatalogValidationIssue,
  CHOOSING_PRIMITIVE_GUIDE_LOOKUP,
  COMPOSITION_PITFALLS_GUIDE_LOOKUP,
  CONTAINER_CHARACTERISTIC_DOC_URL,
  CUSTOM_WRAPPERS_GUIDE_LOOKUP,
  DESIGN_TOKENS_DOC_URL,
  getValidationIssueCanonicalSource,
  getValidationIssueSourceUrls,
  SEPARABLE_CHARACTERISTIC_DOC_URL,
  SIZE_FOUNDATION_DOC_URL,
} from "./tools/validation/issueCatalog.js";
export type {
  ValidationCategory,
  ValidationIssueDescriptor,
  ValidationIssueFixHints,
  ValidationIssueTokenRecommendation,
  ValidationSeverity,
} from "./tools/validation/shared.js";
export type {
  BuildRegistryOptions,
  ChangeRecord,
  ComponentRecord,
  CountrySymbolRecord,
  DeprecationRecord,
  ExampleRecord,
  GuideRecord,
  IconRecord,
  LoadRegistryOptions,
  PackageRecord,
  PageKind,
  PageRecord,
  PatternRecord,
  RegistryBuildInfo,
  RegistrySourceArtifact,
  SaltRegistry,
  SaltStatus,
  SearchArea,
  SearchIndexEntry,
  TokenRecord,
} from "./types.js";
