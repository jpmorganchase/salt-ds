import { composeStories } from "@storybook/testing-react";
import * as flowStories from "@stories/layout/flow-layout.stories";
import { checkAccessibility } from "../../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(flowStories);
const { DefaultFlowLayout } = composedStories;

describe("GIVEN a Flow", () => {
  checkAccessibility(composedStories);

  describe("WHEN no props are provided", () => {
    it("THEN it should wrap by default", () => {
      cy.mount(<DefaultFlowLayout />);

      cy.get(".uitkFlexLayout").should("have.css", "flex-wrap", "wrap");
    });
    ``;

    it("THEN it should render with a default gap", () => {
      cy.mount(<DefaultFlowLayout />);

      cy.get(".uitkFlexLayout").should("have.css", "column-gap", "24px");

      cy.get(".uitkFlexLayout").should("have.css", "row-gap", "24px");
    });
  });

  describe("WHEN a separator value is provided", () => {
    it("THEN it should render a separator", () => {
      cy.mount(<DefaultFlowLayout separators />);

      cy.get(".uitkFlexLayout").should(
        "have.class",
        "uitkFlexLayout-separator"
      );
    });
  });
});
