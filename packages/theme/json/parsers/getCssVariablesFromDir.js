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

// TODO: how to deal with double modes, e.g. `.salt-theme-next[data-mode="light"][data-accent="blue"]`
const lightModeNextRegex =
  /\.salt-theme(-next)?\[data-mode="light"\].*?\{(.*?)\}.*?/s;
const darkModeNextRegex =
  /\.salt-theme(-next)?\[data-mode="dark"\].*?\{(.*?)\}.*?/s;
const generalThemeNextRegex = /\.salt-theme-next.\{(.*?)\}.*?/s;
const openSansHeadingFontRegex =
  /\.salt-theme(-next)?\[data-heading-font="Open Sans"\].\{(.*?)\}.*?/s;
const amplitudeHeadingFontRegex =
  /\.salt-theme(-next)?\[data-heading-font="Amplitude"\].\{(.*?)\}.*?/s;
const openSansActionFontRegex =
  /\.salt-theme(-next)?\[data-action-font="Open Sans"\].\{(.*?)\}.*?/s;
const amplitudeActionFontRegex =
  /\.salt-theme(-next)?\[data-action-font="Amplitude"\].\{(.*?)\}.*?/s;
const roundedCornerRegex =
  /\.salt-theme(-next)?\[data-corner="rounded"].\{(.*?)\}.*?/s;
const sharpCornerRegex =
  /\.salt-theme(-next)?\[data-corner="sharp"].\{(.*?)\}.*?/s;

function isNonColor(token) {
  const tokenParts = token.split("-");
  const isColor = tokenParts.find((part) =>
    [
      "borderColor",
      "foreground",
      "background",
      "outlineColor",
      "indicator",
    ].includes(part),
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
    openSansHeadingVariables,
    amplitudeHeadingVariables,
    openSansActionVariables,
    amplitudeActionVariables,
    roundedCornerVariables,
    sharpCornerVariables,
  },
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
  let amplitudeHeadingContent;
  let openSansHeadingContent;
  let amplitudeActionContent;
  let openSansActionContent;
  let roundedCornerContent;
  let sharpCornerContent;

  if (filePath.includes("next")) {
    lightContent = cssContent.match(lightModeNextRegex);
    darkContent = cssContent.match(darkModeNextRegex);
    generalContent = cssContent.match(generalThemeNextRegex);
    amplitudeHeadingContent = cssContent.match(amplitudeHeadingFontRegex);
    openSansHeadingContent = cssContent.match(openSansHeadingFontRegex);
    amplitudeActionContent = cssContent.match(amplitudeActionFontRegex);
    openSansActionContent = cssContent.match(openSansActionFontRegex);
    roundedCornerContent = cssContent.match(roundedCornerRegex);
    sharpCornerContent = cssContent.match(sharpCornerRegex);
  } else {
    lightContent = cssContent.match(lightModeRegex);
    darkContent = cssContent.match(darkModeRegex);
    generalContent = cssContent.match(generalThemeRegex);
  }

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
  if (amplitudeHeadingContent) {
    while (
      (match = cssVariableRegex.exec(amplitudeHeadingContent[0])) !== null
    ) {
      const variableName = match[1];
      const variableValue = match[2].trim();
      amplitudeHeadingVariables[variableName] = variableValue;
    }
  }
  if (openSansHeadingContent) {
    while (
      (match = cssVariableRegex.exec(openSansHeadingContent[0])) !== null
    ) {
      const variableName = match[1];
      const variableValue = match[2].trim();
      openSansHeadingVariables[variableName] = variableValue;
    }
  }
  if (amplitudeActionContent) {
    while (
      (match = cssVariableRegex.exec(amplitudeActionContent[0])) !== null
    ) {
      const variableName = match[1];
      const variableValue = match[2].trim();
      amplitudeActionVariables[variableName] = variableValue;
    }
  }
  if (openSansActionContent) {
    while ((match = cssVariableRegex.exec(openSansActionContent[0])) !== null) {
      const variableName = match[1];
      const variableValue = match[2].trim();
      openSansActionVariables[variableName] = variableValue;
    }
  }
  if (roundedCornerContent) {
    while ((match = cssVariableRegex.exec(roundedCornerContent[0])) !== null) {
      const variableName = match[1];
      const variableValue = match[2].trim();
      roundedCornerVariables[variableName] = variableValue;
    }
  }
  if (sharpCornerContent) {
    while ((match = cssVariableRegex.exec(sharpCornerContent[0])) !== null) {
      const variableName = match[1];
      const variableValue = match[2].trim();
      sharpCornerVariables[variableName] = variableValue;
    }
  }
}

module.exports = {
  fromDir: function getCssVariablesFromDir(dirPath) {
    const cssVariables = {};
    const lightModeVariables = {};
    const darkModeVariables = {};
    const hdVariables = {};
    const mdVariables = {};
    const ldVariables = {};
    const tdVariables = {};
    const openSansHeadingVariables = {};
    const amplitudeHeadingVariables = {};
    const openSansActionVariables = {};
    const amplitudeActionVariables = {};
    const roundedCornerVariables = {};
    const sharpCornerVariables = {};
    const files = fs.readdirSync(dirPath);
    const dirFiles = files.map((file) => file.replace(".css", ""));
    const isFoundationsDir = dirPath.includes("foundations");

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const fileName = file.replace(".css", "");

      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        // Recursively process subdirectories
        Object.assign(cssVariables, getCssVariablesFromDir(filePath));
      } else if (
        stats.isFile() &&
        path.extname(file) === ".css" &&
        ((isFoundationsDir && !dirFiles.includes(`${fileName}-next`)) ||
          (!isFoundationsDir && fileName.includes("-next")))
      ) {
        processFile(filePath, {
          cssVariables,
          lightModeVariables,
          darkModeVariables,
          hdVariables,
          mdVariables,
          ldVariables,
          tdVariables,
          openSansHeadingVariables,
          amplitudeHeadingVariables,
          openSansActionVariables,
          amplitudeActionVariables,
          roundedCornerVariables,
          sharpCornerVariables,
        });
      }
    }
    return {
      light: lightModeVariables,
      dark: darkModeVariables,
      high: hdVariables,
      medium: mdVariables,
      low: ldVariables,
      touch: tdVariables,
      general: cssVariables,
      openSansHeading: openSansHeadingVariables,
      amplitudeHeading: amplitudeHeadingVariables,
      openSansAction: openSansActionVariables,
      amplitudeAction: amplitudeActionVariables,
      rounded: roundedCornerVariables,
      sharp: sharpCornerVariables,
    };
  },
};
