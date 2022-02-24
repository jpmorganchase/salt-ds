import { uitkColorMap } from "./colorMap";

export function makePalette(
  colorScheme: string,
  UITKColorOverrides?: Record<string, string>
): string[] {
  //Doesn't matter which theme you use here as the color names are the same
  const colorNames = Array.from(
    Object.keys(UITKColorOverrides ?? uitkColorMap)
  );

  const colorArray: string[] = [];
  for (const colorName of colorNames) {
    if (colorName.includes(colorScheme) && !(colorName === colorScheme)) {
      colorArray.push(
        UITKColorOverrides
          ? UITKColorOverrides[colorName]
          : uitkColorMap[colorName]
      );
    }
  }
  return colorArray;
}

const bluePalette = (UITKColorOverrides?: Record<string, string>) =>
  makePalette("blue", UITKColorOverrides);
const greenPalette = (UITKColorOverrides?: Record<string, string>) =>
  makePalette("green", UITKColorOverrides);
const redPalette = (UITKColorOverrides?: Record<string, string>) =>
  makePalette("red", UITKColorOverrides);
const orangePalette = (UITKColorOverrides?: Record<string, string>) =>
  makePalette("orange", UITKColorOverrides);
const tealPalette = (UITKColorOverrides?: Record<string, string>) =>
  makePalette("teal", UITKColorOverrides);
const purplePalette = (UITKColorOverrides?: Record<string, string>) =>
  makePalette("purple", UITKColorOverrides);
const greyPalette = (UITKColorOverrides?: Record<string, string>) =>
  makePalette("grey", UITKColorOverrides);

export function getColorPalettes(
  UITKColorOverrides?: Record<string, string>
): string[][] {
  return [
    bluePalette(UITKColorOverrides).slice(0, 7),
    bluePalette(UITKColorOverrides).slice(7, 14),
    greenPalette(UITKColorOverrides).slice(0, 7),
    greenPalette(UITKColorOverrides).slice(7, 14),
    tealPalette(UITKColorOverrides).slice(0, 7),
    tealPalette(UITKColorOverrides).slice(7, 14),
    orangePalette(UITKColorOverrides).slice(0, 7),
    orangePalette(UITKColorOverrides).slice(7, 14),
    redPalette(UITKColorOverrides).slice(0, 7),
    redPalette(UITKColorOverrides).slice(7, 14),
    purplePalette(UITKColorOverrides).slice(0, 7),
    purplePalette(UITKColorOverrides).slice(7, 14),
    greyPalette(UITKColorOverrides).slice(0, 7),
    greyPalette(UITKColorOverrides).slice(7, 14),
    [
      UITKColorOverrides
        ? UITKColorOverrides["uitkwhite"]
          ? UITKColorOverrides["uitkwhite"]
          : "rgb(255, 255, 255)"
        : uitkColorMap["uitkwhite"],
      ...greyPalette(UITKColorOverrides).slice(14, 18),
      UITKColorOverrides
        ? UITKColorOverrides["uitkblack"]
          ? UITKColorOverrides["uitkblack"]
          : "rgb(0, 0, 0)"
        : uitkColorMap["uitkblack"],
    ],
  ];
}
