import { composeStories } from "@storybook/react";
import * as menuStories from "@stories/menu/menu.stories";
import { CustomFloatingComponentProvider, FLOATING_TEST_ID } from "../common";

const { SingleLevel, MultiLevel, GroupedItems, IconWithGroups } =
  composeStories(menuStories);

describe("Given a Menu", () => {
  it("should show a menu and perform an action with a mouse", () => {
    const openChangeSpy = cy.stub().as("openChangeSpy");
    cy.mount(<SingleLevel onOpenChange={openChangeSpy} />);
    cy.findByRole("menu").should("not.exist");
    cy.findByRole("button", { name: "Open Menu" }).realClick();
    cy.findByRole("menu").should("exist");
    cy.get("@openChangeSpy").should("have.been.calledWith", true);
    cy.findByRole("menuitem", { name: "Copy" }).realClick();
    cy.on("window:alert", (str) => {
      expect(str).to.equal("Copy");
    });
    cy.findByRole("menu").should("not.exist");
    cy.get("@openChangeSpy").should("have.been.calledWith", false);
  });

  it("should show a menu and perform an action with a keyboard", () => {
    const openChangeSpy = cy.stub().as("openChangeSpy");
    cy.mount(<SingleLevel onOpenChange={openChangeSpy} />);
    cy.findByRole("menu").should("not.exist");
    cy.findByRole("button", { name: "Open Menu" }).focus();
    cy.realPress("Enter");
    cy.findByRole("menu").should("exist");
    cy.get("@openChangeSpy").should("have.been.calledWith", true);
    cy.findByRole("menuitem", { name: "Copy" }).should("be.focused");
    cy.realPress("Enter");
    cy.on("window:alert", (str) => {
      expect(str).to.equal("Copy");
    });
    cy.findByRole("menu").should("not.exist");
    cy.get("@openChangeSpy").should("have.been.calledWith", false);
  });

  it("should close a menu when space is pressed on a focused menu item", () => {
    const openChangeSpy = cy.stub().as("openChangeSpy");
    cy.mount(<SingleLevel onOpenChange={openChangeSpy} />);
    cy.findByRole("menu").should("not.exist");
    cy.findByRole("button", { name: "Open Menu" }).focus();
    cy.realPress("Enter");
    cy.findByRole("menu").should("exist");
    cy.get("@openChangeSpy").should("have.been.calledWith", true);
    cy.findByRole("menuitem", { name: "Copy" }).should("be.focused");
    cy.realPress("Space");
    cy.on("window:alert", (str) => {
      expect(str).to.equal("Copy");
    });
    cy.findByRole("menu").should("not.exist");
    cy.get("@openChangeSpy").should("have.been.calledWith", false);
  });

  it("should close a menu when escape is pressed", () => {
    const openChangeSpy = cy.stub().as("openChangeSpy");
    cy.mount(<SingleLevel onOpenChange={openChangeSpy} />);
    cy.findByRole("menu").should("not.exist");
    cy.findByRole("button", { name: "Open Menu" }).focus();
    cy.realPress("Enter");
    cy.findByRole("menu").should("exist");
    cy.get("@openChangeSpy").should("have.been.calledWith", true);
    cy.realPress("Escape");
    cy.findByRole("menu").should("not.exist");
    cy.get("@openChangeSpy").should("have.been.calledWith", false);
  });

  it("should support keyboard navigation", () => {
    cy.mount(<SingleLevel />);
    cy.findByRole("button", { name: "Open Menu" }).realClick();
    cy.findByRole("menu").should("be.focused");
    cy.realPress("ArrowDown");
    cy.findByRole("menuitem", { name: "Copy" }).should("be.focused");
    cy.realPress("ArrowDown");
    cy.findByRole("menuitem", { name: "Paste" }).should("be.focused");
    cy.realPress("ArrowUp");
    cy.findByRole("menuitem", { name: "Copy" }).should("be.focused");
    cy.realPress("End");
    cy.findByRole("menuitem", { name: "Settings" }).should("be.focused");

    // focus should not wrap
    cy.realPress("ArrowDown");
    cy.findByRole("menuitem", { name: "Settings" }).should("be.focused");

    cy.realPress("Home");
    cy.findByRole("menuitem", { name: "Copy" }).should("be.focused");

    // focus should not wrap
    cy.realPress("ArrowUp");
    cy.findByRole("menuitem", { name: "Copy" }).should("be.focused");
  });

  it("should support nested menus", () => {
    cy.mount(<MultiLevel />);
    cy.findByRole("button", { name: "Open Menu" }).realClick();
    cy.findByRole("menuitem", { name: "Edit styling" }).should(
      "have.attr",
      "aria-expanded",
      "false"
    );
    cy.findByRole("menuitem", { name: "Edit styling" }).realHover();
    cy.findByRole("menuitem", { name: "Edit styling" }).should(
      "have.attr",
      "aria-expanded",
      "true"
    );
    cy.findByRole("menuitem", { name: "Column" }).should("exist");
    cy.findByRole("menuitem", { name: "Cell" }).should("exist");
    cy.findByRole("menuitem", { name: "Row" }).should("exist");
    cy.findByRole("menuitem", { name: "Column" }).realHover();
    cy.findByRole("menuitem", { name: "Edit styling" }).should(
      "have.class",
      "saltMenuItem-blurActive"
    );
    cy.findByRole("menuitem", { name: "Column" }).realClick();
    cy.on("window:alert", (str) => {
      expect(str).to.equal("Column");
    });
    cy.findByRole("menu").should("not.exist");
  });

  it("should close nested menus when the mouse leaves the menu", () => {
    cy.mount(<MultiLevel />);
    cy.findByRole("button", { name: "Open Menu" }).realClick();
    cy.findAllByRole("menu").should("have.length", 1);
    cy.findByRole("menuitem", { name: "Edit styling" }).realHover();
    cy.findAllByRole("menu").should("have.length", 2);
    cy.findByRole("menuitem", { name: "Copy" }).realHover();
    cy.findAllByRole("menu").should("have.length", 1);
  });

  it("should support nested keyboard navigation", () => {
    cy.mount(<MultiLevel />);
    cy.findByRole("button", { name: "Open Menu" }).focus();
    cy.realPress("Enter");
    cy.findByRole("menuitem", { name: "Edit styling" }).focus();
    cy.realPress("ArrowRight");
    cy.findByRole("menuitem", { name: "Column" }).should("be.focused");
    cy.realPress("ArrowDown");
    cy.findByRole("menuitem", { name: "Cell" }).should("be.focused");
    cy.realPress("ArrowLeft");
    cy.findByRole("menuitem", { name: "Edit styling" }).should("be.focused");
  });

  it("should support groups", () => {
    cy.mount(<GroupedItems open />);
    cy.findByRole("group", { name: "Actions" }).should("exist");
    cy.findByRole("group", { name: "Styling" }).should("exist");
    cy.findByRole("group", { name: "Configurations" }).should("exist");
  });

  it("should support disabled items", () => {
    cy.mount(<IconWithGroups />);
    cy.findByRole("button", { name: "Open Menu" }).realClick();
    cy.findByRole("menuitem", { name: "Paste" }).should(
      "have.attr",
      "aria-disabled"
    );
    cy.findByRole("menuitem", { name: "Paste" }).realClick();
    cy.findByRole("menu").should("exist");
    cy.findByRole("menuitem", { name: "Paste" }).should("not.be.focused");
  });

  it("should focus items on hover", () => {
    cy.mount(<SingleLevel open />);
    cy.findByRole("menuitem", { name: "Paste" }).realHover();
    cy.findByRole("menuitem", { name: "Paste" }).should("have.focus");
  });

  it("should support open being uncontrolled", () => {
    cy.mount(<SingleLevel defaultOpen />);
    cy.findByRole("menu").should("exist");
    cy.findByRole("button", { name: "Open Menu" }).realClick();
    cy.findByRole("menu").should("not.exist");
  });

  it("should support open being controlled", () => {
    cy.mount(<SingleLevel open />);
    cy.findByRole("menu").should("exist");
    cy.findByRole("button", { name: "Open Menu" }).realClick();
    cy.findByRole("menu").should("exist");
  });

  it("should render the custom floating component", () => {
    cy.mount(
      <CustomFloatingComponentProvider>
        <SingleLevel open />
      </CustomFloatingComponentProvider>
    );

    cy.findByTestId(FLOATING_TEST_ID).should("exist");
  });
});
