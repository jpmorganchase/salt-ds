import * as statusIndicatorStories from "@stories/status-indicator/status-indicator.stories";
import { composeStories } from "@storybook/react-vite";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(statusIndicatorStories);
const { Default } = composedStories;

describe("Given a Status Indicator", () => {
  checkAccessibility(composedStories);

  describe("WHEN a status value is provided", () => {
    it("should render an error indicator", () => {
      cy.mount(<Default status="error" />);
      cy.get(".saltStatusIndicator").should(
        "have.class",
        "saltStatusIndicator-error",
      );
      cy.get(".saltStatusIndicator").should("have.attr", "aria-label", "error");
    });

    it("should render a success indicator", () => {
      cy.mount(<Default status="success" />);
      cy.get(".saltStatusIndicator").should(
        "have.class",
        "saltStatusIndicator-success",
      );
      cy.get(".saltStatusIndicator").should(
        "have.attr",
        "aria-label",
        "success",
      );
    });

    it("should render a warning indicator", () => {
      cy.mount(<Default status="warning" />);
      cy.get(".saltStatusIndicator").should(
        "have.class",
        "saltStatusIndicator-warning",
      );
      cy.get(".saltStatusIndicator").should(
        "have.attr",
        "aria-label",
        "warning",
      );
    });

    it("should render an info indicator", () => {
      cy.mount(<Default status="info" />);
      cy.get(".saltStatusIndicator").should(
        "have.class",
        "saltStatusIndicator-info",
      );
      cy.get(".saltStatusIndicator").should("have.attr", "aria-label", "info");
    });

    it("should not crash when invalid status is passed in", () => {
      // @ts-expect-error test invalid variant
      cy.mount(<Default status="invalid" />);
      // Not crash / no error from cypress
    });
  });
});
