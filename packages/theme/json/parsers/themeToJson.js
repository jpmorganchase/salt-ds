const path = require("path");
const fs = require("fs");
const { fromDir } = require("./getCssVariablesFromDir");
const colorFormatSwap = require("./colorFormatSwap");

/* Removes surrounding CSS var('...') function from a token */
function stripVarFunc(cssVar) {
  return cssVar.replace("var(", "").replaceAll(")", "").replaceAll(" ", "");
}

/* Removes --salt- prefix from a token */
function removePrefix(cssVar) {
  return cssVar.replace("--salt-", "");
}

const cssVarRegex = /var\(([a-z-0-9,\s]+)\)/;
function extractVar(color) {
  let cssVar = cssVarRegex.exec(color)[1];
  if (cssVar.includes(",")) {
    // shouldn't, but safety check
    cssVar = cssVar.split(",")[0];
  }
  return cssVar;
}

// TODO: If opacity could be a var, need to fix this
function extractOpacity(color) {
  let opacity = color.split(",")[-1];
  opacity.replaceAll(")", "").trim("");
  return opacity;
}

const jsonTokens = {
  modes: ["$light", "$dark"],
  densities: ["$high", "$medium", "$low", "$touch"],
  // TODO: split fonts to headingFont & actionFont, so mode name sticks to values
  fonts: [
    "$amplitudeHeading",
    "$openSansHeading",
    "$amplitudeAction",
    "$openSansAction",
  ],
  corners: ["$rounded", "$sharp"],
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
      ["$" + key]: tokenValue,
      ...(jsonTokens[themeLevel][semantic] &&
        jsonTokens[themeLevel][semantic][tokenName] && {
          ...jsonTokens[themeLevel][semantic][tokenName].$value,
        }),
    };
  }
  // TODO: make `jsonTokens` pure, so 2 themes won't colide.
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
      break;
    case "opacity":
      foundationSemantic = "opacity";
      break;
    case "text":
      foundationSemantic = "typography";
      break;
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
          case "text":
            type = "fontFamily";
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
          case "curve":
            type = "dimension";
            break;
          case "size":
            type = "dimension";
            break;
          case "spacing":
            type = "dimension";
            if (tokenValue.includes("calc")) {
              let [multiplier, multipleToken] = tokenValue
                .replace("calc(", "")
                .replace(")", "")
                .split(" * ");
              multipleToken = variables["general"][
                stripVarFunc(multipleToken)
              ].replace("px", "");
              tokenValue = removePrefix(stripVarFunc(tokenValue))
                .replace("spacing", `{spacing`)
                .replace("100", "100}")
                .replace("calc(", "");
            }
            break;
          case "opacity":
            type = "number";
            break;
          case "zIndex":
            type = "number";
            break;
          case "duration":
            type = "duration";
            break;
          case "typography":
            const attribute = tokenName.split("-")[1];
            type = attribute;
            break;
          case "shadow":
            if (tokenName.includes("color")) {
              type = "color";
              tokenValue = colorFormatSwap("hex", tokenValue);
            } else {
              type = "shadow";
              const [offsetX, offsetY, blur, spread, color] =
                tokenValue.split(" ");
              tokenValue = {
                offsetX: offsetX,
                offsetY: offsetY,
                blur: blur,
                spread: spread,
                color: `{foundations.shadow.${removePrefix(
                  stripVarFunc(color),
                )}}`,
              };
            }
            break;
          case "color":
            type = "color";
            if (tokenName.includes("fade")) {
              if (tokenValue.includes("var(")) {
                const rgbToken = extractVar(tokenValue);
                const opacity = extractOpacity(tokenValue);
                tokenValue = {
                  color: `${formatFoundationValue("color", rgbToken)}`,
                  opacity: opacity,
                };
              } else {
                const colorToken = `${tokenName.split("-fade")[0]}`;
                const opacityValue = stripVarFunc(tokenValue.split(",")[3]);
                // the semantic check here is due to e.g. --salt-palette-opacity-disabled used in fade tokens (correct) vs
                // e.g. --salt-opacity-8 directly used in --salt-color-black-fade-background-hover (this is technically wrong)
                tokenValue = {
                  color: `{foundations.color.${colorToken}}`,
                  opacity: `{${
                    opacityValue.includes("palette") ? "palette" : "foundations"
                  }.opacity.${removePrefix(stripVarFunc(opacityValue))}}`,
                };
              }
            } else {
              if (tokenValue.includes("var(")) {
                const rgbToken = extractVar(tokenValue);
                tokenValue = `${formatFoundationValue("color", rgbToken)}`;
              } else {
                tokenValue = colorFormatSwap("hex", tokenValue);
              }
            }
            break;
          default:
            type = undefined;
        }
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
            ].includes(part),
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
        if (tokenParts.find((part) => part === "fontWeight")) {
          // Do we want to group text e.g. h1, h2?
          type = "fontWeight";
          tokenValue = formatCharacteristicValue(tokenValue);
        }
        if (tokenParts.find((part) => part === "fontFamily")) {
          type = "fontFamily";
          tokenValue = formatCharacteristicValue(tokenValue);
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
            tokenValue,
          );
        }
      }
    }
  }
}

const defaultStruct = {
  light: {},
  dark: {},
  high: {},
  medium: {},
  low: {},
  touch: {},
  general: {},
  openSansHeading: {},
  amplitudeHeading: {},
  openSansAction: {},
  amplitudeAction: {},
  rounded: {},
  sharp: {},
};

function themeToJson(themeNext = false) {
  const variables = fromDir(path.resolve(__dirname, "../../css"), themeNext);

  format(variables);

  // TODO: make `jsonTokens` pure, so 2 themes won't colide.
  return jsonTokens;
}

module.exports = function getJson() {
  return themeToJson();
};

const themeJson = themeToJson();
writeJson(themeJson, "../theme.json");
// TODO: why teal is not in ourput json?
const themeNextJson = themeToJson(true);
writeJson(themeNextJson, "../theme-next.json");

function writeJson(json, filePath) {
  const jsonString = JSON.stringify(json, null, 2);
  const outputPath = path.join(__dirname, filePath);

  try {
    fs.writeFileSync(outputPath, jsonString, "utf8");
  } catch (err) {
    console.error("Error writing JSON file:", err);
  }
}
