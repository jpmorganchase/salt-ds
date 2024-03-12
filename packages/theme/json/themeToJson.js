const util = require("util");
const path = require("path");
const getCssVariablesFromDir = require("./getCssVariablesFromDir");

/* Removes surrounding CSS var('...') function from a token */
function stripVarFunc(cssVar) {
  return cssVar.replace("var(", "").replaceAll(")", "").replaceAll(" ", "");
}

/* Removes --salt- prefix from a token */
function removePrefix(cssVar) {
  return cssVar.replace("--salt-", "");
}

const jsonTokens = { palette: {}, foundations: {} };
/*
 * Adds token to JSON schema
 * @param key - Mode or density the token belongs to, or 'general' if it has the same value in all modes and densities
 * @param themeLevel - One of 'palette', 'foundations', 'characteristics'
 * @param semantic - Key within theme level, e.g. 'accent', 'color', 'size', etc
 * @param tokenName - Name of the token
 * @param type - Token type, see https://design-tokens.github.io/community-group/format/#types
 * @tokenValue - Value of token (alias, e.g. {color.white}, or raw value, e.g. '4px')
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

function format(variables) {
  for (const key in variables) {
    for (const token of Object.entries(variables[key])) {
      var tokenName = removePrefix(token[0]);
      var tokenValue = token[1];
      let type;

      if (tokenName.startsWith("palette")) {
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
          !tokenValue !== "transparent"
            ? formatFoundationValue(semantic, tokenValue)
            : tokenValue;
        addToJson(key, "palette", semantic, tokenName, type, tokenValue);
      } else {
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
            } else {
              type = "shadow";
              const [offsetX, offsetY, blur, spread, color] =
                tokenValue.split(" ");
              tokenValue = {
                offsetX: offsetX,
                offsetY: offsetY,
                blur: blur,
                spread: spread,
                color: `{foundations.color.${removePrefix(
                  stripVarFunc(color)
                )}}`,
              };
            }
            break;
          case "color":
            if (tokenName.includes("fade")) {
              type = "color";
              const colorToken = `${tokenName.split("-fade")[0]}`;
              const opacityValue = stripVarFunc(tokenValue.split(",")[3]);
              const foundationOpacityValue =
                variables["general"][`${opacityValue}`];
              // e.g. --salt-palette-opacity-disabled -> --salt-opacity-40
              if (foundationOpacityValue.includes("opacity")) {
                tokenValue = {
                  color: `{foundations.color.${colorToken}}`,
                  opacity: `{foundations.opacity.${removePrefix(
                    stripVarFunc(foundationOpacityValue)
                  )}}`,
                };
              }
              // eg. --salt-opacity-8 directly used in --salt-color-black-fade-background-hover
              else {
                tokenValue = {
                  color: `{foundations.color.${colorToken}}`,
                  opacity: `{foundations.opacity.${removePrefix(
                    opacityValue
                  )}}`,
                };
              }
            } else {
              type = "color";
            }
            break;
          default:
            type = "undefined";
        }

        if (type !== "undefined") {
          addToJson(key, "foundations", semantic, tokenName, type, tokenValue);
        }
      }
    }
  }

  console.log(util.inspect(jsonTokens, false, null, true /* enable colors */));
}

function themeToJson() {
  const paletteVariables = getCssVariablesFromDir(
    path.resolve(__dirname, "../css/palette")
  );
  const foundationVariables = getCssVariablesFromDir(
    path.resolve(__dirname, "../css/foundations")
  );
  const characteristicVariables = {};
  // getCssVariablesFromDir(
  //   path.resolve(__dirname, "../css/characteristics")
  // );
  format({
    light: {
      ...paletteVariables.light,
      ...foundationVariables.light,
      ...characteristicVariables.light,
    },
    dark: {
      ...paletteVariables.dark,
      ...foundationVariables.dark,
      ...characteristicVariables.dark,
    },
    hd: {
      ...paletteVariables.hd,
      ...foundationVariables.hd,
      ...characteristicVariables.hd,
    },
    md: {
      ...paletteVariables.md,
      ...foundationVariables.md,
      ...characteristicVariables.md,
    },
    td: {
      ...paletteVariables.td,
      ...foundationVariables.td,
      ...characteristicVariables.td,
    },
    ld: {
      ...paletteVariables.ld,
      ...foundationVariables.ld,
      ...characteristicVariables.ld,
    },
    general: {
      ...paletteVariables.general,
      ...foundationVariables.general,
      ...characteristicVariables.general,
    },
  });
}

themeToJson();
