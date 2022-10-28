import { composeStories } from "@storybook/testing-react";
import * as cardStories from "@stories/card.stories";

const { DefaultCard } = composeStories(cardStories);

describe("Given a Card", () => {
  it("should render children", () => {
    cy.mount(<DefaultCard />);
    cy.findByText("This is Card").should("be.visible");
    cy.findByText("Using Nested DOM Elements").should("be.visible");
  });
});
