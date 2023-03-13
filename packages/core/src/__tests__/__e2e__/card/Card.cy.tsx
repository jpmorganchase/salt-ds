import { composeStories } from "@storybook/testing-react";
import * as cardStories from "@stories/card/card.stories";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(cardStories);
const { Default } = composedStories;

describe("Given a Card", () => {
  checkAccessibility(composedStories);

  it("should render children", () => {
    cy.mount(<Default />);
    cy.findByText("This is Card").should("be.visible");
    cy.findByText("Using Nested DOM Elements").should("be.visible");
  });
});
