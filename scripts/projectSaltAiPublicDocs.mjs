#!/usr/bin/env node

import { lstat, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import {
  assert,
  gitHeadCommit,
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
const mode = String(args.get("--mode") ?? "");
assert(
  ["preview", "final", "rebind-landed", "activate-navigation"].includes(mode),
  "--mode must be preview, final, rebind-landed, or activate-navigation",
);
assert(args.get("--output"), "--output is required");

function contained(relative, root = repositoryRoot) {
  assert(
    typeof relative === "string" &&
      relative.length > 0 &&
      !relative.includes("\\") &&
      !path.isAbsolute(relative) &&
      !relative.split("/").includes(".."),
    `Unsafe public-docs path: ${String(relative)}`,
  );
  const result = path.resolve(root, ...relative.split("/"));
  const containment = path.relative(root, result);
  assert(
    containment !== ".." &&
      !containment.startsWith(`..${path.sep}`) &&
      !path.isAbsolute(containment),
    `Public-docs path escapes its root: ${relative}`,
  );
  return result;
}

async function regularBytes(file, label) {
  const stats = await lstat(file);
  assert(stats.isFile() && !stats.isSymbolicLink(), `${label} is not a regular file`);
  return readFile(file);
}

const outputPath = path.resolve(repositoryRoot, String(args.get("--output")));
assert(
  portablePath(outputPath).startsWith("dist/"),
  "Public-docs receipts must be ignored dist artifacts",
);

if (mode !== "preview") {
  const previewPath = args.get("--preview-receipt");
  assert(previewPath, `${mode} requires --preview-receipt`);
  const preview = await readJson(contained(String(previewPath)));
  assert(
    preview.contract === "salt-public-docs-projection/1" &&
      preview.mode === "preview" &&
      preview.navigation_status === "staged" &&
      preview.production_navigation === false,
    "Finalization requires the exact staged preview receipt",
  );
  if (mode === "activate-navigation") {
    assert(
      args.get("--terminal-r3-receipt"),
      "activate-navigation requires --terminal-r3-receipt",
    );
    throw new Error(
      "Navigation activation remains closed until Unit 09c validates the terminal R3 receipt.",
    );
  }
  for (const option of [
    "--mcp-final-disposition-receipt",
    "--effective-selected-graph-receipt",
    "--web-receipt",
  ]) {
    assert(args.get(option), `${mode} requires ${option}`);
    await regularBytes(contained(String(args.get(option))), option);
  }
  if (mode === "rebind-landed") {
    assert(args.get("--expected-receipt"), "rebind-landed requires --expected-receipt");
    const expected = await readJson(contained(String(args.get("--expected-receipt"))));
    assert(
      expected.projection_sha256 === preview.projection_sha256,
      "Landed public-doc projection differs from the reviewed preview",
    );
  }
  await writeJsonAtomic(outputPath, {
    ...preview,
    mode,
    source_commit: await gitHeadCommit(),
    finalized_from: {
      path: portablePath(contained(String(previewPath))),
      sha256: sha256(await readFile(contained(String(previewPath)))),
    },
  });
  console.log(`Wrote ${portablePath(outputPath)} (${mode}).`);
  process.exit(0);
}

const sourceRootInput = String(args.get("--source-root") ?? "");
assert(
  sourceRootInput === "tooling/ai/public-docs-v1",
  "preview requires the reviewed tooling/ai/public-docs-v1 source root",
);
const sourceRoot = contained(sourceRootInput);
const sourceManifestPath = path.join(sourceRoot, "manifest.json");
const sourceManifestBytes = repositoryTextBytes(
  await regularBytes(sourceManifestPath, "Public-docs source manifest"),
);
const sourceManifest = JSON.parse(sourceManifestBytes.toString("utf8"));
assert(
  sourceManifest.contract === "salt-public-docs-source/1" &&
    sourceManifest.schema_version === "1.0.0" &&
    sourceManifest.bundle_version === "0.0.0" &&
    sourceManifest.mcp === "excluded-until-final-disposition" &&
    Array.isArray(sourceManifest.documents) &&
    sourceManifest.documents.length > 0,
  "Public-docs source manifest is not the staged v1 contract",
);
const packageVersion = (await readJson(path.join(repositoryRoot, "packages/cli/package.json"))).version;
assert(
  sourceManifest.bundle_version === packageVersion,
  "Public-docs source does not use the exact CLI package version",
);

const documents = [];
const ids = new Set();
const routes = new Set();
for (const document of sourceManifest.documents) {
  assert(
    typeof document.id === "string" &&
      !ids.has(document.id) &&
      typeof document.source === "string" &&
      /^\/ai\/[a-z0-9/-]+\/$/u.test(document.route) &&
      !routes.has(document.route) &&
      document.visibility === "staged-public" &&
      typeof document.title === "string" &&
      typeof document.summary === "string",
    `Invalid or duplicate public document ${String(document.id)}`,
  );
  ids.add(document.id);
  routes.add(document.route);
  const sourcePath = contained(document.source, sourceRoot);
  const bytes = repositoryTextBytes(
    await regularBytes(sourcePath, `Public document ${document.id}`),
  );
  const text = bytes.toString("utf8");
  assert(text.startsWith(`# ${document.title}\n`), `${document.id} title does not match its H1`);
  assert(
    text.includes("Nonproduction preview") &&
      !/@salt-ds\/mcp|salt-mcp|mcpServers/iu.test(text) &&
      !/@salt-ds\/cli@latest/iu.test(text) &&
      !/https:\/\/storybook\./iu.test(text),
    `${document.id} contains a live, MCP, latest, or Storybook claim`,
  );
  for (const match of text.matchAll(/\bnpx\s+([^\r\n`]+)/giu)) {
    assert(match[1].trimStart().startsWith("--no-install "), `${document.id} has unpinned npx usage`);
  }
  documents.push({
    id: document.id,
    source: `${sourceRootInput}/${document.source}`,
    route: document.route,
    markdown_route: `${document.route}index.md`,
    title: document.title,
    summary: document.summary,
    media_type: "text/markdown; charset=utf-8",
    sha256: sha256(bytes),
    bytes: bytes.byteLength,
  });
}
documents.sort((left, right) => left.id.localeCompare(right.id));
const navigationTargets = [...sourceManifest.navigation_activation_targets].sort();
for (const target of navigationTargets) await regularBytes(contained(target), `Navigation target ${target}`);
const projectionSha256 = sha256(Buffer.from(stableJson(documents), "utf8"));
const receipt = {
  $schema: "https://www.saltdesignsystem.com/ai/schemas/salt-public-docs-projection-1.json",
  schema_version: "1.0.0",
  contract: "salt-public-docs-projection/1",
  mode: "preview",
  source_commit: await gitHeadCommit(),
  source_root: sourceRootInput,
  source_manifest: {
    path: `${sourceRootInput}/manifest.json`,
    sha256: sha256(sourceManifestBytes),
    bytes: sourceManifestBytes.byteLength,
  },
  bundle_version: sourceManifest.bundle_version,
  projection_sha256: projectionSha256,
  documents,
  navigation_activation_targets: navigationTargets,
  navigation_status: "staged",
  production_navigation: false,
  nonproduction_marker: "Salt AI nonproduction preview",
  mcp: "excluded-until-final-disposition",
};
await writeJsonAtomic(outputPath, receipt);
console.log(`Wrote ${portablePath(outputPath)} (${projectionSha256}).`);
