import fs from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  loadRegistry,
  type SaltRegistry,
} from "../../../semantic-core/src/index.js";
import { pathExists } from "./common.js";

const require = createRequire(import.meta.url);
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
  registrySource: "explicit" | "installed-mcp" | "monorepo";
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

  try {
    const mcpManifestPath = require.resolve("@salt-ds/mcp/package.json", {
      paths: [cwd, cliModuleDir],
    });
    const registryDir = path.join(path.dirname(mcpManifestPath), "generated");
    if (await pathExists(registryDir)) {
      return {
        registry: await loadRegistry({ registryDir }),
        registryDir,
        registrySource: "installed-mcp",
      };
    }
  } catch {
    // Fall through to monorepo resolution.
  }

  for (const startPath of [cwd, cliModuleDir]) {
    const registryDir = await findAncestorWithChild(startPath, [
      "packages",
      "mcp",
      "generated",
    ]);
    if (registryDir) {
      return {
        registry: await loadRegistry({ registryDir }),
        registryDir,
        registrySource: "monorepo",
      };
    }
  }

  throw new Error(
    "Could not resolve a Salt registry. Install @salt-ds/mcp alongside the CLI or pass --registry-dir <path>.",
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
