import path from "node:path";
import {
  buildComponentContext,
  buildComponentContextManifestEntry,
  buildComponentContextMarkdownBridge,
  buildComponentContextMarkdownManifestEntry,
  buildContextPackBundle,
  buildContextPackManifest,
  buildDefaultContextPackCoverageGaps,
  buildDefaultPromptHostInstructionSurfaces,
  buildFoundationContext,
  buildFoundationContextManifestEntry,
  buildPatternContext,
  buildPatternContextManifestEntry,
  buildPromptHostInstructionSurfaceManifestEntry,
  DEFAULT_CONTEXT_PACK_MANIFEST_PATH,
  DEFAULT_CONTEXT_PACK_OUTPUT_DIR,
  promptHostInstructionSurfaceFileName,
  resolveComponentTarget,
  resolvePatternTarget,
  type SaltContextPackBundleFile,
  type SaltContextPackManifestEntry,
  selectDefaultContextPackComponents,
  selectDefaultContextPackFoundationTokenGroups,
  selectDefaultContextPackPatterns,
  toContextPackOutputPathForManifest,
  toSafeContextFileName,
  toSafeContextMarkdownFileName,
  toSafeFoundationContextFileName,
  toSafePatternContextFileName,
  toSaltGeneratedArtifactRegistry,
} from "@salt-ds/semantic-core";
import type { SaltRegistry } from "@salt-ds/semantic-core/types";
import { getSaltMcpRuntimeMetadata } from "./serverMetadata.js";

export function buildContextResourceGenerator(registry: SaltRegistry) {
  const runtime = getSaltMcpRuntimeMetadata(registry);

  return {
    name: "salt-mcp context resource",
    version: runtime.mcp_version,
  };
}

export function buildContextRegistryRef(registry: SaltRegistry) {
  return toSaltGeneratedArtifactRegistry(registry);
}

export function buildMcpComponentContext(
  registry: SaltRegistry,
  componentName: string,
) {
  const resolved = resolveComponentTarget(registry, componentName);

  if (resolved.ambiguity) {
    throw new Error(
      `Component context target '${componentName}' is ambiguous. Matches: ${resolved.ambiguity.matches
        .map((match) => `${match.name} (${match.package})`)
        .join(", ")}.`,
    );
  }

  if (!resolved.candidate) {
    throw new Error(
      `Could not find component '${componentName}' in the resolved Salt registry.`,
    );
  }

  return buildComponentContext({
    registry,
    component: resolved.candidate.component,
    generated_at: registry.generated_at,
    generator: buildContextResourceGenerator(registry),
  });
}

export function buildMcpPatternContext(
  registry: SaltRegistry,
  patternName: string,
) {
  const resolved = resolvePatternTarget(registry, patternName);

  if (resolved.ambiguity) {
    throw new Error(
      `Pattern context target '${patternName}' is ambiguous. Matches: ${resolved.ambiguity.matches
        .map((match) => `${match.name} (${match.status})`)
        .join(", ")}.`,
    );
  }

  if (!resolved.candidate) {
    throw new Error(
      `Could not find pattern '${patternName}' in the resolved Salt registry.`,
    );
  }

  return buildPatternContext({
    registry,
    pattern: resolved.candidate.pattern,
    generated_at: registry.generated_at,
    generator: buildContextResourceGenerator(registry),
  });
}

export function buildMcpFoundationContext(
  registry: SaltRegistry,
  category: string,
) {
  const group = selectDefaultContextPackFoundationTokenGroups(registry, {
    categories: [category],
  })[0];

  if (!group) {
    throw new Error(
      `Could not find source-backed foundation token category '${category}' in the resolved Salt registry.`,
    );
  }

  return buildFoundationContext({
    registry,
    category: group.category,
    tokens: group.tokens,
    generated_at: registry.generated_at,
    generator: buildContextResourceGenerator(registry),
  });
}

function toContextComponentResourceUri(componentName: string): string {
  return `salt://context/component/${encodeURIComponent(componentName)}`;
}

function toContextComponentMarkdownResourceUri(componentName: string): string {
  return `salt://context/component/${encodeURIComponent(
    componentName,
  )}.context.md`;
}

function toContextPatternResourceUri(patternName: string): string {
  return `salt://context/pattern/${encodeURIComponent(patternName)}`;
}

function toContextFoundationResourceUri(category: string): string {
  return `salt://context/foundation/tokens/${encodeURIComponent(category)}`;
}

function toPromptHostInstructionResourceUri(input: {
  kind: "prompt" | "instruction";
  id: string;
}): string {
  return `salt://context/${input.kind}/${encodeURIComponent(input.id)}`;
}

function toJsonText(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

interface ContextPackOutputPaths {
  component(component: { id: string; name: string }): string;
  componentMarkdown(component: { id: string; name: string }): string;
  pattern(pattern: { id: string; name: string }): string;
  foundation(group: { category: string }): string;
  promptInstruction(
    surface: Parameters<typeof promptHostInstructionSurfaceFileName>[0],
  ): string;
}

function resourceOutputPaths(): ContextPackOutputPaths {
  return {
    component: (component) => toContextComponentResourceUri(component.name),
    componentMarkdown: (component) =>
      toContextComponentMarkdownResourceUri(component.name),
    pattern: (pattern) => toContextPatternResourceUri(pattern.name),
    foundation: (group) => toContextFoundationResourceUri(group.category),
    promptInstruction: (surface) =>
      toPromptHostInstructionResourceUri(surface.surface),
  };
}

function fileOutputPaths(input: {
  rootDir: string;
  outputDir: string;
}): ContextPackOutputPaths {
  return {
    component: (component) =>
      toContextPackOutputPathForManifest(
        input.rootDir,
        path.join(input.outputDir, toSafeContextFileName(component)),
      ),
    componentMarkdown: (component) =>
      toContextPackOutputPathForManifest(
        input.rootDir,
        path.join(input.outputDir, toSafeContextMarkdownFileName(component)),
      ),
    pattern: (pattern) =>
      toContextPackOutputPathForManifest(
        input.rootDir,
        path.join(input.outputDir, toSafePatternContextFileName(pattern)),
      ),
    foundation: (group) =>
      toContextPackOutputPathForManifest(
        input.rootDir,
        path.join(
          input.outputDir,
          toSafeFoundationContextFileName({ category: group.category }),
        ),
      ),
    promptInstruction: (surface) =>
      toContextPackOutputPathForManifest(
        input.rootDir,
        path.join(
          input.outputDir,
          promptHostInstructionSurfaceFileName(surface),
        ),
      ),
  };
}

export function buildMcpContextPack(
  registry: SaltRegistry,
  options: {
    outputPaths?: ContextPackOutputPaths;
    persistence?: Parameters<typeof buildContextPackBundle>[0]["persistence"];
  } = {},
) {
  const entries: SaltContextPackManifestEntry[] = [];
  const files: SaltContextPackBundleFile[] = [];
  const patterns = selectDefaultContextPackPatterns(registry);
  const foundationTokenGroups =
    selectDefaultContextPackFoundationTokenGroups(registry);
  const promptHostInstructionSurfaces =
    buildDefaultPromptHostInstructionSurfaces({
      registry,
      generated_at: registry.generated_at,
      generator: buildContextResourceGenerator(registry),
    });
  const outputPaths = options.outputPaths ?? resourceOutputPaths();

  for (const component of selectDefaultContextPackComponents(registry)) {
    const context = buildComponentContext({
      registry,
      component,
      generated_at: registry.generated_at,
      generator: buildContextResourceGenerator(registry),
    });
    const bridge = buildComponentContextMarkdownBridge(context);
    const contextEntry = buildComponentContextManifestEntry({
      context,
      output_path: outputPaths.component(component),
    });
    const bridgeEntry = buildComponentContextMarkdownManifestEntry({
      bridge,
      output_path: outputPaths.componentMarkdown(component),
    });

    entries.push(contextEntry, bridgeEntry);
    files.push(
      {
        kind: contextEntry.kind,
        id: contextEntry.id,
        output_path: contextEntry.output_path,
        mime_type: "application/json",
        contract: contextEntry.contract,
        generated_artifact_kind: contextEntry.generated_artifact_kind,
        evidence_ref_ids: contextEntry.evidence_ref_ids,
        text: toJsonText(context),
      },
      {
        kind: bridgeEntry.kind,
        id: bridgeEntry.id,
        output_path: bridgeEntry.output_path,
        mime_type: "text/markdown",
        contract: bridgeEntry.contract,
        generated_artifact_kind: bridgeEntry.generated_artifact_kind,
        evidence_ref_ids: bridgeEntry.evidence_ref_ids,
        text: bridge.text,
      },
    );
  }

  for (const pattern of patterns) {
    const context = buildPatternContext({
      registry,
      pattern,
      generated_at: registry.generated_at,
      generator: buildContextResourceGenerator(registry),
    });
    const entry = buildPatternContextManifestEntry({
      context,
      output_path: outputPaths.pattern(pattern),
    });

    entries.push(entry);
    files.push({
      kind: entry.kind,
      id: entry.id,
      output_path: entry.output_path,
      mime_type: "application/json",
      contract: entry.contract,
      generated_artifact_kind: entry.generated_artifact_kind,
      evidence_ref_ids: entry.evidence_ref_ids,
      text: toJsonText(context),
    });
  }

  for (const group of foundationTokenGroups) {
    const context = buildFoundationContext({
      registry,
      category: group.category,
      tokens: group.tokens,
      generated_at: registry.generated_at,
      generator: buildContextResourceGenerator(registry),
    });
    const entry = buildFoundationContextManifestEntry({
      context,
      output_path: outputPaths.foundation(group),
    });

    entries.push(entry);
    files.push({
      kind: entry.kind,
      id: entry.id,
      output_path: entry.output_path,
      mime_type: "application/json",
      contract: entry.contract,
      generated_artifact_kind: entry.generated_artifact_kind,
      evidence_ref_ids: entry.evidence_ref_ids,
      text: toJsonText(context),
    });
  }

  for (const surface of promptHostInstructionSurfaces) {
    const entry = buildPromptHostInstructionSurfaceManifestEntry({
      surface,
      output_path: outputPaths.promptInstruction(surface),
    });

    entries.push(entry);
    files.push({
      kind: entry.kind,
      id: entry.id,
      output_path: entry.output_path,
      mime_type: "application/json",
      contract: entry.contract,
      generated_artifact_kind: entry.generated_artifact_kind,
      evidence_ref_ids: entry.evidence_ref_ids,
      text: toJsonText(surface),
    });
  }

  const manifest = buildContextPackManifest({
    generated_at: registry.generated_at,
    generator: buildContextResourceGenerator(registry),
    registry: buildContextRegistryRef(registry),
    coverage_gaps: buildDefaultContextPackCoverageGaps({
      component_contexts: entries.some((entry) => entry.kind === "component"),
      component_markdown_bridges: entries.some(
        (entry) => entry.kind === "component_markdown",
      ),
      pattern_contexts: patterns.length > 0,
      foundation_contexts: foundationTokenGroups.length > 0,
      prompt_surfaces: promptHostInstructionSurfaces.some(
        (surface) => surface.surface.kind === "prompt",
      ),
      instruction_surfaces: promptHostInstructionSurfaces.some(
        (surface) => surface.surface.kind === "instruction",
      ),
    }),
    entries,
  });

  return {
    manifest,
    bundle: buildContextPackBundle({
      generated_at: registry.generated_at,
      generator: buildContextResourceGenerator(registry),
      registry: buildContextRegistryRef(registry),
      manifest,
      files,
      unsupported_surfaces: [],
      persistence: options.persistence,
    }),
  };
}

export function buildMcpFileContextPack(input: {
  registry: SaltRegistry;
  rootDir: string;
  outputDir: string;
  outputDirForManifest?: string | null;
}) {
  return buildMcpContextPack(input.registry, {
    outputPaths: fileOutputPaths({
      rootDir: input.rootDir,
      outputDir: input.outputDir,
    }),
    persistence: {
      status: "written",
      reason:
        "The MCP persistence tool wrote the release-gated context pack files to the requested project path.",
      output_dir:
        input.outputDirForManifest ??
        toContextPackOutputPathForManifest(input.rootDir, input.outputDir),
    },
  });
}
