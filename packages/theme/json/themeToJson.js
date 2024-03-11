const fs = require("fs");
const path = require("path");
const util = require("util");

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
    } else if (
      stats.isFile() &&
      path.extname(file) === ".css" &&
      !filePath.includes("animation")
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

/* Removes surrounding CSS var('...') function from a token */
function stripVarFunc(cssVar) {
  return cssVar.replace("var(", "").replaceAll(")", "").replaceAll(" ", "");
}

/* Removes --salt- prefix from a token */
function removePrefix(cssVar) {
  return cssVar.replace("--salt-", "");
}

/* Adds curly brackets around token */
function formatValue(cssVar) {
  return `{${removePrefix(cssVar)}}`;
}

function format(variables) {
  const jsonTokens = { palette: {}, foundations: {} };

  for (const token of Object.entries(variables)) {
    var tokenName = removePrefix(token[0]);
    var tokenValue = token[1];
    let type;
    let rawValue;

    if (tokenName.startsWith("palette")) {
      const semantic = tokenName.split("-")[1];
      if (semantic === "corner") {
        type = "dimension";
      } else if (semantic === "opacity") {
        type = "number";
      } else {
        type = "color";
      }
      const aliasToken = stripVarFunc(tokenValue);
      let rawValue = variables[`${aliasToken}`];
      if (rawValue && rawValue.includes("palette-opacity")) {
        let opacityToken = rawValue.split(",")[3];
        rawValue =
          rawValue.split(",").slice(0, 3).join(",") +
          `, ${
            variables[stripVarFunc(variables[stripVarFunc(opacityToken)])]
          })`;
      }
      jsonTokens["palette"][semantic] = {
        [tokenName]: {
          $value: formatValue(aliasToken),
          $type: type,
          ...(rawValue && {
            $rawValue: rawValue,
          }),
        },
        ...jsonTokens["palette"][semantic],
      };
    } 
    // else {
    //   const semantic = tokenName.split("-")[0];
    //   if (["curve", "size"].includes(semantic)) {
    //     type = "dimension";
    //   } else if (semantic === "spacing") {
    //     type = "dimension";
    //     if (tokenValue.includes("calc")) {
    //       let [multiplier, multipleToken] = tokenValue
    //         .replace("calc(", "")
    //         .replace(")", "")
    //         .split(" * ");
    //       tokenValue = removePrefix(stripVarFunc(tokenValue))
    //         .replace("spacing", `{spacing`)
    //         .replace("100", "100})");
    //       multipleToken = variables[stripVarFunc(multipleToken)].replace(
    //         "px",
    //         ""
    //       );
    //       rawValue = `${multiplier * multipleToken}`;
    //     }
    //   } else if (["opacity", "zIndex"].includes(semantic)) {
    //     type = "number";
    //   } else if (semantic === "duration") {
    //     type = "duration";
    //   } else if (semantic === "typography") {
    //     const attribute = tokenName.split("-")[1];
    //     type = attribute;
    //   } else if (semantic === "shadow") {
    //     if (tokenName.includes("color")) {
    //       type = "color";
    //     } else {
    //       type = "shadow";
    //       const [offsetX, offsetY, blur, spread, color] = tokenValue.split(" ");
    //       tokenValue = {
    //         offsetX: offsetX,
    //         offsetY: offsetY,
    //         blur: blur,
    //         spread: spread,
    //         color: formatValue(stripVarFunc(color)),
    //       };
    //       const rawColor = variables[stripVarFunc(color)];
    //       rawValue = `${offsetX}, ${offsetY}, ${blur}, ${spread}, ${rawColor}`;
    //     }
    //   } else if (semantic === "color") {
    //     if (tokenName.includes("fade")) {
    //       type = "color";

    //       const colorToken = `${tokenName.split("-fade")[0]}`;
    //       const rawColorValue = variables[`--salt-${colorToken}`];

    //       const opacityValue = stripVarFunc(tokenValue.split(",")[3]);
    //       const foundationOpacityValue = variables[`${opacityValue}`];

    //       // e.g. --salt-palette-opacity-disabled -> --salt-opacity-40
    //       if (foundationOpacityValue.includes("opacity")) {
    //         const opacityAlias = stripVarFunc(foundationOpacityValue);
    //         let rawOpacityValue = variables[`${opacityAlias}`];
    //         tokenValue = {
    //           color: formatValue(colorToken),
    //           opacity: formatValue(opacityAlias),
    //         };
    //         rawValue = `${rawColorValue
    //           .replace("rgb", "rgba")
    //           .replace(")", "")}, ${rawOpacityValue})`;
    //       }
    //       // eg. --salt-opacity-8 directly used in --salt-color-black-fade-background-hover
    //       else {
    //         tokenValue = {
    //           color: formatValue(colorToken),
    //           opacity: formatValue(opacityValue),
    //         };
    //         rawValue = `${rawColorValue
    //           .replace("rgb", "rgba")
    //           .replace(")", "")}, ${foundationOpacityValue})`;
    //       }
    //     } else {
    //       type = "color";
    //     }
    //   }

    //   if (type) {
    //     jsonTokens["foundations"][semantic] = {
    //       [tokenName]: {
    //         $value: tokenValue,
    //         $type: type,
    //         ...(rawValue && {
    //           $rawValue: rawValue,
    //         }),
    //       },
    //       ...jsonTokens["foundations"][semantic],
    //     };
    //   }
    // }
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
  format({ ...paletteVariables, ...foundationVariables });
}

themeToJson();
