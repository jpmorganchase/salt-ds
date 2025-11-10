import valueParser from "postcss-value-parser";
import stylelint from "stylelint";
import { declarationValueIndex, isVarFunction } from "../utils.mjs";

const {
  createPlugin,
  utils: { report, ruleMessages },
} = stylelint;

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

const ruleFunction = (primaryOption) => {
  return (root, result) => {
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

    const verboseLog = primaryOption.logLevel === "verbose";

    root.walkDecls((decl) => {
      const { prop, value } = decl;

      const parsedValue = valueParser(value);

      parsedValue.walk((node) => {
        if (!isVarFunction(node)) return;

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
      });

      verboseLog && console.log({ prop });

      if (!isAllowedKeys(prop, verboseLog)) {
        complainNoExpectedFoundationOrPalette(0, prop.length, decl, prop);
      }
    });
  };
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(ruleName, ruleFunction);
