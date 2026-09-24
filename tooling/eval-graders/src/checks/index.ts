import type { CheckKind } from "../protocol";
import { type AnyCheck, defineCheck, undecidable } from "./context";
import {
  forbiddenElement,
  propAbsent,
  propValue,
  requiredAncestor,
  requiredElement,
} from "./jsx-elements";
import { importsResolve, lintBiome, noDeprecated, typecheck } from "./salt";
import { forbiddenPattern } from "./text";

/** Reserved in the schema for a browser-mode render check; not implemented in v1. */
const renderSmoke = defineCheck({
  parse: () => ({}),
  run: () =>
    undecidable(
      ["render:smoke is reserved and not implemented in this version"],
      [],
    ),
});

/** Every check kind the protocol admits, keyed by its schema name. Adding a kind here without fixtures fails the spec. */
export const CHECKS: Record<CheckKind, AnyCheck> = {
  "ts:typecheck": typecheck,
  "lint:biome": lintBiome,
  "salt:imports-resolve": importsResolve,
  "salt:no-deprecated": noDeprecated,
  "jsx:required-element": requiredElement,
  "jsx:required-ancestor": requiredAncestor,
  "jsx:forbidden-element": forbiddenElement,
  "jsx:prop-value": propValue,
  "jsx:prop-absent": propAbsent,
  "text:forbidden-pattern": forbiddenPattern,
  "render:smoke": renderSmoke,
};
