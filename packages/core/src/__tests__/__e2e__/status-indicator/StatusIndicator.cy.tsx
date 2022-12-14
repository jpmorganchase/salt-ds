import { composeStories } from "@storybook/testing-react";
import * as statusIndicatorStories from "@stories/status-indicator.stories";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(statusIndicatorStories);
const { DefaultStatusIndicator } = composedStories;

describe("Given a Status Indicator", () => {
  checkAccessibility(composedStories);

  describe("WHEN a status value is provided", () => {
    it("should render an error indicator", () => {
      cy.mount(<DefaultStatusIndicator status="error" />);
      cy.get(".saltStatusIndicator").should(
        "have.class",
        "saltStatusIndicator-error"
      );
      cy.get(".saltStatusIndicator").should("have.attr", "aria-label", "error");
    });

    it("should render a success indicator", () => {
      cy.mount(<DefaultStatusIndicator status="success" />);
      cy.get(".saltStatusIndicator").should(
        "have.class",
        "saltStatusIndicator-success"
      );
      cy.get(".saltStatusIndicator").should(
        "have.attr",
        "aria-label",
        "success"
      );
    });

    it("should render a warning indicator", () => {
      cy.mount(<DefaultStatusIndicator status="warning" />);
      cy.get(".saltStatusIndicator").should(
        "have.class",
        "saltStatusIndicator-warning"
      );
      cy.get(".saltStatusIndicator").should(
        "have.attr",
        "aria-label",
        "warning"
      );
    });

    it("should render an info indicator", () => {
      cy.mount(<DefaultStatusIndicator status="info" />);
      cy.get(".saltStatusIndicator").should(
        "have.class",
        "saltStatusIndicator-info"
      );
      cy.get(".saltStatusIndicator").should("have.attr", "aria-label", "info");
    });
  });
});
