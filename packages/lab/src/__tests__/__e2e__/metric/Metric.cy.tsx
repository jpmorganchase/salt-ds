import { Metric, MetricHeader, MetricContent } from "@jpmorganchase/uitk-lab";

describe("Metric - by default", () => {
  it("should NOT render the indicator", () => {
    cy.mount(
      <Metric>
        <MetricHeader title="Revenue YTD" />
        <MetricContent value="$801.9B" />
      </Metric>
    );
    cy.findByTestId("metric-indicator").should("not.exist");
  });

  it("should render with vertical orientation style", () => {
    cy.mount(
      <Metric>
        <MetricHeader title="Revenue YTD" />
        <MetricContent value="$801.9B" />
      </Metric>
    );
    cy.get(".uitkMetric").should("have.class", "uitkMetric-vertical");
  });

  it("should render with medium emphasis style", () => {
    cy.mount(
      <Metric>
        <MetricHeader title="Revenue YTD" />
        <MetricContent value="$801.9B" />
      </Metric>
    );
    cy.get(".uitkMetric").should("have.class", "uitkMetric-emphasis-medium");
  });
});

describe("Metric - Indicator", () => {
  it("should render the indicator if required and IndicatorIconComponent provided", () => {
    cy.mount(
      <Metric showIndicator>
        <MetricHeader title="Revenue YTD" />
        <MetricContent
          value="$801.9B"
          IndicatorIconComponent={(props) => <div {...props}>icon</div>}
        />
      </Metric>
    );
    cy.findByTestId("metric-indicator").should("exist");
  });
  it("should NOT render the indicator if required and IndicatorIconComponent NOT provided", () => {
    cy.mount(
      <Metric showIndicator>
        <MetricHeader title="Revenue YTD" />
        <MetricContent value="$801.9B" />
      </Metric>
    );
    cy.findByTestId("metric-indicator").should("not.exist");
  });
});

describe("Metric - Indicator Direction", () => {
  it(`should display correct indicator icon for UP direction`, () => {
    cy.mount(
      <Metric showIndicator direction="up">
        <MetricHeader title="Revenue YTD" />
        <MetricContent value="$801.9B" />
      </Metric>
    );
    cy.findByTestId(`ArrowUpIcon`).should("exist");
  });

  it(`should display correct indicator icon for DOWN direction`, () => {
    cy.mount(
      <Metric showIndicator direction="down">
        <MetricHeader title="Revenue YTD" />
        <MetricContent value="$801.9B" />
      </Metric>
    );
    cy.findByTestId(`ArrowDownIcon`).should("exist");
  });
});

describe("Metric - Indicator Position", () => {
  it(`should display correct indicator icon on 'start' position`, () => {
    cy.mount(
      <Metric showIndicator direction="up" indicatorPosition="start">
        <MetricHeader title="Revenue YTD" />
        <MetricContent value="$801.9B" />
      </Metric>
    );

    cy.findByTestId("metric-indicator").then((icon) => {
      const iconPos = icon[0].getBoundingClientRect().x;
      cy.findByTestId("metric-value").then((value) => {
        expect(value[0].getBoundingClientRect().x).greaterThan(iconPos);
      });
    });
  });

  it(`should display correct indicator icon on 'end' position`, () => {
    cy.mount(
      <Metric showIndicator direction="up" indicatorPosition="end">
        <MetricHeader title="Revenue YTD" />
        <MetricContent value="$801.9B" />
      </Metric>
    );

    cy.findByTestId("metric-indicator").then((icon) => {
      const iconPos = icon[0].getBoundingClientRect().x;
      cy.findByTestId("metric-value").then((value) => {
        expect(value[0].getBoundingClientRect().x).lessThan(iconPos);
      });
    });
  });
});

describe("Metric - Emphasis", () => {
  it(`should render with correct classes for HIGH emphasis`, () => {
    cy.mount(
      <Metric emphasis="high">
        <MetricHeader title="Revenue YTD" />
        <MetricContent value="$801.9B" />
      </Metric>
    );
    cy.get(".uitkMetric").should("have.class", `uitkMetric-emphasis-high`);
  });
  it(`should render with correct classes for MEDIUM emphasis`, () => {
    cy.mount(
      <Metric emphasis="medium">
        <MetricHeader title="Revenue YTD" />
        <MetricContent value="$801.9B" />
      </Metric>
    );
    cy.get(".uitkMetric").should("have.class", `uitkMetric-emphasis-medium`);
  });
  it(`should render with correct classes for LOW emphasis`, () => {
    cy.mount(
      <Metric emphasis="low">
        <MetricHeader title="Revenue YTD" />
        <MetricContent value="$801.9B" />
      </Metric>
    );
    cy.get(".uitkMetric").should("have.class", `uitkMetric-emphasis-low`);
  });
});

describe("Metric - Orientation", () => {
  it(`should render with correct classes for HORIZONTAL orientation`, () => {
    cy.mount(
      <Metric orientation="horizontal">
        <MetricHeader title="Revenue YTD" />
        <MetricContent value="$801.9B" />
      </Metric>
    );
    cy.get(".uitkMetric").should("have.class", `uitkMetric-horizontal`);
  });
  it(`should render with correct classes for VERTICAL orientation`, () => {
    cy.mount(
      <Metric orientation="vertical">
        <MetricHeader title="Revenue YTD" />
        <MetricContent value="$801.9B" />
      </Metric>
    );
    cy.get(".uitkMetric").should("have.class", `uitkMetric-vertical`);
  });
});

describe("Metric - Accessibility", () => {
  it("should add aria-labelledby to MetricContent", () => {
    cy.mount(
      <Metric>
        <div>Some text</div>
        <MetricHeader title="Revenue YTD" />
        <MetricContent value="$801.9B" />
      </Metric>
    );

    cy.get(".uitkMetricContent").should("have.attr", "aria-labelledby");
  });
  it("should add aria-labelledby to MetricContent no matter the order", () => {
    cy.mount(
      <Metric>
        <MetricContent value="$801.9B" />
        <div>Some text</div>
        <MetricHeader title="Revenue YTD" />
      </Metric>
    );

    cy.get(".uitkMetricContent").should("have.attr", "aria-labelledby");
  });
});
