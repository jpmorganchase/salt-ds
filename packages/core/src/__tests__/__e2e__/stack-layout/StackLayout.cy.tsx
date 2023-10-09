import { composeStories } from "@storybook/react";
import * as stackStories from "@stories/stack-layout/stack-layout.stories";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(stackStories);
const { Default } = composedStories;

describe("GIVEN a Stack", () => {
  checkAccessibility(composedStories);

  describe("WHEN no props are provided", () => {
    it("THEN it should not wrap by default", () => {
      cy.mount(<Default />);

      cy.get(".saltFlexLayout").should("have.css", "flex-wrap", "nowrap");
    });

    it("THEN it should render with a default gap", () => {
      cy.mount(<Default />);

      cy.get(".saltFlexLayout").should("have.css", "column-gap", "24px");

      cy.get(".saltFlexLayout").should("have.css", "row-gap", "24px");
    });

    it("THEN it should render as a column by default", () => {
      cy.mount(<Default />);

      cy.get(".saltFlexLayout").should("have.css", "flex-direction", "column");
    });
  });

  describe("WHEN row direction is provided", () => {
    it("THEN it should render in a row", () => {
      cy.mount(<Default direction="row" />);

      cy.get(".saltFlexLayout").should("have.css", "flex-direction", "row");
    });
  });

  describe("WHEN a separator value is provided", () => {
    it("THEN it should render a separator", () => {
      cy.mount(<Default separators />);

      cy.get(".saltFlexLayout").should(
        "have.class",
        "saltStackLayout-separator"
      );
    });
  });
});
