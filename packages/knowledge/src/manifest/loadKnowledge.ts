import path from "node:path";
import { getPackageRoot } from "../registry/paths.js";
import {
  createReviewCatalogFromStore,
  type ReviewCatalog,
} from "../review/reviewCatalogAdapter.js";
import {
  createKnowledgeStore,
  type KnowledgeStore,
} from "./knowledgeStore.js";

export interface KnowledgeRuntimeContext {
  store: KnowledgeStore;
  reviewCatalog: ReviewCatalog;
}

export async function loadKnowledgeRuntimeContext(
  options: { bundleDir?: string } = {},
): Promise<KnowledgeRuntimeContext> {
  const bundleDir = options.bundleDir ?? getPackageRoot(import.meta.url);
  const store = createKnowledgeStore({ bundleDir: path.resolve(bundleDir) });
  store.prefetch({ verifyEveryContentObject: true });
  return { store, reviewCatalog: createReviewCatalogFromStore(store) };
}
