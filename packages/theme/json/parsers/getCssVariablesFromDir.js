const fs = require("fs");
const path = require("path");

const cssVariableRegex = /([a-zA-Z0-9_-]+)\s*:\s*([^;]+)/g;

const lightModeRegex = /\.salt-theme\[data-mode="light"\].*?\{(.*?)\}.*?/s;
const darkModeRegex = /\.salt-theme\[data-mode="dark"\].*?\{(.*?)\}.*?/s;
const highDensityRegex = /\.salt-density-high.*?\{(.*?)\}.*?/s;
const mediumDensityRegex = /\.salt-density-medium.*?\{(.*?)\}.*?/s;
const lowDensityRegex = /\.salt-density-low.*?\{(.*?)\}.*?/s;
const touchDensityRegex = /\.salt-density-touch.*?\{(.*?)\}.*?/s;
const generalThemeRegex = /\.salt-theme.\{(.*?)\}.*?/s;

const lightModeNextRegex =
  /\.salt-theme-next\[data-mode="light"\].*?\{(.*?)\}.*?/s;
const darkModeNextRegex =
  /\.salt-theme-next\[data-mode="dark"\].*?\{(.*?)\}.*?/s;
const generalThemeNextRegex = /\.salt-theme-next.\{(.*?)\}.*?/s;

function isNonColor(token) {
  const tokenParts = token.split("-");
  const isColor = tokenParts.find((part) =>
    [
      "borderColor",
      "foreground",
      "background",
      "outlineColor",
      "indicator",
    ].includes(part)
  );
  return !isColor;
}

function processFile(
  filePath,
  {
    cssVariables,
    lightModeVariables,
    darkModeVariables,
    hdVariables,
    mdVariables,
    ldVariables,
    tdVariables,
  },
  nonColors
) {
  // Process CSS files
  const cssContent = fs.readFileSync(filePath, "utf8");

  let match;
  let hdContent = cssContent.match(highDensityRegex);
  let mdContent = cssContent.match(mediumDensityRegex);
  let ldContent = cssContent.match(lowDensityRegex);
  let tdContent = cssContent.match(touchDensityRegex);
  let lightContent;
  let darkContent;
  let generalContent;

  if (
    filePath.includes("palette-next") ||
    filePath.includes("characteristics-next")
  ) {
    lightContent = cssContent.match(lightModeNextRegex);
    darkContent = cssContent.match(darkModeNextRegex);
    generalContent = cssContent.match(generalThemeNextRegex);
  } else {
    lightContent = cssContent.match(lightModeRegex);
    darkContent = cssContent.match(darkModeRegex);
    generalContent = cssContent.match(generalThemeRegex);
  }

  if (lightContent) {
    while ((match = cssVariableRegex.exec(lightContent[0])) !== null) {
      const variableName = match[1];
      if (nonColors) {
        if (isNonColor(variableName)) {
          const variableValue = match[2].trim();
          lightModeVariables[variableName] = variableValue;
        }
      } else {
        const variableValue = match[2].trim();
        lightModeVariables[variableName] = variableValue;
      }
    }
  }
  if (darkContent) {
    while ((match = cssVariableRegex.exec(darkContent[0])) !== null) {
      const variableName = match[1];
      if (nonColors) {
        if (isNonColor(variableName)) {
          const variableValue = match[2].trim();
          darkModeVariables[variableName] = variableValue;
        }
      } else {
        const variableValue = match[2].trim();
        darkModeVariables[variableName] = variableValue;
      }
    }
  }
  if (hdContent) {
    while ((match = cssVariableRegex.exec(hdContent[0])) !== null) {
      const variableName = match[1];
      if (nonColors) {
        if (isNonColor(variableName)) {
          const variableValue = match[2].trim();
          hdVariables[variableName] = variableValue;
        }
      } else {
        const variableValue = match[2].trim();
        hdVariables[variableName] = variableValue;
      }
    }
  }
  if (mdContent) {
    while ((match = cssVariableRegex.exec(mdContent[0])) !== null) {
      const variableName = match[1];
      if (nonColors) {
        if (isNonColor(variableName)) {
          const variableValue = match[2].trim();
          mdVariables[variableName] = variableValue;
        }
      } else {
        const variableValue = match[2].trim();
        mdVariables[variableName] = variableValue;
      }
    }
  }
  if (ldContent) {
    while ((match = cssVariableRegex.exec(ldContent[0])) !== null) {
      const variableName = match[1];
      if (nonColors) {
        if (isNonColor(variableName)) {
          const variableValue = match[2].trim();
          ldVariables[variableName] = variableValue;
        }
      } else {
        const variableValue = match[2].trim();
        ldVariables[variableName] = variableValue;
      }
    }
  }
  if (tdContent) {
    while ((match = cssVariableRegex.exec(tdContent[0])) !== null) {
      const variableName = match[1];
      if (nonColors) {
        if (isNonColor(variableName)) {
          const variableValue = match[2].trim();
          tdVariables[variableName] = variableValue;
        }
      } else {
        const variableValue = match[2].trim();
        tdVariables[variableName] = variableValue;
      }
    }
  }
  if (generalContent) {
    while ((match = cssVariableRegex.exec(generalContent[0])) !== null) {
      const variableName = match[1];
      if (nonColors) {
        if (isNonColor(variableName)) {
          const variableValue = match[2].trim();
          cssVariables[variableName] = variableValue;
        }
      } else {
        const variableValue = match[2].trim();
        cssVariables[variableName] = variableValue;
      }
    }
  }
}

module.exports = {
  fromFile: function getCssVariablesFromFile(filePath) {
    const cssVariables = {};
    const lightModeVariables = {};
    const darkModeVariables = {};
    const hdVariables = {};
    const mdVariables = {};
    const ldVariables = {};
    const tdVariables = {};

    const stats = fs.statSync(filePath);
    if (stats.isFile() && path.extname(filePath) === ".css") {
      processFile(filePath, {
        cssVariables,
        lightModeVariables,
        darkModeVariables,
        hdVariables,
        mdVariables,
        ldVariables,
        tdVariables,
      });
    }

    return {
      light: lightModeVariables,
      dark: darkModeVariables,
      high: hdVariables,
      medium: mdVariables,
      low: ldVariables,
      touch: tdVariables,
      general: cssVariables,
    };
  },
  fromDir: function getCssVariablesFromDir(dirPath, nonColors) {
    const cssVariables = {};
    const lightModeVariables = {};
    const darkModeVariables = {};
    const hdVariables = {};
    const mdVariables = {};
    const ldVariables = {};
    const tdVariables = {};
    const files = fs.readdirSync(dirPath);
    const foundations = files.map((file) => file.replace(".css", ""));
    files.forEach((file) => {
      const filePath = path.join(dirPath, file);
      const fileName = file.replace(".css", "");
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        // Recursively process subdirectories
        Object.assign(cssVariables, getCssVariablesFromDir(filePath));
      } else if (
        stats.isFile() &&
        path.extname(file) === ".css" &&
        !foundations.includes(`${fileName}-next`) &&
        fileName !== "fade"
      ) {
        processFile(
          filePath,
          {
            cssVariables,
            lightModeVariables,
            darkModeVariables,
            hdVariables,
            mdVariables,
            ldVariables,
            tdVariables,
          },
          nonColors
        );
      }
    });

    return {
      light: lightModeVariables,
      dark: darkModeVariables,
      high: hdVariables,
      medium: mdVariables,
      low: ldVariables,
      touch: tdVariables,
      general: cssVariables,
    };
  },
};
