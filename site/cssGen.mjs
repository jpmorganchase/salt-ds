import fs from "node:fs";
import path from "node:path";
import { parse, walk } from "css-tree";

const __dirname = import.meta.dirname;

function getCssVariablesFromDir(dirPath, themeNext = false) {
  console.log("Extracting CSS variable from", dirPath);

  const cssVariableRegex = /([a-zA-Z0-9_-]+)\s*:\s*([^;]+)/g;
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

function extractVariables(folder, outputFile, themeNext = false) {
  const themeDirPath = path.resolve(__dirname, folder);

  const allCssVariables = themeNext
    ? {
        ...getCssVariablesFromDir(themeDirPath, false),
        ...getCssVariablesFromDir(themeDirPath, true),
      }
    : getCssVariablesFromDir(themeDirPath);
  const jsonData = JSON.stringify(allCssVariables, null, 2);
  const cssFolderPath = path.resolve(
    __dirname,
    "../site/src/components/css-display",
  );

  const outputPath = path.join(cssFolderPath, outputFile);

  try {
    fs.writeFileSync(outputPath, jsonData, "utf8");
  } catch (err) {
    console.error("Error writing JSON file:", err);
  }
}

extractVariables(
  "../packages/theme/css/characteristics",
  "cssCharacteristics.json",
);
extractVariables(
  "../packages/theme/css/characteristics",
  "cssCharacteristics-next.json",
  true,
);
extractVariables("../packages/theme/css/foundations", "cssFoundations.json");
extractVariables(
  "../packages/theme/css/foundations",
  "cssFoundations-next.json",
  true,
);
