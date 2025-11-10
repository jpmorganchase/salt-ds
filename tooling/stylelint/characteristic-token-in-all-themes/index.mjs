import fs from "node:fs";
import path from "node:path";
import { findAll, parse } from "css-tree";
import glob from "fast-glob";
import stylelint from "stylelint";

const {
  createPlugin,
  utils: { ruleMessages, report },
} = stylelint;

const themeFolder = "packages/theme/css";

const characteristicFiles = glob.sync("*/characteristics/*.css", {
  cwd: themeFolder,
});

const characteristicSets = {};

for (const file of characteristicFiles) {
  const themeName = path.basename(path.dirname(path.dirname(file)));

  if (!characteristicSets[themeName]) {
    characteristicSets[themeName] = new Set();
  }

  const ast = parse(
    fs.readFileSync(path.join(themeFolder, file), { encoding: "utf-8" }),
  );

  const tokens = findAll(
    ast,
    (node) => node.type === "Declaration" && node.property.startsWith("--salt"),
  ).map((decl) => decl.property);

  characteristicSets[themeName] = new Set(tokens).union(
    characteristicSets[themeName],
  );
}

const themes = Object.keys(characteristicSets);

const tokenCounts = {};

for (const themeTokens of Object.values(characteristicSets)) {
  for (const token of themeTokens) {
    tokenCounts[token] = (tokenCounts[token] ?? 0) + 1;
  }
}

// ---- Start of plugin ----

const ruleName = "salt/characteristic-token-in-all-themes";

const messages = ruleMessages(ruleName, {
  notPresentInAllThemes: (propertyChecked) =>
    `Token is not present in all themes. (${propertyChecked})`,
});

const meta = {
  // Point to style documentation
  url: "https://saltdesignsystem-storybook.pages.dev/?path=/story/theme-characteristics-about-characteristics--docs",
};

function isInAllThemes(property, verboseLog) {
  const checkResult = tokenCounts[property] === themes.length;
  verboseLog &&
    console.log("Checking", property, "is in all themes", checkResult);
  return checkResult;
}

const ruleFunction = (primaryOption, secondaryOptionObject) => {
  return (root, result) => {
    function complain(index, length, decl, propertyChecked) {
      report({
        result,
        ruleName,
        message: messages.notPresentInAllThemes(propertyChecked),
        node: decl,
        index,
        endIndex: index + length,
        severity: secondaryOptionObject?.severity ?? "error",
      });
    }

    const verboseLog = primaryOption.logLevel === "verbose";

    root.walkDecls((decl) => {
      const { prop } = decl;

      if (!prop.startsWith("--salt")) {
        return;
      }

      if (!isInAllThemes(prop, verboseLog)) {
        complain(0, prop.length, decl, prop);
      }
    });
  };
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(ruleName, ruleFunction);
