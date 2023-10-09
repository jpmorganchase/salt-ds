import { composeStories } from "@storybook/react";
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

  describe("WHEN close button is clicked", () => {
    it("THEN it should close the Dialog", () => {
      cy.mount(<Default />);

      cy.findByRole("dialog").should("be.visible");

      cy.findAllByRole("button", {
        name: /Close dialog/gi,
      }).click();

      cy.findByRole("dialog").should("not.exist");
    });
  });

  describe("WHEN a number is passed as initialFocus prop", () => {
    it("THEN it should focus the button at that index", () => {
      cy.mount(<Default initialFocus={1} />);

      cy.findByRole("dialog").should("be.visible");
      cy.findAllByRole("button").eq(1).should("be.focused");
    });
  });

  describe("WHEN a status is passed", () => {
    it("THEN it should add the status to the dialog", () => {
      cy.mount(<Default status="error" />);

      cy.findByRole("dialog").should("be.visible");
      cy.findByRole("dialog").should("have.class", "saltDialog-error");
      cy.findByRole("img", { name: "error" }).should("exist");
    });

    it("THEN it should render a StatusIcon with that status", () => {
      cy.mount(<Default status="error" />);

      cy.findByRole("dialog").should("be.visible");
      cy.findByRole("img", { name: "error" }).should("exist");
    });
  });
});
