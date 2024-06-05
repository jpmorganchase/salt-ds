import * as dividerStories from "@stories/divider/divider.stories";
import { composeStories } from "@storybook/react";
import { checkAccessibility } from "../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(dividerStories);
const { Variants, Vertical } = composedStories;

describe("GIVEN a Divider", () => {
  checkAccessibility(composedStories);

  it('should have the role "separator" and aria-orientation horizontal', () => {
    cy.mount(<Variants />);
    cy.findAllByRole("separator").should(
      "have.attr",
      "aria-orientation",
      "horizontal"
    );
  });

  it("should have vertical aria-orientation when it has vertical orientation", () => {
    cy.mount(<Vertical />);
    cy.findAllByRole("separator").should(
      "have.attr",
      "aria-orientation",
      "vertical"
    );
  });
});
