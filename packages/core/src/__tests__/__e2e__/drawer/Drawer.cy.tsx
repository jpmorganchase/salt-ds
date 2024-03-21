import { composeStories } from "@storybook/react";
import * as drawerStories from "@stories/drawer/drawer.stories";

const composedStories = composeStories(drawerStories);

const { Default, OptionalCloseAction } = composedStories;

describe("GIVEN a Drawer", () => {
  describe("WHEN a drawer with close button is open", () => {
    it("THEN it should close on close button click or outside Drawer click", () => {
      cy.spy(console, "log").as("consoleSpy");

      cy.mount(<Default />);

      cy.findByRole("button", { name: "Open Primary Drawer" }).realClick();
      cy.findByTestId("scrim").should("exist");
      cy.findByRole("dialog").should("be.visible");
      cy.get("@consoleSpy").should("have.callCount", 1); // Strict mode unmounting
      cy.findByRole("button", { name: "Close Drawer" }).click();
      cy.findByRole("dialog").should("not.exist");
      cy.get("@consoleSpy").should("have.callCount", 2); // Test unmount regression #3153

      cy.findByRole("button", { name: "Open Secondary Drawer" }).realClick();
      cy.findByRole("dialog").should("be.visible");
      cy.get(".saltScrim").realClick();
      cy.findByRole("dialog").should("not.exist");
    });

    it("THEN it should dismiss on Esc key press", () => {
      cy.mount(<Default disableScrim />);

      cy.findByRole("button", { name: "Open Primary Drawer" }).realClick();
      cy.findByRole("dialog").should("be.visible");
      cy.findByTestId("scrim").should("not.exist"); // disableScrim
      cy.realPress("Escape");
      cy.findByRole("dialog").should("not.exist");
    });

    it("THEN it should trap focus within Drawer once opened", () => {
      cy.mount(<Default />);

      cy.findByRole("button", { name: "Open Primary Drawer" }).realClick();
      cy.findByRole("dialog").should("be.visible");
      cy.findByRole("button", { name: "Close Drawer" }).should("be.focused");
      cy.realPress("Tab");
      cy.realPress("Tab");
      cy.realPress("Tab");
      cy.findByRole("button", { name: "Close Drawer" }).should("be.focused");
    });
  });

  describe("WHEN a drawer without close button is open", () => {
    it("THEN it should close on outside Drawer click or Esc key press", () => {
      cy.mount(<OptionalCloseAction />);

      cy.findByRole("button", { name: "Open Drawer" }).realClick();
      cy.findByRole("dialog").should("be.visible");
      cy.get(".saltScrim").realClick();
      cy.findByRole("dialog").should("not.exist");

      cy.findByRole("button", { name: "Open Drawer" }).realClick();
      cy.findByRole("dialog").should("be.visible");
      cy.realPress("Escape");
      cy.findByRole("dialog").should("not.exist");
    });

    it("THEN it should trap focus within Drawer once opened", () => {
      cy.mount(<OptionalCloseAction />);

      cy.findByRole("button", { name: "Open Drawer" }).realClick();
      cy.findByRole("dialog").should("be.visible");
      cy.realPress("Tab");
      cy.realPress("Tab");
      cy.realPress("Tab");
      cy.realPress("Tab");
      cy.realPress("Tab");
      cy.realPress("Tab");
      cy.realPress("Tab");
      cy.findByRole("textbox", { name: "House no." }).should("be.focused");
    });

    it("THEN focus goes into the first focusable element within Drawer", () => {
      cy.mount(<OptionalCloseAction />);

      cy.findByRole("button", { name: "Open Drawer" }).realClick();
      cy.findByRole("dialog").should("be.visible");
      cy.findByRole("textbox", { name: "House no." }).should("be.focused");
    });

    it("THEN it closes Drawer when an element is configured to close it", () => {
      cy.mount(<OptionalCloseAction />);

      cy.findByRole("button", { name: "Open Drawer" }).realClick();
      cy.findByRole("dialog").should("be.visible");
      cy.findByRole("button", { name: "Submit" }).click();
      cy.findByRole("dialog").should("not.be.visible");
    });
  });
});
