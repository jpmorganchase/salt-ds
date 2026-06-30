import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadRegistry } from "@salt-ds/semantic-core/registry/loadRegistry";
import type { SaltRegistry } from "@salt-ds/semantic-core/types";
import { pathExists } from "./common.js";

const cliModuleDir = path.dirname(fileURLToPath(import.meta.url));

export async function findAncestorWithChild(
  startPath: string,
  childSegments: string[],
): Promise<string | null> {
  let current = path.resolve(startPath);

  while (true) {
    const candidate = path.join(current, ...childSegments);
    if (await pathExists(candidate)) {
      return candidate;
    }

    const parent = path.dirname(current);
    if (parent === current) {
      return null;
    }

    current = parent;
  }
}

export async function resolveSemanticRegistry(
  cwd: string,
  explicitRegistryDir?: string,
  options: { prefetch?: boolean } = {},
): Promise<{
  registry: SaltRegistry;
  registryDir: string;
  registrySource: "explicit" | "bundled-cli" | "monorepo";
}> {
  const prefetch = options.prefetch === true;
  if (explicitRegistryDir) {
    const registryDir = path.resolve(cwd, explicitRegistryDir);
    if (!(await pathExists(registryDir))) {
      throw new Error(
        `Registry directory does not exist: ${explicitRegistryDir}`,
      );
    }
    return {
      registry: await loadRegistry({ registryDir, prefetch }),
      registryDir,
      registrySource: "explicit",
    };
  }

  // Published install: `generated/` was copied into the CLI tarball at pack
  // time from packages/semantic-core/generated via `publishExtraCopyPaths`.
  // Resolve from the CLI's own package root.
  const packageManifestPath = await findAncestorWithChild(cliModuleDir, [
    "package.json",
  ]);
  const bundledRegistryDir = packageManifestPath
    ? path.join(path.dirname(packageManifestPath), "generated")
    : null;
  if (bundledRegistryDir && (await pathExists(bundledRegistryDir))) {
    return {
      registry: await loadRegistry({
        registryDir: bundledRegistryDir,
        prefetch,
      }),
      registryDir: bundledRegistryDir,
      registrySource: "bundled-cli",
    };
  }

  // Monorepo dev: defer to semantic-core's own default registry path
  // (packages/semantic-core/generated). This is the single canonical
  // source — neither @salt-ds/cli nor @salt-ds/mcp maintains a per-package
  // copy any more.
  const registry = await loadRegistry({ prefetch });
  return {
    registry,
    registryDir: "(@salt-ds/semantic-core default)",
    registrySource: "monorepo",
  };
}

/**
 * Returns `{ prefetch: true }` when the CLI's `--prefetch` flag was set.
 * Use at every `resolveSemanticRegistry` call site so the global flag
 * reaches the lazy/eager toggle in @salt-ds/semantic-core consistently.
 *
 * Per Phase 0 task 0.2: lazy is the default; `--prefetch` is the opt-in
 * escape hatch for hosts that know they will touch most of the
 * registry and want a single bounded warm-up cost instead of per-touch
 * latency.
 */
export function readRegistryLoadOptionsFromFlags(
  flags: Record<string, string>,
): { prefetch?: boolean } {
  return flags.prefetch === "true" ? { prefetch: true } : {};
}

export async function detectSaltPackageVersion(
  cwd: string,
): Promise<string | null> {
  const manifestPath = await findAncestorWithChild(cwd, ["package.json"]);
  if (!manifestPath) {
    return null;
  }

  try {
    const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8")) as {
      dependencies?: Record<string, unknown>;
      devDependencies?: Record<string, unknown>;
      peerDependencies?: Record<string, unknown>;
    };
    const dependencyMaps = [
      manifest.dependencies,
      manifest.devDependencies,
      manifest.peerDependencies,
    ].filter(Boolean) as Array<Record<string, unknown>>;

    for (const dependencyMap of dependencyMaps) {
      const coreVersion = dependencyMap["@salt-ds/core"];
      if (typeof coreVersion === "string" && coreVersion.trim().length > 0) {
        return coreVersion.trim();
      }
    }

    for (const dependencyMap of dependencyMaps) {
      const firstSaltDependency = Object.entries(dependencyMap).find(
        ([packageName, version]) =>
          packageName.startsWith("@salt-ds/") &&
          typeof version === "string" &&
          version.trim().length > 0,
      );
      if (firstSaltDependency) {
        const [, version] = firstSaltDependency;
        return typeof version === "string" ? version.trim() : null;
      }
    }
  } catch {
    return null;
  }

  return null;
}
