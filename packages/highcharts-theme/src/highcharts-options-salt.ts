import type { Options } from "highcharts";
import { saltPatternDef } from "./patterns";
import type { HighchartsOptionsCompat } from "./types";

/*
Typing note:
We type the literal as HighchartsOptionsCompat so we can include options added after v10
(e.g. plotOptions.pie.borderRadius) while compiling against v10–v12. We then export the
value as Highcharts.Options so consumers only see/use the standard upstream type for
their installed Highcharts version and never depend on this compat alias. Due to TS
structural typing, Options & X is assignable to Options, so setOptions(highchartsOptionsSalt)
is valid; older Highcharts will ignore unknown fields at runtime.
*/
export const saltThemeDefaults: HighchartsOptionsCompat = {
  chart: {
    styledMode: true,
    colorCount: 20,
  },
  defs: saltPatternDef,
  tooltip: {
    headerFormat: "<span>{point.key}</span><br/>",
    pointFormat:
      '<span>{series.name}: </span><span class="value">{point.y}</span>',
  },
  legend: {
    layout: "vertical",
    align: "right",
    verticalAlign: "middle",
    symbolWidth: 32,
    itemMarginBottom: 8,
    margin: 24,
    symbolRadius: 3,
  },
  yAxis: {
    title: {
      margin: 18,
    },
  },
  xAxis: {
    title: {
      margin: 24,
    },
  },
  plotOptions: {
    line: {
      marker: {
        enabled: false,
      },
    },
    pie: {
      borderRadius: 0,
      dataLabels: {
        distance: 6,
        format:
          '{point.name} <span class="value">{point.percentage:.1f}%</span>',
        enabled: true,
      },
      innerSize: "80%",
    },
  },
  title: {
    margin: 24,
  },
};

export const highchartsOptionsSalt: Options = saltThemeDefaults;
