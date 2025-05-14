import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

import "highcharts/modules/accessibility";

const lineDataOptions = {
  chart: {
    type: "line",
    styledMode: true,
  },
  accessibility: {
    description:
      "A summary communicating the trends, insights, or patterns the chart is intended to provide in a couple sentences.",
  },
  legend: {
    symbolWidth: 32,
    align: "right",
    verticalAlign: "middle",
    layout: "vertical",
  },
  tooltip: {
    headerFormat: '<span class="title">{point.key}</span><br/>',
    pointFormat:
      '<span class="label">{series.name}: </span><span class="value">{point.y}</span>',
  },
  title: {
    text: "Currency strength from 2011 to 2015",
    margin: 32,
  },
  yAxis: {
    title: {
      text: "CCY strength indicator",
    },
  },
  xAxis: {
    description: "Time from 2011 to 2015",
    categories: ["2011", "2012", "2013", "2014", "2015"],
    endOnTick: true,
    startOnTick: true,
    maxPadding: 0,
  },
  series: [
    {
      name: "USD",
      data: [54, 59.6, 53.7, 53.9, 43.7],
    },
    {
      name: "EUR",
      data: [8, 34.8, 43, 51.2, 41.4],
    },
    {
      name: "CAD",
      data: [6, 20.2, 30.7, 36.8, 30.9],
    },
    {
      name: "AUD",
      data: [23, 19, 20.7, 13.9, 29.6],
    },
    {
      name: "GBP",
      data: [0, 6.1, 6.8, 5.3, 27.5],
    },
    {
      name: "JPY",
      data: [0, 16.2, 22.1, 26.2, 6.9],
    },
    {
      name: "CHF",
      data: [0, 0, 2.8, 4.8, 2.8],
    },
    {
      name: "NZD",
      data: [0, 7.4, 5.9, 9.3, 6.5],
    },
  ],
};

export const LineChart = () => {
  return (
    <div
      className="salt-highcharts-theme"
      style={{ maxWidth: 700, width: "100%" }}
    >
      <HighchartsReact highcharts={Highcharts} options={lineDataOptions} />
    </div>
  );
};
