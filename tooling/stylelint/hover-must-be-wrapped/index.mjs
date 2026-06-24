import stylelint from "stylelint";

const {
  createPlugin,
  utils: { report, ruleMessages },
} = stylelint;

const ruleName = "salt/hover-must-be-wrapped";

const messages = ruleMessages(ruleName, {
  expected: (selector) =>
    `Selector "${selector}" contains \`:hover\` but is not inside \`@media (any-hover: hover)\`. ` +
    "Wrap hover styles so they don't apply on touch-only devices.",
});

const meta = {
  // Point to relevant guidance
  url: "https://developer.mozilla.org/en-US/docs/Web/CSS/@media/hover",
};

// Returns true if the selector contains `:hover` outside of any `:not(...)`.
function hasHoverOutsideNot(selector) {
  let i = 0;
  const n = selector.length;
  while (i < n) {
    // Skip :not(...)
    if (selector.slice(i, i + 5).toLowerCase() === ":not(") {
      let depth = 1;
      let j = i + 5;
      while (j < n && depth > 0) {
        const c = selector[j];
        if (c === "(") depth += 1;
        else if (c === ")") depth -= 1;
        j += 1;
      }
      i = j;
      continue;
    }
    if (selector.slice(i, i + 6).toLowerCase() === ":hover") {
      const next = i + 6 < n ? selector[i + 6] : "";
      // Ensure :hover is a complete pseudo-class (next char isn't part of an identifier)
      if (!/[\w-]/.test(next)) {
        return true;
      }
      i += 6;
      continue;
    }
    i += 1;
  }
  return false;
}

// Normalise an at-rule params string and check whether it represents an
// `(any-hover: hover)` or `(hover: hover)` query.
function isHoverHoverMediaParams(params) {
  if (!params) return false;
  const normalised = params.replace(/\s+/g, "").toLowerCase();
  // We accept the strict any-hover and the legacy hover form for back-compat.
  return (
    normalised.includes("(any-hover:hover)") ||
    normalised.includes("(hover:hover)")
  );
}

// Walks the ancestor chain looking for an enclosing `@media (...hover: hover)`.
function isInsideHoverHoverMedia(node) {
  let parent = node.parent;
  while (parent) {
    if (
      parent.type === "atrule" &&
      parent.name.toLowerCase() === "media" &&
      isHoverHoverMediaParams(parent.params)
    ) {
      return true;
    }
    parent = parent.parent;
  }
  return false;
}

// Split a selector list on top-level commas (ignoring commas inside parens / brackets).
function splitSelectorList(selector) {
  const parts = [];
  let depthParen = 0;
  let depthBracket = 0;
  let start = 0;
  for (let i = 0; i < selector.length; i += 1) {
    const c = selector[i];
    if (c === "(") depthParen += 1;
    else if (c === ")") depthParen -= 1;
    else if (c === "[") depthBracket += 1;
    else if (c === "]") depthBracket -= 1;
    else if (c === "," && depthParen === 0 && depthBracket === 0) {
      parts.push(selector.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(selector.slice(start));
  return parts;
}

const ruleFunction = () => {
  return (root, result) => {
    root.walkRules((rule) => {
      // `rule.selectors` would also work but `rule.selector` preserves comments;
      // we do our own splitting to keep behaviour deterministic.
      const selectors = splitSelectorList(rule.selector);

      const hoverSelectors = selectors.filter((s) =>
        hasHoverOutsideNot(s.trim()),
      );

      if (hoverSelectors.length === 0) return;

      if (isInsideHoverHoverMedia(rule)) return;

      // Report each offending sub-selector individually so editors can
      // highlight the right region.
      for (const offending of hoverSelectors) {
        const trimmed = offending.trim();
        const index = rule.selector.indexOf(trimmed);
        report({
          result,
          ruleName,
          message: messages.expected(trimmed),
          node: rule,
          word: trimmed,
          index: index >= 0 ? index : 0,
          endIndex: (index >= 0 ? index : 0) + trimmed.length,
        });
      }
    });
  };
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(ruleName, ruleFunction);

