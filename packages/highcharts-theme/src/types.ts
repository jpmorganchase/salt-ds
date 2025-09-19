import type { Options } from "highcharts";

// Compatibility helpers for supporting Highcharts v10–v12 while
// allowing newer options that were introduced in later versions.

export type PlotPieBorderRadiusCompat = {
  plotOptions?: {
    pie?: {
      borderRadius?: number;
    };
  };
};

// Extend the upstream Options with newer fields while remaining
// assignable to plain Options everywhere it's consumed.
export type HighchartsOptionsCompat = Options & PlotPieBorderRadiusCompat;
