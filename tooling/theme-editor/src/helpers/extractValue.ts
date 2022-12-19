/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  isLinearGradient,
  isRGBAColor,
} from "../tokens/foundations/color/ColorValueEditor";
import { JSONByScope, JSONObj } from "./parseToJson";

function deepMerge(merged: any, toMerge: any) {
  if (typeof toMerge === "object") {
    Object.keys(toMerge).forEach((key) => {
      if (merged[key]) {
        if (key === "value") {
          /* Overwrite */
          merged[key] = toMerge[key];
        } else {
          merged[key] = deepMerge(merged[key], toMerge[key]);
        }
      } else {
        merged[key] = toMerge[key];
      }
    });
  }

  return merged;
}

function merge(jsonArray: JSONObj[]): JSONObj {
  let merged: JSONObj = {};

  jsonArray.forEach((json) => {
    Object.keys(json).forEach((key) => {
      if (merged[key]) {
        merged[key] = deepMerge(merged[key], json[key]);
      } else {
        merged[key] = json[key];
      }
    });
  });

  return merged;
}

export const extractValueFromJSON = (
  value: string,
  jsonInCurrentScope: JSONByScope[]
): string => {
  const mergedJSON = merge(jsonInCurrentScope.map((js) => js.jsonObj.salt));

  function recursePath(v: string): string {
    let path = mergedJSON;

    const original = v;
    if (v.startsWith("salt-")) v = v.substring(5);

    for (const p of v.split("-")) {
      path = path[p];
      if (!path) return original;
    }
    if (path.value && typeof path.value === "string") {
      if (path.value.startsWith("salt")) return recursePath(path.value);
      else return path.value;
    } else return original;
  }

  // edge cases containing inner salt- values
  if (isRGBAColor(value) && value.split("*").length > 1) {
    const foundAlpha = recursePath(value.split("*")[1].replace(")", ""));
    if (foundAlpha) return value.split("*")[0] + foundAlpha + ")";
  }
  if (isLinearGradient(value) && value.split("*").length > 1) {
    let toReturn = "";

    for (const cssPart of value.split("*")) {
      if (cssPart.startsWith("salt")) {
        const foundPart = recursePath(cssPart);
        if (!cssPart.includes(foundPart)) toReturn += foundPart;
        else toReturn += "*" + cssPart + "*";
      } else toReturn += cssPart;
    }

    return toReturn;
  }
  if (value.startsWith("*")) {
    let toReturn = "";
    for (const cssPart of value.split("*")) {
      if (cssPart.startsWith("salt")) {
        const foundPart = recursePath(cssPart);
        if (foundPart) toReturn += foundPart + " ";
        else toReturn += cssPart;
      } else toReturn += cssPart;
    }

    return toReturn;
  }

  return recursePath(value);
};
