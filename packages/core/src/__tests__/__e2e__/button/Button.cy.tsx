import { composeStories } from "@storybook/testing-react";
import * as buttonStories from "@stories/button.stories";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(buttonStories);
const { FeatureButton, FocusableWhenDisabled } = composedStories;

describe("Given a Button", () => {
  checkAccessibility(composedStories);

  it("should render text as children", () => {
    cy.mount(<FeatureButton />);
    cy.findByText(FeatureButton.args?.children as string).should("be.visible");
  });

  it("should be focusable when disabled and focusableWhenDisabled", () => {
    cy.mount(<FocusableWhenDisabled />);
    cy.findByRole("button").should("have.attr", "aria-disabled", "true");
    cy.realPress("Tab");
    cy.findByRole("button").should("be.focused");
  });
});
