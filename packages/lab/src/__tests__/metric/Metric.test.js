import React from "react";
import { screen, render } from "@testing-library/react";

import { Metric, MetricHeader, MetricContent } from "../../metric";

describe("Metric", () => {
  it("should render the indicator if required", () => {
    const { queryByTestId } = render(
      <Metric showIndicator>
        <MetricHeader title="Revenue YTD" />
        <MetricContent
          value="$801.9B"
          IndicatorIconComponent={(props) => <div {...props}>icon</div>}
        />
      </Metric>
    );

    expect(queryByTestId("metric-indicator")).not.toBeNull();
  });

  it("should NOT render the indicator by default", () => {
    const { queryByTestId } = render(
      <Metric>
        <MetricHeader title="Revenue YTD" />
        <MetricContent value="$801.9B" />
      </Metric>
    );

    expect(queryByTestId("metric-indicator")).toBeNull();
  });

  it("should render with vertical orientation style by default", () => {
    const { container } = render(
      <Metric>
        <MetricHeader title="Revenue YTD" />
        <MetricContent value="$801.9B" />
      </Metric>
    );

    expect(container.querySelector(".uitkMetric")).toHaveClass(
      "uitkMetric-orientation-vertical"
    );
  });

  it(`should render with correct text component for size SMALL`, () => {
    const { container } = render(
      <Metric data-testid="metric" size="small">
        <MetricContent value="$801.9B" />
      </Metric>
    );

    expect(container.querySelector(".uitkText-figure3")).toBeDefined();
  });

  it(`should render with correct text component for size MEDIUM by default`, () => {
    const { container } = render(
      <Metric data-testid="metric">
        <MetricContent value="$801.9B" />
      </Metric>
    );

    expect(container.querySelector(".uitkText-figure2")).toBeDefined();
  });

  it(`should render with correct text component for size LARGE`, () => {
    const { container } = render(
      <Metric data-testid="metric" size="large">
        <MetricContent value="$801.9B" />
      </Metric>
    );

    expect(container.querySelector(".uitkText-figure1")).toBeDefined();
  });

  [("horizontal", "vertical")].forEach((orientation) =>
    it(`should render with correct classes for "${orientation}" orientation`, () => {
      const { container } = render(
        <Metric orientation={orientation}>
          <MetricHeader title="Revenue YTD" />
          <MetricContent value="$801.9B" />
        </Metric>
      );

      expect(container.querySelector(".uitkMetric")).toHaveClass(
        `uitkMetric-orientation-${orientation}`
      );
    })
  );

  ["up", "down"].forEach((direction) =>
    it(`should display correct indicator icon for "${direction}" direction`, () => {
      const { getByTestId } = render(
        <Metric direction={direction} showIndicator>
          <MetricHeader title="Revenue YTD" />
          <MetricContent value="$801.9B" />
        </Metric>
      );

      expect(
        getByTestId(direction === "up" ? /ArrowUpIcon/i : /ArrowDownIcon/i)
      ).toBeInTheDocument();
    })
  );

  it("should add correct aria props to the 'MetricContent'", () => {
    const { getByTestId, container } = render(
      <Metric>
        <MetricHeader title="Revenue YTD" subtitle="Total" />
        <MetricContent value="$801.9B" />
      </Metric>
    );

    const title = getByTestId("metric-title");
    const subtitle = getByTestId("metric-subtitle");
    const content = container.querySelector(".uitkMetricContent");

    expect(title).toHaveAttribute("aria-level", "2");
    expect(content).toHaveAttribute(
      "aria-labelledby",
      `${title.id} ${subtitle.id}`
    );
  });

  it("should set correct 'aria-level' to the heading if required", () => {
    const { getByTestId } = render(
      <Metric headingAriaLevel={1}>
        <MetricHeader title="Revenue YTD" />
        <MetricContent value="$801.9B" />
      </Metric>
    );

    expect(getByTestId("metric-title")).toHaveAttribute("aria-level", "1");
    expect(getByTestId("metric-value")).not.toHaveAttribute("aria-level");
  });
});
