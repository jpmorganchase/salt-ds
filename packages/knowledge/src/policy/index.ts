export type ProjectConventionsContract = "project_conventions_v1";
export type ProjectConventionsStackContract = "project_conventions_stack_v1";

export type ProjectConventionsLayerScope =
  | "line_of_business"
  | "team"
  | "repo"
  | "other";

export type ProjectConventionsStackLayerSource = {
  type: "file";
  path: string;
};

export type ProjectConventionsStackLayerDefinition = {
  id: string;
  scope: ProjectConventionsLayerScope;
  source: ProjectConventionsStackLayerSource;
  description?: string;
  optional?: boolean;
};

export type ProjectConventionsStack = {
  $schema?: string;
  contract: ProjectConventionsStackContract;
  layers: ProjectConventionsStackLayerDefinition[];
  notes?: string[];
};

export type PreferredComponentConvention = {
  salt_name: string;
  prefer: string;
  reason: string;
  docs?: string[];
};

export type ProjectConventionImportReference = {
  from: string;
  name: string;
};

export type ApprovedWrapperConvention = {
  name: string;
  wraps: string;
  reason: string;
  import?: ProjectConventionImportReference;
  use_when?: string[];
  avoid_when?: string[];
  migration_shim?: boolean;
  docs?: string[];
};

export type TokenAliasConvention = {
  salt_name: string;
  prefer: string;
  reason: string;
  docs?: string[];
};

export type ThemeDefaultProp = {
  name: string;
  value: string;
};

export type ThemeDefaultProviderImport = {
  from: string;
  name: string;
};

export type BuiltInThemeDefaultProviderName =
  | "SaltProvider"
  | "SaltProviderNext";

type ThemeDefaultsConventionBase = {
  imports?: string[];
  props?: ThemeDefaultProp[];
  reason: string;
  docs?: string[];
};

export type ThemeDefaultsConvention =
  | (ThemeDefaultsConventionBase & {
      provider?: undefined;
      provider_import?: undefined;
    })
  | (ThemeDefaultsConventionBase & {
      provider: BuiltInThemeDefaultProviderName;
      provider_import?: ThemeDefaultProviderImport;
    })
  | (ThemeDefaultsConventionBase & {
      provider: string;
      provider_import: ThemeDefaultProviderImport;
    });

export type TokenFamilyPolicyMode =
  | "prefer-local-aliases"
  | "allow-local-aliases"
  | "canonical-only";

export type TokenFamilyPolicyConvention = {
  family: string;
  mode: TokenFamilyPolicyMode;
  reason: string;
  docs?: string[];
};

export type PatternPreferenceConvention = {
  intent: string;
  prefer: string;
  canonical_salt_start?: string;
  reason: string;
  docs?: string[];
};

export type BannedChoiceConvention = {
  name: string;
  reason: string;
  replacement?: string;
  docs?: string[];
};

export type ProjectConventions = {
  $schema?: string;
  contract?: ProjectConventionsContract;
  id?: string;
  version?: string;
  project?: string;
  supported_salt_range?: string;
  preferred_components?: PreferredComponentConvention[];
  approved_wrappers?: ApprovedWrapperConvention[];
  token_aliases?: TokenAliasConvention[];
  theme_defaults?: ThemeDefaultsConvention;
  token_family_policies?: TokenFamilyPolicyConvention[];
  pattern_preferences?: PatternPreferenceConvention[];
  banned_choices?: BannedChoiceConvention[];
  notes?: string[];
};
