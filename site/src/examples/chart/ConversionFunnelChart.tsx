import { FlexLayout, Switch } from "@salt-ds/core";
import { useChart } from "@salt-ds/highcharts-theme";
import Highcharts, {
  type Chart,
  type Options,
  type Point,
  type SVGElement,
  type SVGPathArray,
} from "highcharts";
import accessibility from "highcharts/modules/accessibility";
import patternFill from "highcharts/modules/pattern-fill";
import HighchartsReact from "highcharts-react-official";
import { useMemo, useRef, useState } from "react";
import styles from "./index.module.css";

// Highcharts v10/v11 modules are initialised with the Highcharts instance.
// In v12, import these modules for their side effects instead.
patternFill(Highcharts);
accessibility(Highcharts);

const stages = [
  { name: "Lead", y: 7745 },
  { name: "Opportunity", y: 5468 },
  { name: "Qualified", y: 4238 },
  { name: "Sold", y: 2025 },
  { name: "Retained", y: 1520 },
];

function percentageOfInitial(point: Point) {
  const initialCount = point.series.points[0]?.y;
  return initialCount && point.y !== null && point.y !== undefined
    ? `${Highcharts.numberFormat((point.y / initialCount) * 100, 1)}%`
    : "Not available";
}

interface FunnelDecorations {
  connectors: SVGElement;
  badges: SVGElement;
  rail: SVGElement;
  paths: SVGElement[];
  circles: SVGElement[];
  labels: SVGElement[];
}

const decorations = new WeakMap<Chart, FunnelDecorations>();

/** Draw decorative shapes from the current axes on every render, including resize. */
function renderConversionFunnel(chart: Chart, showConnectors: boolean) {
  const series = chart.series[0];
  if (!series) {
    const previous = decorations.get(chart);
    previous?.connectors.destroy();
    previous?.badges.destroy();
    decorations.delete(chart);
    return;
  }

  let elements = decorations.get(chart);
  if (!elements) {
    const connectors = chart.renderer
      .g("conversion-funnel-connectors")
      .attr({ "aria-hidden": "true", zIndex: 1 })
      .css({ pointerEvents: "none" })
      .add();
    const badges = chart.renderer
      .g("conversion-funnel-badges")
      .attr({ "aria-hidden": "true", zIndex: 1 })
      .css({ pointerEvents: "none" })
      .add();
    elements = {
      connectors,
      badges,
      rail: chart.renderer.path().add(badges),
      paths: [],
      circles: [],
      labels: [],
    };
    decorations.set(chart, elements);
  }

  const points = series.visible
    ? series.points.filter((point) => typeof point.y === "number")
    : [];
  const styles = chart.container.ownerDocument.defaultView?.getComputedStyle(
    chart.container,
  );
  const token = (name: string) => styles?.getPropertyValue(name).trim();
  const background = token("--salt-container-primary-background");
  const connectorColor = token("--salt-container-secondary-background");
  const foreground = token("--salt-content-primary-foreground");
  const accent = token("--salt-category-1-dataviz");
  const baseline = series.yAxis.toPixels(0, false);
  const badgeX = baseline - 38;
  const rows = points.map((point) => ({
    point,
    center: series.xAxis.toPixels(point.x, false),
    end: series.yAxis.toPixels(point.y ?? 0, false),
    // Bar charts are inverted: the column's width becomes the bar's height.
    halfHeight: Number(point.shapeArgs?.width ?? 0) / 2,
  }));

  const connectorCount = showConnectors ? Math.max(0, rows.length - 1) : 0;
  for (const path of elements.paths.splice(connectorCount)) path.destroy();
  for (const circle of elements.circles.splice(rows.length)) circle.destroy();
  for (const label of elements.labels.splice(rows.length)) label.destroy();

  for (let index = 0; index < connectorCount; index++) {
    const current = rows[index];
    const next = rows[index + 1];
    const bottom = current.center + current.halfHeight;
    const top = next.center - next.halfHeight;
    const d: SVGPathArray = [
      ["M", baseline, bottom],
      ["L", current.end, bottom],
      ["L", next.end, top],
      ["L", baseline, top],
      ["Z"],
    ];
    elements.paths[index] ??= chart.renderer.path().add(elements.connectors);
    elements.paths[index].attr({ d, fill: connectorColor, "stroke-width": 0 });
  }

  const first = rows[0];
  const last = rows[rows.length - 1];
  elements.rail.attr({
    d:
      first && last
        ? [
            ["M", badgeX, first.center],
            ["L", badgeX, last.center],
          ]
        : [],
    stroke: token("--salt-separable-tertiary-borderColor"),
    "stroke-width": 2,
  });

  rows.forEach(({ point, center }, index) => {
    elements.circles[index] ??= chart.renderer.circle().add(elements.badges);
    elements.circles[index].attr({
      cx: badgeX,
      cy: center,
      r: 25,
      fill: background,
      stroke: accent,
      "stroke-width": 2,
    });
    elements.labels[index] ??= chart.renderer.text().add(elements.badges);
    elements.labels[index]
      .attr({
        text:
          percentageOfInitial(point) === "Not available"
            ? "—"
            : percentageOfInitial(point),
        x: badgeX,
        y: center,
        "text-anchor": "middle",
        "dominant-baseline": "middle",
      })
      .css({
        ...series.xAxis.options.labels?.style,
        color: foreground,
      });
    elements.circles[index].attr({
      r: Math.max(25, elements.labels[index].getBBox().width / 2 + 6),
    });
  });
}

const conversionFunnelOptions: Options = {
  chart: {
    type: "bar",
    height: 440,
    marginLeft: 78,
    animation: false,
  },
  title: { text: "Lead conversion" },
  subtitle: { text: "Percentages show the share of initial leads" },
  accessibility: {
    typeDescription: "Conversion funnel with horizontal bars.",
    description:
      "Counts at successive stages for the same group of leads. Bar widths show counts; percentages are relative to the initial Lead stage.",
    point: {
      descriptionFormatter: (point) =>
        `${point.name}, ${Highcharts.numberFormat(point.y ?? 0, 0)} leads, ${percentageOfInitial(point)} of initial leads. Stage ${point.index + 1} of ${point.series.points.length}.`,
    },
  },
  xAxis: {
    categories: stages.map(({ name }) => name),
    reversed: true,
    visible: false,
  },
  yAxis: {
    min: 0,
    visible: false,
    endOnTick: false,
    maxPadding: 0.03,
  },
  legend: { enabled: false },
  tooltip: {
    headerFormat: "<span>{point.key}</span><br/>",
    pointFormatter: function () {
      return `${Highcharts.numberFormat(this.y ?? 0, 0)} leads<br/>${percentageOfInitial(this)} of initial leads`;
    },
  },
  plotOptions: {
    series: { animation: false },
    bar: {
      maxPointWidth: 44,
      minPointLength: 0,
      dataLabels: {
        enabled: true,
        inside: true,
        align: "left",
        format: "{point.name}<br/>{point.y:,.0f}",
        style: { color: "contrast" },
      },
    },
  },
  series: [{ type: "bar", name: "Leads", data: stages }],
  responsive: {
    rules: [
      {
        condition: { maxWidth: 480 },
        chartOptions: {
          chart: { marginRight: 100 },
          plotOptions: {
            bar: {
              dataLabels: {
                inside: false,
                crop: false,
                overflow: "allow",
                style: { color: "var(--salt-content-primary-foreground)" },
              },
            },
          },
        },
      },
    ],
  },
};

export const ConversionFunnelChart = () => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);
  const [patterns, setPatterns] = useState(false);
  const [showConnectors, setShowConnectors] = useState(true);
  const options = useMemo<Options>(
    () => ({
      ...conversionFunnelOptions,
      chart: {
        ...conversionFunnelOptions.chart,
        events: {
          render() {
            renderConversionFunnel(this, showConnectors);
          },
        },
      },
    }),
    [showConnectors],
  );
  const chartOptions = useChart(chartRef, options, { fillPatterns: patterns });

  return (
    <div className={styles.chartContainer}>
      <FlexLayout gap={1} justify="end" wrap>
        <Switch
          label="Show connectors"
          checked={showConnectors}
          onChange={(event) => setShowConnectors(event.target.checked)}
        />
        <Switch
          label="Show patterns"
          checked={patterns}
          onChange={(event) => setPatterns(event.target.checked)}
        />
      </FlexLayout>
      <HighchartsReact
        className={styles.chart}
        highcharts={Highcharts}
        options={chartOptions}
        ref={chartRef}
      />
    </div>
  );
};
