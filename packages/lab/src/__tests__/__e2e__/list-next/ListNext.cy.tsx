import { ListNext, ListItemNext, ListNextProps } from "@salt-ds/lab";

type ItemType = { label: string; value: string };

const ITEMS: ItemType[] = [
  { label: "list item 1", value: "item 1" },
  { label: "list item 2", value: "item 2" },
  { label: "list item 3", value: "item 3" },
];

describe("GIVEN a list", () => {
  describe("GIVEN a single select list", () => {
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

    it("SHOULD render all list items", () => {
      cy.mount(<SingleSelectList />);

      cy.findByText("list item 1").should("exist");
      cy.findByText("list item 2").should("exist");
      cy.findByText("list item 3").should("exist");
    });

    it("SHOULD allow a single item to be selected", () => {
      cy.mount(
        <SingleSelectList
          onChange={cy.spy().as("onChange")}
          onSelect={cy.spy().as("onSelect")}
        />
      );

      cy.findByRole("option", { name: ITEMS[1].label })
        .click()
        .should("have.attr", "aria-selected", "true");
      cy.get("@onChange").should("have.been.calledOnce");
      cy.get("@onSelect").should("have.been.calledOnce");
    });

    it("SHOULD keep its selected item when the same item is selected", () => {
      cy.mount(
        <SingleSelectList
          onChange={cy.spy().as("onChange")}
          onSelect={cy.spy().as("onSelect")}
        />
      );

      cy.findByRole("option", { name: ITEMS[1].label })
        .click()
        .should("have.attr", "aria-selected", "true");
      // click to select the same list item
      cy.findByRole("option", { name: ITEMS[1].label })
        .click()
        .should("have.attr", "aria-selected", "true");
      cy.get("@onChange").should("have.been.calledOnce");
      cy.get("@onSelect").should("have.been.calledTwice");
    });

    it("SHOULD deselect previous list item when a new list one is selected", () => {
      cy.mount(<SingleSelectList />);

      cy.findByRole("option", { name: ITEMS[1].label })
        .click()
        .should("have.attr", "aria-selected", "true");
      // select a different list item
      cy.findByRole("option", { name: ITEMS[2].label })
        .click()
        .should("have.attr", "aria-selected", "true");
      cy.findByRole("option", { name: ITEMS[1].label }).should(
        "not.have.attr",
        "aria-selected",
        "true"
      );
    });

    describe("WHEN disabled", () => {
      describe("WHEN entire list is disabled", () => {
        it("THEN all items should be disabled", () => {
          cy.mount(<SingleSelectList disabled />);

          cy.findAllByRole("option").should(
            "have.attr",
            "aria-disabled",
            "true"
          );
        });
      });

      describe("WHEN list item is disabled", () => {
        it("THEN it's not selectable", () => {
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

          cy.findByRole("option", { name: ITEMS[1].label }).click();
          cy.findByRole("option", { name: ITEMS[1].label }).should(
            "not.have.attr",
            "aria-selected"
          );
        });
      });
    });

    describe("WHEN interacted via keyboard", () => {
      it("SHOULD select list item on Space or Enter key", () => {
        cy.mount(<SingleSelectList />);

        cy.findByRole("listbox").focus();
        cy.realPress("ArrowDown");
        cy.realPress("Enter"); // select second list item
        cy.findByRole("option", { name: ITEMS[1].label })
          .should("have.class", "saltListItemNext-focused")
          .should("have.attr", "aria-selected");
        cy.realPress("ArrowDown");
        cy.realPress("Space"); // select third list item
        cy.findByRole("option", { name: ITEMS[2].label })
          .should("have.class", "saltListItemNext-focused")
          .should("have.attr", "aria-selected");
      });

      describe("WHEN on first list keyboard focus", () => {
        it("SHOULD focus first list item", () => {
          cy.mount(<SingleSelectList />);

          cy.findByRole("listbox").focus();
          cy.findByRole("option", { name: ITEMS[0].label }).should(
            "have.class",
            "saltListItemNext-focused"
          );
        });
      });

      describe("WHEN an item was previously focused", () => {
        it("SHOULD re-focus on previously focused item", () => {
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
      });

      describe("WHEN focus is on the last item", () => {
        it("THEN focus does not wrap on arrow down", () => {
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
      });

      describe("WHEN focus is on the first item", () => {
        it("THEN focus does not wrap on arrow up", () => {
          cy.mount(<SingleSelectList />);

          cy.findByRole("listbox").focus();
          cy.realPress("ArrowUp");
          // focus do not wrap
          cy.findByRole("option", { name: ITEMS[0].label }).should(
            "have.class",
            "saltListItemNext-focused"
          );
        });
      });

      describe("WHEN on Home key press", () => {
        it("THEN focus should move to the first list item", () => {
          cy.mount(<SingleSelectList />);

          cy.findByRole("listbox").focus();
          cy.findByRole("option", { name: ITEMS[1].label }).click();
          cy.realPress("Home");
          cy.findByRole("option", { name: ITEMS[0].label }).should(
            "have.class",
            "saltListItemNext-focused"
          );
        });
      });

      describe("WHEN on End key press", () => {
        it("THEN focus should move to the last list item", () => {
          cy.mount(<SingleSelectList />);

          cy.findByRole("listbox").focus();
          cy.realPress("End");
          cy.findByRole("option", { name: ITEMS[2].label }).should(
            "have.class",
            "saltListItemNext-focused"
          );
        });
      });

      describe("WHEN focus returns to the list", () => {
        it("THEN re-focus on the last focused item", () => {
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
          // return to list with keyboard
          cy.realPress("Tab");
          // focus should be on item previously selected using mouse
          cy.findByRole("option", { name: ITEMS[2].label }).should(
            "have.class",
            "saltListItemNext-focused"
          );
        });
      });
    });
    //  TODO: add controlled tests
  });
});
