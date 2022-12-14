import { saltColorMap } from "./colorMap";

export function makePalette(
  colorScheme: string,
  SALTColorOverrides?: Record<string, string>
): string[] {
  //Doesn't matter which theme you use here as the color names are the same
  const colorNames = Array.from(
    Object.keys(SALTColorOverrides ?? saltColorMap)
  );

  const colorArray: string[] = [];
  for (const colorName of colorNames) {
    if (colorName.includes(colorScheme) && !(colorName === colorScheme)) {
      colorArray.push(
        SALTColorOverrides
          ? SALTColorOverrides[colorName]
          : saltColorMap[colorName]
      );
    }
  }
  return colorArray;
}

const bluePalette = (SALTColorOverrides?: Record<string, string>) =>
  makePalette("blue", SALTColorOverrides);
const greenPalette = (SALTColorOverrides?: Record<string, string>) =>
  makePalette("green", SALTColorOverrides);
const redPalette = (SALTColorOverrides?: Record<string, string>) =>
  makePalette("red", SALTColorOverrides);
const orangePalette = (SALTColorOverrides?: Record<string, string>) =>
  makePalette("orange", SALTColorOverrides);
const tealPalette = (SALTColorOverrides?: Record<string, string>) =>
  makePalette("teal", SALTColorOverrides);
const purplePalette = (SALTColorOverrides?: Record<string, string>) =>
  makePalette("purple", SALTColorOverrides);
const grayPalette = (SALTColorOverrides?: Record<string, string>) =>
  makePalette("gray", SALTColorOverrides);

export function getColorPalettes(
  SALTColorOverrides?: Record<string, string>
): string[][] {
  return [
    bluePalette(SALTColorOverrides).slice(0, 7),
    bluePalette(SALTColorOverrides).slice(7, 14),
    greenPalette(SALTColorOverrides).slice(0, 7),
    greenPalette(SALTColorOverrides).slice(7, 14),
    tealPalette(SALTColorOverrides).slice(0, 7),
    tealPalette(SALTColorOverrides).slice(7, 14),
    orangePalette(SALTColorOverrides).slice(0, 7),
    orangePalette(SALTColorOverrides).slice(7, 14),
    redPalette(SALTColorOverrides).slice(0, 7),
    redPalette(SALTColorOverrides).slice(7, 14),
    purplePalette(SALTColorOverrides).slice(0, 7),
    purplePalette(SALTColorOverrides).slice(7, 14),
    grayPalette(SALTColorOverrides).slice(0, 7),
    grayPalette(SALTColorOverrides).slice(7, 14),
    [
      SALTColorOverrides
        ? SALTColorOverrides["saltwhite"]
          ? SALTColorOverrides["saltwhite"]
          : "rgb(255, 255, 255)"
        : saltColorMap["saltwhite"],
      ...grayPalette(SALTColorOverrides).slice(14, 18),
      SALTColorOverrides
        ? SALTColorOverrides["saltblack"]
          ? SALTColorOverrides["saltblack"]
          : "rgb(0, 0, 0)"
        : saltColorMap["saltblack"],
      "rgba(0, 0, 0, 0)",
    ],
  ];
}
