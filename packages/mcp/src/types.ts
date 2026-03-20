export type SaltStatus = "stable" | "beta" | "lab" | "deprecated";

export type SearchArea =
  | "all"
  | "packages"
  | "components"
  | "icons"
  | "country_symbols"
  | "pages"
  | "foundations"
  | "patterns"
  | "guides"
  | "tokens"
  | "examples"
  | "changes";

export type ChangeKind =
  | "added"
  | "changed"
  | "fixed"
  | "deprecated"
  | "removed";

export type ChangeReleaseType = "major" | "minor" | "patch" | "unknown";

export type ChangeTargetType = "package" | "component";

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

export interface ComponentTokenInference {
  source: "repo_scan" | "none";
  discovered_count: number;
  returned_count: number;
  max_returned: number;
  truncated: boolean;
}

export interface ComponentDeprecationInference {
  matched_count: number;
  inferred_component_count: number;
  ambiguous_match_count: number;
}

export interface ComponentInference {
  docgen?: ComponentDocgenInference;
  tokens?: ComponentTokenInference;
  deprecations?: ComponentDeprecationInference;
}

export interface ExampleRecord {
  id: string;
  title: string;
  intent: string[];
  complexity: "basic" | "intermediate" | "advanced";
  code: string;
  source_url: string | null;
  package: string | null;
  target_type: "component" | "pattern";
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
  accessibility: {
    summary: string[];
    rules: AccessibilityRule[];
  };
  tokens: Array<{
    name: string;
    category: string;
    semantic_intent: string | null;
  }>;
  patterns: string[];
  examples: ExampleRecord[];
  related_docs: {
    overview: string | null;
    usage: string | null;
    accessibility: string | null;
    examples: string | null;
  };
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
  last_verified_at: string;
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

export interface ChangeRecord {
  id: string;
  package: string;
  target_type: ChangeTargetType;
  target_name: string;
  version: string;
  release_type: ChangeReleaseType;
  kind: ChangeKind;
  summary: string;
  details: string;
  source_urls: string[];
  inference?: {
    matched_by: "component_name" | "package_default";
    confidence: "high" | "medium" | "low";
  };
  last_verified_at: string;
}

export interface SearchIndexEntry {
  id: string;
  type:
    | "package"
    | "component"
    | "icon"
    | "country_symbol"
    | "page"
    | "pattern"
    | "guide"
    | "token"
    | "example"
    | "change";
  name: string;
  package: string | null;
  status: SaltStatus | null;
  summary: string;
  source_url: string | null;
  keywords: string[];
}

export interface RegistryArtifact<T> {
  generated_at: string;
  version: string;
  [key: string]: T[] | string;
}

export interface SaltRegistry {
  generated_at: string;
  version: string;
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
  changes: ChangeRecord[];
  search_index: SearchIndexEntry[];
}

export interface BuildRegistryOptions {
  sourceRoot?: string;
  outputDir?: string;
  version?: string;
  timestamp?: string;
}

export interface LoadRegistryOptions {
  registryDir?: string;
}
