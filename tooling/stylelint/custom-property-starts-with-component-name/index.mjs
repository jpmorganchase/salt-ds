import path from "node:path";
import glob from "fast-glob";
import valueParser from "postcss-value-parser";
import stylelint from "stylelint";
import { declarationValueIndex, isVarFunction } from "../utils.mjs";

// Define an allowlist of component names, that do not need to match the directory name
// This can be used where the CSS is shared between multiple implementation of the component
// e.g DateInput.css is used by DateInputSingle and DateInputRange
const allowlist = ["DateInput"];

const {
  createPlugin,
  utils: { report, ruleMessages },
} = stylelint;

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

const allowedNamesSet = new Set(allowedNames);
const allowedNamesFormattedSet = new Set(allowedNamesFormatted);

const readTokenSegment = (property, prefix) => {
  if (!property.startsWith(prefix)) return null;

  const remainder = property.slice(prefix.length);
  const separatorIndex = remainder.indexOf("-");

  if (separatorIndex <= 0) return null;

  return remainder.slice(0, separatorIndex);
};

/**
 * Test whether a property value is component custom property
 *
 * Starts with `--componentName-`
 */
const isComponentCustomProperty = (property) =>
  allowedNamesFormattedSet.has(readTokenSegment(property, "--"));

/**
 * Test whether a property value is CSS API variables
 *
 * Starts with `--saltComponentName-`
 */
const isCssApi = (property) =>
  allowedNamesSet.has(readTokenSegment(property, "--salt"));

function check(property, verboseLog) {
  const checkResult = isCssApi(property) || isComponentCustomProperty(property);
  verboseLog && console.log("Checking", checkResult, property);
  return checkResult;
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

      if (value.includes("var(")) {
        const parsedValue = valueParser(value);

        parsedValue.walk((node) => {
          if (!isVarFunction(node)) return;

          const { nodes } = node;

          const firstNode = nodes[0];

          verboseLog && console.log({ nodes });

          if (
            !firstNode ||
            firstNode.value.startsWith("--salt-") ||
            check(firstNode.value)
          )
            return;

          complain(
            declarationValueIndex(decl) + firstNode.sourceIndex,
            firstNode.value.length,
            decl,
          );
        });
      }

      verboseLog && console.log({ prop });

      if (!prop.startsWith("--") || prop.startsWith("--salt-") || check(prop))
        return;

      complain(0, prop.length, decl);
    });
  };
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(ruleName, ruleFunction);
