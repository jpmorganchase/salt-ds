/**
 * Density token mapping for Highcharts theme integration.
 *
 * Provides utilities for generating numeric token values that correspond
 * to Salt's density. Reads CSS custom properties from the DOM when available
 * and falls back to hardcoded defaults based on the density.
 */

import type { Density } from "@salt-ds/core";
import { getCSSTokensFromElement } from "./compute-css-tokens";

export type TokenMap = {
  "--salt-spacing-150": number;
  "--salt-spacing-200": number;
  "--salt-spacing-300": number;
  "--salt-size-icon": number;
  "--salt-palette-corner-weaker": number;
};

const DEFAULTS_BY_DENSITY: Record<
  Density | "default",
  { spacing100: number; sizeIcon: number; cornerWeaker: number }
> = {
  high: { spacing100: 4, sizeIcon: 10, cornerWeaker: 1 },
  medium: { spacing100: 8, sizeIcon: 12, cornerWeaker: 2 },
  low: { spacing100: 12, sizeIcon: 14, cornerWeaker: 3 },
  touch: { spacing100: 16, sizeIcon: 16, cornerWeaker: 4 },
  default: { spacing100: 8, sizeIcon: 12, cornerWeaker: 4 },
};

const SPACING_RAMP = { 150: 1.5, 200: 2, 300: 3 } as const;

const SPACING_TOKENS = {
  spacing100: "--salt-spacing-100" as const,
  spacing150: "--salt-spacing-150" as const,
  spacing200: "--salt-spacing-200" as const,
  spacing300: "--salt-spacing-300" as const,
} as const;

const SIZE_TOKENS = {
  sizeIcon: "--salt-size-icon" as const,
};

const CORNER_TOKENS = {
  cornerWeaker: "--salt-palette-corner-weaker" as const,
} as const;

export const getDensityTokenMap = (
  density: Density,
  hostElement?: Element | null,
): TokenMap => {
  const {
    spacing100: spacing100Fallback,
    sizeIcon: sizeIconFallback,
    cornerWeaker: cornerWeakerFallback,
  } = DEFAULTS_BY_DENSITY[density] ?? DEFAULTS_BY_DENSITY.default;

  let baseSpacing = spacing100Fallback;
  let iconSize = sizeIconFallback;
  let cornerWeaker = cornerWeakerFallback;

  if (hostElement) {
    const requestedTokens = [
      SPACING_TOKENS.spacing100,
      SIZE_TOKENS.sizeIcon,
      CORNER_TOKENS.cornerWeaker,
    ] as const;

    const tokenValues = getCSSTokensFromElement(hostElement, requestedTokens);

    baseSpacing = tokenValues[SPACING_TOKENS.spacing100] ?? baseSpacing;
    iconSize = tokenValues[SIZE_TOKENS.sizeIcon] ?? iconSize;
    cornerWeaker = tokenValues[CORNER_TOKENS.cornerWeaker] ?? cornerWeaker;
  }

  return {
    [SPACING_TOKENS.spacing150]: baseSpacing * SPACING_RAMP[150],
    [SPACING_TOKENS.spacing200]: baseSpacing * SPACING_RAMP[200],
    [SPACING_TOKENS.spacing300]: baseSpacing * SPACING_RAMP[300],
    [SIZE_TOKENS.sizeIcon]: iconSize,
    [CORNER_TOKENS.cornerWeaker]: cornerWeaker,
  };
};
