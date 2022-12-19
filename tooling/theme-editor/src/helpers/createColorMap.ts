import { JSONByScope } from "./parseToJson";

const SALT_COLORS = [
  "white",
  "black",
  "red",
  "green",
  "blue",
  "teal",
  "orange",
  "gray",
  "purple",
];

export function createColorMap(
  jsonByScope: JSONByScope[]
): Record<string, string> {
  const colorMap: Record<string, string> = {};

  jsonByScope.forEach((element) => {
    if (["mode-all", "light", "dark"].includes(element.scope)) {
      for (const color of SALT_COLORS) {
        if (element.jsonObj.salt.color[color]) {
          Object.keys(element.jsonObj.salt.color[color]).forEach((key) => {
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
              if (element.jsonObj.salt.color[color][key].value !== undefined) {
                colorMap[`salt${color}${key}`] = element.jsonObj.salt.color[
                  color
                ][key].value as string;
              }
              // Note that we skip over fade values as we don't need them here
            }
            if (
              key === "value" &&
              element.jsonObj.salt.color[color].value !== undefined
            ) {
              colorMap[`salt${color}`] = element.jsonObj.salt.color[color]
                .value as string;
            }
          });
        }
      }
    }
  });
  return colorMap;
}
