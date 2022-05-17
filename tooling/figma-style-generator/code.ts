// FIXME: Direct import from package doesn't work, maybe due to tsconfig
// import {
//   CSSByPattern,
//   parseJSONtoCSS,
// } from "../theme-editor/src/helpers/parseToCss";

// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).

const ITERATION_THRESHOLD = 10;

// This shows the HTML page in "ui.html".
figma.showUI(__html__, { width: 436, height: 495 });

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = (msg) => {
  // One way of distinguishing between different types of messages sent from
  // your HTML page is to use an object with a "type" property like this.
  if (msg.type === "create-style") {
    let newStyleCounter = 0;

    const jsonInput: string = msg.jsonInput;
    const inputJsonObj = JSON.parse(jsonInput);
    transformToLocalStyle(inputJsonObj);
    figma.notify(`${newStyleCounter} local styles created 😎`);

    // parsedJson: JSONObj
    function transformToLocalStyle(parsedJson: any) {
      function recurse(node, key) {
        Object.keys(node).map((path) => {
          if (path !== "value") {
            if (path !== "type") {
              recurse(node[path], (key ? key + "/" : "") + path);
            }
          } else {
            // console.log(key, node[path]);
            const name = key;
            let value = node[path];
            let description = "";
            let referencePointer = "";
            let iterationCount = 0;
            while (value.startsWith("{")) {
              // get the real value from inputJson
              referencePointer = value.replace(/[\{\}]/g, "");
              const keys = referencePointer.split(".");
              if (iterationCount === 0) {
                // description should be the reference name
                // We want keep the description to the immediate resolved value
                description = referencePointer;
              }
              value = getValueFromObj(inputJsonObj, keys);

              iterationCount++;
              // console.log(referencePointer, value);
              if (iterationCount > ITERATION_THRESHOLD) {
                figma.notify(`Can not find value with {${referencePointer}}`, {
                  error: true,
                });
                break;
              }
            }
            if (iterationCount < ITERATION_THRESHOLD) {
              const newPaintStyle = figma.createPaintStyle();
              newPaintStyle.name = name;
              newPaintStyle.description = description;
              const transparent = value === "transparent";
              newPaintStyle.paints = [
                {
                  type: "SOLID",
                  color: transparent ? { r: 0, g: 0, b: 0 } : extractRgb(value),
                  opacity: transparent ? 0 : 1,
                },
              ];
              newStyleCounter++;
            }
          }
        });
      }
      recurse(parsedJson, "");
    }
  }

  function getValueFromObj(obj, keys: string[]) {
    if (keys.length) {
      const firstKey = keys.shift();
      return getValueFromObj(obj[firstKey], keys);
    } else {
      return obj.value;
    }
  }

  function extractRgb(colorString: string) {
    const array = colorString
      .replace(/[^\d,]/g, "")
      .split(",")
      .map((x) => Number.parseInt(x) / 255);
    return {
      r: array[0],
      g: array[1],
      b: array[2],
    };
  }

  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  figma.closePlugin();
};
