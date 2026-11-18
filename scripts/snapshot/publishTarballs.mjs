/**
 * Snapshot releases: the publish step of `release.yml`.
 *
 *   node scripts/snapshot/publishTarballs.mjs <tarball dir> [--dry-run]
 *
 * Checks every tarball (see `validateTarballs.mjs`), then publishes it to
 * npm under the `snapshot` dist-tag with trusted publishing (OIDC). Run it
 * from a checkout of the workflow's own commit, never pull request code.
 *
 * Snapshots are published without provenance: the workflow runs from the
 * default branch, so an attestation would name that commit rather than the
 * pull request commit the packages were built from.
 *
 * With `--dry-run` nothing is published. Instead each package's
 * trusted-publishing token exchange is tried, which shows whether npm would
 * accept a real run.
 */
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { appendFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { checkSnapshotTarballs } from "./validateTarballs.mjs";

const NPM_REGISTRY = "https://registry.npmjs.org";
const MIN_NPM_VERSION = [11, 5, 1];
// --ignore-scripts: no package script may run in the job that holds the
// publish credential (npm skips them for tarballs today; this makes it certain).
const PUBLISH_FLAGS = [
  `--registry=${NPM_REGISTRY}`,
  "--tag",
  "snapshot",
  "--access",
  "public",
  "--provenance=false",
  "--ignore-scripts",
];

export function run(command, args, { capture = false } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ["ignore", capture ? "pipe" : "inherit", "inherit"],
    });
    let stdout = "";
    child.stdout?.on("data", (chunk) => {
      stdout += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => resolve({ code: code ?? 1, stdout }));
  });
}

/** npm can only use trusted publishing from 11.5.1. */
export function supportsTrustedPublishing(npmVersion) {
  const parts = String(npmVersion).trim().split(".").map(Number);
  for (let i = 0; i < MIN_NPM_VERSION.length; i++) {
    if (parts[i] !== MIN_NPM_VERSION[i]) {
      return parts[i] > MIN_NPM_VERSION[i];
    }
  }
  return true;
}

/** npm's own reading of a tarball's name and version. */
export async function npmDryRun(file, { exec = run } = {}) {
  const { code, stdout } = await exec(
    "npm",
    ["publish", file, "--dry-run", "--json", ...PUBLISH_FLAGS],
    { capture: true },
  );
  if (code !== 0) {
    throw new Error(`npm publish --dry-run failed for ${path.basename(file)}`);
  }
  const report = JSON.parse(stdout);
  // npm reports a single package directly, and keys several by name.
  const entry =
    typeof report.name === "string" ? report : Object.values(report)[0];
  return { name: entry?.name, version: entry?.version };
}

/**
 * Tries npm's trusted-publishing token exchange for a package, as
 * `npm publish` would, without publishing anything.
 */
export async function tryTokenExchange(
  name,
  { env = process.env, fetchImpl = fetch } = {},
) {
  const {
    ACTIONS_ID_TOKEN_REQUEST_URL: requestUrl,
    ACTIONS_ID_TOKEN_REQUEST_TOKEN: requestToken,
  } = env;
  if (!requestUrl || !requestToken) {
    throw new Error(
      "No GitHub OIDC token available: the job needs `id-token: write`.",
    );
  }
  const url = new URL(requestUrl);
  url.searchParams.set("audience", "npm:registry.npmjs.org");
  const idResponse = await fetchImpl(url, {
    headers: { Authorization: `Bearer ${requestToken}` },
  });
  if (!idResponse.ok) {
    throw new Error(
      `Could not get a GitHub OIDC token (HTTP ${idResponse.status}).`,
    );
  }
  const { value: idToken } = await idResponse.json();

  const response = await fetchImpl(
    `${NPM_REGISTRY}/-/npm/v1/oidc/token/exchange/package/${name.replace("/", "%2f")}`,
    { method: "POST", headers: { Authorization: `Bearer ${idToken}` } },
  );
  const body = await response.json().catch(() => ({}));
  // A successful exchange returns a short-lived publish token: never log it.
  return {
    ok: response.ok && typeof body.token === "string",
    status: response.status,
    message: typeof body.message === "string" ? body.message : undefined,
  };
}

export async function publishSnapshots({
  dir,
  dryRun = false,
  exec = run,
  exchange = tryTokenExchange,
  log = console.log,
}) {
  const { stdout: npmVersion } = await exec("npm", ["--version"], {
    capture: true,
  });
  if (!supportsTrustedPublishing(npmVersion)) {
    throw new Error(
      `npm ${npmVersion.trim()} can't use trusted publishing: npm 11.5.1 or later is required.`,
    );
  }

  const tarballs = await checkSnapshotTarballs(dir, {
    checkWithNpm: (file) => npmDryRun(file, { exec }),
  });
  log(`Checked ${tarballs.length} tarballs (version ${tarballs[0].version}).`);

  const published = [];
  const failed = [];
  for (const tarball of tarballs) {
    const tag = `${tarball.name}@${tarball.version}`;
    if (dryRun) {
      const { ok, status, message } = await exchange(tarball.name);
      log(
        `${tag}: token exchange HTTP ${status}${message ? ` (${message})` : ""}`,
      );
      (ok ? published : failed).push(tag);
    } else {
      const { code } = await exec("npm", [
        "publish",
        tarball.file,
        ...PUBLISH_FLAGS,
      ]);
      (code === 0 ? published : failed).push(tag);
    }
  }
  return { published, failed };
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const dir = args.find((arg) => !arg.startsWith("--"));
  if (!dir) {
    console.error(
      "Usage: node scripts/snapshot/publishTarballs.mjs <tarball dir> [--dry-run]",
    );
    process.exit(2);
  }

  let result;
  try {
    result = await publishSnapshots({ dir, dryRun });
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
  if (process.env.GITHUB_OUTPUT) {
    const delimiter = `published_${randomUUID()}`;
    await appendFile(
      process.env.GITHUB_OUTPUT,
      `published<<${delimiter}\n${result.published.join("\n")}\n${delimiter}\n`,
    );
  }
  if (result.failed.length > 0) {
    console.error(`Not published: ${result.failed.join(", ")}`);
    process.exit(1);
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await main();
}
