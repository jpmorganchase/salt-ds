/**
 * Canonical catalog extraction never consumes or emits CSS source maps.
 *
 * PostCSS treats missing constructors as source-map support being unavailable,
 * which keeps repository source-map annotations from introducing untracked
 * reads and excludes source-map-js's runtime code generation/randomized sort.
 */
export const SourceMapConsumer = undefined;
export const SourceMapGenerator = undefined;
