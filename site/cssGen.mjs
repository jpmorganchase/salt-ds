import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { findAll, generate, parse } from "css-tree";
import glob from "fast-glob";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const themeFolder = "../packages/theme/css";
const densities = ["high", "medium", "low", "touch", "mobile"];

function getTokensFromCssFile(cssFilePath) {
  const ast = parse(fs.readFileSync(cssFilePath, { encoding: "utf-8" }));

  return findAll(
    ast,
    (node) => node.type === "Declaration" && node.property.startsWith("--salt"),
  ).reduce((acc, node) => {
    acc[node.property] = node.value.value.trim();

    return acc;
  }, {});
}

function getDensityTokensFromCssFile(cssFilePath) {
  const ast = parse(fs.readFileSync(cssFilePath, { encoding: "utf-8" }));

  return findAll(ast, (node) => node.type === "Rule").reduce((acc, rule) => {
    const selector = rule.prelude ? generate(rule.prelude) : "";
    const matchingDensities = densities.filter((density) =>
      selector.includes(`salt-density-${density}`),
    );

    if (matchingDensities.length === 0) {
      return acc;
    }

    const declarations = findAll(
      rule,
      (node) =>
        node.type === "Declaration" && node.property.startsWith("--salt"),
    );

    for (const declaration of declarations) {
      const property = declaration.property;
      const value = declaration.value.value.trim();

      acc[property] ??= {};

      for (const density of matchingDensities) {
        acc[property][density] = value;
      }
    }

    return acc;
  }, {});
}

function writeObjectToFile(object, outputFile) {
  const jsonData = JSON.stringify(object, null, 2);
  const cssFolderPath = path.resolve(
    __dirname,
    "../site/src/components/css-display",
  );

  const outputPath = path.join(cssFolderPath, outputFile);

  try {
    console.log("Writing JSON data to", outputPath);
    fs.writeFileSync(outputPath, jsonData, "utf8");
  } catch (err) {
    console.error("Error writing JSON file:", err);
  }
}

/* Generate CSS Characteristics JSON */

const characteristicFiles = glob.sync("*/characteristics/*.css", {
  cwd: themeFolder,
});

const characteristicSets = {};
const characteristicDensitySets = {};

for (const file of characteristicFiles) {
  const themeName = path.basename(path.dirname(path.dirname(file)));

  const tokens = getTokensFromCssFile(path.join(themeFolder, file));
  const densityTokens = getDensityTokensFromCssFile(
    path.join(themeFolder, file),
  );

  characteristicSets[themeName] = {
    ...characteristicSets[themeName],
    ...tokens,
  };

  characteristicDensitySets[themeName] = {
    ...characteristicDensitySets[themeName],
    ...densityTokens,
  };
}

for (const [themeName, tokens] of Object.entries(characteristicSets)) {
  writeObjectToFile(tokens, `cssCharacteristics-${themeName}.json`);
}

for (const [themeName, tokens] of Object.entries(characteristicDensitySets)) {
  writeObjectToFile(tokens, `cssCharacteristicsDensity-${themeName}.json`);
}

/* Generate CSS Foundations JSON */

const sharedFoundationFiles = glob.sync("foundations/*.css", {
  cwd: themeFolder,
});

let sharedFoundations = {};
let sharedFoundationDensity = {};

for (const file of sharedFoundationFiles) {
  const tokens = getTokensFromCssFile(path.join(themeFolder, file));
  const densityTokens = getDensityTokensFromCssFile(
    path.join(themeFolder, file),
  );

  sharedFoundations = {
    ...sharedFoundations,
    ...tokens,
  };

  sharedFoundationDensity = {
    ...sharedFoundationDensity,
    ...densityTokens,
  };
}

const themeFoundationFiles = glob.sync("*/foundations/*.css", {
  cwd: themeFolder,
});

const foundationSets = {};
const foundationDensitySets = {};

for (const file of themeFoundationFiles) {
  const themeName = path.basename(path.dirname(path.dirname(file)));

  const tokens = getTokensFromCssFile(path.join(themeFolder, file));
  const densityTokens = getDensityTokensFromCssFile(
    path.join(themeFolder, file),
  );

  foundationSets[themeName] = {
    ...foundationSets[themeName],
    ...tokens,
  };

  foundationDensitySets[themeName] = {
    ...foundationDensitySets[themeName],
    ...densityTokens,
  };
}

for (const [themeName, tokens] of Object.entries(foundationSets)) {
  writeObjectToFile(
    { ...sharedFoundations, ...tokens },
    `cssFoundations-${themeName}.json`,
  );
}

for (const [themeName, tokens] of Object.entries(foundationDensitySets)) {
  writeObjectToFile(
    { ...sharedFoundationDensity, ...tokens },
    `cssFoundationsDensity-${themeName}.json`,
  );
}
