export const NON_PRODUCTION_IMPLEMENTATION_GLOB_IGNORES = [
  "**/__tests__/**",
  "**/*.spec.*",
  "**/*.test.*",
  "**/*.stories.*",
  "**/dist-cjs/**",
  "**/dist-es/**",
  "**/dist-types/**",
  // These CSS-only packages publish bundled root copies of their src styles.
  "packages/ag-grid-theme/salt-ag-theme.css",
  "packages/react-resizable-panels-theme/index.css",
] as const;

export {
  CONSUMED_PATTERN_STORY_GLOB,
  isSemanticCatalogSourcePath,
} from "../catalog/catalogSemanticSource.js";
