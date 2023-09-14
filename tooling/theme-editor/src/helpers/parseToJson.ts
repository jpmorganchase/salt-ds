/* eslint-disable */
//@ts-nocheck
import { createTokenMap } from "./createTokenMap";
import css from "@adobe/css-tools";

export type JSONByScope = {
  scope: string;
  jsonObj: JSONObj;
};
export interface JSONObj {
  [key: string]: JSONObj;
  value?: string;
}

function parseVal(value) {
  var cssVarDashRegex = new RegExp("--", "gi");
  var closeBracketRegex = new RegExp("[)]", "gi");

  if (value.includes("var(")) {
    const parts = value.split("var(");
    let cssVar = "";

    if (parts[0].startsWith("rgba")) {
      for (var p of parts.slice(1)) {
        if (p.startsWith("--salt")) {
          cssVar +=
            "*" +
            p.replace(cssVarDashRegex, "").replace(closeBracketRegex, "") +
            "*";
        }
      }

      return parts[0] + cssVar + ")";
    }
    if (parts[0].startsWith("linear-gradient")) {
      for (var p of parts.slice(1)) {
        if (p.startsWith("--salt")) {
          var cssVarPart = p.split(")")[0];
          cssVar +=
            "*" +
            cssVarPart
              .replace(cssVarDashRegex, "")
              .replace(closeBracketRegex, "") +
            "*";
          if (p.split(")").length > 1) {
            for (var addPart of p.split(")").slice(1)) cssVar += addPart;
          }
        }
      }

      return parts[0] + cssVar + ")";
    }
    if (!parts[0].length && parts.length > 2) {
      for (var p of parts.slice(1)) {
        if (p.startsWith("--salt")) {
          cssVar +=
            "*" +
            p
              .replace(cssVarDashRegex, "")
              .replace(closeBracketRegex, "")
              .replace(" ", "") +
            "* ";
        }
      }

      return cssVar;
    }
  }

  value = value.replace("var(--", "");

  var quoteRegex = new RegExp('"', "gi");
  value = value.replace(quoteRegex, "");

  if (value.startsWith("salt")) {
    value = value.replace(")", "");
  }

  return value;
}

export function tidyUp(cssToTidy: string) {
  // removes CSS comments and consecutive multiple new lines
  var commentRegex = new RegExp("(\\/\\*[\\s\\S]*?\\*\\/)", "gi");
  var multipleNewLineRegex = new RegExp("[\n]+", "gi");

  var tidyString = cssToTidy.replace(commentRegex, "");
  tidyString = tidyString.replace(multipleNewLineRegex, "\n");

  return tidyString;
}

export function parseCSStoJSON(stringCSS): JSONByScope[] {
  var obj = css.parse(stringCSS);
  css.stringify(obj);

  const tokenTree = createTokenMap(obj.stylesheet.rules);
  const scopeToJSONMap = [];

  function recurse(token, comma) {
    for (const [t, tp] of Object.entries(token)) {
      stringJSON += '"' + tp.label + '": {';

      if (tp.children) {
        if (Object.keys(tp.children).length > 1) {
          comma = true;
        }
        recurse(tp.children, comma);
        if (tp.value) {
          if (tp.children.length > 0) {
            // separate value attribute if it is a less specific token
            stringJSON += ", ";
          }
          stringJSON += '"value": "' + parseVal(tp.value) + '"';
        }
        if (
          (tp.children.length === 0 || comma) &&
          tp.label !==
            token[Object.keys(token)[Object.keys(token).length - 1]].label
        ) {
          stringJSON += "},";
        } else {
          stringJSON += "}";
        }
      }
    }
  }

  // for each css selector
  for (const [id, scopeAndJSON] of Object.entries(tokenTree)) {
    var stringJSON = "{";
    var comma = false;
    if (Object.keys(scopeAndJSON.children).length > 1) {
      comma = true;
    }
    recurse(scopeAndJSON.children, comma);
    stringJSON += "}";
    scopeToJSONMap.push({
      scope: scopeAndJSON.label,
      jsonObj: JSON.parse(stringJSON),
    });
  }
  return scopeToJSONMap;
}
