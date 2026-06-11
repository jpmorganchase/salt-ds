export {
  type BuildSaltAiEvidenceClosureReportInput,
  buildSaltAiEvidenceClosureReport,
  SALT_AI_EVIDENCE_CLOSURE_REPORT_CONTRACT,
  type SaltAiEvidenceClosureDocsRegistryGap,
  type SaltAiEvidenceClosureReport,
  type SaltAiEvidenceClosureSlice,
  type SaltAiEvidenceClosureSliceId,
  type SaltAiEvidenceClosureSliceStatus,
} from "./aiEvidenceClosureReport.js";
export {
  type BuildSaltAiSetupSummaryInput,
  buildSaltAiSetupSummary,
  SALT_AI_SETUP_CONTRACT,
  type SaltAiSetupStatus,
  type SaltAiSetupStep,
  type SaltAiSetupStepStatus,
  type SaltAiSetupSummary,
} from "./aiSetup.js";
export {
  buildGeneratedArtifactPersistenceResult,
  SALT_GENERATED_ARTIFACT_PERSISTENCE_CONTRACT,
  type SaltGeneratedArtifactPersistenceResult,
} from "./artifactPersistence.js";
export {
  CONSUMER_REPO_AGENTS_TEMPLATE,
  SALT_REPO_INSTRUCTIONS_BLOCK_END,
  SALT_REPO_INSTRUCTIONS_BLOCK_START,
  SALT_REPO_INSTRUCTIONS_BODY,
  SALT_REPO_INSTRUCTIONS_TEMPLATE,
  stripLegacySaltRepoInstructions,
  upsertMarkedBlock,
  upsertSaltRepoInstructions,
  VSCODE_COPILOT_BLOCK_END,
  VSCODE_COPILOT_BLOCK_START,
  VSCODE_COPILOT_INSTRUCTIONS_TEMPLATE,
} from "./bootstrapScaffolding.js";
export {
  type BuildComponentContextArtifactInput,
  type BuildComponentContextArtifactSurfaceGateInput,
  type BuildComponentContextInput,
  buildComponentContext,
  buildComponentContextArtifact,
  buildComponentContextArtifactSurfaceGate,
  type ComponentContextArtifactSurfaceGate,
  SALT_CONTEXT_COMPONENT_CONTRACT,
  type SaltContextComponent,
  type SaltContextComponentAccessibility,
  type SaltContextComponentEvidenceText,
  type SaltContextComponentExample,
  type SaltContextComponentImport,
  type SaltContextComponentProp,
  type SaltContextComponentRecord,
  type SaltContextComponentSurfaceGate,
} from "./contextArtifacts.js";
export {
  buildGeneratedContextManifestHealth,
  buildSaltContextComponentCheck,
  diffSaltContextComponentForCheck,
  diffSaltContextFoundationForCheck,
  diffSaltContextPatternForCheck,
  generatedContextHealthToSurfaceGate,
  SALT_CONTEXT_COMPONENT_CHECK_CONTRACT,
  SALT_GENERATED_CONTEXT_HEALTH_CONTRACT,
  type SaltContextComponentCheckResult,
  type SaltContextComponentCheckStatus,
  type SaltGeneratedContextHealth,
  type SaltGeneratedContextHealthEntry,
  type SaltGeneratedContextHealthStatus,
} from "./contextChecks.js";
export {
  type BuildContextCoverageAuditInput,
  buildContextCoverageAudit,
  SALT_CONTEXT_COVERAGE_AUDIT_CONTRACT,
  type SaltContextCoverageAudit,
  type SaltContextCoverageAuditStatus,
  type SaltContextCoverageGap,
  type SaltContextCoverageGapKind,
  type SaltContextCoverageGapReasonCode,
  type SaltContextCoverageGapRecord,
  type SaltContextCoverageGapRecordKind,
  type SaltContextCoverageSection,
  type SaltContextCoverageUnsupportedRecord,
} from "./contextCoverageAudit.js";
export {
  buildContextCoverageGapCatalog,
  formatContextCoverageGapCatalogMarkdown,
  SALT_CONTEXT_COVERAGE_GAP_CATALOG_CONTRACT,
  type SaltContextCoverageGapCatalog,
  type SaltContextCoverageGapCatalogCounts,
  type SaltContextCoverageGapCatalogEntry,
  type SaltContextCoverageGapCatalogRecord,
  type SaltContextCoverageGapCatalogResolution,
} from "./contextCoverageGapCatalog.js";
export {
  type BuildFoundationContextArtifactInput,
  type BuildFoundationContextArtifactSurfaceGateInput,
  type BuildFoundationContextInput,
  buildFoundationContext,
  buildFoundationContextArtifact,
  buildFoundationContextArtifactSurfaceGate,
  type FoundationContextArtifactSurfaceGate,
  SALT_CONTEXT_FOUNDATION_CONTRACT,
  type SaltContextFoundation,
  type SaltContextFoundationEvidenceBoolean,
  type SaltContextFoundationEvidenceText,
  type SaltContextFoundationRecord,
  type SaltContextFoundationSurfaceGate,
  type SaltContextFoundationToken,
  type SaltContextFoundationTokenDoc,
  type SaltContextFoundationTokenPairing,
  type SaltContextFoundationTokenPolicy,
} from "./contextFoundations.js";
export {
  type BuildContextPackManifestInput,
  buildComponentContextManifestEntry,
  buildComponentContextMarkdownManifestEntry,
  buildContextPackManifest,
  buildDefaultContextPackCoverageGaps,
  buildFoundationContextManifestEntry,
  buildPatternContextManifestEntry,
  buildPromptHostInstructionSurfaceManifestEntry,
  SALT_CONTEXT_PACK_MANIFEST_CONTRACT,
  type SaltContextPackCoverageGap,
  type SaltContextPackCoverageGapKind,
  type SaltContextPackManifest,
  type SaltContextPackManifestEntry,
  type SaltContextPackManifestStatus,
  upsertContextPackManifestEntry,
} from "./contextManifest.js";
export {
  buildComponentContextMarkdownBridge,
  checkComponentContextMarkdownBridge,
  normalizeComponentContextMarkdownForCheck,
  SALT_CONTEXT_COMPONENT_MARKDOWN_CONTRACT,
  type SaltContextComponentMarkdownBridge,
  type SaltContextComponentMarkdownCheckResult,
} from "./contextMarkdown.js";
export {
  type BuildContextPackBundleInput,
  buildContextPackBundle,
  type CheckContextPackBundlePersistenceInput,
  checkContextPackBundlePersistence,
  SALT_CONTEXT_PACK_BUNDLE_CONTRACT,
  SALT_CONTEXT_PACK_PERSISTENCE_CHECK_CONTRACT,
  type SaltContextPackBundle,
  type SaltContextPackBundleFile,
  type SaltContextPackBundlePersistence,
  type SaltContextPackPersistenceCheck,
  type SaltContextPackPersistenceCheckFile,
} from "./contextPackBundle.js";
export {
  DEFAULT_CONTEXT_PACK_MANIFEST_PATH,
  DEFAULT_CONTEXT_PACK_OUTPUT_DIR,
  toContextPackOutputPathForManifest,
  toSafeContextFileName,
  toSafeContextMarkdownFileName,
  toSafeFoundationContextFileName,
  toSafePatternContextFileName,
} from "./contextPackPaths.js";
export { buildContextPackBundleReleaseGate } from "./contextPackReleaseGate.js";
export {
  type SaltContextPackFoundationTokenGroup,
  type SelectDefaultContextPackComponentsOptions,
  type SelectDefaultContextPackFoundationTokenGroupsOptions,
  type SelectDefaultContextPackPatternsOptions,
  selectDefaultContextPackComponents,
  selectDefaultContextPackFoundationTokenGroups,
  selectDefaultContextPackPatterns,
} from "./contextPackSelection.js";
export {
  type BuildPatternContextArtifactInput,
  type BuildPatternContextArtifactSurfaceGateInput,
  type BuildPatternContextInput,
  buildPatternContext,
  buildPatternContextArtifact,
  buildPatternContextArtifactSurfaceGate,
  type PatternContextArtifactSurfaceGate,
  SALT_CONTEXT_PATTERN_CONTRACT,
  type SaltContextPattern,
  type SaltContextPatternAccessibility,
  type SaltContextPatternComposition,
  type SaltContextPatternEvidenceText,
  type SaltContextPatternExample,
  type SaltContextPatternRecord,
  type SaltContextPatternResource,
  type SaltContextPatternSurfaceGate,
} from "./contextPatterns.js";
export {
  type BuildUnsupportedGeneratedContextSurfaceInput,
  buildDefaultUnsupportedContextSurfaces,
  buildUnsupportedGeneratedContextSurface,
  SALT_CONTEXT_UNSUPPORTED_SURFACE_CONTRACT,
  type SaltUnsupportedGeneratedSurface,
  type SaltUnsupportedGeneratedSurfaceKind,
  unsupportedGeneratedContextSurfaceFileName,
} from "./contextUnsupportedSurfaces.js";
export {
  SALT_EVIDENCE_REF_CONTRACT,
  SALT_GENERATED_ARTIFACT_CONTRACT,
  type SaltEvidenceClaimKind,
  type SaltEvidenceConfidence,
  type SaltEvidencePackageRef,
  type SaltEvidenceProjectPolicyRef,
  type SaltEvidenceRef,
  type SaltEvidenceRegistryEntityType,
  type SaltEvidenceRegistryRef,
  type SaltEvidenceSourceKind,
  type SaltEvidenceSourceRef,
  type SaltEvidenceValidationIssue,
  type SaltEvidenceValidationIssueCode,
  type SaltEvidenceWorkflowInputRef,
  type SaltGeneratedArtifact,
  type SaltGeneratedArtifactGenerator,
  type SaltGeneratedArtifactKind,
  type SaltGeneratedArtifactRegistry,
  type SaltGeneratedClaim,
  type SaltUnsupportedClaim,
  validateGeneratedArtifactEvidence,
} from "./evidence.js";
export {
  SALT_GENERATED_ARTIFACT_RELEASE_GATE_BATCH_CONTRACT,
  SALT_GENERATED_ARTIFACT_RELEASE_GATE_CONTRACT,
  type SaltGeneratedArtifactReleaseGate,
  type SaltGeneratedArtifactReleaseGateBatch,
  type SaltGeneratedArtifactReleaseGateBatchTarget,
  type SaltGeneratedArtifactReleaseGateCoverageGap,
  type SaltGeneratedArtifactReleaseGateStatus,
  type SaltGeneratedArtifactReleaseGateTargetKind,
  validateGeneratedArtifactReleaseGate,
  validateGeneratedArtifactReleaseGateBatch,
} from "./generatedArtifactReleaseGate.js";
export {
  type GeneratedSaltArtifactSurfaceGate,
  type GeneratedSaltArtifactSurfaceStatus,
  type SerializedGeneratedSaltArtifactSurfaceGate,
  serializeGeneratedSaltArtifactSurfaceGate,
  type ValidateGeneratedSaltArtifactSurfaceInput,
  validateGeneratedSaltArtifactSurface,
} from "./generatedArtifactSurface.js";
export { validateGeneratedArtifactRegistryEvidence } from "./generatedArtifactValidation.js";
export {
  buildPatternValidationRulePack,
  getPatternValidationRules,
  SALT_PATTERN_VALIDATION_RULE_PACK_CONTRACT,
  type SaltPatternValidationRuleKind,
  type SaltPatternValidationRuleMatch,
  type SaltPatternValidationRulePack,
  type SaltPatternValidationRulePackGenerator,
  type SaltPatternValidationRulePackIssue,
  type SaltPatternValidationRulePackIssueCode,
  type SaltPatternValidationRulePackRegistry,
  type SaltPatternValidationRuleRecord,
  type SaltPatternValidationRuleStatus,
  validatePatternValidationRulePackEvidence,
} from "./patternValidationRulePacks.js";
export {
  buildDefaultPromptHostInstructionSurfaces,
  buildPromptHostInstructionSurface,
  DEFAULT_PROMPT_HOST_INSTRUCTION_SURFACE_DESCRIPTORS,
  diffPromptHostInstructionSurfaceForCheck,
  findDefaultPromptHostInstructionSurfaceDescriptor,
  type PromptHostInstructionSurfaceDescriptor,
  promptHostInstructionSurfaceFileName,
  SALT_CONTEXT_PROMPT_INSTRUCTION_SURFACE_CONTRACT,
  type SaltPromptHostInstructionSurface,
  type SaltPromptHostInstructionSurfaceKind,
  type SaltPromptHostInstructionSurfaceSourceFile,
} from "./promptHostInstructionSurfaces.js";
export {
  createSaltRegistryFingerprint,
  stableRegistryJson,
  toSaltGeneratedArtifactRegistry,
} from "./registry/fingerprint.js";
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
  type BuildReviewReportArtifactInput,
  buildReviewReportArtifact,
  buildReviewReportEvidenceGate,
  type ReviewReportEvidenceGate,
} from "./reviewReportArtifacts.js";
export {
  type BuildSaltReviewReportInput,
  buildSaltReviewReport,
  SALT_REVIEW_REPORT_CONTRACT,
  type SaltReviewReport,
  type SaltReviewReportEvidenceValidation,
  type SaltReviewReportFinding,
  type SaltReviewReportGate,
  type SaltReviewReportGateStatus,
  type SaltReviewReportPhase,
  type SaltReviewReportScope,
  type SaltReviewReportScopeFile,
  type SaltReviewReportStatus,
  type SaltReviewReportSurfaceGate,
  type SaltReviewReportWorkflow,
} from "./reviewReports.js";
export {
  SALT_REVIEW_REPORT_VALIDATION_CONTRACT,
  SALT_REVIEW_RESUME_CONTRACT,
  type SaltReviewReportValidationResult,
  type SaltReviewResume,
  validateSaltReviewReport,
} from "./reviewReportValidation.js";
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
  buildThemeReferenceMarkdown,
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
  buildTokenPolicyStructuralRoleRulePack,
  findTokenStructuralRoleRuleEvidence,
  SALT_TOKEN_POLICY_STRUCTURAL_ROLE_RULE_PACK_CONTRACT,
  type SaltTokenPolicyStructuralRolePairingTemplate,
  type SaltTokenPolicyStructuralRoleRuleEmits,
  type SaltTokenPolicyStructuralRoleRuleKind,
  type SaltTokenPolicyStructuralRoleRuleMatch,
  type SaltTokenPolicyStructuralRoleRulePack,
  type SaltTokenPolicyStructuralRoleRulePackGenerator,
  type SaltTokenPolicyStructuralRoleRulePackIssue,
  type SaltTokenPolicyStructuralRoleRulePackIssueCode,
  type SaltTokenPolicyStructuralRoleRulePackRegistry,
  type SaltTokenPolicyStructuralRoleRuleRecord,
  type TokenPolicyStructuralRoleRuleInput,
  type TokenPolicyStructuralRoleRuleSource,
  validateTokenPolicyStructuralRoleRulePackEvidence,
} from "./tokenPolicyStructuralRoleRules.js";
export {
  clampChangeLimit,
  filterChangesSinceVersion,
  getChangesForComponent,
  getChangesForPackage,
  sortChangesNewestFirst,
  toChangeResultRecord,
} from "./tools/changeUtils.js";
export {
  type CompareOptionsInput,
  type CompareOptionsResult,
  compareOptions,
} from "./tools/compareOptions.js";
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
  type BuildCreateCompositionContractInput,
  buildCreateCompositionGuidance,
  type WorkflowCompositionCertainty,
  type WorkflowCompositionContract,
  type WorkflowCompositionSlot,
  type WorkflowOpenQuestion,
} from "./tools/compositionContract.js";
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
  buildCreateCatalogSupportManifest,
  type CreateCatalogCandidateSummary,
  type CreateCatalogEntityLookupResult,
  type CreateCatalogEntitySummary,
  type CreateCatalogEvidenceSummary,
  type CreateCatalogFamilyLookupResult,
  type CreateCatalogFamilySummary,
  type CreateCatalogQuerySummary,
  type CreateCatalogSupportManifest,
  inspectCreateCatalogQuery,
  listCreateCatalogEntityNames,
  listCreateCatalogFamilies,
  lookupCreateCatalogEntity,
  lookupCreateCatalogFamily,
  SALT_CREATE_CATALOG_CONTRACT_VERSION,
  SALT_CREATE_CATALOG_TOP_K_DEFAULT,
  SALT_CREATE_CATALOG_TOP_K_MAX,
} from "./tools/createCatalogSupport.js";
export {
  type CreateSaltUiInput,
  type CreateSaltUiResult,
  createSaltUi,
  type SaltSolutionType,
} from "./tools/createSaltUi.js";
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
  getSaltEntities,
  type GetSaltEntitiesInput,
  type GetSaltEntitiesResult,
  type GetSaltEntitiesRow,
} from "./tools/getSaltEntities.js";
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
  type MigrateToSaltInput,
  type MigrateToSaltResult,
  migrateToSalt,
} from "./tools/migrateToSalt.js";
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
  parseSaltAttestationNdjson,
  parseSaltAttestationV1,
  SALT_ATTESTATION_V1_SCHEMA_URL,
  type SaltAttestationParseFailure,
  type SaltAttestationParseResult,
  type SaltAttestationParseSuccess,
  type SaltAttestationV1,
  type SaltAttestationV1FileTouched,
  type SaltAttestationV1PostAction,
  type SaltAttestationV1Registry,
  SaltAttestationV1Schema,
} from "./tools/attestation.js";
export {
  assertValidPublicContract,
  buildCreatePublicContract,
  buildMigratePublicContract,
  buildPublicContract,
  buildReviewPublicContract,
  buildUpgradePublicContract,
  derivePublicCanonicalComplete,
  derivePublicSafeToImplementExactRequest,
  derivePublicWorkflowStatus,
  getPublicContractValidationErrors,
  type PublicActionKind,
  type PublicAskUserStep,
  type PublicBootstrapRepoStep,
  type PublicContract,
  type PublicContractBuildOptions,
  type PublicContractExactRequest,
  type PublicContractInput,
  type PublicContractState,
  type PublicEvidenceItem,
  type PublicEvidenceKind,
  type PublicEvidenceSummary,
  type PublicFixContextStep,
  type PublicImplementStep,
  type PublicInstallDependenciesStep,
  type PublicMatchStatus,
  type PublicNextStep,
  type PublicNextStepMode,
  type PublicRecipe,
  type PublicRecipeStep,
  type PublicRetrieveEntityStep,
  type PublicRetrieveExamplesStep,
  type PublicReviewStep,
  type PublicToolCallStep,
  type PublicTransportUsed,
  type PublicWorkflowId,
  type PublicWorkflowStatus,
} from "./tools/publicContract.js";
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
  isWorkflowExpectedReviewIssueId,
  type ReviewExpectedTargets,
  type ReviewSaltUiInput,
  type ReviewSaltUiResult,
  reviewSaltUi,
} from "./tools/reviewSaltUi.js";
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
  type StarterValidationSummary,
  validateStarterCodeSnippets,
} from "./tools/starterValidation.js";
export {
  type SuggestMigrationInput,
  type SuggestMigrationResult,
  suggestMigration,
} from "./tools/suggestMigration.js";
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
  type UpgradeSaltUiInput,
  type UpgradeSaltUiResult,
  upgradeSaltUi,
} from "./tools/upgradeSaltUi.js";
export {
  type ValidateSaltUsageInput,
  type ValidateSaltUsageResult,
  type ValidationIssue,
  validateSaltUsage,
} from "./tools/validateSaltUsage.js";
export {
  CHOOSING_PRIMITIVE_GUIDE_LOOKUP,
  COMPOSITION_PITFALLS_GUIDE_LOOKUP,
  CUSTOM_WRAPPERS_GUIDE_LOOKUP,
} from "./tools/validation/issueCatalog.js";
export type {
  ValidationCategory,
  ValidationIssueDescriptor,
  ValidationIssueFixHints,
  ValidationIssueTokenRecommendation,
  ValidationSeverity,
} from "./tools/validation/shared.js";
export {
  buildCreateSaltUiWorkflowContract,
  buildMigrateToSaltWorkflowContract,
  buildProjectConventionsCheck,
  buildRepoAwareReviewNextStep,
  buildRepoAwareReviewWorkflowMetadata,
  buildReviewSaltUiWorkflowContract,
  buildSatisfiedWorkflowContextRequirement,
  buildUpgradeSaltUiWorkflowContract,
  buildWorkflowContextRequirement,
  type CreateSaltUiWorkflowContract,
  type FollowThroughItem,
  type MigrateToSaltWorkflowContract,
  type RepoAwareReviewMigrationVerification,
  type RepoAwareReviewWorkflowInput,
  type RepoAwareReviewWorkflowMetadata,
  type ReviewSaltUiWorkflowContract,
  toWorkflowStarterValidation,
  type UpgradeSaltUiWorkflowContract,
  type WorkflowConfidence,
  type WorkflowContextRequirement,
  type WorkflowFixCandidate,
  type WorkflowFixCandidates,
  type WorkflowIntent,
  type WorkflowIssueClass,
  type WorkflowPostMigrationVerification,
  type WorkflowProjectConventionsCheck,
  type WorkflowProvenance,
  type WorkflowReadiness,
  type WorkflowStarterValidation,
  type WorkflowVisualEvidenceContract,
} from "./tools/workflowContracts.js";
export {
  buildWorkflowProjectPolicyArtifact,
  type WorkflowProjectPolicyArtifact,
  type WorkflowProjectPolicyArtifactInput,
  type WorkflowProjectPolicyImportReference,
  type WorkflowProjectPolicyLayerReference,
  type WorkflowProjectPolicyThemeDefaults,
  type WorkflowProjectPolicyTokenAlias,
  type WorkflowProjectPolicyTokenFamilyPolicy,
  type WorkflowProjectPolicyWrapperDetail,
} from "./tools/workflowProjectPolicy.js";
export {
  applyProjectPolicyToStarterCodeSnippets,
  buildProjectPolicyReviewGuidanceCandidates,
  type ProjectPolicyReviewGuidanceCandidate,
} from "./tools/workflowProjectPolicyApplication.js";
export {
  buildCreateRepoRefinementArtifact,
  buildProjectConventionRepoRefinementArtifact,
  type ProjectConventionRepoRefinementInput,
  type WorkflowRepoRefinementArtifact,
} from "./tools/workflowRepoRefinement.js";
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
export {
  type BuildValidationReportArtifactInput,
  buildValidationReportArtifact,
  buildValidationReportEvidenceGate,
  type ValidationReportEvidenceGate,
} from "./validationReportArtifacts.js";
export {
  type BuildSaltWorkflowFollowupReportInput,
  buildSaltWorkflowFollowupReport,
  SALT_WORKFLOW_FOLLOWUP_REPORT_CONTRACT,
  SALT_WORKFLOW_FOLLOWUP_REPORT_VALIDATION_CONTRACT,
  type SaltWorkflowFollowupCheck,
  type SaltWorkflowFollowupCheckId,
  type SaltWorkflowFollowupCheckStatus,
  type SaltWorkflowFollowupReport,
  type SaltWorkflowFollowupReportFollowupInput,
  type SaltWorkflowFollowupReportRuntimeEvidence,
  type SaltWorkflowFollowupReportSource,
  type SaltWorkflowFollowupReportStatus,
  type SaltWorkflowFollowupReportSummary,
  type SaltWorkflowFollowupReportTarget,
  type SaltWorkflowFollowupReportTargetInput,
  type SaltWorkflowFollowupReportValidationResult,
  type SaltWorkflowFollowupReportWorkflow,
  type SaltWorkflowFollowupReportWorkflowInputEvidence,
  type SaltWorkflowFollowupReportWorkflowState,
  type SaltWorkflowFollowupReviewEvidence,
  type SaltWorkflowFollowupReviewEvidenceStatus,
  validateSaltWorkflowFollowupReport,
} from "./workflowFollowupReports.js";
