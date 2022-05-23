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
      "uitkMetric-vertical"
    );
  });

  ["High", "Medium", "Low"].forEach((emphasis) =>
    it(`should render with correct classes for "${emphasis}" emphasis`, () => {
      render(
        <Metric data-testid="metric" className={`uitkEmphasis${emphasis}`}>
          <MetricContent value="$801.9B" />
        </Metric>
      );

      expect(screen.getByTestId("metric")).toHaveClass(
        `uitkEmphasis${emphasis}`
      );
    })
  );

  ["horizontal", "vertical"].forEach((orientation) =>
    it(`should render with correct classes for "${orientation}" orientation`, () => {
      const { container } = render(
        <Metric orientation={orientation}>
          <MetricHeader title="Revenue YTD" />
          <MetricContent value="$801.9B" />
        </Metric>
      );

      expect(container.querySelector(".uitkMetric")).toHaveClass(
        `uitkMetric-${orientation}`
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

  describe("When applying aria attributes", () => {
    it("should add heading role to the first valid child component", () => {
      const { getByTestId, rerender } = render(
        <Metric>
          <div>Some text</div>
          <MetricHeader title="Revenue YTD" />
          <MetricContent value="$801.9B" />
        </Metric>
      );

      expect(getByTestId("metric-title")).toHaveAttribute("role", "heading");
      expect(getByTestId("metric-value")).not.toHaveAttribute(
        "role",
        "heading"
      );

      rerender(
        <Metric>
          Some text
          <MetricContent value="$801.9B" />
          <MetricHeader title="Revenue YTD" />
        </Metric>
      );

      expect(getByTestId("metric-value")).toHaveAttribute("role", "heading");
      expect(getByTestId("metric-title")).not.toHaveAttribute(
        "role",
        "heading"
      );
    });
  });

  it("should add correct aria props to the title if 'MetricHeader' is the first valid child component", () => {
    const { getByTestId } = render(
      <Metric>
        <MetricHeader title="Revenue YTD" />
        <MetricContent value="$801.9B" />
      </Metric>
    );

    const title = getByTestId("metric-title");
    const value = getByTestId("metric-value");

    expect(title).toHaveAttribute("aria-level", "2");
    expect(title).toHaveAttribute(
      "aria-labelledby",
      [title.id, value.id].join(" ")
    );

    expect(value).not.toHaveAttribute("aria-level");
    expect(value).not.toHaveAttribute("aria-labelledby");
  });

  it("should add correct aria props to the value if 'MetricContent' is the first valid child component", () => {
    const { getByTestId } = render(
      <Metric>
        <MetricContent value="$801.9B" />
        <MetricHeader title="Revenue YTD" />
      </Metric>
    );

    const title = getByTestId("metric-title");
    const value = getByTestId("metric-value");

    expect(value).toHaveAttribute("aria-level", "2");
    expect(value).toHaveAttribute(
      "aria-labelledby",
      [value.id, title.id].join(" ")
    );

    expect(title).not.toHaveAttribute("aria-level");
    expect(title).not.toHaveAttribute("aria-labelledby");
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
