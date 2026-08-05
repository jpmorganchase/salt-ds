import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildRegistry } from "../core/build/buildRegistry.js";
import {
  type CatalogManifest,
  catalogManifestCodec,
  catalogPublicationCodec,
  getCatalogPublishedFileNames,
  SALT_CATALOG_MANIFEST_FILE,
} from "../core/catalog/catalogSchemaV2.js";
import {
  canonicalJson,
  sha256Bytes,
} from "../core/catalog/catalogSerialization.js";
import {
  __getCatalogFileReadCountForTests,
  __resetCatalogFileReadCountsForTests,
  CatalogStoreV2,
} from "../core/catalog/catalogStoreV2.js";
import { loadRegistry } from "../core/registry/loadRegistry.js";
import type { SaltRegistry } from "../core/types.js";
import {
  copyCatalogV2Artifacts,
  REPO_ROOT,
  SOURCE_REGISTRY_BUILD_TEST_TIMEOUT_MS,
} from "./registryTestUtils.js";

/**
 * Catalog coverage audit.
 *
 * Walks the loaded registry and asserts that every public Salt entity
 * (component, pattern, foundation, and the required SaltProviderNext
 * provider) has the canonical evidence the MCP/CLI workflows expect.
 *
 * The one reviewed JPM brand-colors gap is tracked as an explicitly
 * non-gating audit budget. Any different or additional gap remains a test
 * failure. Resolving the known gap reduces the budget usage to zero without
 * requiring a test rebaseline.
 */

interface CoverageGap {
  kind: "component" | "pattern" | "foundation" | "provider";
  entity: string;
  stable_id?: string;
  reason: string;
}

const NON_GATING_FOUNDATION_EXAMPLE_GAP_BUDGET = {
  maximum: 1,
  allowed: [
    {
      kind: "foundation",
      stable_id: "page.salt-foundations-color-index",
    },
  ],
} as const;

let registry: SaltRegistry;
let builtRegistry: SaltRegistry;
let emittedRegistry: SaltRegistry;
let emittedRegistryDir: string;
let packedRegistryDir: string;
let emittedSemanticDigest: string;
let catalogManifestReadsAfterBuild = -1;
const ownedTemporaryDirectories: string[] = [];

async function buildSealedRegistryInCleanNode(
  outputDir: string,
): Promise<SaltRegistry> {
  const launcherDir = await fs.mkdtemp(
    path.join(os.tmpdir(), "salt-mcp-coverage-launcher-"),
  );
  ownedTemporaryDirectories.push(launcherDir);
  const launcherPath = path.join(launcherDir, "build-registry.mjs");
  const snapshotPath = path.join(launcherDir, "registry-snapshot.json");
  const generatorUrl = pathToFileURL(
    path.join(REPO_ROOT, "packages/mcp/scripts/buildRegistry.mjs"),
  ).href;
  await fs.writeFile(
    launcherPath,
    [
      'import fs from "node:fs/promises";',
      `import { buildCatalogRegistry } from ${JSON.stringify(generatorUrl)};`,
      `const registry = await buildCatalogRegistry({ sourceRoot: ${JSON.stringify(REPO_ROOT)}, outputDir: ${JSON.stringify(outputDir)} });`,
      `await fs.writeFile(${JSON.stringify(snapshotPath)}, JSON.stringify(registry), "utf8");`,
      "",
    ].join("\n"),
    "utf8",
  );
  await new Promise<void>((resolve, reject) => {
    execFile(
      process.execPath,
      [launcherPath],
      {
        cwd: REPO_ROOT,
        encoding: "utf8",
        env: {},
        maxBuffer: 2 * 1024 * 1024,
        timeout: SOURCE_REGISTRY_BUILD_TEST_TIMEOUT_MS - 30_000,
      },
      (error, stdout, stderr) => {
        if (error) {
          reject(
            new Error(
              `Clean sealed registry build failed: ${stderr}${stdout}`,
              { cause: error },
            ),
          );
          return;
        }
        resolve();
      },
    );
  });
  return JSON.parse(await fs.readFile(snapshotPath, "utf8")) as SaltRegistry;
}

async function readReleaseManifest(
  registryDir: string,
): Promise<CatalogManifest> {
  return catalogManifestCodec.parse(
    JSON.parse(
      await fs.readFile(
        path.join(registryDir, "catalog-manifest.json"),
        "utf8",
      ),
    ),
  );
}

async function expectCatalogRootsByteEqual(
  roots: Readonly<Record<string, string>>,
): Promise<void> {
  const entries = Object.entries(roots);
  const [referenceLabel, referenceRoot] = entries[0] ?? [];
  if (!referenceLabel || !referenceRoot) {
    throw new Error("Release catalog comparison has no roots.");
  }
  const manifests = await Promise.all(
    entries.map(async ([label, root]) => {
      const manifest = await readReleaseManifest(root);
      const publicationEntry = manifest.support_artifacts.find(
        (entry) => entry.kind === "package_inventory",
      );
      if (!publicationEntry) {
        throw new Error(`${label} has no package inventory.`);
      }
      return { label, root, manifest, publicationEntry };
    }),
  );
  const [reference] = manifests;
  if (!reference) {
    throw new Error("Release catalog comparison has no manifests.");
  }
  const referenceGeneration = path.posix.dirname(
    reference.publicationEntry.file,
  );
  const generationMismatch = manifests.find(
    ({ publicationEntry }) =>
      path.posix.dirname(publicationEntry.file) !== referenceGeneration,
  );
  if (generationMismatch) {
    throw new Error(
      `Release catalog generation mismatch: ${reference.label}=${referenceGeneration}, ${generationMismatch.label}=${path.posix.dirname(generationMismatch.publicationEntry.file)}. Rebuild and repack the release candidate from the current catalog inputs.`,
    );
  }
  const inventoryBytes = await fs.readFile(
    path.join(reference.root, ...reference.publicationEntry.file.split("/")),
  );
  const inventory = catalogPublicationCodec.parse(
    JSON.parse(inventoryBytes.toString("utf8")),
  );
  expect(inventory.files).toEqual(
    getCatalogPublishedFileNames(inventory.generation),
  );

  for (const fileName of inventory.files) {
    const referenceBytes = await fs.readFile(
      path.join(referenceRoot, fileName),
    );
    for (const [label, root] of entries.slice(1)) {
      expect(
        (await fs.readFile(path.join(root, fileName))).equals(referenceBytes),
        `${label}/${fileName} differs from ${referenceLabel}/${fileName}`,
      ).toBe(true);
    }
  }

  const semanticDigests = manifests.map(
    ({ manifest }) => manifest.semantic_digest,
  );
  expect(new Set(semanticDigests).size).toBe(1);
}

beforeAll(async () => {
  const releasePackedRegistryDir =
    process.env.SALT_MCP_PACKED_REGISTRY_DIR?.trim();
  const workspaceRegistryDir = path.join(REPO_ROOT, "packages/mcp/generated");
  emittedRegistryDir = await fs.mkdtemp(
    path.join(os.tmpdir(), "salt-mcp-coverage-registry-"),
  );
  ownedTemporaryDirectories.push(emittedRegistryDir);
  const releaseManifest = releasePackedRegistryDir
    ? await readReleaseManifest(workspaceRegistryDir)
    : null;
  if (releaseManifest && releaseManifest.generator.mode !== "sealed") {
    throw new Error(
      "Release coverage requires a sealed workspace catalog generator identity.",
    );
  }
  __resetCatalogFileReadCountsForTests();
  builtRegistry = releaseManifest
    ? await buildSealedRegistryInCleanNode(emittedRegistryDir)
    : await buildRegistry({
        sourceRoot: REPO_ROOT,
        outputDir: emittedRegistryDir,
        sourceRevision: "coverage-test-source",
        generatorVersion: "2.0.0-test",
        generatorDigest: `sha256:${"1".repeat(64)}`,
      });
  catalogManifestReadsAfterBuild = __getCatalogFileReadCountForTests(
    path.join(emittedRegistryDir, SALT_CATALOG_MANIFEST_FILE),
  );
  const emittedManifest = await readReleaseManifest(emittedRegistryDir);
  const expectedGeneratorMode = releasePackedRegistryDir ? "sealed" : "test";
  if (emittedManifest.generator.mode !== expectedGeneratorMode) {
    throw new Error(
      `Coverage catalog requires generator mode '${expectedGeneratorMode}', received '${emittedManifest.generator.mode}'.`,
    );
  }
  emittedSemanticDigest = emittedManifest.semantic_digest;
  emittedRegistry = await loadRegistry({
    registryDir: emittedRegistryDir,
    prefetch: true,
  });
  if (releasePackedRegistryDir) {
    packedRegistryDir = path.resolve(releasePackedRegistryDir);
    await expectCatalogRootsByteEqual({
      emitted: emittedRegistryDir,
      workspace: workspaceRegistryDir,
      dist: path.join(REPO_ROOT, "dist/salt-ds-mcp/generated"),
      tarball: packedRegistryDir,
    });
    new CatalogStoreV2({
      registryDir: packedRegistryDir,
    }).validateCrossReferences();
  } else {
    packedRegistryDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-mcp-coverage-packed-"),
    );
    ownedTemporaryDirectories.push(packedRegistryDir);
    await copyCatalogV2Artifacts(emittedRegistryDir, packedRegistryDir);
  }
  registry = await loadRegistry({
    registryDir: packedRegistryDir,
    prefetch: true,
  });
}, SOURCE_REGISTRY_BUILD_TEST_TIMEOUT_MS);

afterAll(async () => {
  await Promise.all(
    ownedTemporaryDirectories.map((directory) =>
      fs.rm(directory, { recursive: true, force: true }),
    ),
  );
});

function collectExampleIndex(): {
  byComponent: Map<string, number>;
  byPattern: Map<string, number>;
  byTargetName: Map<string, number>;
} {
  const byComponent = new Map<string, number>();
  const byPattern = new Map<string, number>();
  const byTargetName = new Map<string, number>();
  for (const example of registry.examples) {
    const key = example.target_name?.trim();
    if (!key) {
      continue;
    }
    const lowered = key.toLowerCase();
    byTargetName.set(lowered, (byTargetName.get(lowered) ?? 0) + 1);
    if (example.target_type === "component") {
      byComponent.set(key, (byComponent.get(key) ?? 0) + 1);
    } else if (example.target_type === "pattern") {
      byPattern.set(key, (byPattern.get(key) ?? 0) + 1);
    }
  }
  return { byComponent, byPattern, byTargetName };
}

function formatGapList(gaps: CoverageGap[]): string {
  if (gaps.length === 0) {
    return "(no gaps)";
  }
  const grouped = new Map<string, CoverageGap[]>();
  for (const gap of gaps) {
    const bucket = grouped.get(gap.kind) ?? [];
    bucket.push(gap);
    grouped.set(gap.kind, bucket);
  }
  const sections: string[] = [];
  for (const [kind, items] of [...grouped.entries()].sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    sections.push(
      `${kind} (${items.length}):\n${items
        .sort((a, b) => a.entity.localeCompare(b.entity))
        .map((gap) => `  - ${gap.entity} — ${gap.reason}`)
        .join("\n")}`,
    );
  }
  return sections.join("\n");
}

describe("registry coverage audit (roadmap task 0.6)", () => {
  it("loads equivalent freshly emitted and package-inventory representations", () => {
    const projectionDigest = (value: SaltRegistry) =>
      sha256Bytes(canonicalJson(value));
    expect(catalogManifestReadsAfterBuild).toBe(0);
    expect(projectionDigest(builtRegistry)).toBe(
      projectionDigest(emittedRegistry),
    );
    expect(projectionDigest(emittedRegistry)).toBe(projectionDigest(registry));
    expect(builtRegistry.semantic_hash).toBe(emittedSemanticDigest);
    expect(emittedRegistry.semantic_hash).toBe(emittedSemanticDigest);
    expect(emittedRegistry.semantic_hash).toBe(registry.semantic_hash);
    expect(registry).toBeDefined();
    expect(registry.components.length).toBeGreaterThan(0);
    expect(registry.patterns.length).toBeGreaterThan(0);
    expect(registry.examples.length).toBeGreaterThan(0);
    expect(registry.pages.length).toBeGreaterThan(0);
  });

  it("keeps manifest-bound build artifacts out of the package-inventory projection", async () => {
    const manifest = JSON.parse(
      await fs.readFile(
        path.join(emittedRegistryDir, SALT_CATALOG_MANIFEST_FILE),
        "utf8",
      ),
    ) as {
      build_artifacts: Array<{ file: string }>;
    };
    expect(manifest.build_artifacts.length).toBeGreaterThan(0);
    for (const entry of manifest.build_artifacts) {
      expect(
        (
          await fs.stat(path.join(emittedRegistryDir, ...entry.file.split("/")))
        ).isFile(),
      ).toBe(true);
      await expect(
        fs.access(path.join(packedRegistryDir, ...entry.file.split("/"))),
      ).rejects.toMatchObject({ code: "ENOENT" });
    }
  });

  it("does not infer token defaults from declaration equality or order", () => {
    for (const projection of [builtRegistry, emittedRegistry, registry]) {
      expect(
        projection.tokens.every(
          (token) =>
            token.value === null && token.default_declaration_id === null,
        ),
      ).toBe(true);

      const densityScoped = projection.tokens.find(
        (token) => token.name === "--salt-zIndex-popout",
      );
      expect(densityScoped).toMatchObject({
        value: null,
        default_declaration_id: null,
      });
      expect(
        densityScoped?.declarations?.some((declaration) =>
          declaration.dimensions.some(
            (dimension) => dimension.name === "density",
          ),
        ),
      ).toBe(true);

      const themeScoped = projection.tokens.find(
        (token) => token.name === "--salt-palette-interact-background",
      );
      expect(themeScoped).toMatchObject({
        value: null,
        default_declaration_id: null,
      });
      expect(
        new Set(
          themeScoped?.declarations?.flatMap((declaration) =>
            declaration.dimensions
              .filter((dimension) => dimension.name === "theme")
              .map((dimension) => dimension.value),
          ) ?? [],
        ),
      ).toEqual(new Set(["salt"]));
      expect(
        new Set(
          themeScoped?.declarations?.flatMap((declaration) =>
            declaration.dimensions
              .filter((dimension) => dimension.name === "mode")
              .map((dimension) => dimension.value),
          ) ?? [],
        ),
      ).toEqual(new Set(["dark", "light"]));
    }
  });

  it("preserves semantic category and editorial example order through build, load, and pack", () => {
    for (const projection of [builtRegistry, emittedRegistry, registry]) {
      expect(
        projection.components.find((component) => component.name === "Pill")
          ?.category,
      ).toEqual(["selection-controls", "actions"]);
      expect(
        projection.patterns.find(
          (pattern) => pattern.name === "Vertical navigation",
        )?.category,
      ).toEqual(["navigation-and-wayfinding", "layout-and-shells"]);
      expect(
        projection.components
          .find((component) => component.name === "Accordion")
          ?.examples.map((example) => example.id),
      ).toEqual(expect.arrayContaining(["accordion.default"]));
      expect(
        projection.components.find(
          (component) => component.name === "Accordion",
        )?.examples[0]?.id,
      ).toBe("accordion.default");
    }
  });

  it("respects explicit multi-export pages and date-component documentation ownership", () => {
    const datePackage = registry.packages.find(
      (entry) => entry.name === "@salt-ds/date-components",
    );
    expect(datePackage?.docs_root).toBe("/salt/components");

    for (const name of ["Date input", "Range date picker"]) {
      const component = registry.components.find(
        (entry) => entry.name === name,
      );
      expect(component).toMatchObject({
        name,
        props: [],
        source: {
          export_name: null,
        },
        inference: {
          docgen: {
            selected_display_name: null,
            selected_score: null,
          },
        },
      });
      expect(component?.sub_components).toBeUndefined();
    }
  });

  it("every component in components.json has at least one canonical example", () => {
    const { byComponent } = collectExampleIndex();
    const gaps: CoverageGap[] = [];
    for (const component of registry.components) {
      const embedded = component.examples?.length ?? 0;
      const crossReferenced = byComponent.get(component.name) ?? 0;
      if (embedded === 0 && crossReferenced === 0) {
        gaps.push({
          kind: "component",
          entity: component.name,
          reason:
            "no registry example with target_type=component matches this name, and no examples are embedded on the component record",
        });
      }
    }
    expect(
      gaps,
      `Components missing a canonical example (gap count: ${gaps.length}):\n${formatGapList(gaps)}`,
    ).toEqual([]);
  });

  it("every pattern in patterns.json has at least one canonical example", () => {
    const { byPattern } = collectExampleIndex();
    const gaps: CoverageGap[] = [];
    for (const pattern of registry.patterns) {
      const embedded = pattern.examples?.length ?? 0;
      const crossReferenced = byPattern.get(pattern.name) ?? 0;
      if (embedded === 0 && crossReferenced === 0) {
        gaps.push({
          kind: "pattern",
          entity: pattern.name,
          reason:
            "no registry example with target_type=pattern matches this name, and no examples are embedded on the pattern record",
        });
      }
    }
    expect(
      gaps,
      `Patterns missing a canonical example (gap count: ${gaps.length}):\n${formatGapList(gaps)}`,
    ).toEqual([]);
  });

  it("keeps foundation example gaps within the explicit non-gating audit budget", () => {
    const foundationPages = registry.pages.filter(
      (page) => page.page_kind === "foundation",
    );
    expect(
      foundationPages.length,
      "expected the registry to contain at least one foundation page",
    ).toBeGreaterThan(0);

    const { byTargetName } = collectExampleIndex();
    const gaps: CoverageGap[] = [];
    for (const page of foundationPages) {
      // Derive a few candidate names from the page id/title that an
      // example's target_name might reference. Foundation entities do
      // not yet have a first-class registry record; the slug or title
      // is the best identifier available today.
      const candidates = new Set<string>();
      if (page.title) {
        candidates.add(page.title.toLowerCase());
      }
      const slug = page.id.replace(/^page\.salt-foundations-/u, "");
      if (slug) {
        candidates.add(slug.toLowerCase());
        candidates.add(slug.replace(/-/gu, " ").toLowerCase());
      }
      const matched = [...candidates].some((candidate) =>
        byTargetName.has(candidate),
      );
      if (!matched) {
        gaps.push({
          kind: "foundation",
          entity: page.title || page.id,
          stable_id: page.id,
          reason: `no in-memory registry example references this foundation (tried target_name candidates: ${[
            ...candidates,
          ]
            .map((value) => JSON.stringify(value))
            .join(", ")})`,
        });
      }
    }
    const allowedKeys = new Set(
      NON_GATING_FOUNDATION_EXAMPLE_GAP_BUDGET.allowed.map(
        (gap) => `${gap.kind}:${gap.stable_id}`,
      ),
    );
    const unexpectedGaps = gaps.filter(
      (gap) => !allowedKeys.has(`${gap.kind}:${gap.stable_id ?? gap.entity}`),
    );
    expect(
      unexpectedGaps,
      `Unexpected foundation example gaps (total gap count: ${gaps.length}, budget: ${NON_GATING_FOUNDATION_EXAMPLE_GAP_BUDGET.maximum}):\n${formatGapList(gaps)}`,
    ).toEqual([]);
    expect(
      gaps.length,
      `Foundation example audit exceeded its non-gating budget of ${NON_GATING_FOUNDATION_EXAMPLE_GAP_BUDGET.maximum}:\n${formatGapList(gaps)}`,
    ).toBeLessThanOrEqual(NON_GATING_FOUNDATION_EXAMPLE_GAP_BUDGET.maximum);
    console.info(
      `[registry coverage audit] foundation example gap budget usage: ${gaps.length}/${NON_GATING_FOUNDATION_EXAMPLE_GAP_BUDGET.maximum}${
        gaps.length > 0
          ? ` (${gaps.map((gap) => gap.stable_id ?? gap.entity).join(", ")})`
          : ""
      }`,
    );
  });

  it("indexes SaltProviderNext and its brand-prop set (roadmap F1)", () => {
    // Reframed from the original "first-class entity" assertion, which
    // encoded a parallel-components-forever design. The convergence
    // story is: SaltProviderNext is a transitional sibling of
    // SaltProvider that exposes brand-aware accent/font/corner overrides
    // until those props land on SaltProvider itself. Once that lands,
    // SaltProviderNext becomes a deprecation alias and the hidden
    // `salt-provider-next` MDX page is removed; this assertion then
    // either retargets the converged SaltProvider record or is dropped.
    //
    // What we actually need today:
    //   1. An exact catalog entity lookup resolves `SaltProviderNext` — i.e. some
    //      component record exposes `SaltProviderNext` by name or alias
    //      so the registry can ground a model that imports it without
    //      forcing the model to inspect node_modules.
    //   2. The resolved record's `props` array carries the full brand-
    //      prop set: accent, actionFont, corner, density, headingFont,
    //      mode. Where those props live (a dedicated SaltProviderNext
    //      record vs. merged onto SaltProvider with provenance) is an
    //      implementation detail of the build pipeline and should not
    //      be encoded by this assertion.
    const resolved = registry.components.find(
      (component) =>
        component.name === "SaltProviderNext" ||
        component.aliases?.includes("SaltProviderNext"),
    );
    expect(
      resolved,
      "expected some component record to expose 'SaltProviderNext' by name or alias for exact catalog retrieval (roadmap F1 / M9)",
    ).toBeDefined();
    if (!resolved) {
      return;
    }

    const propNames = new Set(resolved.props.map((prop) => prop.name));
    const brandProps = [
      "accent",
      "actionFont",
      "corner",
      "density",
      "headingFont",
      "mode",
    ] as const;
    const missingBrandProps = brandProps.filter((name) => !propNames.has(name));
    expect(
      missingBrandProps,
      `${resolved.name} resolves for SaltProviderNext but is missing brand props that callers need to ground accent/font/corner overrides (missing: ${missingBrandProps.join(", ")})`,
    ).toEqual([]);
  });
});
