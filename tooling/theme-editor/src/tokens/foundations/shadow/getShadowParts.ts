import { JSONObj } from "../../../helpers/parseToJson";

export function getShadowParts(shadow: JSONObj): string[] {
  const noShadow = ["0", "0", "0", "0", "rgba(255,255,255,1)"];
  const shadowParts = shadow["value"];

  if (shadowParts === "none") {
    return noShadow;
  } else {
    let shadowPartsAndColor = shadowParts?.split("rgba");
    if (shadowPartsAndColor?.length !== 2) {
      shadowPartsAndColor = shadowParts?.split("rgb");
      if (shadowPartsAndColor?.length !== 2) {
        return noShadow; // TODO: Fix shadows that may end in a var(--..) or other possibilities
      }
    }

    return `${shadowPartsAndColor[0]}rgb${
      shadowParts?.includes("rgba") ? "a" : ""
    }${shadowPartsAndColor[1].replaceAll(" ", "")}`.split(" ");
  }
}
