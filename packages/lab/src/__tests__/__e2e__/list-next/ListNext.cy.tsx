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

    it("should render list with long labels, wrap text and show tooltip", () => {
      cy.mount(
        SingleSelectList({
          children: ITEMS_LONG_LABEL.map((item, index) => {
            return <ListItemNext key={index}>{item.label}</ListItemNext>;
          }),
          style: { width: "100px" },
        })
      );

      cy.findByRole("listbox").should("have.css", "width", "100px");
      cy.findByRole("option", { name: ITEMS_LONG_LABEL[1].label }).trigger(
        "mouseover"
      );
      cy.findByRole("tooltip").should("exist");
    });
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
  }); // they are children rn, do we need this one?

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

    // disabled list item is focusable using keyboard interactions
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
    beforeEach(() => {
      cy.mount(SingleSelectList({}));
    });

    it("should select list item on Enter or Space", () => {
      cy.findByRole("listbox").focus();
      cy.realPress("ArrowDown");
      cy.findByRole("option", { name: ITEMS[0].label }).should(
        "have.class",
        "saltListItemNext-focused"
      );

      // select first list item
      cy.realPress("Enter");
      cy.findByRole("option", { name: ITEMS[0].label }).should(
        "have.attr",
        "aria-selected",
        "true"
      );

      cy.realPress("ArrowDown");
      cy.realPress("ArrowDown");
      cy.findByRole("option", { name: ITEMS[2].label }).should(
        "have.class",
        "saltListItemNext-focused"
      );

      // select third list item
      cy.realPress("Space");
      cy.findByRole("option", { name: ITEMS[2].label }).should(
        "have.attr",
        "aria-selected",
        "true"
      );
      cy.findByRole("option", { name: ITEMS[0].label }).should(
        "not.have.attr",
        "aria-selected"
      );
    });

    it("should focus on first item on keyboard tab when no item was previously focused or selected", () => {
      cy.findByRole("listbox").focus();
      cy.realPress("ArrowDown");
      cy.findByRole("option", { name: ITEMS[0].label }).should(
        "have.class",
        "saltListItemNext-focused"
      );
    }); // on tab or on tab followed by arrow?

    it("should re-focus on previously focused item when an item was previously focused", () => {
      cy.findByRole("listbox").focus();
      cy.realPress("ArrowDown");
      cy.realPress("ArrowDown");
      // cy.realPress("ArrowDown");
      // focus on list item
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

    it("should re-focus on previously selected item when an item was previously selected", () => {
      cy.findByRole("listbox").focus();
      cy.realPress("ArrowDown");
      cy.realPress("ArrowDown");
      // cy.realPress("ArrowDown");
      cy.realPress("Space");
      // list item selected
      cy.findByRole("option", { name: ITEMS[1].label }).should(
        "have.attr",
        "aria-selected",
        "true"
      );

      cy.findByRole("listbox").blur(); // remove focus
      cy.findByRole("listbox").focus(); // focus again
      // focus should be back on the previously selected item
      cy.findByRole("option", { name: ITEMS[1].label }).should(
        "have.class",
        "saltListItemNext-focused"
      );
    });

    it("should not wrap on arrow down if focus is on the last item", () => {
      cy.findByRole("listbox").focus();
      cy.realPress("ArrowDown");
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
      cy.findByRole("listbox").focus();
      cy.realPress("ArrowDown");
      // focus on first list item
      cy.findByRole("option", { name: ITEMS[0].label }).should(
        "have.class",
        "saltListItemNext-focused"
      );
      cy.realPress("ArrowUp");
      // focus do not wrap
      cy.findByRole("option", { name: ITEMS[0].label }).should(
        "have.class",
        "saltListItemNext-focused"
      );
    });

    // it("should focus on first list item on Home key press", () => {
    //   cy.findByRole("listbox").focus();
    //   cy.realPress("Home");
    //   // focus on first list item
    //   cy.findByRole("option", { name: ITEMS[0].label }).should(
    //     "have.class",
    //     "saltListItemNext-focused"
    //   );
    // });

    // it("should focus on last list item on End key press", () => {
    //   cy.findByRole("listbox").focus();
    //   cy.realPress("End");
    //   // focus on last list item
    //   cy.findByRole("option", { name: ITEMS[2].label }).should(
    //     "have.class",
    //     "saltListItemNext-focused"
    //   );
    // });

    it("should direct focus to item previously interacted with mouse", () => {
      cy.findByRole("listbox").focus();
      cy.realPress("ArrowDown");
      // focus on first list item
      cy.findByRole("option", { name: ITEMS[0].label }).should(
        "have.class",
        "saltListItemNext-focused"
      );

      // mouse to hover on another list item
      cy.findByRole("option", { name: ITEMS[2].label }).realHover();

      cy.findByRole("listbox").focus();
      // focus should be on item previously hovered over using mouse
      cy.findByRole("option", { name: ITEMS[2].label }).should(
        "have.class",
        "saltListItemNext-focused"
      );
    });

    it("should allow disabled list items to be focusable on keyboard focus", () => {
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

      cy.findByRole("listbox").focus();
      cy.realPress("ArrowDown");
      cy.realPress("ArrowDown");
      cy.realPress("ArrowDown");
      cy.findByRole("option", { name: ITEMS[1].label }).should(
        "have.class",
        "saltListItemNext-focused"
      );
    }); // on tab or on tab followed by arrow? Fel: currently looks like it's achieved using tab followed by arrow
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

// Multi select tests
describe.only("A multi select list", () => {
  const MultiSelectList = (props: any) => {
    return (
      <ListNext multiselect {...props}>
        {ITEMS.map((item, index) => {
          return <ListItemNext key={index}>{item.label}</ListItemNext>;
        })}
      </ListNext>
    );
  };

  it("should render all list items with checkboxes", () => {
    cy.mount(MultiSelectList({}));

    cy.findByText("list item 1").should("exist");
    cy.findByText("list item 2").should("exist");
    cy.findByText("list item 3").should("exist");
    cy.findAllByRole("option").should(
      "have.class",
      "saltListItemNext-checkbox"
    );
  });

  it("should allow multiple items to be selected or deselected", () => {
    cy.mount(MultiSelectList({}));

    cy.findByRole("option", { name: `${ITEMS[0].label}` })
      .click()
      .should("have.attr", "aria-selected", "true");
    cy.findByRole("option", { name: `${ITEMS[1].label}` })
      .click()
      .should("have.attr", "aria-selected", "true");
    cy.findByRole("option", { name: `${ITEMS[2].label}` })
      .click()
      .should("have.attr", "aria-selected", "true");
    cy.findByRole("option", { name: `${ITEMS[1].label}` })
      .click()
      .should("not.have.attr", "aria-selected");
    cy.findByRole("option", { name: `${ITEMS[2].label}` })
      .click()
      .should("not.have.attr", "aria-selected");
  });

  describe("A disabled multiselect list", () => {
    it("should not allow a disabled item to be selected", () => {
      cy.mount(
        <ListNext multiselect>
          <ListItemNext>{ITEMS[0].label}</ListItemNext>
          <ListItemNext disabled>{ITEMS[1].label}</ListItemNext>
          <ListItemNext>{ITEMS[2].label}</ListItemNext>
        </ListNext>
      );

      cy.findByRole("option", { name: `${ITEMS[1].label}` })
        .should("have.attr", "aria-disabled", "true")
        .click()
        .should("not.have.attr", "aria-selected");
    });

    it("should not allow items to be selected if list is disabled", () => {
      cy.mount(MultiSelectList({ disabled: true }));

      cy.findAllByRole("option").should("have.attr", "aria-disabled", "true");
      cy.findByRole("option", { name: `${ITEMS[2].label}` })
        .click()
        .should("not.have.attr", "aria-selected");
    });
  });

  describe("Keyboard navigation and interactions for multiselect", () => {
    it.only("should allow selecting a range without disabled items", () => {
      cy.mount(MultiSelectList({}));

      cy.findByRole("listbox").focus();
      cy.realPress("Tab");
      cy.realPress("ArrowDown");
      cy.realPress(["Control", "A"]);
      cy.findAllByRole("option").should("have.attr", "aria-selected", "true");
    });
    it("should allow to selecting all items without disabled items", () => {});
    it("should allow to deselect all items", () => {});
  });
});

describe("A list with no items", () => {
  it("should render an empty list with the default placeholder", () => {
    cy.mount(<ListNext />);

    cy.findByText("No data to display").should("exist");
  });
});
