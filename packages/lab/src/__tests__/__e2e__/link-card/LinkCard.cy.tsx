import { composeStories } from "@storybook/react";
import * as linkCardStories from "@stories/link-card/link-card.stories";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(linkCardStories);
const { Default } = composedStories;

describe("Given a Link Card", () => {
  checkAccessibility(composedStories);

  it("should render children", () => {
    cy.mount(<Default />);
    cy.findByText("Sustainable investing products").should("be.visible");
    cy.findByText(
      "We have a commitment to provide a wide range of investment solutions to enable you to align your financial goals to your values."
    ).should("be.visible");
  });

  it("should navigate to the correct href", () => {
    cy.mount(<Default />);
    cy.get("a").should("have.attr", "href", "#");
  });
});
