import { List, ListItem } from "@jpmorganchase/uitk-lab";

const ITEMS = [{ label: "list item 1" }, { label: "list item 2" }];
const ARIA_SELECTED = "aria-selected";

["source", "declarative"].forEach((listType) => {
  const isDeclarative = listType === "declarative";

  describe(`A ${listType} List`, () => {
    it("should be keyboard-focused", () => {
      cy.mount(
        isDeclarative ? (
          <List>
            <ListItem>list item 1</ListItem>
            <ListItem>list item 2</ListItem>
          </List>
        ) : (
          <List source={ITEMS} />
        )
      );

      cy.findByRole("listbox").should("have.attr", "tabindex", "0");
    });

    describe("when navigated to an item with mouse", () => {
      it("should show the correct aria-activedescendant", () => {
        cy.mount(
          isDeclarative ? (
            <List id="list">
              <ListItem>list item 1</ListItem>
              <ListItem>list item 2</ListItem>
            </List>
          ) : (
            <List id="list" source={ITEMS} />
          )
        );

        cy.get("#list-item-1").trigger("mousemove");
        cy.findByRole("listbox").should(
          "have.attr",
          "aria-activedescendant",
          `list-item-1`
        );
      });
    });

    describe("when navigated to an item with keyboard", () => {
      it("should have correct aria-activedescendant", () => {
        cy.mount(
          isDeclarative ? (
            <List id="list">
              <ListItem>list item 1</ListItem>
              <ListItem>list item 2</ListItem>
            </List>
          ) : (
            <List id="list" source={ITEMS} />
          )
        );
        cy.findByRole("listbox").focus();
        cy.findByRole("listbox").should(
          "have.attr",
          "aria-activedescendant",
          `list-item-0`
        );
      });
    });

    it("should set aria-checked for selected item", () => {
      cy.mount(
        isDeclarative ? (
          <List id="list">
            <ListItem>list item 1</ListItem>
            <ListItem>list item 2</ListItem>
          </List>
        ) : (
          <List id="list" source={ITEMS} />
        )
      );
      cy.get("#list-item-1").click();
      cy.get("#list-item-0").should("not.have.attr", ARIA_SELECTED);
      cy.get("#list-item-1").should("have.attr", ARIA_SELECTED);
    });

    it("should set aria-disabled for disabled item", () => {
      cy.mount(
        isDeclarative ? (
          <List id="list">
            <ListItem>list item 1</ListItem>
            <ListItem disabled>list item 2</ListItem>
          </List>
        ) : (
          <List
            id="list"
            source={[
              { label: "list item 1" },
              { label: "list item 2", disabled: true },
            ]}
          />
        )
      );
      cy.get("#list-item-0").should("not.have.attr", "aria-disabled");
      cy.get("#list-item-1").should("have.attr", "aria-disabled");
    });

    describe("when the entire list is disabled", () => {
      beforeEach(() => {
        cy.mount(
          isDeclarative ? (
            <List disabled id="list">
              <ListItem>list item 1</ListItem>
              <ListItem>list item 2</ListItem>
            </List>
          ) : (
            <List disabled id="list" source={ITEMS} />
          )
        );
      });

      it("should not be keyboard focused", () => {
        cy.findByRole("listbox").should("not.have.attr", "tabindex");
      });

      it("should set aria-disabled for all its items", () => {
        cy.get("#list-item-0").should("have.attr", "aria-disabled");
        cy.get("#list-item-1").should("have.attr", "aria-disabled");
      });
    });

    describe("when multi-selection is enabled", () => {
      it("should set aria-multiselectable on the list", () => {
        cy.mount(
          isDeclarative ? (
            <List selectionStrategy="multiple">
              <ListItem>list item 1</ListItem>
              <ListItem>list item 2</ListItem>
            </List>
          ) : (
            <List selectionStrategy="multiple" source={ITEMS} />
          )
        );

        cy.findByRole("listbox").should("have.attr", "aria-multiselectable");
      });

      it("should set aria-selected for selected items", () => {
        cy.mount(
          isDeclarative ? (
            <List id="list" selectionStrategy="multiple">
              <ListItem>list item 1</ListItem>
              <ListItem>list item 2</ListItem>
            </List>
          ) : (
            <List id="list" selectionStrategy="multiple" source={ITEMS} />
          )
        );

        cy.get("#list-item-0").click();

        cy.get("#list-item-0").should("have.attr", "aria-selected");
        cy.get("#list-item-1").should("not.have.attr", "aria-selected");
      });
    });
  });

  describe("A virtualized list", () => {
    it.skip("should set correct aria position attribute for each item", () => {
      cy.mount(<List id="list" source={ITEMS} virtualized />);

      cy.get("#list-item-0").should("have.attr", "aria-posinset", 1);
      cy.get("#list-item-1").should("have.attr", "aria-posinset", 2);
    });
  });
});
