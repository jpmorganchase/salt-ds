import type { SaltRegistry, SaltStatus } from "../types.js";
import type { SuggestedFollowUp } from "./consumerPresentation.js";
import {
  createGetSaltEntityContext,
  resolveAutoSaltEntity,
  resolveKnownSaltEntity,
} from "./getSaltEntityResolvers.js";
import {
  appendProjectConventionsNextStep,
  buildGuidanceBoundary,
  type GuidanceBoundary,
} from "./guidanceBoundary.js";
import type { StarterCodeSnippet } from "./starterCode.js";

export type SaltEntityType =
  | "auto"
  | "component"
  | "pattern"
  | "foundation"
  | "token"
  | "guide"
  | "page"
  | "package"
  | "icon"
  | "country_symbol";

export interface GetSaltEntityInput {
  entity_type?: SaltEntityType;
  name?: string;
  query?: string;
  package?: string;
  status?: SaltStatus;
  include?: Array<
    | "examples"
    | "props"
    | "tokens"
    | "accessibility"
    | "deprecations"
    | "changes"
  >;
  include_related?: boolean;
  include_starter_code?: boolean;
  max_results?: number;
  include_deprecated?: boolean;
  view?: "compact" | "full";
}

export interface GetSaltEntityResult {
  guidance_boundary?: GuidanceBoundary;
  entity_type: Exclude<SaltEntityType, "auto"> | null;
  decision: {
    status: "found" | "multiple_matches" | "results" | "not_found";
    why: string;
  };
  entity: Record<string, unknown> | null;
  matches?: Array<Record<string, unknown>>;
  related?: {
    components: Array<Record<string, unknown>>;
    patterns: Array<Record<string, unknown>>;
    tokens: Array<Record<string, unknown>>;
    guides: Array<Record<string, unknown>>;
    pages: Array<Record<string, unknown>>;
  };
  starter_code?: StarterCodeSnippet[];
  suggested_follow_ups?: SuggestedFollowUp[];
  next_step?: string;
  did_you_mean?: string[];
  ambiguity?: Record<string, unknown>;
  raw?: Record<string, unknown>;
}

export function getSaltEntity(
  registry: SaltRegistry,
  input: GetSaltEntityInput,
): GetSaltEntityResult {
  const context = createGetSaltEntityContext(registry, input);

  const withGuidanceBoundary = (
    result: GetSaltEntityResult,
  ): GetSaltEntityResult => {
    const guidanceBoundary = buildGuidanceBoundary({
      workflow: "get_salt_entity",
      entity_type:
        result.entity_type ??
        ((input.entity_type ?? "auto") === "auto"
          ? undefined
          : (input.entity_type as Exclude<SaltEntityType, "auto">)),
    });

    return {
      ...result,
      next_step: appendProjectConventionsNextStep(
        result.next_step,
        guidanceBoundary,
      ),
      guidance_boundary: guidanceBoundary,
    };
  };

  if ((input.entity_type ?? "auto") === "auto") {
    return withGuidanceBoundary(resolveAutoSaltEntity(context));
  }

  const entityType = input.entity_type as Exclude<SaltEntityType, "auto">;

  if (!context.lookupValue) {
    return withGuidanceBoundary({
      entity_type: entityType,
      decision: {
        status: "not_found",
        why: "Provide a Salt entity name or near-known query to resolve.",
      },
      entity: null,
      next_step:
        "Pass a specific or almost-specific entity name, or use discover_salt if the request is still broad.",
    });
  }

  return withGuidanceBoundary(resolveKnownSaltEntity(context, entityType));
}
