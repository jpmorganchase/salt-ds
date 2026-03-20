import type { SaltSolutionType } from "../chooseSaltSolution.js";
import type { SuggestedFollowUp } from "../consumerPresentation.js";
import type { GuidanceBoundary } from "../guidanceBoundary.js";
import type { GuideReference } from "../guideAwareness.js";
import type { StarterCodeSnippet } from "../starterCode.js";

export type { SaltSolutionType, StarterCodeSnippet };

export type SourceUiKind =
  | "split-action"
  | "vertical-navigation"
  | "dialog"
  | "tabs"
  | "data-table"
  | "toolbar"
  | "text-input"
  | "selection-control"
  | "navigation"
  | "action";

export type TranslationMigrationKind =
  | "direct"
  | "pattern"
  | "foundation"
  | "manual-review";

export type SourceUiRole =
  | "action"
  | "navigation"
  | "commanding"
  | "overlay"
  | "data-entry"
  | "selection"
  | "data-display";

export type SourceUiScope = "control" | "flow" | "app-structure";
export type SourceUiComplexity = "single-part" | "multi-part";
export type TranslationReadiness = "high" | "medium" | "review";
export type TranslationMode =
  | "map-from-description"
  | "scaffold-from-code"
  | "refine-mixed-code"
  | "validate-existing-salt";
export type SourceUiSignalOrigin = "code" | "query";
export type SourceUiFlavor =
  | "description"
  | "salt"
  | "mixed"
  | "external-ui"
  | "generic-react";

export type SourceUiRegionKind =
  | "header"
  | "sidebar"
  | "content"
  | "footer"
  | "toolbar"
  | "filter-bar"
  | "form-section"
  | "dialog-header"
  | "dialog-body"
  | "dialog-footer";

export type SourceUiStateKind =
  | "loading"
  | "empty"
  | "error"
  | "validation";

export type SourceUiGroupingKind =
  | "app-shell"
  | "dialog-flow"
  | "form-flow"
  | "data-surface";

export type TranslationConfidenceBlocker =
  | "missing-source-semantics"
  | "ambiguous-structure"
  | "pattern-rewrite"
  | "no-direct-salt-match";

export interface UiArchetype {
  kind: SourceUiKind;
  label: string;
  solution_type: Exclude<SaltSolutionType, "auto" | "token">;
  salt_query: string;
  migration_kind: TranslationMigrationKind;
  query_patterns?: RegExp[];
  jsx_name_patterns?: RegExp[];
  notes?: string[];
  require_form_field_support?: boolean;
}

export interface DetectionSignal {
  kind: SourceUiKind;
  evidence: Set<string>;
  matched_sources: Set<string>;
  from_code: boolean;
  from_query: boolean;
}

export interface RegionSignal {
  kind: SourceUiRegionKind;
  evidence: Set<string>;
  matched_sources: Set<string>;
  from_code: boolean;
  from_query: boolean;
}

export interface StateSignal {
  kind: SourceUiStateKind;
  evidence: Set<string>;
  matched_sources: Set<string>;
  from_code: boolean;
  from_query: boolean;
}

export interface DetectionBundle {
  detections: Map<SourceUiKind, DetectionSignal>;
  region_signals: Map<SourceUiRegionKind, RegionSignal>;
  state_signals: Map<SourceUiStateKind, StateSignal>;
}

export interface SourceAnalysis extends DetectionBundle {
  detected_libraries: string[];
  contains_salt: boolean;
}

export interface SourceUiNode {
  id: string;
  kind: SourceUiKind;
  label: string;
  role: SourceUiRole;
  scope: SourceUiScope;
  complexity: SourceUiComplexity;
  likely_solution_type: Exclude<SaltSolutionType, "auto" | "token">;
  evidence: string[];
  matched_sources: string[];
  detected_from: SourceUiSignalOrigin[];
  notes: string[];
}

export interface SourceUiRegion {
  id: string;
  kind: SourceUiRegionKind;
  label: string;
  evidence: string[];
  matched_sources: string[];
  detected_from: SourceUiSignalOrigin[];
}

export interface SourceUiState {
  id: string;
  kind: SourceUiStateKind;
  label: string;
  evidence: string[];
  matched_sources: string[];
  detected_from: SourceUiSignalOrigin[];
}

export interface SourceUiGrouping {
  id: string;
  kind: SourceUiGroupingKind;
  label: string;
  region_refs: string[];
  ui_region_refs: string[];
  reason: string;
}

export interface SourceUiOutlineInput {
  regions?: string[];
  actions?: string[];
  states?: string[];
  notes?: string[];
}

export interface SourceUiModel {
  ui_regions: SourceUiNode[];
  page_regions: SourceUiRegion[];
  states: SourceUiState[];
  groupings: SourceUiGrouping[];
  summary: {
    dominant_scope: SourceUiScope | "mixed" | "unknown";
    dominant_role: SourceUiRole | "mixed" | "unknown";
    primitive_candidates: number;
    structured_flows: number;
    page_regions: number;
    state_signals: number;
    groupings: number;
    signal_sources: SourceUiSignalOrigin[];
    translation_mode: TranslationMode;
  };
}

export interface TranslationConfidenceDetail {
  level: "high" | "medium" | "low";
  reasons: string[];
  blocker: TranslationConfidenceBlocker | null;
  next_question?: string;
}

export interface TranslationRecord {
  source_model_ref: string;
  source_kind: SourceUiKind;
  label: string;
  source_scope: SourceUiScope;
  source_role: SourceUiRole;
  page_region_refs?: string[];
  grouping_refs?: string[];
  evidence: string[];
  matched_sources: string[];
  confidence: number;
  confidence_detail: TranslationConfidenceDetail;
  migration_kind: TranslationMigrationKind;
  notes: string[];
  implementation: {
    readiness: TranslationReadiness;
    next_action: string;
    validation_step: string;
    starter_code_available: boolean;
  };
  salt_target: {
    solution_type: Exclude<SaltSolutionType, "auto" | "token"> | null;
    name: string | null;
    why: string;
    docs: string[];
    related_guides: GuideReference[];
    starter_code?: StarterCodeSnippet[];
  };
  raw_recommendation?: Record<string, unknown>;
}

export interface ImplementationWorkItem {
  source_model_ref: string;
  source_kind: SourceUiKind;
  source_label: string;
  page_region_refs?: string[];
  grouping_refs?: string[];
  target_name: string | null;
  solution_type: Exclude<SaltSolutionType, "auto" | "token"> | null;
  confidence: number;
  confidence_detail: TranslationConfidenceDetail;
  why: string;
  next_action: string;
  docs: string[];
}

export interface ManualReviewWorkItem extends ImplementationWorkItem {
  reason: string;
}

export interface ImplementationPhase {
  title: string;
  focus: string;
  actions: string[];
}

export interface ImplementationWorkstream {
  label: string;
  region_refs: string[];
  translation_refs: string[];
  focus: string;
  actions: string[];
}

export interface ScaffoldHandoff {
  start_with: string[];
  build_around: string[];
  validate_after_scaffold: string;
}

export interface TranslateImplementationPlan {
  direct_swaps: ImplementationWorkItem[];
  pattern_rewrites: ImplementationWorkItem[];
  foundation_mappings: ImplementationWorkItem[];
  manual_reviews: ManualReviewWorkItem[];
  workstreams: ImplementationWorkstream[];
  phases: ImplementationPhase[];
  validation_sequence: string[];
  starter_code_targets?: Array<{
    source_kind: SourceUiKind;
    source_label: string;
    target_name: string;
    solution_type: Exclude<SaltSolutionType, "auto" | "token">;
  }>;
  scaffold_handoff?: ScaffoldHandoff;
}

export interface TranslateUiToSaltInput {
  code?: string;
  query?: string;
  source_outline?: SourceUiOutlineInput;
  package?: string;
  prefer_stable?: boolean;
  a11y_required?: boolean;
  form_field_support?: boolean;
  include_starter_code?: boolean;
  view?: "compact" | "full";
}

export interface TranslateUiToSaltResult {
  guidance_boundary: GuidanceBoundary;
  source_profile: {
    code_provided: boolean;
    query_provided: boolean;
    detected_libraries: string[];
    contains_salt: boolean;
    ui_flavor: SourceUiFlavor;
  };
  source_ui_model: SourceUiModel;
  summary: {
    detections: number;
    direct_replacements: number;
    pattern_rewrites: number;
    foundation_mappings: number;
    manual_reviews: number;
  };
  translations: TranslationRecord[];
  implementation_plan: TranslateImplementationPlan;
  migration_plan: string[];
  assumptions?: string[];
  clarifying_questions?: string[];
  decision_gates?: Array<{
    id: string;
    source_model_ref: string;
    source_kind: SourceUiKind;
    question: string;
    reason: string;
    suggested_workflow: "choose_salt_solution" | "get_salt_entity" | "get_salt_examples";
  }>;
  redesign_hotspots?: string[];
  related_guides?: GuideReference[];
  starter_code?: StarterCodeSnippet[];
  combined_scaffold?: StarterCodeSnippet[];
  suggested_follow_ups?: SuggestedFollowUp[];
  next_step?: string;
  source_urls: string[];
  raw?: Record<string, unknown>;
}
