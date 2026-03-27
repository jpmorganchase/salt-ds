import path from "node:path";
import { loadRegistry as loadSemanticRegistry } from "../../../semantic-core/src/registry/loadRegistry.js";
import type { LoadRegistryOptions, SaltRegistry } from "../types.js";
import { getPackageRoot } from "./paths.js";

export async function loadRegistry(
  options: LoadRegistryOptions = {},
): Promise<SaltRegistry> {
  const registryDir =
    options.registryDir ??
    path.join(getPackageRoot(import.meta.url), "generated");

  return loadSemanticRegistry({
    ...options,
    registryDir,
  });
}
