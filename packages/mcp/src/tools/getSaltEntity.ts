import type { SaltRegistry, SaltStatus } from "../types.js";
import type { SuggestedFollowUp } from "./consumerPresentation.js";
import {
  createGetSaltEntityContext,
  resolveAutoSaltEntity,
  resolveKnownSaltEntity,
} from "./getSaltEntityResolvers.js";
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

  if ((input.entity_type ?? "auto") === "auto") {
    return resolveAutoSaltEntity(context);
  }

  const entityType = input.entity_type as Exclude<SaltEntityType, "auto">;

  if (!context.lookupValue) {
    return {
      entity_type: entityType,
      decision: {
        status: "not_found",
        why: "Provide a Salt entity name or near-known query to resolve.",
      },
      entity: null,
      next_step:
        "Pass a specific or almost-specific entity name, or use discover_salt if the request is still broad.",
    };
  }

  return resolveKnownSaltEntity(context, entityType);
}
