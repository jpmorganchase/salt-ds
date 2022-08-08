import { List, ListItem, ListItemProps } from "@jpmorganchase/uitk-lab";

describe("A declarative list", () => {
  it("should render all list items", () => {
    cy.mount(
      <List>
        <ListItem>list item 1</ListItem>
        <ListItem>list item 2</ListItem>
        <ListItem>list item 3</ListItem>
      </List>
    );

    cy.findByText("list item 1").should("exist");
    cy.findByText("list item 2").should("exist");
    cy.findByText("list item 3").should("exist");
  });

  describe("when mouse is moved over an item", () => {
    it("should highlight that item", () => {
      cy.mount(
        <List id="list">
          <ListItem>list item 1</ListItem>
          <ListItem>list item 2</ListItem>
          <ListItem>list item 3</ListItem>
        </List>
      );
      cy.get("#list-item-1").trigger("mousemove");
      cy.get("#list-item-1").should("be.highlighted");
    });
  });

  describe("when clicked an item", () => {
    it("should select that item", () => {
      const onSelectionChange = cy.stub().as("selectionChangeHandler");
      const onSelect = cy.stub().as("selectHandler");

      cy.mount(
        <List
          id="list"
          onSelectionChange={onSelectionChange}
          onSelect={onSelect}
        >
          <ListItem>list item 1</ListItem>
          <ListItem>list item 2</ListItem>
          <ListItem>list item 3</ListItem>
        </List>
      );

      cy.get("#list-item-1").click();
      cy.get("#list-item-1").should("have.ariaSelected");

      cy.get("@selectionChangeHandler").should(
        "have.been.calledWith",
        Cypress.sinon.match.any,
        "list item 2"
      );
      cy.get("@selectHandler").should(
        "have.been.calledWith",
        Cypress.sinon.match.any,
        "list item 2"
      );
    });
  });
});

describe("A declarative list with a disabled item", () => {
  let onSelect;
  beforeEach(() => {
    onSelect = cy.stub().as("selectHandler");
    cy.mount(
      <List id="list" onChange={onSelect}>
        <ListItem>list item 1</ListItem>
        <ListItem disabled>list item 2</ListItem>
        <ListItem>list item 3</ListItem>
      </List>
    );
  });

  it("should render disabled style for the disabled item", () => {
    cy.get("#list-item-1").should("have.class", "uitkDisabled");
  });

  describe("when clicked on the disabled item", () => {
    it("should not select anything", () => {
      cy.get("#list-item-1").click();
      cy.get("#list-item-1").should("not.have.ariaSelected");
      cy.get("@selectHandler").should("not.have.been.called");
    });
  });

  describe("when mouse is moved over the disabled item", () => {
    it("should not highlight that item", () => {
      cy.get("#list-item-1").trigger("mousemove");
      cy.get("#list-item-1").should("not.be.highlighted");
    });
  });
});

describe("A disabled declarative list", () => {
  let onSelect;
  beforeEach(() => {
    onSelect = cy.stub().as("selectHandler");
    cy.mount(
      <List id="list" disabled onChange={onSelect}>
        <ListItem>list item 1</ListItem>
        <ListItem>list item 2</ListItem>
        <ListItem>list item 3</ListItem>
      </List>
    );
  });

  it("should have the disabled list style", () => {
    cy.findByRole("listbox").should("have.class", "uitkDisabled");
  });

  describe("when clicked its items", () => {
    it("should not select anything", () => {
      cy.get("#list-item-0").click();
      cy.get("#list-item-1").click();
      cy.get("#list-item-2").click();
      cy.get("@selectHandler").should("not.have.been.called");
    });
  });
});
