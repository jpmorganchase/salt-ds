#!/usr/bin/env node

import { lstat, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import {
  assert,
  parseArgs,
  readJson,
  repositoryRoot,
  sha256,
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
]);
for (const key of args.keys()) assert(allowed.has(key), `Unknown web verify option: ${key}`);

const outputRoot = path.join(repositoryRoot, "dist", "salt-ai-web");
const receiptPath = path.join(outputRoot, "release-receipt.json");
const routeMapPath = path.join(outputRoot, "route-map.json");
const [receipt, routeMap] = await Promise.all([
  readJson(receiptPath),
  readJson(routeMapPath),
]);
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
  assert(!routeByPath.has(route.path.toLowerCase()), `Case-only or duplicate route ${route.path}`);
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
  assert(stats.isFile() && !stats.isSymbolicLink(), `${route.path} is not a regular file`);
  const bytes = await readFile(file);
  assert(
    bytes.byteLength === route.bytes && sha256(bytes) === route.sha256,
    `${route.path} bytes do not match the route map`,
  );
  if (route.path.startsWith("/ai/v1/")) {
    assert(route.cache_control === "public, max-age=31536000, immutable", `${route.path} is not immutable`);
  } else {
    assert(
      route.path === "/ai/beta/llms.txt" &&
        route.cache_control === "public, max-age=60, must-revalidate",
      `Unexpected mutable route ${route.path}`,
    );
  }
  assert(!route.path.endsWith("llms-full.txt"), "llms-full.txt is forbidden");
  if (route.media_type === "text/html; charset=utf-8") {
    const html = bytes.toString("utf8");
    assert(
      route.alternate &&
        route.describedby &&
        html.includes(`rel="alternate" type="text/markdown" href="${route.alternate}"`) &&
        html.includes(`rel="describedby" href="${route.describedby}"`) &&
        routeByPath.has(route.alternate.toLowerCase()),
      `${route.path} lacks its Markdown alternate or discovery relation`,
    );
  }
}

for (const indexPath of [receipt.pointers.immutable, receipt.pointers.beta]) {
  const route = routeByPath.get(indexPath.toLowerCase());
  assert(route && route.bytes <= 64 * 1024, `${indexPath} is absent or over 64 KiB`);
  const text = (await readFile(path.resolve(outputRoot, ...route.output.split("/")))).toString("utf8");
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

const generatedRoot = path.join(repositoryRoot, "packages", "knowledge", "generated");
for (const entry of Object.values(receipt.agent_support)) {
  const npmBytes = await readFile(path.join(generatedRoot, ...entry.npm_path.split("/")));
  const webRoute = routeByPath.get(entry.web_path.toLowerCase());
  const webBytes = await readFile(path.resolve(outputRoot, ...webRoute.output.split("/")));
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
      receipt.public_docs_preview?.projection_sha256 === preview.projection_sha256 &&
      preview.production_navigation === false,
    "Web artifact does not bind the supplied public-docs preview receipt",
  );
}

if (args.get("--forbid-production-ai-navigation")) {
  const [rootReadme, siteIndex, gettingStarted, aiNotice] = await Promise.all([
    readFile(path.join(repositoryRoot, "README.md"), "utf8"),
    readFile(path.join(repositoryRoot, "site/docs/index.mdx"), "utf8"),
    readFile(path.join(repositoryRoot, "site/docs/getting-started/index.mdx"), "utf8"),
    readFile(path.join(repositoryRoot, "site/docs/getting-started/ai.mdx"), "utf8"),
  ]);
  for (const [label, source] of [
    ["root README", rootReadme],
    ["site index", siteIndex],
    ["getting-started index", gettingStarted],
  ]) {
    assert(
      !/@salt-ds\/(?:cli|knowledge|mcp)|\/ai\/(?:current|beta|v1)\//u.test(source),
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
