import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import {
  assert,
  commitPattern,
  gitHeadCommit,
  parseArgs,
  readJson,
  repositoryRoot,
  sha256,
  stableJson,
  writeJsonAtomic,
} from "./saltAiEvidenceUtils.mjs";

const args = parseArgs(process.argv.slice(2));
const mode = String(args.get("--mode") ?? "preflight").replaceAll("-", "_");
assert(
  ["preflight", "release", "protected_final"].includes(mode),
  `Unsupported namespace verification mode: ${mode}`,
);
const configPath = path.resolve(
  repositoryRoot,
  String(
    args.get("--config") ?? "tooling/ai/package-namespaces-v1.json",
  ),
);
const output = path.resolve(
  repositoryRoot,
  String(
    args.get("--output") ??
      "dist/salt-ai-baseline/package-namespace-receipt.json",
  ),
);
const config = await readJson(configPath);

async function livePackage(name, includeVersionIdentities) {
  const response = await fetch(
    `${config.registry.replace(/\/$/u, "")}/${encodeURIComponent(name)}`,
    { headers: { accept: "application/json" }, redirect: "error" },
  );
  if (response.status === 404) return { name, status: "absent" };
  assert(response.ok, `Registry lookup for ${name} failed with ${response.status}`);
  const document = await response.json();
  const versions = Object.keys(document.versions ?? {}).sort();
  const latest = document["dist-tags"]?.latest;
  const latestManifest = latest ? document.versions?.[latest] : undefined;
  return {
    name,
    status: "present",
    versions,
    dist_tags: document["dist-tags"] ?? {},
    deprecated_versions: versions.filter(
      (version) => typeof document.versions?.[version]?.deprecated === "string",
    ),
    repository: latestManifest?.repository ?? document.repository ?? null,
    maintainers: [...(document.maintainers ?? [])].sort((left, right) =>
      left.name.localeCompare(right.name),
    ),
    modified_at: document.time?.modified ?? null,
    latest_publisher: latestManifest?._npmUser ?? null,
    latest_integrity: latestManifest?.dist?.integrity ?? null,
    latest_attestations: latestManifest?.dist?.attestations ?? null,
    ...(includeVersionIdentities
      ? {
          version_identities: versions.map((version) => {
            const manifest = document.versions[version];
            return {
              version,
              deprecated: manifest.deprecated ?? null,
              repository: manifest.repository ?? null,
              git_head: manifest.gitHead ?? null,
              integrity: manifest.dist?.integrity ?? null,
              attestations: manifest.dist?.attestations ?? null,
            };
          }),
        }
      : {}),
  };
}

let observations;
const fixturePath = args.get("--fixture");
if (mode !== "preflight") {
  assert(
    args.get("--expected-receipt"),
    `${mode} mode requires --expected-receipt`,
  );
  assert(!fixturePath, `${mode} mode cannot use a registry fixture`);
}
if (fixturePath) {
  observations = (await readJson(path.resolve(repositoryRoot, String(fixturePath))))
    .packages;
} else {
  observations = await Promise.all(
    [config.scope_anchor, ...config.packages.map((entry) => entry.name)].map(
      (name, index) => livePackage(name, index > 0),
    ),
  );
}

const byName = new Map(observations.map((entry) => [entry.name, entry]));
const anchor = byName.get(config.scope_anchor);
assert(anchor?.status === "present", `Scope anchor ${config.scope_anchor} is absent`);

function repositoryUrl(value) {
  if (typeof value === "string") return value;
  return value?.url ?? "";
}

const normalizedRepository = (value) =>
  repositoryUrl(value)
    .replace(/^git\+/u, "")
    .replace(/\.git$/u, "")
    .replace(/\/$/u, "")
    .toLowerCase();

const repositoryDirectory = (value) =>
  typeof value === "object" && value !== null ? value.directory ?? null : null;

assert(
  normalizedRepository(anchor.repository) ===
    normalizedRepository(config.expected_repository),
  `Scope anchor ${config.scope_anchor} does not identify ${config.expected_repository}`,
);
const maintainerNames = new Set(
  (anchor.maintainers ?? []).map((maintainer) => maintainer.name),
);
for (const expected of config.scope_control.expected_maintainer_names) {
  assert(
    maintainerNames.has(expected),
    `Scope anchor ${config.scope_anchor} is missing expected maintainer ${expected}`,
  );
}
assert(
  anchor.latest_publisher?.trustedPublisher?.id ===
    config.scope_control.expected_trusted_publisher_provider,
  `Scope anchor ${config.scope_anchor} does not expose the expected trusted publisher`,
);
assert(
  config.publisher?.approval_status === "approved",
  "The protected OIDC publisher identity must be approved in the namespace policy",
);

const packages = config.packages
  .map((policy) => {
    const observed = byName.get(policy.name);
    assert(observed, `Missing namespace observation for ${policy.name}`);
    if (observed.status === "absent") {
      return { ...observed, disposition: "safe_absent" };
    }
    const repositoryMatches =
      normalizedRepository(observed.repository) ===
      normalizedRepository(config.expected_repository);
    const directoryMatches =
      repositoryDirectory(observed.repository) ===
      policy.expected_repository_directory;
    const identityAllowed = policy.existing_identity !== "must-be-absent";
    return {
      ...observed,
      disposition:
        repositoryMatches && directoryMatches && identityAllowed
          ? "owned_compatible"
          : "incompatible_existing_identity",
      expected_repository_directory: policy.expected_repository_directory,
      identity_findings: [
        ...(repositoryMatches ? [] : ["repository-mismatch"]),
        ...(directoryMatches ? [] : ["repository-directory-mismatch"]),
        ...(identityAllowed ? [] : ["existing-versions-forbidden"]),
      ],
    };
  })
  .sort((left, right) => left.name.localeCompare(right.name));

const now = args.get("--now")
  ? new Date(String(args.get("--now")))
  : new Date();
assert(!Number.isNaN(now.valueOf()), "--now must be an ISO-8601 timestamp");
const expiresAt = new Date(now.valueOf() + config.receipt_ttl_hours * 3_600_000);
const sourceCommit = await gitHeadCommit();
assert(commitPattern(sourceCommit), "Unable to resolve the source commit");

if (args.get("--expected-receipt")) {
  const previous = await readJson(
    path.resolve(repositoryRoot, String(args.get("--expected-receipt"))),
  );
  assert(
    previous.kind === "package-namespace-receipt" ||
      previous.kind === "package-namespace-release-receipt",
    "Expected namespace receipt has an unsupported kind",
  );
  assert(
    previous.result === "pass",
    "Expected namespace receipt did not pass",
  );
  if (args.get("--require-unexpired") || mode === "protected_final") {
    assert(
      new Date(previous.expires_at).valueOf() > now.valueOf(),
      "Expected namespace receipt has expired",
    );
  }
  assert(
    stableJson(previous.publisher) === stableJson(config.publisher),
    "Protected publisher identity changed since the expected namespace receipt",
  );
  for (const prior of previous.packages) {
    const current = packages.find((entry) => entry.name === prior.name);
    assert(current, `Namespace ${prior.name} disappeared from the policy`);
    assert(
      prior.disposition === current.disposition ||
        (prior.disposition === "safe_absent" &&
          current.disposition === "owned_compatible"),
      `Namespace ${prior.name} changed incompatibly`,
    );
  }
}

const receipt = {
  $schema:
    "https://www.saltdesignsystem.com/ai/schemas/salt-ai-package-namespace-receipt-1.json",
  schema_version: "1.0.0",
  kind:
    mode === "preflight"
      ? "package-namespace-receipt"
      : "package-namespace-release-receipt",
  mode,
  source_commit: sourceCommit,
  checked_at: now.toISOString(),
  expires_at: expiresAt.toISOString(),
  registry: config.registry,
  scope: config.scope,
  scope_control: {
    method: "existing-public-package-repository-identity",
    anchor_package: config.scope_anchor,
    repository: config.expected_repository,
    controlling_organization: config.controlling_organization,
    maintainers: anchor.maintainers,
    anchor_latest_publisher: anchor.latest_publisher,
    anchor_latest_integrity: anchor.latest_integrity,
    anchor_latest_attestations: anchor.latest_attestations,
  },
  publisher: config.publisher,
  packages,
  policy_digest: sha256(await readFile(configPath)),
  result: packages.some(
    (entry) => entry.disposition === "incompatible_existing_identity",
  )
    ? "fail"
    : "pass",
};
await writeJsonAtomic(output, receipt);
if (receipt.result === "fail" && args.get("--expect-failure")) {
  assert(fixturePath, "--expect-failure is permitted only with --fixture");
  console.log(
    `Salt AI package namespace hostile fixture rejected (${packages
      .filter((entry) => entry.disposition === "incompatible_existing_identity")
      .map((entry) => entry.name)
      .join(", ")}).`,
  );
  process.exit(0);
}
assert(
  receipt.result === "pass",
  `Incompatible prior package identities: ${packages
    .filter((entry) => entry.disposition === "incompatible_existing_identity")
    .map((entry) => entry.name)
    .join(", ")}`,
);
console.log(
  `Salt AI package namespaces verified in ${mode} mode (${packages.map((entry) => `${entry.name}:${entry.disposition}`).join(", ")}).`,
);
