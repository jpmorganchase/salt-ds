import { createHash, randomBytes } from "node:crypto";
import path from "node:path";
import {
  canonicalJson,
  deriveComparableSaltVersion,
  detectProjectPolicy,
  MAX_PUBLIC_RESOURCE_UTF8_BYTES,
  type ProjectPolicyConditionV2,
  type ProjectPolicyOccurrenceV2,
  publicResourceUtf8Bytes,
  type SaltProjectPolicyIrV2,
  serializePublicResourceJson,
} from "../core/runtime.js";
import {
  authorizeProjectRoot,
  type ProjectAccessPolicy,
  type ProjectRootAuthorization,
} from "./projectAccess.js";
import {
  collectSaltInstallationDiagnostics,
  collectSaltPackages,
  detectSaltWorkspaceScope,
  inspectPackageJsonFile,
} from "./projectContext/saltInstallation.js";
import {
  inspectProjectPolicy,
  type ProjectPolicyInspection,
} from "./projectPolicyInspection.js";

export const MAX_PROJECT_POLICY_RESOURCE_CHUNK_BYTES = 24 * 1024;
export const MAX_PROJECT_POLICY_SNAPSHOT_CACHE_ENTRIES = 8;
export const MAX_PROJECT_POLICY_SNAPSHOT_CACHE_UTF8_BYTES = 64 * 1024 * 1024;
export const MAX_PROJECT_POLICY_SNAPSHOT_CACHE_ENTRY_UTF8_BYTES =
  32 * 1024 * 1024;
const PROJECT_CONTEXT_HANDLE_PREFIX = "salt-project-context-v1.";
const PROJECT_CONTEXT_HANDLE_RANDOM_BYTES = 24;
export const MAX_PROJECT_CONTEXT_HANDLE_CHARS =
  PROJECT_CONTEXT_HANDLE_PREFIX.length +
  Math.ceil((PROJECT_CONTEXT_HANDLE_RANDOM_BYTES * 4) / 3);
export const PROJECT_CONTEXT_HANDLE_PATTERN = new RegExp(
  `^${PROJECT_CONTEXT_HANDLE_PREFIX.replaceAll(".", "\\.")}[A-Za-z0-9_-]{${Math.ceil(
    (PROJECT_CONTEXT_HANDLE_RANDOM_BYTES * 4) / 3,
  )}}$`,
  "u",
);
const MAX_PROJECT_POLICY_CLAIM_REASON_UTF8_BYTES = 2 * 1024;
const MAX_PROJECT_POLICY_CLAIM_DOCS = 16;
const MAX_PROJECT_POLICY_CLAIM_DOC_UTF8_BYTES = 512;
const MAX_PROJECT_POLICY_CLAIM_OPAQUE_TEXT_UTF8_BYTES = 256;
const MAX_PROJECT_POLICY_CLAIM_VALUE_UTF8_BYTES = 4 * 1024;
const MAX_PROJECT_POLICY_CLAIM_PATH_UTF8_BYTES = 8 * 1024;

export const PROJECT_POLICY_RESOURCE_TRUST = {
  classification: "untrusted_project_data",
  instruction_authority: "none",
  authorization_meaning: "read_access_only",
} as const;

function boundedClaimText(value: string, maxUtf8Bytes: number): string {
  if (Buffer.byteLength(value, "utf8") <= maxUtf8Bytes) return value;
  const suffix = "…";
  const contentBudget = maxUtf8Bytes - Buffer.byteLength(suffix, "utf8");
  let bytes = 0;
  let result = "";
  for (const character of value) {
    const characterBytes = Buffer.byteLength(character, "utf8");
    if (bytes + characterBytes > contentBudget) break;
    result += character;
    bytes += characterBytes;
  }
  return `${result}${suffix}`;
}

export interface AuthorizedProjectPolicySnapshot {
  authorization: Extract<ProjectRootAuthorization, { status: "authorized" }>;
  inspection: ProjectPolicyInspection;
  ir: SaltProjectPolicyIrV2 | null;
  canonical_json: string | null;
  digest: string | null;
  context_digest: string;
  chunks: string[];
  salt_version: string | null;
  package_versions: Readonly<Record<string, string>>;
}

export type ProjectPolicySnapshotLoadResult =
  | AuthorizedProjectPolicySnapshot
  | { authorization: ProjectRootAuthorization };

export function isAuthorizedProjectPolicySnapshot(
  value: ProjectPolicySnapshotLoadResult,
): value is AuthorizedProjectPolicySnapshot {
  return "ir" in value && "digest" in value && "salt_version" in value;
}

function snapshotCacheKey(rootDir: string, digest: string): string {
  return `${rootDir}\0${digest}`;
}

export class ProjectPolicySnapshotCache {
  readonly #entries = new Map<
    string,
    {
      snapshot: AuthorizedProjectPolicySnapshot;
      utf8Bytes: number;
      handle: string;
    }
  >();
  readonly #keyByHandle = new Map<string, string>();
  #utf8Bytes = 0;
  readonly limits: Readonly<{
    maxEntries: number;
    maxUtf8Bytes: number;
    maxEntryUtf8Bytes: number;
  }>;

  constructor(
    limits: {
      maxEntries: number;
      maxUtf8Bytes: number;
      maxEntryUtf8Bytes: number;
    } = {
      maxEntries: MAX_PROJECT_POLICY_SNAPSHOT_CACHE_ENTRIES,
      maxUtf8Bytes: MAX_PROJECT_POLICY_SNAPSHOT_CACHE_UTF8_BYTES,
      maxEntryUtf8Bytes: MAX_PROJECT_POLICY_SNAPSHOT_CACHE_ENTRY_UTF8_BYTES,
    },
  ) {
    if (
      !Number.isSafeInteger(limits.maxEntries) ||
      limits.maxEntries < 1 ||
      !Number.isSafeInteger(limits.maxUtf8Bytes) ||
      limits.maxUtf8Bytes < 1 ||
      !Number.isSafeInteger(limits.maxEntryUtf8Bytes) ||
      limits.maxEntryUtf8Bytes < 1 ||
      limits.maxEntryUtf8Bytes > limits.maxUtf8Bytes
    ) {
      throw new Error(
        "Project-policy snapshot-cache limits must be positive safe integers and the per-entry byte limit cannot exceed the total byte limit.",
      );
    }
    this.limits = Object.freeze({ ...limits });
  }

  remember(snapshot: AuthorizedProjectPolicySnapshot): string {
    const utf8Bytes = Buffer.byteLength(JSON.stringify(snapshot), "utf8");
    if (utf8Bytes > this.limits.maxEntryUtf8Bytes) {
      throw new Error(
        `Project-policy snapshot exceeds the ${this.limits.maxEntryUtf8Bytes}-byte durable resource-cache entry limit.`,
      );
    }
    const retainedSnapshot = immutableSnapshot(snapshot);
    const key = snapshotCacheKey(
      retainedSnapshot.authorization.rootDir,
      retainedSnapshot.context_digest,
    );
    const existing = this.#entries.get(key);
    if (existing) {
      this.#entries.delete(key);
      this.#utf8Bytes -= existing.utf8Bytes;
      if (
        JSON.stringify(existing.snapshot) === JSON.stringify(retainedSnapshot)
      ) {
        this.#entries.set(key, existing);
        this.#utf8Bytes += existing.utf8Bytes;
        return existing.handle;
      }
      this.#keyByHandle.delete(existing.handle);
    }
    while (
      this.#entries.size >= this.limits.maxEntries ||
      this.#utf8Bytes + utf8Bytes > this.limits.maxUtf8Bytes
    ) {
      const oldestKey = this.#entries.keys().next().value;
      if (typeof oldestKey !== "string") break;
      const oldest = this.#entries.get(oldestKey);
      this.#entries.delete(oldestKey);
      if (oldest) this.#keyByHandle.delete(oldest.handle);
      this.#utf8Bytes -= oldest?.utf8Bytes ?? 0;
    }
    if (
      this.#entries.size >= this.limits.maxEntries ||
      this.#utf8Bytes + utf8Bytes > this.limits.maxUtf8Bytes
    ) {
      throw new Error(
        "Project-policy snapshot could not fit in the bounded durable resource cache.",
      );
    }
    let handle = "";
    do {
      handle = `${PROJECT_CONTEXT_HANDLE_PREFIX}${randomBytes(
        PROJECT_CONTEXT_HANDLE_RANDOM_BYTES,
      ).toString("base64url")}`;
    } while (this.#keyByHandle.has(handle));
    this.#entries.set(key, { snapshot: retainedSnapshot, utf8Bytes, handle });
    this.#keyByHandle.set(handle, key);
    this.#utf8Bytes += utf8Bytes;
    return handle;
  }

  getByHandle(handle: string): AuthorizedProjectPolicySnapshot | null {
    if (!PROJECT_CONTEXT_HANDLE_PATTERN.test(handle)) {
      throw new Error("Invalid project context handle.");
    }
    const key = this.#keyByHandle.get(handle);
    if (!key) return null;
    const entry = this.#entries.get(key);
    if (!entry || entry.handle !== handle) {
      this.#keyByHandle.delete(handle);
      return null;
    }
    this.#entries.delete(key);
    this.#entries.set(key, entry);
    return entry.snapshot;
  }

  getByContextDigest(
    rootDir: string,
    digest: string,
  ): AuthorizedProjectPolicySnapshot | null {
    const key = snapshotCacheKey(rootDir, digest);
    const entry = this.#entries.get(key);
    if (!entry) return null;
    this.#entries.delete(key);
    this.#entries.set(key, entry);
    return entry.snapshot;
  }

  getByPolicyDigest(
    rootDir: string,
    digest: string,
  ): AuthorizedProjectPolicySnapshot | null {
    for (const [key, entry] of this.#entries) {
      if (
        entry.snapshot.authorization.rootDir === rootDir &&
        entry.snapshot.digest === digest
      ) {
        this.#entries.delete(key);
        this.#entries.set(key, entry);
        return entry.snapshot;
      }
    }
    return null;
  }
}

function immutableSnapshot(
  snapshot: AuthorizedProjectPolicySnapshot,
): AuthorizedProjectPolicySnapshot {
  const clone = structuredClone(snapshot);
  const pending: object[] = [clone];
  const visited = new WeakSet<object>();
  while (pending.length > 0) {
    const value = pending.pop()!;
    if (visited.has(value)) continue;
    visited.add(value);
    for (const child of Object.values(value)) {
      if (child && typeof child === "object") pending.push(child);
    }
    Object.freeze(value);
  }
  return clone;
}

export function createProjectPolicySnapshot(input: {
  authorization: Extract<ProjectRootAuthorization, { status: "authorized" }>;
  inspection: ProjectPolicyInspection;
  saltVersion: string | null;
  packageVersions?: Readonly<Record<string, string>>;
}): AuthorizedProjectPolicySnapshot {
  const ir = input.inspection.ir;
  const packageVersions = Object.fromEntries(
    Object.entries(input.packageVersions ?? {}).sort(([left], [right]) =>
      left.localeCompare(right),
    ),
  );
  const policyDigest = ir
    ? `sha256:${createHash("sha256").update(canonicalJson(ir), "utf8").digest("hex")}`
    : null;
  const contextDigest = `sha256:${createHash("sha256")
    .update(
      canonicalJson({
        contract: "salt_project_context_v1",
        root_dir: input.authorization.rootDir,
        project_policy_digest: policyDigest,
        salt_version: input.saltVersion,
        package_versions: packageVersions,
      }),
      "utf8",
    )
    .digest("hex")}`;
  if (!ir) {
    return {
      authorization: input.authorization,
      inspection: input.inspection,
      ir: null,
      canonical_json: null,
      digest: null,
      context_digest: contextDigest,
      chunks: [],
      salt_version: input.saltVersion,
      package_versions: packageVersions,
    };
  }
  const canonical = canonicalJson(ir);
  const bytes = Buffer.from(canonical, "utf8");
  const chunks: string[] = [];
  for (
    let offset = 0;
    offset < bytes.length;
    offset += MAX_PROJECT_POLICY_RESOURCE_CHUNK_BYTES
  ) {
    chunks.push(
      bytes
        .subarray(offset, offset + MAX_PROJECT_POLICY_RESOURCE_CHUNK_BYTES)
        .toString("base64url"),
    );
  }
  return {
    authorization: input.authorization,
    inspection: input.inspection,
    ir,
    canonical_json: canonical,
    digest: policyDigest,
    context_digest: contextDigest,
    chunks,
    salt_version: input.saltVersion,
    package_versions: packageVersions,
  };
}

export async function loadAuthorizedProjectPolicySnapshot(
  accessPolicy: ProjectAccessPolicy,
  requestedRoot: string | undefined,
  cache?: ProjectPolicySnapshotCache,
  requestedSnapshot?:
    | { kind: "context_digest"; digest: string }
    | { kind: "policy_digest"; digest: string },
): Promise<ProjectPolicySnapshotLoadResult> {
  const authorization = await authorizeProjectRoot(accessPolicy, requestedRoot);
  if (authorization.status === "denied") return { authorization };
  if (requestedSnapshot) {
    const cached =
      requestedSnapshot.kind === "context_digest"
        ? cache?.getByContextDigest(
            authorization.rootDir,
            requestedSnapshot.digest,
          )
        : cache?.getByPolicyDigest(
            authorization.rootDir,
            requestedSnapshot.digest,
          );
    if (cached) return { ...cached, authorization };
    return { authorization };
  }

  const packageInspection = await inspectPackageJsonFile(
    path.join(authorization.rootDir, "package.json"),
    authorization.rootDir,
    authorization.authorityRoot,
  );
  const packageJson =
    packageInspection.status === "valid" ? packageInspection.value : null;
  const declaredSaltPackages = collectSaltPackages(packageJson);
  const workspaceScope = await detectSaltWorkspaceScope(
    authorization.rootDir,
    authorization.authorityRoot,
  );
  const installation = await collectSaltInstallationDiagnostics(
    authorization.rootDir,
    declaredSaltPackages,
    { authorityRoot: authorization.authorityRoot, workspaceScope },
  );
  const currentSaltVersion = deriveComparableSaltVersion({
    resolvedPackages: installation.resolvedPackages,
  });
  const policy = await detectProjectPolicy(
    authorization.rootDir,
    authorization.authorityRoot,
  );
  const inspection = await inspectProjectPolicy({
    rootDir: authorization.rootDir,
    authorityRoot: authorization.authorityRoot,
    currentSaltVersion,
    policy,
  });
  const snapshot = createProjectPolicySnapshot({
    authorization,
    inspection,
    saltVersion: currentSaltVersion,
    packageVersions: Object.fromEntries(
      installation.resolvedPackages.flatMap((entry) =>
        entry.resolvedVersion ? [[entry.name, entry.resolvedVersion]] : [],
      ),
    ),
  });
  cache?.remember(snapshot);
  return snapshot;
}

interface ClaimCoverageSection {
  available: number;
  returned: number;
  omitted: number;
  truncated: boolean;
}

interface OpaqueClaimTextSlot {
  node: { text: string | null; text_truncated: boolean };
  source: string;
}

function boundedClaimValue(value: string): string {
  return boundedClaimText(value, MAX_PROJECT_POLICY_CLAIM_VALUE_UTF8_BYTES);
}

function createProjectPolicyClaimProjection(
  occurrence: ProjectPolicyOccurrenceV2,
  rootDir: string,
  policyDigest: string,
): { claim: Record<string, unknown>; serialized: string } {
  const selector = (() => {
    switch (occurrence.category) {
      case "approved_wrapper":
        return {
          fact: "canonical_name",
          value: boundedClaimValue(occurrence.declaration.wraps),
          comparison: "exact",
        };
      case "preferred_component":
        return {
          fact: "canonical_name",
          value: boundedClaimValue(occurrence.declaration.salt_name),
          comparison: "exact",
        };
      case "token_alias":
        return {
          fact: "source_token",
          value: boundedClaimValue(occurrence.declaration.salt_name),
          comparison: "exact",
        };
      case "token_family_policy":
        return {
          fact: "token_family",
          value: boundedClaimValue(occurrence.declaration.family),
          comparison: "exact",
        };
      case "pattern_preference":
        return occurrence.declaration.canonical_salt_start
          ? {
              fact: "canonical_name",
              value: boundedClaimValue(
                occurrence.declaration.canonical_salt_start,
              ),
              comparison: "exact",
            }
          : {
              fact: "intent",
              value: boundedClaimValue(occurrence.declaration.intent),
              comparison: "normalized_text",
            };
      case "banned_choice":
        return {
          fact: "canonical_name",
          value: boundedClaimValue(occurrence.declaration.name),
          comparison: "exact",
        };
      case "theme_defaults":
        return null;
    }
  })();
  const sourceDocs = occurrence.declaration.docs ?? [];
  const declaration: Record<string, unknown> & {
    docs: string[];
    docs_available: number;
    docs_returned: number;
    reason_truncated: boolean;
  } = {
    docs: [],
    docs_available: sourceDocs.length,
    docs_returned: 0,
    reason_truncated: true,
  };
  switch (occurrence.category) {
    case "approved_wrapper":
      declaration.name = boundedClaimValue(occurrence.declaration.name);
      break;
    case "banned_choice":
      declaration.name = boundedClaimValue(occurrence.declaration.name);
      declaration.replacement = occurrence.declaration.replacement
        ? boundedClaimValue(occurrence.declaration.replacement)
        : null;
      break;
    case "preferred_component":
    case "token_alias":
    case "pattern_preference":
      declaration.prefer = boundedClaimValue(occurrence.declaration.prefer);
      break;
    case "token_family_policy":
      declaration.family = boundedClaimValue(occurrence.declaration.family);
      declaration.mode = occurrence.declaration.mode;
      break;
    case "theme_defaults":
      break;
  }
  const opaqueTextSlots: OpaqueClaimTextSlot[] = [];
  const applicabilitySummary = summarizeClaimApplicability(occurrence);
  const reasonCoverage: ClaimCoverageSection = {
    available: 1,
    returned: 0,
    omitted: 1,
    truncated: true,
  };
  const documentationCoverage: ClaimCoverageSection & {
    truncated_entries: number;
  } = {
    available: sourceDocs.length,
    returned: 0,
    omitted: sourceDocs.length,
    truncated: sourceDocs.length > 0,
    truncated_entries: 0,
  };
  const opaqueCoverage: ClaimCoverageSection & {
    truncated_entries: number;
  } = {
    available: 0,
    returned: 0,
    omitted: 0,
    truncated: false,
    truncated_entries: 0,
  };
  const claim = {
    occurrence_id: boundedClaimValue(occurrence.occurrence_id),
    policy_type_id: boundedClaimValue(occurrence.policy_type_id),
    category: occurrence.category,
    declaration,
    selector,
    applicability: {
      salt_version_ranges: applicabilitySummary.salt_version_ranges.map(
        boundedClaimValue,
      ),
      required_workflows: applicabilitySummary.required_workflows,
      opaque_condition_counts: applicabilitySummary.opaque_condition_counts,
      condition_shape: claimConditionShape(
        occurrence.condition,
        opaqueTextSlots,
      ),
      import_validation: claimImportValidation(occurrence),
    },
    source: {
      layer_id: boundedClaimValue(occurrence.provenance.layer_id),
      layer_index: occurrence.provenance.layer_index,
      scope: occurrence.provenance.scope,
      repo_relative_source: (() => {
        const relativeSource = claimRepoRelativeSource(occurrence, rootDir);
        return relativeSource
          ? boundedClaimText(
              relativeSource,
              MAX_PROJECT_POLICY_CLAIM_PATH_UTF8_BYTES,
            )
          : null;
      })(),
      json_pointer: boundedClaimText(
        occurrence.provenance.json_pointer,
        MAX_PROJECT_POLICY_CLAIM_PATH_UTF8_BYTES,
      ),
      source_order: occurrence.provenance.source_order,
    },
    rule_precedence: occurrence.rule_precedence,
    coverage: {
      authored_reason: reasonCoverage,
      documentation: documentationCoverage,
      opaque_condition_text: opaqueCoverage,
    },
  };
  opaqueCoverage.available = opaqueTextSlots.length;
  opaqueCoverage.omitted = opaqueTextSlots.length;
  opaqueCoverage.truncated = opaqueTextSlots.length > 0;
  const payload = {
    contract: "salt_project_policy_claim_v2",
    trust: PROJECT_POLICY_RESOURCE_TRUST,
    policy_digest: policyDigest,
    claim,
  };
  const fits = (): boolean =>
    publicResourceUtf8Bytes(JSON.stringify(payload)) <=
    MAX_PUBLIC_RESOURCE_UTF8_BYTES;
  if (!fits()) {
    return {
      claim,
      serialized: serializePublicResourceJson(
        `project-policy claim ${occurrence.occurrence_id}`,
        payload,
      ),
    };
  }

  const boundedReason = boundedClaimText(
    occurrence.declaration.reason,
    MAX_PROJECT_POLICY_CLAIM_REASON_UTF8_BYTES,
  );
  declaration.reason = boundedReason;
  declaration.reason_truncated =
    boundedReason !== occurrence.declaration.reason;
  reasonCoverage.returned = 1;
  reasonCoverage.omitted = 0;
  reasonCoverage.truncated = declaration.reason_truncated;
  if (!fits()) {
    delete declaration.reason;
    declaration.reason_truncated = true;
    reasonCoverage.returned = 0;
    reasonCoverage.omitted = 1;
    reasonCoverage.truncated = true;
  }

  for (const sourceDoc of sourceDocs.slice(0, MAX_PROJECT_POLICY_CLAIM_DOCS)) {
    const boundedDoc = boundedClaimText(
      sourceDoc,
      MAX_PROJECT_POLICY_CLAIM_DOC_UTF8_BYTES,
    );
    declaration.docs.push(boundedDoc);
    declaration.docs_returned = declaration.docs.length;
    documentationCoverage.returned = declaration.docs.length;
    documentationCoverage.omitted =
      documentationCoverage.available - documentationCoverage.returned;
    if (boundedDoc !== sourceDoc) documentationCoverage.truncated_entries += 1;
    documentationCoverage.truncated =
      documentationCoverage.omitted > 0 ||
      documentationCoverage.truncated_entries > 0;
    if (fits()) continue;
    declaration.docs.pop();
    declaration.docs_returned = declaration.docs.length;
    documentationCoverage.returned = declaration.docs.length;
    documentationCoverage.omitted =
      documentationCoverage.available - documentationCoverage.returned;
    if (boundedDoc !== sourceDoc) documentationCoverage.truncated_entries -= 1;
    documentationCoverage.truncated = true;
    break;
  }

  for (const slot of opaqueTextSlots) {
    const boundedText = boundedClaimText(
      slot.source,
      MAX_PROJECT_POLICY_CLAIM_OPAQUE_TEXT_UTF8_BYTES,
    );
    slot.node.text = boundedText;
    slot.node.text_truncated = boundedText !== slot.source;
    opaqueCoverage.returned += 1;
    opaqueCoverage.omitted -= 1;
    if (slot.node.text_truncated) opaqueCoverage.truncated_entries += 1;
    opaqueCoverage.truncated =
      opaqueCoverage.omitted > 0 || opaqueCoverage.truncated_entries > 0;
    if (fits()) continue;
    slot.node.text = null;
    slot.node.text_truncated = true;
    opaqueCoverage.returned -= 1;
    opaqueCoverage.omitted += 1;
    if (boundedText !== slot.source) opaqueCoverage.truncated_entries -= 1;
    opaqueCoverage.truncated = true;
    break;
  }

  return {
    claim,
    serialized: serializePublicResourceJson(
      `project-policy claim ${occurrence.occurrence_id}`,
      payload,
    ),
  };
}

export function projectPolicyClaimRecord(
  occurrence: ProjectPolicyOccurrenceV2,
  rootDir: string,
): Record<string, unknown> {
  return createProjectPolicyClaimProjection(
    occurrence,
    rootDir,
    `sha256:${"0".repeat(64)}`,
  ).claim;
}

export function serializeProjectPolicyClaimResource(
  occurrence: ProjectPolicyOccurrenceV2,
  rootDir: string,
  policyDigest: string,
): string {
  return createProjectPolicyClaimProjection(
    occurrence,
    rootDir,
    policyDigest,
  ).serialized;
}

function claimRepoRelativeSource(
  occurrence: ProjectPolicyOccurrenceV2,
  rootDir: string,
): string | null {
  const resolvedSource = occurrence.provenance.resolved_path;
  if (!resolvedSource || !path.isAbsolute(resolvedSource)) return null;
  const relativeSource = path.relative(
    path.resolve(rootDir),
    path.resolve(resolvedSource),
  );
  if (
    !relativeSource ||
    relativeSource === ".." ||
    relativeSource.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativeSource)
  ) {
    return null;
  }
  return relativeSource.split(path.sep).join("/");
}

function claimConditionShape(
  condition: ProjectPolicyConditionV2,
  opaqueTextSlots: OpaqueClaimTextSlot[],
): Record<string, unknown> {
  switch (condition.type) {
    case "always":
      return { type: "always" };
    case "all":
    case "any":
      return {
        type: condition.type,
        conditions: condition.conditions.map((child) =>
          claimConditionShape(child, opaqueTextSlots),
        ),
      };
    case "not":
      return {
        type: "not",
        condition: claimConditionShape(
          condition.condition,
          opaqueTextSlots,
        ),
      };
    case "workflow_is":
      return {
        type: condition.type,
        value: condition.value,
        origin: condition.origin,
      };
    case "fact_equals":
      return {
        type: condition.type,
        fact: condition.fact,
        value: boundedClaimValue(condition.value),
        comparison: condition.comparison,
        origin: condition.origin,
      };
    case "salt_version_satisfies":
      return {
        type: condition.type,
        range: boundedClaimValue(condition.range),
        origin: condition.origin,
      };
    case "opaque": {
      const node = {
        type: "opaque",
        origin: condition.origin,
        text: null as string | null,
        text_truncated: true,
      };
      opaqueTextSlots.push({ node, source: condition.text });
      return node;
    }
  }
}

function summarizeClaimApplicability(occurrence: ProjectPolicyOccurrenceV2) {
  const saltVersionRanges = new Set<string>();
  const requiredWorkflows = new Set<"create" | "review" | "migrate">();
  const opaqueConditionCounts = {
    use_when: 0,
    avoid_when: 0,
    future_condition: 0,
  };
  const pending = [occurrence.condition];
  while (pending.length > 0) {
    const condition = pending.pop()!;
    if (condition.type === "salt_version_satisfies") {
      saltVersionRanges.add(condition.range);
    } else if (condition.type === "workflow_is") {
      requiredWorkflows.add(condition.value);
    } else if (condition.type === "opaque") {
      opaqueConditionCounts[condition.origin] += 1;
    } else if (condition.type === "all" || condition.type === "any") {
      pending.push(...condition.conditions);
    } else if (condition.type === "not") {
      pending.push(condition.condition);
    }
  }
  return {
    salt_version_ranges: [...saltVersionRanges],
    required_workflows: [...requiredWorkflows],
    opaque_condition_counts: opaqueConditionCounts,
  };
}

function claimImportValidation(occurrence: ProjectPolicyOccurrenceV2) {
  if (
    occurrence.category !== "approved_wrapper" ||
    !occurrence.declaration.import
  ) {
    return {
      status: "not_required",
      from: null,
      name: null,
    };
  }
  const declaredImport = occurrence.declaration.import;
  return {
    status:
      occurrence.import_checks.find(
        (check) =>
          check.slot === "wrapper_import" &&
          check.from === declaredImport.from &&
          check.name === declaredImport.name,
      )?.status ?? "not_inspected_limit",
    from: boundedClaimValue(declaredImport.from),
    name: boundedClaimValue(declaredImport.name),
  };
}
