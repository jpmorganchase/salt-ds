import type { ColorAxisOptions } from "highcharts";
import {
  getCSSColorTokenFromElement,
  type RgbColor,
} from "./compute-css-tokens";

const DEFAULT_COLORS: Record<string, RgbColor> = {
  "--salt-category-1-dataviz": { r: 70, g: 118, b: 191 },
  "--salt-category-2-dataviz": { r: 171, g: 101, b: 40 },
  "--salt-category-3-dataviz": { r: 159, g: 85, b: 194 },
  "--salt-category-4-dataviz": { r: 42, g: 130, b: 133 },
  "--salt-category-5-dataviz": { r: 105, g: 118, b: 148 },
  "--salt-sentiment-negative-dataviz": { r: 187, g: 61, b: 75 },
  "--salt-sentiment-neutral-dataviz": { r: 95, g: 108, b: 138 },
  // "--salt-sentiment-positive-dataviz": { r: 20, g: 120, b: 84 },
};

const resolveToken = (token: string, element?: Element | null): RgbColor => {
  if (element) {
    const resolved = getCSSColorTokenFromElement(token, element);
    if (resolved) return resolved;
  }
  return DEFAULT_COLORS[token] ?? { r: 70, g: 118, b: 191 };
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const toRgba = ({ r, g, b }: RgbColor, alpha: number): string =>
  `rgba(${r}, ${g}, ${b}, ${clamp(alpha, 0, 1)})`;

const buildOpacityRamp = (
  color: RgbColor,
  fromPos: number,
  toPos: number,
  fromAlpha: number,
  toAlpha: number,
  steps: number,
): Array<[number, string]> => {
  const n = Math.max(2, steps);
  const stops: Array<[number, string]> = [];

  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    stops.push([
      fromPos + (toPos - fromPos) * t,
      toRgba(color, fromAlpha + (toAlpha - fromAlpha) * t),
    ]);
  }

  return stops;
};

export const buildColorAxis = (
  config: ColorAxisConfig,
  element?: Element | null,
): ColorAxisOptions => {
  if ("colorToken" in config) {
    const {
      colorToken,
      min,
      max,
      steps = 10,
      minOpacity = 0.15,
      maxOpacity = 1,
    } = config;
    const color = resolveToken(colorToken, element);

    return {
      min,
      max,
      showInLegend: true,
      stops: buildOpacityRamp(color, 0, 1, minOpacity, maxOpacity, steps),
    };
  }

  const {
    lowColorToken,
    highColorToken,
    min,
    max,
    threshold,
    lowSteps = 4,
    highSteps = 4,
    lowMinOpacity = 0.15,
    lowMaxOpacity = 1,
    highMinOpacity = 0.15,
    highMaxOpacity = 1,
  } = config;

  const range = max - min;
  const split = range === 0 ? 0.5 : clamp((threshold - min) / range, 0, 1);

  const lowColor = resolveToken(lowColorToken, element);
  const highColor = resolveToken(highColorToken, element);

  return {
    min,
    max,
    showInLegend: true,
    stops: [
      ...buildOpacityRamp(
        lowColor,
        0,
        split,
        lowMaxOpacity,
        lowMinOpacity,
        lowSteps,
      ),
      ...buildOpacityRamp(
        highColor,
        split,
        1,
        highMinOpacity,
        highMaxOpacity,
        highSteps,
      ),
    ],
  };
};

/**
 * Sequential (single-hue) color axis.
 *
 * Produces a gradient that varies the opacity of a single Salt color token
 * from `minOpacity` at `min` to `maxOpacity` at `max`, giving a light-to-dark
 * ramp of one hue. Useful for heatmaps where all values are of the same
 * sentiment (e.g. volume, count).
 */
export interface SingleColorAxisConfig {
  /** Salt CSS custom property name for the hue, e.g. `"--salt-category-1-dataviz"`. */
  colorToken: string;
  /** Lower bound of the data range (maps to position 0 in the gradient). */
  min: number;
  /** Upper bound of the data range (maps to position 1 in the gradient). */
  max: number;
  /** Number of discrete opacity stops generated between `min` and `max`. @defaultValue 10 */
  steps?: number;
  /** Opacity at the `min` end of the ramp (0–1). @defaultValue 0.15 */
  minOpacity?: number;
  /** Opacity at the `max` end of the ramp (0–1). @defaultValue 1 */
  maxOpacity?: number;
}

/**
 * Divergent (two-hue) color axis split at a threshold.
 *
 * Values below the `threshold` are rendered with `lowColorToken` and values
 * above it with `highColorToken`. Each side has its own opacity ramp: the
 * colour is most vivid at the extremes (`min` / `max`) and fades to near-
 * transparent at the `threshold`, creating a visual "zero-point" in the middle.
 *
 * Typical use: positive/negative performance where green fades in below zero
 * and red fades in above zero.
 */
export interface ThresholdColorAxisConfig {
  /** Salt CSS custom property for the "low" side (values between `min` and `threshold`). */
  lowColorToken: string;
  /** Salt CSS custom property for the "high" side (values between `threshold` and `max`). */
  highColorToken: string;
  /** Lower bound of the data range (maps to position 0 in the gradient). */
  min: number;
  /** Upper bound of the data range (maps to position 1 in the gradient). */
  max: number;
  /**
   * The data value at which the colour switches from `lowColorToken` to
   * `highColorToken`. Normalised to a `[0, 1]` position within the gradient
   * via `(threshold - min) / (max - min)`.
   */
  threshold: number;
  /** Number of opacity stops on the low side (`min` → `threshold`). @defaultValue 4 */
  lowSteps?: number;
  /** Number of opacity stops on the high side (`threshold` → `max`). @defaultValue 4 */
  highSteps?: number;
  /** Opacity of `lowColorToken` closest to the threshold (the faint end). @defaultValue 0.15 */
  lowMinOpacity?: number;
  /** Opacity of `lowColorToken` at `min` (the vivid end). @defaultValue 1 */
  lowMaxOpacity?: number;
  /** Opacity of `highColorToken` closest to the threshold (the faint end). @defaultValue 0.15 */
  highMinOpacity?: number;
  /** Opacity of `highColorToken` at `max` (the vivid end). @defaultValue 1 */
  highMaxOpacity?: number;
}

/**
 * Discriminated union: provide `colorToken` for a single-hue sequential ramp,
 * or `lowColorToken` + `highColorToken` + `threshold` for a divergent ramp.
 */
export type ColorAxisConfig = SingleColorAxisConfig | ThresholdColorAxisConfig;
