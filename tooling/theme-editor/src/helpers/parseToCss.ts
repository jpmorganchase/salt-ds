/* eslint-disable */
//@ts-nocheck
import { capitalize } from "@jpmorganchase/uitk-lab";
import { JSONByScope } from "./parseToJson";
import {
  UITK_CHARACTERISTICS,
  UITK_FOUNDATIONS,
  UITK_COMPONENTS,
  UITK_PALETTES,
} from "../utils/uitkValues";

export type CSSByPattern = {
  pattern: string;
  cssObj: string;
};

var beautify_css = require("js-beautify").css;

function transformToCSS(patternJsonByScope) {
  let stringCSS = "";

  function recurse(node) {
    const lastNode = Object.keys(node)[Object.keys(node).length - 1];
    const tokenPrefix = stringCSS.split("{").slice(-1)[0].split(";").slice(-1);
    Object.keys(node).map((path) => {
      if (path !== "value") {
        if (path !== "type") {
          stringCSS += "-" + path;
          recurse(node[path]);
          if (path !== lastNode) {
            stringCSS += tokenPrefix;
          }
        } else {
          // ignore "type" = color, Figma Tokens need this
        }
      } else {
        if (node[path].startsWith("uitk")) {
          stringCSS += ": var(--" + node[path] + ");";
        } else if (node[path].startsWith("{")) {
          // console.log(node[path]);
          stringCSS += ": " + referenceToCssVar(node[path]) + ";";
        } else if (node[path].startsWith("*")) {
          const cssVars = node[path].split("*").filter((v) => v.length > 1);
          stringCSS += ":";

          for (var v of cssVars) {
            if (v.length) stringCSS += "var(--" + v + ") ";
          }
          stringCSS += ";";
        } else if (
          node[path].startsWith("linear") ||
          node[path].startsWith("rgba")
        ) {
          const cssParts = node[path].split("*");
          stringCSS += ":";
          for (var p of cssParts) {
            if (p.startsWith("uitk")) {
              stringCSS += "var(--" + p + ") ";
            } else {
              stringCSS += p + " ";
            }
          }
          stringCSS += ";";
        } else {
          stringCSS += ": " + node[path] + ";";
        }
      }
    });
  }

  patternJsonByScope.forEach((element) => {
    const isComponentScope = /^[A-Z]/.test(element.scope as string);

    let selector;
    if (element.scope === "mode-all") {
      selector = `.uitk-theme`;
    } else if (element.scope === "density-all") {
      selector = `.uitk-density-low, .uitk-density-medium, .uitk-density-high, .uitk-density-touch`;
    } else if (element.scope.includes("emphasis")) {
      selector = `.uitkEmphasis${capitalize(element.scope.split("-")[1])}`;
    } else {
      selector = `.uitk${isComponentScope ? "" : "-"}${element.scope}`;
    }
    stringCSS = stringCSS + selector + "{";

    Object.keys(element.jsonObj).forEach((path) => {
      if (path !== "value") {
        stringCSS += (isComponentScope ? "--" : "--uitk-") + path;
        recurse(element.jsonObj[path]);
      } else {
        stringCSS += ": " + element.jsonObj[path];
      }
    });

    stringCSS += "}";
  });

  return beautify_css(stringCSS);
}

export function parseJSONtoCSS(jsonByScope: JSONByScope[]): CSSByPattern[] {
  let cssByPattern = [];

  // TODO: Back to drawing board to figure out the best way to not need to do patterns in this generic layer of code
  for (var patternName of UITK_FOUNDATIONS.concat(
    UITK_PALETTES,
    UITK_CHARACTERISTICS,
    UITK_COMPONENTS
  )) {
    const patternJsonByScope = jsonByScope
      .filter((element) => {
        // TODO: remove hard requirement of "uitk" being the first key
        return element.jsonObj.uitk[patternName];
      })
      .map((element) => {
        const patternJSON = element.jsonObj.uitk[patternName];
        return {
          scope: element.scope,
          jsonObj: { [patternName]: patternJSON },
        };
      });

    const transformedCSS = transformToCSS(patternJsonByScope);
    cssByPattern.push({ pattern: patternName, cssObj: transformedCSS });
  }

  return cssByPattern;
}

/**
 * "{uitk.color.blue.600}"" => "var(--uitk-color-blue-600)"
 */
function referenceToCssVar(reference: string) {
  return (
    "var(--" +
    reference
      .replaceAll(/[\{\}]/g, "") // remove { &}
      .replaceAll(/\./g, "-") + // replace . with -
    ")"
  );
}
