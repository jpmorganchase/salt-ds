import { Metric, MetricHeader, MetricContent } from "@jpmorganchase/uitk-lab";

describe("Metric Header - Alignment", () => {
  it(`should render with correct style for LEFT align`, () => {
    cy.mount(
      <Metric align="left">
        <MetricHeader title="Revenue YTD" />
        <MetricContent value="$801.9B" />
      </Metric>
    );
    cy.get(".uitkMetricHeader").should("have.css", "text-align", "left");
  });
  it(`should render with correct style for CENTER align`, () => {
    cy.mount(
      <Metric align="center">
        <MetricHeader title="Revenue YTD" />
        <MetricContent value="$801.9B" />
      </Metric>
    );
    cy.get(".uitkMetricHeader").should("have.css", "text-align", "center");
  });
  it(`should render with correct style for RIGHT align`, () => {
    cy.mount(
      <Metric align="right">
        <MetricHeader title="Revenue YTD" />
        <MetricContent value="$801.9B" />
      </Metric>
    );
    cy.get(".uitkMetricHeader").should("have.css", "text-align", "right");
  });
});
