/* eslint-disable */
//@ts-nocheck
import { capitalize } from "@salt-ds/lab";
import { JSONByScope } from "./parseToJson";
import { SALT_CHARACTERISTICS, SALT_FOUNDATIONS } from "../utils/saltValues";

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
        stringCSS += "-" + path;
        recurse(node[path]);
        if (path !== lastNode) {
          stringCSS += tokenPrefix;
        }
      } else {
        if (node[path].startsWith("salt")) {
          stringCSS += ": var(--" + node[path] + ");";
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
            if (p.startsWith("salt")) {
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
    let selector;
    if (element.scope === "mode-all") {
      selector = `.salt-theme`;
    } else if (element.scope === "density-all") {
      selector = `.salt-density-low, .salt-density-medium, .salt-density-high, .salt-density-touch`;
    } else if (element.scope.includes("emphasis")) {
      selector = `.saltEmphasis${capitalize(element.scope.split("-")[1])}`;
    } else {
      selector = `.salt-${element.scope}`;
    }
    stringCSS = stringCSS + selector + "{";

    Object.keys(element.jsonObj).forEach((path) => {
      if (path !== "value") {
        stringCSS += "--salt-" + path;
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

  for (var patternName of SALT_FOUNDATIONS.concat(SALT_CHARACTERISTICS)) {
    const patternJsonByScope = jsonByScope
      .filter((element) => {
        return element.jsonObj.salt[patternName];
      })
      .map((element) => {
        const patternJSON = element.jsonObj.salt[patternName];
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
