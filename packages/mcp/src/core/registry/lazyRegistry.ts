import { CatalogRegistryProjection } from "../catalog/catalogRegistryProjection.js";
import {
  __getCatalogFileReadCountForTests,
  __resetCatalogFileReadCountsForTests,
  type CatalogStoreV2,
  createCatalogStoreV2,
} from "../catalog/catalogStoreV2.js";
import type { SaltRegistry } from "../types.js";
import {
  registerSaltRegistryFingerprintVerifier,
  registerVerifiedSaltRegistryFingerprint,
} from "./fingerprint.js";

export {
  __getCatalogFileReadCountForTests as __getFileReadCountForTests,
  __resetCatalogFileReadCountsForTests as __resetFileReadCountsForTests,
};

export interface LazyRegistryState {
  registryDir: string;
  store: CatalogStoreV2;
  projection: CatalogRegistryProjection;
}

interface CreateLazyRegistryOptions {
  registryDir: string;
  prefetch?: boolean;
}

/**
 * Creates the remaining in-process registry view from the canonical catalog.
 * The catalog manifest is the only eager artifact read. The first semantic or
 * collection access crosses a cached whole-catalog integrity barrier before
 * any manifest digest is trusted as a verified registry fingerprint.
 */
export function createLazyRegistry(options: CreateLazyRegistryOptions): {
  registry: SaltRegistry;
  state: LazyRegistryState;
} {
  const store = createCatalogStoreV2({
    registryDir: options.registryDir,
  });
  const prefetch = options.prefetch === true;
  if (prefetch) {
    store.ensureCatalogVerified();
  }
  const projection = new CatalogRegistryProjection(store);
  const registry = projection.asRegistry({
    prefetch,
    beforeDataAccess: () => {
      store.ensureCatalogVerified();
    },
  });
  if (prefetch) {
    registerVerifiedSaltRegistryFingerprint(
      registry,
      store.manifest.semantic_digest,
    );
  } else {
    registerSaltRegistryFingerprintVerifier(
      registry,
      store.manifest.semantic_digest,
      () => {
        store.ensureCatalogVerified();
      },
    );
  }
  return {
    registry,
    state: {
      registryDir: options.registryDir,
      store,
      projection,
    },
  };
}
