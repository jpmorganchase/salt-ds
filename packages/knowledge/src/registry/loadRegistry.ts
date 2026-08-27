import path from "node:path";
import {
  type CatalogStoreV2,
  createCatalogStoreV2,
} from "../catalog/catalogStoreV2.js";
import {
  createReviewCatalogFromStore,
  type ReviewCatalog,
} from "../review/reviewCatalogAdapter.js";
import type { LoadRegistryOptions, SaltRegistry } from "../types.js";
import { createLazyRegistry } from "./lazyRegistry.js";
import { getPackageRoot } from "./paths.js";

export interface SaltCatalogRuntimeContext {
  store: CatalogStoreV2;
  reviewCatalog: ReviewCatalog;
}

export async function loadCatalogRuntimeContext(
  options: LoadRegistryOptions = {},
): Promise<SaltCatalogRuntimeContext> {
  const registryDir =
    options.registryDir ??
    path.join(getPackageRoot(import.meta.url), "generated");
  const store = createCatalogStoreV2({ registryDir });
  store.ensureCatalogVerified();
  return { store, reviewCatalog: createReviewCatalogFromStore(store) };
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
  const registryDir =
    options.registryDir ??
    path.join(getPackageRoot(import.meta.url), "generated");
  return createLazyRegistry({
    registryDir,
    prefetch: options.prefetch === true,
  }).registry;
}
