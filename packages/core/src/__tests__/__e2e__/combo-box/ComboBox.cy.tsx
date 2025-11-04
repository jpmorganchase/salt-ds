import { ComboBox, Option } from "@salt-ds/core";
import * as comboBoxStories from "@stories/combo-box/combo-box.stories";
import { composeStories } from "@storybook/react-vite";
import { type KeyboardEventHandler, useRef, useState } from "react";
import { CustomFloatingComponentProvider, FLOATING_TEST_ID } from "../common";

const {
  Default,
  Readonly,
  WithDefaultSelected,
  Disabled,
  DisabledOption,
  Multiselect,
  WithFormField,
  Grouped,
  EmptyMessage,
  ComplexOption,
  ObjectValue,
  MultiplePills,
  MultiplePillsTruncated,
  SelectOnTab,
  LongList,
  PerformanceTest,
} = composeStories(comboBoxStories);

describe("Given a ComboBox", () => {
  it("should be able to filter and select an option with a mouse", () => {
    const selectionChangeSpy = cy.stub().as("selectionChange");
    cy.mount(<Default onSelectionChange={selectionChangeSpy} />);

    cy.findByRole("combobox").realClick();
    cy.findByRole("combobox").should("be.focused");

    cy.realType("Ala");

    cy.findByRole("option", { name: "Alaska" }).realHover();
    cy.findByRole("option", { name: "Alaska" }).should("be.activeDescendant");
    cy.findByRole("option", { name: "Alaska" }).realClick();

    cy.findByRole("combobox").should("be.focused");
    cy.findByRole("combobox").should("have.value", "Alaska");
    cy.get("@selectionChange").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      Cypress.sinon.match.array.deepEquals(["Alaska"]),
    );
  });

  it("should be able to filter and select an option with a keyboard", () => {
    const selectionChangeSpy = cy.stub().as("selectionChange");
    cy.mount(<Default onSelectionChange={selectionChangeSpy} />);

    cy.findByRole("combobox").realClick();

    cy.realType("Ala");
    cy.findByRole("option", { name: "Alabama" }).should("be.activeDescendant");
    cy.realPress("ArrowDown");
    cy.findByRole("option", { name: "Alaska" }).should("be.activeDescendant");
    cy.realPress("Enter");

    cy.findByRole("combobox").should("be.focused");
    cy.findByRole("combobox").should("have.value", "Alaska");
    cy.get("@selectionChange").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      Cypress.sinon.match.array.deepEquals(["Alaska"]),
    );
  });

  it("single select should be able to filter and select an option with a Tab key press by default", () => {
    const selectionChangeSpy = cy.stub().as("selectionChange");
    cy.mount(<Default onSelectionChange={selectionChangeSpy} />);
    cy.findByRole("combobox").realClick();
    cy.realType("Ala");
    cy.findByRole("option", { name: "Alabama" }).should("be.activeDescendant");
    cy.realPress("Tab");
    cy.findByRole("combobox").should("have.value", "Alabama");
    cy.get("@selectionChange").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      Cypress.sinon.match.array.deepEquals(["Alabama"]),
    );
  });

  it("single select should be able to filter and select an option with a Tab key press when selectOnTab is passed as true", () => {
    const selectionChangeSpy = cy.stub().as("selectionChange");
    cy.mount(<Default selectOnTab onSelectionChange={selectionChangeSpy} />);
    cy.findByRole("combobox").realClick();
    cy.realType("Ala");
    cy.realPress("Tab");
    cy.findByRole("combobox").should("have.value", "Alabama");
    cy.get("@selectionChange").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      Cypress.sinon.match.array.deepEquals(["Alabama"]),
    );
  });

  it("single select should not be able to filter and select an option with a Tab key press when selectOnTab is passed as false", () => {
    const selectionChangeSpy = cy.stub().as("selectionChange");
    cy.mount(
      <Default selectOnTab={false} onSelectionChange={selectionChangeSpy} />,
    );
    cy.findByRole("combobox").realClick();
    cy.realType("Ala");
    cy.realPress("Tab");
    cy.get("@selectionChange").should("not.have.been.called");
  });

  it("should be able to filter and select quick-select an option with Enter", () => {
    const selectionChangeSpy = cy.stub().as("selectionChange");
    cy.mount(<Default onSelectionChange={selectionChangeSpy} />);

    cy.findByRole("combobox").realClick();

    cy.findByRole("option", { name: "Alabama" }).should("be.activeDescendant");
    cy.realType("C");
    cy.findByRole("option", { name: "California" }).should(
      "be.activeDescendant",
    );
    cy.realPress("Enter");

    cy.findByRole("combobox").should("be.focused");
    cy.findByRole("combobox").should("have.value", "California");
    cy.get("@selectionChange").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      Cypress.sinon.match.array.deepEquals(["California"]),
    );
  });

  it("should be able to filter and select quick-select an option with Tab", () => {
    const selectionChangeSpy = cy.stub().as("selectionChange");
    cy.mount(<Default onSelectionChange={selectionChangeSpy} />);

    cy.findByRole("combobox").realClick();

    cy.findByRole("option", { name: "Alabama" }).should("be.activeDescendant");
    cy.realType("C");
    cy.findByRole("option", { name: "California" }).should(
      "be.activeDescendant",
    );
    cy.realPress("Tab");

    cy.findByRole("combobox").should("not.be.focused");
    cy.findByRole("combobox").should("have.value", "California");
    cy.get("@selectionChange").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      Cypress.sinon.match.array.deepEquals(["California"]),
    );
  });

  it("should open and close when clicking the button", () => {
    cy.mount(<Default />);

    cy.findByRole("combobox").should("have.attr", "aria-expanded", "false");
    cy.findByRole("listbox").should("not.exist");
    cy.findByRole("button").realClick();
    cy.findByRole("listbox").should("exist");
    cy.findByRole("combobox").should("have.attr", "aria-expanded", "true");
    cy.findByRole("button").realClick();
    cy.findByRole("listbox").should("not.exist");
    cy.findByRole("combobox").should("have.attr", "aria-expanded", "false");
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
    cy.get("@openChange").should("have.been.calledWith", true);
    cy.findByRole("listbox").should("exist");
    cy.get("body").click(0, 0);
    cy.findByRole("listbox").should("not.exist");
    cy.get("@openChange").should("have.been.calledWith", false);
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

  it("should focus the first item when the down arrow is pressed and no items are selected", () => {
    cy.mount(<Default />);

    cy.realPress("Tab");
    cy.realPress("ArrowDown");
    cy.findByRole("option", { name: "Alabama" }).should("be.activeDescendant");
  });

  it("should focus the last item when the up arrow is pressed and no items are selected", () => {
    cy.mount(<Default />);

    cy.realPress("Tab");
    cy.realPress("ArrowUp");
    cy.findByRole("option", { name: "Georgia" }).should("be.activeDescendant");
  });

  it("should focus the selected item when the down arrow is pressed and items are selected", () => {
    cy.mount(<WithDefaultSelected />);

    cy.realPress("Tab");
    cy.realPress("ArrowDown");
    cy.findByRole("option", { name: "California" }).should("be.ariaSelected");
    cy.findByRole("option", { name: "California" }).should(
      "be.activeDescendant",
    );
  });

  it("should focus the selected item when the up arrow is pressed and items are selected", () => {
    cy.mount(<WithDefaultSelected />);

    cy.realPress("Tab");
    cy.realPress("ArrowUp");
    cy.findByRole("option", { name: "California" }).should("be.ariaSelected");
    cy.findByRole("option", { name: "California" }).should(
      "be.activeDescendant",
    );
  });

  it("should support keyboard navigation", () => {
    cy.mount(<LongList />);

    cy.findByRole("combobox").realClick();
    cy.findByRole("listbox").should("exist");
    cy.findAllByRole("option").eq(0).should("be.activeDescendant");

    // should not wrap
    cy.realPress(["ArrowUp"]);
    cy.findAllByRole("option").eq(0).should("be.activeDescendant");

    cy.realPress(["ArrowDown"]);
    cy.findAllByRole("option").eq(1).should("be.activeDescendant");

    // should try to go down by the number of visible items in list
    cy.realPress(["PageDown"]);
    cy.findAllByRole("option").eq(11).should("be.activeDescendant");

    // should try to go up by the number of visible items in list
    cy.realPress(["PageUp"]);
    cy.findAllByRole("option").eq(1).should("be.activeDescendant");

    // should go to the last item
    cy.realPress(["End"]);
    cy.findAllByRole("option").eq(-1).should("be.activeDescendant");

    // should not wrap
    cy.realPress(["ArrowDown"]);
    cy.findAllByRole("option").eq(-1).should("be.activeDescendant");

    cy.realPress(["ArrowUp"]);
    cy.findAllByRole("option").eq(-2).should("be.activeDescendant");

    // should go to the first item
    cy.realPress(["Home"]);
    cy.findAllByRole("option").eq(0).should("be.activeDescendant");
  });

  it("should not allow the value to be changed when it is readonly", () => {
    cy.mount(<Readonly />);
    cy.findByRole("textbox").should("have.attr", "readonly");
    cy.findByRole("textbox").should("have.attr", "aria-readonly", "true");
    cy.findByRole("textbox").should("not.have.attr", "aria-expanded");
    cy.findByRole("textbox").should("not.have.attr", "aria-controls");
    cy.findByRole("textbox").should("have.value", "California");
    cy.findByRole("textbox").realClick();

    cy.findByRole("textbox").should("be.focused");
    cy.findByRole("listbox").should("not.exist");

    cy.realType("abc");
    cy.findByRole("textbox").should("have.value", "California");
  });

  it("should not receive focus via tab if it is disabled", () => {
    cy.mount(
      <div>
        <button>start</button>
        <Disabled />
        <button>end</button>
      </div>,
    );

    cy.findByRole("combobox").should("be.disabled");
    cy.realPress("Tab");
    cy.findByRole("button", { name: "start" }).should("be.focused");
    cy.realPress("Tab");
    cy.findByRole("combobox").should("not.be.focused");
    cy.findByRole("button", { name: "end" }).should("be.focused");
  });

  it("should not receive focus via mouse click if it is disabled", () => {
    cy.mount(<Disabled />);
    cy.findByRole("combobox").realClick();
    // Regression - #3369
    cy.get(".saltComboBox").should("not.have.class", "saltComboBox-focused");

    cy.findByRole("combobox").should("be.disabled").should("not.be.focused");
  });

  it("should not stay focus if disabled after option selection", () => {
    // Regression - #3369
    const DisabledAfterSelection = () => {
      const [disabled, setDisabled] = useState(false);
      const handleSelectionChange = () => {
        setDisabled(true);
      };
      return (
        <Default
          disabled={disabled}
          onSelectionChange={handleSelectionChange}
        />
      );
    };

    cy.mount(<DisabledAfterSelection />);
    cy.realPress("Tab");
    cy.realPress("ArrowDown");
    cy.realPress("Enter");

    cy.get(".saltComboBox").should("not.have.class", "saltComboBox-focused");
    cy.findByRole("combobox").should("be.disabled").should("not.be.focused");
  });

  it("should not allow you to select a disabled option", () => {
    const selectionChangeSpy = cy.stub().as("selectionChange");
    cy.mount(<DisabledOption onSelectionChange={selectionChangeSpy} />);
    cy.findByRole("combobox").realClick();
    cy.findByRole("option", { name: "California" }).should(
      "have.attr",
      "aria-disabled",
      "true",
    );
    cy.realType("California");
    cy.realPress("Enter");
    cy.get("@selectionChange").should("not.have.been.called");
    cy.findByRole("option", { name: "California" }).realClick();
    cy.get("@selectionChange").should("not.have.been.called");
  });

  it("should not allow you to select a disabled option if selectOnTab is true", () => {
    const selectionChangeSpy = cy.stub().as("selectionChange");
    cy.mount(
      <DisabledOption
        selectOnTab
        multiselect
        onSelectionChange={selectionChangeSpy}
      />,
    );
    cy.findByRole("combobox").realClick();
    cy.findByRole("option", { name: "California" }).should(
      "have.attr",
      "aria-disabled",
      "true",
    );
    cy.realType("California");
    cy.realPress("Tab");
    cy.get("@selectionChange").should("not.have.been.called");
  });

  it("should not allow you to select a option on Tab press if list is not open", () => {
    const selectionChangeSpy = cy.stub().as("selectionChange");
    cy.mount(
      <DisabledOption
        open={false}
        selectOnTab
        multiselect
        onSelectionChange={selectionChangeSpy}
      />,
    );
    cy.findByRole("combobox").realClick();
    cy.realType("alabama");
    cy.realPress("Tab");
    cy.get("@selectionChange").should("not.have.been.called");
  });

  it("should allow multiple options to be selected with a mouse", () => {
    const selectionChangeSpy = cy.stub().as("selectionChange");
    cy.mount(<Multiselect onSelectionChange={selectionChangeSpy} />);
    cy.findByRole("combobox").realClick();
    cy.findByRole("listbox").should(
      "have.attr",
      "aria-multiselectable",
      "true",
    );
    cy.findByRole("option", { name: "Alabama" }).realClick();
    cy.get("@selectionChange").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      Cypress.sinon.match.array.deepEquals(["Alabama"]),
    );
    cy.findByRole("option", { name: "Alabama" }).should(
      "have.attr",
      "aria-selected",
      "true",
    );
    cy.findByRole("button", { name: "Remove Alabama" }).should("be.visible");
    cy.findByRole("option", { name: "Alaska" }).realClick();
    cy.get("@selectionChange").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      Cypress.sinon.match.array.deepEquals(["Alabama", "Alaska"]),
    );
    cy.findByRole("option", { name: "Alaska" }).should(
      "have.attr",
      "aria-selected",
      "true",
    );
    cy.findByRole("button", { name: "Remove Alabama" }).should("be.visible");
    cy.findByRole("button", { name: "Remove Alaska" }).should("be.visible");
    cy.findByRole("listbox").should("exist");
    cy.findByRole("combobox").should("have.value", "");
  });

  it("should allow multiple options to be selected with the keyboard", () => {
    const selectionChangeSpy = cy.stub().as("selectionChange");
    cy.mount(<Multiselect onSelectionChange={selectionChangeSpy} />);
    cy.realPress("Tab");
    cy.realPress("ArrowDown");
    cy.realPress("Enter");
    cy.get("@selectionChange").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      Cypress.sinon.match.array.deepEquals(["Alabama"]),
    );
    cy.findByRole("option", { name: "Alabama" }).should(
      "have.attr",
      "aria-selected",
      "true",
    );
    cy.findByRole("button", { name: "Remove Alabama" }).should("be.visible");
    cy.realPress("ArrowDown");
    cy.realPress("Enter");
    cy.get("@selectionChange").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      Cypress.sinon.match.array.deepEquals(["Alabama", "Alaska"]),
    );
    cy.findByRole("option", { name: "Alaska" }).should(
      "have.attr",
      "aria-selected",
      "true",
    );
    cy.findByRole("button", { name: "Remove Alabama" }).should("be.visible");
    cy.findByRole("button", { name: "Remove Alaska" }).should("be.visible");
    cy.findByRole("listbox").should("exist");
    cy.findByRole("combobox").should("have.value", "");
  });

  it("should allow multiselect to select on tab key press if selectOnTab is passed as true", () => {
    const selectionChangeSpy = cy.stub().as("selectionChange");
    cy.mount(<SelectOnTab onSelectionChange={selectionChangeSpy} />);
    cy.findByRole("combobox").realClick();
    cy.realType("Ala");
    cy.realPress("Tab");
    cy.get("@selectionChange").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      Cypress.sinon.match.array.deepEquals(["Alabama"]),
    );
    cy.findByRole("button", { name: "Remove Alabama" }).should("be.visible");
  });

  it("by default multiselect should not allow to select on tab key press", () => {
    const selectionChangeSpy = cy.stub().as("selectionChange");
    cy.mount(<Multiselect onSelectionChange={selectionChangeSpy} />);
    cy.findByRole("combobox").realClick();
    cy.realType("Ala");
    cy.realPress("Tab");
    cy.get("@selectionChange").should("not.have.been.called");
  });

  it("should not allow multiselect to deselect the already selected value on tab key press if selectOnTab is passed as true", () => {
    const selectionChangeSpy = cy.stub().as("selectionChange");
    cy.mount(<SelectOnTab onSelectionChange={selectionChangeSpy} />);
    cy.findByRole("combobox").realClick();
    cy.realType("Ala");
    cy.realPress("Tab");
    cy.get("@selectionChange").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      Cypress.sinon.match.array.deepEquals(["Alabama"]),
    );
    cy.findByRole("button", { name: "Remove Alabama" }).should("be.visible");
    cy.findByRole("combobox").realClick();
    cy.realType("Alabama");
    cy.realPress("Tab");
    cy.findByRole("button", { name: "Remove Alabama" }).should("be.visible");
    cy.findByRole("combobox").realClick();
    cy.findByRole("option", { name: "Alabama" }).should("be.ariaSelected");
  });

  it("should have form field support", () => {
    cy.mount(<WithFormField />);
    cy.findByRole("combobox").should("have.accessibleName", "State");
    cy.findByRole("combobox").should(
      "have.accessibleDescription",
      "Pick a US state",
    );

    cy.findByText("State").realClick();
    cy.findByRole("combobox").should("be.focused");
    cy.findByRole("listbox").should("exist");
  });

  it("should support grouping", () => {
    cy.mount(<Grouped />);
    cy.findByRole("combobox").realClick();
    cy.findByRole("group", { name: "US" }).should("exist");
    cy.findByRole("group", { name: "US" })
      .findByRole("option", { name: "New York" })
      .should("exist");
  });

  it("should allow showing an empty message when there are no options", () => {
    cy.mount(<EmptyMessage />);
    cy.findByRole("combobox").realClick();
    cy.findAllByRole("option").should("have.length", 1);
    cy.findByRole("option").should(
      "have.text",
      `No results found for "Yelloww"`,
    );
  });

  it("should support complex options", () => {
    cy.mount(<ComplexOption />);
    cy.findByRole("combobox").realClick();
    cy.findByRole("option", { name: /Kamron Marisa/ }).should("exist");
    cy.findByRole("option", { name: /Kamron Marisa/ }).realClick();
    cy.findByRole("combobox").should("have.value", "Kamron Marisa");
  });

  it("should support object values", () => {
    cy.mount(<ObjectValue />);
    cy.findByRole("combobox").realClick();
    cy.findByRole("option", { name: "John Doe" }).should("exist");
    cy.realType("Jane");
    cy.findByRole("option", { name: "Jane Doe" }).realClick();
    cy.findByRole("option", { name: "Jane Doe" }).should("be.ariaSelected");
  });

  it("should allow default selected options to be set", () => {
    const selectionChangeSpy = cy.stub().as("selectionChange");
    cy.mount(<WithDefaultSelected onSelectionChange={selectionChangeSpy} />);
    cy.findByRole("combobox").should("have.value", "California");
    cy.findByRole("combobox").realClick();
    cy.findByRole("option", { name: "California" }).should("be.ariaSelected");
    cy.findByRole("combobox").clear();
    cy.findByRole("option", { name: "Alabama" }).realClick();
    cy.findByRole("combobox").should("be.focused");
    cy.findByRole("combobox").should("have.value", "Alabama");
    cy.get("@selectionChange").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      Cypress.sinon.match.array.deepEquals(["Alabama"]),
    );
  });

  it("should allow a default open state", () => {
    cy.mount(<Default defaultOpen />);
    cy.findByRole("combobox").should("have.attr", "aria-expanded", "true");
    cy.findByRole("listbox").should("exist");
  });

  it("should allow a default open state", () => {
    cy.mount(<Default defaultOpen />);
    cy.findByRole("combobox").should("have.attr", "aria-expanded", "true");
    cy.findByRole("listbox").should("exist");
    cy.findByRole("button").realClick();
    cy.findByRole("combobox").should("have.attr", "aria-expanded", "false");
    cy.findByRole("listbox").should("not.exist");
  });

  it("should allow a controlled open state", () => {
    cy.mount(<Default open />);
    cy.findByRole("combobox").should("have.attr", "aria-expanded", "true");
    cy.findByRole("listbox").should("exist");
    cy.findByRole("button").realClick();
    cy.findByRole("combobox").should("have.attr", "aria-expanded", "true");
    cy.findByRole("listbox").should("exist");
  });

  it("should not show a list or trigger button with no options", () => {
    cy.mount(<ComboBox open />);
    cy.findByRole("listbox").should("not.exist");
    cy.findByRole("button").should("not.exist");
  });

  it("should clear selected items when the input is cleared and the combo box is single-select", () => {
    cy.mount(<WithDefaultSelected />);
    cy.findByRole("combobox").should("have.value", "California");
    cy.findByRole("combobox").realClick();
    cy.findByRole("option", { name: "California" }).should("be.ariaSelected");
    cy.findByRole("combobox").clear();
    cy.findByRole("combobox").should("have.value", "");
    cy.findByRole("option", { name: "California" }).should(
      "not.be.ariaSelected",
    );
  });

  it("should not clear selected items when the input is cleared and the combo box is multi-select", () => {
    cy.mount(<WithDefaultSelected multiselect />);
    cy.findByRole("combobox").realClick();
    cy.findByRole("option", { name: "California" }).should("be.ariaSelected");
    cy.realType("Ala");
    cy.findByRole("combobox").clear();
    cy.findByRole("combobox").should("have.value", "");
    cy.findByRole("option", { name: "California" }).should("be.ariaSelected");
  });

  it("should clear the list of active items when the input is cleared", () => {
    cy.mount(<Default />);
    cy.findByRole("combobox").realClick();
    cy.findByRole("option", { name: "Alabama" }).should("be.activeDescendant");
    cy.realType("C");
    cy.findByRole("option", { name: "California" }).should(
      "be.activeDescendant",
    );
    cy.realType("{backspace}");
    cy.findAllByRole("option").should("not.be.activeDescendant");
  });

  it("should wrap pills by default", () => {
    cy.mount(<MultiplePills />);
    cy.findAllByRole("button").should("have.length", 4).should("be.visible");
  });

  it("should truncate pills when `truncate=true` and expand them on focus", () => {
    cy.mount(<MultiplePillsTruncated />);
    cy.findAllByRole("button").should("have.length", 2).should("be.visible");
    cy.findByTestId(/OverflowMenuIcon/i).should("be.visible");
    cy.findByRole("combobox").realClick();
    cy.findAllByRole("button").should("have.length", 4).should("be.visible");
  });

  it("should focus the pills first and on tab focus the input", () => {
    cy.mount(<MultiplePills />);
    cy.realPress("Tab");
    cy.findByRole("button", { name: "Remove Alabama" }).should("be.focused");
    cy.realPress("Tab");
    cy.findByRole("combobox").should("be.focused");
  });

  it("should support arrow key navigation between pills and input", () => {
    cy.mount(<MultiplePills />);
    cy.realPress("Tab");
    cy.findByRole("button", { name: "Remove Alabama" }).should("be.focused");
    cy.realPress("ArrowRight");
    cy.findByRole("button", { name: "Remove Alaska" }).should("be.focused");
    cy.realPress("ArrowRight");
    cy.findByRole("button", { name: "Remove Arizona" }).should("be.focused");
    cy.realPress("ArrowRight");
    cy.findByRole("combobox").should("be.focused");

    cy.realPress("ArrowLeft");
    cy.findByRole("button", { name: "Remove Arizona" }).should("be.focused");
    cy.realPress("ArrowLeft");
    cy.findByRole("button", { name: "Remove Alaska" }).should("be.focused");
    cy.realPress("ArrowLeft");
    cy.findByRole("button", { name: "Remove Alabama" }).should("be.focused");
  });

  it("should be able to delete a pill when its option is not visible on screen", () => {
    cy.mount(<MultiplePills />);
    cy.findByRole("combobox").realClick();
    cy.realType("UNKNOWN");
    cy.realPress("Home");
    cy.findAllByTestId("pill").should("have.length", "3");
    cy.realPress("Backspace");
    cy.findAllByTestId("pill").should("have.length", "2");
  });

  it("should render the custom floating component", () => {
    cy.mount(
      <CustomFloatingComponentProvider>
        <Default open />
      </CustomFloatingComponentProvider>,
    );

    cy.findByTestId(FLOATING_TEST_ID).should("exist");
  });

  it("should default to defaultValue when no defaultSelected is set", () => {
    cy.mount(
      <ComboBox defaultValue="Alaska">
        <Option value="Alabama" />
        <Option value="Alaska" />
      </ComboBox>,
    );
    cy.findByRole("combobox").should("have.value", "Alaska");
  });
  it("should default to defaultValue when both defaultValue and defaultSelected are set", () => {
    cy.mount(
      <ComboBox defaultValue="Alaska" defaultSelected={["Alabama"]}>
        <Option value="Alabama" />
        <Option value="Alaska" />
      </ComboBox>,
    );
    cy.findByRole("combobox").should("have.value", "Alaska");
  });
  it("should default to defaultSelected value when defaultValue is not set", () => {
    cy.mount(
      <ComboBox defaultSelected={["Alaska"]}>
        <Option value="Alabama" />
        <Option value="Alaska" />
      </ComboBox>,
    );
    cy.findByRole("combobox").should("have.value", "Alaska");
  });
  it("should not call onBlur when an option in the list is clicked", () => {
    const blurSpy = cy.stub().as("blurSpy");
    cy.mount(<Default onBlur={blurSpy} />);
    cy.findByRole("combobox").realClick();
    cy.findAllByRole("option").eq(0).realClick();
    cy.get("@blurSpy").should("not.have.been.called");
  });

  it("should support 10000 items without much delay", () => {
    cy.mount(<PerformanceTest />);

    cy.findByRole("combobox").should("be.visible");

    cy.window().its("performance").invoke("mark", "open_start");

    cy.findByRole("combobox").realClick();

    cy.findByRole("listbox", { timeout: 30000 }).should("be.visible");

    cy.window().its("performance").invoke("mark", "open_end");

    cy.window()
      .its("performance")
      .invoke("measure", "open_duration", "open_start", "open_end")
      .its("duration", { timeout: 0 })
      .should("be.lessThan", 5000);
  });

  it("should remove aria-activedescendant when closed", () => {
    cy.mount(<Default />);
    cy.findByRole("combobox").realClick();
    cy.findByRole("option", { name: "Alabama" }).should("be.activeDescendant");
    cy.findByRole("option", { name: "Alaska" }).realClick();
    cy.findByRole("combobox").should("not.have.attr", "aria-activedescendant");
    cy.findByRole("combobox").realClick();
    cy.findByRole("option", { name: "Alaska" }).should("be.activeDescendant");
    cy.findByRole("combobox").clear();
    cy.findByRole("option", { name: "Alabama" }).realClick();
    cy.findByRole("combobox").should("not.have.attr", "aria-activedescendant");
    cy.findByRole("combobox").realClick();
    cy.findByRole("option", { name: "Alabama" }).should("be.activeDescendant");
    cy.realPress("Escape");
    cy.findByRole("combobox").should("not.have.attr", "aria-activedescendant");
  });

  it("should default to autoComplete off, and able to enable via props if needed", () => {
    cy.mount(<Default />);
    cy.findByRole("combobox").should("have.attr", "autocomplete", "off");
    cy.mount(
      <Default
        inputProps={{
          autoComplete: "on",
        }}
      />,
    );
    cy.findByRole("combobox").should("have.attr", "autocomplete", "on");
  });

  it("should not throw error when forced focus away via key down capture", () => {
    // this is a close replicate of using this as ag grid cell renderer
    const TestSetup = () => {
      const buttonRef = useRef<HTMLButtonElement>(null);

      const moveFocus: KeyboardEventHandler = (event) => {
        if (event.key === "ArrowRight") {
          buttonRef.current?.focus();
        }
      };

      return (
        <>
          <ComboBox onKeyDownCapture={moveFocus}>
            <Option value={1}>1</Option>
          </ComboBox>
          <button ref={buttonRef}>test</button>
        </>
      );
    };

    cy.mount(<TestSetup />);
    cy.realPress("Tab");
    cy.realPress("ArrowRight");
    // should not throw error
    cy.findByRole("button", { name: "test" }).should("be.focused");
  });

  it("should trigger onSelectionChange callback and delete the pill when the pill is clicked", () => {
    const onSelectionChangeSpy = cy.stub().as("onSelectionChangeSpy");
    cy.mount(<MultiplePills onSelectionChange={onSelectionChangeSpy} />);
    cy.findByRole("combobox").realClick();
    cy.findAllByTestId("pill").should("have.length", "3");
    cy.findAllByTestId("pill").eq(0).realClick();
    cy.get("@onSelectionChangeSpy").should("have.been.called");
    cy.findAllByTestId("pill").should("have.length", "2");
  });

  it("should not delete the pill when the pill is clicked first", () => {
    const onSelectionChangeSpy = cy.stub().as("onSelectionChangeSpy");
    cy.mount(<MultiplePills onSelectionChange={onSelectionChangeSpy} />);
    cy.findAllByTestId("pill").should("have.length", "3");
    cy.findAllByTestId("pill").eq(0).realClick();
    cy.get("@onSelectionChangeSpy").should("not.have.been.called");
    cy.findAllByTestId("pill").should("have.length", "3");
  });

  it("should allow props to be passed to the overlay container", () => {
    cy.mount(<Default OverlayProps={{ "data-testid": "overlay" }} open />);
    cy.findByTestId("overlay")
      .should("exist")
      .and("have.attr", "role", "listbox");
  });
});
