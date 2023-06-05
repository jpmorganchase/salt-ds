import { ListNext, ListItemNext } from "@salt-ds/lab";

type ItemType = { label: string; value: string };

const ITEMS: ItemType[] = [
  { label: "list item 1", value: "item 1" },
  { label: "list item 2", value: "item 2" },
  { label: "list item 3", value: "item 3" },
];

const ITEMS_LONG_LABEL: ItemType[] = [
  {
    label:
      "list item 1: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. ",
    value: "item 1",
  },
  {
    label:
      "list item 2: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    value: "item 2",
  },
  {
    label:
      "list item 3: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    value: "item 3",
  },
];

// Single select tests
describe("A single select list", () => {
  const SingleSelectList = (props: any) => {
    return (
      <ListNext {...props}>
        {props.children ||
          ITEMS.map((item, index) => {
            return <ListItemNext key={index}>{item.label}</ListItemNext>;
          })}
      </ListNext>
    );
  };

  describe("list width", () => {
    it("should render list with given width", () => {
      cy.mount(SingleSelectList({ style: { width: "80px" } }));

      cy.findByRole("listbox").should("have.css", "width", "80px");
    });

    // TODO: enable test when tooltip is ready
    // it("should render list with long labels, wrap text and show tooltip", () => {
    //   cy.mount(
    //     SingleSelectList({
    //       children: ITEMS_LONG_LABEL.map((item, index) => {
    //         return <ListItemNext key={index}>{item.label}</ListItemNext>;
    //       }),
    //       style: { width: "100px" },
    //     })
    //   );

    //   cy.findByRole("listbox").should("have.css", "width", "100px");
    //   cy.findByRole("option", { name: ITEMS_LONG_LABEL[1].label }).trigger(
    //     "mouseover"
    //   );
    //   cy.findByRole("tooltip").should("exist");
    // });
  });

  describe("list height", () => {
    it("should render list with 3 list items", () => {
      cy.mount(SingleSelectList({}));

      cy.findByRole("listbox").should("have.css", "height", "108px"); // 36px * 3
    });

    it("should render list with 3 list items, displayedItemCount lower than childrenCount", () => {
      cy.mount(SingleSelectList({ displayedItemCount: 2 }));

      cy.findByRole("listbox").should("have.css", "height", "72px"); // 36px * 2
    });

    it("should render list with 3 list items, displayedItemCount higher than childrenCount", () => {
      cy.mount(SingleSelectList({ displayedItemCount: 6 }));

      cy.findByRole("listbox").should("have.css", "height", "108px"); // 36px * 3
    });

    it("should render borderless list", () => {
      cy.mount(SingleSelectList({ borderless: true }));

      cy.findByRole("listbox").should("have.css", "height", "108px"); // 36px * 3
    });

    it("should render empty list", () => {
      cy.mount(SingleSelectList({ children: <>Empty list</> }));

      cy.findByRole("listbox").should("have.css", "height", "36px"); // 36px
    });
  });

  it("should render all its items", () => {
    cy.mount(SingleSelectList({}));

    cy.findByText("list item 1").should("exist");
    cy.findByText("list item 2").should("exist");
    cy.findByText("list item 3").should("exist");
  });

  it("should render a borderless list ", () => {
    cy.mount(SingleSelectList({ borderless: true }));

    cy.findByRole("listbox").should("have.class", "saltList-borderless");
  });

  it("should allow a single item to be selected", () => {
    cy.mount(SingleSelectList({}));

    cy.findByRole("option", { name: ITEMS[1].label })
      .click()
      .should("have.attr", "aria-selected", "true");
  });

  it("should keep its selected item when the same item is selected", () => {
    cy.mount(SingleSelectList({}));

    cy.findByRole("option", { name: ITEMS[1].label })
      .click()
      .should("have.attr", "aria-selected", "true");
    // click to select the same list item
    cy.findByRole("option", { name: ITEMS[1].label })
      .click()
      .should("have.attr", "aria-selected", "true");
  });

  it("should deselect previous item when a new one is selected, for non deselectable", () => {
    cy.mount(SingleSelectList({}));

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

  // it("should deselect a selected item if it gets disabled", () => {}); // should disabling a selected item deselect it?

  // Disabled list
  describe("A disabled single select list", () => {
    it("should not allow any items to be selected", () => {
      cy.mount(SingleSelectList({ disabled: true }));

      cy.findAllByRole("option").should("have.attr", "aria-disabled", "true");
    });

    it("should not allow a disabled list item to be selected", () => {
      cy.mount(
        SingleSelectList({
          children: (
            <>
              <ListItemNext>{ITEMS[0].label}</ListItemNext>
              <ListItemNext disabled>{ITEMS[1].label}</ListItemNext>
              <ListItemNext>{ITEMS[2].label}</ListItemNext>
            </>
          ),
        })
      );

      cy.findByRole("option", { name: ITEMS[1].label }).should(
        "have.attr",
        "aria-disabled",
        "true"
      );
    });

    // TODO: check if disabled list item is focusable using keyboard interactions?
    it("should not be focusable on mouse hover", () => {
      cy.mount(
        SingleSelectList({
          children: (
            <>
              <ListItemNext>{ITEMS[0].label}</ListItemNext>
              <ListItemNext disabled>{ITEMS[1].label}</ListItemNext>
              <ListItemNext>{ITEMS[2].label}</ListItemNext>
            </>
          ),
        })
      );

      cy.findByRole("option", { name: ITEMS[1].label })
        .realHover()
        .should("not.have.class", "saltListItemNext-focused");
    });
  });

  describe("Keyboard navigation and interactions for single select", () => {
    it("should select list item on Space key", () => {
      cy.mount(SingleSelectList({}));

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
      cy.mount(SingleSelectList({}));

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
      cy.mount(SingleSelectList({}));

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
      cy.mount(SingleSelectList({}));

      cy.findByRole("listbox").focus();
      cy.realPress("ArrowDown");
      cy.realPress("ArrowDown");
      cy.realPress("Space");
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
      cy.mount(SingleSelectList({}));

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
      cy.mount(SingleSelectList({}));

      cy.findByRole("listbox").focus();
      cy.realPress("ArrowUp");
      // focus do not wrap
      cy.findByRole("option", { name: ITEMS[0].label }).should(
        "have.class",
        "saltListItemNext-focused"
      );
    });

    it("should focus on first list item on Home key press", () => {
      cy.mount(SingleSelectList({}));

      cy.findByRole("listbox").focus();
      cy.realPress("Home");
      // focus on first list item
      cy.findByRole("option", { name: ITEMS[0].label }).should(
        "have.class",
        "saltListItemNext-focused"
      );
    });

    it("should focus on last list item on End key press", () => {
      cy.mount(SingleSelectList({}));

      cy.findByRole("listbox").focus();
      cy.realPress("End");
      // focus on last list item
      cy.findByRole("option", { name: ITEMS[2].label }).should(
        "have.class",
        "saltListItemNext-focused"
      );
    });

    it("should direct focus to item previously interacted with mouse", () => {
      cy.mount(SingleSelectList({}));

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

  // Deselectable single select tests
  describe("A deselectable single select list", () => {
    it("should allow to deselect an item if deselectable is active", () => {
      cy.mount(SingleSelectList({ deselectable: true }));

      cy.findByRole("option", { name: ITEMS[1].label })
        .click()
        .should("have.attr", "aria-selected", "true")
        .click()
        .should("not.have.attr", "aria-selected", "true");
    });
  });
});

describe("A list with no items", () => {
  it("should render an empty list with the default placeholder", () => {
    cy.mount(<ListNext />);

    cy.findByText("No data to display").should("exist");
  });
});
