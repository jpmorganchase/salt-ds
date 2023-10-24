"use strict";

const properties = require("known-css-properties").all;
const stylelint = require("stylelint");
const valueParser = require("postcss-value-parser");

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

const ruleName = "salt/custom-property-attributes-kebab-case";

const messages = ruleMessages(ruleName, {
  expected: (pattern) => `CSS attributes in tokens should be kebab case`, // Can encode option in error message if needed
});

const meta = {
  // Point to style documentation
  url: "https://saltdesignsystem-storybook.pages.dev/?path=/story/theme-about-the-salt-theme--docs",
};

const cssAttributes = properties
  .filter((x) => !x.startsWith("-")) /* e.g. -webkit- */
  .filter((x) =>
    x.includes("-")
  ); /* only need to check properting needing kebab case */

/**
 * Test whether a property contains CSS attr
 */
const includesCssAttribute = function (property) {
  return (
    property.startsWith("--") &&
    cssAttributes.find(
      (attr) =>
        property.includes(`-${attr}-`) ||
        (property.endsWith(`-${attr}`) &&
          property !== `--salt-${attr}`) /* --salt-animation-duration */
    )
  );
};

module.exports = stylelint.createPlugin(
  ruleName,
  (primary, secondaryOptionObject, context) => {
    return (root, result) => {
      const verboseLog = primary.logLevel === "verbose";

      function check(property) {
        const checkResult = includesCssAttribute(property);
        verboseLog && console.log("Checking", checkResult, property);
        return !checkResult;
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

        if (check(prop)) return;

        verboseLog && console.log({ prop });

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
