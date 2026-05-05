import Highcharts, { type Options } from "highcharts";
import type { SaltChartTokenMap } from "./density-token-map";

const DEFAULT_MAX_OPACITY = 1;
const DEFAULT_MIN_OPACITY = 0.12;
const DEFAULT_STEPS = 5;
type HighchartsColorAxis = NonNullable<Options["colorAxis"]>;
type HighchartsColorAxisObject = Exclude<HighchartsColorAxis, unknown[]>;

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(max, Math.max(min, value));
};

const normalizeColorReference = (color: string): string => {
  const trimmedColor = color.trim();

  return trimmedColor.startsWith("--") ? `var(${trimmedColor})` : trimmedColor;
};

const getTokenName = (color: string): string | undefined => {
  const trimmedColor = color.trim();

  if (trimmedColor.startsWith("--")) {
    return trimmedColor;
  }

  const tokenMatch = /^var\((--[^),\s]+).*\)$/.exec(trimmedColor);
  return tokenMatch?.[1];
};

const resolveColorReference = (
  color: string,
  tokens: SaltChartTokenMap,
): string => {
  const tokenName = getTokenName(color);

  if (!tokenName) {
    return normalizeColorReference(color);
  }

  const resolvedColor = tokens[tokenName as keyof SaltChartTokenMap];

  return typeof resolvedColor === "string"
    ? resolvedColor
    : normalizeColorReference(color);
};

const applyOpacity = (
  color: string,
  opacity: number,
  tokens: SaltChartTokenMap,
): string => {
  const resolvedColor = resolveColorReference(color, tokens);
  const alpha = clamp(opacity, 0, 1);
  const rgbaColor = Highcharts.color(resolvedColor)
    ?.setOpacity(alpha)
    .get("rgba");

  if (typeof rgbaColor === "string") {
    return rgbaColor;
  }

  return resolvedColor;
};

export type ColorAxisStop = [number, string];

export interface ColorAxisDataClass {
  color?: string;
  from?: number;
  name?: string;
  opacity?: number;
  to?: number;
}

export interface ContinuousColorAxisConfig {
  color: string;
  max: number;
  maxOpacity?: number;
  min: number;
  minOpacity?: number;
  showInLegend?: boolean;
  steps?: number;
}

export interface ThresholdColorAxisConfig {
  highColor: string;
  lowColor: string;
  max: number;
  maxOpacity?: number;
  min: number;
  minOpacity?: number;
  showInLegend?: boolean;
  steps?: number;
  threshold: number;
}

export interface DataClassColorAxisConfig {
  dataClassColor?: "category" | "tween";
  dataClassOpacityRamp?: boolean;
  dataClasses: ColorAxisDataClass[];
  max?: number;
  min?: number;
  showInLegend?: boolean;
}

export type SaltColorAxisConfig =
  | ContinuousColorAxisConfig
  | ThresholdColorAxisConfig
  | DataClassColorAxisConfig;

export type SaltColorAxisEntry =
  | HighchartsColorAxisObject
  | SaltColorAxisConfig;

export type SaltColorAxis = SaltColorAxisEntry | SaltColorAxisEntry[];

const isDataClassColorAxisConfig = (
  config: SaltColorAxisEntry,
): config is DataClassColorAxisConfig => {
  return "dataClasses" in config;
};

const isThresholdColorAxisConfig = (
  config: SaltColorAxisEntry,
): config is ThresholdColorAxisConfig => {
  return "lowColor" in config || "highColor" in config;
};

const isContinuousColorAxisConfig = (
  config: SaltColorAxisEntry,
): config is ContinuousColorAxisConfig => {
  return "color" in config;
};

const buildOpacityStops = (
  color: string,
  fromPosition: number,
  toPosition: number,
  fromOpacity: number,
  toOpacity: number,
  tokens: SaltChartTokenMap,
  steps = DEFAULT_STEPS,
): ColorAxisStop[] => {
  const numberOfSteps = Math.max(2, steps);
  const stops: ColorAxisStop[] = [];

  for (let index = 0; index < numberOfSteps; index += 1) {
    const progress = index / (numberOfSteps - 1);
    const position = fromPosition + (toPosition - fromPosition) * progress;
    const opacity = fromOpacity + (toOpacity - fromOpacity) * progress;

    stops.push([position, applyOpacity(color, opacity, tokens)]);
  }

  return stops;
};

const getDistributedOpacity = (
  index: number,
  total: number,
  minOpacity = DEFAULT_MIN_OPACITY,
  maxOpacity = DEFAULT_MAX_OPACITY,
): number => {
  if (total <= 1) {
    return maxOpacity;
  }

  const progress = index / (total - 1);
  return clamp(minOpacity + (maxOpacity - minOpacity) * progress, 0, 1);
};

const buildContinuousColorAxis = (
  config: ContinuousColorAxisConfig,
  tokens: SaltChartTokenMap,
): HighchartsColorAxisObject => {
  const {
    color,
    max,
    maxOpacity = DEFAULT_MAX_OPACITY,
    min,
    minOpacity = DEFAULT_MIN_OPACITY,
    showInLegend = true,
    steps = DEFAULT_STEPS,
  } = config;

  return {
    max,
    min,
    showInLegend,
    stops: buildOpacityStops(
      color,
      0,
      1,
      minOpacity,
      maxOpacity,
      tokens,
      steps,
    ),
  };
};

const buildThresholdColorAxis = (
  config: ThresholdColorAxisConfig,
  tokens: SaltChartTokenMap,
): HighchartsColorAxisObject => {
  const {
    highColor,
    lowColor,
    max,
    maxOpacity = DEFAULT_MAX_OPACITY,
    min,
    minOpacity = DEFAULT_MIN_OPACITY,
    showInLegend = true,
    steps = DEFAULT_STEPS,
    threshold,
  } = config;
  const range = max - min;
  const split = range === 0 ? 0.5 : clamp((threshold - min) / range, 0, 1);

  return {
    max,
    min,
    showInLegend,
    stops: [
      ...buildOpacityStops(
        lowColor,
        0,
        split,
        maxOpacity,
        minOpacity,
        tokens,
        steps,
      ),
      ...buildOpacityStops(
        highColor,
        split,
        1,
        minOpacity,
        maxOpacity,
        tokens,
        steps,
      ),
    ],
  };
};

const resolveDataClasses = (
  dataClasses: ColorAxisDataClass[],
  tokens: SaltChartTokenMap,
  dataClassOpacityRamp = false,
): ColorAxisDataClass[] => {
  return dataClasses.map(({ color, opacity, ...dataClass }, index) => {
    const resolvedOpacity =
      opacity ??
      (dataClassOpacityRamp
        ? getDistributedOpacity(index, dataClasses.length)
        : undefined);

    return {
      ...dataClass,
      ...(color !== undefined
        ? {
            color:
              resolvedOpacity !== undefined
                ? applyOpacity(color, resolvedOpacity, tokens)
                : resolveColorReference(color, tokens),
          }
        : {}),
    };
  });
};

type ResolvableColorAxis = HighchartsColorAxisObject & {
  dataClassOpacityRamp?: boolean;
  dataClasses?: ColorAxisDataClass[];
  maxColor?: string;
  minColor?: string;
  stops?: ColorAxisStop[];
};

const resolveHighchartsColorAxis = (
  colorAxis: HighchartsColorAxisObject,
  tokens: SaltChartTokenMap,
): HighchartsColorAxisObject => {
  const {
    dataClassOpacityRamp,
    dataClasses,
    maxColor,
    minColor,
    stops,
    ...rest
  } = colorAxis as ResolvableColorAxis;

  return {
    ...rest,
    ...(dataClasses !== undefined
      ? {
          dataClasses: resolveDataClasses(
            dataClasses,
            tokens,
            dataClassOpacityRamp,
          ),
        }
      : {}),
    ...(maxColor !== undefined
      ? { maxColor: resolveColorReference(maxColor, tokens) }
      : {}),
    ...(minColor !== undefined
      ? { minColor: resolveColorReference(minColor, tokens) }
      : {}),
    ...(stops !== undefined
      ? {
          stops: stops.map(([position, color]) => [
            position,
            resolveColorReference(color, tokens),
          ]),
        }
      : {}),
  };
};

const resolveSaltColorAxisEntry = (
  colorAxis: SaltColorAxisEntry,
  tokens: SaltChartTokenMap,
): HighchartsColorAxisObject => {
  if (isThresholdColorAxisConfig(colorAxis)) {
    return buildThresholdColorAxis(colorAxis, tokens);
  }

  if (isContinuousColorAxisConfig(colorAxis)) {
    return buildContinuousColorAxis(colorAxis, tokens);
  }

  if (isDataClassColorAxisConfig(colorAxis)) {
    return resolveHighchartsColorAxis(colorAxis, tokens);
  }

  return resolveHighchartsColorAxis(colorAxis, tokens);
};

export const resolveSaltColorAxis = (
  colorAxis: SaltColorAxis,
  tokens: SaltChartTokenMap,
): NonNullable<Options["colorAxis"]> => {
  if (Array.isArray(colorAxis)) {
    return colorAxis.map((colorAxisEntry) =>
      resolveSaltColorAxisEntry(colorAxisEntry, tokens),
    );
  }

  return resolveSaltColorAxisEntry(colorAxis, tokens);
};
