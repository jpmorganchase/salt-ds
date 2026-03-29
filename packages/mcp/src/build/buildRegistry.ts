import path from "node:path";
import { buildRegistry as buildSemanticRegistry } from "../../../semantic-core/src/build/buildRegistry.js";
import { getPackageRoot } from "../registry/paths.js";
import type { BuildRegistryOptions, SaltRegistry } from "../types.js";

export async function buildRegistry(
  options: BuildRegistryOptions = {},
): Promise<SaltRegistry> {
  const outputDir =
    options.outputDir ??
    path.join(getPackageRoot(import.meta.url), "generated");

  return buildSemanticRegistry({
    ...options,
    outputDir,
  });
}
