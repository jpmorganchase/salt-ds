import type { Options } from "highcharts";

const stages = [
  { name: "Lead", count: 7745 },
  { name: "Opportunity", count: 5468 },
  { name: "Qualified", count: 4238 },
  { name: "Sold", count: 2025 },
  { name: "Retained", count: 1520 },
];

// Symmetric limits keep every bar centred, including when a stage increases.
const halfMaximum = Math.max(1, ...stages.map(({ count }) => count)) / 2;

export const centeredConversionFunnelOptions: Options = {
  chart: {
    type: "columnrange",
    inverted: true,
  },
  title: {
    text: "Sales conversion funnel",
  },
  subtitle: {
    text: "Bar width represents the count at each stage",
  },
  accessibility: {
    typeDescription: "Conversion funnel with centred horizontal bars.",
    description:
      "The number of leads at each sales stage. Stages remain in process order, and bar widths represent counts on the same scale.",
    point: {
      // The low and high values only position the bar; they are not the data.
      valueDescriptionFormat: "{point.name}, {point.custom.count:,.0f} leads.",
    },
  },
  xAxis: {
    categories: stages.map(({ name }) => name),
    reversed: true,
    lineWidth: 0,
    title: {
      text: undefined,
    },
    accessibility: {
      description: "Sales stages in process order",
    },
  },
  yAxis: {
    visible: false,
    min: -halfMaximum,
    max: halfMaximum,
    startOnTick: false,
    endOnTick: false,
    minPadding: 0,
    maxPadding: 0,
    accessibility: {
      enabled: false,
    },
  },
  legend: {
    enabled: false,
  },
  tooltip: {
    headerFormat: "<span>{point.key}</span><br/>",
    pointFormat:
      '<span>Count: </span><span class="value">{point.custom.count:,.0f}</span>',
  },
  plotOptions: {
    columnrange: {
      borderWidth: 0,
      maxPointWidth: 36,
      minPointLength: 0,
      // Range labels normally describe both endpoints. One configuration
      // displays a single count in the middle of each bar instead.
      dataLabels: [
        {
          enabled: true,
          inside: true,
          align: "center",
          verticalAlign: "middle",
          format: "{point.custom.count:,.0f}",
          crop: false,
          overflow: "allow",
          style: {
            color: "contrast",
            textOutline: "1px contrast",
          },
        },
      ],
    },
  },
  series: [
    {
      name: "Leads",
      type: "columnrange",
      data: stages.map(({ name, count }) => ({
        name,
        low: -count / 2,
        high: count / 2,
        custom: { count },
      })),
    },
  ],
  responsive: {
    rules: [
      {
        condition: {
          maxWidth: 480,
        },
        chartOptions: {
          chart: {
            spacingRight: 56,
          },
          plotOptions: {
            columnrange: {
              // Keep counts readable when the narrowest bars cannot fit text.
              dataLabels: [
                {
                  enabled: true,
                  inside: false,
                  align: "left",
                  verticalAlign: "middle",
                  x: 4,
                  format: "{point.custom.count:,.0f}",
                  crop: false,
                  overflow: "allow",
                  style: {
                    color: "var(--salt-content-secondary-foreground)",
                    textOutline: "none",
                  },
                },
              ],
            },
          },
        },
      },
    ],
  },
};
