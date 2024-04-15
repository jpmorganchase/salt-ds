const getJson = require("./themeToJson");

const themeJson = getJson();

function check(jsonPath) {
  for (const token of Object.entries(jsonPath[1])) {
    if (
      typeof token[1]["$value"] === "string" &&
      token[1]["$value"].startsWith("{") &&
      token[1]["$value"].endsWith("}")
    ) {
      const jsonPathReference = token[1]["$value"].slice(1, -1).split(".");
      let findValue = themeJson;
      for (var p of jsonPathReference) {
        findValue = findValue[p];
        if (!findValue) {
          console.log(`Cannot find path ${jsonPathReference.join(".")}`);
          break;
        }
      }
      if (findValue && !findValue["$value"]) {
        console.log(`Path found ${findValue} but no value defined`);
      }
    }
  }
}

function validate() {
  for (const entry of Object.entries(themeJson.palette)) {
    check(entry);
  }
  for (const entry of Object.entries(themeJson.foundations)) {
    check(entry);
  }
  for (const entry of Object.entries(themeJson.characteristics)) {
    check(entry);
  }
}

validate();
