import { composeStories } from "@storybook/testing-react";
import * as cardStories from "@stories/card/card.stories";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(cardStories);
const { Default } = composedStories;

describe("Given a Card", () => {
  checkAccessibility(composedStories);

  it("should render children", () => {
    cy.mount(<Default />);
    cy.findByText("Card").should("be.visible");
    cy.findByText(
      "A card displays information about a single subject, and acts as entry point to more detailed information."
    ).should("be.visible");
  });
});
