import type { SaltRegistry } from "../types.js";
import {
  getSaltEntity,
  type GetSaltEntityInput,
  type GetSaltEntityResult,
} from "./getSaltEntity.js";
import {
  buildGuidanceBoundary,
  type GuidanceBoundary,
} from "./guidanceBoundary.js";

/**
 * Batch lookup options shared across every entity in the request.
 *
 * Each name is resolved independently with `entity_type: "auto"`. Per-name
 * ambiguity ("multiple_matches" / "not_found") never blocks other names —
 * callers receive a structured row for every requested name in the original
 * order so that downstream skill prose can grade each entity on its own.
 */
export interface GetSaltEntitiesInput {
  /** Ordered list of Salt entity names to look up. Duplicates are preserved. */
  names: string[];
  /** Optional package filter applied to every name. */
  package?: string;
  /** Optional include sections applied to every name. */
  include?: GetSaltEntityInput["include"];
  include_related?: boolean;
  include_starter_code?: boolean;
  /** Optional `compact` / `full` view passed through to each lookup. */
  view?: GetSaltEntityInput["view"];
}

export interface GetSaltEntitiesRow {
  /** The exact name requested by the caller, preserved verbatim. */
  name: string;
  /** Per-name single-entity lookup result. */
  result: GetSaltEntityResult;
}

export interface GetSaltEntitiesResult {
  guidance_boundary?: GuidanceBoundary;
  decision: {
    /**
     * - `results` — every name produced a `found` lookup.
     * - `partial` — at least one name resolved and at least one did not.
     * - `not_found` — no name produced any usable entity.
     * - `empty` — caller passed an empty `names` array.
     */
    status: "results" | "partial" | "not_found" | "empty";
    why: string;
  };
  /** Number of input names. Mirrors `results.length`. */
  requested_count: number;
  /** Subset of `results` whose underlying lookup status was `"found"`. */
  found_count: number;
  /** Subset of `results` whose underlying lookup status was `"not_found"`. */
  not_found_count: number;
  /**
   * Subset of `results` whose underlying lookup status was
   * `"multiple_matches"` or `"results"` (ambiguous / soft match).
   */
  ambiguous_count: number;
  /** One row per requested name, in original order. */
  results: GetSaltEntitiesRow[];
  /** Names that failed to resolve to a single found entity. */
  unresolved_names: string[];
  next_step?: string;
}

const MAX_BATCH_SIZE = 25;

function classifyDecisionStatus(
  status: GetSaltEntityResult["decision"]["status"],
): "found" | "ambiguous" | "not_found" {
  if (status === "found") {
    return "found";
  }
  if (status === "not_found") {
    return "not_found";
  }
  // "multiple_matches" and "results" both mean the lookup returned candidates
  // but did not bind to a single entity — callers should disambiguate.
  return "ambiguous";
}

export function getSaltEntities(
  registry: SaltRegistry,
  input: GetSaltEntitiesInput,
): GetSaltEntitiesResult {
  const guidanceBoundary = buildGuidanceBoundary({
    workflow: "get_salt_entity",
  });

  if (!input.names || input.names.length === 0) {
    return {
      guidance_boundary: guidanceBoundary,
      decision: {
        status: "empty",
        why: "Provide a non-empty names array to batch-resolve Salt entities.",
      },
      requested_count: 0,
      found_count: 0,
      not_found_count: 0,
      ambiguous_count: 0,
      results: [],
      unresolved_names: [],
      next_step:
        "Pass each Salt entity name (component, pattern, foundation, token, guide, page, package, icon, or country symbol) the workflow needs.",
    };
  }

  const trimmedNames = input.names.map((name) =>
    typeof name === "string" ? name : String(name),
  );
  const requestNames = trimmedNames.slice(0, MAX_BATCH_SIZE);

  const perNameInput: GetSaltEntityInput = {
    entity_type: "auto",
    package: input.package,
    include: input.include,
    include_related: input.include_related,
    include_starter_code: input.include_starter_code,
    view: input.view,
  };

  const rows: GetSaltEntitiesRow[] = requestNames.map((name) => ({
    name,
    result: getSaltEntity(registry, { ...perNameInput, name }),
  }));

  let foundCount = 0;
  let notFoundCount = 0;
  let ambiguousCount = 0;
  const unresolvedNames: string[] = [];

  for (const row of rows) {
    const classification = classifyDecisionStatus(row.result.decision.status);
    if (classification === "found") {
      foundCount += 1;
    } else if (classification === "not_found") {
      notFoundCount += 1;
      unresolvedNames.push(row.name);
    } else {
      ambiguousCount += 1;
      unresolvedNames.push(row.name);
    }
  }

  let status: GetSaltEntitiesResult["decision"]["status"];
  let why: string;
  let nextStep: string | undefined;

  if (foundCount === rows.length) {
    status = "results";
    why = `Resolved all ${rows.length} requested Salt entit${
      rows.length === 1 ? "y" : "ies"
    }.`;
  } else if (foundCount === 0) {
    status = "not_found";
    why = `None of the ${rows.length} requested name${
      rows.length === 1 ? "" : "s"
    } resolved to a Salt entity.`;
    nextStep =
      "Re-check the Salt entity names against the registry, or call discover_salt for the broad intent before retrying the batch.";
  } else {
    status = "partial";
    why = `Resolved ${foundCount} of ${rows.length} requested entities; ${
      rows.length - foundCount
    } still need attention.`;
    nextStep = `Inspect the per-name rows for ${unresolvedNames
      .map((name) => `"${name}"`)
      .join(
        ", ",
      )} (each row carries its own did_you_mean and ambiguity payload), then retry just the unresolved names or use discover_salt for the broader intent.`;
  }

  const truncated = trimmedNames.length > MAX_BATCH_SIZE;
  if (truncated) {
    why = `${why} Trimmed input from ${trimmedNames.length} to the first ${MAX_BATCH_SIZE} names; rerun the batch with the remainder.`;
  }

  return {
    guidance_boundary: guidanceBoundary,
    decision: { status, why },
    requested_count: rows.length,
    found_count: foundCount,
    not_found_count: notFoundCount,
    ambiguous_count: ambiguousCount,
    results: rows,
    unresolved_names: unresolvedNames,
    next_step: nextStep,
  };
}
