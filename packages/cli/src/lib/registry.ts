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
): Promise<{
  registry: SaltRegistry;
  registryDir: string;
  registrySource: "explicit" | "bundled-cli" | "monorepo";
}> {
  if (explicitRegistryDir) {
    const registryDir = path.resolve(cwd, explicitRegistryDir);
    if (!(await pathExists(registryDir))) {
      throw new Error(
        `Registry directory does not exist: ${explicitRegistryDir}`,
      );
    }
    return {
      registry: await loadRegistry({ registryDir }),
      registryDir,
      registrySource: "explicit",
    };
  }

  const packageManifestPath = await findAncestorWithChild(cliModuleDir, [
    "package.json",
  ]);
  const bundledRegistryDir = packageManifestPath
    ? path.join(path.dirname(packageManifestPath), "generated")
    : null;
  if (bundledRegistryDir && (await pathExists(bundledRegistryDir))) {
    return {
      registry: await loadRegistry({ registryDir: bundledRegistryDir }),
      registryDir: bundledRegistryDir,
      registrySource: "bundled-cli",
    };
  }

  for (const startPath of [cwd, cliModuleDir]) {
    const cliRegistryDir = await findAncestorWithChild(startPath, [
      "packages",
      "cli",
      "generated",
    ]);
    if (cliRegistryDir) {
      return {
        registry: await loadRegistry({ registryDir: cliRegistryDir }),
        registryDir: cliRegistryDir,
        registrySource: "monorepo",
      };
    }
  }

  throw new Error(
    "Could not resolve a Salt registry. Rebuild @salt-ds/cli or pass --registry-dir <path>.",
  );
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
