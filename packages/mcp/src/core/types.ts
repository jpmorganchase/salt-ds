import type { SaltEvidenceRef } from "./evidence.js";
import type { SaltTokenPolicyStructuralRoleRulePack } from "./tokenPolicyStructuralRoleRules.js";

export type SaltStatus = "stable" | "beta" | "lab" | "deprecated";

export type PageKind =
  | "landing"
  | "about"
  | "guide"
  | "component-doc"
  | "pattern-doc"
  | "foundation"
  | "theme-doc"
  | "release-note"
  | "support"
  | "other";

export interface RegistrySourceArtifact {
  path: string;
  kind: "file" | "directory";
  exists: boolean;
  sha256: string | null;
  last_modified_at: string | null;
  file_count: number | null;
  newest_file_modified_at: string | null;
}

export interface RegistryBuildInfo {
  source_root: string | null;
  source_artifacts: {
    docs_root: RegistrySourceArtifact;
    search_data: RegistrySourceArtifact;
    snapshot_root: RegistrySourceArtifact;
  };
}

export interface PackageRecord {
  id: string;
  name: string;
  status: SaltStatus;
  version: string;
  summary: string;
  source_root: string;
  changelog_path: string | null;
  docs_root: string | null;
}

export interface ComponentAlternative {
  use: string;
  reason: string;
}

export interface ComponentProp {
  name: string;
  type: string;
  required: boolean;
  description: string;
  default?: string | null;
  allowed_values?: Array<string | number | boolean>;
  deprecated: boolean;
  deprecation_note?: string | null;
}

export interface ComponentSubComponent {
  name: string;
  export_name: string;
  props: ComponentProp[];
}

export interface ComponentCanonicalExampleExport {
  export_name: string;
  example_id: string;
  source_url: string;
}

export interface ComponentComposition {
  required_children?: string[];
  optional_children?: string[];
  typical_parent?: string;
}

export interface AccessibilityRule {
  id: string;
  severity: "info" | "warning" | "error";
  rule: string;
}

export interface ComponentDocgenInference {
  candidate_count: number;
  candidate_display_names: string[];
  selected_display_name: string | null;
  selected_score: number | null;
}

export interface ComponentDeprecationInference {
  matched_count: number;
  inferred_component_count: number;
  ambiguous_match_count: number;
}

export interface ComponentInference {
  docgen?: ComponentDocgenInference;
  deprecations?: ComponentDeprecationInference;
}

export type UsageSemanticsSource =
  | "component-category-map"
  | "pattern-category-map"
  | "usage-docs"
  | "usage-callouts"
  | "pattern-docs";

export interface UsageSemanticsRecord {
  category: string[];
  preferred_for: string[];
  not_for: string[];
  derived_from: UsageSemanticsSource[];
}

export type RetrievalContrastRelation =
  | "prefer-instead"
  | "not-for"
  | "complements";

export interface RetrievalContrastTarget {
  target: string;
  relation: RetrievalContrastRelation;
  evidence: string[];
}

export interface RetrievalSignalsRecord {
  contrast_targets: RetrievalContrastTarget[];
}

export interface ComponentImplementationImport {
  kind: "css";
  specifier: string;
  statement: string;
  source_url: string;
}

export interface ComponentImplementationRequirements {
  required_imports: ComponentImplementationImport[];
}

export interface ExampleRecord {
  id: string;
  title: string;
  description: string;
  intent: string[];
  complexity: "basic" | "intermediate" | "advanced";
  code: string;
  source_url: string | null;
  package: string | null;
  target_type: "component" | "pattern" | "foundation";
  target_name: string;
}

export interface ComponentRecord {
  id: string;
  name: string;
  aliases: string[];
  package: {
    name: string;
    status: SaltStatus;
    since: string | null;
  };
  summary: string;
  status: SaltStatus;
  category: string[];
  tags: string[];
  when_to_use: string[];
  when_not_to_use: string[];
  alternatives: ComponentAlternative[];
  props: ComponentProp[];
  sub_components?: ComponentSubComponent[];
  /**
   * Value exports whose ownership is proved by a source-backed canonical
   * example but is not already represented by `source.export_name` or
   * `sub_components`. The registry builder resolves ownership once so runtime
   * consumers do not need to parse example source or infer an owner.
   *
   * Optional for legacy generated registries and components without an
   * additional canonical example export.
   */
  canonical_example_exports?: ComponentCanonicalExampleExport[];
  composition?: ComponentComposition;
  accessibility: {
    summary: string[];
    rules: AccessibilityRule[];
  };
  patterns: string[];
  examples: ExampleRecord[];
  implementation_requirements?: ComponentImplementationRequirements;
  related_docs: {
    overview: string | null;
    usage: string | null;
    accessibility: string | null;
    examples: string | null;
  };
  semantics?: UsageSemanticsRecord;
  retrieval_signals?: RetrievalSignalsRecord;
  source: {
    repo_path: string | null;
    export_name: string | null;
  };
  inference?: ComponentInference;
  deprecations: string[];
  last_verified_at: string;
}

export interface IconRecord {
  id: string;
  name: string;
  base_name: string;
  figma_name: string;
  package: {
    name: string;
    status: SaltStatus;
    since: string | null;
  };
  summary: string;
  status: SaltStatus;
  category: string;
  synonyms: string[];
  aliases: string[];
  variant: "outline" | "solid";
  related_docs: {
    overview: string | null;
    examples: string | null;
    foundation: string | null;
  };
  source: {
    repo_path: string | null;
    export_name: string | null;
  };
  deprecations: string[];
  last_verified_at: string;
}

export interface IconLiteRecord {
  name: string;
  export_name: string;
  package: string;
  status: SaltStatus;
  category: string;
  variant: "outline" | "solid";
  aliases: string[];
  synonyms: string[];
}

export interface CountrySymbolRecord {
  id: string;
  code: string;
  name: string;
  package: {
    name: string;
    status: SaltStatus;
    since: string | null;
  };
  summary: string;
  status: SaltStatus;
  aliases: string[];
  variants: {
    circle: {
      export_name: string;
      repo_path: string | null;
    };
    sharp: {
      export_name: string;
      repo_path: string | null;
    };
  };
  related_docs: {
    overview: string | null;
    usage: string | null;
    accessibility: string | null;
    examples: string | null;
    foundation: string | null;
  };
  deprecations: string[];
  last_verified_at: string;
}

export interface PatternRecord {
  id: string;
  name: string;
  aliases: string[];
  summary: string;
  status: SaltStatus;
  category?: string[];
  when_to_use: string[];
  when_not_to_use: string[];
  composed_of: Array<{
    component: string;
    role: string | null;
  }>;
  related_patterns: string[];
  how_to_build: string[];
  how_it_works: string[];
  accessibility: {
    summary: string[];
    summary_sources?: Array<{
      field_path: string;
      source_url: string;
    }>;
    implementation_signals?: Array<{
      kind:
        | "aria_attribute"
        | "aria_role"
        | "aria_announcement"
        | "semantic_element";
      values: string[];
      source_kind: "example" | "source";
      source_url: string;
    }>;
  };
  resources: Array<{
    label: string;
    href: string;
    internal: boolean;
  }>;
  examples: ExampleRecord[];
  starter_scaffold?: {
    fidelity?: "canonical" | "hybrid" | "draft";
    source_urls?: string[];
    example_source_urls?: string[];
    semantics: {
      regions: string[];
      required_regions?: string[];
      optional_regions?: string[];
      build_around: string[];
      preserve_constraints: string[];
    };
    template?: {
      kind: "fallback-template";
      imports: Array<{
        name: string;
        package: string;
      }>;
      jsx_lines: string[];
      notes?: string[];
    };
  };
  /**
   * Machine-readable description of how a pattern is assembled from its
   * constituent components so `create_salt_ui`, `review_salt_ui`, and any
   * agent surface can branch on it without re-reading the pattern docs.
   *
   * - `components`: every component the pattern composes, classified as
   *   `required` (appears in a canonical pattern story) or `optional`
   *   (declared in `composed_of` but not in any canonical example). The
   *   `role` mirrors the `composed_of` role string.
   * - `regions` / `required_regions` / `optional_regions`: the spatial
   *   regions extracted from the pattern docs anatomy and dashboard
   *   regions sections. Mirrors the `starter_scaffold.semantics`
   *   region fields so consumers only have to read one place.
   * - `build_around`: anchor concepts the agent should build the JSX
   *   around (e.g. the dashboard header for an analytical dashboard).
   * - `preserve_constraints`: normative statements lifted from the
   *   pattern docs that must not be relaxed by an automated edit.
   *
   * The field is optional only on legacy partial extractions; the build
   * extractor (`extractPatterns`) always populates it for pattern docs
   * that resolve to at least one composed component or one region.
   */
  composition_contract?: PatternCompositionContract;
  related_docs: {
    overview: string | null;
  };
  semantics?: UsageSemanticsRecord;
  retrieval_signals?: RetrievalSignalsRecord;
  last_verified_at: string;
}

export interface PatternCompositionComponent {
  component: string;
  role: string | null;
  requirement: "required" | "optional";
}

export interface PatternCompositionContract {
  components: PatternCompositionComponent[];
  regions: string[];
  required_regions: string[];
  optional_regions: string[];
  build_around: string[];
  preserve_constraints: string[];
}

export interface GuideSnippet {
  title: string;
  language: "shell" | "tsx" | "css" | "html";
  code: string;
}

export interface GuideStep {
  title: string;
  statements: string[];
  snippets: GuideSnippet[];
}

export interface GuideRecord {
  id: string;
  name: string;
  aliases: string[];
  kind: "getting-started" | "theming";
  summary: string;
  packages: string[];
  steps: GuideStep[];
  related_docs: {
    overview: string | null;
    related_components: string[];
    related_packages: string[];
  };
  last_verified_at: string;
}

export interface PageRecord {
  id: string;
  title: string;
  route: string;
  page_kind: PageKind;
  summary: string;
  keywords: string[];
  content: string[];
  section_headings: string[];
  last_verified_at: string;
}

export interface TokenRecord {
  name: string;
  category: string;
  type: string;
  value: string;
  semantic_intent: string | null;
  themes: string[];
  densities: string[];
  applies_to: string[];
  guidance: string[];
  aliases: string[];
  policy?: {
    usage_tier: "characteristic" | "palette" | "foundation";
    direct_component_use: "always" | "conditional" | "never";
    preferred_for: string[];
    avoid_for: string[];
    notes: string[];
    docs: string[];
    structural_roles?: string[];
    pairing?: {
      family: string;
      role: string;
      level?: string | null;
    } | null;
    evidence_refs?: SaltEvidenceRef[];
  } | null;
  policy_gap?: {
    reason: string;
    missing: string[];
    evidence_refs: SaltEvidenceRef[];
  } | null;
  deprecated: boolean;
  last_verified_at: string;
}

export interface DeprecationRecord {
  id: string;
  package: string;
  component: string | null;
  kind: "import" | "component" | "prop" | "token" | "type" | "other";
  name: string;
  deprecated_in: string | null;
  removed_in: string | null;
  replacement: {
    type: string | null;
    name: string | null;
    notes: string | null;
  };
  migration: {
    strategy: "replace" | "remove" | "manual";
    details: Array<{
      from: string;
      to: string;
    }>;
  };
  source_urls: string[];
  inference?: {
    matched_component_names: string[];
    component_inferred: boolean;
    ambiguous_component_match: boolean;
  };
}

export type CreateRetrievalEntityType = "component" | "pattern";

export type CreateRetrievalSourceKind =
  | "canonical_name"
  | "alias"
  | "summary"
  | "category"
  | "tag"
  | "when_to_use"
  | "when_not_to_use"
  | "contrast_target"
  | "related_surface"
  | "semantics_preferred_for"
  | "semantics_not_for"
  | "example"
  | "prop"
  | "capability"
  | "pattern_composition"
  | "pattern_how_to_build"
  | "pattern_how_it_works"
  | "starter_scaffold_region"
  | "starter_scaffold_build_around"
  | "starter_scaffold_constraint";

export type CreateRetrievalEvidenceRole = "owner" | "supporting" | "caution";

export interface CreateRetrievalDocument {
  id: string;
  entity_id: string;
  entity_type: CreateRetrievalEntityType;
  entity_name: string;
  package: string | null;
  status: SaltStatus | null;
  source_kind: CreateRetrievalSourceKind;
  evidence_role: CreateRetrievalEvidenceRole;
  text: string;
  normalized_text: string;
  tokens: string[];
  stemmed_tokens: string[];
  source_weight: number;
  structural_weight: number;
  categories: string[];
}

export interface RegistryArtifact<T> {
  generated_at: string;
  version: string;
  [key: string]: T[] | string;
}

export interface SaltRegistry {
  generated_at: string;
  version: string;
  /** Build-time hash of the published semantic registry payload. */
  semantic_hash?: string | null;
  build_info: RegistryBuildInfo | null;
  packages: PackageRecord[];
  components: ComponentRecord[];
  icons: IconRecord[];
  country_symbols: CountrySymbolRecord[];
  pages: PageRecord[];
  patterns: PatternRecord[];
  guides: GuideRecord[];
  tokens: TokenRecord[];
  deprecations: DeprecationRecord[];
  examples: ExampleRecord[];
  token_policy_structural_role_rule_pack?: SaltTokenPolicyStructuralRoleRulePack | null;
}

export interface BuildRegistryOptions {
  sourceRoot?: string;
  outputDir?: string;
  version?: string;
  timestamp?: string;
}

export interface LoadRegistryOptions {
  registryDir?: string;
  /**
   * When `true`, eagerly read every registry artifact (components,
   * patterns, tokens, examples, and rule packs) up front. Defaults
   * to `false`: only metadata.json is loaded eagerly and each other
   * artifact loads from disk on first property touch.
   *
   * Pass `true` from hosts that know they will touch most of the
   * registry and want a single bounded warm-up cost instead of per-touch
   * latency.
   */
  prefetch?: boolean;
}
