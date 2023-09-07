const fs = require("fs");
const path = require("path");

function getCssVariablesFromDir(dirPath) {
  const cssVariableRegex = /([a-zA-Z0-9_-]+)\s*:\s*([^;]+)/g;
  const cssVariables = {};

  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      // Recursively process subdirectories
      Object.assign(cssVariables, getCssVariablesFromDir(filePath));
    } else if (stats.isFile() && path.extname(file) === ".css") {
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

const themeBuildingBlocks = ["foundations", "characteristics", "palette", "deprecated"];

const cssDirPath = path.resolve(__dirname, "../packages/theme/css");
const cssFolderPath = path.resolve(
  __dirname,
  "../site/src/components/css-variables/json"
);

try {
  for (var block of themeBuildingBlocks) {
    const tokens = getCssVariablesFromDir(
      path.join(cssDirPath, block)
    );
    const jsonData = JSON.stringify(tokens, null, 2);
    const blockPath = path.join(
      cssFolderPath,
      `${block}Variables.json`
    );
    fs.writeFileSync(blockPath, jsonData, "utf8");
  }
} catch (err) {
  console.error("Error writing JSON file:", err);
}
