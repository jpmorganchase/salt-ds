import { createHash } from "node:crypto";
import path from "node:path";
import {
  canonicalJson,
  deriveComparableSaltVersion,
  detectProjectPolicy,
  type ProjectPolicyConditionV2,
  type ProjectPolicyOccurrenceV2,
  type SaltProjectPolicyIrV2,
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

export interface AuthorizedProjectPolicySnapshot {
  authorization: Extract<ProjectRootAuthorization, { status: "authorized" }>;
  inspection: ProjectPolicyInspection;
  ir: SaltProjectPolicyIrV2 | null;
  canonical_json: string | null;
  digest: string | null;
  chunks: string[];
  salt_version: string | null;
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
    { snapshot: AuthorizedProjectPolicySnapshot; utf8Bytes: number }
  >();
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

  remember(snapshot: AuthorizedProjectPolicySnapshot): void {
    if (!snapshot.ir || !snapshot.digest) return;
    const utf8Bytes = Buffer.byteLength(JSON.stringify(snapshot), "utf8");
    if (utf8Bytes > this.limits.maxEntryUtf8Bytes) {
      throw new Error(
        `Project-policy snapshot exceeds the ${this.limits.maxEntryUtf8Bytes}-byte durable resource-cache entry limit.`,
      );
    }
    const retainedSnapshot = immutableSnapshot(snapshot);
    const key = snapshotCacheKey(
      retainedSnapshot.authorization.rootDir,
      retainedSnapshot.digest!,
    );
    const existing = this.#entries.get(key);
    if (existing) {
      this.#entries.delete(key);
      this.#utf8Bytes -= existing.utf8Bytes;
    }
    while (
      this.#entries.size >= this.limits.maxEntries ||
      this.#utf8Bytes + utf8Bytes > this.limits.maxUtf8Bytes
    ) {
      const oldestKey = this.#entries.keys().next().value;
      if (typeof oldestKey !== "string") break;
      const oldest = this.#entries.get(oldestKey);
      this.#entries.delete(oldestKey);
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
    this.#entries.set(key, { snapshot: retainedSnapshot, utf8Bytes });
    this.#utf8Bytes += utf8Bytes;
  }

  get(rootDir: string, digest: string): AuthorizedProjectPolicySnapshot | null {
    const key = snapshotCacheKey(rootDir, digest);
    const entry = this.#entries.get(key);
    if (!entry) return null;
    this.#entries.delete(key);
    this.#entries.set(key, entry);
    return entry.snapshot;
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
}): AuthorizedProjectPolicySnapshot {
  const ir = input.inspection.ir;
  if (!ir) {
    return {
      authorization: input.authorization,
      inspection: input.inspection,
      ir: null,
      canonical_json: null,
      digest: null,
      chunks: [],
      salt_version: input.saltVersion,
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
    digest: `sha256:${createHash("sha256").update(bytes).digest("hex")}`,
    chunks,
    salt_version: input.saltVersion,
  };
}

export async function loadAuthorizedProjectPolicySnapshot(
  accessPolicy: ProjectAccessPolicy,
  requestedRoot: string | undefined,
  cache?: ProjectPolicySnapshotCache,
  requestedDigest?: string,
): Promise<ProjectPolicySnapshotLoadResult> {
  const authorization = await authorizeProjectRoot(accessPolicy, requestedRoot);
  if (authorization.status === "denied") return { authorization };
  if (requestedDigest) {
    const cached = cache?.get(authorization.rootDir, requestedDigest);
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
  });
  cache?.remember(snapshot);
  return snapshot;
}

export function projectPolicyClaimRecord(
  occurrence: ProjectPolicyOccurrenceV2,
  rootDir: string,
): Record<string, unknown> {
  const selector = (() => {
    switch (occurrence.category) {
      case "approved_wrapper":
        return {
          fact: "canonical_name",
          value: occurrence.declaration.wraps,
          comparison: "exact",
        };
      case "preferred_component":
        return {
          fact: "canonical_name",
          value: occurrence.declaration.salt_name,
          comparison: "exact",
        };
      case "token_alias":
        return {
          fact: "source_token",
          value: occurrence.declaration.salt_name,
          comparison: "exact",
        };
      case "token_family_policy":
        return {
          fact: "token_family",
          value: occurrence.declaration.family,
          comparison: "exact",
        };
      case "pattern_preference":
        return occurrence.declaration.canonical_salt_start
          ? {
              fact: "canonical_name",
              value: occurrence.declaration.canonical_salt_start,
              comparison: "exact",
            }
          : {
              fact: "intent",
              value: occurrence.declaration.intent,
              comparison: "normalized_text",
            };
      case "banned_choice":
        return {
          fact: "canonical_name",
          value: occurrence.declaration.name,
          comparison: "exact",
        };
      case "theme_defaults":
        return null;
    }
  })();
  const declaration = (() => {
    switch (occurrence.category) {
      case "approved_wrapper":
        return {
          name: occurrence.declaration.name,
        };
      case "banned_choice":
        return {
          name: occurrence.declaration.name,
          replacement: occurrence.declaration.replacement ?? null,
        };
      case "preferred_component":
      case "token_alias":
        return {
          prefer: occurrence.declaration.prefer,
        };
      case "token_family_policy":
        return {
          family: occurrence.declaration.family,
          mode: occurrence.declaration.mode,
        };
      case "pattern_preference":
        return {
          prefer: occurrence.declaration.prefer,
        };
      case "theme_defaults":
        return {};
    }
  })();
  const applicabilitySummary = summarizeClaimApplicability(occurrence);
  return {
    occurrence_id: occurrence.occurrence_id,
    policy_type_id: occurrence.policy_type_id,
    category: occurrence.category,
    declaration,
    selector,
    applicability: {
      ...applicabilitySummary,
      condition_shape: claimConditionShape(occurrence.condition),
      import_validation: claimImportValidation(occurrence),
    },
    source: {
      layer_id: occurrence.provenance.layer_id,
      layer_index: occurrence.provenance.layer_index,
      scope: occurrence.provenance.scope,
      repo_relative_source: claimRepoRelativeSource(occurrence, rootDir),
      json_pointer: occurrence.provenance.json_pointer,
      source_order: occurrence.provenance.source_order,
    },
    rule_precedence: occurrence.rule_precedence,
  };
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
): Record<string, unknown> {
  switch (condition.type) {
    case "always":
      return { type: "always" };
    case "all":
    case "any":
      return {
        type: condition.type,
        conditions: condition.conditions.map(claimConditionShape),
      };
    case "not":
      return {
        type: "not",
        condition: claimConditionShape(condition.condition),
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
        value: condition.value,
        comparison: condition.comparison,
        origin: condition.origin,
      };
    case "salt_version_satisfies":
      return {
        type: condition.type,
        range: condition.range,
        origin: condition.origin,
      };
    case "opaque":
      return {
        type: "opaque",
        origin: condition.origin,
        text_omitted: true,
      };
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
    from: declaredImport.from,
    name: declaredImport.name,
  };
}
