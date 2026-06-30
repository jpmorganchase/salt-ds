import fs from "node:fs/promises";
import path from "node:path";
import {
  buildComponentContext,
  buildComponentContextManifestEntry,
  buildComponentContextMarkdownBridge,
  buildComponentContextMarkdownManifestEntry,
  buildContextCoverageAudit,
  buildContextCoverageGapCatalog,
  buildContextPackManifest,
  buildDefaultContextPackCoverageGaps,
  buildDefaultPromptHostInstructionSurfaces,
  buildFoundationContext,
  buildFoundationContextManifestEntry,
  buildPatternContext,
  buildPatternContextManifestEntry,
  buildPromptHostInstructionSurfaceManifestEntry,
  buildSaltContextComponentCheck,
  type ComponentLookupAmbiguity,
  type ComponentRecord,
  checkComponentContextMarkdownBridge,
  DEFAULT_CONTEXT_PACK_MANIFEST_PATH,
  DEFAULT_CONTEXT_PACK_OUTPUT_DIR,
  formatContextCoverageGapCatalogMarkdown,
  promptHostInstructionSurfaceFileName,
  resolveComponentTarget,
  SALT_CONTEXT_PACK_MANIFEST_CONTRACT,
  type SaltContextComponent,
  type SaltContextPackManifest,
  type SaltGeneratedArtifactReleaseGateBatchTarget,
  type SaltRegistry,
  selectDefaultContextPackComponents,
  selectDefaultContextPackFoundationTokenGroups,
  selectDefaultContextPackPatterns,
  toContextPackOutputPathForManifest,
  toSafeContextFileName,
  toSafeContextMarkdownFileName,
  toSafeFoundationContextFileName,
  toSafePatternContextFileName,
  toSaltGeneratedArtifactRegistry,
  upsertContextPackManifestEntry,
  validateGeneratedArtifactReleaseGate,
  validateGeneratedArtifactReleaseGateBatch,
} from "@salt-ds/semantic-core";
import { pathExists, writeJsonFile } from "../lib/common.js";
import { inspectGeneratedContext } from "../lib/generatedContext.js";
import {
  readRegistryLoadOptionsFromFlags,
  resolveSemanticRegistry,
} from "../lib/registry.js";
import { getSaltCliRuntimeMetadata } from "../lib/runtimeMetadata.js";
import type { RequiredCliIo } from "../types.js";

function resolveComponentById(
  registry: SaltRegistry,
  componentId: string,
  packageName?: string,
): ComponentRecord | null {
  return (
    registry.components.find(
      (component) =>
        component.id === componentId &&
        (packageName ? component.package.name === packageName : true),
    ) ?? null
  );
}

function resolveContextComponent(
  registry: SaltRegistry,
  componentTarget: string,
  packageName?: string,
):
  | { component: ComponentRecord; ambiguity?: undefined }
  | { component?: undefined; ambiguity: ComponentLookupAmbiguity }
  | null {
  const componentById = resolveComponentById(
    registry,
    componentTarget,
    packageName,
  );

  if (componentById) {
    return { component: componentById };
  }

  const resolved = resolveComponentTarget(
    registry,
    componentTarget,
    packageName,
  );

  if (resolved.ambiguity) {
    return { ambiguity: resolved.ambiguity };
  }

  return resolved.candidate
    ? { component: resolved.candidate.component }
    : null;
}

async function readJsonFile(
  filePath: string,
  maxBytes = 10_000_000,
): Promise<unknown> {
  // Hard-cap JSON payload size so a path-traversal exploit or a corrupted
  // upstream artifact can't trigger an unbounded read / parse.
  const stats = await fs.stat(filePath);
  if (stats.size > maxBytes) {
    throw new Error(
      `JSON file '${filePath}' is ${stats.size} bytes; exceeds limit of ${maxBytes}.`,
    );
  }
  const text = await fs.readFile(filePath, "utf8");
  return JSON.parse(text) as unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasGeneratedArtifact(value: unknown): boolean {
  return (
    isRecord(value) &&
    isRecord(value.generated_artifact) &&
    value.generated_artifact.contract === "salt_generated_artifact_v1"
  );
}

function isGeneratedArtifact(value: unknown): boolean {
  return isRecord(value) && value.contract === "salt_generated_artifact_v1";
}

function isContextPackManifest(
  value: unknown,
): value is SaltContextPackManifest {
  return (
    isRecord(value) &&
    value.contract === SALT_CONTEXT_PACK_MANIFEST_CONTRACT &&
    Array.isArray(value.entries) &&
    Array.isArray(value.coverage_gaps)
  );
}

async function readJsonFileIfPresent(
  filePath: string,
): Promise<unknown | null> {
  if (!(await pathExists(filePath))) {
    return null;
  }

  return readJsonFile(filePath);
}

async function readTextFileIfPresent(filePath: string): Promise<string | null> {
  if (!(await pathExists(filePath))) {
    return null;
  }

  return fs.readFile(filePath, "utf8");
}

function releaseGateCoverageGap(input: {
  kind: string;
  id: string;
  missing: string[];
  evidence_ref_ids?: string[];
}) {
  return {
    kind: input.kind,
    id: input.id,
    status: "unsupported" as const,
    missing: input.missing,
    evidence_ref_ids: input.evidence_ref_ids ?? [],
  };
}

function entryPath(input: { rootDir: string; outputPath: string }): string {
  const resolved = path.isAbsolute(input.outputPath)
    ? input.outputPath
    : path.resolve(input.rootDir, input.outputPath);

  // Reject manifest entries that escape rootDir via absolute paths or `..`
  // segments. Without this guard a hostile manifest could coerce the CLI into
  // reading or writing arbitrary files on disk.
  const relative = path.relative(input.rootDir, resolved);
  if (
    relative.length > 0 &&
    (relative.startsWith("..") || path.isAbsolute(relative))
  ) {
    throw new Error(
      `Manifest output_path '${input.outputPath}' resolves outside rootDir '${input.rootDir}'.`,
    );
  }

  return resolved;
}

async function validateComponentMarkdownEntry(input: {
  manifest: SaltContextPackManifest;
  entry: SaltContextPackManifest["entries"][number];
  rootDir: string;
}): Promise<ReturnType<typeof releaseGateCoverageGap>[]> {
  const coverageGaps: ReturnType<typeof releaseGateCoverageGap>[] = [];

  if (
    input.entry.status !== "validated" ||
    input.entry.unsupported_claim_count > 0
  ) {
    return [
      releaseGateCoverageGap({
        kind: input.entry.kind,
        id: input.entry.id,
        missing:
          input.entry.missing.length > 0
            ? input.entry.missing
            : ["component markdown bridge is unsupported"],
        evidence_ref_ids: input.entry.evidence_ref_ids,
      }),
    ];
  }

  const markdownPath = entryPath({
    rootDir: input.rootDir,
    outputPath: input.entry.output_path,
  });
  const existingText = await readTextFileIfPresent(markdownPath);
  if (existingText == null) {
    return [
      releaseGateCoverageGap({
        kind: input.entry.kind,
        id: input.entry.id,
        missing: [
          `missing generated markdown output ${input.entry.output_path}`,
        ],
        evidence_ref_ids: input.entry.evidence_ref_ids,
      }),
    ];
  }

  const sourceEntry = input.manifest.entries.find(
    (candidate) =>
      candidate.kind === "component" && candidate.id === input.entry.id,
  );
  if (!sourceEntry) {
    return [
      releaseGateCoverageGap({
        kind: input.entry.kind,
        id: input.entry.id,
        missing: [
          "component markdown bridge has no source component context entry",
        ],
        evidence_ref_ids: input.entry.evidence_ref_ids,
      }),
    ];
  }

  const sourcePayload = await readJsonFileIfPresent(
    entryPath({
      rootDir: input.rootDir,
      outputPath: sourceEntry.output_path,
    }),
  );
  if (!hasGeneratedArtifact(sourcePayload)) {
    return [
      releaseGateCoverageGap({
        kind: input.entry.kind,
        id: input.entry.id,
        missing: [
          `source component context ${sourceEntry.output_path} did not contain generated_artifact`,
        ],
        evidence_ref_ids: input.entry.evidence_ref_ids,
      }),
    ];
  }

  try {
    const bridge = buildComponentContextMarkdownBridge(
      sourcePayload as SaltContextComponent,
    );
    const check = checkComponentContextMarkdownBridge({
      bridge,
      existing_text: existingText,
    });

    if (!check.current) {
      coverageGaps.push(
        releaseGateCoverageGap({
          kind: input.entry.kind,
          id: input.entry.id,
          missing:
            check.missing.length > 0
              ? check.missing
              : [
                  "component markdown bridge text is stale or contains unsupported changes",
                ],
          evidence_ref_ids: input.entry.evidence_ref_ids,
        }),
      );
    }
  } catch (error) {
    coverageGaps.push(
      releaseGateCoverageGap({
        kind: input.entry.kind,
        id: input.entry.id,
        missing: [
          error instanceof Error
            ? error.message
            : "component markdown bridge could not be rebuilt from source context",
        ],
        evidence_ref_ids: input.entry.evidence_ref_ids,
      }),
    );
  }

  return coverageGaps;
}

async function collectReleaseGateTargetsFromManifest(input: {
  manifest: SaltContextPackManifest;
  rootDir: string;
}): Promise<{
  targets: SaltGeneratedArtifactReleaseGateBatchTarget[];
  coverageGaps: ReturnType<typeof releaseGateCoverageGap>[];
}> {
  const targets: SaltGeneratedArtifactReleaseGateBatchTarget[] = [];
  const coverageGaps = [
    ...input.manifest.coverage_gaps.map((gap) =>
      releaseGateCoverageGap({
        kind: gap.kind,
        id: gap.id,
        missing: gap.missing,
        evidence_ref_ids: gap.evidence_ref_ids,
      }),
    ),
  ];

  for (const entry of input.manifest.entries) {
    const resolvedEntryPath = entryPath({
      rootDir: input.rootDir,
      outputPath: entry.output_path,
    });

    if (entry.kind === "component_markdown") {
      coverageGaps.push(
        ...(await validateComponentMarkdownEntry({
          manifest: input.manifest,
          entry,
          rootDir: input.rootDir,
        })),
      );
      continue;
    }

    const payload = await readJsonFileIfPresent(resolvedEntryPath);
    if (!payload) {
      coverageGaps.push(
        releaseGateCoverageGap({
          kind: entry.kind,
          id: entry.id,
          missing: [`missing generated artifact output ${entry.output_path}`],
          evidence_ref_ids: entry.evidence_ref_ids,
        }),
      );
      continue;
    }

    if (isGeneratedArtifact(payload) || hasGeneratedArtifact(payload)) {
      targets.push({
        artifact: payload,
        artifact_path: resolvedEntryPath,
      });
      continue;
    }

    coverageGaps.push(
      releaseGateCoverageGap({
        kind: entry.kind,
        id: entry.id,
        missing: [
          `generated artifact output ${entry.output_path} did not contain generated_artifact`,
        ],
        evidence_ref_ids: entry.evidence_ref_ids,
      }),
    );
  }

  return { targets, coverageGaps };
}

async function collectJsonFiles(targetDir: string): Promise<string[]> {
  const entries = await fs.readdir(targetDir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry): Promise<string[]> => {
      const entryPath = path.join(targetDir, entry.name);
      if (entry.isDirectory()) {
        return collectJsonFiles(entryPath);
      }

      return entry.isFile() && entry.name.endsWith(".json") ? [entryPath] : [];
    }),
  );

  return files.flat().sort((left, right) => left.localeCompare(right));
}

async function collectReleaseGateTargetsFromDirectory(input: {
  directoryPath: string;
  rootDir: string;
}): Promise<{
  targets: SaltGeneratedArtifactReleaseGateBatchTarget[];
  coverageGaps: ReturnType<typeof releaseGateCoverageGap>[];
}> {
  const targets: SaltGeneratedArtifactReleaseGateBatchTarget[] = [];
  const coverageGaps: ReturnType<typeof releaseGateCoverageGap>[] = [];
  const jsonFiles = await collectJsonFiles(input.directoryPath);

  for (const filePath of jsonFiles) {
    const payload = await readJsonFile(filePath);
    if (isContextPackManifest(payload)) {
      const manifestTargets = await collectReleaseGateTargetsFromManifest({
        manifest: payload,
        rootDir: input.rootDir,
      });
      targets.push(...manifestTargets.targets);
      coverageGaps.push(...manifestTargets.coverageGaps);
      continue;
    }

    if (isGeneratedArtifact(payload) || hasGeneratedArtifact(payload)) {
      targets.push({
        artifact: payload,
        artifact_path: filePath,
      });
      continue;
    }

    coverageGaps.push(
      releaseGateCoverageGap({
        kind: "json",
        id: path.relative(input.rootDir, filePath).replace(/\\/g, "/"),
        missing: [
          `JSON file ${path.relative(input.rootDir, filePath).replace(/\\/g, "/")} did not contain generated_artifact`,
        ],
        evidence_ref_ids: [],
      }),
    );
  }

  return { targets, coverageGaps };
}

async function readContextPackManifest(
  manifestPath: string,
): Promise<SaltContextPackManifest | null> {
  if (!(await pathExists(manifestPath))) {
    return null;
  }

  const manifest = (await readJsonFile(
    manifestPath,
  )) as Partial<SaltContextPackManifest>;
  if (manifest.contract !== SALT_CONTEXT_PACK_MANIFEST_CONTRACT) {
    throw new Error(
      `Existing context manifest must use ${SALT_CONTEXT_PACK_MANIFEST_CONTRACT}: ${manifestPath}`,
    );
  }

  return manifest as SaltContextPackManifest;
}

async function writeContextManifest(input: {
  context: SaltContextComponent;
  manifestPath: string;
  outputPath: string;
  rootDir: string;
}): Promise<void> {
  const runtime = getSaltCliRuntimeMetadata();
  const existingManifest = await readContextPackManifest(input.manifestPath);
  const entry = buildComponentContextManifestEntry({
    context: input.context,
    output_path: toContextPackOutputPathForManifest(
      input.rootDir,
      input.outputPath,
    ),
  });
  const manifest = upsertContextPackManifestEntry(existingManifest, {
    generated_at: input.context.generated_at,
    generator: {
      name: "salt-ds export-context",
      version: runtime.cli_version,
    },
    registry: input.context.registry,
    entry,
  });

  await writeJsonFile(input.manifestPath, manifest);
}

async function writeContextPack(input: {
  registry: SaltRegistry;
  rootDir: string;
  manifestPath: string;
  outputDir: string;
  flags: Record<string, string>;
  io: RequiredCliIo;
}): Promise<number> {
  const runtime = getSaltCliRuntimeMetadata();
  const generatedAt = new Date().toISOString();
  const generator = {
    name: "salt-ds export-context",
    version: runtime.cli_version,
  };
  const components = selectDefaultContextPackComponents(input.registry, {
    package_name: input.flags.package,
  });
  const patterns = selectDefaultContextPackPatterns(input.registry);
  const foundationTokenGroups = selectDefaultContextPackFoundationTokenGroups(
    input.registry,
  );
  const contexts = components.map((component) =>
    buildComponentContext({
      registry: input.registry,
      component,
      generated_at: generatedAt,
      generator,
    }),
  );
  const patternContexts = patterns.map((pattern) =>
    buildPatternContext({
      registry: input.registry,
      pattern,
      generated_at: generatedAt,
      generator,
    }),
  );
  const foundationContexts = foundationTokenGroups.map((group) =>
    buildFoundationContext({
      registry: input.registry,
      category: group.category,
      tokens: group.tokens,
      generated_at: generatedAt,
      generator,
    }),
  );
  const promptHostInstructionSurfaces =
    buildDefaultPromptHostInstructionSurfaces({
      registry: input.registry,
      generated_at: generatedAt,
      generator,
    });
  const markdownBridges = contexts.map((context) =>
    buildComponentContextMarkdownBridge(context),
  );

  await fs.mkdir(input.outputDir, { recursive: true });
  await Promise.all([
    ...contexts.map((context) =>
      writeJsonFile(
        path.join(input.outputDir, toSafeContextFileName(context.component)),
        context,
      ),
    ),
    ...patternContexts.map((context) =>
      writeJsonFile(
        path.join(
          input.outputDir,
          toSafePatternContextFileName(context.pattern),
        ),
        context,
      ),
    ),
    ...foundationContexts.map((context) =>
      writeJsonFile(
        path.join(
          input.outputDir,
          toSafeFoundationContextFileName({
            category: context.foundation.category.value,
          }),
        ),
        context,
      ),
    ),
    ...markdownBridges.map((bridge) =>
      fs.writeFile(
        path.join(
          input.outputDir,
          toSafeContextMarkdownFileName({ id: bridge.component_id }),
        ),
        bridge.text,
        "utf8",
      ),
    ),
    ...promptHostInstructionSurfaces.map((surface) =>
      writeJsonFile(
        path.join(
          input.outputDir,
          promptHostInstructionSurfaceFileName(surface),
        ),
        surface,
      ),
    ),
  ]);

  const manifest = buildContextPackManifest({
    generated_at: generatedAt,
    generator,
    registry: toSaltGeneratedArtifactRegistry(input.registry),
    coverage_gaps: buildDefaultContextPackCoverageGaps({
      component_contexts: contexts.length > 0,
      component_markdown_bridges: markdownBridges.length > 0,
      pattern_contexts: patternContexts.length > 0,
      foundation_contexts: foundationContexts.length > 0,
      prompt_surfaces: promptHostInstructionSurfaces.some(
        (surface) => surface.surface.kind === "prompt",
      ),
      instruction_surfaces: promptHostInstructionSurfaces.some(
        (surface) => surface.surface.kind === "instruction",
      ),
    }),
    entries: [
      ...contexts.map((context) => {
        const outputPath = path.join(
          input.outputDir,
          toSafeContextFileName(context.component),
        );

        return buildComponentContextManifestEntry({
          context,
          output_path: toContextPackOutputPathForManifest(
            input.rootDir,
            outputPath,
          ),
        });
      }),
      ...patternContexts.map((context) => {
        const outputPath = path.join(
          input.outputDir,
          toSafePatternContextFileName(context.pattern),
        );

        return buildPatternContextManifestEntry({
          context,
          output_path: toContextPackOutputPathForManifest(
            input.rootDir,
            outputPath,
          ),
        });
      }),
      ...foundationContexts.map((context) => {
        const outputPath = path.join(
          input.outputDir,
          toSafeFoundationContextFileName({
            category: context.foundation.category.value,
          }),
        );

        return buildFoundationContextManifestEntry({
          context,
          output_path: toContextPackOutputPathForManifest(
            input.rootDir,
            outputPath,
          ),
        });
      }),
      ...markdownBridges.map((bridge) => {
        const outputPath = path.join(
          input.outputDir,
          toSafeContextMarkdownFileName({ id: bridge.component_id }),
        );

        return buildComponentContextMarkdownManifestEntry({
          bridge,
          output_path: toContextPackOutputPathForManifest(
            input.rootDir,
            outputPath,
          ),
        });
      }),
      ...promptHostInstructionSurfaces.map((surface) => {
        const outputPath = path.join(
          input.outputDir,
          promptHostInstructionSurfaceFileName(surface),
        );

        return buildPromptHostInstructionSurfaceManifestEntry({
          surface,
          output_path: toContextPackOutputPathForManifest(
            input.rootDir,
            outputPath,
          ),
        });
      }),
    ],
  });

  await writeJsonFile(input.manifestPath, manifest);

  if (input.flags.json === "true") {
    input.io.writeStdout(`${JSON.stringify(manifest, null, 2)}\n`);
  } else {
    input.io.writeStdout(
      [
        "Salt Context Pack",
        `Status: ${manifest.status}`,
        `Entries: ${manifest.entries.length}`,
        `Unsupported entries: ${
          manifest.entries.filter((entry) => entry.status === "unsupported")
            .length
        }`,
        `Unsupported coverage gaps: ${manifest.coverage_gaps.length}`,
        "",
      ].join("\n"),
    );
  }

  return manifest.status === "validated" ? 0 : 10;
}

async function writeContextOutput(
  context: SaltContextComponent,
  flags: Record<string, string>,
  io: RequiredCliIo,
): Promise<void> {
  if (flags.output) {
    await writeJsonFile(path.resolve(io.cwd, flags.output), context);
  }

  if (flags.json === "true") {
    io.writeStdout(`${JSON.stringify(context, null, 2)}\n`);
    return;
  }

  io.writeStdout(
    [
      "Salt Component Context",
      `Status: ${context.status}`,
      `Component: ${context.component.name.value}`,
      `Unsupported claims: ${context.unsupported_claims.length}`,
      `Evidence refs: ${context.evidence_refs.length}`,
      "",
    ].join("\n"),
  );
}

async function checkContextOutput(input: {
  context: SaltContextComponent;
  outputPath: string;
  flags: Record<string, string>;
  io: RequiredCliIo;
}): Promise<number> {
  const existingContext = await readJsonFile(input.outputPath);
  const result = buildSaltContextComponentCheck({
    context: input.context,
    existing_context: existingContext,
    output_path: input.outputPath,
  });

  if (input.flags.json === "true") {
    input.io.writeStdout(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    input.io.writeStdout(
      [
        "Salt Component Context Check",
        `Status: ${result.status}`,
        `Component: ${result.component_name}`,
        `Mismatches: ${result.mismatches.length}`,
        "",
      ].join("\n"),
    );
  }

  return result.current ? 0 : 10;
}

async function writeContextCoverageAudit(input: {
  registry: SaltRegistry;
  flags: Record<string, string>;
  io: RequiredCliIo;
}): Promise<number> {
  const runtime = getSaltCliRuntimeMetadata();
  const audit = buildContextCoverageAudit({
    registry: input.registry,
    generated_at: new Date().toISOString(),
    generator: {
      name: "salt-ds export-context",
      version: runtime.cli_version,
    },
  });

  if (input.flags.output) {
    await writeJsonFile(path.resolve(input.io.cwd, input.flags.output), audit);
  }

  if (input.flags.json === "true") {
    input.io.writeStdout(`${JSON.stringify(audit, null, 2)}\n`);
  } else {
    input.io.writeStdout(
      [
        "Salt Context Coverage Audit",
        `Status: ${audit.status}`,
        `Pattern records: ${audit.pattern_contexts.total_records}`,
        `Selected pattern contexts: ${audit.pattern_contexts.selected_records}`,
        `Foundation token categories: ${audit.foundation_contexts.total_records}`,
        `Selected foundation contexts: ${audit.foundation_contexts.selected_records}`,
        `Docs/registry gaps: ${audit.docs_registry_gaps.length}`,
        "",
      ].join("\n"),
    );
  }

  return audit.status === "validated" ? 0 : 10;
}

async function writeContextGapCatalog(input: {
  registry: SaltRegistry;
  flags: Record<string, string>;
  io: RequiredCliIo;
}): Promise<number> {
  const format = input.flags.format?.trim() ?? "json";
  if (format !== "json" && format !== "markdown") {
    input.io.writeStderr(
      "Unsupported --format for --gap-catalog. Use json or markdown.\n",
    );
    return 30;
  }

  const runtime = getSaltCliRuntimeMetadata();
  const generatedAt = new Date().toISOString();
  const audit = buildContextCoverageAudit({
    registry: input.registry,
    generated_at: generatedAt,
    generator: {
      name: "salt-ds export-context",
      version: runtime.cli_version,
    },
  });
  const catalog = buildContextCoverageGapCatalog({
    audit,
    generated_at: generatedAt,
  });
  const outputPath = input.flags.output
    ? path.resolve(input.io.cwd, input.flags.output)
    : null;

  if (outputPath) {
    if (format === "markdown") {
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(
        outputPath,
        formatContextCoverageGapCatalogMarkdown(catalog),
        "utf8",
      );
    } else {
      await writeJsonFile(outputPath, catalog);
    }
  }

  if (format === "markdown") {
    input.io.writeStdout(formatContextCoverageGapCatalogMarkdown(catalog));
  } else if (input.flags.json === "true") {
    input.io.writeStdout(`${JSON.stringify(catalog, null, 2)}\n`);
  } else {
    input.io.writeStdout(
      [
        "Salt Context Coverage Gap Catalog",
        `Status: ${catalog.audit_status}`,
        `Total gaps: ${catalog.counts.total}`,
        `Component gaps: ${catalog.counts.component}`,
        `Pattern gaps: ${catalog.counts.pattern}`,
        `Foundation gaps: ${catalog.counts.foundation}`,
        "",
      ].join("\n"),
    );
  }

  return catalog.counts.total === 0 ? 0 : 10;
}

async function checkGeneratedArtifactReleaseGate(input: {
  registry: SaltRegistry;
  artifactPath: string;
  rootDir: string;
  flags: Record<string, string>;
  io: RequiredCliIo;
}): Promise<number> {
  const artifactPath = path.resolve(input.io.cwd, input.artifactPath);
  const artifactStats = await fs.stat(artifactPath);

  if (artifactStats.isDirectory()) {
    const collected = await collectReleaseGateTargetsFromDirectory({
      directoryPath: artifactPath,
      rootDir: input.rootDir,
    });
    const releaseGate = validateGeneratedArtifactReleaseGateBatch({
      registry: input.registry,
      artifact_path: artifactPath,
      targets: collected.targets,
      coverage_gaps: collected.coverageGaps,
    });

    if (input.flags.json === "true") {
      input.io.writeStdout(`${JSON.stringify(releaseGate, null, 2)}\n`);
    } else {
      input.io.writeStdout(
        [
          "Salt Generated Artifact Release Gate Batch",
          `Status: ${releaseGate.status}`,
          `Targets: ${releaseGate.target_count}`,
          `Unsupported claims: ${releaseGate.unsupported_claim_count}`,
          `Validation issues: ${releaseGate.validation_issue_count}`,
          `Coverage gaps: ${releaseGate.coverage_gap_count}`,
          "",
        ].join("\n"),
      );
    }

    return releaseGate.releasable ? 0 : 10;
  }

  const payload = await readJsonFile(artifactPath);
  if (isContextPackManifest(payload)) {
    const collected = await collectReleaseGateTargetsFromManifest({
      manifest: payload,
      rootDir: input.rootDir,
    });
    const releaseGate = validateGeneratedArtifactReleaseGateBatch({
      registry: input.registry,
      artifact_path: artifactPath,
      targets: collected.targets,
      coverage_gaps: collected.coverageGaps,
    });

    if (input.flags.json === "true") {
      input.io.writeStdout(`${JSON.stringify(releaseGate, null, 2)}\n`);
    } else {
      input.io.writeStdout(
        [
          "Salt Generated Artifact Release Gate Batch",
          `Status: ${releaseGate.status}`,
          `Targets: ${releaseGate.target_count}`,
          `Unsupported claims: ${releaseGate.unsupported_claim_count}`,
          `Validation issues: ${releaseGate.validation_issue_count}`,
          `Coverage gaps: ${releaseGate.coverage_gap_count}`,
          "",
        ].join("\n"),
      );
    }

    return releaseGate.releasable ? 0 : 10;
  }

  const releaseGate = validateGeneratedArtifactReleaseGate({
    artifact: payload,
    registry: input.registry,
    artifact_path: artifactPath,
  });

  if (input.flags.json === "true") {
    input.io.writeStdout(`${JSON.stringify(releaseGate, null, 2)}\n`);
  } else {
    input.io.writeStdout(
      [
        "Salt Generated Artifact Release Gate",
        `Status: ${releaseGate.status}`,
        `Artifact: ${releaseGate.artifact_kind ?? "invalid"} ${
          releaseGate.artifact_id ?? ""
        }`.trim(),
        `Unsupported claims: ${releaseGate.unsupported_claim_count}`,
        `Validation issues: ${releaseGate.validation_issues.length}`,
        "",
      ].join("\n"),
    );
  }

  return releaseGate.releasable ? 0 : 10;
}

export async function runExportContextCommand(
  positionals: string[],
  flags: Record<string, string>,
  io: RequiredCliIo,
): Promise<number> {
  const rootDir = positionals[0]
    ? path.resolve(io.cwd, positionals[0])
    : io.cwd;
  const componentTarget = flags.component?.trim();
  const outputPath = flags.output ? path.resolve(io.cwd, flags.output) : null;
  const outputDir = path.resolve(
    io.cwd,
    flags["output-dir"] ?? DEFAULT_CONTEXT_PACK_OUTPUT_DIR,
  );
  const manifestPath = flags.manifest
    ? path.resolve(
        io.cwd,
        flags.manifest === "true"
          ? DEFAULT_CONTEXT_PACK_MANIFEST_PATH
          : flags.manifest,
      )
    : null;
  const packExportRequested =
    !componentTarget && Boolean(manifestPath) && flags.check !== "true";
  const packCheckRequested =
    !componentTarget && Boolean(manifestPath) && flags.check === "true";
  const coverageAuditRequested = flags.coverage === "true";
  const gapCatalogRequested = flags["gap-catalog"] === "true";
  const releaseGatePath = flags["release-gate"];
  const releaseGateRequested = Boolean(releaseGatePath);

  if (
    !componentTarget &&
    !packExportRequested &&
    !packCheckRequested &&
    !coverageAuditRequested &&
    !gapCatalogRequested &&
    !releaseGateRequested
  ) {
    io.writeStderr(
      "Missing component target. Use `salt-ds export-context --component <name-or-id> --json`, `salt-ds export-context --manifest --json`, `salt-ds export-context --coverage --json`, `salt-ds export-context --gap-catalog --json`, or `salt-ds export-context --release-gate <artifact.json> --json`.\n",
    );
    return 30;
  }
  if (flags.check === "true" && !outputPath && !packCheckRequested) {
    io.writeStderr(
      "Missing --output. Use `salt-ds export-context --component <name-or-id> --output <path> --check`.\n",
    );
    return 30;
  }
  if (manifestPath && !outputPath && componentTarget) {
    io.writeStderr(
      "Missing --output. Context manifest entries require the generated context output path.\n",
    );
    return 30;
  }

  try {
    const { registry } = await resolveSemanticRegistry(
      rootDir,
      flags["registry-dir"],

      readRegistryLoadOptionsFromFlags(flags),
    );

    if (releaseGateRequested && releaseGatePath) {
      return await checkGeneratedArtifactReleaseGate({
        registry,
        artifactPath: releaseGatePath,
        rootDir,
        flags,
        io,
      });
    }

    if (coverageAuditRequested) {
      return await writeContextCoverageAudit({
        registry,
        flags,
        io,
      });
    }

    if (gapCatalogRequested) {
      return await writeContextGapCatalog({
        registry,
        flags,
        io,
      });
    }

    if (packExportRequested && manifestPath) {
      return await writeContextPack({
        registry,
        rootDir,
        manifestPath,
        outputDir,
        flags,
        io,
      });
    }

    if (packCheckRequested) {
      const health = await inspectGeneratedContext(
        rootDir,
        registry,
        manifestPath ?? undefined,
      );
      if (flags.json === "true") {
        io.writeStdout(`${JSON.stringify(health, null, 2)}\n`);
      } else {
        io.writeStdout(
          [
            "Salt Context Pack Check",
            `Status: ${health.status}`,
            `Entries: ${health.entryCount}`,
            `Missing outputs: ${health.missingOutputs.length}`,
            `Unsupported entries: ${health.unsupportedEntries}`,
            `Unsupported coverage gaps: ${health.unsupportedCoverageGaps}`,
            "",
          ].join("\n"),
        );
      }

      return health.status === "current" ? 0 : 10;
    }

    if (!componentTarget) {
      io.writeStderr(
        "Missing component target. Use `salt-ds export-context --component <name-or-id> --json`.\n",
      );
      return 30;
    }

    const resolved = resolveContextComponent(
      registry,
      componentTarget,
      flags.package,
    );

    if (!resolved) {
      io.writeStderr(
        `Could not find component '${componentTarget}' in the resolved Salt registry.\n`,
      );
      return 10;
    }

    if (resolved.ambiguity) {
      io.writeStderr(
        `Component target '${componentTarget}' is ambiguous. Retry with --package or an exact registry id. Matches: ${resolved.ambiguity.matches
          .map((match) => `${match.name} (${match.package})`)
          .join(", ")}.\n`,
      );
      return 10;
    }

    const runtime = getSaltCliRuntimeMetadata();
    const context = buildComponentContext({
      registry,
      component: resolved.component,
      generated_at: new Date().toISOString(),
      generator: {
        name: "salt-ds export-context",
        version: runtime.cli_version,
      },
    });

    if (flags.check === "true" && outputPath) {
      return await checkContextOutput({
        context,
        outputPath,
        flags,
        io,
      });
    }

    await writeContextOutput(context, flags, io);
    if (manifestPath && outputPath) {
      await writeContextManifest({
        context,
        manifestPath,
        outputPath,
        rootDir,
      });
    }
    return context.status === "validated" ? 0 : 10;
  } catch (error) {
    io.writeStderr(
      `${error instanceof Error ? error.message : "Failed to export Salt context."}\n`,
    );
    return 30;
  }
}
