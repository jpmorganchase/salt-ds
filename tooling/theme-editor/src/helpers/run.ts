/* eslint-disable */
//@ts-nocheck
import { parseCSStoJSON } from "./parseToJson";

const fs = require('fs');
const path = require('path');

const walkObject = (obj: object, predicate: (obj: object) => boolean, transform: (obj: object) => object) => {
  Object.keys(obj).forEach(function (key) {
    if (predicate(obj[key])) {
      obj[key] = transform(obj[key]);
    }
    else if (typeof obj[key] === 'object' &&
      !Array.isArray(obj[key]) &&
      obj[key] !== null) {
      walkObject(obj[key], predicate, transform)
    }
  });
}

/**
 * figma tokens expected:
      "000": {
        "value": "#f3f6f6",
        "type": "color"
      },
 */
const addColorType = (input) => {
  input.type = 'color';
  return input;
}

const inputFile = path.join(__dirname, '../../../../packages/theme/css/foundations/color.css');
const parsedInputFile = path.parse(inputFile);
const outputFile = path.join(parsedInputFile.dir, parsedInputFile.name + "_ouput.json");

try {
  const data = fs.readFileSync(inputFile, 'utf8')
  // console.log(data)
  const jsonOutput = parseCSStoJSON(data);

  // jsonOutput.forEach(j => console.log(j.scope, JSON.stringify(j.jsonObj)))

  if (jsonOutput.length === 0) {
    console.error('No valid jsonOutput parsed')
  } else {

    const j = jsonOutput[0].jsonObj;
    walkObject(j, (test) => test.value && typeof test.value === 'string', addColorType);

    // 2nd, 3rd arg to pretty print
    const content = JSON.stringify(j, null, 2)
    fs.writeFileSync(outputFile, content);
    console.log("Wrote to", outputFile)
  }



} catch (err) {
  console.error(err)
}




