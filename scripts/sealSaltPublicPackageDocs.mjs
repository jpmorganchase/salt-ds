#!/usr/bin/env node

import { lstat, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import Ajv2020 from "ajv/dist/2020.js";

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
const mode = String(args.get("--mode") ?? "");
assert(["provisional", "final", "rebind-landed"].includes(mode), "--mode must be provisional, final, or rebind-landed");
assert(args.get("--inventory"), "--inventory is required");
assert(args.get("--pack-report"), "--pack-report is required");
assert(args.get("--output"), "--output is required");

function inside(relative) {
  assert(
    typeof relative === "string" &&
      relative.length > 0 &&
      !relative.includes("\\") &&
      !path.isAbsolute(relative) &&
      !relative.split("/").includes(".."),
    `Unsafe package-doc path: ${String(relative)}`,
  );
  const result = path.resolve(repositoryRoot, ...relative.split("/"));
  const containment = path.relative(repositoryRoot, result);
  assert(
    containment !== ".." &&
      !containment.startsWith(`..${path.sep}`) &&
      !path.isAbsolute(containment),
    `Package-doc path escapes the repository: ${relative}`,
  );
  return result;
}

async function regularBytes(file, label) {
  const stats = await lstat(file);
  assert(stats.isFile() && !stats.isSymbolicLink(), `${label} is not a regular file`);
  return readFile(file);
}

assert(
  mode === "provisional",
  `${mode} package-doc sealing remains closed until Unit 08c supplies a final MCP disposition and effective graph`,
);
const inventoryPath = inside(String(args.get("--inventory")));
const packReportPath = inside(String(args.get("--pack-report")));
const outputPath = inside(String(args.get("--output")));
assert(portablePath(outputPath).startsWith("dist/"), "Package-doc receipt must be an ignored dist artifact");
const [inventoryBytes, packReportBytes] = await Promise.all([
  regularBytes(inventoryPath, "Public package-doc inventory"),
  regularBytes(packReportPath, "AI pack report"),
]);
const inventory = JSON.parse(inventoryBytes.toString("utf8"));
const packReport = JSON.parse(packReportBytes.toString("utf8"));
assert(
  inventory.schema_version === "1.0.0" &&
    Array.isArray(inventory.packages) &&
    inventory.packages.length === 16,
  "Public package-doc inventory is not the frozen v1 set",
);
assert(
  packReport.contract === "salt-ai-pack-report@1" &&
    packReport.policy_profile === "release-complete" &&
    packReport.publishable === false &&
    packReport.knowledge_bundle?.agent_support?.skill &&
    packReport.knowledge_bundle?.agent_support?.agents_pointer,
  "Provisional package docs require the release-complete pack report",
);
const packedByName = new Map(packReport.packages.map((entry) => [entry.name, entry]));
assert(
  [...packedByName.keys()].sort().join("\0") ===
    ["@salt-ds/cli", "@salt-ds/knowledge"].join("\0"),
  "Provisional package-doc seal must exclude conditional MCP bytes",
);

const packages = [];
for (const entry of inventory.packages) {
  assert(entry.workspace_path, `${entry.name} has no workspace path`);
  const manifestPath = inside(`${entry.workspace_path}/package.json`);
  const readmePath = inside(entry.readme_path);
  const [manifestBytes, readmeBytes] = await Promise.all([
    regularBytes(manifestPath, `${entry.name} manifest`),
    regularBytes(readmePath, `${entry.name} README`),
  ]);
  const manifest = JSON.parse(manifestBytes.toString("utf8"));
  const packed = packedByName.get(entry.name);
  const metadataComplete =
    typeof manifest.description === "string" &&
    typeof manifest.homepage === "string" &&
    Array.isArray(manifest.keywords) &&
    manifest.keywords.length > 0 &&
    manifest.repository !== undefined &&
    typeof manifest.license === "string" &&
    manifest.bugs?.url ===
      inventory.support_destinations[entry.support_destination];
  const effectivePublic =
    entry.lifecycle === "publishable" ||
    entry.name === "@salt-ds/cli" ||
    entry.name === "@salt-ds/knowledge";
  assert(!effectivePublic || metadataComplete, `${entry.name} public metadata is incomplete`);
  if (packed) {
    assert(
      packed.version === manifest.version &&
        packed.readme?.sha256 === sha256(readmeBytes),
      `${entry.name} packed README/version differs from the reviewed source`,
    );
  }
  packages.push({
    name: entry.name,
    lifecycle: entry.lifecycle,
    effective_public: effectivePublic,
    manifest_sha256: packed?.manifest?.sha256 ?? sha256(manifestBytes),
    readme_sha256: sha256(readmeBytes),
    packed_readme_sha256: effectivePublic
      ? packed?.readme?.sha256 ?? sha256(readmeBytes)
      : null,
    metadata_complete: metadataComplete,
    support_destination: entry.support_destination,
  });
}
packages.sort((left, right) => left.name.localeCompare(right.name));
const selectedGraphSha256 = sha256(
  Buffer.from(
    stableJson(
      packages
        .filter((entry) => entry.effective_public)
        .map((entry) => ({ name: entry.name, manifest_sha256: entry.manifest_sha256 })),
    ),
    "utf8",
  ),
);
const receipt = {
  $schema:
    "https://www.saltdesignsystem.com/schemas/salt-public-package-docs-effective-v1.json",
  schema_version: "1.0.0",
  contract: "salt-public-package-docs-effective/1",
  mode: "provisional",
  publishable: false,
  inventory_sha256: sha256(inventoryBytes),
  pack_report: {
    path: portablePath(packReportPath),
    sha256: sha256(packReportBytes),
    policy_profile: packReport.policy_profile,
  },
  selected_graph_sha256: selectedGraphSha256,
  mcp_disposition: "conditional-excluded",
  packages,
};
const schema = await readJson(
  path.join(repositoryRoot, "scripts/schemas/saltPublicPackageDocsEffectiveV1.schema.json"),
);
const validate = new Ajv2020({ allErrors: true, strict: true }).compile(schema);
assert(validate(receipt), `Package-doc receipt schema failure: ${JSON.stringify(validate.errors)}`);
await writeJsonAtomic(outputPath, receipt);
console.log(`Sealed ${packages.filter((entry) => entry.effective_public).length} effective public package docs (${selectedGraphSha256}).`);
