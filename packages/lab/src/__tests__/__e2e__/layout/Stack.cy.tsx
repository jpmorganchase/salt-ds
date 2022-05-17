import { composeStories } from "@storybook/testing-react";
import * as stackStories from "@stories/layout/stack-layout.stories";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(stackStories);
const { ToolkitStackLayout } = composedStories;

describe("GIVEN a Stack", () => {
  checkAccessibility(composedStories);

  describe("WHEN no props are provided", () => {
    it("THEN it should not wrap by default", () => {
      cy.mount(<ToolkitStackLayout />);

      cy.get(".uitkFlexLayout").should("have.css", "flex-wrap", "nowrap");
    });

    it("THEN it should render with a default gap", () => {
      cy.mount(<ToolkitStackLayout />);

      cy.get(".uitkFlexLayout").should("have.css", "column-gap", "8px");

      cy.get(".uitkFlexLayout").should("have.css", "row-gap", "8px");
    });
  });

  describe("WHEN a separator value is provided", () => {
    it("THEN it should render a separator", () => {
      cy.mount(<ToolkitStackLayout separators />);

      cy.get(".uitkFlexLayout").should(
        "have.class",
        "uitkFlexLayout-separator"
      );
    });
  });
});
