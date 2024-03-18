const path = require("path");
const fs = require("fs");
const getCssVariablesFromDir = require("./getCssVariablesFromDir");
const colorFormatSwap = require("./colorFormatSwap");

/* Removes surrounding CSS var('...') function from a token */
function stripVarFunc(cssVar) {
  return cssVar.replace("var(", "").replaceAll(")", "").replaceAll(" ", "");
}

/* Removes --salt- prefix from a token */
function removePrefix(cssVar) {
  return cssVar.replace("--salt-", "");
}

const jsonTokens = {
  modes: ["$light", "$dark"],
  densities: ["$high", "$medium", "$low", "$touch"],
  palette: {},
  foundations: {},
  characteristics: {},
};
/*
 * Adds token to JSON schema
 * @param key - Mode or density the token belongs to, or 'general' if it has the same value in all modes and densities
 * @param themeLevel - One of 'palette', 'foundations', 'characteristics'
 * @param semantic - Key within theme level, e.g. 'accent', 'color', 'size', etc
 * @param tokenName - Name of the token
 * @param type - Token type, see https://design-tokens.github.io/community-group/format/#types
 * @tokenValue - Value of token (alias, e.g. {color.white}, or raw value, e.g. '4px', 'transparent')
 **/
function addToJson(key, themeLevel, semantic, tokenName, type, tokenValue) {
  if (key !== "general") {
    // In this case, value will belong to either a mode or density,
    // ensure to keep all values within the field
    tokenValue = {
      [key]: tokenValue,
      ...(jsonTokens[themeLevel][semantic] &&
        jsonTokens[themeLevel][semantic][tokenName] && {
          ...jsonTokens[themeLevel][semantic][tokenName].$value,
        }),
    };
  }
  jsonTokens[themeLevel][semantic] = {
    ...jsonTokens[themeLevel][semantic],
    [tokenName]: {
      $value: tokenValue,
      $type: type,
    },
  };
}

/**
 * Maps semantic of palette to corresponding foundation reference
 **/
function formatFoundationValue(semantic, tokenValue) {
  const alias = removePrefix(stripVarFunc(tokenValue));

  let foundationSemantic;
  switch (semantic) {
    case "corner":
      foundationSemantic = "curve";
    case "opacity":
      foundationSemantic = "opacity";
    default:
      foundationSemantic = "color";
  }

  return `{foundations.${foundationSemantic}.${alias}}`;
}

/**
 * Maps semantic of characteristic color token to corresponding palette or foundation reference
 * Caveat: we have a shortcut in CSS for --salt-focused-outline that refs back to the individual parts
 **/
function formatCharacteristicValue(tokenValue) {
  const alias = removePrefix(stripVarFunc(tokenValue));

  if (alias.includes("palette")) {
    const semantic = alias.split("-")[1];
    return `{palette.${semantic}.${alias}}`;
  }

  if (alias.includes("outline")) {
    const semantic = alias.split("-")[0];
    return `{characteristics.${semantic}.${alias}}`;
  }

  const semantic = alias.split("-")[0];
  return `{foundations.${semantic}.${alias}}`;
}

const foundations = [
  "color",
  "curve",
  "duration",
  "opacity",
  "shadow",
  "size",
  "spacing",
  "typography",
  "zIndex",
];

function format(variables) {
  for (const key in variables) {
    for (const token of Object.entries(variables[key])) {
      var tokenName = removePrefix(token[0]);
      var tokenValue = token[1];
      var grouping = tokenName.split("-")[0];
      let type = undefined;

      if (grouping === "palette") {
        const semantic = tokenName.split("-")[1];
        switch (semantic) {
          case "corner":
            type = "dimension";
            break;
          case "opacity":
            type = "number";
            break;
          default:
            type = "color";
        }
        tokenValue =
          tokenValue !== "transparent"
            ? formatFoundationValue(semantic, tokenValue)
            : tokenValue;
        addToJson(key, "palette", semantic, tokenName, type, tokenValue);
      } else if (foundations.includes(grouping)) {
        const semantic = tokenName.split("-")[0];
        switch (semantic) {
          case "corner":
            type = "dimension";
            break;
          case "opacity":
            type = "number";
            break;
          default:
            type = "color";
        }
        tokenValue !== "transparent"
          ? formatFoundationValue(semantic, tokenValue)
          : tokenValue;
        addToJson(key, "foundations", semantic, tokenName, type, tokenValue);
      } else {
        const semantic = tokenName.split("-")[0];
        const tokenParts = tokenName.split("-");
        if (
          tokenParts.find((part) =>
            [
              "borderColor",
              "foreground",
              "background",
              "outlineColor",
              "indicator",
            ].includes(part)
          )
        ) {
          type = "color";
          tokenValue = formatCharacteristicValue(tokenValue);
        }
        if (tokenParts.find((part) => part === "cursor")) {
          type = "cursor";
        }
        if (tokenParts.find((part) => part === "borderStyle")) {
          type = "borderStyle";
        }
        if (tokenParts.find((part) => part === "borderWidth")) {
          type = "borderWidth";
        }
        if (tokenParts.find((part) => part === "outlineStyle")) {
          type = "outlineStyle";
        }
        if (tokenParts.find((part) => part === "outlineWidth")) {
          type = "outlineWidth";
        }
        if (tokenParts.find((part) => part === "outlineInset")) {
          type = "outlineInset";
        }
        if (tokenParts.find((part) => part === "outlineOffset")) {
          type = "outlineOffset";
        }
        if (tokenParts.find((part) => part === "outline")) {
          const [outlineWidth, outlineStyle, outlineColor] =
            tokenValue.split(" ");
          tokenValue = {
            $outlineWidth: formatCharacteristicValue(outlineWidth),
            $outlineStyle: formatCharacteristicValue(outlineStyle),
            $outlineColor: formatCharacteristicValue(outlineColor),
          };
          type = "outline";
        }
        if (tokenParts.find((part) => part === "letterSpacing")) {
          type = "letterSpacing";
        }
        if (tokenParts.find((part) => part === "textAlign")) {
          type = "textAlign";
        }
        if (tokenParts.find((part) => part === "textTransform")) {
          type = "textTransform";
        }
        if (tokenParts.find((part) => part === "fontStyle")) {
          type = "fontStyle";
        }
        if (tokenParts.find((part) => part === "fontWeight")) {
          // Do we want to group text e.g. h1, h2?
          type = "fontWeight";
        }
        if (tokenParts.find((part) => part === "fontFamily")) {
          type = "fontFamily";
        }
        if (tokenParts.find((part) => part === "fontSize")) {
          type = "fontSize";
        }
        if (tokenParts.find((part) => part === "lineHeight")) {
          type = "lineHeight";
        }
        if (tokenParts.find((part) => part === "minHeight")) {
          // Valid?
          type = "minHeight";
        }
        if (tokenParts.find((part) => part === "shadow")) {
          type = "shadow";
          tokenValue = formatCharacteristicValue(tokenValue);
        }

        if (type) {
          addToJson(
            key,
            "characteristics",
            semantic,
            tokenName,
            type,
            tokenValue
          );
        }
      }
    }
  }
}

function themeToJson() {
  const paletteVariables = getCssVariablesFromDir(
    path.resolve(__dirname, "../../css/palette")
  );
  const foundationVariables = getCssVariablesFromDir(
    path.resolve(__dirname, "../../css/foundations")
  );
  const characteristicVariables = getCssVariablesFromDir(
    path.resolve(__dirname, "../../css/characteristics")
  );
  format({
    $light: {
      ...paletteVariables.light,
      ...foundationVariables.light,
      ...characteristicVariables.light,
    },
    $dark: {
      ...paletteVariables.dark,
      ...foundationVariables.dark,
      ...characteristicVariables.dark,
    },
    $high: {
      ...paletteVariables.high,
      ...foundationVariables.high,
      ...characteristicVariables.high,
    },
    $medium: {
      ...paletteVariables.medium,
      ...foundationVariables.medium,
      ...characteristicVariables.medium,
    },
    $touch: {
      ...paletteVariables.touch,
      ...foundationVariables.touch,
      ...characteristicVariables.touch,
    },
    $low: {
      ...paletteVariables.low,
      ...foundationVariables.low,
      ...characteristicVariables.low,
    },
    general: {
      ...paletteVariables.general,
      ...foundationVariables.general,
      ...characteristicVariables.general,
    },
  });

  return jsonTokens;
}

module.exports = function getJson() {
  return themeToJson();
};

const themeJson = themeToJson();
const jsonData = JSON.stringify(themeJson, null, 2);
const outputPath = path.join(__dirname, "../theme.json");

try {
  fs.writeFileSync(outputPath, jsonData, "utf8");
} catch (err) {
  console.error("Error writing JSON file:", err);
}
