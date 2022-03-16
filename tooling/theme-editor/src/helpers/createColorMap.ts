import { JSONByScope } from "./parseToJson";

const UITK_COLORS = ["white", "black", "red", "green", "blue", "teal", "orange", "grey", "purple"]

export function createColorMap(
  jsonByScope: JSONByScope[]
): Record<string, string> {
  const colorMap: Record<string, string> = {};

  jsonByScope.forEach((element) => {
    if (["mode-all", "light", "dark"].includes(element.scope)) {
      for (const color of UITK_COLORS) {
        if (element.jsonObj.uitk.color[color]) {
          Object.keys(element.jsonObj.uitk.color[color]).forEach((key) => {
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
              if (element.jsonObj.uitk.color[color][key].value !== undefined) {
                colorMap[`uitk${color}${key}`] = element.jsonObj.uitk.color[color][
                  key
                ].value as string;
              }
              // Note that we skip over fade values as we don't need them here
            }
            if (
              key === "value" &&
              element.jsonObj.uitk.color[color].value !== undefined
            ) {
              colorMap[`uitk${color}`] = element.jsonObj.uitk.color[color]
                .value as string;
            }
          });
        }
      }
    }
  });
  return colorMap;
}
