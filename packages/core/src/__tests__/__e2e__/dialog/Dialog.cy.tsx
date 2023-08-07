import { composeStories } from "@storybook/testing-react";
import * as drawerStories from "@stories/dialog/dialog.stories";

const composedStories = composeStories(drawerStories);

const { Default } = composedStories;

describe("GIVEN a Drawer", () => {
  describe("WHEN no props are provided", () => {
    it("THEN it should display an overlay by default", () => {
      cy.mount(<Default />);

      cy.get(".saltDialog-overlay").should("be.visible");
      cy.findByRole("dialog").should("be.visible");
      cy.findAllByRole("button").eq(0).should("be.focused");
    });
  });

  describe("WHEN Esc key is pressed", () => {
    it("THEN it should close the Dialog", () => {
      cy.mount(<Default />);

      cy.get(".saltDialog-overlay").should("be.visible");
      cy.findAllByRole("button").eq(0).should("be.focused");

      cy.realPress("Escape");

      cy.get(".saltDialog-overlay").should("not.exist");
      cy.findByRole("dialog").should("not.exist");
    });

    // it("THEN it should return focus to button that opened it", () => {
    //   cy.mount(<Default open={false} />);

    //   cy.findByRole("button", { name: /Open Dialog/gi }).click();

    //   cy.findByRole("dialog").should("be.visible");

    //   cy.realPress("Escape");

    //   cy.findByRole("dialog").should("not.exist");
    //   // TODO: fix, this is flakey
    //   cy.findByRole("button", { name: /Open Dialog/gi }).should("be.focused");
    // });
  });

  describe("WHEN Tab key is repeatedly pressed", () => {
    it("THEN it should trap focus inside the Dialog", () => {
      cy.mount(<Default />);

      cy.findByRole("dialog").should("be.visible");
      cy.findAllByRole("button").eq(0).should("be.focused");

      cy.realPress("Tab");
      cy.findAllByRole("button").eq(1).should("be.focused");
      cy.realPress("Tab");
      cy.findAllByRole("button").eq(2).should("be.focused");
      cy.realPress("Tab");
      cy.findAllByRole("button")
        .eq(3)
        .should("be.focused")
        .should("have.attr", "aria-label", "Close dialog");

      cy.realPress("Tab");
      // back to the first button
      cy.findAllByRole("button").eq(0).should("be.focused");
    });
  });

  describe("WHEN close button is pressed", () => {
    it("THEN it close the Dialog", () => {
      cy.mount(<Default />);

      cy.findByRole("dialog").should("be.visible");

      cy.findAllByRole("button", {
        name: /Close dialog/gi,
      }).click();

      cy.findByRole("dialog").should("not.exist");
    });
  });
});
