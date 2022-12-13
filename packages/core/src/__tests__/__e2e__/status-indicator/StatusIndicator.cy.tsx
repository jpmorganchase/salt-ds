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
      cy.get(".uitkStatusIndicator").should(
        "have.class",
        "uitkStatusIndicator-error"
      );
      cy.get(".uitkStatusIndicator").should("have.attr", "aria-label", "error");
    });

    it("should render a success indicator", () => {
      cy.mount(<DefaultStatusIndicator status="success" />);
      cy.get(".uitkStatusIndicator").should(
        "have.class",
        "uitkStatusIndicator-success"
      );
      cy.get(".uitkStatusIndicator").should(
        "have.attr",
        "aria-label",
        "success"
      );
    });

    it("should render a warning indicator", () => {
      cy.mount(<DefaultStatusIndicator status="warning" />);
      cy.get(".uitkStatusIndicator").should(
        "have.class",
        "uitkStatusIndicator-warning"
      );
      cy.get(".uitkStatusIndicator").should(
        "have.attr",
        "aria-label",
        "warning"
      );
    });

    it("should render an info indicator", () => {
      cy.mount(<DefaultStatusIndicator status="info" />);
      cy.get(".uitkStatusIndicator").should(
        "have.class",
        "uitkStatusIndicator-info"
      );
      cy.get(".uitkStatusIndicator").should("have.attr", "aria-label", "info");
    });
  });
});
