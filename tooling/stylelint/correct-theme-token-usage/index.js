"use strict";

const valueParser = require("postcss-value-parser");
const stylelint = require("stylelint");
const glob = require("fast-glob");
const csstree = require("css-tree");
const fs = require("node:fs");

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

const deprecatedTokensSet = new Set(
  glob
    // Matches all files in src folders that start with a capital letter which should be all components.
    .sync("./packages/theme/css/deprecated/*.css")
    .flatMap((file) => {
      const ast = csstree.parse(fs.readFileSync(file, { encoding: "utf-8" }));
      return csstree
        .findAll(
          ast,
          (node, item, list) =>
            node.type === "Declaration" && node.property.startsWith("--salt")
        )
        .map((decl) => decl.property);
    })
    .filter(Boolean)
);

// ---- Start of plugin ----

const ruleName = "salt/correct-theme-token-usage";

const messages = ruleMessages(ruleName, {
  noExpectedFoundationPalette: (propertyChecked) =>
    `No foundation or palette variables (${propertyChecked}) should be used in component`, // Can encode option in error message if needed
  noDeprecated: (propertyChecked) =>
    `No deprecated token (${propertyChecked}) should be used in component`,
});

const meta = {
  // Point to style documentation
  url: "https://saltdesignsystem-storybook.pages.dev/?path=/story/theme-characteristics-about-characteristics--docs",
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
  "differential", // TODO: **deprecated:** delete here
  "editable",
  "focused",
  "measured", // TODO: **deprecated:** delete here
  "navigable",
  "overlayable",
  "selectable",
  "separable",
  "status",
  "taggable", // TODO: **deprecated:** delete here
  "target",
  "text",
  "track",
  "content",
  // additional to decide
  "animation",
  "delay", // TODO: **deprecated:** delete here
  "duration", // TODO: to be merged with animation
  "size",
  "spacing",
  // icon size
  "icon-size",
  "zIndex",
  // palette
  "palette-opacity",
  "palette-neutral",
  "palette-interact",
  // Corner is approved use case for palette layer (not curve from foundation)
  "palette-corner",
];

const varEndDetector = "(?![\\w-])";

const allowedKeyRegexpPattern = new RegExp(
  `--salt(w+)?-(${allAllowedKeys.join("|")}).*${varEndDetector}`
);

function isAllowedKeys(property, verboseLog) {
  const checkResult =
    !isSaltThemeCustomProperty(property) ||
    allowedKeyRegexpPattern.test(property);
  verboseLog && console.log("Checking", property, "isAllowedKeys", checkResult);
  return checkResult;
}

function isDeprecatedToken(property, verboseLog) {
  const checkResult = deprecatedTokensSet.has(property);
  verboseLog && console.log("Checking", property, "is deprecated", checkResult);
  return checkResult;
}

module.exports = stylelint.createPlugin(
  ruleName,
  (primaryOption, secondaryOptionObject, context) => {
    return (root, result) => {
      const verboseLog = primaryOption.logLevel === "verbose";

      root.walkDecls((decl) => {
        const { prop, value } = decl;

        const parsedValue = valueParser(value);

        parsedValue.walk((node) => {
          if (!isValueFunction(node)) return;

          if (node.value.toLowerCase() !== "var") return;

          const { nodes } = node;

          const firstNode = nodes[0];

          verboseLog && console.log({ nodes });

          if (!firstNode) return;

          if (!isAllowedKeys(firstNode.value, verboseLog)) {
            complainNoExpecteFoundationOrPalette(
              declarationValueIndex(decl) + firstNode.sourceIndex,
              firstNode.value.length,
              decl,
              firstNode.value
            );
          }

          if (isDeprecatedToken(firstNode.value, verboseLog)) {
            complainDeprecatedTokenUsage(
              declarationValueIndex(decl) + firstNode.sourceIndex,
              firstNode.value.length,
              decl,
              firstNode.value
            );
          }

          return;
        });

        verboseLog && console.log({ prop });

        if (!isAllowedKeys(prop, verboseLog)) {
          complainNoExpecteFoundationOrPalette(0, prop.length, decl, prop);
        }

        if (isDeprecatedToken(prop, verboseLog)) {
          complainDeprecatedTokenUsage(0, prop.length, decl, prop);
        }

        return;
      });

      function complainNoExpecteFoundationOrPalette(
        index,
        length,
        decl,
        propertyChecked
      ) {
        report({
          result,
          ruleName,
          message: messages.noExpectedFoundationPalette(propertyChecked),
          node: decl,
          index,
          endIndex: index + length,
        });
      }

      function complainDeprecatedTokenUsage(
        index,
        length,
        decl,
        propertyChecked
      ) {
        report({
          result,
          ruleName,
          message: messages.noDeprecated(propertyChecked),
          node: decl,
          index,
          endIndex: index + length,
          severity: "warning", // Keep deprecated token in warning for now
        });
      }
    };
  }
);

module.exports.ruleName = ruleName;
module.exports.messages = messages;
module.exports.meta = meta;
