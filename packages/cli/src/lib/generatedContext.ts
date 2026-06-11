import fs from "node:fs/promises";
import path from "node:path";
import {
  buildComponentContext,
  buildComponentContextMarkdownBridge,
  buildFoundationContext,
  buildGeneratedContextManifestHealth,
  buildPatternContext,
  buildPromptHostInstructionSurface,
  buildSaltContextComponentCheck,
  checkComponentContextMarkdownBridge,
  diffPromptHostInstructionSurfaceForCheck,
  diffSaltContextFoundationForCheck,
  diffSaltContextPatternForCheck,
  findDefaultPromptHostInstructionSurfaceDescriptor,
  SALT_CONTEXT_PACK_MANIFEST_CONTRACT,
  type SaltContextPackManifest,
  type SaltGeneratedContextHealth,
  type SaltRegistry,
  selectDefaultContextPackFoundationTokenGroups,
  toSaltGeneratedArtifactRegistry,
} from "@salt-ds/semantic-core";
import { pathExists } from "./common.js";

function toPosix(inputPath: string | null): string | null {
  return inputPath ? inputPath.split(path.sep).join("/") : null;
}

async function readContextManifest(
  manifestPath: string,
): Promise<SaltContextPackManifest | null> {
  const rawManifest = JSON.parse(
    await fs.readFile(manifestPath, "utf8"),
  ) as Partial<SaltContextPackManifest>;

  if (rawManifest.contract !== SALT_CONTEXT_PACK_MANIFEST_CONTRACT) {
    return null;
  }

  return rawManifest as SaltContextPackManifest;
}

function resolveContextOutputPath(rootDir: string, outputPath: string): string {
  return path.isAbsolute(outputPath)
    ? outputPath
    : path.resolve(rootDir, outputPath);
}

async function outputExistsByManifestPath(
  rootDir: string,
  manifest: SaltContextPackManifest,
): Promise<Record<string, boolean>> {
  const entries = await Promise.all(
    manifest.entries.map(async (entry) => [
      entry.output_path,
      await pathExists(resolveContextOutputPath(rootDir, entry.output_path)),
    ]),
  );

  return Object.fromEntries(entries);
}

function readOutputContract(value: unknown): string | null {
  return value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    typeof (value as { contract?: unknown }).contract === "string"
    ? ((value as { contract: string }).contract ?? null)
    : null;
}

function buildExpectedComponentContext(
  registry: SaltRegistry,
  entry: SaltContextPackManifest["entries"][number],
) {
  const component = registry.components.find(
    (candidate) => candidate.id === entry.id,
  );

  if (!component) {
    return null;
  }

  return buildComponentContext({
    registry,
    component,
    generated_at: entry.registry.generated_at ?? registry.generated_at,
    generator: {
      name: "salt-ds generated-context-check",
    },
  });
}

function buildExpectedPatternContext(
  registry: SaltRegistry,
  entry: SaltContextPackManifest["entries"][number],
) {
  const pattern = registry.patterns.find(
    (candidate) => candidate.id === entry.id,
  );

  if (!pattern) {
    return null;
  }

  return buildPatternContext({
    registry,
    pattern,
    generated_at: entry.registry.generated_at ?? registry.generated_at,
    generator: {
      name: "salt-ds generated-context-check",
    },
  });
}

function buildExpectedFoundationContext(
  registry: SaltRegistry,
  entry: SaltContextPackManifest["entries"][number],
) {
  const selectedGroup =
    selectDefaultContextPackFoundationTokenGroups(registry).find(
      (group) => group.id === entry.id,
    ) ?? null;
  const category =
    selectedGroup?.category ?? entry.id.replace(/^tokens\./u, "");
  const tokens =
    selectedGroup?.tokens ??
    registry.tokens.filter((token) => token.category === category);

  if (tokens.length === 0) {
    return null;
  }

  return buildFoundationContext({
    registry,
    category,
    tokens,
    generated_at: entry.registry.generated_at ?? registry.generated_at,
    generator: {
      name: "salt-ds generated-context-check",
    },
  });
}

function buildExpectedPromptHostInstructionSurface(
  registry: SaltRegistry,
  entry: SaltContextPackManifest["entries"][number],
) {
  if (entry.kind !== "prompt" && entry.kind !== "instruction") {
    return null;
  }

  const descriptor = findDefaultPromptHostInstructionSurfaceDescriptor({
    kind: entry.kind,
    id: entry.id,
  });

  if (!descriptor) {
    return null;
  }

  return buildPromptHostInstructionSurface({
    registry,
    descriptor,
    generated_at: entry.registry.generated_at ?? registry.generated_at,
    generator: {
      name: "salt-ds generated-context-check",
    },
    registry_hash: entry.registry.hash,
  });
}

async function outputChecksByManifestPath(
  rootDir: string,
  manifest: SaltContextPackManifest,
  registry: SaltRegistry | null,
) {
  const checks = await Promise.all(
    manifest.entries.map(async (entry) => {
      const outputPath = resolveContextOutputPath(rootDir, entry.output_path);
      if (!(await pathExists(outputPath))) {
        return [
          entry.output_path,
          {
            outputExists: false,
            outputStatus: "missing" as const,
            outputContract: null,
            mismatches: ["missing"],
            missing: [`missing output ${entry.output_path}`],
          },
        ];
      }

      if (!registry) {
        return [
          entry.output_path,
          {
            outputExists: true,
            outputStatus: "current" as const,
            outputContract: entry.contract,
            mismatches: [],
            missing: [],
          },
        ];
      }

      if (entry.kind === "component") {
        const expectedContext = buildExpectedComponentContext(registry, entry);
        if (!expectedContext) {
          return [
            entry.output_path,
            {
              outputExists: true,
              outputStatus: "unsupported" as const,
              outputContract: entry.contract,
              mismatches: [],
              missing: [`registry component ${entry.id} is missing`],
            },
          ];
        }

        try {
          const existingContext = JSON.parse(
            await fs.readFile(outputPath, "utf8"),
          ) as unknown;
          const result = buildSaltContextComponentCheck({
            context: expectedContext,
            existing_context: existingContext,
            output_path: entry.output_path,
          });

          return [
            entry.output_path,
            {
              outputExists: true,
              outputStatus: result.current
                ? ("current" as const)
                : result.supported
                  ? ("stale" as const)
                  : ("unsupported" as const),
              outputContract: readOutputContract(existingContext),
              mismatches: result.mismatches,
              missing: result.missing,
            },
          ];
        } catch {
          return [
            entry.output_path,
            {
              outputExists: true,
              outputStatus: "invalid" as const,
              outputContract: null,
              mismatches: ["invalid-json"],
              missing: [`invalid JSON output ${entry.output_path}`],
            },
          ];
        }
      }

      if (entry.kind === "component_markdown") {
        const expectedContext = buildExpectedComponentContext(registry, entry);
        if (!expectedContext) {
          return [
            entry.output_path,
            {
              outputExists: true,
              outputStatus: "unsupported" as const,
              outputContract: entry.contract,
              mismatches: [],
              missing: [`registry component ${entry.id} is missing`],
            },
          ];
        }

        const bridge = buildComponentContextMarkdownBridge(expectedContext);
        const result = checkComponentContextMarkdownBridge({
          bridge,
          existing_text: await fs.readFile(outputPath, "utf8"),
        });

        return [
          entry.output_path,
          {
            outputExists: true,
            outputStatus: result.current
              ? ("current" as const)
              : result.supported
                ? ("stale" as const)
                : ("unsupported" as const),
            outputContract: bridge.contract,
            mismatches: result.mismatches,
            missing: result.missing,
          },
        ];
      }

      if (entry.kind === "pattern") {
        const expectedContext = buildExpectedPatternContext(registry, entry);
        if (!expectedContext) {
          return [
            entry.output_path,
            {
              outputExists: true,
              outputStatus: "unsupported" as const,
              outputContract: entry.contract,
              mismatches: [],
              missing: [`registry pattern ${entry.id} is missing`],
            },
          ];
        }

        try {
          const existingContext = JSON.parse(
            await fs.readFile(outputPath, "utf8"),
          ) as unknown;
          const mismatches = diffSaltContextPatternForCheck(
            expectedContext,
            existingContext,
          );
          const supported = expectedContext.status === "validated";

          return [
            entry.output_path,
            {
              outputExists: true,
              outputStatus: !supported
                ? ("unsupported" as const)
                : mismatches.length === 0
                  ? ("current" as const)
                  : ("stale" as const),
              outputContract: readOutputContract(existingContext),
              mismatches,
              missing: expectedContext.surface_gate.missing,
            },
          ];
        } catch {
          return [
            entry.output_path,
            {
              outputExists: true,
              outputStatus: "invalid" as const,
              outputContract: null,
              mismatches: ["invalid-json"],
              missing: [`invalid JSON output ${entry.output_path}`],
            },
          ];
        }
      }

      if (entry.kind === "foundation") {
        const expectedContext = buildExpectedFoundationContext(registry, entry);
        if (!expectedContext) {
          return [
            entry.output_path,
            {
              outputExists: true,
              outputStatus: "unsupported" as const,
              outputContract: entry.contract,
              mismatches: [],
              missing: [
                `registry foundation token group ${entry.id} is missing`,
              ],
            },
          ];
        }

        try {
          const existingContext = JSON.parse(
            await fs.readFile(outputPath, "utf8"),
          ) as unknown;
          const mismatches = diffSaltContextFoundationForCheck(
            expectedContext,
            existingContext,
          );
          const supported = expectedContext.status === "validated";

          return [
            entry.output_path,
            {
              outputExists: true,
              outputStatus: !supported
                ? ("unsupported" as const)
                : mismatches.length === 0
                  ? ("current" as const)
                  : ("stale" as const),
              outputContract: readOutputContract(existingContext),
              mismatches,
              missing: expectedContext.surface_gate.missing,
            },
          ];
        } catch {
          return [
            entry.output_path,
            {
              outputExists: true,
              outputStatus: "invalid" as const,
              outputContract: null,
              mismatches: ["invalid-json"],
              missing: [`invalid JSON output ${entry.output_path}`],
            },
          ];
        }
      }

      if (entry.kind === "prompt" || entry.kind === "instruction") {
        const expectedSurface = buildExpectedPromptHostInstructionSurface(
          registry,
          entry,
        );
        if (!expectedSurface) {
          return [
            entry.output_path,
            {
              outputExists: true,
              outputStatus: "unsupported" as const,
              outputContract: entry.contract,
              mismatches: [],
              missing: [
                `registry ${entry.kind} surface ${entry.id} is missing`,
              ],
            },
          ];
        }

        try {
          const existingSurface = JSON.parse(
            await fs.readFile(outputPath, "utf8"),
          ) as unknown;
          const mismatches = diffPromptHostInstructionSurfaceForCheck(
            expectedSurface,
            existingSurface,
          );
          const supported = expectedSurface.status === "validated";

          return [
            entry.output_path,
            {
              outputExists: true,
              outputStatus: !supported
                ? ("unsupported" as const)
                : mismatches.length === 0
                  ? ("current" as const)
                  : ("stale" as const),
              outputContract: readOutputContract(existingSurface),
              mismatches,
              missing: expectedSurface.surface_gate.missing,
            },
          ];
        } catch {
          return [
            entry.output_path,
            {
              outputExists: true,
              outputStatus: "invalid" as const,
              outputContract: null,
              mismatches: ["invalid-json"],
              missing: [`invalid JSON output ${entry.output_path}`],
            },
          ];
        }
      }

      return [
        entry.output_path,
        {
          outputExists: true,
          outputStatus: "unsupported" as const,
          outputContract: entry.contract,
          mismatches: [],
          missing: [`unsupported context output kind ${entry.kind}`],
        },
      ];
    }),
  );

  return Object.fromEntries(checks);
}

export async function inspectGeneratedContext(
  rootDir: string,
  registry: SaltRegistry | null,
  manifestPathInput?: string,
): Promise<SaltGeneratedContextHealth> {
  const manifestPath =
    manifestPathInput ??
    path.join(rootDir, ".salt", "context", "manifest.json");
  const manifestPathForOutput = toPosix(manifestPath) ?? manifestPath;

  // Phase 0 task 0.2: defer the registry fingerprint until we actually
  // have a manifest to validate. `toSaltGeneratedArtifactRegistry` SHA-256s
  // every registry array, which would otherwise force the lazy loader to
  // pull all ~24 MB of artifacts off disk during `salt-ds info` on repos
  // with no context manifest (the common case).
  const computeArtifactRegistry = () =>
    registry ? toSaltGeneratedArtifactRegistry(registry) : null;

  if (!(await pathExists(manifestPath))) {
    return buildGeneratedContextManifestHealth({
      manifest_path: manifestPathForOutput,
      manifest: null,
      registry: null,
    });
  }

  const artifactRegistry = computeArtifactRegistry();

  try {
    const manifest = await readContextManifest(manifestPath);
    if (!manifest || !Array.isArray(manifest.entries)) {
      return buildGeneratedContextManifestHealth({
        manifest_path: manifestPathForOutput,
        manifest: null,
        registry: artifactRegistry,
        invalid: true,
      });
    }

    return buildGeneratedContextManifestHealth({
      manifest_path: manifestPathForOutput,
      manifest,
      registry: artifactRegistry,
      output_exists_by_path: await outputExistsByManifestPath(
        rootDir,
        manifest,
      ),
      output_checks_by_path: await outputChecksByManifestPath(
        rootDir,
        manifest,
        registry,
      ),
    });
  } catch {
    return buildGeneratedContextManifestHealth({
      manifest_path: manifestPathForOutput,
      manifest: null,
      registry: artifactRegistry,
      invalid: true,
    });
  }
}
