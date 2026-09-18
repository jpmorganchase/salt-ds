export const NON_PRODUCTION_IMPLEMENTATION_GLOB_IGNORES = [
  "**/__tests__/**",
  "**/*.spec.*",
  "**/*.test.*",
  "**/*.stories.*",
] as const;

export {
  CONSUMED_PATTERN_STORY_GLOB,
  isSemanticCatalogSourcePath,
} from "../catalog/catalogSemanticSource.js";
