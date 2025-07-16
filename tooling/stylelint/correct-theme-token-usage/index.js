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
    raws.prop?.prefix,
    // @ts-expect-error -- TS2571: Object is of type 'unknown'.
    raws.prop?.raw || decl.prop,
    // @ts-expect-error -- TS2571: Object is of type 'unknown'.
    raws.prop?.suffix,
    raws.between || ":",
    // @ts-expect-error -- TS2339: Property 'prefix' does not exist on type '{ value: string; raw: string; }'.
    raws.value?.prefix,
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
  noExpectedFoundationPalette: (propertyChecked) =>
    `No foundation or palette variables (${propertyChecked}) should be used in component`, // Can encode option in error message if needed
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
const isSaltThemeCustomProperty = (property) => property.startsWith("--salt-");

const allAllowedKeys = [
  // characteristics
  "accent",
  "actionable",
  "category",
  "container",
  "draggable",
  "differential", // TODO: **deprecated:** delete here
  "editable",
  "focused",
  "measured", // TODO: **deprecated:** delete here
  "navigable",
  "overlayable",
  "selectable",
  "sentiment",
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
  "borderStyle",
  "cursor",
  "spacing",
  "typography-textDecoration",
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
  `--salt(w+)?-(${allAllowedKeys.join("|")}).*${varEndDetector}`,
);

function isAllowedKeys(property, verboseLog) {
  const checkResult =
    !isSaltThemeCustomProperty(property) ||
    allowedKeyRegexpPattern.test(property);
  verboseLog && console.log("Checking", property, "isAllowedKeys", checkResult);
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
            complainNoExpectedFoundationOrPalette(
              declarationValueIndex(decl) + firstNode.sourceIndex,
              firstNode.value.length,
              decl,
              firstNode.value,
            );
          }

          return;
        });

        verboseLog && console.log({ prop });

        if (!isAllowedKeys(prop, verboseLog)) {
          complainNoExpectedFoundationOrPalette(0, prop.length, decl, prop);
        }

        return;
      });

      function complainNoExpectedFoundationOrPalette(
        index,
        length,
        decl,
        propertyChecked,
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
    };
  },
);

module.exports.ruleName = ruleName;
module.exports.messages = messages;
module.exports.meta = meta;
