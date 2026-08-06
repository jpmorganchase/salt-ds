import type { SaltTokenPolicyEvidenceRef } from "./evidence.js";
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

export interface ComponentPropSubject {
  package: string;
  entrypoint: string;
  export_name: string;
  symbol_space: "type" | "type_and_value";
  member_path: [{ kind: "prop"; name: string }];
}

export interface ComponentSubComponent {
  name: string;
  export_name: string;
  props: ComponentProp[];
  /** Compiler-resolved implementation origin for generated records. */
  repo_path: string;
}

export type ComponentCanonicalExampleExport = {
  export_name: string;
  example_id: string;
  /** Compiler-resolved implementation origin for generated catalog records. */
  export_repo_path: string;
} & RegistrySourceLocator;

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

export type RegistrySourceLocator =
  | {
      source_url: string;
      source_path: null;
    }
  | {
      source_url: null;
      source_path: string;
    };

export type AccessibilityImplementationSignal = {
  kind:
    | "aria_attribute"
    | "aria_role"
    | "aria_announcement"
    | "semantic_element";
  values: string[];
  source_kind: "example" | "source";
} & RegistrySourceLocator;

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

export type ExampleRecord = {
  id: string;
  title: string;
  description: string;
  intent: string[];
  complexity: "basic" | "intermediate" | "advanced";
  code: string;
  package: string | null;
  target_type: "component" | "pattern" | "foundation";
  target_name: string;
} & RegistrySourceLocator;

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
  /** Canonical component-usage content payload backing the usage arrays. */
  usage_content_ref?: string;
  alternatives: ComponentAlternative[];
  props: ComponentProp[];
  /**
   * Exact public API identities proved by the selected compiler/docgen prop
   * declarations. Review rules use these identities instead of inferring a
   * props owner from component or type names.
   */
  prop_subjects?: ComponentPropSubject[];
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
    implementation_signals?: AccessibilityImplementationSignal[];
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
  /**
   * When `export_name` is present, `repo_path` is the exact module file proved
   * by the package export graph. Without an export name, `repo_path` is only
   * the authored component provenance boundary and cannot establish a
   * top-level public export identity.
   */
  source: {
    repo_path: string | null;
    export_name: string | null;
  };
  inference?: ComponentInference;
  deprecations: string[];
  last_verified_at: string | null;
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
    repo_path: string;
    export_name: string;
  };
  deprecations: string[];
  last_verified_at: string | null;
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
      repo_path: string;
    };
    sharp: {
      export_name: string;
      repo_path: string;
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
  last_verified_at: string | null;
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
    implementation_signals?: AccessibilityImplementationSignal[];
  };
  resources: Array<{
    label: string;
    href: string;
    internal: boolean;
  }>;
  examples: ExampleRecord[];
  related_docs: {
    overview: string | null;
  };
  semantics?: UsageSemanticsRecord;
  retrieval_signals?: RetrievalSignalsRecord;
  last_verified_at: string | null;
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
  last_verified_at: string | null;
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
  source_path: string;
  last_verified_at: string | null;
}

export interface TokenDeclarationSourceRange {
  start_offset: number;
  end_offset: number;
  start_line: number;
  start_column: number;
  end_line: number;
  end_column: number;
}

export interface TokenDeclarationDimension {
  name: string;
  value: string;
  selector: string;
  established_by: "selector" | "source_path" | "import_entrypoint";
}

export interface TokenDeclarationSelectorConstraint {
  name: string;
  operator: string | null;
  value: string | null;
  insensitive: boolean;
}

export interface TokenDeclarationSelectorVariant {
  selector: string;
  dimensions: TokenDeclarationDimension[];
  constraints: TokenDeclarationSelectorConstraint[];
}

export interface TokenDeclarationAtRule {
  name: string;
  params: string;
}

export interface TokenDeclarationSourceContext {
  entrypoint: string;
  theme: "salt" | "next";
  import_chain: string[];
  condition: string | null;
}

export interface TokenDeclarationProjection {
  id: string;
  value: string;
  raw_value?: string | null;
  important?: boolean;
  raw_selector: string | null;
  source_context: string[];
  at_rules?: TokenDeclarationAtRule[];
  selector_variants?: TokenDeclarationSelectorVariant[];
  source_contexts?: TokenDeclarationSourceContext[];
  source_range: TokenDeclarationSourceRange;
  source_path: string;
  dimensions: TokenDeclarationDimension[];
  deprecated: boolean;
  replacement: string | null;
}

export interface TokenRecord {
  name: string;
  category: string;
  type: string;
  /**
   * Present only when canonical source data explicitly identifies a default
   * declaration. Contextual values always live in declarations; equality
   * across declarations is not evidence of a default.
   */
  value: string | null;
  default_declaration_id?: string | null;
  declarations?: TokenDeclarationProjection[];
  semantic_intent: string | null;
  themes: string[];
  densities: string[];
  applies_to: string[];
  guidance: string[];
  aliases: string[];
  /** Immediate, source-backed replacement token names. */
  replacement_tokens?: string[];
  /** Curated sources that contributed immediate replacement edges. */
  replacement_sources?: Array<{
    replacement: string;
    source_kind: "docs" | "token";
    source_path: string;
    source_text: string;
    line_start: number | null;
    line_end: number | null;
  }>;
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
    evidence_refs?: SaltTokenPolicyEvidenceRef[];
  } | null;
  policy_gap?: {
    reason: string;
    missing: string[];
    evidence_refs: SaltTokenPolicyEvidenceRef[];
  } | null;
  /** True only when at least one declaration exists and every declaration is deprecated. */
  deprecated: boolean;
  last_verified_at: string | null;
}

export interface ApiSymbolIdentity {
  package: string;
  /** Public package export key, for example "." or "./moment". */
  entrypoint: string;
  export_name: string;
  symbol_space: "value" | "type" | "type_and_value";
  /** Phase 1 supports either a top-level export or one immediate public member. */
  member_path: Array<{
    kind: "prop" | "method" | "static_method";
    name: string;
  }>;
}

export type ApiLiteral = string | number | boolean | null;

export interface DeprecationValueMapCase {
  from: ApiLiteral;
  set: Array<{
    target: ApiSymbolIdentity;
    value: ApiLiteral;
  }>;
}

export interface DeprecationValueMap {
  cases: DeprecationValueMapCase[];
  /**
   * Dynamic expressions and values not represented by a finite authored case
   * always require human review.
   */
  fallback: "manual";
}

export interface DeprecationSourceOccurrence {
  source_path: string;
  source_range: TokenDeclarationSourceRange;
}

export interface DeprecationRecord {
  id: string;
  /** Stable semantic subject; source locations and prose never participate. */
  subject: ApiSymbolIdentity;
  package: string;
  /** Unique registered UI component association; never a generic API owner. */
  component: string | null;
  kind: "import" | "component" | "prop" | "method" | "token" | "type" | "other";
  name: string;
  deprecated_in: string | null;
  removed_in: string | null;
  replacement: {
    /**
     * `name` is a non-authoritative compatibility projection populated only
     * for a direct single target. Canonical identity is carried by target(s).
     */
    mode: "none" | "single" | "composite";
    target: ApiSymbolIdentity | null;
    targets: ApiSymbolIdentity[];
    type: string | null;
    name: string | null;
    notes: string | null;
  };
  migration: {
    strategy: "replace" | "remove" | "transform" | "manual" | "unspecified";
    value_map: DeprecationValueMap | null;
    /** Non-authoritative compatibility projection for legacy readers. */
    details: Array<{
      from: string;
      to: string;
    }>;
  };
  /** Repository-relative source files captured by the authored builder. */
  source_paths?: string[];
  /** Exact source occurrences; locations are provenance, never identity. */
  source_occurrences: DeprecationSourceOccurrence[];
  /** Public documentation routes or external HTTPS references. */
  source_urls: string[];
  inference?: {
    matched_component_names: string[];
    component_inferred: boolean;
    ambiguous_component_match: boolean;
  };
}

export interface RegistryArtifact<T> {
  generated_at: string | null;
  version: string;
  [key: string]: T[] | string | null;
}

export interface SaltRegistry {
  generated_at: string | null;
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
  sourceRevision?: string;
  generatorVersion?: string;
  generatorDigest?: string;
  enforceBudgets?: boolean;
}

export interface LoadRegistryOptions {
  registryDir?: string;
  /**
   * When `true`, verify the complete catalog, nested payloads, and recursive
   * references before returning. Defaults to `false`: only
   * catalog-manifest.json is read eagerly; semantic identity or collection
   * access triggers the same cached integrity barrier.
   *
   * Pass `true` from hosts that know they will touch most of the
   * registry and want a single bounded warm-up cost instead of per-touch
   * latency.
   */
  prefetch?: boolean;
}
