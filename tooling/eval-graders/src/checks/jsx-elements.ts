/**
 * Composition rules over JSX elements. Selectors match the component's exported name
 * (aliases resolved) and, when `from` is given, the package it was imported from, so a
 * locally defined `FormField` never satisfies a rule about Salt's.
 */
import {
  ancestors,
  type ElementSelector,
  evidenceFor,
  matchesSelector,
  selectElements,
} from "../analysis/jsx";
import {
  correct,
  decide,
  defineCheck,
  type GradeContext,
  optionalPositiveInteger,
  optionalString,
  ParamError,
  requireString,
  wrong,
} from "./context";

function selector(params: Record<string, unknown>): ElementSelector {
  return {
    element: requireString(params, "element"),
    from: optionalString(params, "from"),
  };
}

function describe(selector: ElementSelector): string {
  return selector.from
    ? `<${selector.element}> from ${selector.from}`
    : `<${selector.element}>`;
}

function elements(context: GradeContext, selector: ElementSelector) {
  return selectElements(context.analyses().values(), selector);
}

export const requiredElement = defineCheck({
  parse: (params) => ({
    ...selector(params),
    min: optionalPositiveInteger(params, "min", 1),
  }),
  run(context, params) {
    const found = elements(context, params);
    if (found.length >= params.min) {
      return correct([`found ${found.length} ${describe(params)}`]);
    }
    return wrong(
      [
        `found ${found.length} ${describe(params)}, need at least ${params.min}`,
      ],
      found.map(evidenceFor),
    );
  },
});

export const forbiddenElement = defineCheck({
  parse: selector,
  run(context, params) {
    const found = elements(context, params);
    if (found.length === 0) return correct();
    return wrong(
      found.map((e) => `${describe(params)} rendered at ${e.file}:${e.line}`),
      found.map(evidenceFor),
    );
  },
});

/**
 * Every matching element must have an ancestor matching `ancestor`. Vacuously correct
 * when the element never appears; pair with jsx:required-element to demand presence.
 */
export const requiredAncestor = defineCheck({
  parse: (params) => ({
    ...selector(params),
    ancestor: requireString(params, "ancestor"),
  }),
  run(context, params) {
    const ancestorSelector: ElementSelector = {
      element: params.ancestor,
      from: params.from,
    };
    const orphans = elements(context, params).filter(
      (element) =>
        !ancestors(element).some((a) => matchesSelector(a, ancestorSelector)),
    );
    if (orphans.length === 0) return correct();
    return wrong(
      orphans.map(
        (e) =>
          `${describe(params)} at ${e.file}:${e.line} is not inside ${describe(ancestorSelector)}`,
      ),
      orphans.map(evidenceFor),
    );
  },
});

type Literal = boolean | string | number | null;

function literalParam(params: Record<string, unknown>, key: string): Literal {
  const value = params[key];
  if (
    value === null ||
    typeof value === "boolean" ||
    typeof value === "string" ||
    typeof value === "number"
  ) {
    return value;
  }
  throw new ParamError(
    `params.${key} must be a boolean, string, number or null`,
  );
}

/**
 * At least one matching element must exist and every one must set `prop` to `equals`.
 * A bare attribute counts as `true`. A computed value or a spread that could supply the
 * prop is undecidable and reported as an error (review), not as a failure.
 */
export const propValue = defineCheck({
  parse: (params) => ({
    ...selector(params),
    prop: requireString(params, "prop"),
    equals: literalParam(params, "equals"),
  }),
  run(context, params) {
    const found = elements(context, params);
    if (found.length === 0) {
      return wrong([`no ${describe(params)} to carry ${params.prop}`], []);
    }
    const violations = [];
    const unknowns = [];
    for (const element of found) {
      const value = element.attributes.get(params.prop);
      const where = `${describe(params)} at ${element.file}:${element.line}`;
      if (value === undefined) {
        if (element.spread) {
          unknowns.push({
            message: `${where} spreads props, cannot tell whether ${params.prop} is set`,
            evidence: evidenceFor(element),
          });
        } else {
          violations.push({
            message: `${where} does not set ${params.prop}`,
            evidence: evidenceFor(element),
          });
        }
      } else if (value.kind === "expression") {
        unknowns.push({
          message: `${where} sets ${params.prop}={${value.text}}, a non-literal value`,
          evidence: evidenceFor(element),
        });
      } else if (value.value !== params.equals) {
        violations.push({
          message: `${where} sets ${params.prop} to ${JSON.stringify(value.value)}, expected ${JSON.stringify(params.equals)}`,
          evidence: evidenceFor(element),
        });
      }
    }
    return decide(violations, unknowns);
  },
});

/** No matching element may set `prop` in any form. Vacuously correct without matches. */
export const propAbsent = defineCheck({
  parse: (params) => ({
    ...selector(params),
    prop: requireString(params, "prop"),
  }),
  run(context, params) {
    const violations = [];
    const unknowns = [];
    for (const element of elements(context, params)) {
      const where = `${describe(params)} at ${element.file}:${element.line}`;
      if (element.attributes.has(params.prop)) {
        violations.push({
          message: `${where} sets ${params.prop}`,
          evidence: evidenceFor(element),
        });
      } else if (element.spread) {
        unknowns.push({
          message: `${where} spreads props, cannot tell whether ${params.prop} is set`,
          evidence: evidenceFor(element),
        });
      }
    }
    return decide(violations, unknowns);
  },
});
