import { createHash } from "node:crypto";
import path from "node:path";

const BUILD_IDENTITY_MARKER = "salt-catalog-build-identity:v1";
const SHA256_PATTERN = /^sha256:[0-9a-f]{64}$/u;

function sha256(bytes) {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(value, expectedKeys) {
  return (
    isRecord(value) &&
    JSON.stringify(Object.keys(value).sort()) ===
      JSON.stringify([...expectedKeys].sort())
  );
}

export function hasForbiddenPortablePathCharacter(value) {
  return [...value].some((character) => {
    const codePoint = character.codePointAt(0);
    return (
      (codePoint !== undefined && codePoint <= 0x1f) ||
      '<>:"|?*'.includes(character)
    );
  });
}

function canonicalJson(value) {
  const sortValue = (candidate) => {
    if (Array.isArray(candidate)) return candidate.map(sortValue);
    if (candidate && typeof candidate === "object") {
      return Object.fromEntries(
        Object.entries(candidate)
          .filter(([, entry]) => entry !== undefined)
          .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
          .map(([key, entry]) => [key, sortValue(entry)]),
      );
    }
    return candidate;
  };
  return JSON.stringify(sortValue(value));
}

function normalizeRepoPath(repoPath) {
  const normalized = repoPath.normalize("NFC");
  if (
    normalized.length === 0 ||
    normalized !== repoPath ||
    normalized.startsWith("/") ||
    normalized.includes("\\") ||
    hasForbiddenPortablePathCharacter(normalized) ||
    normalized
      .split("/")
      .some(
        (segment) =>
          segment === "" ||
          segment === "." ||
          segment === ".." ||
          /[ .]$/u.test(segment) ||
          /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/iu.test(segment),
      )
  ) {
    throw new Error(
      `Invalid repository-relative build input path: ${repoPath}`,
    );
  }
  return normalized;
}

export function assertSealedCatalogGeneratorIdentity(generator) {
  if (
    !hasExactKeys(generator, ["mode", "version", "digest", "receipt"]) ||
    generator.mode !== "sealed" ||
    typeof generator.version !== "string" ||
    generator.version.length === 0 ||
    /(?:^|-)test(?:-|$)/u.test(generator.version) ||
    !SHA256_PATTERN.test(generator.digest ?? "")
  ) {
    throw new Error(
      "Production catalog build identity requires a sealed, non-test generator.",
    );
  }
  const receipt = generator.receipt;
  if (
    !hasExactKeys(receipt, [
      "schema_version",
      "orchestrator",
      "generator_bundle",
      "dependencies",
      "runtime",
    ]) ||
    receipt.schema_version !== "1.1.0" ||
    !hasExactKeys(receipt.orchestrator, ["path", "sha256"]) ||
    !hasExactKeys(receipt.generator_bundle, ["sha256", "metafile_sha256"]) ||
    !hasExactKeys(receipt.dependencies, [
      "sha256",
      "esbuild_entry",
      "esbuild_version",
      "esbuild_binary",
      "esbuild_binary_sha256",
      "typescript_entry",
      "typescript_version",
      "tool_snapshot_sha256",
      "tool_snapshot_files",
    ]) ||
    !hasExactKeys(receipt.runtime, [
      "executable_sha256",
      "version",
      "versions",
      "platform",
      "arch",
      "exec_argv",
      "environment",
    ])
  ) {
    throw new Error(
      "Production catalog has an invalid sealed generator receipt.",
    );
  }
  const digestFields = [
    receipt.orchestrator.sha256,
    receipt.generator_bundle.sha256,
    receipt.generator_bundle.metafile_sha256,
    receipt.dependencies.sha256,
    receipt.dependencies.esbuild_binary_sha256,
    receipt.dependencies.tool_snapshot_sha256,
    receipt.runtime.executable_sha256,
  ];
  if (
    digestFields.some((digest) => !SHA256_PATTERN.test(digest ?? "")) ||
    typeof receipt.dependencies.esbuild_version !== "string" ||
    receipt.dependencies.esbuild_version.length === 0 ||
    typeof receipt.dependencies.typescript_version !== "string" ||
    receipt.dependencies.typescript_version.length === 0 ||
    !Number.isSafeInteger(receipt.dependencies.tool_snapshot_files) ||
    receipt.dependencies.tool_snapshot_files <= 0 ||
    typeof receipt.runtime.version !== "string" ||
    receipt.runtime.version.length === 0 ||
    typeof receipt.runtime.platform !== "string" ||
    receipt.runtime.platform.length === 0 ||
    typeof receipt.runtime.arch !== "string" ||
    receipt.runtime.arch.length === 0 ||
    !isRecord(receipt.runtime.versions) ||
    Object.values(receipt.runtime.versions).some(
      (version) => typeof version !== "string",
    ) ||
    !Array.isArray(receipt.runtime.exec_argv) ||
    receipt.runtime.exec_argv.length !== 0 ||
    !hasExactKeys(receipt.runtime.environment, ["policy"]) ||
    receipt.runtime.environment.policy !== "empty"
  ) {
    throw new Error(
      "Production catalog has an invalid sealed generator receipt.",
    );
  }
  if (
    typeof receipt.orchestrator.path !== "string" ||
    typeof receipt.dependencies.esbuild_entry !== "string" ||
    typeof receipt.dependencies.esbuild_binary !== "string" ||
    typeof receipt.dependencies.typescript_entry !== "string"
  ) {
    throw new Error("Production catalog has invalid generator receipt paths.");
  }
  normalizeRepoPath(receipt.orchestrator.path);
  for (const dependencyEntry of [
    receipt.dependencies.esbuild_entry,
    receipt.dependencies.esbuild_binary,
    receipt.dependencies.typescript_entry,
  ]) {
    const normalizedEntry = normalizeRepoPath(dependencyEntry);
    if (!normalizedEntry.startsWith("node_modules/")) {
      throw new Error(
        "Sealed catalog generator tools must resolve from repository node_modules.",
      );
    }
  }
  const expectedDigest = sha256(Buffer.from(canonicalJson(receipt), "utf8"));
  if (generator.digest !== expectedDigest) {
    throw new Error(
      `Sealed catalog generator digest mismatch: expected ${expectedDigest}, received ${generator.digest}.`,
    );
  }
  return generator;
}

export function isPathWithinRoot(rootPath, candidatePath, options = {}) {
  const root = path.resolve(rootPath);
  const candidate = path.resolve(candidatePath);
  const relative = path.relative(root, candidate);
  if (relative === "") return options.allowRoot === true;
  return (
    !path.isAbsolute(relative) &&
    relative !== ".." &&
    !relative.startsWith(`..${path.sep}`)
  );
}

function parseIdentityFields(value) {
  if (
    !value ||
    value.schema_version !== "1.0.0" ||
    !SHA256_PATTERN.test(value.manifest_sha256 ?? "") ||
    !SHA256_PATTERN.test(value.input_inventory_digest ?? "")
  ) {
    throw new Error("Invalid Salt catalog build identity.");
  }
  return {
    schema_version: "1.0.0",
    manifest_sha256: value.manifest_sha256,
    input_inventory_digest: value.input_inventory_digest,
  };
}

export function createCatalogBuildIdentity(manifestBytes) {
  const bytes = Buffer.isBuffer(manifestBytes)
    ? manifestBytes
    : Buffer.from(manifestBytes);
  const manifest = JSON.parse(bytes.toString("utf8"));
  assertSealedCatalogGeneratorIdentity(manifest.generator);
  if (
    !SHA256_PATTERN.test(manifest.input_inventory_digest ?? "") ||
    !Array.isArray(manifest.inputs) ||
    manifest.inputs.length === 0
  ) {
    throw new Error(
      "Catalog build identity requires a manifest with a bound input inventory.",
    );
  }
  const inputsByPath = new Map();
  const portableInputPaths = new Map();
  let previousPath = null;
  for (const entry of manifest.inputs) {
    const repoPath = normalizeRepoPath(entry?.path ?? "");
    const portablePath = repoPath.toLowerCase();
    if (
      inputsByPath.has(repoPath) ||
      portableInputPaths.has(portablePath) ||
      (previousPath !== null && previousPath >= repoPath) ||
      !Number.isSafeInteger(entry?.bytes) ||
      entry.bytes < 0 ||
      !SHA256_PATTERN.test(entry?.sha256 ?? "")
    ) {
      throw new Error(`Invalid catalog manifest input entry: ${repoPath}`);
    }
    previousPath = repoPath;
    portableInputPaths.set(portablePath, repoPath);
    inputsByPath.set(repoPath, {
      bytes: entry.bytes,
      sha256: entry.sha256,
    });
  }
  const expectedInputInventoryDigest = sha256(
    Buffer.from(canonicalJson(manifest.inputs), "utf8"),
  );
  if (manifest.input_inventory_digest !== expectedInputInventoryDigest) {
    throw new Error(
      `Catalog input inventory digest mismatch: expected ${expectedInputInventoryDigest}, received ${manifest.input_inventory_digest}.`,
    );
  }
  return {
    ...parseIdentityFields({
      schema_version: "1.0.0",
      manifest_sha256: sha256(bytes),
      input_inventory_digest: manifest.input_inventory_digest,
    }),
    inputsByPath,
  };
}

export function assertCatalogInputBytes(identity, repoPath, inputBytes) {
  const normalizedPath = normalizeRepoPath(repoPath);
  const expected = identity.inputsByPath?.get(normalizedPath);
  if (!expected) {
    throw new Error(
      `Repository build input '${normalizedPath}' is absent from the catalog input inventory.`,
    );
  }
  const bytes = Buffer.isBuffer(inputBytes)
    ? inputBytes
    : Buffer.from(inputBytes);
  const actualDigest = sha256(bytes);
  if (bytes.byteLength !== expected.bytes || actualDigest !== expected.sha256) {
    throw new Error(
      `Repository build input '${normalizedPath}' does not match the catalog input inventory.`,
    );
  }
  return bytes;
}

export function assertCatalogManifestBytes(identity, manifestBytes) {
  const bytes = Buffer.isBuffer(manifestBytes)
    ? manifestBytes
    : Buffer.from(manifestBytes);
  if (sha256(bytes) !== identity.manifest_sha256) {
    throw new Error(
      "The catalog manifest changed during the package build boundary.",
    );
  }
  const current = createCatalogBuildIdentity(bytes);
  assertSameCatalogBuildIdentity(identity, current);
  return bytes;
}

export function formatCatalogBuildBanner(identity) {
  const parsed = parseIdentityFields(identity);
  return `/* ${BUILD_IDENTITY_MARKER} manifest_sha256=${parsed.manifest_sha256} input_inventory_digest=${parsed.input_inventory_digest} */`;
}

export function parseCatalogBuildBanner(bundleBytes) {
  const prefix = Buffer.isBuffer(bundleBytes)
    ? bundleBytes.subarray(0, 4096).toString("utf8")
    : String(bundleBytes).slice(0, 4096);
  const match = prefix.match(
    /^\/\* salt-catalog-build-identity:v1 manifest_sha256=(sha256:[0-9a-f]{64}) input_inventory_digest=(sha256:[0-9a-f]{64}) \*\/(?:\r?\n|$)/u,
  );
  if (!match) {
    throw new Error("Built package has no valid Salt catalog identity banner.");
  }
  return parseIdentityFields({
    schema_version: "1.0.0",
    manifest_sha256: match[1],
    input_inventory_digest: match[2],
  });
}

export function assertSameCatalogBuildIdentity(left, right) {
  const expected = parseIdentityFields(left);
  const actual = parseIdentityFields(right);
  if (
    expected.manifest_sha256 !== actual.manifest_sha256 ||
    expected.input_inventory_digest !== actual.input_inventory_digest
  ) {
    throw new Error(
      "Built runtime and catalog do not share the same build identity.",
    );
  }
  return expected;
}
