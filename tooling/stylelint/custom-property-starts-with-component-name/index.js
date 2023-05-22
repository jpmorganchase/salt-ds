"use strict";

const valueParser = require("postcss-value-parser");
const stylelint = require("stylelint");
const fs = require("fs");
const path = require("path");

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

const ruleName = "salt/custom-property-starts-with-component-name";

const messages = ruleMessages(ruleName, {
  expected: (pattern) =>
    `Local tokens should start with --componentName, CSS API variables should start with --saltComponentName`, // Can encode option in error message if needed
});

const meta = {
  // Point to style documentation
  url: "https://saltdesignsystem-storybook.pages.dev/?path=/story/theme-characteristics-about-characteristics--page",
};

function capitalize(folderName) {
  let parts = folderName.split("-");

  return parts.map((value) => value[0].toUpperCase() + value.slice(1)).join("");
}

let components = [];

function getComponentName(path) {
  const componentFolder = path.split("/").slice(-2)[0];
  return componentFolder
    .split("-")
    .map((part, index) => {
      return index === 0 ? part : capitalize(part);
    })
    .join("");
}

const getFilesRecursively = (directorys) => {
  for (var dir of directorys) {
    const filesInDirectory = fs.readdirSync(dir);
    for (const file of filesInDirectory) {
      if (!file.startsWith("__")) {
        // ignore test folders
        const parentFolder = path.join(dir, file);
        if (fs.statSync(parentFolder).isDirectory()) {
          getFilesRecursively([parentFolder]);
        } else if (file.endsWith(".css")) {
          const fileName = file.split(".css")[0];
          const component = getComponentName(parentFolder); // formats e.g. radio-button to RadioButton
          if (capitalize(component) === fileName) {
            // matches folder name to file name
            components.push(fileName);
          }
        }
      }
    }
  }
  return components;
};

const allowedNames = getFilesRecursively([
  `./packages/core/src`,
  `./packages/icons/src`,
  `./packages/data-grid/src`,
  `./packages/lab/src`,
]);
const allowedNamesFormatted = allowedNames.map(
  (component) => `${component[0].toLowerCase()}${component.slice(1)}`
);

/**
 * Test whether a property value is component custom property
 *
 * Starts with `--componentName-`
 */
const isComponentCustomProperty = function (property) {
  return allowedNamesFormatted.some((component) =>
    property.startsWith(`--${component}-`)
  );
};

/**
 * Test whether a property value is CSS API variables
 *
 * Starts with `--saltComponentName-`
 */
const isCssApi = function (property) {
  return allowedNames.some((component) =>
    property.startsWith(`--salt${component}-`)
  );
};

module.exports = stylelint.createPlugin(
  ruleName,
  (primary, secondaryOptionObject, context) => {
    return (root, result) => {
      const verboseLog = primary.logLevel === "verbose";

      function check(property) {
        const checkResult =
          isCssApi(property) ||
          isComponentCustomProperty(property) ||
          property.startsWith("--backwardsCompat-") || // Do not check backwardsCompat CSS
          property.startsWith("--svg-"); // FIXME: Do not check SVG tokens for now
        verboseLog && console.log("Checking", checkResult, property);
        return checkResult;
      }

      root.walkDecls((decl) => {
        if (
          decl.parent?.type === "rule" &&
          decl.parent?.selector?.includes?.("backwardsCompat")
        ) {
          // Do not check backwardsCompat CSS
          return;
        }

        const { prop, value } = decl;

        const parsedValue = valueParser(value);

        parsedValue.walk((node) => {
          if (!isValueFunction(node)) return;

          if (node.value.toLowerCase() !== "var") return;

          const { nodes } = node;

          const firstNode = nodes[0];

          verboseLog && console.log({ nodes });

          if (
            !firstNode ||
            firstNode.value.startsWith("--salt-") ||
            !firstNode.value.startsWith("--") ||
            check(firstNode.value)
          )
            return;

          complain(
            declarationValueIndex(decl) + firstNode.sourceIndex,
            firstNode.value.length,
            decl
          );
        });

        verboseLog && console.log({ prop });

        if (!prop.startsWith("--") || prop.startsWith("--salt-") || check(prop))
          return;

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
