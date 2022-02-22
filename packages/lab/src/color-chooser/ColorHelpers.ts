import { uitkColorMap } from "./colorMap";
import { Color } from "./Color";

export function getColorNameByHexValue(
  hexValue: string | undefined,
  disableAlpha = false,
  UITKColorOverrides?: Record<string, string>
): string | undefined {
  const hexNoAlpha = hexValueWithoutAlpha(hexValue);
  const uitkColors = UITKColorOverrides ?? uitkColorMap;

  // Special case
  if (hexValue === "#00000000") return "Transparent";

  let colorName = Object.keys(uitkColors).find((key: string) => {
    if (uitkColors[key]) {
      const rgbVals = uitkColors[key].startsWith("rgba")
        ? uitkColors[key].substring(5, uitkColors[key].length - 1)
        : uitkColors[key].substring(4, uitkColors[key].length - 1);
      const [r, g, b] = [...rgbVals.replace(" ", "").split(",")];
      return (
        Color.makeColorFromRGB(Number(r), Number(g), Number(b)).hex ===
        hexNoAlpha?.toLowerCase()
      );
    }
    return 0;
  });

  if (colorName) {
    colorName = colorName.slice(4);
    return colorName.charAt(0).toUpperCase() + colorName.slice(1).toLowerCase();
  }

  if (hexValue === "WHITE" || hexValue === "BLACK") {
    return hexValue.charAt(0) + hexValue.slice(1).toLowerCase();
  }

  return getHexValue(hexValue, disableAlpha);
}

export function hexValueWithoutAlpha(
  hexValue: string | undefined
): string | undefined {
  if (hexValue === undefined) return undefined;
  return isValidHex(hexValue)
    ? hexValue.substring(0, 7).toUpperCase()
    : undefined;
}

export function getHexValue(
  hexValue: string | undefined,
  disableAlpha: boolean
): string | undefined {
  if (hexValue === undefined) return undefined;
  return disableAlpha ? hexValueWithoutAlpha(hexValue) : hexValue;
}

export const isValidHex = (hex: string | undefined): boolean => {
  return hex
    ? /^#[0-9a-fA-F]{8}$/.test(hex) || /#[0-9a-fA-F]{6}$/.test(hex)
    : false;
};

export const convertColorMapValueToHex = (color: string): string => {
  if (!color.startsWith("rgb")) return color;
  const rgbVals = color.startsWith("rgba")
    ? color.substring(5, color.length - 1)
    : color.substring(4, color.length - 1);
  const [r, g, b, a] = [...rgbVals.replace(" ", "").split(",")];
  return Color.makeColorFromRGB(
    Number(r),
    Number(g),
    Number(b),
    a ? Number(a) : 1
  ).hex;
};
