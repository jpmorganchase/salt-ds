/**
 * Density token mapping for Highcharts theme integration.
 *
 * Provides utilities for generating Salt token values for Highcharts options.
 * Reads CSS custom properties from the DOM when available and falls back to
 * density defaults or unresolved CSS variable references when necessary.
 */

import type { Density } from "@salt-ds/core";
import {
  getCSSTokensFromElement,
  getNumericCSSToken,
} from "./compute-css-tokens";

export const CATEGORY_DATAVIZ_TOKENS = [
  "--salt-category-1-dataviz",
  "--salt-category-2-dataviz",
  "--salt-category-3-dataviz",
  "--salt-category-4-dataviz",
  "--salt-category-5-dataviz",
  "--salt-category-6-dataviz",
  "--salt-category-7-dataviz",
  "--salt-category-8-dataviz",
  "--salt-category-9-dataviz",
  "--salt-category-10-dataviz",
  "--salt-category-11-dataviz",
  "--salt-category-12-dataviz",
  "--salt-category-13-dataviz",
  "--salt-category-14-dataviz",
  "--salt-category-15-dataviz",
  "--salt-category-16-dataviz",
  "--salt-category-17-dataviz",
  "--salt-category-18-dataviz",
  "--salt-category-19-dataviz",
  "--salt-category-20-dataviz",
] as const;

export const ACTIONABLE_BOLD_TOKENS = [
  "--salt-actionable-bold-background",
  "--salt-actionable-bold-background-hover",
  "--salt-actionable-bold-background-active",
  "--salt-actionable-bold-foreground",
  "--salt-actionable-bold-foreground-hover",
  "--salt-actionable-bold-foreground-active",
  "--salt-actionable-bold-borderColor",
  "--salt-actionable-bold-borderColor-hover",
  "--salt-actionable-bold-borderColor-active",
] as const;

export type SaltChartTokenMap = {
  "--salt-spacing-100": number;
  "--salt-spacing-150": number;
  "--salt-spacing-200": number;
  "--salt-spacing-300": number;
  "--salt-size-icon": number;
  "--salt-size-fixed-100": number;
  "--salt-size-fixed-200": number;
  "--salt-palette-corner-weak": number;
  "--salt-palette-corner-weaker": number;
  "--salt-cursor-hover": string;
  "--salt-cursor-active": string;
  "--salt-text-fontFamily": string;
  "--salt-text-fontSize": string;
  "--salt-text-action-fontFamily": string;
  "--salt-text-action-fontWeight": string;
  "--salt-text-action-letterSpacing": string;
  "--salt-text-action-textTransform": string;
  "--salt-text-h4-fontSize": string;
  "--salt-text-h4-fontWeight": string;
  "--salt-text-h4-lineHeight": string;
  "--salt-text-h4-fontFamily": string;
  "--salt-text-label-fontSize": string;
  "--salt-text-label-fontWeight": string;
  "--salt-text-label-fontWeight-strong": string;
  "--salt-text-label-lineHeight": string;
  "--salt-text-label-fontFamily": string;
  "--salt-content-primary-foreground": string;
  "--salt-content-secondary-foreground": string;
  "--salt-content-secondary-foreground-disabled": string;
  "--salt-content-bold-foreground": string;
  "--salt-container-primary-background": string;
  "--salt-separable-primary-borderColor": string;
  "--salt-separable-tertiary-borderColor": string;
  "--salt-sentiment-caution-dataviz": string;
  "--salt-sentiment-positive-dataviz": string;
  "--salt-sentiment-negative-dataviz": string;
  "--salt-sentiment-neutral-dataviz": string;
  "--salt-color-black": string;
} & {
  [K in (typeof CATEGORY_DATAVIZ_TOKENS)[number]]: string;
} & {
  [K in (typeof ACTIONABLE_BOLD_TOKENS)[number]]: string;
};

const DEFAULTS_BY_DENSITY: Record<
  Density | "default",
  {
    spacing100: number;
    sizeIcon: number;
    cornerWeaker: number;
  }
> = {
  high: { spacing100: 4, sizeIcon: 10, cornerWeaker: 3 },
  medium: { spacing100: 8, sizeIcon: 12, cornerWeaker: 4 },
  low: { spacing100: 12, sizeIcon: 14, cornerWeaker: 5 },
  touch: { spacing100: 16, sizeIcon: 16, cornerWeaker: 5 },
  mobile: { spacing100: 16, sizeIcon: 16, cornerWeaker: 5 },
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
  sizeFixed100: "--salt-size-fixed-100" as const,
  sizeFixed200: "--salt-size-fixed-200" as const,
};

const CORNER_TOKENS = {
  cornerWeak: "--salt-palette-corner-weak" as const,
  cornerWeaker: "--salt-palette-corner-weaker" as const,
} as const;

const CURSOR_TOKENS = {
  cursorHover: "--salt-cursor-hover" as const,
  cursorActive: "--salt-cursor-active" as const,
} as const;

const TYPOGRAPHY_TOKENS = {
  chartFontFamily: "--salt-text-fontFamily",
  textFontSize: "--salt-text-fontSize",
  actionFontFamily: "--salt-text-action-fontFamily",
  actionFontWeight: "--salt-text-action-fontWeight",
  actionLetterSpacing: "--salt-text-action-letterSpacing",
  actionTextTransform: "--salt-text-action-textTransform",
  titleFontSize: "--salt-text-h4-fontSize",
  titleFontWeight: "--salt-text-h4-fontWeight",
  titleLineHeight: "--salt-text-h4-lineHeight",
  titleFontFamily: "--salt-text-h4-fontFamily",
  labelFontSize: "--salt-text-label-fontSize",
  labelFontWeight: "--salt-text-label-fontWeight",
  labelStrongFontWeight: "--salt-text-label-fontWeight-strong",
  labelLineHeight: "--salt-text-label-lineHeight",
  labelFontFamily: "--salt-text-label-fontFamily",
  primaryForeground: "--salt-content-primary-foreground",
  secondaryForeground: "--salt-content-secondary-foreground",
  secondaryForegroundDisabled: "--salt-content-secondary-foreground-disabled",
  boldForeground: "--salt-content-bold-foreground",
} as const;

const COLOR_TOKENS = {
  colorBlack: "--salt-color-black",
  containerPrimaryBackground: "--salt-container-primary-background",
  separablePrimaryBorderColor: "--salt-separable-primary-borderColor",
  separableTertiaryBorderColor: "--salt-separable-tertiary-borderColor",
  sentimentCautionDataviz: "--salt-sentiment-caution-dataviz",
  sentimentPositiveDataviz: "--salt-sentiment-positive-dataviz",
  sentimentNegativeDataviz: "--salt-sentiment-negative-dataviz",
  sentimentNeutralDataviz: "--salt-sentiment-neutral-dataviz",
} as const;

const getTokenFallback = (tokenName: string) => `var(${tokenName})`;

const getResolvedStringToken = (
  tokenValues: Record<string, string | undefined>,
  tokenName: string,
) => tokenValues[tokenName] ?? getTokenFallback(tokenName);

export const getDensityTokenMap = (
  density: Density,
  hostElement?: Element | null,
): SaltChartTokenMap => {
  const {
    spacing100: spacing100Fallback,
    sizeIcon: sizeIconFallback,
    cornerWeaker: cornerWeakerFallback,
  } = DEFAULTS_BY_DENSITY[density] ?? DEFAULTS_BY_DENSITY.default;

  let baseSpacing = spacing100Fallback;
  let iconSize = sizeIconFallback;
  let sizeFixed100 = 1;
  let sizeFixed200 = 2;
  // Matches Button.css `var(--salt-palette-corner-weak, 0)` fallback
  let cornerWeak = 0;
  let cornerWeaker = cornerWeakerFallback;
  let cursorHover = "pointer";
  let cursorActive = "pointer";
  let chartFontFamily = getTokenFallback(TYPOGRAPHY_TOKENS.chartFontFamily);
  let textFontSize = getTokenFallback(TYPOGRAPHY_TOKENS.textFontSize);
  let actionFontFamily = getTokenFallback(TYPOGRAPHY_TOKENS.actionFontFamily);
  let actionFontWeight = getTokenFallback(TYPOGRAPHY_TOKENS.actionFontWeight);
  let actionLetterSpacing = getTokenFallback(
    TYPOGRAPHY_TOKENS.actionLetterSpacing,
  );
  let actionTextTransform = getTokenFallback(
    TYPOGRAPHY_TOKENS.actionTextTransform,
  );
  let titleFontSize = getTokenFallback(TYPOGRAPHY_TOKENS.titleFontSize);
  let titleFontWeight = getTokenFallback(TYPOGRAPHY_TOKENS.titleFontWeight);
  let titleLineHeight = getTokenFallback(TYPOGRAPHY_TOKENS.titleLineHeight);
  let titleFontFamily = getTokenFallback(TYPOGRAPHY_TOKENS.titleFontFamily);
  let labelFontSize = getTokenFallback(TYPOGRAPHY_TOKENS.labelFontSize);
  let labelFontWeight = getTokenFallback(TYPOGRAPHY_TOKENS.labelFontWeight);
  let labelStrongFontWeight = getTokenFallback(
    TYPOGRAPHY_TOKENS.labelStrongFontWeight,
  );
  let labelLineHeight = getTokenFallback(TYPOGRAPHY_TOKENS.labelLineHeight);
  let labelFontFamily = getTokenFallback(TYPOGRAPHY_TOKENS.labelFontFamily);
  let primaryForeground = getTokenFallback(TYPOGRAPHY_TOKENS.primaryForeground);
  let secondaryForeground = getTokenFallback(
    TYPOGRAPHY_TOKENS.secondaryForeground,
  );
  let secondaryForegroundDisabled = getTokenFallback(
    TYPOGRAPHY_TOKENS.secondaryForegroundDisabled,
  );
  let boldForeground = getTokenFallback(TYPOGRAPHY_TOKENS.boldForeground);
  let containerPrimaryBackground = getTokenFallback(
    COLOR_TOKENS.containerPrimaryBackground,
  );
  let separablePrimaryBorderColor = getTokenFallback(
    COLOR_TOKENS.separablePrimaryBorderColor,
  );
  let separableTertiaryBorderColor = getTokenFallback(
    COLOR_TOKENS.separableTertiaryBorderColor,
  );
  let sentimentCautionDataviz = getTokenFallback(
    COLOR_TOKENS.sentimentCautionDataviz,
  );
  let sentimentPositiveDataviz = getTokenFallback(
    COLOR_TOKENS.sentimentPositiveDataviz,
  );
  let sentimentNegativeDataviz = getTokenFallback(
    COLOR_TOKENS.sentimentNegativeDataviz,
  );
  let sentimentNeutralDataviz = getTokenFallback(
    COLOR_TOKENS.sentimentNeutralDataviz,
  );
  let colorBlack = getTokenFallback(COLOR_TOKENS.colorBlack);
  const categoryDatavizColors = CATEGORY_DATAVIZ_TOKENS.reduce<
    Record<(typeof CATEGORY_DATAVIZ_TOKENS)[number], string>
  >(
    (accumulator, tokenName) => {
      accumulator[tokenName] = getTokenFallback(tokenName);
      return accumulator;
    },
    {} as Record<(typeof CATEGORY_DATAVIZ_TOKENS)[number], string>,
  );
  const actionableBoldColors = ACTIONABLE_BOLD_TOKENS.reduce<
    Record<(typeof ACTIONABLE_BOLD_TOKENS)[number], string>
  >(
    (accumulator, tokenName) => {
      accumulator[tokenName] = getTokenFallback(tokenName);
      return accumulator;
    },
    {} as Record<(typeof ACTIONABLE_BOLD_TOKENS)[number], string>,
  );

  if (hostElement) {
    const requestedTokens = [
      SPACING_TOKENS.spacing100,
      SIZE_TOKENS.sizeIcon,
      SIZE_TOKENS.sizeFixed100,
      SIZE_TOKENS.sizeFixed200,
      CORNER_TOKENS.cornerWeak,
      CORNER_TOKENS.cornerWeaker,
      ...Object.values(CURSOR_TOKENS),
      ...Object.values(TYPOGRAPHY_TOKENS),
      ...Object.values(COLOR_TOKENS),
      ...CATEGORY_DATAVIZ_TOKENS,
      ...ACTIONABLE_BOLD_TOKENS,
    ] as const;

    const tokenValues = getCSSTokensFromElement(hostElement, requestedTokens);

    baseSpacing =
      getNumericCSSToken(tokenValues, SPACING_TOKENS.spacing100) ?? baseSpacing;
    iconSize =
      getNumericCSSToken(tokenValues, SIZE_TOKENS.sizeIcon) ?? iconSize;
    sizeFixed100 =
      getNumericCSSToken(tokenValues, SIZE_TOKENS.sizeFixed100) ?? sizeFixed100;
    sizeFixed200 =
      getNumericCSSToken(tokenValues, SIZE_TOKENS.sizeFixed200) ?? sizeFixed200;
    cornerWeak =
      getNumericCSSToken(tokenValues, CORNER_TOKENS.cornerWeak) ?? cornerWeak;
    cornerWeaker =
      getNumericCSSToken(tokenValues, CORNER_TOKENS.cornerWeaker) ??
      cornerWeaker;
    cursorHover = tokenValues[CURSOR_TOKENS.cursorHover] ?? cursorHover;
    cursorActive = tokenValues[CURSOR_TOKENS.cursorActive] ?? cursorActive;
    chartFontFamily = getResolvedStringToken(
      tokenValues,
      TYPOGRAPHY_TOKENS.chartFontFamily,
    );
    textFontSize = getResolvedStringToken(
      tokenValues,
      TYPOGRAPHY_TOKENS.textFontSize,
    );
    actionFontFamily = getResolvedStringToken(
      tokenValues,
      TYPOGRAPHY_TOKENS.actionFontFamily,
    );
    actionFontWeight = getResolvedStringToken(
      tokenValues,
      TYPOGRAPHY_TOKENS.actionFontWeight,
    );
    actionLetterSpacing = getResolvedStringToken(
      tokenValues,
      TYPOGRAPHY_TOKENS.actionLetterSpacing,
    );
    actionTextTransform = getResolvedStringToken(
      tokenValues,
      TYPOGRAPHY_TOKENS.actionTextTransform,
    );
    titleFontSize = getResolvedStringToken(
      tokenValues,
      TYPOGRAPHY_TOKENS.titleFontSize,
    );
    titleFontWeight = getResolvedStringToken(
      tokenValues,
      TYPOGRAPHY_TOKENS.titleFontWeight,
    );
    titleLineHeight = getResolvedStringToken(
      tokenValues,
      TYPOGRAPHY_TOKENS.titleLineHeight,
    );
    titleFontFamily = getResolvedStringToken(
      tokenValues,
      TYPOGRAPHY_TOKENS.titleFontFamily,
    );
    labelFontSize = getResolvedStringToken(
      tokenValues,
      TYPOGRAPHY_TOKENS.labelFontSize,
    );
    labelFontWeight = getResolvedStringToken(
      tokenValues,
      TYPOGRAPHY_TOKENS.labelFontWeight,
    );
    labelStrongFontWeight = getResolvedStringToken(
      tokenValues,
      TYPOGRAPHY_TOKENS.labelStrongFontWeight,
    );
    labelLineHeight = getResolvedStringToken(
      tokenValues,
      TYPOGRAPHY_TOKENS.labelLineHeight,
    );
    labelFontFamily = getResolvedStringToken(
      tokenValues,
      TYPOGRAPHY_TOKENS.labelFontFamily,
    );
    primaryForeground = getResolvedStringToken(
      tokenValues,
      TYPOGRAPHY_TOKENS.primaryForeground,
    );
    secondaryForeground = getResolvedStringToken(
      tokenValues,
      TYPOGRAPHY_TOKENS.secondaryForeground,
    );
    secondaryForegroundDisabled = getResolvedStringToken(
      tokenValues,
      TYPOGRAPHY_TOKENS.secondaryForegroundDisabled,
    );
    boldForeground = getResolvedStringToken(
      tokenValues,
      TYPOGRAPHY_TOKENS.boldForeground,
    );
    containerPrimaryBackground = getResolvedStringToken(
      tokenValues,
      COLOR_TOKENS.containerPrimaryBackground,
    );
    separablePrimaryBorderColor = getResolvedStringToken(
      tokenValues,
      COLOR_TOKENS.separablePrimaryBorderColor,
    );
    separableTertiaryBorderColor = getResolvedStringToken(
      tokenValues,
      COLOR_TOKENS.separableTertiaryBorderColor,
    );
    sentimentCautionDataviz = getResolvedStringToken(
      tokenValues,
      COLOR_TOKENS.sentimentCautionDataviz,
    );
    sentimentPositiveDataviz = getResolvedStringToken(
      tokenValues,
      COLOR_TOKENS.sentimentPositiveDataviz,
    );
    sentimentNegativeDataviz = getResolvedStringToken(
      tokenValues,
      COLOR_TOKENS.sentimentNegativeDataviz,
    );
    sentimentNeutralDataviz = getResolvedStringToken(
      tokenValues,
      COLOR_TOKENS.sentimentNeutralDataviz,
    );
    colorBlack = getResolvedStringToken(tokenValues, COLOR_TOKENS.colorBlack);
    for (const tokenName of CATEGORY_DATAVIZ_TOKENS) {
      categoryDatavizColors[tokenName] =
        tokenValues[tokenName] ?? getTokenFallback(tokenName);
    }
    for (const tokenName of ACTIONABLE_BOLD_TOKENS) {
      actionableBoldColors[tokenName] =
        tokenValues[tokenName] ?? getTokenFallback(tokenName);
    }
  }

  return {
    [SPACING_TOKENS.spacing100]: baseSpacing,
    [SPACING_TOKENS.spacing150]: baseSpacing * SPACING_RAMP[150],
    [SPACING_TOKENS.spacing200]: baseSpacing * SPACING_RAMP[200],
    [SPACING_TOKENS.spacing300]: baseSpacing * SPACING_RAMP[300],
    [SIZE_TOKENS.sizeIcon]: iconSize,
    [SIZE_TOKENS.sizeFixed100]: sizeFixed100,
    [SIZE_TOKENS.sizeFixed200]: sizeFixed200,
    [CORNER_TOKENS.cornerWeak]: cornerWeak,
    [CORNER_TOKENS.cornerWeaker]: cornerWeaker,
    [CURSOR_TOKENS.cursorHover]: cursorHover,
    [CURSOR_TOKENS.cursorActive]: cursorActive,
    "--salt-text-fontFamily": chartFontFamily,
    "--salt-text-fontSize": textFontSize,
    "--salt-text-action-fontFamily": actionFontFamily,
    "--salt-text-action-fontWeight": actionFontWeight,
    "--salt-text-action-letterSpacing": actionLetterSpacing,
    "--salt-text-action-textTransform": actionTextTransform,
    "--salt-text-h4-fontSize": titleFontSize,
    "--salt-text-h4-fontWeight": titleFontWeight,
    "--salt-text-h4-lineHeight": titleLineHeight,
    "--salt-text-h4-fontFamily": titleFontFamily,
    "--salt-text-label-fontSize": labelFontSize,
    "--salt-text-label-fontWeight": labelFontWeight,
    "--salt-text-label-fontWeight-strong": labelStrongFontWeight,
    "--salt-text-label-lineHeight": labelLineHeight,
    "--salt-text-label-fontFamily": labelFontFamily,
    "--salt-content-primary-foreground": primaryForeground,
    "--salt-content-secondary-foreground": secondaryForeground,
    "--salt-content-secondary-foreground-disabled": secondaryForegroundDisabled,
    "--salt-content-bold-foreground": boldForeground,
    "--salt-container-primary-background": containerPrimaryBackground,
    "--salt-separable-primary-borderColor": separablePrimaryBorderColor,
    "--salt-separable-tertiary-borderColor": separableTertiaryBorderColor,
    "--salt-sentiment-caution-dataviz": sentimentCautionDataviz,
    "--salt-sentiment-positive-dataviz": sentimentPositiveDataviz,
    "--salt-sentiment-negative-dataviz": sentimentNegativeDataviz,
    "--salt-sentiment-neutral-dataviz": sentimentNeutralDataviz,
    "--salt-color-black": colorBlack,
    ...categoryDatavizColors,
    ...actionableBoldColors,
  };
};
