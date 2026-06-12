import path from "node:path";
import { fileURLToPath } from "node:url";
import fsPromises from "node:fs/promises";
import { loadRegistry as loadSemanticRegistry } from "@salt-ds/semantic-core/registry/loadRegistry";
import type {
  LoadRegistryOptions,
  SaltRegistry,
} from "@salt-ds/semantic-core/types";

const mcpModuleDir = path.dirname(fileURLToPath(import.meta.url));

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fsPromises.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function findPackageRoot(startDir: string): Promise<string | null> {
  let current = path.resolve(startDir);
  while (true) {
    if (await pathExists(path.join(current, "package.json"))) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

/**
 * Thin wrapper around semantic-core's loadRegistry. Resolution order:
 *
 * 1. Caller-supplied `options.registryDir` (used by fixture tests).
 * 2. Published install: `<mcp-package-root>/generated/`, copied at pack
 *    time from packages/semantic-core/generated/ via publishExtraCopyPaths.
 * 3. Monorepo dev: defer to semantic-core's own default
 *    (packages/semantic-core/generated/).
 *
 * Neither @salt-ds/mcp nor @salt-ds/cli maintains a per-package
 * generated/ source any more; there is one canonical bundle.
 */
export async function loadRegistry(
  options: LoadRegistryOptions = {},
): Promise<SaltRegistry> {
  if (options.registryDir) {
    return loadSemanticRegistry(options);
  }

  const packageRoot = await findPackageRoot(mcpModuleDir);
  const bundledRegistryDir = packageRoot
    ? path.join(packageRoot, "generated")
    : null;
  if (bundledRegistryDir && (await pathExists(bundledRegistryDir))) {
    return loadSemanticRegistry({ ...options, registryDir: bundledRegistryDir });
  }

  return loadSemanticRegistry(options);
}
