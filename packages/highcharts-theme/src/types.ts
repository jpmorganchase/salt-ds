import type { Options } from "highcharts";

// Compatibility helpers for supporting Highcharts v10–v12 while
// allowing newer options that were introduced in later versions.

type PlotPieBorderRadiusCompat = {
  plotOptions?: {
    pie?: {
      borderRadius?: number;
    };
  };
};

/*  Not available in v10 and only available in v11+. In v12+, the legendSymbol defaults
to areaMarker which we need to reset to rectangle by default
*/
type PlotAreaLegendSymbolCompat = {
  plotOptions?: {
    area?: {
      legendSymbol?: "rectangle" | "areaMarker" | "lineMarker";
    };
  };
};

// Extend the upstream Options with newer fields while remaining
// assignable to plain Options everywhere it's consumed.
export type HighchartsOptionsCompat = Options &
  PlotPieBorderRadiusCompat &
  PlotAreaLegendSymbolCompat;
