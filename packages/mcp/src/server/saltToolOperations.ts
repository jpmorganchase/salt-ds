import {
  currentKnowledgeApplicability,
  MAX_SEARCH_STRUCTURED_CONTENT_UTF8_BYTES,
  reviewSaltCode,
  type KnowledgeRuntimeContext,
  searchSalt,
} from "../core/runtime.js";
import { inspectSaltProject } from "./inspectSaltProject.js";
import type { ProjectAccessPolicy } from "./projectAccess.js";
import {
  isAuthorizedProjectPolicySnapshot,
  loadAuthorizedProjectPolicySnapshot,
  type ProjectPolicySnapshotCache,
} from "./projectPolicySnapshot.js";
import type {
  InspectToolInput,
  InspectToolResult,
  ReviewToolInput,
  ReviewToolResult,
  SearchToolInput,
  SearchToolResult,
} from "./toolDefinitions.js";

export type SaltToolOperationContext = KnowledgeRuntimeContext & {
  projectAccess: ProjectAccessPolicy;
  projectPolicySnapshots: ProjectPolicySnapshotCache;
  measureFinalResultUtf8Bytes: (payload: unknown) => number;
};

function catalogPackageVersions(
  context: KnowledgeRuntimeContext,
): ReadonlyMap<string, string> {
  return new Map(
    context.store
      .getFamily("package")
      .map((record) => [record.name, record.version] as const),
  );
}

export function searchSaltOperation(
  context: SaltToolOperationContext,
  input: SearchToolInput,
): SearchToolResult {
  const result = searchSalt(context.store, input);
  const selectedStatuses = result.scope.searched_statuses;
  const applicability = currentKnowledgeApplicability();
  const payload: SearchToolResult = {
    ...result,
    scope: {
      ...result.scope,
      searched_statuses:
        selectedStatuses === null
          ? null
          : selectedStatuses.filter(
              (status): status is "stable" | "beta" | "lab" | "deprecated" =>
                status === "stable" ||
                status === "beta" ||
                status === "lab" ||
                status === "deprecated",
            ),
    },
    applicability,
  };
  const applicabilityLimitation =
    "Additional search content was omitted so the current-guidance applicability label fits within the public structured-result budget.";
  while (
    Buffer.byteLength(JSON.stringify(payload), "utf8") >
      MAX_SEARCH_STRUCTURED_CONTENT_UTF8_BYTES &&
    payload.data.matches.length > 0
  ) {
    payload.data.matches.pop();
    payload.scope.returned = payload.data.matches.length;
    payload.scope.truncated = true;
    if (!payload.limitations.includes(applicabilityLimitation)) {
      payload.limitations.push(applicabilityLimitation);
    }
  }
  if (
    Buffer.byteLength(JSON.stringify(payload), "utf8") >
    MAX_SEARCH_STRUCTURED_CONTENT_UTF8_BYTES
  ) {
    const queryEchoLimitation =
      "The submitted query was used in full for search, but its public echo was truncated so applicability metadata fits within the public structured-result budget.";
    if (
      !payload.limitations.some((limitation) =>
        /used in full for search.*public echo was truncated/iu.test(limitation),
      )
    ) {
      payload.limitations.push(queryEchoLimitation);
    }
    const queryCodePoints = Array.from(payload.data.query);
    let lower = 0;
    let upper = queryCodePoints.length;
    while (lower < upper) {
      const candidateLength = Math.ceil((lower + upper) / 2);
      payload.data.query = queryCodePoints.slice(0, candidateLength).join("");
      if (
        Buffer.byteLength(JSON.stringify(payload), "utf8") <=
        MAX_SEARCH_STRUCTURED_CONTENT_UTF8_BYTES
      ) {
        lower = candidateLength;
      } else {
        upper = candidateLength - 1;
      }
    }
    payload.data.query = queryCodePoints.slice(0, lower).join("");
    payload.scope.truncated = true;
  }
  if (
    Buffer.byteLength(JSON.stringify(payload), "utf8") >
    MAX_SEARCH_STRUCTURED_CONTENT_UTF8_BYTES
  ) {
    throw new Error(
      `search_salt applicability metadata exceeded its ${MAX_SEARCH_STRUCTURED_CONTENT_UTF8_BYTES}-byte public result limit.`,
    );
  }
  return payload;
}

export async function inspectSaltProjectOperation(
  context: SaltToolOperationContext,
  input: InspectToolInput,
): Promise<InspectToolResult> {
  return inspectSaltProject(
    input,
    context.projectAccess,
    context.projectPolicySnapshots,
    catalogPackageVersions(context),
    context.measureFinalResultUtf8Bytes,
  );
}

export async function reviewSaltCodeOperation(
  context: SaltToolOperationContext,
  input: ReviewToolInput,
): Promise<ReviewToolResult> {
  const retainedSnapshot = input.project_context_handle
    ? context.projectPolicySnapshots.getByHandle(input.project_context_handle)
    : null;
  if (input.project_context_handle && !retainedSnapshot) {
    throw new Error(
      "review_salt_code project context handle is expired or evicted; inspect the project again for a new handle.",
    );
  }
  const loadedPolicy = retainedSnapshot
    ? await loadAuthorizedProjectPolicySnapshot(
        context.projectAccess,
        retainedSnapshot.authorization.rootDir,
        context.projectPolicySnapshots,
        {
          kind: "context_digest",
          digest: retainedSnapshot.context_digest,
        },
      )
    : input.root_dir
      ? await loadAuthorizedProjectPolicySnapshot(
          context.projectAccess,
          input.root_dir,
          context.projectPolicySnapshots,
        )
      : null;
  if (loadedPolicy?.authorization.status === "denied") {
    if (retainedSnapshot) {
      throw new Error(
        "review_salt_code project context handle is expired, evicted, or unauthorized; inspect the project again for a new handle.",
      );
    }
    throw new Error(
      `review_salt_code project policy root was denied (${loadedPolicy.authorization.reason}).`,
    );
  }
  if (
    retainedSnapshot &&
    (!loadedPolicy ||
      !isAuthorizedProjectPolicySnapshot(loadedPolicy) ||
      loadedPolicy.context_digest !== retainedSnapshot.context_digest)
  ) {
    throw new Error(
      "review_salt_code project context handle is expired or evicted; inspect the project again for a new handle.",
    );
  }
  const policyContext =
    loadedPolicy &&
    isAuthorizedProjectPolicySnapshot(loadedPolicy) &&
    loadedPolicy.ir &&
    loadedPolicy.digest
      ? {
          ir: loadedPolicy.ir,
          root_dir: loadedPolicy.authorization.rootDir,
          digest: loadedPolicy.digest,
          salt_version: loadedPolicy.salt_version,
        }
      : null;
  return reviewSaltCode(
    {
      reviewCatalog: context.reviewCatalog,
      store: context.store,
      ...(loadedPolicy && isAuthorizedProjectPolicySnapshot(loadedPolicy)
        ? { packageVersionEvidence: loadedPolicy.package_versions }
        : {}),
    },
    {
      artifacts: input.artifacts,
      ...(input.package_versions
        ? { package_versions: input.package_versions }
        : {}),
      ...(input.max_findings === undefined
        ? {}
        : { max_findings: input.max_findings }),
    },
    policyContext,
    loadedPolicy && isAuthorizedProjectPolicySnapshot(loadedPolicy)
      ? loadedPolicy.context_digest
      : null,
    retainedSnapshot
      ? "retained_project_snapshot"
      : input.root_dir
        ? "fresh_project_inspection"
        : input.package_versions
          ? "caller_package_versions"
          : "none",
    context.measureFinalResultUtf8Bytes,
  );
}

export const SALT_TOOL_OPERATIONS = {
  search_salt: searchSaltOperation,
  inspect_salt_project: inspectSaltProjectOperation,
  review_salt_code: reviewSaltCodeOperation,
} as const;
