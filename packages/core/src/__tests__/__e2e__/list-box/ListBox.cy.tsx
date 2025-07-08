import * as listBoxStories from "@stories/list-box/list-box.stories";
import { composeStories } from "@storybook/react-vite";

const {
  SingleSelect,
  Multiselect,
  Disabled,
  DisabledOption,
  DefaultSelectedSingleSelect,
  DefaultSelectedMultiselect,
  Grouped,
  Scrolling,
} = composeStories(listBoxStories);

describe("GIVEN a List box", () => {
  it("should allow selection with a mouse", () => {
    const selectionChangeSpy = cy.stub().as("selectionChange");
    cy.mount(<SingleSelect onSelectionChange={selectionChangeSpy} />);

    cy.findByRole("option", { name: "Alaska" }).realHover();
    cy.findByRole("option", { name: "Alaska" }).realClick();
    cy.findByRole("option", { name: "Alaska" }).should("be.activeDescendant");

    cy.findByRole("listbox").should("be.focused");
    cy.get("@selectionChange").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      Cypress.sinon.match.array.deepEquals(["Alaska"]),
    );
  });

  it("should allow selection with a keyboard", () => {
    const selectionChangeSpy = cy.stub().as("selectionChange");
    cy.mount(<SingleSelect onSelectionChange={selectionChangeSpy} />);

    cy.realPress("Tab");
    cy.findByRole("option", { name: "Alabama" }).should("be.activeDescendant");
    cy.realPress("ArrowDown");
    cy.findByRole("option", { name: "Alaska" }).should("be.activeDescendant");
    cy.realPress("Enter");

    cy.findByRole("listbox").should("be.focused");
    cy.get("@selectionChange").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      Cypress.sinon.match.array.deepEquals(["Alaska"]),
    );
  });

  it('should not select the first option on mouse down on a different option', () => {
    const selectionChangeSpy = cy.stub().as("selectionChange");
    cy.mount(<SingleSelect onSelectionChange={selectionChangeSpy} />);

    cy.findByRole("option", { name: "Alaska" }).realHover();
    cy.findByRole("option", { name: "Alaska" }).realMouseDown();
    cy.findAllByRole("option").eq(0).should("not.be.activeDescendant");
    cy.get("@selectionChange").should("not.have.been.called")
  })

  it("should focus the selected item when the list is focused in single select", () => {
    cy.mount(<DefaultSelectedSingleSelect />);
    cy.realPress("Tab");
    cy.findByRole("option", { name: "Arkansas" }).should("be.activeDescendant");
  });

  it("should focus the selected item when the list is focused in multiselect", () => {
    cy.mount(<DefaultSelectedMultiselect />);
    cy.realPress("Tab");
    cy.findByRole("option", { name: "Arkansas" }).should("be.activeDescendant");
  });

  it("should support keyboard navigation", () => {
    cy.mount(<Scrolling />);

    cy.realPress(["Tab"]);
    cy.findAllByRole("option").eq(0).should("be.activeDescendant");

    // should not wrap
    cy.realPress(["ArrowUp"]);
    cy.findAllByRole("option").eq(0).should("be.activeDescendant");

    cy.realPress(["ArrowDown"]);
    cy.findAllByRole("option").eq(1).should("be.activeDescendant");

    // should try to go down by the number of visible items in list
    cy.realPress(["PageDown"]);
    cy.findAllByRole("option").eq(8).should("be.activeDescendant");

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

  it("should not receive focus if it is disabled", () => {
    cy.mount(
      <div>
        <button>start</button>
        <Disabled />
        <button>end</button>
      </div>,
    );
    cy.findByRole("listbox").should("have.attr", "aria-disabled", "true");
    cy.realPress("Tab");
    cy.findByRole("button", { name: "start" }).should("be.focused");
    cy.realPress("Tab");
    cy.findByRole("listbox").should("not.be.focused");
    cy.findByRole("button", { name: "end" }).should("be.focused");
  });

  it("should not allow you to select a disabled option", () => {
    const selectionChangeSpy = cy.stub().as("selectionChange");
    cy.mount(<DisabledOption onSelectionChange={selectionChangeSpy} />);
    cy.findByRole("option", { name: "Arizona" }).should(
      "have.attr",
      "aria-disabled",
      "true",
    );
    cy.realPress("Tab");
    cy.realPress("ArrowDown");
    cy.realPress("ArrowDown");
    cy.findByRole("option", { name: "Arizona" }).should("be.activeDescendant");
    cy.findByRole("option", { name: "Arizona" }).realPress("Enter");
    cy.get("@selectionChange").should("not.have.been.called");
    cy.findByRole("option", { name: "Arizona" }).realClick();
    cy.get("@selectionChange").should("not.have.been.called");
  });

  it("should allow multiple options to be selected with a mouse", () => {
    const selectionChangeSpy = cy.stub().as("selectionChange");
    cy.mount(<Multiselect onSelectionChange={selectionChangeSpy} />);

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
  });

  it("should allow multiple options to be selected with the keyboard", () => {
    const selectionChangeSpy = cy.stub().as("selectionChange");
    cy.mount(<Multiselect onSelectionChange={selectionChangeSpy} />);
    cy.realPress("Tab");
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
  });

  it("should support grouping", () => {
    cy.mount(<Grouped />);
    cy.findByRole("group", { name: "A" }).should("exist");
    cy.findByRole("group", { name: "A" })
      .findByRole("option", { name: "Alabama" })
      .should("exist");
  });

  it("should support typeahead", () => {
    cy.mount(<SingleSelect />);
    cy.realPress("Tab");
    cy.realType("A");
    cy.findByRole("listbox").should("exist");
    cy.findByRole("option", { name: "Alaska" }).should("be.activeDescendant");

    cy.realType("A");
    cy.findByRole("option", { name: "Arizona" }).should("be.activeDescendant");

    cy.wait(500);

    cy.realType("Alas");
    cy.findByRole("option", { name: "Alaska" }).should("be.activeDescendant");
  });
});
