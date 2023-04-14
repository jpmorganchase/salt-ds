"use strict";

const properties = require("known-css-properties").all;
const propertiesCamelCase = properties.map(s => s.replace(/-./g, x=>x[1].toUpperCase()));
const stylelint = require("stylelint");
const valueParser = require("postcss-value-parser");

const { report, ruleMessages } = stylelint.utils;

const allowedStates = ["activeDisabled", "blurSelected", "partialDisabled", "selectedDisabled"]

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

const ruleName = "salt/custom-property-strict-casing";

const messages = ruleMessages(ruleName, {
  expected: (pattern) => `Only CSS attributes and states in tokens should be camel case`, // Can encode option in error message if needed
});

const meta = {
  // Point to style documentation
  url: "https://saltdesignsystem-storybook.pages.dev/?path=/story/theme-about-the-salt-theme--page",
};

const cssAttributes = properties
  .filter((x) => !x.startsWith("-")) /* e.g. -webkit- */
  .filter((x) =>
    x.includes("-")
  ); /* only need to check properties needing camel case */

/**
 * Test whether a property contains CSS attr in kebab case
 * 
 * e.g. 
 * --salt-editable-borderWidth is OK (returns false)
 * --salt-editable-border-width is NOT OK (returns true)
 */
const includesCssAttributeInKebabCase = function (property) {
  return (
    property.startsWith("--") &&
    cssAttributes.find(
      (attr) =>
        property.includes(`-${attr}-`) ||
        (property.endsWith(`-${attr}`) &&
          property !== `--salt-${attr}`) /* allow for now e.g. --salt-`animation-duration` */
    )
  );
};

/**
 * Test whether a property contains camel case word that's not CSS attr
 * 
 * e.g. 
 * --input--borderWidth is OK (returns false)
 * --input-secondary-color-blurSelected is OK (returns false)
 * --input-myToken is NOT OK (returns true)
 * --input-borderWidth-myToken is NOT OK (returns true)
 */
const includesCamelCaseNoCssAttribute = function (property) {
  if (!property.startsWith("--")) {
    return false;
  }

  const propertyNoDoubleDash = property.replace("--","");
  const propertyNoPrefix = propertyNoDoubleDash.substring(propertyNoDoubleDash.indexOf("-")+1);

  if (propertyNoPrefix.toLowerCase() === propertyNoPrefix) {
    /* No camel case found */
    return false;
  }
  
  for (var part of propertyNoPrefix.split("-")) {
    if (part.toLowerCase() !== part && !propertiesCamelCase.includes(part) && !allowedStates.includes(part)) {
      return true;
    }
  }

  return false;
}

module.exports = stylelint.createPlugin(
  ruleName,
  (primary, secondaryOptionObject, context) => {
    return (root, result) => {
      const verboseLog = primary.logLevel === "verbose";

      function check(property) {
        let checkResult = includesCssAttributeInKebabCase(property);
        if (!checkResult) {
          checkResult = includesCamelCaseNoCssAttribute(property);
        }
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
