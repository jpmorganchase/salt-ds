import { JSONByScope } from "./parseToJson";
import { UITK_COLOURS } from "../utils/uitkValues";

export function createColorMap(
  jsonByScope: JSONByScope[]
): Record<string, string> {
  const colorMap: Record<string, string> = {};

  jsonByScope.forEach((element) => {
    if (["mode-all", "light", "dark"].includes(element.scope)) {
      for (const colour of UITK_COLOURS) {
        if (element.jsonObj.uitk[colour]) {
          Object.keys(element.jsonObj.uitk[colour]).forEach((key) => {
            if (
              [
                "10",
                "20",
                "30",
                "40",
                "50",
                "60",
                "70",
                "80",
                "90",
                "100",
                "200",
                "300",
                "400",
                "500",
                "600",
                "700",
                "800",
                "900",
              ].includes(key)
            ) {
              if (element.jsonObj.uitk[colour][key].value !== undefined) {
                colorMap[`uitk${colour}${key}`] = element.jsonObj.uitk[colour][
                  key
                ].value as string;
              }
              // Note that we skip over fade values as we don't need them here
            }
            if (
              key === "value" &&
              element.jsonObj.uitk[colour].value !== undefined
            ) {
              colorMap[`uitk${colour}`] = element.jsonObj.uitk[colour]
                .value as string;
            }
          });
        }
      }
    }
  });
  return colorMap;
}
