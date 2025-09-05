import type { Density } from "@salt-ds/core";

export const getDensityTokenMap = (density: Density) => {
  let saltSpacing100: number;
  let saltSizeIcon: number;

  switch (density) {
    case "high":
      saltSpacing100 = 4;
      saltSizeIcon = 10;
      break;
    case "medium":
      saltSpacing100 = 8;
      saltSizeIcon = 12;
      break;
    case "low":
      saltSpacing100 = 12;
      saltSizeIcon = 14;
      break;
    case "touch":
      saltSpacing100 = 16;
      saltSizeIcon = 16;
      break;
    default:
      saltSpacing100 = 8;
      saltSizeIcon = 12;
      break;
  }

  return {
    "--salt-spacing-150": saltSpacing100 * 1.5,
    "--salt-spacing-200": saltSpacing100 * 2,
    "--salt-spacing-300": saltSpacing100 * 3,
    "--salt-size-icon": saltSizeIcon,
  };
};
