import path from "node:path";
import type { LoadRegistryOptions, SaltRegistry } from "../types.js";
import { createLazyRegistry } from "./lazyRegistry.js";
import { getPackageRoot } from "./paths.js";

export { clearArtifactCache, configureArtifactCache } from "./artifactCache.js";

/**
 * Async signature preserved for backwards compatibility with every
 * existing call site (`await loadRegistry({ registryDir })`).
 *
 * Implementation note (Phase 0 task 0.2): the returned object is a
 * Proxy-backed lazy registry. Eagerly seeds `generated_at` / `version`
 * (and `build_info`) from `metadata.json` only — typically a few KB.
 * Every other field (components, patterns, tokens, examples, indexes,
 * rule packs) loads from disk on first property touch.
 *
 * Pass `prefetch: true` to restore the legacy "read everything up
 * front" behaviour. This is the option hosts should pick when they
 * know they will need most of the registry and want a single bounded
 * warm-up cost instead of per-touch latency.
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
