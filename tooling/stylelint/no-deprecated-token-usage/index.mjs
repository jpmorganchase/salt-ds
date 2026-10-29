import fs from "node:fs";
import path from "node:path";
import { findAll, parse } from "css-tree";
import glob from "fast-glob";
import valueParser from "postcss-value-parser";
import stylelint from "stylelint";
import { declarationValueIndex, isVarFunction } from "../utils.mjs";

const {
  createPlugin,
  utils: { report, ruleMessages },
} = stylelint;

function loadTokens(pattern, options) {
  return new Set(
    glob
      .sync(pattern, options)
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
}

const activeThemeTokens = loadTokens("./packages/theme/src/css/**/*.css", {
  ignore: ["./packages/theme/src/css/**/deprecated/**/*.css"],
});
const sharedDeprecatedTokens = loadTokens(
  "./packages/theme/src/css/deprecated/*.css",
);

for (const token of activeThemeTokens) {
  sharedDeprecatedTokens.delete(token);
}

const deprecatedTokensByTheme = {
  legacy: new Set([
    ...sharedDeprecatedTokens,
    ...loadTokens("./packages/theme/src/css/legacy/deprecated/*.css"),
  ]),
  next: new Set([
    ...sharedDeprecatedTokens,
    ...loadTokens("./packages/theme/src/css/next/deprecated/*.css"),
  ]),
};
const allDeprecatedTokens = new Set(
  Object.values(deprecatedTokensByTheme).flatMap((tokens) => [...tokens]),
);

function deprecatedTokensForSource(sourcePath) {
  const normalizedPath = sourcePath?.split(path.sep).join("/") ?? "";
  const theme = normalizedPath.match(
    /(?:^|\/)packages\/theme\/src\/css\/(legacy|next)(?:\/|$)/,
  )?.[1];

  return deprecatedTokensByTheme[theme] ?? allDeprecatedTokens;
}

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

function isDeprecatedToken(property, deprecatedTokens, verboseLog) {
  const checkResult = deprecatedTokens.has(property);
  verboseLog && console.log("Checking", property, "is deprecated", checkResult);
  return checkResult;
}

const ruleFunction = (primaryOption, secondaryOptionObject) => {
  return (root, result) => {
    const deprecatedTokens = deprecatedTokensForSource(
      root.source?.input.file ?? result.opts.from,
    );

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

      if (value.includes("var(")) {
        const parsedValue = valueParser(value);

        parsedValue.walk((node) => {
          if (!isVarFunction(node)) return;

          const { nodes } = node;

          const firstNode = nodes[0];

          verboseLog && console.log({ nodes });

          if (!firstNode) return;

          if (
            isDeprecatedToken(firstNode.value, deprecatedTokens, verboseLog)
          ) {
            complainDeprecatedTokenUsage(
              declarationValueIndex(decl) + firstNode.sourceIndex,
              firstNode.value.length,
              decl,
              firstNode.value,
            );
          }
        });
      }

      if (!prop.startsWith("--")) return;

      verboseLog && console.log({ prop });

      if (isDeprecatedToken(prop, deprecatedTokens, verboseLog)) {
        complainDeprecatedTokenUsage(0, prop.length, decl, prop);
      }
    });
  };
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(ruleName, ruleFunction);
