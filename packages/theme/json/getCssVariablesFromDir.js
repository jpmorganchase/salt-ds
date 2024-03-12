const fs = require("fs");
const path = require("path");

module.exports = function getCssVariablesFromDir(dirPath) {
  const cssVariableRegex = /([a-zA-Z0-9_-]+)\s*:\s*([^;]+)/g;

  const lightModeRegex = /\.salt-theme\[data-mode="light"\].*?\{(.*?)\}.*?/s;
  const darkModeRegex = /\.salt-theme\[data-mode="dark"\].*?\{(.*?)\}.*?/s;
  const highDensityRegex = /\.salt-density-high.*?\{(.*?)\}.*?/s;
  const mediumDensityRegex = /\.salt-density-medium.*?\{(.*?)\}.*?/s;
  const lowDensityRegex = /\.salt-density-low.*?\{(.*?)\}.*?/s;
  const touchDensityRegex = /\.salt-density-touch.*?\{(.*?)\}.*?/s;
  const generalThemeRegex = /\.salt-theme.\{(.*?)\}.*?/s;

  const cssVariables = {};
  const lightModeVariables = {};
  const darkModeVariables = {};
  const hdVariables = {};
  const mdVariables = {};
  const ldVariables = {};
  const tdVariables = {};

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
      !filePath.includes("animation")
    ) {
      // Process CSS files
      const cssContent = fs.readFileSync(filePath, "utf8");

      let match;
      let lightContent = cssContent.match(lightModeRegex);
      let darkContent = cssContent.match(darkModeRegex);
      let generalContent = cssContent.match(generalThemeRegex);
      let hdContent = cssContent.match(highDensityRegex);
      let mdContent = cssContent.match(mediumDensityRegex);
      let ldContent = cssContent.match(lowDensityRegex);
      let tdContent = cssContent.match(touchDensityRegex);

      if (lightContent) {
        while ((match = cssVariableRegex.exec(lightContent[0])) !== null) {
          const variableName = match[1];
          const variableValue = match[2].trim();
          lightModeVariables[variableName] = variableValue;
        }
      }
      if (darkContent) {
        while ((match = cssVariableRegex.exec(darkContent[0])) !== null) {
          const variableName = match[1];
          const variableValue = match[2].trim();
          darkModeVariables[variableName] = variableValue;
        }
      }
      if (hdContent) {
        while ((match = cssVariableRegex.exec(hdContent[0])) !== null) {
          const variableName = match[1];
          const variableValue = match[2].trim();
          hdVariables[variableName] = variableValue;
        }
      }
      if (mdContent) {
        while ((match = cssVariableRegex.exec(mdContent[0])) !== null) {
          const variableName = match[1];
          const variableValue = match[2].trim();
          mdVariables[variableName] = variableValue;
        }
      }
      if (ldContent) {
        while ((match = cssVariableRegex.exec(ldContent[0])) !== null) {
          const variableName = match[1];
          const variableValue = match[2].trim();
          ldVariables[variableName] = variableValue;
        }
      }
      if (tdContent) {
        while ((match = cssVariableRegex.exec(tdContent[0])) !== null) {
          const variableName = match[1];
          const variableValue = match[2].trim();
          tdVariables[variableName] = variableValue;
        }
      }
      if (generalContent) {
        while ((match = cssVariableRegex.exec(generalContent[0])) !== null) {
          const variableName = match[1];
          const variableValue = match[2].trim();
          cssVariables[variableName] = variableValue;
        }
      }
    }
  });

  return {
    light: lightModeVariables,
    dark: darkModeVariables,
    hd: hdVariables,
    md: mdVariables,
    ld: ldVariables,
    td: tdVariables,
    general: cssVariables,
  };
};
