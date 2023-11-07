import { composeStories } from "@storybook/react";
import * as dropdownNextStories from "@stories/dropdown-next/dropdown-next.stories";

import { CustomFloatingComponentProvider, FLOATING_TEST_ID } from "../common";

const {
  Default,
  Readonly,
  Disabled,
  DisabledOption,
  MultiSelect,
  WithFormField,
  Grouped,
  ComplexOption,
  CustomValue,
  WithDefaultSelected,
} = composeStories(dropdownNextStories);

describe("Given a Dropdown", () => {
  it("should be able to select an option with a mouse", () => {
    const selectionChangeSpy = cy.stub().as("selectionChange");
    cy.mount(<Default onSelectionChange={selectionChangeSpy} />);

    cy.findByRole("combobox").realClick();
    cy.findByRole("combobox").should("be.focused");

    cy.findByRole("option", { name: "Alabama" }).realClick();

    cy.findByRole("combobox").should("be.focused");
    cy.findByRole("combobox").should("have.text", "Alabama");
    cy.get("@selectionChange").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      Cypress.sinon.match.array.deepEquals(["Alabama"])
    );
  });

  it("should be able to select an option with a keyboard", () => {
    const selectionChangeSpy = cy.stub().as("selectionChange");
    cy.mount(<Default onSelectionChange={selectionChangeSpy} />);

    cy.findByRole("combobox").realClick();

    cy.findByRole("option", { name: "Alabama" }).should("be.activeDescendant");
    cy.realPress("ArrowDown");
    cy.findByRole("option", { name: "Alaska" }).should("be.activeDescendant");
    cy.realPress("Enter");

    cy.findByRole("combobox").should("be.focused");
    cy.findByRole("combobox").should("have.text", "Alaska");
    cy.get("@selectionChange").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      Cypress.sinon.match.array.deepEquals(["Alaska"])
    );
  });

  it("should be able to quick-select an option with Enter", () => {
    const selectionChangeSpy = cy.stub().as("selectionChange");
    cy.mount(<Default onSelectionChange={selectionChangeSpy} />);

    cy.findByRole("combobox").realClick();

    cy.findByRole("option", { name: "Alabama" }).should("be.activeDescendant");
    cy.realPress("Enter");

    cy.findByRole("combobox").should("be.focused");
    cy.findByRole("combobox").should("have.text", "Alabama");
    cy.get("@selectionChange").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      Cypress.sinon.match.array.deepEquals(["Alabama"])
    );
  });

  it("should be able to quick-select an option with Tab", () => {
    const selectionChangeSpy = cy.stub().as("selectionChange");
    cy.mount(<Default onSelectionChange={selectionChangeSpy} />);

    cy.findByRole("combobox").realClick();

    cy.findByRole("option", { name: "Alabama" }).should("be.activeDescendant");
    cy.realPress("Tab");

    cy.findByRole("combobox").should("not.be.focused");
    cy.findByRole("combobox").should("have.text", "Alabama");
    cy.get("@selectionChange").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      Cypress.sinon.match.array.deepEquals(["Alabama"])
    );
  });

  it("should open the list when clicked", () => {
    cy.mount(<Default />);

    cy.findByRole("combobox").should("have.attr", "aria-expanded", "false");
    cy.findByRole("combobox").realClick();
    cy.findByRole("listbox").should("exist");
    cy.findByRole("combobox").should("have.attr", "aria-expanded", "true");
  });

  it("should close the list when clicked outside", () => {
    const openChangeSpy = cy.stub().as("openChange");
    cy.mount(<Default onOpenChange={openChangeSpy} />);

    cy.findByRole("combobox").realClick();
    cy.get("@openChange").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      true
    );
    cy.findByRole("listbox").should("exist");
    cy.get("body").click(0, 0);
    cy.findByRole("listbox").should("not.exist");
    cy.get("@openChange").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      false
    );
  });

  it("should close the list when the escape key is pressed", () => {
    cy.mount(<Default />);

    cy.findByRole("combobox").realClick();
    cy.findByRole("listbox").should("exist");
    cy.realPress("Escape");
    cy.findByRole("listbox").should("not.exist");
  });

  it("should not open the list when focused via keyboard", () => {
    cy.mount(<Default />);

    cy.realPress("Tab");
    cy.findByRole("combobox").should("be.focused");
    cy.findByRole("listbox").should("not.exist");
    cy.findByRole("combobox").should("have.attr", "aria-expanded", "false");
  });

  it("should focus the first item when the down arrow is pressed", () => {
    cy.mount(<Default />);

    cy.realPress("Tab");
    cy.realPress("ArrowDown");
    cy.findByRole("option", { name: "Alabama" }).should("be.activeDescendant");
  });

  it("should focus the last item when the up arrow is pressed", () => {
    cy.mount(<Default />);

    cy.realPress("Tab");
    cy.realPress("ArrowUp");
    cy.findByRole("option", { name: "Georgia" }).should("be.activeDescendant");
  });

  it("should support keyboard navigation", () => {
    cy.mount(<Default />);

    cy.findByRole("combobox").realClick();
    cy.findByRole("listbox").should("exist");
    cy.findAllByRole("option").eq(0).should("be.activeDescendant");

    // should not wrap
    cy.realPress(["ArrowUp"]);
    cy.findAllByRole("option").eq(0).should("be.activeDescendant");

    cy.realPress(["ArrowDown"]);
    cy.findAllByRole("option").eq(1).should("be.activeDescendant");

    // should try to go down 10, but only 9 items in list
    cy.realPress(["PageDown"]);
    cy.findAllByRole("option").eq(-1).should("be.activeDescendant");

    // should not wrap
    cy.realPress(["ArrowDown"]);
    cy.findAllByRole("option").eq(-1).should("be.activeDescendant");

    // should try to go up 10, but only 9 items in list
    cy.realPress(["PageUp"]);
    cy.findAllByRole("option").eq(0).should("be.activeDescendant");

    // should go to the last item
    cy.realPress(["End"]);
    cy.findAllByRole("option").eq(-1).should("be.activeDescendant");

    cy.realPress(["ArrowUp"]);
    cy.findAllByRole("option").eq(-2).should("be.activeDescendant");

    // should go to the first item
    cy.realPress(["Home"]);
    cy.findAllByRole("option").eq(0).should("be.activeDescendant");
  });

  it("should not allow the value to be changed when it is readonly", () => {
    cy.mount(<Readonly />);
    cy.findByRole("combobox").should("have.attr", "aria-readonly", "true");
    cy.findByRole("combobox").should("have.text", "California");
    cy.findByRole("combobox").realClick();

    cy.findByRole("combobox").should("be.focused");
    cy.findByRole("listbox").should("not.exist");

    cy.realType("abc");
    cy.findByRole("combobox").should("have.text", "California");
  });

  it("should not receive focus if it is disabled", () => {
    cy.mount(
      <div>
        <button>start</button>
        <Disabled />
        <button>end</button>
      </div>
    );
    cy.findByRole("combobox").should("be.disabled");
    cy.realPress("Tab");
    cy.findByRole("button", { name: "start" }).should("be.focused");
    cy.realPress("Tab");
    cy.findByRole("combobox").should("not.be.focused");
    cy.findByRole("button", { name: "end" }).should("be.focused");
  });

  it("should not allow you to select a disabled option", () => {
    const selectionChangeSpy = cy.stub().as("selectionChange");
    cy.mount(<DisabledOption onSelectionChange={selectionChangeSpy} />);
    cy.findByRole("combobox").realClick();
    cy.findByRole("option", { name: "California" }).should(
      "have.attr",
      "aria-disabled",
      "true"
    );
    cy.realType("California");
    cy.realPress("Enter");
    cy.get("@selectionChange").should("not.have.been.called");
    cy.findByRole("option", { name: "California" }).realClick();
    cy.get("@selectionChange").should("not.have.been.called");
  });

  it("should allow multiple options to be selected with a mouse", () => {
    const selectionChangeSpy = cy.stub().as("selectionChange");
    cy.mount(<MultiSelect onSelectionChange={selectionChangeSpy} />);
    cy.findByRole("combobox").should(
      "have.attr",
      "aria-multiselectable",
      "true"
    );
    cy.findByRole("combobox").realClick();
    cy.findByRole("option", { name: "Alabama" }).realClick();
    cy.get("@selectionChange").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      Cypress.sinon.match.array.deepEquals(["Alabama"])
    );
    cy.findByRole("option", { name: "Alabama" }).should("be.ariaSelected");
    cy.findByRole("option", { name: "Alaska" }).realClick();
    cy.get("@selectionChange").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      Cypress.sinon.match.array.deepEquals(["Alabama", "Alaska"])
    );
    cy.findByRole("option", { name: "Alaska" }).should("be.ariaSelected");
    cy.findByRole("listbox").should("exist");
    cy.findByRole("combobox").should("have.text", "Alabama, Alaska");
  });

  it("should allow multiple options to be selected with the keyboard", () => {
    const selectionChangeSpy = cy.stub().as("selectionChange");
    cy.mount(<MultiSelect onSelectionChange={selectionChangeSpy} />);
    cy.realPress("Tab");
    cy.realPress("ArrowDown");
    cy.realPress(" ");
    cy.get("@selectionChange").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      Cypress.sinon.match.array.deepEquals(["Alabama"])
    );
    cy.findByRole("option", { name: "Alabama" }).should("be.ariaSelected");
    cy.realPress("ArrowDown");
    cy.realPress("Enter");
    cy.get("@selectionChange").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      Cypress.sinon.match.array.deepEquals(["Alabama", "Alaska"])
    );
    cy.findByRole("listbox").should("not.exist");
    cy.findByRole("combobox").should("have.text", "Alabama, Alaska");
  });

  it("should have form field support", () => {
    cy.mount(<WithFormField />);
    cy.findByRole("combobox").should("have.accessibleName", "State");
    cy.findByRole("combobox").should(
      "have.accessibleDescription",
      "Pick a US state"
    );
  });

  it("should support grouping", () => {
    cy.mount(<Grouped />);
    cy.findByRole("combobox").realClick();
    cy.findByRole("group", { name: "US" }).should("exist");
    cy.findByRole("group", { name: "US" })
      .findByRole("option", { name: "New York" })
      .should("exist");
  });

  it("should support complex options", () => {
    cy.mount(<ComplexOption />);
    cy.findByRole("combobox").realClick();
    cy.findByRole("option", { name: "United States of America" }).should(
      "exist"
    );
  });

  it("should allow value to be controlled", () => {
    cy.mount(<CustomValue />);
    cy.findByRole("combobox").realClick();
    cy.findByRole("option", { name: "Alabama" }).realClick();
    cy.findByRole("combobox").should("have.text", "Alabama");
    cy.findByRole("option", { name: "Alaska" }).realClick();
    cy.findByRole("combobox").should("have.text", "2 items selected");
  });

  it("should allow default selected options to be set", () => {
    const selectionChangeSpy = cy.stub().as("selectionChange");
    cy.mount(<WithDefaultSelected onSelectionChange={selectionChangeSpy} />);
    cy.findByRole("combobox").should("have.text", "California");
    cy.findByRole("combobox").realClick();
    cy.findByRole("option", { name: "California" }).should("be.ariaSelected");
    cy.findByRole("option", { name: "Alabama" }).realClick();
    cy.findByRole("combobox").should("be.focused");
    cy.findByRole("combobox").should("have.text", "Alabama");
    cy.get("@selectionChange").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      Cypress.sinon.match.array.deepEquals(["Alabama"])
    );
  });

  it("should support being set to required", () => {
    cy.mount(<Default required />);
    cy.findByRole("combobox").should("have.attr", "aria-required", "true");
  });

  it("should allow a default open state", () => {
    cy.mount(<Default defaultOpen />);
    cy.findByRole("combobox").should("have.attr", "aria-expanded", "true");
    cy.findByRole("listbox").should("exist");
    cy.findByRole("combobox").realClick();
    cy.findByRole("combobox").should("have.attr", "aria-expanded", "false");
    cy.findByRole("listbox").should("not.exist");
  });

  it("should allow a controlled open state", () => {
    cy.mount(<Default open />);
    cy.findByRole("combobox").should("have.attr", "aria-expanded", "true");
    cy.findByRole("listbox").should("exist");
    cy.findByRole("combobox").realClick();
    cy.findByRole("combobox").should("have.attr", "aria-expanded", "true");
    cy.findByRole("listbox").should("exist");
  });

  it("should render the custom floating component", () => {
    cy.mount(
      <CustomFloatingComponentProvider>
        <Default open />
      </CustomFloatingComponentProvider>
    );

    cy.findByTestId(FLOATING_TEST_ID).should("exist");
  });
});
