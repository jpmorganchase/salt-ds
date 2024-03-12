import { LinkedIcon } from "@salt-ds/icons";
import { composeStories } from "@storybook/react";
import * as statusIndicatorStories from "@stories/status-indicator/status-indicator.stories";
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
        "saltStatusIndicator-error"
      );
      cy.get(".saltStatusIndicator").should("have.attr", "aria-label", "error");
      cy.get(".saltStatusIndicator").should(
        "have.attr",
        "data-testid",
        "ErrorSolidIcon"
      );
    });

    it("should render a success indicator", () => {
      cy.mount(<Default status="success" />);
      cy.get(".saltStatusIndicator").should(
        "have.class",
        "saltStatusIndicator-success"
      );
      cy.get(".saltStatusIndicator").should(
        "have.attr",
        "aria-label",
        "success"
      );
      cy.get(".saltStatusIndicator").should(
        "have.attr",
        "data-testid",
        "SuccessTickIcon"
      );
    });

    it("should render a warning indicator", () => {
      cy.mount(<Default status="warning" />);
      cy.get(".saltStatusIndicator").should(
        "have.class",
        "saltStatusIndicator-warning"
      );
      cy.get(".saltStatusIndicator").should(
        "have.attr",
        "aria-label",
        "warning"
      );
      cy.get(".saltStatusIndicator").should(
        "have.attr",
        "data-testid",
        "WarningSolidIcon"
      );
    });

    it("should render an info indicator", () => {
      cy.mount(<Default status="info" />);
      cy.get(".saltStatusIndicator").should(
        "have.class",
        "saltStatusIndicator-info"
      );
      cy.get(".saltStatusIndicator").should("have.attr", "aria-label", "info");
      cy.get(".saltStatusIndicator").should(
        "have.attr",
        "data-testid",
        "InfoSolidIcon"
      );
    });

    it("should render a custom icon indicator in the error color", () => {
      cy.mount(<Default status="error" icon={LinkedIcon} />);
      cy.get(".saltStatusIndicator").should(
        "have.class",
        "saltStatusIndicator-error"
      );
      cy.get(".saltStatusIndicator").should("have.attr", "aria-label", "error");
      cy.get(".saltStatusIndicator").should(
        "have.attr",
        "data-testid",
        "LinkedIcon"
      );
    });

    it("should render a custom icon indicator in the success color", () => {
      cy.mount(<Default status="success" icon={LinkedIcon} />);
      cy.get(".saltStatusIndicator").should(
        "have.class",
        "saltStatusIndicator-success"
      );
      cy.get(".saltStatusIndicator").should(
        "have.attr",
        "aria-label",
        "success"
      );
      cy.get(".saltStatusIndicator").should(
        "have.attr",
        "data-testid",
        "LinkedIcon"
      );
    });

    it("should render a custom icon indicator in the warning color", () => {
      cy.mount(<Default status="warning" icon={LinkedIcon} />);
      cy.get(".saltStatusIndicator").should(
        "have.class",
        "saltStatusIndicator-warning"
      );
      cy.get(".saltStatusIndicator").should(
        "have.attr",
        "aria-label",
        "warning"
      );
      cy.get(".saltStatusIndicator").should(
        "have.attr",
        "data-testid",
        "LinkedIcon"
      );
    });

    it("should render a custom icon indicator in the info color", () => {
      cy.mount(<Default status="info" icon={LinkedIcon} />);
      cy.get(".saltStatusIndicator").should(
        "have.class",
        "saltStatusIndicator-info"
      );
      cy.get(".saltStatusIndicator").should("have.attr", "aria-label", "info");
      cy.get(".saltStatusIndicator").should(
        "have.attr",
        "data-testid",
        "LinkedIcon"
      );
    });
  });
});
