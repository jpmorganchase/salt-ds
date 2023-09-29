import { composeStories } from "@storybook/react";
import * as flowStories from "@stories/flow-layout/flow-layout.stories";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(flowStories);
const { Default } = composedStories;

describe("GIVEN a Flow", () => {
  checkAccessibility(composedStories);

  describe("WHEN no props are provided", () => {
    it("THEN it should wrap by default", () => {
      cy.mount(<Default />);

      cy.get(".saltFlexLayout").should("have.css", "flex-wrap", "wrap");
    });

    it("THEN it should render with a default gap", () => {
      cy.mount(<Default />);

      cy.get(".saltFlexLayout").should("have.css", "column-gap", "24px");

      cy.get(".saltFlexLayout").should("have.css", "row-gap", "24px");
    });
  });
});
