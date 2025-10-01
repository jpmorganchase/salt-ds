import fs from "node:fs";
import { findAll, parse } from "css-tree";
import glob from "fast-glob";
import valueParser from "postcss-value-parser";
import stylelint from "stylelint";
import { declarationValueIndex, isVarFunction } from "../utils.mjs";

const {
  createPlugin,
  utils: { report, ruleMessages },
} = stylelint;

const deprecatedTokensSet = new Set(
  glob
    .sync("./packages/theme/css/*/deprecated/*.css")
    .flatMap((file) => {
      const ast = parse(fs.readFileSync(file, { encoding: "utf-8" }));
      return findAll(
        ast,
        (node) =>
          node.type === "Declaration" && node.property.startsWith("--salt"),
      ).map((decl) => decl.property);
    })
    .filter(Boolean),
);

// ---- Start of plugin ----

const ruleName = "salt/no-deprecated-token-usage";

const messages = ruleMessages(ruleName, {
  noDeprecated: (propertyChecked) =>
    `No deprecated tokens should be used. (${propertyChecked})`,
});

const meta = {
  // Point to style documentation
  url: "https://saltdesignsystem-storybook.pages.dev/?path=/story/theme-characteristics-about-characteristics--docs",
};

function isDeprecatedToken(property, verboseLog) {
  const checkResult = deprecatedTokensSet.has(property);
  verboseLog && console.log("Checking", property, "is deprecated", checkResult);
  return checkResult;
}

const ruleFunction = (primaryOption, secondaryOptionObject) => {
  return (root, result) => {
    function complainDeprecatedTokenUsage(
      index,
      length,
      decl,
      propertyChecked,
    ) {
      report({
        result,
        ruleName,
        message: messages.noDeprecated(propertyChecked),
        node: decl,
        index,
        endIndex: index + length,
        severity: secondaryOptionObject?.severity ?? "error",
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

        if (isDeprecatedToken(firstNode.value, verboseLog)) {
          complainDeprecatedTokenUsage(
            declarationValueIndex(decl) + firstNode.sourceIndex,
            firstNode.value.length,
            decl,
            firstNode.value,
          );
        }
      });

      verboseLog && console.log({ prop });

      if (isDeprecatedToken(prop, verboseLog)) {
        complainDeprecatedTokenUsage(0, prop.length, decl, prop);
      }
    });
  };
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(ruleName, ruleFunction);
