import { List, ListItem } from "@jpmorganchase/uitk-lab";

type ItemWithLabel = { label: string };
const ITEMS: ItemWithLabel[] = [
  { label: "list item 1" },
  { label: "list item 2" },
  { label: "list item 3" },
  { label: "list item 4" },
];

const SELECTED = "aria-selected";

["source", "declarative"].forEach((listType) => {
  describe(`A ${listType} List with a selected item`, () => {
    const isDeclarative = listType === "declarative";
    let onSelect;
    let onSelectionChange;

    beforeEach(() => {
      onSelectionChange = cy.stub().as("selectionChangeHandler");
      onSelect = cy.stub().as("selectHandler");
      const listProps = {
        onSelectionChange,
        onSelect,
      };

      cy.mount(
        isDeclarative ? (
          <List {...listProps} defaultSelected="list item 2">
            <ListItem>list item 1</ListItem>
            <ListItem>list item 2</ListItem>
            <ListItem>list item 3</ListItem>
            <ListItem>list item 4</ListItem>
          </List>
        ) : (
          <List<ItemWithLabel>
            {...listProps}
            defaultSelected={ITEMS[1]}
            source={ITEMS}
          />
        )
      );
    });

    it("clicking the selected item should not change selected item", () => {
      cy.findAllByRole("option").eq(1).should("have.attr", SELECTED);
      cy.findByText("list item 2").realHover().realClick();
      cy.get("@selectionChangeHandler").should("not.have.been.called");
      cy.get("@selectHandler").should(
        "have.been.calledWith",
        Cypress.sinon.match.any,
        isDeclarative ? "list item 2" : ITEMS[1]
      );
    });
    it("clicking another item should change selected item", () => {
      cy.findByText("list item 3").realHover().realClick();
      cy.findAllByRole("option").eq(1).should("not.have.attr", SELECTED);
      cy.findAllByRole("option").eq(2).should("have.attr", SELECTED);
      cy.get("@selectionChangeHandler").should(
        "have.been.calledWith",
        Cypress.sinon.match.any,
        isDeclarative ? "list item 3" : ITEMS[2]
      );
      cy.get("@selectHandler").should(
        "have.been.calledWith",
        Cypress.sinon.match.any,
        isDeclarative ? "list item 3" : ITEMS[2]
      );
    });
  });
});

["source", "declarative"].forEach((listType) => {
  describe(`A disabled ${listType} List `, () => {
    const isDeclarative = listType === "declarative";
    let onSelect;
    let onSelectionChange;

    beforeEach(() => {
      onSelectionChange = cy.stub().as("selectionChangeHandler");
      onSelect = cy.stub().as("selectHandler");
      const listProps = {
        disabled: true,
        onSelectionChange,
        onSelect,
      };

      cy.mount(
        isDeclarative ? (
          <List {...listProps} defaultSelected="list item 2">
            <ListItem>list item 1</ListItem>
            <ListItem>list item 2</ListItem>
            <ListItem>list item 3</ListItem>
            <ListItem>list item 4</ListItem>
          </List>
        ) : (
          <List<ItemWithLabel>
            {...listProps}
            defaultSelected={ITEMS[1]}
            source={ITEMS}
          />
        )
      );
    });

    it("clicking the selected item should not change selected item", () => {
      cy.findAllByRole("option").eq(1).should("have.attr", SELECTED);
      cy.findByText("list item 2").realClick();
      cy.get("@selectionChangeHandler").should("not.have.been.called");
      cy.get("@selectHandler").should("not.have.been.called");
    });

    it("clicking another item should not change selected item", () => {
      cy.findByText("list item 3").realClick();
      cy.findAllByRole("option").eq(1).should("have.attr", SELECTED);
      cy.findAllByRole("option").eq(2).should("not.have.attr", SELECTED);
      cy.get("@selectionChangeHandler").should("not.have.been.called");
      cy.get("@selectHandler").should("not.have.been.called");
    });
  });
});

["source", "declarative"].forEach((listType) => {
  describe(`A de-selectable ${listType} List with a selected item`, () => {
    const isDeclarative = listType === "declarative";
    let onSelectionChange;
    let onSelect;

    beforeEach(() => {
      onSelectionChange = cy.stub().as("selectionChangeHandler");
      onSelect = cy.stub().as("selectHandler");
      const listProps = {
        onSelectionChange,
        onSelect,
      };

      cy.mount(
        isDeclarative ? (
          <List
            {...listProps}
            defaultSelected="list item 2"
            selectionStrategy="deselectable"
          >
            <ListItem>list item 1</ListItem>
            <ListItem>list item 2</ListItem>
            <ListItem>list item 3</ListItem>
            <ListItem>list item 4</ListItem>
          </List>
        ) : (
          <List<ItemWithLabel, "deselectable">
            {...listProps}
            defaultSelected={ITEMS[1]}
            selectionStrategy="deselectable"
            source={ITEMS}
          />
        )
      );
    });

    describe("when selected item is clicked", () => {
      it("should deselect that item", () => {
        cy.findByText("list item 2").realHover().realClick();
        cy.findAllByRole("option").eq(1).should("not.have.attr", SELECTED);

        cy.get("@selectionChangeHandler").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          null
        );

        cy.get("@selectHandler").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          isDeclarative ? "list item 2" : ITEMS[1]
        );
      });
    });
  });
});

["source", "declarative"].forEach((listType) => {
  describe(`A multi-selection ${listType} List`, () => {
    const isDeclarative = listType === "declarative";

    let onSelectionChange;
    let onSelect;

    beforeEach(() => {
      onSelectionChange = cy.stub().as("selectionChangeHandler");
      onSelect = cy.stub().as("selectHandler");
      const listProps = {
        onSelectionChange,
        onSelect,
      };

      cy.mount(
        isDeclarative ? (
          <List {...listProps} selectionStrategy="multiple">
            <ListItem>list item 1</ListItem>
            <ListItem>list item 2</ListItem>
            <ListItem>list item 3</ListItem>
            <ListItem>list item 4</ListItem>
          </List>
        ) : (
          <List<ItemWithLabel, "multiple">
            {...listProps}
            selectionStrategy="multiple"
            source={ITEMS}
          />
        )
      );
    });

    describe("when multiple items are clicked", () => {
      it("should select those items", () => {
        cy.findByText("list item 1").realHover().realClick();

        cy.get("@selectHandler").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          isDeclarative ? "list item 1" : ITEMS[0]
        );

        cy.findByText("list item 3").realHover().realClick();

        cy.findAllByRole("option").eq(0).should("have.attr", SELECTED);
        cy.findAllByRole("option").eq(2).should("have.attr", SELECTED);

        cy.get("@selectionChangeHandler").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          isDeclarative ? ["list item 1", "list item 3"] : [ITEMS[0], ITEMS[2]]
        );

        cy.get("@selectHandler").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          isDeclarative ? "list item 1" : ITEMS[2]
        );
      });
    });

    describe("when selected items are clicked one more time", () => {
      it("should deselect those items", () => {
        // to select
        cy.findByText("list item 1").realHover().realClick();
        cy.get("@selectHandler").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          isDeclarative ? "list item 1" : ITEMS[0]
        );

        cy.findByText("list item 3").realHover().realClick();
        cy.findByText("list item 4").realHover().realClick();

        // to deselect
        cy.findByText("list item 1").realHover().realClick();

        cy.get("@selectHandler").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          isDeclarative ? "list item 1" : ITEMS[0]
        );

        cy.findByText("list item 4").realHover().realClick();

        cy.findAllByRole("option").eq(0).should("not.have.attr", SELECTED);
        cy.findAllByRole("option").eq(2).should("have.attr", SELECTED);
        cy.findAllByRole("option").eq(3).should("not.have.attr", SELECTED);

        cy.get("@selectHandler").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          isDeclarative ? "list item 3" : ITEMS[2]
        );
      });
    });
  });

  ["source" /*, "declarative"*/].forEach((listType) => {
    describe(`A ${listType} List with multiple selected items`, () => {
      const isDeclarative = listType === "declarative";

      it("should be a multi-selection list", () => {
        const onSelectionChange = cy.stub().as("selectHandler");
        cy.mount(
          isDeclarative ? (
            <List<String, "multiple">
              defaultSelected={["list item 2", "list item 4"]}
              onSelectionChange={onSelectionChange}
              selectionStrategy="multiple"
            >
              <ListItem>list item 1</ListItem>
              <ListItem>list item 2</ListItem>
              <ListItem>list item 3</ListItem>
              <ListItem>list item 4</ListItem>
            </List>
          ) : (
            <List<ItemWithLabel, "multiple">
              defaultSelected={[ITEMS[1], ITEMS[3]]}
              onSelectionChange={onSelectionChange}
              selectionStrategy="multiple"
              source={ITEMS}
            />
          )
        );

        cy.findByText("list item 1").realHover().realClick();
        cy.findByText("list item 3").realHover().realClick();
        cy.findByText("list item 4").realHover().realClick();

        cy.findAllByRole("option").eq(0).should("have.attr", SELECTED);
        cy.findAllByRole("option").eq(1).should("have.attr", SELECTED);
        cy.findAllByRole("option").eq(2).should("have.attr", SELECTED);
        cy.findAllByRole("option").eq(3).should("not.have.attr", SELECTED);
      });
    });
  });
});

["source", "declarative"].forEach((listType) => {
  describe(`A extended-selection ${listType} List`, () => {
    const isDeclarative = listType === "declarative";
    let onSelectionChange;
    let onSelect;

    beforeEach(() => {
      onSelectionChange = cy.stub().as("selectionChangeHandler");
      onSelect = cy.stub().as("selectHandler");
      const listProps = { onSelectionChange, onSelect };

      cy.mount(
        isDeclarative ? (
          <List {...listProps} selectionStrategy="extended">
            <ListItem>list item 1</ListItem>
            <ListItem>list item 2</ListItem>
            <ListItem>list item 3</ListItem>
            <ListItem>list item 4</ListItem>
          </List>
        ) : (
          <List<ItemWithLabel, "extended">
            {...listProps}
            selectionStrategy="extended"
            source={ITEMS}
          />
        )
      );
    });

    describe("when multiple items are clicked", () => {
      it("should change selection if simple click", () => {
        cy.findByText("list item 1").realHover().realClick();
        cy.get("@selectHandler").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          isDeclarative ? "list item 1" : ITEMS[0]
        );

        cy.findByText("list item 3").realHover().realClick();
        cy.findAllByRole("option").eq(0).should("not.have.attr", SELECTED);
        cy.findAllByRole("option").eq(2).should("have.attr", SELECTED);

        cy.get("@selectionChangeHandler").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          isDeclarative ? ["list item 3"] : [ITEMS[2]]
        );
        cy.get("@selectHandler").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          isDeclarative ? "list item 3" : ITEMS[2]
        );
      });

      it("should select those items if control click is used", () => {
        cy.findByText("list item 1").realHover().realClick();
        cy.findByText("list item 3").click({ ctrlKey: true });

        cy.findAllByRole("option").eq(0).should("have.attr", SELECTED);
        cy.findAllByRole("option").eq(2).should("have.attr", SELECTED);

        cy.get("@selectionChangeHandler").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          isDeclarative ? ["list item 1", "list item 3"] : [ITEMS[0], ITEMS[2]]
        );

        cy.get("@selectHandler").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          isDeclarative ? "list item 3" : ITEMS[2]
        );
      });

      it("should select a range between those items if shift click is used", () => {
        cy.findByText("list item 1").realHover().realClick({});

        cy.findByText("list item 4").click({ shiftKey: true });

        cy.findAllByRole("option").eq(0).should("have.attr", SELECTED);
        cy.findAllByRole("option").eq(1).should("have.attr", SELECTED);
        cy.findAllByRole("option").eq(2).should("have.attr", SELECTED);
        cy.findAllByRole("option").eq(3).should("have.attr", SELECTED);

        cy.get("@selectionChangeHandler").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          isDeclarative
            ? ["list item 1", "list item 2", "list item 3", "list item 4"]
            : [ITEMS[0], ITEMS[1], ITEMS[2], ITEMS[3]]
        );

        cy.get("@selectHandler").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          isDeclarative ? "list item 4" : ITEMS[3]
        );
      });
      it("should not select duplicates if a range overlaps", () => {
        cy.findByText("list item 2").realHover().realClick();

        cy.get("@selectHandler").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          isDeclarative ? "list item 2" : ITEMS[1]
        );

        cy.findByText("list item 1").realHover().click({ shiftKey: true });

        cy.findAllByRole("option").eq(0).should("have.attr", SELECTED);
        cy.findAllByRole("option").eq(1).should("have.attr", SELECTED);

        cy.get("@selectionChangeHandler").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          isDeclarative ? ["list item 1", "list item 2"] : [ITEMS[0], ITEMS[1]]
        );

        // is this right, shouldn't it be 1 ?
        cy.get("@selectHandler").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          isDeclarative ? "list item 2" : ITEMS[1]
        );

        // selecting second range that overlaps with the first
        cy.findByText("list item 4")
          .realHover()
          .click({ ctrlKey: true, shiftKey: true });

        cy.get("@selectionChangeHandler").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          isDeclarative
            ? ["list item 1", "list item 2", "list item 3", "list item 4"]
            : [ITEMS[0], ITEMS[1], ITEMS[2], ITEMS[3]]
        );
      });

      it("should deselect first range if new range selected", () => {
        cy.findByText("list item 1").realHover().realClick();
        cy.findByText("list item 2").realHover().click({ shiftKey: true });

        cy.findAllByRole("option").eq(0).should("have.attr", SELECTED);
        cy.findAllByRole("option").eq(1).should("have.attr", SELECTED);

        cy.get("@selectionChangeHandler").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          isDeclarative ? ["list item 1", "list item 2"] : [ITEMS[0], ITEMS[1]]
        );

        cy.get("@selectHandler").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          isDeclarative ? "list item 2" : ITEMS[1]
        );
        // selecting second range
        // cy.findByText("list item 3").realHover().click({ ctrlKey: true });
        cy.findByText("list item 3").realHover().click();
        cy.findByText("list item 4").realHover().click({ shiftKey: true });

        cy.findAllByRole("option").eq(0).should("not.have.attr", SELECTED);
        cy.findAllByRole("option").eq(1).should("not.have.attr", SELECTED);
        cy.findAllByRole("option").eq(2).should("have.attr", SELECTED);
        cy.findAllByRole("option").eq(3).should("have.attr", SELECTED);

        cy.get("@selectionChangeHandler").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          isDeclarative ? ["list item 3", "list item 4"] : [ITEMS[2], ITEMS[3]]
        );
      });

      it("should concatenate first range if new range selected with ctrl shift", () => {
        cy.findByText("list item 1").realHover().realClick();
        cy.findByText("list item 2").click({ shiftKey: true });

        cy.findAllByRole("option").eq(0).should("have.attr", SELECTED);
        cy.findAllByRole("option").eq(1).should("have.attr", SELECTED);

        cy.get("@selectionChangeHandler").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          isDeclarative ? ["list item 1", "list item 2"] : [ITEMS[0], ITEMS[1]]
        );

        cy.get("@selectHandler").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          isDeclarative ? "list item 2" : ITEMS[1]
        );
        // selecting second range
        cy.findByText("list item 3").click({ ctrlKey: true });
        cy.findByText("list item 4").click({ shiftKey: true, ctrlKey: true });

        cy.findAllByRole("option").eq(0).should("have.attr", SELECTED);
        cy.findAllByRole("option").eq(1).should("have.attr", SELECTED);
        cy.findAllByRole("option").eq(2).should("have.attr", SELECTED);
        cy.findAllByRole("option").eq(3).should("have.attr", SELECTED);

        cy.get("@selectionChangeHandler").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          isDeclarative
            ? ["list item 1", "list item 2", "list item 3", "list item 4"]
            : [ITEMS[0], ITEMS[1], ITEMS[2], ITEMS[3]]
        );
      });
    });

    describe("when selected items are clicked one more time", () => {
      it("should deselect all items except for the clicked item", () => {
        // to select
        cy.findByText("list item 1").realHover().realClick();

        // to select additional items
        cy.findByText("list item 3").click({ ctrlKey: true });
        cy.findByText("list item 4").click({ ctrlKey: true });

        // to deselect
        cy.findByText("list item 1").realHover().realClick();

        cy.get("@selectHandler").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          isDeclarative ? "list item 1" : ITEMS[0]
        );

        cy.findAllByRole("option").eq(0).should("have.attr", SELECTED);
        cy.findAllByRole("option").eq(1).should("not.have.attr", SELECTED);
        cy.findAllByRole("option").eq(2).should("not.have.attr", SELECTED);
        cy.findAllByRole("option").eq(3).should("not.have.attr", SELECTED);
      });

      it("should deselect only that item if control click is used", () => {
        // to select
        cy.findByText("list item 1").realHover().realClick();

        cy.findByText("list item 3").click({ ctrlKey: true });
        cy.findByText("list item 4").click({ ctrlKey: true });

        // to deselect
        cy.findByText("list item 1").click({ ctrlKey: true });

        cy.get("@selectHandler").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          isDeclarative ? "list item 1" : ITEMS[0]
        );

        cy.findAllByRole("option").eq(0).should("not.have.attr", SELECTED);
        cy.findAllByRole("option").eq(1).should("not.have.attr", SELECTED);
        cy.findAllByRole("option").eq(2).should("have.attr", SELECTED);
        cy.findAllByRole("option").eq(3).should("have.attr", SELECTED);
      });
    });
  });
});
