const valueParser = require("postcss-value-parser");
const stylelint = require("stylelint");
const path = require("node:path");
const glob = require("fast-glob");

// Define an allowlist of component names, that do not need to match the directory name
// This can be used where the CSS is shared between multiple implementation of the component
// e.g DateInput.css is used by DateInputSingle and DateInputRange
const allowlist = ["DateInput"];

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

const ruleName = "salt/custom-property-starts-with-component-name";

const messages = ruleMessages(ruleName, {
  expected: () =>
    "Local tokens should start with --componentName, CSS API variables should start with --saltComponentName", // Can encode option in error message if needed
});

const meta = {
  // Point to style documentation
  url: "https://saltdesignsystem-storybook.pages.dev/?path=/story/theme-characteristics-about-characteristics--docs",
};

// Dynamically generate allowed names from the file system
const globbedNames = glob
  // Matches all files in src folders that start with a capital letter which should be all components.
  .sync("./packages/*/src/**/[A-Z]*.tsx", {
    // Ignores tests and Use* files which are hooks.
    ignore: ["**/__tests__/**", "Use[A-Z]*.tsx"],
  })
  .map((file) => {
    return path.basename(file, ".tsx");
  })
  .filter(Boolean);

// Combine the whitelist with the dynamically generated allowed names
const allowedNames = [...new Set([...globbedNames, ...allowlist])];

const allowedNamesFormatted = allowedNames.map(
  (component) => `${component[0].toLowerCase()}${component.slice(1)}`,
);

/**
 * Test whether a property value is component custom property
 *
 * Starts with `--componentName-`
 */
const isComponentCustomProperty = (property) =>
  allowedNamesFormatted.some((component) =>
    property.startsWith(`--${component}-`),
  );

/**
 * Test whether a property value is CSS API variables
 *
 * Starts with `--saltComponentName-`
 */
const isCssApi = (property) =>
  allowedNames.some((component) => property.startsWith(`--salt${component}-`));

module.exports = stylelint.createPlugin(ruleName, (primary) => {
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
          decl,
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
});

module.exports.ruleName = ruleName;
module.exports.messages = messages;
module.exports.meta = meta;
