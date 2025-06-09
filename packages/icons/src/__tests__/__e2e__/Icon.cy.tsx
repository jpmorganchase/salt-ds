import { composeStories } from "@storybook/react-vite";
import { checkAccessibility } from "../../../../../cypress/tests/checkAccessibility";
import * as iconStory from "../../../stories/icon.stories";

const composedStories = composeStories(iconStory);

const { SaltIcon } = composedStories;

describe("Given an icon", () => {
  checkAccessibility(composedStories);

  it("should not have an aria-label or role if aria-hidden is set to true", () => {
    cy.mount(<SaltIcon data-testid="SaltIcon" aria-hidden />);
    cy.findByRole("img").should("not.exist");
    cy.findByTestId("SaltIcon").should("not.have.attr", "aria-label");
  });
});
