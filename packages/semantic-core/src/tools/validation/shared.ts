export type ValidationSeverity = "info" | "warning" | "error";

export type ValidationCategory =
  | "primitive-choice"
  | "composition"
  | "accessibility"
  | "tokens"
  | "deprecated"
  | "catalog-status";

export interface ValidationIssueTokenRecommendation {
  query: string;
  category?: string;
  top_k?: number;
}

export interface ValidationIssueFixHints {
  related_components?: string[];
  guide_lookups?: string[];
  extra_steps?: string[];
  token_recommendation?: ValidationIssueTokenRecommendation;
}

export interface ValidationIssue {
  id: string;
  category: ValidationCategory;
  rule: string;
  severity: ValidationSeverity;
  title: string;
  message: string;
  evidence: string[];
  canonical_source: string | null;
  suggested_fix: string | null;
  confidence: number;
  source_urls: string[];
  matches: number;
  fix_hints?: ValidationIssueFixHints;
}

export interface ValidationIssueDescriptor {
  category: ValidationCategory;
  rule: string;
  severity: ValidationSeverity;
  title: string;
  message: string;
  suggested_fix: string | null;
  confidence: number;
  canonical_source: string | null;
  source_urls?: string[];
  canonical_guide_lookup?: string | null;
  fix_hints?: ValidationIssueFixHints;
}
