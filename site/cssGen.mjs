import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse, walk } from "css-tree";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getCssVariablesFromDir(dirPath, themeNext = false) {
  console.log("Extracting CSS variable from", dirPath);

  const cssVariables = {};

  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      // Recursively process subdirectories
      Object.assign(cssVariables, getCssVariablesFromDir(filePath));
    } else if (
      stats.isFile() &&
      path.extname(file) === ".css" &&
      (themeNext
        ? path.basename(file).includes("-next")
        : !path.basename(file).includes("-next"))
    ) {
      // Process CSS files
      const cssContent = fs.readFileSync(filePath, "utf8");
      const ast = parse(cssContent);

      // Traverse the AST to find CSS variables
      walk(ast, (node) => {
        if (node.type === "Declaration" && node.property.startsWith("--salt")) {
          cssVariables[node.property] = node.value.children
            ? node.value.children
                .map((child) => child.name || child.value)
                .join("")
            : node.value.value.trim();
        }
      });
    }
  }

  return cssVariables;
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

function filterColorTokenInLegacy(token) {
  return Object.entries(token).reduce((acc, [key, value]) => {
    // temprorary fix for color variables not being overridden, in brand theme, all color token are 3 digits
    if (/--salt-color-\w+-\d*$/.test(key)) {
      // not double digits as well as special e.g. orange-850
      if (/--salt-color-\w+-\d00/.test(key)) {
        acc[key] = value;
      }
    } else {
      // all other variables
      acc[key] = value;
    }
    return acc;
  }, {});
}

function extractVariables(folder, outputFileBaseName) {
  const themeDirPath = path.resolve(__dirname, folder);

  const legacyCssVariables = getCssVariablesFromDir(themeDirPath);

  writeObjectToFile(legacyCssVariables, `${outputFileBaseName}.json`);

  const brandThemeCssVariables = {
    ...legacyCssVariables,
    // FIXME: foundation tokens are different (e.g. red.10 is only a legacy theme color), so can't be overridden as simple as this
    ...getCssVariablesFromDir(themeDirPath, true),
  };

  writeObjectToFile(
    filterColorTokenInLegacy(brandThemeCssVariables),
    `${outputFileBaseName}-next.json`,
  );
}

extractVariables(
  "../packages/theme/css/uitk/characteristics",
  "cssCharacteristics",
);
extractVariables("../packages/theme/css/uitk/foundations", "cssFoundations");
