#!/usr/bin/env node

import { createHash } from "node:crypto";
import { lstat, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { verifyKnowledgeArtifactContract } from "./knowledgeArtifactContract.mjs";
import {
  assert,
  parseArgs,
  portablePath,
  readJson,
  repositoryRoot,
  sha256,
  stableJson,
  writeJsonAtomic,
} from "./saltAiEvidenceUtils.mjs";

const args = parseArgs(process.argv.slice(2));
const allowed = new Set(["--public-docs-preview-receipt"]);
for (const key of args.keys()) assert(allowed.has(key), `Unknown web build option: ${key}`);

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
  assert(stats.isFile() && !stats.isSymbolicLink(), `${label} is not a regular file`);
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
  const summary = text
    .split(/\n\s*\n/u)
    .map((entry) => entry.replace(/^>\s?/gmu, "").trim())
    .find((entry) => entry && !entry.startsWith("#") && !entry.startsWith("---")) ??
    "Version-matched Salt Design System guidance.";
  return { title, summary: summary.replace(/\s+/gu, " ").slice(0, 240) };
}

const generatedRoot = path.join(repositoryRoot, "packages", "knowledge", "generated");
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
  assert(routePath.startsWith("/") && !routePath.includes(".."), `Invalid route ${routePath}`);
  const key = routePath.normalize("NFC").toLowerCase();
  assert(!routeKeys.has(key), `Web route collision: ${routeKeys.get(key)} and ${routePath}`);
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
  .filter((entry) => entry.path.startsWith("markdown/") && entry.path.endsWith(".md"))
  .sort((left, right) => left.path.localeCompare(right.path))) {
  const bytes = await regularBytes(contained(generatedRoot, descriptor.path), descriptor.path);
  assert(sha256(bytes) === descriptor.sha256, `${descriptor.path} differs from its manifest descriptor`);
  const relative = descriptor.path.slice("markdown/".length);
  const baseRelative = relative === "migrations/index.md"
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
  previewReceiptBytes = await regularBytes(previewPath, "Public-docs preview receipt");
  previewReceipt = JSON.parse(previewReceiptBytes.toString("utf8"));
  assert(
    previewReceipt.contract === "salt-public-docs-projection/1" &&
      previewReceipt.mode === "preview" &&
      previewReceipt.bundle_version === manifest.bundle_version &&
      previewReceipt.production_navigation === false,
    "Web build requires the matching nonproduction public-docs preview receipt",
  );
  for (const document of previewReceipt.documents) {
    const bytes = await regularBytes(
      contained(repositoryRoot, document.source),
      `Preview document ${document.id}`,
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

markdownDocuments.sort((left, right) => left.markdownRoute.localeCompare(right.markdownRoute));
const llmsRoute = `${immutableBase}/llms.txt`;
const renderDocumentIndex = (title, documents) =>
  `# ${title}\n\nVersion-matched Salt guidance for bundle ${manifest.bundle_version} (${manifest.bundle_digest}).\n\n## Documentation\n\n${documents
    .map((entry) => `- [${entry.title}](${entry.markdownRoute}): ${entry.summary}`)
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
        assert(shardBytes.byteLength <= 64 * 1024, `${shardRoute} exceeds 64 KiB`);
        indexRoutes.push({ routePath: shardRoute, bytes: shardBytes });
        shardEntries.push({ routePath: shardRoute, count: shardDocuments.length });
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
      assert(familyDirectoryBytes.byteLength <= 64 * 1024, `${family} index directory exceeds 64 KiB`);
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
  const bytes = await regularBytes(contained(generatedRoot, pointer.artifact), `${kind} artifact`);
  assert(sha256(bytes) === descriptor.sha256, `${kind} artifact bytes are stale`);
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
  $schema: "https://www.saltdesignsystem.com/ai/schemas/salt-ai-web-release-receipt-1.json",
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
console.log(
  `Built ${routes.length} staged Salt AI web routes for ${manifest.bundle_digest}.`,
);
