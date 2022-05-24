import { MetricContent } from "@jpmorganchase/uitk-lab";
import { MetricContextProvider } from "../../../metric/internal";

describe("MetricContent", () => {
  it("should display value", () => {
    cy.mount(<MetricContent value="$801.9B" />);
    cy.findByTestId("metric-value").should("exist");
    cy.contains("$801.9B");

    cy.findByTestId("metric-subvalue").should("not.exist");
  });

  it("should display subvalue if provided", () => {
    cy.mount(<MetricContent value="$801.9B" subvalue="-10.1 (-1.23%)" />);

    cy.findByTestId("metric-subvalue").should("exist");
    cy.contains("-10.1 (-1.23%)");
  });

  describe("When the indicator is required", () => {
    it(`should display correct icon for UP direction`, () => {
      cy.mount(
        <MetricContextProvider
          value={{
            direction: "up",
            showIndicator: true,
            indicatorPosition: "end",
          }}
        >
          <MetricContent value="$801.9B" />
        </MetricContextProvider>
      );

      cy.findByTestId("ArrowUpIcon").should("exist");
    });

    it(`should display correct icon for DOWN direction`, () => {
      cy.mount(
        <MetricContextProvider
          value={{
            direction: "down",
            showIndicator: true,
            indicatorPosition: "end",
          }}
        >
          <MetricContent value="$801.9B" />
        </MetricContextProvider>
      );

      cy.findByTestId("ArrowDownIcon").should("exist");
    });
  });
});
