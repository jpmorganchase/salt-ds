#!/usr/bin/env node

import { lstat, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import Ajv2020 from "ajv/dist/2020.js";
import { verifyKnowledgeArtifactContract } from "./knowledgeArtifactContract.mjs";

import {
  assert,
  parseArgs,
  readJson,
  repositoryRoot,
  sha256,
  stableJson,
} from "./saltAiEvidenceUtils.mjs";

const args = parseArgs(process.argv.slice(2));
const allowed = new Set([
  "--public-docs-preview-receipt",
  "--forbid-production-ai-navigation",
  "--final-public-docs-receipt",
  "--expected-web-receipt",
  "--effective-package-docs-receipt",
  "--expected-current-authority-receipt",
  "--forbid-immutable-byte-change",
  "--verify-site-preview",
]);
for (const key of args.keys())
  assert(allowed.has(key), `Unknown web verify option: ${key}`);

const outputRoot = path.join(repositoryRoot, "dist", "salt-ai-web");
const receiptPath = path.join(outputRoot, "release-receipt.json");
const routeMapPath = path.join(outputRoot, "route-map.json");
const [receipt, routeMap] = await Promise.all([
  readJson(receiptPath),
  readJson(routeMapPath),
]);
const validateReceipt = new Ajv2020({ allErrors: true, strict: true }).compile(
  await readJson(
    path.join(
      repositoryRoot,
      "scripts/schemas/saltAiWebReleaseReceiptV1.schema.json",
    ),
  ),
);
assert(
  validateReceipt(receipt),
  `Web receipt is invalid: ${JSON.stringify(validateReceipt.errors)}`,
);
assert(
  receipt.contract === "salt-ai-web-release-receipt/1" &&
    receipt.publishable === false &&
    receipt.deployment === "not-performed" &&
    routeMap.contract === "salt-ai-web-route-map/2" &&
    receipt.bundle_digest === routeMap.bundle_digest &&
    receipt.route_map.routes === routeMap.routes.length,
  "Salt AI web receipt and route map do not share the staged v1 identity",
);
const routeMapBytes = await readFile(routeMapPath);
assert(
  receipt.route_map.sha256 === sha256(routeMapBytes) &&
    receipt.route_map.bytes === routeMapBytes.byteLength,
  "Web route-map receipt identity is stale",
);

const routeByPath = new Map();
for (const route of routeMap.routes) {
  assert(
    !routeByPath.has(route.path.toLowerCase()),
    `Case-only or duplicate route ${route.path}`,
  );
  routeByPath.set(route.path.toLowerCase(), route);
}
for (const route of routeMap.routes) {
  const file = path.resolve(outputRoot, ...route.output.split("/"));
  const containment = path.relative(outputRoot, file);
  assert(
    containment !== ".." &&
      !containment.startsWith(`..${path.sep}`) &&
      !path.isAbsolute(containment),
    `${route.path} output escapes the web artifact`,
  );
  const stats = await lstat(file);
  assert(
    stats.isFile() && !stats.isSymbolicLink(),
    `${route.path} is not a regular file`,
  );
  const bytes = await readFile(file);
  assert(
    bytes.byteLength === route.bytes && sha256(bytes) === route.sha256,
    `${route.path} bytes do not match the route map`,
  );
  if (route.path.startsWith("/ai/v1/")) {
    assert(
      route.cache_control === "public, max-age=31536000, immutable",
      `${route.path} is not immutable`,
    );
  } else {
    assert(
      (route.path === "/ai/beta/llms.txt" ||
        (receipt.workflow_preview &&
          route.path === "/ai/development/bootstrap.json")) &&
        route.cache_control === "public, max-age=60, must-revalidate",
      `Unexpected mutable route ${route.path}`,
    );
  }
  assert(!route.path.endsWith("llms-full.txt"), "llms-full.txt is forbidden");
  if (
    route.media_type.split(";")[0] === "text/html" &&
    route.path !== receipt.workflow_preview?.route
  ) {
    const html = bytes.toString("utf8");
    assert(
      route.alternate &&
        route.describedby &&
        html.includes(
          `rel="alternate" type="text/markdown" href="${route.alternate}"`,
        ) &&
        html.includes(`rel="describedby" href="${route.describedby}"`) &&
        routeByPath.has(route.alternate.toLowerCase()),
      `${route.path} lacks its Markdown alternate or discovery relation`,
    );
  }
}

if (receipt.workflow_preview) {
  const { readValidatedWorkflowPreview } = await import(
    "./checkSaltSampleAppsHelpers.mjs"
  );
  const { createKnowledgeStore, resolveKnowledgeDocument } = await import(
    "../dist/salt-ds-knowledge/dist-es/public.js"
  );
  const verified = verifyKnowledgeArtifactContract({
    packageRoot: path.join(repositoryRoot, "packages/knowledge"),
    manifestPath: "generated/manifest.json",
    publicationInventoryPath: "generated/publication-files.json",
  });
  assert(
    verified.manifest.bundle_digest === receipt.bundle_digest &&
      sha256(verified.manifestBytes) === receipt.knowledge_manifest.sha256,
    "Workflow website and current Knowledge bundle differ",
  );
  const retained = await readValidatedWorkflowPreview({
    cohortReceiptPath: path.resolve(
      repositoryRoot,
      receipt.workflow_preview.path,
    ),
    verifiedKnowledge: verified,
  });
  for (const key of ["path", "sha256", "bytes"]) {
    assert(
      retained.receipt[key] === receipt.workflow_preview[key],
      "Workflow cohort receipt changed after web generation",
    );
  }
  assert(
    retained.descriptor.tree_sha256 === receipt.workflow_preview.tree_sha256,
    "Workflow preview tree changed after web generation",
  );
  const immutableBase = `/ai/v1/${receipt.digest_segment}`;
  async function descriptorBytes(descriptor, label) {
    assert(
      descriptor &&
        typeof descriptor.url === "string" &&
        descriptor.url.startsWith(`${immutableBase}/`),
      `${label} is not from this immutable bundle`,
    );
    const route = routeByPath.get(descriptor.url.toLowerCase());
    assert(
      route &&
        route.sha256 === descriptor.sha256 &&
        route.bytes === descriptor.bytes,
      `${label} descriptor differs from its web route`,
    );
    return readFile(path.resolve(outputRoot, ...route.output.split("/")));
  }
  const bootstrapDescriptor = receipt.workflow_preview.bootstrap;
  assert(
    bootstrapDescriptor.path === "/ai/development/bootstrap.json",
    "Unexpected development selector",
  );
  const bootstrapRoute = routeByPath.get(bootstrapDescriptor.path);
  assert(
    bootstrapRoute?.sha256 === bootstrapDescriptor.sha256 &&
      bootstrapRoute?.bytes === bootstrapDescriptor.bytes,
    "Development selector descriptor differs",
  );
  const bootstrap = JSON.parse(
    await readFile(path.resolve(outputRoot, bootstrapRoute.output), "utf8"),
  );
  assert(
    bootstrap.contract === "salt-workflow-development/1" &&
      bootstrap.development === true &&
      bootstrap.publishable === false &&
      bootstrap.bundle_digest === receipt.bundle_digest &&
      typeof bootstrap.workflow?.id === "string" &&
      bootstrap.button?.route === "/salt/components/button/examples",
    "Invalid selected development workflow",
  );
  const store = createKnowledgeStore({
    bundleDir: path.join(repositoryRoot, "packages/knowledge/generated"),
  });
  const recipeBytes = store.readArtifact(retained.descriptor.recipe.artifact);
  const recipe = JSON.parse(recipeBytes.toString("utf8"));
  assert(
    bootstrap.workflow.id === recipe.id &&
      (
        await descriptorBytes(bootstrap.workflow.recipe, "Workflow recipe")
      ).equals(recipeBytes) &&
      bootstrap.workflow.recipe.content_identity ===
        recipe.source_identity.content_identity,
    "Website recipe is not the verified packed recipe",
  );
  assert(
    bootstrap.workflow.files.length === recipe.files.length,
    "Website recipe file inventory differs",
  );
  for (const [index, file] of recipe.files.entries()) {
    const served = bootstrap.workflow.files[index];
    assert(
      stableJson(served) ===
        stableJson({
          ...file,
          url: `${immutableBase}/${file.artifact_path}.txt`,
        }),
      `Website file reference differs: ${file.path}`,
    );
    assert(
      (await descriptorBytes(served, file.path)).equals(
        store.readArtifact(file.artifact_path),
      ),
      `Website and packed recipe file bytes differ: ${file.path}`,
    );
  }
  for (const [id, selected] of [
    [recipe.id, bootstrap.workflow],
    ["guide.button.loading", bootstrap.button],
  ]) {
    const result = resolveKnowledgeDocument(store, {
      identifier: `record:guide:${id}`,
    });
    const canonical = result.document?.canonical;
    const detail = store.getContentValue(
      store.getRecord("guide", id).detail_content_ref,
    );
    assert(
      result.status === "resolved" &&
        canonical &&
        selected.guidance.reference === canonical.reference &&
        selected.guidance.content_identity === canonical.content_identity &&
        selected.route === detail.document?.source.route,
      `Website and local-tool guidance identity differ: ${id}`,
    );
    const canonicalBytes = Buffer.from(stableJson(canonical), "utf8");
    assert(
      (
        await descriptorBytes(selected.guidance.document, `${id} document`)
      ).equals(canonicalBytes),
      `Website canonical sections differ from local-tool output: ${id}`,
    );
    assert(
      (await descriptorBytes(selected.guidance, `${id} Markdown`)).equals(
        store.readArtifact(`markdown/guides/${id}.md`),
      ),
      `Website Markdown differs: ${id}`,
    );
    if (id === "guide.button.loading") {
      assert(
        selected.files.length === canonical.files.length,
        "Button file inventory differs",
      );
      for (const [index, file] of canonical.files.entries()) {
        const served = selected.files[index];
        const source = detail.files.find(
          (entry) => entry.source_path === file.path,
        );
        assert(
          source &&
            stableJson(served) ===
              stableJson({
                ...file,
                url: `${immutableBase}/guidance/guide.button.loading/files/${file.path}.txt`,
              }),
          "Button source reference differs from canonical guidance",
        );
        assert(
          (await descriptorBytes(served, file.path)).equals(
            Buffer.from(store.getContentSourceText(source.code_ref), "utf8"),
          ),
          "Button source bytes differ",
        );
      }
    }
  }
  const previewBase = `${immutableBase}/examples/workflows/${recipe.id}/preview/${retained.descriptor.tree_sha256.slice(7)}`;
  const previewUrl = `${previewBase}/${retained.descriptor.entry}`;
  assert(
    bootstrap.workflow.preview.url === previewUrl &&
      receipt.workflow_preview.route === previewUrl &&
      bootstrap.workflow.preview.tree_sha256 ===
        retained.descriptor.tree_sha256,
    "Compiled preview selection differs",
  );
  const previewRoutes = routeMap.routes.filter((route) =>
    route.path.startsWith(`${previewBase}/`),
  );
  assert(
    previewRoutes.length === retained.files.length,
    "Compiled preview route inventory differs",
  );
  for (const file of retained.files) {
    assert(
      routeByPath.get(`${previewBase}/${file.path}`.toLowerCase())
        ?.media_type === file.mediaType,
      `Compiled preview media type differs: ${file.path}`,
    );
    const bytes = await descriptorBytes(
      {
        url: `${previewBase}/${file.path}`,
        sha256: sha256(file.bytes),
        bytes: file.bytes.byteLength,
      },
      `Compiled preview ${file.path}`,
    );
    assert(
      bytes.equals(file.bytes),
      `Compiled preview bytes differ: ${file.path}`,
    );
  }
}

if (args.has("--verify-site-preview")) {
  assert(
    receipt.workflow_preview,
    "Site preview requires the verified workflow cohort",
  );
  const publicRoot = path.resolve(repositoryRoot, "site/public");
  const actual = [];
  async function visit(directory, relative = "ai") {
    const stats = await lstat(directory);
    assert(
      stats.isDirectory() && !stats.isSymbolicLink(),
      "Site preview contains a linked directory",
    );
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const entryPath = `${relative}/${entry.name}`;
      assert(
        !entry.isSymbolicLink(),
        `Site preview contains a link: ${entryPath}`,
      );
      if (entry.isDirectory())
        await visit(path.join(directory, entry.name), entryPath);
      else {
        assert(
          entry.isFile(),
          `Site preview contains a non-file: ${entryPath}`,
        );
        actual.push(entryPath);
      }
    }
  }
  await visit(path.join(publicRoot, "ai"));
  const expected = routeMap.routes
    .map((route) => route.output.slice("artifact/".length))
    .sort();
  assert(
    stableJson(actual.sort()) === stableJson(expected),
    "Site preview file inventory differs from web artifact",
  );
  for (const route of routeMap.routes) {
    const bytes = await readFile(
      path.join(publicRoot, route.output.slice("artifact/".length)),
    );
    assert(
      bytes.byteLength === route.bytes && sha256(bytes) === route.sha256,
      `Site preview bytes differ: ${route.path}`,
    );
  }
}

for (const indexPath of [receipt.pointers.immutable, receipt.pointers.beta]) {
  const route = routeByPath.get(indexPath.toLowerCase());
  assert(
    route && route.bytes <= 64 * 1024,
    `${indexPath} is absent or over 64 KiB`,
  );
  const text = (
    await readFile(path.resolve(outputRoot, ...route.output.split("/")))
  ).toString("utf8");
  for (const match of text.matchAll(/\]\((\/ai\/[^)]+\.md)\)/gu)) {
    assert(
      match[1].startsWith(`/ai/v1/${receipt.digest_segment}/`) &&
        routeByPath.get(match[1].toLowerCase())?.media_type ===
          "text/markdown; charset=utf-8",
      `${indexPath} links a mutable, missing, or non-Markdown target ${match[1]}`,
    );
  }
}

assert(
  receipt.pointers.current === null &&
    receipt.pointers.root === null &&
    !routeByPath.has("/llms.txt") &&
    ![...routeByPath.keys()].some((route) => route.startsWith("/ai/current/")),
  "Beta candidate contains a GA current/root pointer",
);

const generatedRoot = path.join(
  repositoryRoot,
  "packages",
  "knowledge",
  "generated",
);
for (const entry of Object.values(receipt.agent_support)) {
  const npmBytes = await readFile(
    path.join(generatedRoot, ...entry.npm_path.split("/")),
  );
  const webRoute = routeByPath.get(entry.web_path.toLowerCase());
  const webBytes = await readFile(
    path.resolve(outputRoot, ...webRoute.output.split("/")),
  );
  assert(
    sha256(npmBytes) === entry.sha256 &&
      sha256(webBytes) === entry.sha256 &&
      npmBytes.equals(webBytes),
    `${entry.npm_path} npm/web bytes differ`,
  );
}

if (args.get("--public-docs-preview-receipt")) {
  const previewPath = path.resolve(
    repositoryRoot,
    String(args.get("--public-docs-preview-receipt")),
  );
  const previewBytes = await readFile(previewPath);
  const preview = JSON.parse(previewBytes.toString("utf8"));
  assert(
    receipt.public_docs_preview?.sha256 === sha256(previewBytes) &&
      receipt.public_docs_preview?.projection_sha256 ===
        preview.projection_sha256 &&
      preview.production_navigation === false,
    "Web artifact does not bind the supplied public-docs preview receipt",
  );
}

if (args.get("--forbid-production-ai-navigation")) {
  const [rootReadme, siteIndex, gettingStarted, aiNotice] = await Promise.all([
    readFile(path.join(repositoryRoot, "README.md"), "utf8"),
    readFile(path.join(repositoryRoot, "site/docs/index.mdx"), "utf8"),
    readFile(
      path.join(repositoryRoot, "site/docs/getting-started/index.mdx"),
      "utf8",
    ),
    readFile(
      path.join(repositoryRoot, "site/docs/getting-started/ai.mdx"),
      "utf8",
    ),
  ]);
  for (const [label, source] of [
    ["root README", rootReadme],
    ["site index", siteIndex],
    ["getting-started index", gettingStarted],
  ]) {
    assert(
      !/@salt-ds\/(?:cli|knowledge|mcp)|\/ai\/(?:current|beta|v1)\//u.test(
        source,
      ),
      `${label} activates unreleased Salt AI navigation or install claims`,
    );
  }
  assert(
    aiNotice.includes("has not been released") &&
      !/@salt-ds\/(?:cli|knowledge|mcp)@[0-9]/u.test(aiNotice),
    "Live AI page is not the honest unreleased notice",
  );
}

console.log(
  `Verified ${routeMap.routes.length} staged Salt AI web routes; production navigation remains inactive.`,
);
