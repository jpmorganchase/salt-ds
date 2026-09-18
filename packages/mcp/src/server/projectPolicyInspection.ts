import path from "node:path";
import {
  attachProjectPolicyImportChecks,
  compileSaltProjectPolicyIrV2,
  type DetectedProjectPolicy,
  type ProjectPolicyImportCheckV2,
  type ProjectPolicyIrLayerInputV2,
  readProjectConventionsStackFile,
  resolveProjectConventionsFileLayer,
  type SaltProjectPolicyIrV2,
} from "../core/runtime.js";
import {
  type ProjectPolicyImportTargetDiagnostics,
  type ProjectPolicyImportTargetInput,
  validateProjectPolicyImportTargets,
} from "./projectPolicyImports.js";

export interface ProjectPolicyInspection {
  ir: SaltProjectPolicyIrV2 | null;
  import_targets: ProjectPolicyImportTargetDiagnostics;
  limitations: string[];
}

function toIrLayer(
  input: {
    id: string;
    scope: ProjectPolicyIrLayerInputV2["scope"];
    optional?: boolean;
    source: ProjectPolicyIrLayerInputV2["source"];
  },
  resolution: Awaited<ReturnType<typeof resolveProjectConventionsFileLayer>>,
): ProjectPolicyIrLayerInputV2 {
  return {
    ...input,
    resolution_status: resolution.status,
    resolution_reason: resolution.reason,
    conventions: resolution.conventions,
    compatibility: resolution.compatibility
      ? {
          status: resolution.compatibility.status,
          reason: resolution.compatibility.reason,
        }
      : null,
  };
}

async function compilePolicyIr(input: {
  authorityRoot: string;
  rootDir: string;
  currentSaltVersion: string | null;
  policy: DetectedProjectPolicy;
}): Promise<SaltProjectPolicyIrV2 | null> {
  if (input.policy.mode === "none") return null;

  if (input.policy.mode === "team" && input.policy.teamConfigPath) {
    const resolution = await resolveProjectConventionsFileLayer({
      authorityRoot: input.authorityRoot,
      filePath: input.policy.teamConfigPath,
      rootDir: input.rootDir,
      currentSaltVersion: input.currentSaltVersion,
    });
    return compileSaltProjectPolicyIrV2({
      policyMode: "team",
      declared: true,
      layers: [
        toIrLayer(
          {
            id: "team-policy",
            scope: "team",
            source: {
              type: "file",
              declared_path: input.policy.teamConfigPath,
              resolved_path: resolution.resolvedPath,
            },
          },
          resolution,
        ),
      ],
    });
  }

  if (!input.policy.stackConfigPath) return null;
  const stackResolution = await readProjectConventionsStackFile({
    authorityRoot: input.authorityRoot,
    filePath: input.policy.stackConfigPath,
    rootDir: input.rootDir,
  });
  if (!stackResolution.stack) {
    return compileSaltProjectPolicyIrV2({
      policyMode: "stack",
      declared: true,
      layers: [
        {
          id: "stack-config",
          scope: "repo",
          source: {
            type: "file",
            declared_path: input.policy.stackConfigPath,
            resolved_path: stackResolution.resolvedPath,
          },
          resolution_status: "invalid",
          resolution_reason:
            stackResolution.reason ?? "Project policy stack is invalid.",
          conventions: null,
        },
      ],
    });
  }

  const stackDirectory = path.dirname(input.policy.stackConfigPath);
  const layers: ProjectPolicyIrLayerInputV2[] = [];
  for (const layer of stackResolution.stack.layers) {
    const resolution = await resolveProjectConventionsFileLayer({
      authorityRoot: input.authorityRoot,
      filePath: path.resolve(stackDirectory, layer.source.path),
      rootDir: input.rootDir,
      currentSaltVersion: input.currentSaltVersion,
      optional: layer.optional === true,
    });
    layers.push(
      toIrLayer(
        {
          id: layer.id,
          scope: layer.scope,
          optional: layer.optional,
          source: {
            type: "file",
            declared_path: layer.source.path,
            resolved_path: resolution.resolvedPath,
          },
        },
        resolution,
      ),
    );
  }
  return compileSaltProjectPolicyIrV2({
    policyMode: "stack",
    declared: true,
    layers,
  });
}

function collectImportTargets(
  ir: SaltProjectPolicyIrV2 | null,
): ProjectPolicyImportTargetInput[] {
  if (!ir) return [];
  return ir.occurrences.flatMap<ProjectPolicyImportTargetInput>(
    (occurrence) => {
      if (
        occurrence.category === "approved_wrapper" &&
        occurrence.declaration.import
      ) {
        return [
          {
            kind: "approved_wrapper",
            owner: occurrence.declaration.name,
            from: occurrence.declaration.import.from,
            name: occurrence.declaration.import.name,
            occurrence_id: occurrence.occurrence_id,
            policy_type_id: occurrence.policy_type_id,
            source_path: occurrence.provenance.resolved_path,
            json_pointer: occurrence.provenance.json_pointer,
            slot: "wrapper_import",
            slot_index: null,
          },
        ];
      }
      if (occurrence.category !== "theme_defaults") return [];
      return [
        ...(occurrence.declaration.provider_import
          ? [
              {
                kind: "theme_provider" as const,
                owner: occurrence.declaration.provider ?? "theme defaults",
                from: occurrence.declaration.provider_import.from,
                name: occurrence.declaration.provider_import.name,
                occurrence_id: occurrence.occurrence_id,
                policy_type_id: occurrence.policy_type_id,
                source_path: occurrence.provenance.resolved_path,
                json_pointer: occurrence.provenance.json_pointer,
                slot: "theme_provider_import" as const,
                slot_index: null,
              },
            ]
          : []),
        ...(occurrence.declaration.imports ?? []).map(
          (specifier, slotIndex) => ({
            kind: "theme_import" as const,
            owner: occurrence.declaration.provider ?? "theme defaults",
            from: specifier,
            name: null,
            occurrence_id: occurrence.occurrence_id,
            policy_type_id: occurrence.policy_type_id,
            source_path: occurrence.provenance.resolved_path,
            json_pointer: occurrence.provenance.json_pointer,
            slot: "theme_side_effect_import" as const,
            slot_index: slotIndex,
          }),
        ),
      ];
    },
  );
}

function attachImportChecks(
  ir: SaltProjectPolicyIrV2 | null,
  diagnostics: ProjectPolicyImportTargetDiagnostics,
): SaltProjectPolicyIrV2 | null {
  if (!ir) return null;
  const checks = new Map<string, ProjectPolicyImportCheckV2[]>();
  for (const diagnostic of diagnostics.targets) {
    if (!diagnostic.occurrence_id || !diagnostic.slot) continue;
    const values = checks.get(diagnostic.occurrence_id) ?? [];
    values.push({
      slot: diagnostic.slot,
      slot_index: diagnostic.slot_index ?? null,
      from: diagnostic.from,
      name: diagnostic.name,
      status: diagnostic.status,
      resolved_path: diagnostic.resolved_path,
      reason: diagnostic.reason,
    });
    checks.set(diagnostic.occurrence_id, values);
  }
  return attachProjectPolicyImportChecks(ir, checks);
}

export async function inspectProjectPolicy(input: {
  authorityRoot?: string;
  rootDir: string;
  currentSaltVersion: string | null;
  policy: DetectedProjectPolicy;
}): Promise<ProjectPolicyInspection> {
  const ir = await compilePolicyIr({
    ...input,
    authorityRoot: input.authorityRoot ?? input.rootDir,
  });
  const importTargets = await validateProjectPolicyImportTargets(
    input.rootDir,
    collectImportTargets(ir),
    undefined,
    input.authorityRoot ?? input.rootDir,
  );
  const inspectedIr = attachImportChecks(ir, importTargets);
  return {
    ir: inspectedIr,
    import_targets: importTargets,
    limitations: [
      ...((input.policy.markerIssues?.length ?? 0) > 0
        ? [
            "One or more project policy markers failed bounded regular-file inspection.",
          ]
        : []),
      ...((inspectedIr?.diagnostics.length ?? 0) > 0
        ? [
            "The untrusted project policy contains structural diagnostics; inspect the labelled policy data for provenance.",
          ]
        : []),
      ...(importTargets.issue_count > 0
        ? [
            "One or more declared project policy import targets could not be verified by bounded static inspection.",
          ]
        : []),
      ...importTargets.inspection_limitations.map(
        () =>
          "TypeScript path-alias inspection was unavailable or bounded; relative repo-local import targets were still evaluated.",
      ),
    ],
  };
}
