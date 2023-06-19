import { ListNext, ListItemNext, ListNextProps } from "@salt-ds/lab";

type ItemType = { label: string; value: string };

const ITEMS: ItemType[] = [
  { label: "list item 1", value: "item 1" },
  { label: "list item 2", value: "item 2" },
  { label: "list item 3", value: "item 3" },
];

// Uncontrolled single select list
describe("An uncontrolled single select list", () => {
  const SingleSelectList = (props: ListNextProps) => {
    return (
      <ListNext {...props}>
        {props.children ||
          ITEMS.map((item, index) => {
            return (
              <ListItemNext value={item.value} key={index}>
                {item.label}
              </ListItemNext>
            );
          })}
      </ListNext>
    );
  };

  describe("List height", () => {
    it("should render list with 3 list items", () => {
      cy.mount(<SingleSelectList />);

      cy.findByRole("listbox").then(($el) => {
        expect($el.height()?.toFixed(0)).to.equal("108"); // 36px * 3
      });
    });

    it("should render list with 2 list items, with displayedItemCount lower than childrenCount", () => {
      cy.mount(<SingleSelectList displayedItemCount={2} />);

      cy.findByRole("listbox").then(($el) => {
        expect($el.height()?.toFixed(0)).to.equal("72"); // 36px * 2
      });
    });

    it("should render list with 3 list items, with displayedItemCount higher than childrenCount", () => {
      cy.mount(<SingleSelectList displayedItemCount={6} />);

      cy.findByRole("listbox").then(($el) => {
        expect($el.height()?.toFixed(0)).to.equal("108"); // 36px * 3
      });
    });

    it("should render empty list", () => {
      cy.mount(<SingleSelectList children={<>Empty list</>} />);

      cy.findByRole("listbox").then(($el) => {
        expect($el.height()?.toFixed(0)).to.equal("36"); // 36px
      });
    });
  });

  it("should render all its items", () => {
    cy.mount(<SingleSelectList />);

    cy.findByText("list item 1").should("exist");
    cy.findByText("list item 2").should("exist");
    cy.findByText("list item 3").should("exist");
  });

  it("should allow a single item to be selected", () => {
    cy.mount(<SingleSelectList />);

    cy.findByRole("option", { name: ITEMS[1].label })
      .click()
      .should("have.attr", "aria-selected", "true");
  });

  it("should keep its selected item when the same item is selected", () => {
    cy.mount(<SingleSelectList />);

    cy.findByRole("option", { name: ITEMS[1].label })
      .click()
      .should("have.attr", "aria-selected", "true");
    // click to select the same list item
    cy.findByRole("option", { name: ITEMS[1].label })
      .click()
      .should("have.attr", "aria-selected", "true");
  });

  it("should deselect previous list item when a new list one is selected, for non deselectable", () => {
    cy.mount(<SingleSelectList />);

    cy.findByRole("option", { name: ITEMS[1].label })
      .click()
      .should("have.attr", "aria-selected", "true");
    // click to select a different list item
    cy.findByRole("option", { name: ITEMS[2].label })
      .click()
      .should("have.attr", "aria-selected", "true");
    cy.findByRole("option", { name: ITEMS[1].label }).should(
      "not.have.attr",
      "aria-selected",
      "true"
    );
  });

  // Disabled list
  describe("A disabled single select list", () => {
    it("should not allow any items to be selected", () => {
      cy.mount(<SingleSelectList disabled />);

      cy.findAllByRole("option").should("have.attr", "aria-disabled", "true");
    });

    it("should not allow a disabled list item to be selected", () => {
      cy.mount(
        <SingleSelectList
          children={
            <>
              <ListItemNext value={ITEMS[0].value}>
                {ITEMS[0].label}
              </ListItemNext>
              <ListItemNext value={ITEMS[1].value} disabled>
                {ITEMS[1].label}
              </ListItemNext>
              <ListItemNext value={ITEMS[2].value}>
                {ITEMS[2].label}
              </ListItemNext>
            </>
          }
        />
      );

      cy.findByRole("option", { name: ITEMS[1].label }).should(
        "have.attr",
        "aria-disabled",
        "true"
      );
    });

    it("should not be focusable on mouse hover", () => {
      cy.mount(
        <SingleSelectList
          children={
            <>
              <ListItemNext value={ITEMS[0].value}>
                {ITEMS[0].label}
              </ListItemNext>
              <ListItemNext value={ITEMS[1].value} disabled>
                {ITEMS[1].label}
              </ListItemNext>
              <ListItemNext value={ITEMS[2].value}>
                {ITEMS[2].label}
              </ListItemNext>
            </>
          }
        />
      );

      cy.findByRole("option", { name: ITEMS[1].label })
        .realHover()
        .should("not.have.class", "saltListItemNext-focused");
    });
  });

  // Keyboard navigations for uncontrolled single select list
  describe("Keyboard navigation and interactions", () => {
    it("should select list item on Space or Enter key", () => {
      cy.mount(<SingleSelectList />);

      cy.findByRole("listbox").focus();
      cy.realPress("ArrowDown");
      cy.realPress("Space"); // select second list item
      cy.findByRole("option", { name: ITEMS[1].label }).should(
        "have.class",
        "saltListItemNext-focused"
      );
      cy.findByRole("option", { name: ITEMS[0].label }).should(
        "not.have.attr",
        "aria-selected"
      );
    });

    it("should focus and select first list item on first list keyboard focus", () => {
      cy.mount(<SingleSelectList />);

      cy.findByRole("listbox").focus();
      cy.findByRole("option", { name: ITEMS[0].label }).should(
        "have.attr",
        "aria-selected",
        "true"
      );
      cy.findByRole("option", { name: ITEMS[0].label }).should(
        "have.class",
        "saltListItemNext-focused"
      );
    });

    it("should re-focus on previously focused item when an item was previously focused", () => {
      cy.mount(<SingleSelectList />);

      cy.findByRole("listbox").focus();
      cy.realPress("ArrowDown");
      cy.findByRole("option", { name: ITEMS[1].label }).should(
        "have.class",
        "saltListItemNext-focused"
      );
      cy.findByRole("listbox").blur(); // remove focus
      cy.findByRole("listbox").focus(); // focus again
      // focus should be back on the previously focused item
      cy.findByRole("option", { name: ITEMS[1].label }).should(
        "have.class",
        "saltListItemNext-focused"
      );
    });

    it("should re-focus on previously selected item when an item was previously selected, unless focus has moved", () => {
      cy.mount(<SingleSelectList />);

      cy.findByRole("listbox").focus();
      cy.realPress("ArrowDown");
      cy.realPress("ArrowDown");
      cy.realPress("Enter");
      // list item selected
      cy.findByRole("option", { name: ITEMS[2].label }).should(
        "have.attr",
        "aria-selected",
        "true"
      );
      cy.findByRole("listbox").blur(); // remove focus
      cy.findByRole("listbox").focus(); // focus again
      // focus should be back on the previously selected item
      cy.findByRole("option", { name: ITEMS[2].label }).should(
        "have.class",
        "saltListItemNext-focused"
      );
    });

    it("should not wrap on arrow down if focus is on the last item", () => {
      cy.mount(<SingleSelectList />);

      cy.findByRole("listbox").focus();
      cy.realPress("ArrowDown");
      cy.realPress("ArrowDown");
      cy.realPress("ArrowDown");
      // focus on last list item
      cy.findByRole("option", { name: ITEMS[2].label }).should(
        "have.class",
        "saltListItemNext-focused"
      );
      cy.realPress("ArrowDown");
      // focus do not wrap
      cy.findByRole("option", { name: ITEMS[2].label }).should(
        "have.class",
        "saltListItemNext-focused"
      );
    });

    it("should not wrap on arrow up if focus is on the first item", () => {
      cy.mount(<SingleSelectList />);

      cy.findByRole("listbox").focus();
      cy.realPress("ArrowUp");
      // focus do not wrap
      cy.findByRole("option", { name: ITEMS[0].label }).should(
        "have.class",
        "saltListItemNext-focused"
      );
    });

    it("should focus on first list item on Home key press", () => {
      cy.mount(<SingleSelectList />);

      cy.findByRole("listbox").focus();
      cy.realPress("Home");
      // focus on first list item
      cy.findByRole("option", { name: ITEMS[0].label }).should(
        "have.class",
        "saltListItemNext-focused"
      );
    });

    it("should focus on last list item on End key press", () => {
      cy.mount(<SingleSelectList />);

      cy.findByRole("listbox").focus();
      cy.realPress("End");
      // focus on last list item
      cy.findByRole("option", { name: ITEMS[2].label }).should(
        "have.class",
        "saltListItemNext-focused"
      );
    });

    it("should direct focus to item previously interacted with mouse", () => {
      cy.mount(<SingleSelectList />);

      cy.findByRole("listbox").focus();
      cy.realPress("ArrowDown");
      // focus on first list item
      cy.findByRole("option", { name: ITEMS[1].label }).should(
        "have.class",
        "saltListItemNext-focused"
      );

      // mouse to click on another list item
      cy.findByRole("option", { name: ITEMS[2].label }).realClick();
      cy.findByRole("listbox").blur(); // remove focus
      cy.findByRole("listbox").focus();
      // focus should be on item previously selected using mouse
      cy.findByRole("option", { name: ITEMS[2].label }).should(
        "have.class",
        "saltListItemNext-focused"
      );
    });
  });
});
