import fs from "node:fs";
import path from "node:path";
import micromatch from "micromatch";
import { KNOWLEDGE_PACKAGE_FAMILIES } from "../schemas/knowledgeManifestV1.js";

export type SaltInstallLayout =
  | "npm"
  | "yarn-classic-node-modules"
  | "yarn-berry-node-modules"
  | "pnpm"
  | "bun"
  | "yarn-pnp"
  | "unknown";

export type SaltInstallLimitation =
  | "SALT_LOCKFILE_AMBIGUOUS"
  | "SALT_LOCKFILE_UNSUPPORTED_VERSION"
  | "SALT_RESOLVED_PATH_OUTSIDE_ROOT"
  | "SALT_LAYOUT_BUN_UNSUPPORTED"
  | "SALT_LAYOUT_YARN_PNP_UNSUPPORTED"
  | "SALT_LAYOUT_CUSTOM_UNSUPPORTED"
  | "SALT_PACKAGE_VECTOR_INCOMPATIBLE";

export interface InstalledSaltPackageEvidence {
  name: string;
  version: string | null;
  manifest_path: string | null;
  real_path: string | null;
  contained: boolean;
  locator_count: number;
}

export interface InstalledSaltPackageResolution {
  project_root: string;
  authority_root: string;
  layout: SaltInstallLayout;
  exact: boolean;
  package_manager: string | null;
  lockfile: { path: string; version: string | null } | null;
  packages: InstalledSaltPackageEvidence[];
  limitations: SaltInstallLimitation[];
}

function exists(filePath: string): boolean {
  try {
    return fs.lstatSync(filePath).isFile();
  } catch {
    return false;
  }
}

function readJson(filePath: string): any | null {
  try {
    const stats = fs.lstatSync(filePath);
    if (!stats.isFile() || stats.isSymbolicLink() || stats.size > 8 * 1024 * 1024) {
      return null;
    }
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function contained(root: string, candidate: string): boolean {
  const relative = path.relative(path.resolve(root), path.resolve(candidate));
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function workspacePatterns(manifest: any): string[] {
  const value = manifest?.workspaces;
  if (Array.isArray(value)) return value.filter((entry) => typeof entry === "string");
  return Array.isArray(value?.packages)
    ? value.packages.filter((entry: unknown) => typeof entry === "string")
    : [];
}

function isWorkspaceAuthority(candidate: string, projectRoot: string): boolean {
  if (path.resolve(candidate) === path.resolve(projectRoot)) return true;
  const relative = path.relative(candidate, projectRoot).replaceAll("\\", "/");
  if (relative.startsWith("../") || relative === "") return false;
  const patterns = workspacePatterns(readJson(path.join(candidate, "package.json")));
  return patterns.length > 0 && micromatch.isMatch(relative, patterns);
}

function markerKinds(directory: string): string[] {
  const markers: string[] = [];
  if (exists(path.join(directory, "package-lock.json"))) markers.push("npm");
  if (exists(path.join(directory, "pnpm-lock.yaml"))) markers.push("pnpm");
  if (exists(path.join(directory, "bun.lock")) || exists(path.join(directory, "bun.lockb"))) {
    markers.push("bun");
  }
  if (exists(path.join(directory, "yarn.lock"))) markers.push("yarn");
  return markers;
}

function findAuthorityRoot(projectRoot: string): string {
  let current = path.resolve(projectRoot);
  for (let depth = 0; depth <= 32; depth += 1) {
    if (markerKinds(current).length > 0 && isWorkspaceAuthority(current, projectRoot)) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return path.resolve(projectRoot);
}

function packageManager(authorityRoot: string): string | null {
  const value = readJson(path.join(authorityRoot, "package.json"))?.packageManager;
  return typeof value === "string" ? value : null;
}

function yarnNodeLinker(authorityRoot: string): string | null {
  const filePath = path.join(authorityRoot, ".yarnrc.yml");
  if (!exists(filePath)) return null;
  return /^\s*nodeLinker\s*:\s*([^\s#]+)\s*(?:#.*)?$/mu.exec(
    fs.readFileSync(filePath, "utf8"),
  )?.[1] ?? null;
}

function lockEvidence(
  authorityRoot: string,
  marker: string | null,
  manager: string | null,
): {
  layout: SaltInstallLayout;
  lockfile: { path: string; version: string | null } | null;
  supported: boolean;
} {
  if (exists(path.join(authorityRoot, ".pnp.cjs"))) {
    return { layout: "yarn-pnp", lockfile: null, supported: false };
  }
  if (marker === "bun") {
    const file = exists(path.join(authorityRoot, "bun.lock")) ? "bun.lock" : "bun.lockb";
    return { layout: "bun", lockfile: { path: file, version: null }, supported: false };
  }
  if (marker === "npm") {
    const lock = readJson(path.join(authorityRoot, "package-lock.json"));
    const version = Number.isSafeInteger(lock?.lockfileVersion)
      ? String(lock.lockfileVersion)
      : null;
    return {
      layout: "npm",
      lockfile: { path: "package-lock.json", version },
      supported:
        version === "3" &&
        typeof manager === "string" &&
        /^npm@(?:10|11)\.\d+\.\d+$/u.test(manager),
    };
  }
  if (marker === "pnpm") {
    const source = fs.readFileSync(path.join(authorityRoot, "pnpm-lock.yaml"), "utf8");
    const version = /^lockfileVersion:\s*['"]?([^'"\s]+)['"]?\s*$/mu.exec(source)?.[1] ?? null;
    return {
      layout: "pnpm",
      lockfile: { path: "pnpm-lock.yaml", version },
      supported:
        version === "9.0" &&
        typeof manager === "string" &&
        /^pnpm@(?:9|10)\.\d+\.\d+$/u.test(manager),
    };
  }
  if (marker === "yarn") {
    const source = fs.readFileSync(path.join(authorityRoot, "yarn.lock"), "utf8");
    const berryVersion = /^\s{2}version:\s*(\d+)\s*$/mu.exec(source)?.[1] ?? null;
    const classic = /yarn lockfile v1/iu.test(source);
    if (classic) {
      return {
        layout: "yarn-classic-node-modules",
        lockfile: { path: "yarn.lock", version: "1" },
        supported:
          typeof manager === "string" && /^yarn@1\.22\.\d+$/u.test(manager),
      };
    }
    return {
      layout: "yarn-berry-node-modules",
      lockfile: { path: "yarn.lock", version: berryVersion },
      supported:
        berryVersion === "8" &&
        yarnNodeLinker(authorityRoot) === "node-modules" &&
        typeof manager === "string" &&
        /^yarn@4\.17\.\d+$/u.test(manager),
    };
  }
  return { layout: "unknown", lockfile: null, supported: false };
}

function packageLocators(
  projectRoot: string,
  authorityRoot: string,
  packageName: string,
): string[] {
  const locators = new Set<string>();
  let current = path.resolve(projectRoot);
  while (contained(authorityRoot, current)) {
    const candidate = path.join(
      current,
      "node_modules",
      ...packageName.split("/"),
      "package.json",
    );
    if (exists(candidate)) locators.add(candidate);
    if (current === path.resolve(authorityRoot)) break;
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return [...locators];
}

export function resolveInstalledSaltPackages(
  projectRoot: string,
): InstalledSaltPackageResolution {
  const root = path.resolve(projectRoot);
  const authorityRoot = findAuthorityRoot(root);
  const markers = markerKinds(authorityRoot);
  const manager = packageManager(authorityRoot);
  const ambiguousMarkers = new Set(markers).size > 1;
  const evidence = lockEvidence(
    authorityRoot,
    markers.length === 1 ? markers[0]! : null,
    manager,
  );
  const limitations = new Set<SaltInstallLimitation>();
  if (ambiguousMarkers) limitations.add("SALT_LOCKFILE_AMBIGUOUS");
  if (evidence.layout === "bun") limitations.add("SALT_LAYOUT_BUN_UNSUPPORTED");
  else if (evidence.layout === "yarn-pnp") {
    limitations.add("SALT_LAYOUT_YARN_PNP_UNSUPPORTED");
  } else if (evidence.layout === "unknown") {
    limitations.add("SALT_LAYOUT_CUSTOM_UNSUPPORTED");
  } else if (!evidence.supported) {
    limitations.add("SALT_LOCKFILE_UNSUPPORTED_VERSION");
  }

  const packages = KNOWLEDGE_PACKAGE_FAMILIES.map((name) => {
    const locators = packageLocators(root, authorityRoot, name);
    if (locators.length === 0) {
      return {
        name,
        version: null,
        manifest_path: null,
        real_path: null,
        contained: false,
        locator_count: 0,
      };
    }
    if (locators.length > 1) limitations.add("SALT_LOCKFILE_AMBIGUOUS");
    const manifestPath = locators[0]!;
    let realPath: string | null = null;
    try {
      realPath = fs.realpathSync(manifestPath);
    } catch {
      limitations.add("SALT_PACKAGE_VECTOR_INCOMPATIBLE");
    }
    const isContained = realPath !== null && contained(authorityRoot, realPath);
    if (!isContained) limitations.add("SALT_RESOLVED_PATH_OUTSIDE_ROOT");
    const manifest = realPath ? readJson(realPath) : null;
    const version =
      manifest?.name === name && typeof manifest.version === "string"
        ? manifest.version
        : null;
    if (version === null) limitations.add("SALT_PACKAGE_VECTOR_INCOMPATIBLE");
    return {
      name,
      version,
      manifest_path: path.relative(authorityRoot, manifestPath).replaceAll("\\", "/"),
      real_path: realPath,
      contained: isContained,
      locator_count: locators.length,
    };
  });
  if (
    packages.find((entry) => entry.name === "@salt-ds/core")?.version === null
  ) {
    limitations.add("SALT_PACKAGE_VECTOR_INCOMPATIBLE");
  }

  return {
    project_root: root,
    authority_root: authorityRoot,
    layout: evidence.layout,
    exact:
      [
        "npm",
        "yarn-classic-node-modules",
        "yarn-berry-node-modules",
        "pnpm",
      ].includes(evidence.layout) &&
      evidence.supported &&
      limitations.size === 0,
    package_manager: manager,
    lockfile: evidence.lockfile,
    packages,
    limitations: [...limitations].sort(),
  };
}
