import { brotliCompressSync } from "node:zlib";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  createArtifactDescriptor,
  materializeArtifactTree,
  verifyArtifactTree,
  type ArtifactDescriptor,
  type ArtifactTreeNodeReference,
} from "../manifest/artifactTree.js";
import { canonicalJson, canonicalJsonBytes } from "../manifest/canonicalJson.js";
import {
  digestToPathSegment,
  parseSha256Digest,
  parseSha256PathSegment,
  pathSegmentToDigest,
  sha256Digest,
} from "../manifest/digestCodec.js";
import { KnowledgeStore, KNOWLEDGE_RECORD_FAMILIES } from "../manifest/knowledgeStore.js";
import {
  assertPortableArtifactPathSet,
  parseKnowledgeArtifactPath,
} from "../manifest/pathCodec.js";
import {
  computeKnowledgeBundleDigest,
  KNOWLEDGE_OPERATIONS,
  KNOWLEDGE_PACKAGE_FAMILIES,
  validateKnowledgeManifestV1,
  type KnowledgeManifestV1,
} from "../schemas/knowledgeManifestV1.js";
import {
  resolveInstalledSaltPackages,
} from "../compatibility/installedPackageResolver.js";
import {
  resolveItemApplicability,
  validateItemApplicabilityDocument,
  type ItemApplicabilityDocument,
} from "../compatibility/itemApplicability.js";
import { resolveOperationCapability } from "../compatibility/operationCapabilityRegistry.js";
import { resolveKnowledgeCompatibility } from "../compatibility/resolveCompatibility.js";
import { REVIEW_RULE_CHARACTERIZATION } from "../review/reviewRuleCharacterization.js";
import {
  readKnowledgeRecord,
  renderKnowledgeContext,
  searchKnowledge,
} from "../search/searchSalt.js";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      fs.rm(directory, { recursive: true, force: true }),
    ),
  );
});

async function temporaryDirectory(label: string): Promise<string> {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), label));
  temporaryDirectories.push(directory);
  return directory;
}

async function writeFile(
  root: string,
  relativePath: string,
  bytes: Buffer,
): Promise<void> {
  const target = path.join(root, ...relativePath.split("/"));
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, bytes);
}

async function writeInstalledCore(
  root: string,
  relativeRoot = "node_modules",
): Promise<void> {
  const packageRoot = path.join(
    root,
    ...relativeRoot.split("/"),
    "@salt-ds",
    "core",
  );
  await fs.mkdir(packageRoot, { recursive: true });
  await fs.writeFile(
    path.join(packageRoot, "package.json"),
    JSON.stringify({ name: "@salt-ds/core", version: "1.0.0" }),
  );
}

function manifestFor(
  tree: ReturnType<typeof materializeArtifactTree>,
): KnowledgeManifestV1 {
  const digest = sha256Digest("fixture");
  const rulesetDigest = sha256Digest(canonicalJson(REVIEW_RULE_CHARACTERIZATION));
  const withoutDigest: Omit<KnowledgeManifestV1, "bundle_digest"> = {
    $schema:
      "https://www.saltdesignsystem.com/ai/schemas/knowledge-manifest-1.json",
    schema_version: "1.0.0",
    record_schema_version: "1.0.0",
    bundle_version: "0.0.0",
    semantic_digest: digest,
    semantic_source_digest: digest,
    compiler_digest: digest,
    reader_contract: "salt-knowledge-reader/1",
    analyzer_contract: "salt-artifact-analyzer/1",
    ruleset: {
      id: "salt-rules-current",
      version: "1.0.0",
      digest: rulesetDigest,
      required_rule_implementations: REVIEW_RULE_CHARACTERIZATION.map(
        (rule) => `${rule.rule_id}@1`,
      ).sort(),
    },
    operation_capabilities: Object.fromEntries(
      KNOWLEDGE_OPERATIONS.map((operation) => [operation, "supported"]),
    ) as KnowledgeManifestV1["operation_capabilities"],
    compatibility: {
      packages: KNOWLEDGE_PACKAGE_FAMILIES.map((name) => ({
        name,
        tested_version: "1.0.0",
        supported_range: "1.0.0",
        required: name === "@salt-ds/core",
      })),
    },
    artifact_tree: {
      contract: "salt-artifact-tree/1",
      path_codec: "salt-posix-relative-path/1",
      root: tree.root,
      node_count: tree.node_count,
      tree_bytes: tree.tree_bytes,
      artifact_count: tree.artifact_count,
      artifact_bytes: tree.artifact_bytes,
      max_node_bytes: 65_536,
      max_leaf_entries: 256,
      max_internal_children: 256,
      max_nodes: 512,
      max_tree_bytes: 8_388_608,
      max_artifacts: 40_000,
    },
    support_artifacts: [
      {
        kind: "semantic_source_inventory",
        artifact: "support/semantic-source-inventory.json",
      },
      {
        kind: "compiler_inventory",
        artifact: "support/compiler-inventory.json",
      },
      {
        kind: "generation_receipt",
        artifact: "support/generation-receipt.json",
      },
    ],
    limitations: { historical_completeness: false },
  };
  return {
    ...withoutDigest,
    bundle_digest: computeKnowledgeBundleDigest(withoutDigest),
  };
}

async function buildMinimalKnowledgeBundle(): Promise<{
  root: string;
  manifest: KnowledgeManifestV1;
  contentId: string;
}> {
  const root = await temporaryDirectory("salt-knowledge-v1-");
  const descriptors: ArtifactDescriptor[] = [];
  const add = async (relativePath: string, value: unknown | Buffer) => {
    const bytes = Buffer.isBuffer(value) ? value : canonicalJsonBytes(value);
    await writeFile(root, relativePath, bytes);
    descriptors.push(createArtifactDescriptor(relativePath, "application/json", bytes));
  };

  const contentSource = canonicalJsonBytes({ hello: "world" });
  const compressed = brotliCompressSync(contentSource);
  const contentId = sha256Digest(
    Buffer.concat([Buffer.from("application/json\0", "utf8"), contentSource]),
  );
  await add("content/content.pack", compressed);
  for (const family of KNOWLEDGE_RECORD_FAMILIES) {
    if (family === "search_document") continue;
    const records =
      family === "package"
        ? [
            {
              key: "record:package:package.core",
              family,
              id: "package.core",
              title: "Salt Core",
              summary: "Core package",
              data: {
                family,
                id: "package.core",
                name: "@salt-ds/core",
                version: "1.0.0",
              },
            },
          ]
        : family === "content"
          ? [
              {
                key: `record:content:${contentId}`,
                family,
                id: contentId,
                title: contentId,
                summary: "Verified content",
                data: {
                  family,
                  id: contentId,
                  codec: "json",
                  media_type: "application/json",
                  bytes: contentSource.byteLength,
                  offset: 0,
                  length: compressed.byteLength,
                  encoding: "br",
                },
              },
            ]
          : [];
    await add(`records/${family}.json`, {
      contract: "salt-knowledge-record-set/1",
      schema_version: "1.0.0",
      family,
      records,
    });
  }
  await add("indexes/search/all.json", {
    contract: "salt-search-shard/1",
    schema_version: "1.0.0",
    scoring_version: "salt-lexical-ranking/1",
    family: "search_document",
    records: [
      {
        key: "record:search_document:search:package:package.core",
        family: "search_document",
        id: "search:package:package.core",
        title: "Salt Core",
        summary: "Core package",
        data: {
          family: "search_document",
          id: "search:package:package.core",
          target: { family: "package", id: "package.core" },
          title: "Salt Core",
          summary: "Core package",
          terms: ["core", "package"],
          facets: { status: ["stable"] },
        },
      },
    ],
  });
  for (const name of [
    "semantic-source-inventory",
    "compiler-inventory",
    "generation-receipt",
  ]) {
    await add(`support/${name}.json`, { fixture: true });
  }

  const tree = materializeArtifactTree(descriptors);
  for (const [relativePath, bytes] of tree.nodes) {
    await writeFile(root, relativePath, bytes);
  }
  const manifest = manifestFor(tree);
  await writeFile(root, "manifest.json", canonicalJsonBytes(manifest));
  return { root, manifest, contentId };
}

describe("Knowledge-v1 canonical codecs", () => {
  it("round-trips digest URI/path encodings and rejects non-canonical forms", () => {
    const digest = sha256Digest("salt");
    expect(pathSegmentToDigest(digestToPathSegment(digest))).toBe(digest);
    expect(() => parseSha256Digest(digest.toUpperCase())).toThrow(/lowercase/u);
    expect(() => parseSha256PathSegment(digest.replace(":", "-x"))).toThrow(
      /path segment/u,
    );
  });

  it.each([
    "../manifest.json",
    "C:/manifest.json",
    "records\\token.json",
    "records/%2e%2e/token.json",
    "records/NUL.json",
    "records/token.json.",
    "records//token.json",
  ])("rejects unsafe portable artifact path %s", (candidate) => {
    expect(() => parseKnowledgeArtifactPath(candidate)).toThrow(/artifact path/u);
  });

  it("rejects case-colliding and unsorted artifact inventories", () => {
    expect(() =>
      assertPortableArtifactPathSet(["records/A.json", "records/a.json"]),
    ).toThrow(/collide|sorted/u);
    expect(() =>
      assertPortableArtifactPathSet(["records/b.json", "records/a.json"]),
    ).toThrow(/sorted/u);
  });
});

describe("Knowledge-v1 artifact tree", () => {
  it("materializes ordered, non-overlapping leaf ranges", () => {
    const descriptors = Array.from({ length: 257 }, (_, index) => {
      const bytes = Buffer.from(String(index));
      return createArtifactDescriptor(
        `records/${String(index).padStart(4, "0")}.json`,
        "application/json",
        bytes,
      );
    });
    const tree = materializeArtifactTree(descriptors);
    const root = JSON.parse(tree.nodes.get(tree.root.file)!.toString("utf8"));
    expect(tree.node_count).toBe(3);
    expect(root.children.map((child: ArtifactTreeNodeReference) => child.prefix)).toEqual([
      "records/0000.json",
      "records/0256.json",
    ]);
  });

  it("rejects correctly hashed but overlapping or unordered child ranges", async () => {
    const root = await temporaryDirectory("salt-tree-range-");
    const artifacts = [
      createArtifactDescriptor("records/a.json", "application/json", Buffer.from("a")),
      createArtifactDescriptor("records/b.json", "application/json", Buffer.from("b")),
    ];
    await writeFile(root, "records/a.json", Buffer.from("a"));
    await writeFile(root, "records/b.json", Buffer.from("b"));
    const references: ArtifactTreeNodeReference[] = [];
    for (const [index, descriptor] of artifacts.entries()) {
      const file = parseKnowledgeArtifactPath(
        `indexes/artifacts/shards/000${index + 1}.json`,
      );
      const bytes = canonicalJsonBytes({
        contract: "salt-artifact-tree-node/1",
        schema_version: "1.0.0",
        kind: "leaf",
        prefix: descriptor.path,
        artifacts: [descriptor],
      });
      await writeFile(root, file, bytes);
      references.push({
        file,
        prefix: descriptor.path,
        bytes: bytes.byteLength,
        sha256: sha256Digest(bytes),
      });
    }
    references.reverse();
    const rootBytes = canonicalJsonBytes({
      contract: "salt-artifact-tree-node/1",
      schema_version: "1.0.0",
      kind: "internal",
      prefix: "",
      children: references,
    });
    await writeFile(root, "indexes/artifacts/root.json", rootBytes);
    expect(() =>
      verifyArtifactTree(root, {
        root: {
          file: parseKnowledgeArtifactPath("indexes/artifacts/root.json"),
          prefix: "",
          bytes: rootBytes.byteLength,
          sha256: sha256Digest(rootBytes),
        },
        node_count: 3,
        tree_bytes:
          rootBytes.byteLength + references.reduce((sum, entry) => sum + entry.bytes, 0),
        artifact_count: 2,
        artifact_bytes: 2,
      }),
    ).toThrow(/overlap|unordered/u);
  });
});

describe("Knowledge-v1 manifest and installed reader", () => {
  it("detects manifest tampering and unsupported capability tuples", async () => {
    const fixture = await buildMinimalKnowledgeBundle();
    expect(validateKnowledgeManifestV1(fixture.manifest)).toEqual(fixture.manifest);
    expect(() =>
      validateKnowledgeManifestV1({ ...fixture.manifest, bundle_version: "0.0.1" }),
    ).toThrow(/bundle digest/u);
    expect(resolveOperationCapability(fixture.manifest, "search").supported).toBe(true);
    expect(
      resolveOperationCapability(
        { ...fixture.manifest, analyzer_contract: "unknown" as never },
        "review",
      ),
    ).toMatchObject({ supported: false });
  });

  it("verifies the complete tree and content pack before returning records", async () => {
    const fixture = await buildMinimalKnowledgeBundle();
    const store = new KnowledgeStore({ bundleDir: fixture.root });
    expect(store.ensureKnowledgeVerified().records).toBe(3);
    expect(store.getRecord("package", "package.core").name).toBe("@salt-ds/core");
    expect(
      store.getContentJson({ id: fixture.contentId, codec: "json" }),
    ).toEqual({ hello: "world" });
  });

  it("searches deterministically, reads exact records, and bounds rendered context", async () => {
    const fixture = await buildMinimalKnowledgeBundle();
    const store = new KnowledgeStore({ bundleDir: fixture.root });
    const first = searchKnowledge(store, { query: "core", limit: 1 });
    expect(searchKnowledge(store, { query: "core", limit: 1 })).toEqual(first);
    expect(first.matches[0]?.reference).toEqual({
      family: "package",
      id: "package.core",
    });
    expect(
      readKnowledgeRecord(store, {
        family: "package",
        id: "package.core",
      }),
    ).toMatchObject({ name: "@salt-ds/core" });
    expect(
      readKnowledgeRecord(store, { family: "package", id: "missing" }),
    ).toBeNull();

    const context = renderKnowledgeContext(store, {
      query: `core ${"😀".repeat(500)}`,
      max_utf8_bytes: 256,
    });
    expect(Buffer.byteLength(context, "utf8")).toBeLessThanOrEqual(256);
    expect(context).not.toContain("�");
  });
});

describe("Knowledge-v1 compatibility", () => {
  it("distinguishes exact, optional-missing, unsupported, and prerelease states", async () => {
    const { manifest } = await buildMinimalKnowledgeBundle();
    const optionalMissing = resolveKnowledgeCompatibility(manifest, {
      "@salt-ds/core": "1.0.0",
    });
    expect(optionalMissing.complete).toBe(true);
    expect(optionalMissing.packages.find((entry) => entry.name === "@salt-ds/icons"))
      .toMatchObject({ state: "missing_optional", usable: false });

    const unsupported = resolveKnowledgeCompatibility(manifest, {
      "@salt-ds/core": "1.0.1",
    });
    expect(unsupported.complete).toBe(false);
    expect(unsupported.limitations).toContain(
      "SALT_PACKAGE_VECTOR_INCOMPATIBLE",
    );

    const widened = structuredClone(manifest);
    widened.compatibility.packages.find(
      (entry) => entry.name === "@salt-ds/core",
    )!.supported_range = "^1.0.0";
    const prerelease = resolveKnowledgeCompatibility(widened, {
        "@salt-ds/core": "1.1.0-beta.1",
      });
    expect(
      prerelease.packages.find((entry) => entry.name === "@salt-ds/core")
        ?.state,
    ).toBe("unsupported");
    expect(prerelease.limitations).toContain("SALT_PRERELEASE_UNDECLARED");
  });

  it("resolves profiles/inheritance and rejects cycles, dangling items, and unknown families", () => {
    const document: ItemApplicabilityDocument = {
      contract: "salt-item-applicability/1",
      schema_version: "1.0.0",
      frozen_families: [...KNOWLEDGE_PACKAGE_FAMILIES],
      profiles: [
        {
          id: "core",
          mode: "package-ranges",
          packages: [
            {
              name: "@salt-ds/core",
              range: "1.0.0",
              evidence: "fixture",
            },
          ],
        },
      ],
      items: [
        { key: "record:component:button", profile: "core" },
        {
          key: "projection:button",
          mode: "inherits",
          source_items: ["record:component:button"],
        },
      ],
    };
    expect(
      resolveItemApplicability(document, "projection:button", {
        "@salt-ds/core": "1.0.0",
      }),
    ).toMatchObject({ included: true, state: "applicable" });
    expect(() => resolveItemApplicability(document, "missing", {})).toThrow(
      /unknown applicability item/iu,
    );

    const cyclic = structuredClone(document);
    cyclic.items = [
      { key: "a", mode: "inherits", source_items: ["b"] },
      { key: "b", mode: "inherits", source_items: ["a"] },
    ];
    expect(() => validateItemApplicabilityDocument(cyclic)).toThrow(/cyclic/iu);

    const unknownFamily = structuredClone(document);
    const profile = unknownFamily.profiles[0];
    if (profile.mode === "package-ranges") profile.packages[0]!.name = "@salt-ds/nope";
    expect(() => validateItemApplicabilityDocument(unknownFamily)).toThrow(
      /unknown family/u,
    );

    const invalidUnusedProfile = structuredClone(document);
    invalidUnusedProfile.profiles.push({
      id: "unused",
      mode: "package-ranges",
      packages: [
        { name: "@salt-ds/nope", range: "1.0.0", evidence: "fixture" },
      ],
    });
    expect(() =>
      validateItemApplicabilityDocument(invalidUnusedProfile),
    ).toThrow(/unknown family/u);
  });

  it("detects supported node_modules layouts without executing package code", async () => {
    const root = await temporaryDirectory("salt-installed-layout-");
    await fs.writeFile(
      path.join(root, "package.json"),
      JSON.stringify({ packageManager: "npm@11.1.0" }),
    );
    await fs.writeFile(
      path.join(root, "package-lock.json"),
      JSON.stringify({ lockfileVersion: 3 }),
    );
    await writeInstalledCore(root);
    const resolution = resolveInstalledSaltPackages(root);
    expect(resolution).toMatchObject({ layout: "npm", exact: true });
    expect(resolution.packages.find((entry) => entry.name === "@salt-ds/core"))
      .toMatchObject({ version: "1.0.0", contained: true });

    const pnpRoot = await temporaryDirectory("salt-pnp-layout-");
    await fs.writeFile(path.join(pnpRoot, ".pnp.cjs"), "module.exports = {};\n");
    expect(resolveInstalledSaltPackages(pnpRoot)).toMatchObject({
      layout: "yarn-pnp",
      exact: false,
      limitations: expect.arrayContaining(["SALT_LAYOUT_YARN_PNP_UNSUPPORTED"]),
    });
  });

  it.each([
    {
      label: "Yarn Classic",
      manager: "yarn@1.22.22",
      lockfile: "yarn.lock",
      lock: "# THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.\n# yarn lockfile v1\n",
      layout: "yarn-classic-node-modules",
    },
    {
      label: "Yarn Berry node-modules",
      manager: "yarn@4.17.1",
      lockfile: "yarn.lock",
      lock: "__metadata:\n  version: 8\n",
      layout: "yarn-berry-node-modules",
      yarnrc: "nodeLinker: node-modules\n",
    },
    {
      label: "pnpm",
      manager: "pnpm@10.2.0",
      lockfile: "pnpm-lock.yaml",
      lock: "lockfileVersion: '9.0'\n",
      layout: "pnpm",
    },
  ])("accepts the ratified $label lock contract", async (fixture) => {
    const root = await temporaryDirectory("salt-layout-matrix-");
    await fs.writeFile(
      path.join(root, "package.json"),
      JSON.stringify({ packageManager: fixture.manager }),
    );
    await fs.writeFile(path.join(root, fixture.lockfile), fixture.lock);
    if (fixture.yarnrc) {
      await fs.writeFile(path.join(root, ".yarnrc.yml"), fixture.yarnrc);
    }
    await writeInstalledCore(root);
    expect(resolveInstalledSaltPackages(root)).toMatchObject({
      layout: fixture.layout,
      exact: true,
      limitations: [],
    });
  });

  it("reports nested workspace authority and multiple locators deterministically", async () => {
    const root = await temporaryDirectory("salt-nested-workspace-");
    const project = path.join(root, "packages", "app");
    await fs.mkdir(project, { recursive: true });
    await fs.writeFile(
      path.join(root, "package.json"),
      JSON.stringify({
        packageManager: "npm@10.9.0",
        workspaces: ["packages/*"],
      }),
    );
    await fs.writeFile(
      path.join(root, "package-lock.json"),
      JSON.stringify({ lockfileVersion: 3 }),
    );
    await writeInstalledCore(root);
    const nested = resolveInstalledSaltPackages(project);
    expect(nested).toMatchObject({ authority_root: root, layout: "npm", exact: true });

    await writeInstalledCore(project);
    const ambiguous = resolveInstalledSaltPackages(project);
    expect(ambiguous.exact).toBe(false);
    expect(ambiguous.limitations).toContain("SALT_LOCKFILE_AMBIGUOUS");
    expect(
      ambiguous.packages.find((entry) => entry.name === "@salt-ds/core")
        ?.locator_count,
    ).toBe(2);
  });

  it("rejects conflicting markers, unsupported lock versions, Bun, and missing Core", async () => {
    const ambiguousRoot = await temporaryDirectory("salt-ambiguous-lock-");
    await fs.writeFile(path.join(ambiguousRoot, "package-lock.json"), "{}");
    await fs.writeFile(path.join(ambiguousRoot, "pnpm-lock.yaml"), "lockfileVersion: '9.0'\n");
    expect(resolveInstalledSaltPackages(ambiguousRoot).limitations).toEqual(
      expect.arrayContaining(["SALT_LOCKFILE_AMBIGUOUS"]),
    );

    const unsupportedRoot = await temporaryDirectory("salt-unsupported-lock-");
    await fs.writeFile(
      path.join(unsupportedRoot, "package.json"),
      JSON.stringify({ packageManager: "npm@9.9.0" }),
    );
    await fs.writeFile(
      path.join(unsupportedRoot, "package-lock.json"),
      JSON.stringify({ lockfileVersion: 2 }),
    );
    await writeInstalledCore(unsupportedRoot);
    expect(resolveInstalledSaltPackages(unsupportedRoot).limitations).toContain(
      "SALT_LOCKFILE_UNSUPPORTED_VERSION",
    );

    const bunRoot = await temporaryDirectory("salt-bun-layout-");
    await fs.writeFile(path.join(bunRoot, "bun.lock"), "");
    await writeInstalledCore(bunRoot);
    expect(resolveInstalledSaltPackages(bunRoot)).toMatchObject({
      layout: "bun",
      exact: false,
      limitations: expect.arrayContaining(["SALT_LAYOUT_BUN_UNSUPPORTED"]),
    });

    const missingRoot = await temporaryDirectory("salt-missing-core-");
    await fs.writeFile(
      path.join(missingRoot, "package.json"),
      JSON.stringify({ packageManager: "npm@10.9.0" }),
    );
    await fs.writeFile(
      path.join(missingRoot, "package-lock.json"),
      JSON.stringify({ lockfileVersion: 3 }),
    );
    expect(resolveInstalledSaltPackages(missingRoot).limitations).toContain(
      "SALT_PACKAGE_VECTOR_INCOMPATIBLE",
    );
  });
});
