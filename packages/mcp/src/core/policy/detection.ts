import fs from "node:fs/promises";
import path from "node:path";
import type { ProjectConventionsLayerScope } from "./index.js";
import type { ProjectConventionsPackCompatibility } from "./layerDiagnostics.js";
import {
  readProjectConventionsStackFile,
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

async function pathExists(candidatePath: string): Promise<boolean> {
  try {
    await fs.access(candidatePath);
    return true;
  } catch {
    return false;
  }
}

async function readApprovedWrappers(input: {
  rootDir: string;
  teamConfigPath: string;
  currentSaltVersion: string | null;
  notes: string[];
}): Promise<string[]> {
  const resolution = await resolveProjectConventionsFileLayer({
    filePath: input.teamConfigPath,
    rootDir: input.rootDir,
    currentSaltVersion: input.currentSaltVersion,
  });
  if (resolution.status !== "resolved" || !resolution.conventions) {
    if (resolution.reason) input.notes.push(resolution.reason);
    return [];
  }
  return (
    resolution.conventions.approved_wrappers?.map((entry) => entry.name) ?? []
  );
}

async function normalizeStackLayers(
  rootDir: string,
  stackConfigPath: string,
  notes: string[],
): Promise<NormalizedStackLayer[]> {
  if (!(await pathExists(stackConfigPath))) {
    return [];
  }

  const resolution = await readProjectConventionsStackFile({
    rootDir,
    filePath: stackConfigPath,
  });
  if (!resolution.stack) {
    notes.push(
      resolution.reason ??
        "Detected .salt/stack.json but could not parse layered project conventions.",
    );
    return [];
  }

  const stackConfigDir = path.dirname(stackConfigPath);
  return resolution.stack.layers.map<NormalizedStackLayer>((layer) => {
    if (layer.source.type === "file") {
      return {
        id: layer.id,
        scope: layer.scope,
        sourceType: "file",
        source: layer.source.path,
        optional: layer.optional === true,
        filePath: path.resolve(stackConfigDir, layer.source.path),
      };
    }
    return {
      id: layer.id,
      scope: layer.scope,
      sourceType: "package",
      source: layer.source.export
        ? `${layer.source.specifier}#${layer.source.export}`
        : layer.source.specifier,
      optional: layer.optional === true,
      packageSpecifier: layer.source.specifier,
      exportName: layer.source.export,
    };
  });
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
          rootDir: input.rootDir,
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
  const normalizedStackLayers = stackConfigFound
    ? await normalizeStackLayers(rootDir, stackConfigPath, notes)
    : [];
  const approvedWrappers = teamConfigFound
    ? await readApprovedWrappers({
        rootDir,
        teamConfigPath,
        currentSaltVersion,
        notes,
      })
    : [];
  const sharedConventionsPacks = normalizedStackLayers
    .filter((layer) => layer.sourceType === "package")
    .map((layer) => layer.source);

  if (sharedConventionsPacks.length > 0) {
    notes.push(
      "Unsupported package-backed project-convention layers were detected in .salt/stack.json. Salt MCP does not execute policy code; replace them with repo-local JSON file layers.",
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
        enabled: false,
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
      enabled: false,
      packCount: sharedConventionsPacks.length,
      packs: sharedConventionsPacks,
      packDetails: sharedConventionsPackDetails,
    },
    notes,
  };
}
