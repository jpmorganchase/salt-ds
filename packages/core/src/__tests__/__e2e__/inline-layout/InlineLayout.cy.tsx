import { composeStories } from "@storybook/testing-react";
import * as inlineStories from "@stories/inline-layout.stories";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(inlineStories);
const { DefaultInlineLayout } = composedStories;

describe("GIVEN a Inline", () => {
  checkAccessibility(composedStories);

  describe("WHEN no props are provided", () => {
    it("THEN it should not wrap by default", () => {
      cy.mount(<DefaultInlineLayout />);

      cy.get(".saltFlexLayout").should("have.css", "flex-wrap", "nowrap");
    });

    it("THEN it should render with a default gap", () => {
      cy.mount(<DefaultInlineLayout />);

      cy.get(".saltFlexLayout").should("have.css", "column-gap", "24px");

      cy.get(".saltFlexLayout").should("have.css", "row-gap", "24px");
    });
  });

  describe("WHEN a separator value is provided", () => {
    it("THEN it should render a separator", () => {
      cy.mount(<DefaultInlineLayout separators />);

      cy.get(".saltFlexLayout").should(
        "have.class",
        "saltFlexLayout-separator"
      );
    });
  });
});
