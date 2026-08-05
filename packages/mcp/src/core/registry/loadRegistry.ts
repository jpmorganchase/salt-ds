import path from "node:path";
import type { CatalogStoreV2 } from "../catalog/catalogStoreV2.js";
import type { LoadRegistryOptions, SaltRegistry } from "../types.js";
import { createLazyRegistry } from "./lazyRegistry.js";
import { getPackageRoot } from "./paths.js";

export interface SaltCatalogRuntimeContext {
  registry: SaltRegistry;
  store: CatalogStoreV2;
}

export async function loadCatalogRuntimeContext(
  options: LoadRegistryOptions = {},
): Promise<SaltCatalogRuntimeContext> {
  const packageRoot = getPackageRoot(import.meta.url);
  const registryDir =
    options.registryDir ?? path.join(packageRoot, "generated");
  const { registry, state } = createLazyRegistry({
    registryDir,
    prefetch: options.prefetch === true,
  });

  return { registry, store: state.store };
}

/**
 * Returns a projection over Salt catalog schema v2. Only
 * `catalog-manifest.json` is read eagerly. Compatibility metadata stays
 * manifest-only; semantic identity and collection access cross a cached,
 * whole-catalog integrity barrier.
 *
 * Pass `prefetch: true` to cross that barrier before the registry escapes.
 */
export async function loadRegistry(
  options: LoadRegistryOptions = {},
): Promise<SaltRegistry> {
  return (await loadCatalogRuntimeContext(options)).registry;
}
