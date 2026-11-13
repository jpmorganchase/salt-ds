import Highcharts, { type Chart, type Point } from "highcharts";
import { describe, expect, it } from "vitest";
import { act, renderWithSalt } from "~browser-test-utils/render";
import CenteredConversionFunnelChart from "../../examples/CenteredConversionFunnelChart";
import ConversionFunnelChart from "../../examples/ConversionFunnelChart";
import { centeredConversionFunnelOptions } from "../../examples/dependencies/centeredConversionFunnelOptions";
import { conversionFunnelOptions } from "../../examples/dependencies/conversionFunnelOptions";

const stageCounts = [7745, 5468, 4238, 2025, 1520];
const centredOptions = Highcharts.merge(centeredConversionFunnelOptions, {
  chart: { animation: false },
  plotOptions: { series: { animation: false } },
});

function getChart(container: HTMLElement): Chart {
  const chart = Highcharts.charts.find(
    (candidate) => candidate && container.contains(candidate.container),
  );
  if (!chart) {
    throw new Error("The conversion chart has not mounted");
  }
  return chart;
}

function pointBounds(point: Point): DOMRect {
  if (!point.graphic) {
    throw new Error(`No bar was rendered for ${point.name}`);
  }
  return point.graphic.element.getBoundingClientRect();
}

function visibleConnectors(chart: Chart): SVGPathElement[] {
  return Array.from(
    chart.container.querySelectorAll<SVGPathElement>(
      ".highcharts-conversion-funnel-connectors path",
    ),
  ).filter(
    (path) =>
      path.getBoundingClientRect().height > 0 &&
      getComputedStyle(path).visibility !== "hidden",
  );
}

function expectNear(actual: number, expected: number) {
  // SVG crisping can move the bar boundary by a pixel on either side.
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(2);
}

function expectProportionalBars(chart: Chart, centred: boolean) {
  const bounds = chart.series[0].points.map(pointBounds);
  const first = bounds[0];
  for (const [index, bar] of bounds.entries()) {
    expectNear(bar.width, (first.width * stageCounts[index]) / stageCounts[0]);
    if (centred) {
      expectNear(bar.left + bar.width / 2, first.left + first.width / 2);
    } else {
      expectNear(bar.left, first.left);
    }
    if (index > 0) {
      expect(bar.top).toBeGreaterThan(bounds[index - 1].bottom);
    }
  }
}

function expectActualCounts(chart: Chart) {
  for (const [index, point] of chart.series[0].points.entries()) {
    const description = point.graphic?.element.getAttribute("aria-label") ?? "";
    expect(description).toContain(point.name);
    expect(description.replace(/[,\s]/g, "")).toContain(
      String(stageCounts[index]),
    );
    expect(description).not.toMatch(/-\d/);
  }
}

function visibleCountLabels(chart: Chart): string[] {
  return Array.from(
    chart.container.querySelectorAll<SVGTextElement>(
      ".highcharts-data-label text",
    ),
  )
    .filter(
      (text) =>
        text.getBoundingClientRect().width > 0 &&
        getComputedStyle(text).visibility !== "hidden",
    )
    .map((text) => {
      // Highcharts repeats text in outline tspans. Count the visible label once.
      const copy = text.cloneNode(true) as SVGTextElement;
      for (const outline of copy.querySelectorAll(".highcharts-text-outline")) {
        outline.remove();
      }
      return (copy.textContent ?? "").replace(/[^\d]/g, "");
    });
}

function expectAlignedDecorations(chart: Chart) {
  const bars = chart.series[0].points.map(pointBounds);
  const connectors = visibleConnectors(chart);
  expect(connectors).toHaveLength(bars.length - 1);
  for (const [index, connector] of connectors.entries()) {
    const bounds = connector.getBoundingClientRect();
    expectNear(bounds.left, bars[index].left);
    expectNear(bounds.top, bars[index].bottom);
    expectNear(bounds.bottom, bars[index + 1].top);
    expectNear(
      bounds.right,
      Math.max(bars[index].right, bars[index + 1].right),
    );
  }

  const badges = chart.container.querySelectorAll<SVGCircleElement>(
    ".highcharts-conversion-funnel-badges circle",
  );
  expect(badges).toHaveLength(bars.length);
  for (const [index, badge] of Array.from(badges).entries()) {
    const bounds = badge.getBoundingClientRect();
    expectNear(
      bounds.top + bounds.height / 2,
      bars[index].top + bars[index].height / 2,
    );
  }
}

describe("Conversion funnel examples", () => {
  it.each([700, 360])(
    "keeps centred bars proportional and exposes each count once at %ipx",
    async (width) => {
      const { container } = await renderWithSalt(
        <div style={{ width }}>
          <CenteredConversionFunnelChart options={centredOptions} />
        </div>,
      );
      const chart = getChart(container);

      await expect.poll(() => chart.series[0].points).toHaveLength(5);
      await expect
        .poll(() => visibleCountLabels(chart))
        .toEqual(stageCounts.map(String));
      expectProportionalBars(chart, true);
      expectActualCounts(chart);
    },
  );

  it("toggles decorative connectors without removing the stage bars or descriptions", async () => {
    const { container, rerender } = await renderWithSalt(
      <div style={{ width: 700 }}>
        <ConversionFunnelChart options={conversionFunnelOptions} />
      </div>,
    );
    const chart = getChart(container);

    await expect.poll(() => visibleConnectors(chart)).toHaveLength(4);
    expectProportionalBars(chart, false);
    expectActualCounts(chart);
    expectAlignedDecorations(chart);

    for (const group of chart.container.querySelectorAll(
      ".highcharts-conversion-funnel-connectors, .highcharts-conversion-funnel-badges",
    )) {
      expect(group.getAttribute("aria-hidden")).toBe("true");
    }
    expect(
      chart.container.querySelector(".highcharts-conversion-funnel-badges")
        ?.textContent,
    ).toContain("54.7%");

    await rerender(
      <div style={{ width: 700 }}>
        <ConversionFunnelChart
          options={conversionFunnelOptions}
          showConnectors={false}
        />
      </div>,
    );

    await expect.poll(() => visibleConnectors(chart)).toHaveLength(0);
    expect(getChart(container)).toBe(chart);
    expect(chart.series[0].points).toHaveLength(5);
    expectProportionalBars(chart, false);
    expectActualCounts(chart);
  });

  it("keeps decorations aligned on resize and removes stale decorations after data changes", async () => {
    const { container } = await renderWithSalt(
      <div style={{ width: 700 }}>
        <ConversionFunnelChart options={conversionFunnelOptions} />
      </div>,
    );
    const chart = getChart(container);
    await expect.poll(() => visibleConnectors(chart)).toHaveLength(4);

    await act(() => {
      chart.setSize(360, 440, false);
      chart.redraw(false);
      chart.redraw(false);
    });
    expectAlignedDecorations(chart);
    const firstDataLabel = chart.container.querySelector<SVGTextElement>(
      ".highcharts-data-label text",
    );
    if (!firstDataLabel) {
      throw new Error("No data label was rendered for the first stage");
    }
    const firstDataLabelBounds = firstDataLabel.getBoundingClientRect();
    expect(firstDataLabel.textContent).toContain(
      chart.series[0].points[0].name,
    );
    expect(firstDataLabelBounds.width).toBeGreaterThan(0);
    expect(getComputedStyle(firstDataLabel).visibility).not.toBe("hidden");
    expect(firstDataLabelBounds.left).toBeGreaterThanOrEqual(
      pointBounds(chart.series[0].points[0]).right - 2,
    );
    expect(
      chart.container.querySelectorAll(
        ".highcharts-conversion-funnel-connectors",
      ),
    ).toHaveLength(1);
    expect(
      chart.container.querySelectorAll(".highcharts-conversion-funnel-badges"),
    ).toHaveLength(1);

    await act(() => {
      chart.series[0].setData(
        chart.series[0].points
          .slice(0, 3)
          .map((point) => ({ ...point.options })),
        true,
        false,
      );
    });

    expect(chart.series[0].points).toHaveLength(3);
    expectAlignedDecorations(chart);

    const seriesOptions = chart.series[0].userOptions;
    await act(() => chart.series[0].remove(true, false));

    expect(chart.series).toHaveLength(0);
    expect(visibleConnectors(chart)).toHaveLength(0);
    expect(
      chart.container.querySelectorAll(
        ".highcharts-conversion-funnel-badges circle, .highcharts-conversion-funnel-badges text",
      ),
    ).toHaveLength(0);

    await act(() => {
      chart.addSeries(seriesOptions, true, false);
    });

    expect(chart.series[0].points).toHaveLength(3);
    expectAlignedDecorations(chart);
    expect(
      chart.container.querySelectorAll(".highcharts-conversion-funnel-badges"),
    ).toHaveLength(1);
  });
});
