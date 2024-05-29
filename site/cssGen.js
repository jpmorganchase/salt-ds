const fs = require("fs");
const path = require("path");

function getCssVariablesFromDir(dirPath) {
  console.log("Extracting CSS variable from", dirPath);

  const cssVariableRegex = /([a-zA-Z0-9_-]+)\s*:\s*([^;]+)/g;
  const cssVariables = {};

  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      // Recursively process subdirectories
      Object.assign(cssVariables, getCssVariablesFromDir(filePath));
    } else if (
      stats.isFile() &&
      path.extname(file) === ".css" &&
      !path.basename(file).includes("-next") // Skipping theme next
    ) {
      // Process CSS files
      const cssContent = fs.readFileSync(filePath, "utf8");
      let match;

      while ((match = cssVariableRegex.exec(cssContent)) !== null) {
        const variableName = match[1];
        const variableValue = match[2].trim();
        cssVariables[variableName] = variableValue;
      }
    }
  });

  return cssVariables;
}

function extractVariables(folder, outputFile) {
  const themeDirPath = path.resolve(__dirname, folder);

  const allCharacteristicsVariables = getCssVariablesFromDir(themeDirPath);
  const jsonData = JSON.stringify(allCharacteristicsVariables, null, 2);
  const cssFolderPath = path.resolve(
    __dirname,
    "../site/src/components/css-display"
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
  "cssCharacteristics.json"
);
extractVariables("../packages/theme/css/foundations", "cssFoundations.json");
