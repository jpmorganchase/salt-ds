import fs from "node:fs";
import path from "node:path";
import { parse, walk } from "css-tree";

const __dirname = import.meta.dirname;

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

function extractVariables(folder, outputFileBaseName) {
  const themeDirPath = path.resolve(__dirname, folder);

  const legacyCssVariables = getCssVariablesFromDir(themeDirPath);

  writeObjectToFile(legacyCssVariables, `${outputFileBaseName}.json`);

  const brandThemeCssVariables = {
    ...legacyCssVariables,
    ...getCssVariablesFromDir(themeDirPath, true),
  };

  writeObjectToFile(brandThemeCssVariables, `${outputFileBaseName}-next.json`);
}

extractVariables("../packages/theme/css/characteristics", "cssCharacteristics");
extractVariables("../packages/theme/css/foundations", "cssFoundations");
