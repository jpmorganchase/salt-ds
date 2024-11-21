import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const files = {
  // first one would be the default $value
  "blue-light": "../../tokens/palette/blue-light-next.tokens.json",
  "blue-dark": "../../tokens/palette/blue-dark-next.tokens.json",
  "teal-light": "../../tokens/palette/teal-light-next.tokens.json",
  "teal-dark": "../../tokens/palette/teal-dark-next.tokens.json",
};

const outputFile = "../../tokens/palette/palette-next.tokens.json";

/**
 *
 * @param {string} filePath
 */
function readToken(filePath) {
  const __dirname = import.meta.dirname;

  return JSON.parse(
    readFileSync(join(__dirname, filePath), { encoding: "utf-8" }),
  );
}

function writeToken(token, filePath) {
  const __dirname = import.meta.dirname;

  writeFileSync(join(__dirname, filePath), JSON.stringify(token, null, "  "), {
    encoding: "utf-8",
  });
}

function addModesValue(mainToken, modeName, modeSpecificToken) {
  if (!mainToken.$modes) {
    mainToken.$modes = {};
  }
  mainToken.$modes[modeName] = modeSpecificToken.$value;
}

function dedupeModesValue(token) {
  console.log("dedupeModesValue", token);
  // super specific to Salt accent/mode for now, split by "-", e.g. "blue-light" & "teal-light" can be potentially combined
  const {
    "blue-light": blueLightValue,
    "teal-light": tealLightValue,
    ...rest1
  } = token.$modes;

  if (blueLightValue && blueLightValue === tealLightValue) {
    token.$modes = {
      light: blueLightValue,
      ...rest1,
    };
  }
  console.log("rest1", token);

  const {
    "blue-dark": blueDarkValue,
    "teal-dark": tealDarkValue,
    ...rest2
  } = token.$modes;

  if (blueDarkValue && blueDarkValue === tealDarkValue) {
    token.$modes = {
      ...rest2,
      dark: blueDarkValue,
    };
  }
  console.log("rest2", token);
}

function iterateToAddModes(tokenObj, modeName, modeTokenObj) {
  // There shouldn't be any token with $value as well as nested token definations
  if ("$value" in tokenObj) {
    addModesValue(tokenObj, modeName, modeTokenObj);
    dedupeModesValue(tokenObj);
  } else {
    for (const [key, nestedToken] of Object.entries(tokenObj)) {
      // NOTE: This assumes all tokens having the same structure
      iterateToAddModes(nestedToken, modeName, modeTokenObj[key]);
    }
  }
}

let finalToken = undefined;
for (const [modeName, filePath] of Object.entries(files)) {
  if (!finalToken) {
    finalToken = readToken(filePath);
  }
  const modeObj = readToken(filePath);
  iterateToAddModes(finalToken, modeName, modeObj);
}
// console.log(finalToken);

writeToken(finalToken, outputFile);
