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

function stripVar(cssVar) {
  return cssVar.replace("var(", "").replaceAll(")", "").replaceAll(" ", "");
}

function format(variables) {
  const jsonTokens = { palette: {}, foundations: {} };

  for (const token of Object.entries(variables)) {
    var tokenName = token[0].replace("--salt-", "");
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
      const rawValue = variables[`${stripVar(tokenValue)}`];
      jsonTokens["palette"][semantic] = {
        [tokenName]: {
          $value: tokenValue,
          $type: type,
          ...(rawValue && {
            $rawValue: rawValue,
          }),
        },
        ...jsonTokens["palette"][semantic],
      };
    } else {
      const semantic = tokenName.split("-")[0];
      if (["curve", "size"].includes(semantic)) {
        type = "dimension";
      } else if (semantic === "spacing") {
        type = "dimension";
        if (tokenValue.includes("calc")) {
          let [multiplier, multipleToken] = tokenValue
            .replace("calc(", "")
            .replace(")", "")
            .split(" * ");
          multipleToken = variables[stripVar(multipleToken)].replace("px", "");
          rawValue = multiplier * multipleToken;
        }
      } else if (["opacity", "zIndex"].includes(semantic)) {
        type = "number";
      } else if (semantic === "duration") {
        type = "duration";
      } else if (semantic === "typography") {
        const attribute = tokenName.split("-")[1];
        type = attribute;
      } else if (semantic === "shadow") {
        if (tokenName.includes("color")) {
          type = "color";
        } else {
          type = "shadow";
          const [offsetX, offsetY, blur, spread, color] = tokenValue.split(" ");
          tokenValue = {
            offsetX: offsetX,
            offsetY: offsetY,
            blur: blur,
            spread: spread,
            color: stripVar(color).replace("--salt-", ""),
          };
          const rawColor = variables[stripVar(color)];
          rawValue = `${offsetX}, ${offsetY}, ${blur}, ${spread}, ${rawColor}`;
        }
      } else if (semantic === "color") {
        if (tokenName.includes("fade")) {
          type = "color";

          const colorToken = `${tokenName.split("-fade")[0]}`;
          const rawColorValue = variables[`--salt-${colorToken}`];

          const opacityValue = stripVar(
            tokenValue.split(",")[3].replace("--salt-", "")
          );
          const foundationOpacityValue = variables[`--salt-${opacityValue}`];
          const rawOpacityValue =
            variables[`${stripVar(foundationOpacityValue)}`];

          rawValue = `${rawColorValue
            .replace("rgb", "rgba")
            .replace(")", "")}, ${rawOpacityValue})`;

          tokenValue = {
            color: colorToken,
            opacity: opacityValue,
          };
        } else {
          type = "color";
        }
      }

      if (type) {
        jsonTokens["foundations"][semantic] = {
          [tokenName]: {
            $value: tokenValue,
            $type: type,
            ...(rawValue && {
              $rawValue: rawValue,
            }),
          },
          ...jsonTokens["foundations"][semantic],
        };
      }
    }
  }

  console.log(util.inspect(jsonTokens, false, null, true /* enable colors */));
}

function themeToJson() {
  const paletteVariables = getCssVariablesFromDir(
    path.resolve(__dirname, "../css/palette")
  );
  const foundationVariables = {getCssVariablesFromDir(
    path.resolve(__dirname, "../css/foundations")
  );}
  format({ ...paletteVariables, ...foundationVariables });
}

themeToJson();
