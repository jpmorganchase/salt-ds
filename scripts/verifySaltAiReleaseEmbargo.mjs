import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import {
  assert,
  gitHeadCommit,
  parseArgs,
  portablePath,
  readJson,
  repositoryRoot,
  sha256File,
  writeJsonAtomic,
} from "./saltAiEvidenceUtils.mjs";

const AI_PACKAGES = new Set([
  "@salt-ds/knowledge",
  "@salt-ds/cli",
  "@salt-ds/mcp",
]);

async function filesIn(directory, predicate) {
  try {
    return (await readdir(directory, { withFileTypes: true }))
      .filter((entry) => entry.isFile() && predicate(entry.name))
      .map((entry) => path.join(directory, entry.name))
      .sort();
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

function changesetPackages(source) {
  const frontmatter = source.match(/^---\s*\n([\s\S]*?)\n---/u)?.[1] ?? "";
  return [...frontmatter.matchAll(/^"([^"]+)":\s*(?:patch|minor|major)$/gmu)].map(
    (match) => match[1],
  );
}

function verifyWorkflowSource(source, label) {
  const canPublish =
    /id-token:\s*write/u.test(source) ||
    /(?:changeset\s+publish|npm\s+publish|publish:\s*yarn\s+release)/u.test(
      source,
    );
  if (canPublish) {
    assert(
      !/^\s*issue_comment:/mu.test(source),
      `${label} combines issue_comment with publication authority`,
    );
    assert(
      !/^\s*pull_request(?:_target)?:/mu.test(source),
      `${label} combines a pull-request event with publication authority`,
    );
  }
  assert(
    !/(?:changeset\s+publish|npm\s+publish)/u.test(source),
    `${label} invokes a direct publisher outside the guarded root release script`,
  );
}

function verifyHostileWorkflowFixtures() {
  const invalid = [
    "on:\n  issue_comment:\npermissions:\n  id-token: write\n",
    "on:\n  pull_request_target:\njobs:\n  release:\n    steps:\n      - run: npm publish\n",
    "on:\n  push:\njobs:\n  release:\n    steps:\n      - run: yarn changeset publish\n",
  ];
  for (const [index, source] of invalid.entries()) {
    let rejected = false;
    try {
      verifyWorkflowSource(source, `hostile-workflow-${index + 1}`);
    } catch {
      rejected = true;
    }
    assert(rejected, `Hostile workflow fixture ${index + 1} was accepted`);
  }
  verifyWorkflowSource(
    "on:\n  push:\n    branches: [main]\npermissions:\n  id-token: write\njobs:\n  release:\n    steps:\n      - uses: changesets/action@pinned\n        with:\n          publish: yarn release\n",
    "valid-main-push-workflow",
  );
  return invalid.length + 1;
}

const args = parseArgs(process.argv.slice(2));
const output = path.resolve(
  repositoryRoot,
  String(
    args.get("--output") ??
      "dist/salt-ai-baseline/release-embargo-receipt.json",
  ),
);
const workflowOutput = path.resolve(
  repositoryRoot,
  String(
    args.get("--workflow-output") ??
      "dist/salt-ai-baseline/workflow-policy-receipt.json",
  ),
);

const rootManifestPath = path.join(repositoryRoot, "package.json");
const rootManifest = await readJson(rootManifestPath);
const releaseScript = rootManifest.scripts?.release;
assert(
  typeof releaseScript === "string" &&
    releaseScript.startsWith("yarn verify:salt-ai-release-embargo && "),
  "The root release script must run the Salt AI embargo before build or publication",
);

const directPublisherPattern =
  /(?:changeset\s+publish|npm\s+publish|yarn\s+npm\s+publish)/u;
for (const [name, command] of Object.entries(rootManifest.scripts ?? {})) {
  if (!directPublisherPattern.test(command)) continue;
  assert(name === "release", `Root script ${name} bypasses the release embargo`);
  assert(
    command.indexOf("verify:salt-ai-release-embargo") <
      command.search(directPublisherPattern),
    `Root script ${name} invokes publication before the embargo`,
  );
}

const packageStates = [];
for (const packageName of ["knowledge", "cli", "mcp"]) {
  const manifestPath = path.join(
    repositoryRoot,
    "packages",
    packageName,
    "package.json",
  );
  try {
    if (!(await stat(manifestPath)).isFile()) continue;
  } catch (error) {
    if (error.code === "ENOENT") continue;
    throw error;
  }
  const manifest = await readJson(manifestPath);
  assert(
    AI_PACKAGES.has(manifest.name),
    `${portablePath(manifestPath)} has an unexpected AI package name`,
  );
  assert(
    manifest.private === true,
    `${manifest.name} must remain private until the protected publisher replaces the embargo`,
  );
  packageStates.push({
    manifest: portablePath(manifestPath),
    name: manifest.name,
    private: true,
    version: manifest.version,
  });
}

const changesetFiles = await filesIn(
  path.join(repositoryRoot, ".changeset"),
  (name) => name.endsWith(".md") && name !== "README.md",
);
const changesetHashes = [];
for (const file of changesetFiles) {
  const source = await readFile(file, "utf8");
  const selectedAiPackages = changesetPackages(source).filter((name) =>
    AI_PACKAGES.has(name),
  );
  assert(
    selectedAiPackages.length === 0,
    `${portablePath(file)} selects embargoed AI package(s): ${selectedAiPackages.join(", ")}`,
  );
  changesetHashes.push({ path: portablePath(file), sha256: await sha256File(file) });
}

const workflowFiles = await filesIn(
  path.join(repositoryRoot, ".github", "workflows"),
  (name) => /\.ya?ml$/u.test(name),
);
const workflowHashes = [];
const workflowFixtureCount = verifyHostileWorkflowFixtures();
for (const file of workflowFiles) {
  const source = await readFile(file, "utf8");
  verifyWorkflowSource(source, portablePath(file));
  workflowHashes.push({ path: portablePath(file), sha256: await sha256File(file) });
}

const sourceCommit = await gitHeadCommit();
const common = {
  source_commit: sourceCommit,
  ai_packages: [...AI_PACKAGES].sort(),
  package_states: packageStates.sort((left, right) =>
    left.name.localeCompare(right.name),
  ),
};
await writeJsonAtomic(output, {
  $schema:
    "https://www.saltdesignsystem.com/ai/schemas/salt-ai-release-embargo-receipt-1.json",
  schema_version: "1.0.0",
  kind: "release-embargo-receipt",
  ...common,
  release_script: releaseScript,
  changesets: changesetHashes,
  result: "pass",
});
await writeJsonAtomic(workflowOutput, {
  $schema:
    "https://www.saltdesignsystem.com/ai/schemas/salt-ai-workflow-policy-receipt-1.json",
  schema_version: "1.0.0",
  kind: "workflow-policy-receipt",
  ...common,
  workflows: workflowHashes,
  prohibited_events: ["issue_comment", "pull_request", "pull_request_target"],
  fixture_count: workflowFixtureCount,
  result: "pass",
});

console.log(
  `Salt AI release embargo verified (${packageStates.length} AI package manifests, ${changesetFiles.length} changesets, ${workflowFiles.length} workflows, ${workflowFixtureCount} policy fixtures).`,
);
