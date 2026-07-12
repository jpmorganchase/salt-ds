import path from "node:path";
import type { LoadRegistryOptions, SaltRegistry } from "../types.js";
import { createLazyRegistry } from "./lazyRegistry.js";
import { getPackageRoot } from "./paths.js";

export { clearArtifactCache, configureArtifactCache } from "./artifactCache.js";

/**
 * Returns a Proxy-backed lazy registry. It eagerly seeds `generated_at`,
 * `version`, `semantic_hash`, and `build_info` from `metadata.json`; every other collection
 * loads from disk on first access.
 * Every other field (components, patterns, tokens, examples, indexes,
 * rule packs) loads from disk on first property touch.
 *
 * Pass `prefetch: true` when a host will need most collections and prefers one
 * bounded warm-up cost over per-collection latency.
 */
export async function loadRegistry(
  options: LoadRegistryOptions = {},
): Promise<SaltRegistry> {
  const packageRoot = getPackageRoot(import.meta.url);
  const registryDir =
    options.registryDir ?? path.join(packageRoot, "generated");

  const { registry } = createLazyRegistry({
    registryDir,
    prefetch: options.prefetch === true,
  });

  return registry;
}
