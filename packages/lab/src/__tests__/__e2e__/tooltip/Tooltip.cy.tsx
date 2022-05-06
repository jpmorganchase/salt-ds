import * as tooltipStories from "@stories/tooltip.stories";
import { composeStories } from "@storybook/testing-react";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(tooltipStories);

const { Default, OpenTooltip } = composedStories;

describe("GIVEN a Tooltip", () => {
  checkAccessibility(composedStories);

  it('should have the aria role "tooltip"', () => {
    cy.mount(<OpenTooltip />);
    cy.findByRole("tooltip").should("exist");
  });

  describe("When the tooltip is shown by focus", () => {
    it("should be dismissible with Escape", () => {
      cy.mount(<Default />);

      cy.findByRole("button").focus();

      cy.findByRole("tooltip").should("be.visible");
      cy.realPress("Escape");
      cy.findByRole("tooltip").should("not.exist");
    });
  });

  it("should stay open if the popper element is hovered", () => {
    cy.mount(<Default />);

    cy.findByRole("button").realHover();

    cy.findByRole("tooltip").should("be.visible");

    cy.findByRole("tooltip").realHover();

    cy.findByRole("tooltip").should("be.visible");
  });
});
