"use strict";

const valueParser = require("postcss-value-parser");
const stylelint = require("stylelint");

const { report, ruleMessages } = stylelint.utils;

// A few stylelint utils are not exported
// copied from https://github.com/stylelint/stylelint/tree/main/lib/utils

const isValueFunction = function isValueFunction(node) {
  return node.type === "function";
};

const declarationValueIndex = function declarationValueIndex(decl) {
  const raws = decl.raws;

  return [
    // @ts-expect-error -- TS2571: Object is of type 'unknown'.
    raws.prop && raws.prop.prefix,
    // @ts-expect-error -- TS2571: Object is of type 'unknown'.
    (raws.prop && raws.prop.raw) || decl.prop,
    // @ts-expect-error -- TS2571: Object is of type 'unknown'.
    raws.prop && raws.prop.suffix,
    raws.between || ":",
    // @ts-expect-error -- TS2339: Property 'prefix' does not exist on type '{ value: string; raw: string; }'.
    raws.value && raws.value.prefix,
  ].reduce((count, str) => {
    if (str) {
      return count + str.length;
    }

    return count;
  }, 0);
};

// ---- Start of plugin ----

const ruleName = "salt/correct-theme-token-usage";

const messages = ruleMessages(ruleName, {
  expected: (pattern) =>
    `No foundation or palette color should be used in component`, // Can encode option in error message if needed
});

const meta = {
  // Point to style documentation
  url: "https://saltdesignsystem-storybook.pages.dev/?path=/story/theme-characteristics-about-characteristics--page",
};

/**
 * Test whether a property value is from theme.
 *
 * We have 2 type of `--salt` prefixes
 * - `--salt-xyz` from theme
 * - `--saltAbc` from a component
 */
const isSaltThemeCustomProperty = function (property) {
  return property.startsWith("--salt-");
};

const allAllowedKeys = [
  // characteristics
  "accent",
  "actionable",
  "container",
  "draggable",
  "editable",
  "focused",
  "navigable",
  "overlayable",
  "selectable",
  "separable",
  "status",
  "target",
  "text",
  "track",
  "foreground",
  // additional to decide
  "animation",
  "duration", // TODO: to be merged with animation
  "size",
  "spacing",
  // foundations fade
  "color",
  // icon size
  "icon-size",
  "zIndex",
  // palette
  "palette-opacity",
  "palette-neutral",
  "palette-interact",
];

const regexpPattern = new RegExp(
  `--salt(w+)?-(${allAllowedKeys.join("|")})-.+`
);

module.exports = stylelint.createPlugin(
  ruleName,
  (primary, secondaryOptionObject, context) => {
    return (root, result) => {
      const verboseLog = primary.logLevel === "verbose";

      function check(property) {
        const checkResult =
          !isSaltThemeCustomProperty(property) || regexpPattern.test(property);
        verboseLog && console.log("Checking", checkResult, property);
        return checkResult;
      }

      root.walkDecls((decl) => {
        const { prop, value } = decl;

        const parsedValue = valueParser(value);

        parsedValue.walk((node) => {
          if (!isValueFunction(node)) return;

          if (node.value.toLowerCase() !== "var") return;

          const { nodes } = node;

          const firstNode = nodes[0];

          verboseLog && console.log({ nodes });

          if (!firstNode || check(firstNode.value)) return;

          complain(
            declarationValueIndex(decl) + firstNode.sourceIndex,
            firstNode.value.length,
            decl
          );
        });

        verboseLog && console.log({ prop });

        if (check(prop)) return;

        complain(0, prop.length, decl);
      });

      function complain(index, length, decl) {
        report({
          result,
          ruleName,
          message: messages.expected(primary),
          node: decl,
          index,
          endIndex: index + length,
        });
      }
    };
  }
);

module.exports.ruleName = ruleName;
module.exports.messages = messages;
module.exports.meta = meta;
