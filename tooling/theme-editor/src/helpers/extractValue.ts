/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  isLinearGradient,
  isRGBAColor,
} from "../tokens/foundations/color/ColorValueEditor";
import { JSONByScope } from "./parseToJson";

export const extractValueFromJSON = (
  value: string,
  jsonInCurrentScope: JSONByScope[]
): string => {
  const mergedJSON = jsonInCurrentScope.map((js) => js.jsonObj.uitk);

  function recursePath(v: string): string {
    let path = Object.assign({}, ...mergedJSON);
    const original = v;
    if (v.startsWith("uitk-")) v = v.substring(5);

    for (const p of v.split("-")) {
      path = path[p];
      if (!path) return original;
    }

    if (path.value && typeof path.value === "string") {
      if (path.value.startsWith("uitk")) return recursePath(path.value);
      else return path.value;
    } else return original;
  }

  // edge cases containing inner uitk- values
  if (isRGBAColor(value) && value.split("*").length > 1) {
    const foundAlpha = recursePath(value.split("*")[1].replace(")", ""));
    if (foundAlpha) return value.split("*")[0] + foundAlpha + ")";
  }
  if (isLinearGradient(value) && value.split("*").length > 1) {
    let toReturn = "";

    for (const cssPart of value.split("*")) {
      if (cssPart.startsWith("uitk")) {
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
      if (cssPart.startsWith("uitk")) {
        const foundPart = recursePath(cssPart);
        if (foundPart) toReturn += foundPart + " ";
        else toReturn += cssPart;
      } else toReturn += cssPart;
    }

    return toReturn;
  }

  return recursePath(value);
};
