import { saltColorMap } from "./colorMap";

export function makePalette(
  colorScheme: string,
  saltColorOverrides?: Record<string, string>
): string[] {
  //Doesn't matter which theme you use here as the color names are the same
  const colorNames = Array.from(
    Object.keys(saltColorOverrides ?? saltColorMap)
  );

  const colorArray: string[] = [];
  for (const colorName of colorNames) {
    if (colorName.includes(colorScheme) && !(colorName === colorScheme)) {
      colorArray.push(
        saltColorOverrides
          ? saltColorOverrides[colorName]
          : saltColorMap[colorName]
      );
    }
  }
  return colorArray;
}

const bluePalette = (saltColorOverrides?: Record<string, string>) =>
  makePalette("blue", saltColorOverrides);
const greenPalette = (saltColorOverrides?: Record<string, string>) =>
  makePalette("green", saltColorOverrides);
const redPalette = (saltColorOverrides?: Record<string, string>) =>
  makePalette("red", saltColorOverrides);
const orangePalette = (saltColorOverrides?: Record<string, string>) =>
  makePalette("orange", saltColorOverrides);
const tealPalette = (saltColorOverrides?: Record<string, string>) =>
  makePalette("teal", saltColorOverrides);
const purplePalette = (saltColorOverrides?: Record<string, string>) =>
  makePalette("purple", saltColorOverrides);
const grayPalette = (saltColorOverrides?: Record<string, string>) =>
  makePalette("gray", saltColorOverrides);

export function getColorPalettes(
  saltColorOverrides?: Record<string, string>
): string[][] {
  return [
    bluePalette(saltColorOverrides).slice(0, 7),
    bluePalette(saltColorOverrides).slice(7, 14),
    greenPalette(saltColorOverrides).slice(0, 7),
    greenPalette(saltColorOverrides).slice(7, 14),
    tealPalette(saltColorOverrides).slice(0, 7),
    tealPalette(saltColorOverrides).slice(7, 14),
    orangePalette(saltColorOverrides).slice(0, 7),
    orangePalette(saltColorOverrides).slice(7, 14),
    redPalette(saltColorOverrides).slice(0, 7),
    redPalette(saltColorOverrides).slice(7, 14),
    purplePalette(saltColorOverrides).slice(0, 7),
    purplePalette(saltColorOverrides).slice(7, 14),
    grayPalette(saltColorOverrides).slice(0, 7),
    grayPalette(saltColorOverrides).slice(7, 14),
    [
      saltColorOverrides
        ? saltColorOverrides.saltwhite
          ? saltColorOverrides.saltwhite
          : "rgb(255, 255, 255)"
        : saltColorMap.saltwhite,
      ...grayPalette(saltColorOverrides).slice(14, 18),
      saltColorOverrides
        ? saltColorOverrides.saltblack
          ? saltColorOverrides.saltblack
          : "rgb(0, 0, 0)"
        : saltColorMap.saltblack,
      "rgba(0, 0, 0, 0)",
    ],
  ];
}
