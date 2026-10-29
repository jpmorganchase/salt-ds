import { DoubleChevronDownIcon } from "@salt-ds/icons";
import { Metric, MetricContent, MetricHeader } from "@salt-ds/lab";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";

function metricElement(selector: string) {
  const element = document.querySelector<HTMLElement>(selector);
  if (!element) throw new Error(`Missing metric element ${selector}`);
  return element;
}

function BasicMetric(props: React.ComponentProps<typeof Metric>) {
  return (
    <Metric {...props}>
      <MetricHeader title="Revenue YTD" />
      <MetricContent value="$801.9B" />
    </Metric>
  );
}

describe("GIVEN a Metric by default", () => {
  it("does not render an indicator", async () => {
    await renderWithSalt(<BasicMetric />);
    expect(document.querySelector(".saltMetricContent-indicator")).toBeNull();
  });

  it("uses vertical orientation", async () => {
    await renderWithSalt(<BasicMetric />);
    expect(metricElement(".saltMetric")).toHaveClass(
      "saltMetric-orientation-vertical",
    );
  });

  it("uses medium size", async () => {
    await renderWithSalt(<BasicMetric />);
    expect(document.querySelector(".saltText-display2")).not.toBeNull();
  });
});

describe("GIVEN a Metric indicator", () => {
  it("renders when requested with a custom icon", async () => {
    await renderWithSalt(
      <Metric showIndicator>
        <MetricHeader title="Revenue YTD" />
        <MetricContent
          value="$801.9B"
          IndicatorIconComponent={DoubleChevronDownIcon}
        />
      </Metric>,
    );
    expect(
      document.querySelector(".saltMetricContent-indicator"),
    ).not.toBeNull();
  });

  it("does not render without an icon or direction", async () => {
    await renderWithSalt(<BasicMetric showIndicator />);
    expect(document.querySelector(".saltMetricContent-indicator")).toBeNull();
  });
});

it.each([
  ["up", "ArrowUpIcon"],
  ["down", "ArrowDownIcon"],
] as const)("renders the %s direction indicator", async (direction, testId) => {
  await renderWithSalt(<BasicMetric showIndicator direction={direction} />);
  await expect.element(page.getByTestId(testId)).toBeInTheDocument();
});

it.each([
  ["start", true],
  ["end", false],
] as const)(
  "places the indicator at %s",
  async (indicatorPosition, startsBefore) => {
    await renderWithSalt(
      <BasicMetric
        showIndicator
        direction="up"
        indicatorPosition={indicatorPosition}
      />,
    );
    const indicatorX = metricElement(
      ".saltMetricContent-indicator",
    ).getBoundingClientRect().x;
    const valueX = page
      .getByTestId("metric-value")
      .element()
      .getBoundingClientRect().x;
    expect(startsBefore ? indicatorX < valueX : indicatorX > valueX).toBe(true);
  },
);

it.each([
  ["large", "saltText-display1"],
  ["medium", "saltText-display2"],
  ["small", "saltText-display3"],
] as const)("uses the %s text size", async (size, className) => {
  await renderWithSalt(<BasicMetric size={size} />);
  expect(document.querySelector(`.${className}`)).not.toBeNull();
});

it.each(["horizontal", "vertical"] as const)(
  "supports %s orientation",
  async (orientation) => {
    await renderWithSalt(<BasicMetric orientation={orientation} />);
    expect(metricElement(".saltMetric")).toHaveClass(
      `saltMetric-orientation-${orientation}`,
    );
  },
);

describe("GIVEN Metric accessibility labelling", () => {
  it("labels content when the header comes first", async () => {
    await renderWithSalt(
      <Metric>
        <div>Some text</div>
        <MetricHeader title="Revenue YTD" />
        <MetricContent value="$801.9B" />
      </Metric>,
    );
    expect(metricElement(".saltMetricContent")).toHaveAttribute(
      "aria-labelledby",
    );
  });

  it("labels content when the header comes last", async () => {
    await renderWithSalt(
      <Metric>
        <MetricContent value="$801.9B" />
        <div>Some text</div>
        <MetricHeader title="Revenue YTD" />
      </Metric>,
    );
    expect(metricElement(".saltMetricContent")).toHaveAttribute(
      "aria-labelledby",
    );
  });
});

it.each([
  ["left", "flex-start"],
  ["center", "center"],
  ["right", "flex-end"],
] as const)("aligns the MetricHeader to the %s", async (align, expected) => {
  await renderWithSalt(<BasicMetric align={align} />);
  expect(getComputedStyle(metricElement(".saltMetricHeader")).alignItems).toBe(
    expected,
  );
});

describe("GIVEN MetricContent", () => {
  it("renders its value without a subvalue", async () => {
    await renderWithSalt(<MetricContent value="$801.9B" />);
    await expect
      .element(page.getByTestId("metric-value"))
      .toHaveTextContent("$801.9B");
    await expect.element(page.getByTestId("metric-subvalue")).toHaveLength(0);
  });

  it("renders a supplied subvalue", async () => {
    await renderWithSalt(
      <MetricContent value="$801.9B" subvalue="-10.1 (-1.23%)" />,
    );
    await expect
      .element(page.getByTestId("metric-subvalue"))
      .toHaveTextContent("-10.1 (-1.23%)");
  });

  it.each([
    ["up", "ArrowUpIcon"],
    ["down", "ArrowDownIcon"],
  ] as const)(
    "renders the %s icon when requested",
    async (direction, testId) => {
      await renderWithSalt(
        <Metric direction={direction} showIndicator indicatorPosition="end">
          <MetricContent value="$801.9B" />
        </Metric>,
      );
      await expect.element(page.getByTestId(testId)).toBeInTheDocument();
    },
  );
});
