import * as skipLinkStories from "@stories/skip-link/skip-link.stories";
import { composeStories } from "@storybook/react";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(skipLinkStories);
const { Default } = composedStories;

describe("GIVEN a SkipLink", () => {
  checkAccessibility(composedStories);
  describe("WHEN there is a single SkipLink", () => {
    it("THEN it should move focus to the target element when clicked", () => {
      cy.mount(<Default />);
      cy.findByText(
        "Click here and press the Tab key to see the Skip Link",
      ).click();
      cy.findByRole("link", { name: "Skip to main content" }).should(
        "not.be.visible",
      );
      cy.realPress("Tab");
      cy.findByRole("link", { name: "Skip to main content" }).should(
        "be.visible",
      );
      cy.findByRole("link", { name: "Skip to main content" }).should(
        "be.focused",
      );
      cy.findByRole("link", { name: "Skip to main content" }).click();
      cy.get("#main").should("be.focused");
      cy.findByRole("link", { name: "Skip to main content" }).should(
        "not.be.visible",
      );
    });
    it("THEN it should move focus to the target element when navigating with keyboard", () => {
      cy.mount(<Default />);
      cy.findByText(
        "Click here and press the Tab key to see the Skip Link",
      ).click();
      cy.findByRole("link", { name: "Skip to main content" }).should(
        "not.be.visible",
      );
      cy.realPress("Tab");
      cy.findByRole("link", { name: "Skip to main content" }).should(
        "be.visible",
      );
      cy.findByRole("link", { name: "Skip to main content" }).should(
        "be.focused",
      );
      cy.realPress(" ");
      cy.get("#main").should("be.focused");
      cy.findByRole("link", { name: "Skip to main content" }).should(
        "not.be.visible",
      );
    });

    it("THEN it should hide the skip link if ref is broken", () => {
      cy.mount(<Default targetId="" />);
      cy.findByText(
        "Click here and press the Tab key to see the Skip Link",
      ).click();
      cy.realPress("Tab");
      cy.findByRole("link", { name: "Skip to main content" }).should(
        "not.exist",
      );
    });
  });
});
