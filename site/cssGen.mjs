import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { findAll, parse } from "css-tree";
import glob from "fast-glob";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const themeFolder = "../packages/theme/css";

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

for (const file of characteristicFiles) {
  const themeName = path.basename(path.dirname(path.dirname(file)));

  const tokens = getTokensFromCssFile(path.join(themeFolder, file));

  characteristicSets[themeName] = {
    ...characteristicSets[themeName],
    ...tokens,
  };
}

for (const [themeName, tokens] of Object.entries(characteristicSets)) {
  writeObjectToFile(tokens, `cssCharacteristics-${themeName}.json`);
}

/* Generate CSS Foundations JSON */

const sharedFoundationFiles = glob.sync("foundations/*.css", {
  cwd: themeFolder,
});

let sharedFoundations = {};

for (const file of sharedFoundationFiles) {
  const tokens = getTokensFromCssFile(path.join(themeFolder, file));

  sharedFoundations = {
    ...sharedFoundations,
    ...tokens,
  };
}

const themeFoundationFiles = glob.sync("*/foundations/*.css", {
  cwd: themeFolder,
});

const foundationSets = {};

for (const file of themeFoundationFiles) {
  const themeName = path.basename(path.dirname(path.dirname(file)));

  const tokens = getTokensFromCssFile(path.join(themeFolder, file));

  foundationSets[themeName] = {
    ...foundationSets[themeName],
    ...tokens,
  };
}

for (const [themeName, tokens] of Object.entries(foundationSets)) {
  writeObjectToFile(
    { ...sharedFoundations, ...tokens },
    `cssFoundations-${themeName}.json`,
  );
}
