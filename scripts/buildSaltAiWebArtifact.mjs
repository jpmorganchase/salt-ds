#!/usr/bin/env node

import { lstat, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { verifyKnowledgeArtifactContract } from "./knowledgeArtifactContract.mjs";
import {
  assert,
  parseArgs,
  portablePath,
  readJson,
  repositoryRoot,
  repositoryTextBytes,
  sha256,
  stableJson,
  writeJsonAtomic,
} from "./saltAiEvidenceUtils.mjs";

const args = parseArgs(process.argv.slice(2));
const allowed = new Set([
  "--public-docs-preview-receipt",
  "--workflow-cohort-receipt",
  "--prepare-site-preview",
]);
for (const key of args.keys())
  assert(allowed.has(key), `Unknown web build option: ${key}`);
assert(
  !args.has("--workflow-cohort-receipt") ||
    typeof args.get("--workflow-cohort-receipt") === "string",
  "--workflow-cohort-receipt requires a receipt path",
);
assert(
  !args.has("--prepare-site-preview") || args.has("--workflow-cohort-receipt"),
  "Preparing the site preview requires --workflow-cohort-receipt",
);

const outputRoot = path.join(repositoryRoot, "dist", "salt-ai-web");
const artifactRoot = path.join(outputRoot, "artifact");
await mkdir(outputRoot, { recursive: true });
await rm(artifactRoot, { recursive: true, force: true });
await rm(path.join(outputRoot, "route-map.json"), { force: true });
await rm(path.join(outputRoot, "release-receipt.json"), { force: true });
await mkdir(artifactRoot, { recursive: true });

function contained(root, relative) {
  assert(
    typeof relative === "string" &&
      relative.length > 0 &&
      !relative.includes("\\") &&
      !path.isAbsolute(relative) &&
      !relative.split("/").includes(".."),
    `Unsafe web artifact path: ${String(relative)}`,
  );
  const result = path.resolve(root, ...relative.split("/"));
  const containment = path.relative(root, result);
  assert(
    containment !== ".." &&
      !containment.startsWith(`..${path.sep}`) &&
      !path.isAbsolute(containment),
    `Web artifact path escapes its root: ${relative}`,
  );
  return result;
}

async function regularBytes(file, label) {
  const stats = await lstat(file);
  assert(
    stats.isFile() && !stats.isSymbolicLink(),
    `${label} is not a regular file`,
  );
  return readFile(file);
}

function htmlEscape(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function markdownMetadata(bytes, fallbackTitle) {
  const text = bytes.toString("utf8").replaceAll("\r\n", "\n");
  const title = text.match(/^#\s+(.+)$/mu)?.[1]?.trim() ?? fallbackTitle;
  const summary =
    text
      .split(/\n\s*\n/u)
      .map((entry) => entry.replace(/^>\s?/gmu, "").trim())
      .find(
        (entry) => entry && !entry.startsWith("#") && !entry.startsWith("---"),
      ) ?? "Version-matched Salt Design System guidance.";
  return { title, summary: summary.replace(/\s+/gu, " ").slice(0, 240) };
}

const generatedRoot = path.join(
  repositoryRoot,
  "packages",
  "knowledge",
  "generated",
);
const verified = verifyKnowledgeArtifactContract({
  packageRoot: path.join(repositoryRoot, "packages", "knowledge"),
  manifestPath: "generated/manifest.json",
  publicationInventoryPath: "generated/publication-files.json",
});
const manifest = verified.manifest;
const digestSegment = manifest.bundle_digest.slice("sha256:".length);
const immutableBase = `/ai/v1/${digestSegment}`;
const immutableCache = "public, max-age=31536000, immutable";
const mutableCache = "public, max-age=60, must-revalidate";
const routes = [];
const routeKeys = new Map();

async function addRoute({
  routePath,
  bytes,
  mediaType,
  cacheControl,
  alternate = null,
  describedby = null,
  sourceArtifact = null,
}) {
  assert(
    routePath.startsWith("/") && !routePath.includes(".."),
    `Invalid route ${routePath}`,
  );
  const key = routePath.normalize("NFC").toLowerCase();
  assert(
    !routeKeys.has(key),
    `Web route collision: ${routeKeys.get(key)} and ${routePath}`,
  );
  routeKeys.set(key, routePath);
  const outputRelative = routePath.endsWith("/")
    ? `${routePath.slice(1)}index.html`
    : routePath.slice(1);
  const outputFile = contained(artifactRoot, outputRelative);
  await mkdir(path.dirname(outputFile), { recursive: true });
  await writeFile(outputFile, bytes, { flag: "wx" });
  const digest = sha256(bytes);
  routes.push({
    path: routePath,
    output: `artifact/${outputRelative}`,
    media_type: mediaType,
    sha256: digest,
    bytes: bytes.byteLength,
    cache_control: cacheControl,
    etag: `"${digest.slice("sha256:".length)}"`,
    alternate,
    describedby,
    source_artifact: sourceArtifact,
  });
}

const markdownDocuments = [];
for (const descriptor of verified.artifactDescriptors
  .filter(
    (entry) => entry.path.startsWith("markdown/") && entry.path.endsWith(".md"),
  )
  .sort((left, right) => left.path.localeCompare(right.path))) {
  const bytes = await regularBytes(
    contained(generatedRoot, descriptor.path),
    descriptor.path,
  );
  assert(
    sha256(bytes) === descriptor.sha256,
    `${descriptor.path} differs from its manifest descriptor`,
  );
  const relative = descriptor.path.slice("markdown/".length);
  const baseRelative =
    relative === "migrations/index.md"
      ? "migrations/"
      : `${relative.slice(0, -".md".length)}/`;
  markdownDocuments.push({
    bytes,
    sourceArtifact: descriptor.path,
    htmlRoute: `${immutableBase}/${baseRelative}`,
    markdownRoute: `${immutableBase}/${baseRelative}index.md`,
    ...markdownMetadata(bytes, relative),
  });
}

let previewReceipt = null;
let previewReceiptBytes = null;
const previewInput = args.get("--public-docs-preview-receipt");
if (previewInput) {
  const previewPath = path.resolve(repositoryRoot, String(previewInput));
  previewReceiptBytes = await regularBytes(
    previewPath,
    "Public-docs preview receipt",
  );
  previewReceipt = JSON.parse(previewReceiptBytes.toString("utf8"));
  assert(
    previewReceipt.contract === "salt-public-docs-projection/1" &&
      previewReceipt.mode === "preview" &&
      previewReceipt.bundle_version === manifest.bundle_version &&
      previewReceipt.production_navigation === false,
    "Web build requires the matching nonproduction public-docs preview receipt",
  );
  for (const document of previewReceipt.documents) {
    const bytes = repositoryTextBytes(
      await regularBytes(
        contained(repositoryRoot, document.source),
        `Preview document ${document.id}`,
      ),
    );
    assert(
      bytes.byteLength === document.bytes && sha256(bytes) === document.sha256,
      `Preview document ${document.id} changed after projection`,
    );
    markdownDocuments.push({
      bytes,
      sourceArtifact: document.source,
      htmlRoute: `${immutableBase}/${document.route.slice("/ai/".length)}`,
      markdownRoute: `${immutableBase}/${document.markdown_route.slice("/ai/".length)}`,
      title: document.title,
      summary: document.summary,
    });
  }
}

markdownDocuments.sort((left, right) =>
  left.markdownRoute.localeCompare(right.markdownRoute),
);
const llmsRoute = `${immutableBase}/llms.txt`;
const renderDocumentIndex = (title, documents) =>
  `# ${title}\n\nVersion-matched Salt guidance for bundle ${manifest.bundle_version} (${manifest.bundle_digest}).\n\n## Documentation\n\n${documents
    .map(
      (entry) => `- [${entry.title}](${entry.markdownRoute}): ${entry.summary}`,
    )
    .join("\n")}\n`;
const fullIndexBytes = Buffer.from(
  renderDocumentIndex("Salt Design System", markdownDocuments),
  "utf8",
);
const familyGroups = new Map();
for (const document of markdownDocuments) {
  const relative = document.markdownRoute.slice(`${immutableBase}/`.length);
  const family = relative.split("/")[0];
  const entries = familyGroups.get(family) ?? [];
  entries.push(document);
  familyGroups.set(family, entries);
}
const segmented = fullIndexBytes.byteLength > 64 * 1024;
const describedbyByMarkdownRoute = new Map();
const indexRoutes = [];
const mainFamilyIndexes = [];
let llmsBytes = fullIndexBytes;
if (segmented) {
  for (const [family, documents] of [...familyGroups].sort(([left], [right]) =>
    left.localeCompare(right),
  )) {
    const routePath = `${immutableBase}/${family}/llms.txt`;
    const familyBytes = Buffer.from(
      renderDocumentIndex(`Salt Design System: ${family}`, documents),
      "utf8",
    );
    if (familyBytes.byteLength <= 64 * 1024) {
      indexRoutes.push({ routePath, bytes: familyBytes });
      for (const document of documents) {
        describedbyByMarkdownRoute.set(document.markdownRoute, routePath);
      }
    } else {
      const shards = [];
      let current = [];
      for (const document of documents) {
        const candidate = [...current, document];
        const candidateBytes = Buffer.from(
          renderDocumentIndex(
            `Salt Design System: ${family} ${String(shards.length + 1).padStart(4, "0")}`,
            candidate,
          ),
          "utf8",
        );
        if (candidateBytes.byteLength > 64 * 1024 && current.length > 0) {
          shards.push(current);
          current = [document];
        } else {
          current = candidate;
        }
      }
      if (current.length > 0) shards.push(current);
      const shardEntries = [];
      for (const [index, shardDocuments] of shards.entries()) {
        const shardRoute = `${immutableBase}/${family}/llms-${String(index + 1).padStart(4, "0")}.txt`;
        const shardBytes = Buffer.from(
          renderDocumentIndex(
            `Salt Design System: ${family} ${String(index + 1).padStart(4, "0")}`,
            shardDocuments,
          ),
          "utf8",
        );
        assert(
          shardBytes.byteLength <= 64 * 1024,
          `${shardRoute} exceeds 64 KiB`,
        );
        indexRoutes.push({ routePath: shardRoute, bytes: shardBytes });
        shardEntries.push({
          routePath: shardRoute,
          count: shardDocuments.length,
        });
        for (const document of shardDocuments) {
          describedbyByMarkdownRoute.set(document.markdownRoute, shardRoute);
        }
      }
      const familyDirectoryBytes = Buffer.from(
        `# Salt Design System: ${family}\n\n## Index shards\n\n${shardEntries
          .map(
            (entry, index) =>
              `- [Shard ${index + 1}](${entry.routePath}): ${entry.count} immutable Markdown records.`,
          )
          .join("\n")}\n`,
        "utf8",
      );
      assert(
        familyDirectoryBytes.byteLength <= 64 * 1024,
        `${family} index directory exceeds 64 KiB`,
      );
      indexRoutes.push({ routePath, bytes: familyDirectoryBytes });
    }
    mainFamilyIndexes.push({ family, routePath, count: documents.length });
  }
  llmsBytes = Buffer.from(
    `# Salt Design System\n\nVersion-matched Salt guidance for bundle ${manifest.bundle_version} (${manifest.bundle_digest}).\n\n## Family indexes\n\n${mainFamilyIndexes
      .map(
        (entry) =>
          `- [${entry.family}](${entry.routePath}): ${entry.count} immutable Markdown records.`,
      )
      .join("\n")}\n`,
    "utf8",
  );
}
assert(llmsBytes.byteLength <= 64 * 1024, "Immutable llms.txt exceeds 64 KiB");

for (const document of markdownDocuments) {
  const describedby =
    describedbyByMarkdownRoute.get(document.markdownRoute) ?? llmsRoute;
  await addRoute({
    routePath: document.markdownRoute,
    bytes: document.bytes,
    mediaType: "text/markdown; charset=utf-8",
    cacheControl: immutableCache,
    describedby,
    sourceArtifact: document.sourceArtifact,
  });
  const html = Buffer.from(
    `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><title>${htmlEscape(document.title)}</title><link rel="alternate" type="text/markdown" href="${document.markdownRoute}"><link rel="describedby" href="${describedby}"></head><body><main><h1>${htmlEscape(document.title)}</h1><p>${htmlEscape(document.summary)}</p><p><a href="${document.markdownRoute}">Read the exact Markdown</a></p></main></body></html>\n`,
    "utf8",
  );
  await addRoute({
    routePath: document.htmlRoute,
    bytes: html,
    mediaType: "text/html; charset=utf-8",
    cacheControl: immutableCache,
    alternate: document.markdownRoute,
    describedby,
    sourceArtifact: document.sourceArtifact,
  });
}

for (const familyIndex of indexRoutes) {
  await addRoute({
    routePath: familyIndex.routePath,
    bytes: familyIndex.bytes,
    mediaType: "text/plain; charset=utf-8",
    cacheControl: immutableCache,
    describedby: llmsRoute,
  });
}
await addRoute({
  routePath: llmsRoute,
  bytes: llmsBytes,
  mediaType: "text/plain; charset=utf-8",
  cacheControl: immutableCache,
});
await addRoute({
  routePath: "/ai/beta/llms.txt",
  bytes: llmsBytes,
  mediaType: "text/plain; charset=utf-8",
  cacheControl: mutableCache,
  describedby: llmsRoute,
});

const agentSupport = {};
for (const [kind, pointer] of Object.entries(manifest.agent_support)) {
  const descriptor = verified.artifactDescriptors.find(
    (entry) => entry.path === pointer.artifact,
  );
  assert(descriptor, `Missing manifest-selected ${kind} descriptor`);
  const bytes = await regularBytes(
    contained(generatedRoot, pointer.artifact),
    `${kind} artifact`,
  );
  assert(
    sha256(bytes) === descriptor.sha256,
    `${kind} artifact bytes are stale`,
  );
  const routePath = `${immutableBase}/${pointer.artifact}`;
  await addRoute({
    routePath,
    bytes,
    mediaType: "text/markdown; charset=utf-8",
    cacheControl: immutableCache,
    sourceArtifact: pointer.artifact,
  });
  agentSupport[kind] = {
    npm_path: pointer.artifact,
    web_path: routePath,
    sha256: descriptor.sha256,
    bytes: descriptor.bytes,
  };
}

let workflowPreview = null;
const workflowInput = args.get("--workflow-cohort-receipt");
if (workflowInput) {
  const { readValidatedWorkflowPreview } = await import(
    "./checkSaltSampleAppsHelpers.mjs"
  );
  const { createKnowledgeStore, resolveKnowledgeDocument } = await import(
    "../dist/salt-ds-knowledge/dist-es/public.js"
  );
  const retained = await readValidatedWorkflowPreview({
    cohortReceiptPath: path.resolve(repositoryRoot, String(workflowInput)),
    verifiedKnowledge: verified,
  });
  const store = createKnowledgeStore({ bundleDir: generatedRoot });
  assert(
    store.manifest.bundle_digest === manifest.bundle_digest,
    "Preview store bundle differs",
  );
  const recipeArtifact = retained.descriptor.recipe.artifact;
  const recipeBytes = store.readArtifact(recipeArtifact);
  const recipe = JSON.parse(recipeBytes.toString("utf8"));
  const recipeUrl = `${immutableBase}/${recipeArtifact}`;
  await addRoute({
    routePath: recipeUrl,
    bytes: recipeBytes,
    mediaType: "application/json; charset=utf-8",
    cacheControl: immutableCache,
    sourceArtifact: recipeArtifact,
  });
  const files = [];
  for (const file of recipe.files) {
    const bytes = store.readArtifact(file.artifact_path);
    assert(
      sha256(bytes) === file.sha256 && bytes.byteLength === file.bytes,
      `Recipe file identity differs: ${file.path}`,
    );
    // A source index.html is downloadable text, never an executable preview.
    const url = `${immutableBase}/${file.artifact_path}.txt`;
    await addRoute({
      routePath: url,
      bytes,
      mediaType: "text/plain; charset=utf-8",
      cacheControl: immutableCache,
      sourceArtifact: file.artifact_path,
    });
    files.push({ ...file, url });
  }
  async function guidance(id) {
    const result = resolveKnowledgeDocument(store, {
      identifier: `record:guide:${id}`,
    });
    assert(
      result.status === "resolved" && result.document?.canonical,
      `Canonical guidance is unavailable: ${id}`,
    );
    const canonical = result.document.canonical;
    const detail = store.getContentValue(
      store.getRecord("guide", id).detail_content_ref,
    );
    const route = detail.document?.source.route;
    assert(
      typeof route === "string" && route.startsWith("/salt/"),
      `Canonical guidance route is unavailable: ${id}`,
    );
    const markdown = markdownDocuments.find(
      (entry) => entry.sourceArtifact === `markdown/guides/${id}.md`,
    );
    assert(markdown, `Canonical Markdown is missing: ${id}`);
    const bytes = Buffer.from(stableJson(canonical), "utf8");
    const url = `${immutableBase}/guidance/${id}/document.json`;
    await addRoute({
      routePath: url,
      bytes,
      mediaType: "application/json; charset=utf-8",
      cacheControl: immutableCache,
    });
    return {
      canonical,
      route,
      descriptor: {
        url: markdown.markdownRoute,
        sha256: sha256(markdown.bytes),
        bytes: markdown.bytes.byteLength,
        content_identity: canonical.content_identity,
        reference: canonical.reference,
        document: { url, sha256: sha256(bytes), bytes: bytes.byteLength },
      },
    };
  }
  const workflowGuidance = await guidance(recipe.id);
  assert(
    workflowGuidance.canonical.recipe_identity?.content_identity ===
      recipe.source_identity.content_identity,
    "Workflow guidance and recipe identity differ",
  );
  const button = await guidance("guide.button.loading");
  const buttonRecord = store.getRecord("guide", "guide.button.loading");
  const buttonDetail = store.getContentValue(buttonRecord.detail_content_ref);
  const buttonFiles = [];
  for (const file of button.canonical.files) {
    const source = buttonDetail.files.find(
      (entry) => entry.source_path === file.path,
    );
    assert(source, `Canonical Button source is missing: ${file.path}`);
    const bytes = Buffer.from(
      store.getContentSourceText(source.code_ref),
      "utf8",
    );
    assert(
      sha256(bytes) === file.sha256 && bytes.byteLength === file.bytes,
      `Canonical Button file differs: ${file.path}`,
    );
    const url = `${immutableBase}/guidance/guide.button.loading/files/${file.path}.txt`;
    await addRoute({
      routePath: url,
      bytes,
      mediaType: "text/plain; charset=utf-8",
      cacheControl: immutableCache,
    });
    buttonFiles.push({ ...file, url });
  }
  const previewBase = `${immutableBase}/examples/workflows/${recipe.id}/preview/${retained.descriptor.tree_sha256.slice(7)}`;
  for (const file of retained.files) {
    await addRoute({
      routePath: `${previewBase}/${file.path}`,
      bytes: file.bytes,
      mediaType: file.mediaType,
      cacheControl: immutableCache,
    });
  }
  const bootstrap = {
    contract: "salt-workflow-development/1",
    development: true,
    publishable: false,
    bundle_digest: manifest.bundle_digest,
    workflow: {
      id: recipe.id,
      route: workflowGuidance.route,
      recipe: {
        url: recipeUrl,
        sha256: sha256(recipeBytes),
        bytes: recipeBytes.byteLength,
        content_identity: recipe.source_identity.content_identity,
      },
      guidance: workflowGuidance.descriptor,
      preview: {
        url: `${previewBase}/${retained.descriptor.entry}`,
        tree_sha256: retained.descriptor.tree_sha256,
      },
      files,
    },
    button: {
      route: button.route,
      guidance: button.descriptor,
      files: buttonFiles,
    },
  };
  const bootstrapBytes = Buffer.from(stableJson(bootstrap), "utf8");
  const bootstrapRoute = "/ai/development/bootstrap.json";
  await addRoute({
    routePath: bootstrapRoute,
    bytes: bootstrapBytes,
    mediaType: "application/json; charset=utf-8",
    cacheControl: mutableCache,
  });
  workflowPreview = {
    ...retained.receipt,
    tree_sha256: retained.descriptor.tree_sha256,
    route: bootstrap.workflow.preview.url,
    bootstrap: {
      path: bootstrapRoute,
      sha256: sha256(bootstrapBytes),
      bytes: bootstrapBytes.byteLength,
    },
  };
}

routes.sort((left, right) => left.path.localeCompare(right.path));
const routeMap = {
  schema_version: "1.0.0",
  contract: "salt-ai-web-route-map/2",
  bundle_digest: manifest.bundle_digest,
  digest_segment: digestSegment,
  routes,
};
await writeJsonAtomic(path.join(outputRoot, "route-map.json"), routeMap);
const routeMapBytes = await readFile(path.join(outputRoot, "route-map.json"));
const generationReceipt = await readJson(
  path.join(generatedRoot, "support", "generation-receipt.json"),
);
assert(
  generationReceipt.distribution_projections.npm_ready_sha256 ===
    generationReceipt.distribution_projections.web_ready_sha256,
  "Knowledge npm/web projection identities differ",
);
const receipt = {
  $schema:
    "https://www.saltdesignsystem.com/ai/schemas/salt-ai-web-release-receipt-1.json",
  schema_version: "1.0.0",
  contract: "salt-ai-web-release-receipt/1",
  channel: "beta-candidate",
  publishable: false,
  bundle_version: manifest.bundle_version,
  bundle_digest: manifest.bundle_digest,
  semantic_digest: manifest.semantic_digest,
  digest_segment: digestSegment,
  knowledge_manifest: {
    path: "packages/knowledge/generated/manifest.json",
    sha256: sha256(verified.manifestBytes),
    bytes: verified.manifestBytes.byteLength,
  },
  distribution_projection_sha256:
    generationReceipt.distribution_projections.npm_ready_sha256,
  public_docs_preview: previewReceipt
    ? {
        path: portablePath(path.resolve(repositoryRoot, String(previewInput))),
        sha256: sha256(previewReceiptBytes),
        bytes: previewReceiptBytes.byteLength,
        projection_sha256: previewReceipt.projection_sha256,
      }
    : null,
  workflow_preview: workflowPreview,
  route_map: {
    path: "dist/salt-ai-web/route-map.json",
    sha256: sha256(routeMapBytes),
    bytes: routeMapBytes.byteLength,
    routes: routes.length,
  },
  pointers: {
    beta: "/ai/beta/llms.txt",
    immutable: llmsRoute,
    current: null,
    root: null,
  },
  agent_support: agentSupport,
  production_navigation: false,
  deployment: "not-performed",
};
await writeJsonAtomic(path.join(outputRoot, "release-receipt.json"), receipt);
if (args.has("--prepare-site-preview")) {
  const publicRoot = path.resolve(repositoryRoot, "site", "public");
  const sitePreviewRoot = path.resolve(publicRoot, "ai");
  assert(
    path.relative(publicRoot, sitePreviewRoot) === "ai",
    "Unexpected site preview destination",
  );
  for (const directory of [publicRoot, sitePreviewRoot]) {
    const stats = await lstat(directory).catch((error) => {
      if (error.code === "ENOENT") return null;
      throw error;
    });
    assert(
      !stats || (stats.isDirectory() && !stats.isSymbolicLink()),
      "Site preview destination must contain only regular directories",
    );
  }
  await mkdir(publicRoot, { recursive: true });
  await rm(sitePreviewRoot, { recursive: true, force: true });
  // Write the selector last so it cannot point at a partly copied bundle.
  const copyOrder = [...routes].sort(
    (left, right) =>
      Number(left.path === "/ai/development/bootstrap.json") -
      Number(right.path === "/ai/development/bootstrap.json"),
  );
  for (const route of copyOrder) {
    assert(
      route.path.startsWith("/ai/"),
      "Site preview has an unexpected route",
    );
    const destination = contained(
      publicRoot,
      route.output.slice("artifact/".length),
    );
    const bytes = await regularBytes(
      contained(outputRoot, route.output),
      route.path,
    );
    assert(
      sha256(bytes) === route.sha256,
      `Web bytes changed before site copy: ${route.path}`,
    );
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, bytes, { flag: "wx" });
  }
}
console.log(
  `Built ${routes.length} staged Salt AI web routes for ${manifest.bundle_digest}.`,
);
