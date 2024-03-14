const path = require("path");
const fs = require("fs");
const getJson = require("./themeToJson");
const colorFormatSwap = require("./colorFormatSwap");

var hexRegex = /^#[0-9A-F]{6}[0-9a-f]{0,2}$/i;

function convertToRgb(alias) {
  // color needs converting
  const color = alias.replace("#", "");
  return colorFormatSwap("rgb", color);
}

function getActualColor(alias, themeJson) {
  const pathByGrouping = alias.slice(1, -1).split(".");

  let x = 0;
  let p = { ...themeJson };

  while (pathByGrouping[x]) {
    p = p[pathByGrouping[x]];
    x++;
  }

  if (!p["$value"]) {
    return undefined;
  }

  const hex = p["$value"];
  return convertToRgb(hex);
}

function getValue(alias) {
  if (hexRegex.test(alias)) {
    const rgb = convertToRgb(alias);
    return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  }

  if (!(alias.startsWith("{") && alias.endsWith("}"))) {
    // must be raw value, e.g. 'transparent'
    return alias;
  }

  // else must be true alias, get path
  const pathByGrouping = alias.slice(1, -1).split(".");

  let x = 0;
  let p = pathByGrouping[x];

  while (pathByGrouping[x]) {
    p = pathByGrouping[x];
    x++;
  }

  return `var(--salt-${p})`;
}

function toCSS(themeJson) {
  const classes = {
    ...themeJson.modes.reduce(
      (a, mode) => ({
        ...a,
        [mode]: {
          class: `.salt-theme[data-mode="${mode.slice(1)}"]`,
          variables: [],
        },
      }),
      {}
    ),
    ...themeJson.densities.reduce(
      (a, density) => ({
        ...a,
        [density]: {
          class: `.salt-density-${density.slice(1)}`,
          variables: [],
        },
      }),
      {}
    ),
    ["general"]: {
      class: `.salt-theme`,
      variables: [],
    },
  };

  // Palette
  for (const semantic of Object.entries(themeJson.palette)) {
    // General
    for (const token of Object.entries(semantic[1])) {
      if (typeof token[1]["$value"] === "string") {
        const value = getValue(token[1]["$value"]);
        classes["general"].variables = [
          ...classes["general"].variables,
          `--salt-${token[0]}: ${value};`,
        ];
      }
    }
    // Modes
    for (const mode of themeJson.modes) {
      for (const token of Object.entries(semantic[1])) {
        if (token[1]["$value"][mode]) {
          const value = getValue(token[1]["$value"][mode]);
          classes[mode].variables = [
            ...classes[mode].variables,
            `--salt-${token[0]}: ${value};`,
          ];
        }
      }
    }
  }

  // Foundations
  for (const semantic of Object.entries(themeJson.foundations)) {
    // General
    for (const token of Object.entries(semantic[1])) {
      if (typeof token[1]["$value"] === "string") {
        const value = getValue(token[1]["$value"]);
        classes["general"].variables = [
          ...classes["general"].variables,
          `--salt-${token[0]}: ${value};`,
        ];
      }
      if (token[1]["$value"]["opacity"] && token[1]["$value"]["color"]) {
        const color = getActualColor(token[1]["$value"]["color"], themeJson);
        const opacity = getValue(token[1]["$value"]["opacity"]);
        classes["general"].variables = [
          ...classes["general"].variables,
          `--salt-${token[0]}: rgba(${color.r}, ${color.g}, ${color.b}, ${opacity});`,
        ];
      }
      if (
        token[1]["$value"][
          "offsetX"
        ] /* can be improved when typed; but this must be a shadow */
      ) {
        const offsetX = token[1]["$value"]["offsetX"];
        const offsetY = token[1]["$value"]["offsetY"];
        const blur = token[1]["$value"]["blur"];
        const spread = token[1]["$value"]["spread"];
        const color = getValue(token[1]["$value"]["color"]);
        classes["general"].variables = [
          ...classes["general"].variables,
          `--salt-${token[0]}: ${offsetX} ${offsetY} ${blur} ${spread} ${color};`,
        ];
      }
    }
    // Modes
    for (const mode of themeJson.modes) {
      for (const token of Object.entries(semantic[1])) {
        if (token[1]["$value"][mode]) {
          const value = getValue(token[1]["$value"][mode]);
          classes[mode].variables = [
            ...classes[mode].variables,
            `--salt-${token[0]}: ${value};`,
          ];
        }
      }
    }
    // Densities
    for (const density of themeJson.densities) {
      for (const token of Object.entries(semantic[1])) {
        if (token[1]["$value"][density]) {
          const value = getValue(token[1]["$value"][density]);
          classes[density].variables = [
            ...classes[density].variables,
            `--salt-${token[0]}: ${value};`,
          ];
        }
      }
    }
  }

  let CSS = "";

  for (const c of Object.entries(classes)) {
    CSS += c[1].class + " {\n";
    CSS += "\t" + c[1].variables.join("\n\t") + " \n}\n\n";
  }

  return CSS;
}

const themeCss = toCSS(getJson());
const outputPath = path.join(__dirname, "../theme.css");

try {
  fs.writeFileSync(outputPath, themeCss, "utf8");
} catch (err) {
  console.error("Error writing CSS file:", err);
}
