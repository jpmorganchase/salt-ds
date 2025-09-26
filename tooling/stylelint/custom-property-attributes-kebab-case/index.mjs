import { all as allProperties } from "known-css-properties";
import valueParser from "postcss-value-parser";
import stylelint from "stylelint";
import { declarationValueIndex, isVarFunction } from "../utils.mjs";

/* excluding `accent-color` property so `--card-accent-color` is allowed */
const properties = allProperties.filter(
  (property) => property !== "accent-color",
);

const {
  createPlugin,
  utils: { report, ruleMessages },
} = stylelint;

// ---- Start of plugin ----

const ruleName = "salt/custom-property-attributes-kebab-case";

const messages = ruleMessages(ruleName, {
  expected: () => "CSS attributes in tokens should be kebab case", // Can encode option in error message if needed
});

const meta = {
  // Point to style documentation
  url: "https://saltdesignsystem-storybook.pages.dev/?path=/story/theme-about-the-salt-theme--docs",
};

const cssAttributes = properties
  .filter((x) => !x.startsWith("-")) /* e.g. -webkit- */
  .filter((x) =>
    x.includes("-"),
  ); /* only need to check properting needing kebab case */

/**
 * Test whether a property contains CSS attr
 */
const includesCssAttribute = (property) =>
  property.startsWith("--") &&
  cssAttributes.find(
    (attr) =>
      property.includes(`-${attr}-`) ||
      (property.endsWith(`-${attr}`) &&
        property !== `--salt-${attr}`) /* --salt-animation-duration */,
  );

function check(property, verboseLog) {
  const checkResult = includesCssAttribute(property);
  verboseLog && console.log("Checking", checkResult, property);
  return !checkResult;
}

const ruleFunction = (primary) => {
  return (root, result) => {
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

    const verboseLog = primary.logLevel === "verbose";

    root.walkDecls((decl) => {
      const { prop, value } = decl;

      const parsedValue = valueParser(value);

      parsedValue.walk((node) => {
        if (!isVarFunction(node)) return;

        const { nodes } = node;

        const firstNode = nodes[0];

        verboseLog && console.log({ nodes });

        if (!firstNode || check(firstNode.value)) return;

        complain(
          declarationValueIndex(decl) + firstNode.sourceIndex,
          firstNode.value.length,
          decl,
        );
      });

      if (check(prop)) return;

      verboseLog && console.log({ prop });

      complain(0, prop.length, decl);
    });
  };
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(ruleName, ruleFunction);
