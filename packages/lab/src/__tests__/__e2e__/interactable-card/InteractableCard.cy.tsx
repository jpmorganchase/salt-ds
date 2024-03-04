import { composeStories } from "@storybook/react";
import * as interactableCardStories from "@stories/interactable-card/interactable-card.stories";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(interactableCardStories);
const { Default } = composedStories;

describe("Given an Interactable Card", () => {
  checkAccessibility(composedStories);

  it("should render children", () => {
    cy.mount(<Default />);
    cy.findByText("Sustainable investing products").should("be.visible");
    cy.findByText(
      "We have a commitment to provide a wide range of investment solutions to enable you to align your financial goals to your values."
    ).should("be.visible");
  });
});
