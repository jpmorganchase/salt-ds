import Highcharts from "highcharts";

export function isHighcharts10() {
  // The v10 runtime exposes version, but its bundled types omit it.
  const { version } = Highcharts as typeof Highcharts & { version?: string };
  return version?.startsWith("10.") ?? false;
}
