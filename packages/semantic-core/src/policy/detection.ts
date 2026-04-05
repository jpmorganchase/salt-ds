import fs from "node:fs/promises";
import path from "node:path";
import type {
  ProjectConventionsLayerScope,
  ProjectConventionsStackLayerSource,
} from "./index.js";
import type { ProjectConventionsPackCompatibility } from "./layerDiagnostics.js";
import {
  resolveProjectConventionsFileLayer,
  resolveProjectConventionsPackageLayer,
} from "./layerDiagnostics.js";

export type ProjectPolicyDetailLevel = "summary" | "resolved";

export interface DetectedProjectPolicyLayerResolution {
  status: "resolved" | "missing" | "unreadable" | "invalid";
  resolvedPath: string | null;
  packageName: string | null;
  exportName: string | null;
  version: string | null;
  packageVersion: string | null;
  conventionsVersion: string | null;
  contract: string | null;
  project: string | null;
  packId: string | null;
  supportedSaltRange: string | null;
  compatibility: ProjectConventionsPackCompatibility | null;
  reason: string | null;
}

export interface DetectedProjectPolicyLayer {
  id: string;
  scope: ProjectConventionsLayerScope;
  sourceType: "file" | "package";
  source: string;
  optional: boolean;
  resolution: DetectedProjectPolicyLayerResolution;
}

export interface DetectedProjectSharedConventionsPackDetail {
  id: string;
  source: string;
  packageName: string | null;
  exportName: string | null;
  version: string | null;
  packageVersion: string | null;
  conventionsVersion: string | null;
  packId: string | null;
  supportedSaltRange: string | null;
  status: "resolved" | "missing" | "unreadable" | "invalid";
  compatibility: ProjectConventionsPackCompatibility | null;
  resolvedPath: string | null;
  reason: string | null;
}

export interface DetectedProjectPolicy {
  teamConfigPath: string | null;
  stackConfigPath: string | null;
  mode: "none" | "team" | "stack";
  approvedWrappers: string[];
  stackLayers: DetectedProjectPolicyLayer[];
  sharedConventions: {
    enabled: boolean;
    packCount: number;
    packs: string[];
    packDetails: DetectedProjectSharedConventionsPackDetail[];
  };
  notes: string[];
}

interface StackLayerLike {
  id?: unknown;
  scope?: unknown;
  optional?: unknown;
  source?: unknown;
}

interface StackLike {
  layers?: unknown;
}

interface NormalizedStackLayer {
  id: string;
  scope: ProjectConventionsLayerScope;
  sourceType: "file" | "package";
  source: string;
  optional: boolean;
  filePath?: string;
  packageSpecifier?: string;
  exportName?: string;
}

function isProjectConventionsLayerScope(
  value: unknown,
): value is ProjectConventionsLayerScope {
  return (
    value === "line_of_business" ||
    value === "team" ||
    value === "repo" ||
    value === "other"
  );
}

function isProjectConventionsStackLayerSource(
  value: unknown,
): value is ProjectConventionsStackLayerSource {
  return value !== null && typeof value === "object" && "type" in value;
}

async function pathExists(candidatePath: string): Promise<boolean> {
  try {
    await fs.access(candidatePath);
    return true;
  } catch {
    return false;
  }
}

async function readApprovedWrappers(teamConfigPath: string): Promise<string[]> {
  try {
    const teamConfig = JSON.parse(
      await fs.readFile(teamConfigPath, "utf8"),
    ) as { approved_wrappers?: unknown };
    if (!Array.isArray(teamConfig.approved_wrappers)) {
      return [];
    }

    return teamConfig.approved_wrappers.filter(
      (value): value is string =>
        typeof value === "string" && value.trim().length > 0,
    );
  } catch {
    return [];
  }
}

async function normalizeStackLayers(
  stackConfigPath: string,
  notes: string[],
): Promise<NormalizedStackLayer[]> {
  if (!(await pathExists(stackConfigPath))) {
    return [];
  }

  try {
    const stackConfig = JSON.parse(
      await fs.readFile(stackConfigPath, "utf8"),
    ) as StackLike;
    const stackConfigDir = path.dirname(stackConfigPath);

    return Array.isArray(stackConfig.layers)
      ? stackConfig.layers.flatMap<NormalizedStackLayer>((layer) => {
          if (!layer || typeof layer !== "object") {
            return [];
          }

          const candidate = layer as StackLayerLike;
          if (
            typeof candidate.id !== "string" ||
            !isProjectConventionsLayerScope(candidate.scope)
          ) {
            return [];
          }

          const source = candidate.source;
          if (!isProjectConventionsStackLayerSource(source)) {
            return [];
          }

          if (source.type === "file" && typeof source.path === "string") {
            return [
              {
                id: candidate.id,
                scope: candidate.scope,
                sourceType: "file",
                source: source.path,
                optional: candidate.optional === true,
                filePath: path.resolve(stackConfigDir, source.path),
              },
            ];
          }

          if (
            source.type === "package" &&
            typeof source.specifier === "string"
          ) {
            return [
              {
                id: candidate.id,
                scope: candidate.scope,
                sourceType: "package",
                source: source.export
                  ? `${source.specifier}#${source.export}`
                  : source.specifier,
                optional: candidate.optional === true,
                packageSpecifier: source.specifier,
                exportName: source.export,
              },
            ];
          }

          return [];
        })
      : [];
  } catch {
    notes.push(
      "Detected .salt/stack.json but could not parse layered project conventions.",
    );
    return [];
  }
}

function toResolutionSummary(input: {
  status: "resolved" | "missing" | "unreadable" | "invalid";
  resolvedPath: string | null;
  packageName: string | null;
  exportName: string | null;
  version: string | null;
  packageVersion: string | null;
  conventionsVersion: string | null;
  contract: string | null;
  project: string | null;
  packId: string | null;
  supportedSaltRange: string | null;
  compatibility: ProjectConventionsPackCompatibility | null;
  reason: string | null;
}): DetectedProjectPolicyLayerResolution {
  return {
    status: input.status,
    resolvedPath: input.resolvedPath,
    packageName: input.packageName,
    exportName: input.exportName,
    version: input.version,
    packageVersion: input.packageVersion,
    conventionsVersion: input.conventionsVersion,
    contract: input.contract,
    project: input.project,
    packId: input.packId,
    supportedSaltRange: input.supportedSaltRange,
    compatibility: input.compatibility,
    reason: input.reason,
  };
}

async function resolveStackLayers(input: {
  rootDir: string;
  currentSaltVersion: string | null;
  normalizedStackLayers: NormalizedStackLayer[];
  notes: string[];
}): Promise<DetectedProjectPolicyLayer[]> {
  return Promise.all(
    input.normalizedStackLayers.map(async (layer) => {
      if (layer.sourceType === "file") {
        const resolvedPath =
          layer.filePath ?? path.resolve(input.rootDir, layer.source);
        const resolution = await resolveProjectConventionsFileLayer({
          filePath: resolvedPath,
          currentSaltVersion: input.currentSaltVersion,
          optional: layer.optional,
        });
        if (resolution.reason) {
          input.notes.push(resolution.reason);
        }

        return {
          id: layer.id,
          scope: layer.scope,
          sourceType: layer.sourceType,
          source: layer.source,
          optional: layer.optional,
          resolution: toResolutionSummary({
            status: resolution.status,
            resolvedPath: resolution.resolvedPath,
            packageName: resolution.packageName,
            exportName: resolution.exportName,
            version: resolution.metadata.version,
            packageVersion: resolution.packageVersion,
            conventionsVersion: resolution.metadata.version,
            contract: resolution.metadata.contract,
            project: resolution.metadata.project,
            packId: resolution.metadata.id,
            supportedSaltRange: resolution.metadata.supportedSaltRange,
            compatibility: resolution.compatibility,
            reason: resolution.reason,
          }),
        };
      }

      const packageSpecifier = layer.packageSpecifier ?? layer.source;
      const resolution = await resolveProjectConventionsPackageLayer({
        rootDir: input.rootDir,
        specifier: packageSpecifier,
        exportName: layer.exportName,
        currentSaltVersion: input.currentSaltVersion,
        optional: layer.optional,
      });
      if (resolution.reason) {
        input.notes.push(resolution.reason);
      }

      return {
        id: layer.id,
        scope: layer.scope,
        sourceType: layer.sourceType,
        source: layer.source,
        optional: layer.optional,
        resolution: toResolutionSummary({
          status: resolution.status,
          resolvedPath: resolution.resolvedPath,
          packageName: resolution.packageName,
          exportName: resolution.exportName,
          version: resolution.packageVersion,
          packageVersion: resolution.packageVersion,
          conventionsVersion: resolution.metadata.version,
          contract: resolution.metadata.contract,
          project: resolution.metadata.project,
          packId: resolution.metadata.id,
          supportedSaltRange: resolution.metadata.supportedSaltRange,
          compatibility: resolution.compatibility,
          reason: resolution.reason,
        }),
      };
    }),
  );
}

export async function detectProjectPolicy(
  rootDir: string,
  currentSaltVersion: string | null,
  options: {
    detailLevel?: ProjectPolicyDetailLevel;
  } = {},
): Promise<DetectedProjectPolicy> {
  const detailLevel = options.detailLevel ?? "summary";
  const teamConfigPath = path.join(rootDir, ".salt", "team.json");
  const stackConfigPath = path.join(rootDir, ".salt", "stack.json");
  const notes: string[] = [];
  const teamConfigFound = await pathExists(teamConfigPath);
  const stackConfigFound = await pathExists(stackConfigPath);
  const approvedWrappers = teamConfigFound
    ? await readApprovedWrappers(teamConfigPath)
    : [];
  const normalizedStackLayers = stackConfigFound
    ? await normalizeStackLayers(stackConfigPath, notes)
    : [];
  const sharedConventionsPacks = normalizedStackLayers
    .filter((layer) => layer.sourceType === "package")
    .map((layer) => layer.source);

  if (sharedConventionsPacks.length > 0) {
    notes.push(
      "Package-backed project-convention layers detected in .salt/stack.json. This repo is using shared conventions packs.",
    );
  }

  const resolvedTeamConfigPath = teamConfigFound ? teamConfigPath : null;
  const resolvedStackConfigPath = stackConfigFound ? stackConfigPath : null;
  const mode = resolvedStackConfigPath
    ? "stack"
    : resolvedTeamConfigPath
      ? "team"
      : "none";

  if (detailLevel !== "resolved") {
    return {
      teamConfigPath: resolvedTeamConfigPath,
      stackConfigPath: resolvedStackConfigPath,
      mode,
      approvedWrappers,
      stackLayers: [],
      sharedConventions: {
        enabled: sharedConventionsPacks.length > 0,
        packCount: sharedConventionsPacks.length,
        packs: sharedConventionsPacks,
        packDetails: [],
      },
      notes,
    };
  }

  const stackLayers = await resolveStackLayers({
    rootDir,
    currentSaltVersion,
    normalizedStackLayers,
    notes,
  });
  const sharedConventionsPackDetails = stackLayers
    .filter((layer) => layer.sourceType === "package")
    .map((layer) => ({
      id: layer.id,
      source: layer.source,
      packageName: layer.resolution.packageName,
      exportName: layer.resolution.exportName,
      version: layer.resolution.version,
      packageVersion: layer.resolution.packageVersion,
      conventionsVersion: layer.resolution.conventionsVersion,
      packId: layer.resolution.packId,
      supportedSaltRange: layer.resolution.supportedSaltRange,
      status: layer.resolution.status,
      compatibility: layer.resolution.compatibility,
      resolvedPath: layer.resolution.resolvedPath,
      reason: layer.resolution.reason,
    }));

  return {
    teamConfigPath: resolvedTeamConfigPath,
    stackConfigPath: resolvedStackConfigPath,
    mode,
    approvedWrappers,
    stackLayers,
    sharedConventions: {
      enabled: sharedConventionsPacks.length > 0,
      packCount: sharedConventionsPacks.length,
      packs: sharedConventionsPacks,
      packDetails: sharedConventionsPackDetails,
    },
    notes,
  };
}
