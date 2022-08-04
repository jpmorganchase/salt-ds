import { List, ListItem } from "@jpmorganchase/uitk-lab";

type ItemWithLabel = { label: string };
const ITEMS: ItemWithLabel[] = [
  { label: "list item 1" },
  { label: "list item 2" },
  { label: "list item 3" },
  { label: "list item 4" },
];

const ITEMS_PER_PAGE = 2;

["source", "declarative"].forEach((listType) => {
  describe(`A ${listType} List`, () => {
    const isDeclarative = listType === "declarative";

    describe("with no item selected", () => {
      let onSelect;
      let onSelectionChange;

      beforeEach(() => {
        onSelectionChange = cy.stub().as("selectionChangeHandler");
        onSelect = cy.stub().as("selectHandler");
        const listProps = { onSelect, onSelectionChange };

        cy.mount(
          isDeclarative ? (
            <List id="list" {...listProps}>
              <ListItem>list item 1</ListItem>
              <ListItem>list item 2</ListItem>
              <ListItem>list item 3</ListItem>
              <ListItem>list item 4</ListItem>
            </List>
          ) : (
            <List<ItemWithLabel> id="list" source={ITEMS} {...listProps} />
          )
        );
      });

      describe("when focused", () => {
        it("should highlight the first item with a focus ring", () => {
          cy.findByRole("listbox").focus();
          cy.get(`#list-item-0`)
            .should("be.highlighted")
            .should("have.focusVisible");
        });
      });

      describe("when interacted with keyboard and focused again", () => {
        it("should highlight the first item with a focus ring", () => {
          // move focus
          cy.findByRole("listbox").focus();
          cy.realPress("ArrowDown");
          cy.realPress("ArrowDown");
          cy.findByRole("listbox").blur();

          cy.get("#list-item-2")
            .should("not.be.highlighted")
            .should("not.have.focusVisible");

          // focus again
          cy.findByRole("listbox").focus();
          cy.get("#list-item-0")
            .should("be.highlighted")
            .should("have.focusVisible");
        });
      });

      describe("when interacted with mouse and focused again", () => {
        it("should put a focus ring on the highlighted item instead", () => {
          // move highlight only, not the focus
          cy.get("#list-item-1").realHover();
          cy.get("#list-item-1").should("be.highlighted");

          // focus
          cy.findByRole("listbox").focus();
          cy.get("#list-item-1")
            .should("be.highlighted")
            .should("have.focusVisible");
        });
      });

      describe("when the 'Enter' key is pressed", () => {
        it("should select the highlighted item", () => {
          cy.findByRole("listbox").focus();
          cy.realPress("Enter");

          cy.get("#list-item-0").should("be.highlighted");
          cy.get("#list-item-0").should("have.attr", "aria-selected", "true");

          cy.get("@selectionChangeHandler").should(
            "have.been.calledWith",
            Cypress.sinon.match.any,
            isDeclarative ? "list item 1" : ITEMS[0]
          );
          cy.get("@selectHandler").should(
            "have.been.calledWith",
            Cypress.sinon.match.any,
            isDeclarative ? "list item 1" : ITEMS[0]
          );
        });
      });

      describe.skip("when the 'Enter' key is pressed after moving mouse away", () => {
        it("should not select anything", () => {
          cy.findByRole("listbox").focus();
          cy.realPress("ArrowDown");

          // check list item is correctly highlighted
          cy.get("#list-item-1").should("be.highlighted");

          // move mouse away and select
          // TODO this fails and I think it's correct to fail
          cy.findByRole("listbox").trigger("mouseleave");
          cy.realPress("Enter");

          cy.get("@selectHandler").should("not.have.been.called");
          cy.get("@selectionChangeHandler").should("not.have.been.called");
        });
      });

      describe("when the 'Space' key is pressed", () => {
        it("should select the highlighted item", () => {
          cy.findByRole("listbox").focus();
          cy.realPress("Space");

          cy.get("#list-item-0").should("be.highlighted");
          cy.get("#list-item-0").should("have.attr", "aria-selected", "true");

          cy.get("@selectionChangeHandler").should(
            "have.been.calledWith",
            Cypress.sinon.match.any,
            isDeclarative ? "list item 1" : ITEMS[0]
          );
          cy.get("@selectHandler").should(
            "have.been.calledWith",
            Cypress.sinon.match.any,
            isDeclarative ? "list item 1" : ITEMS[0]
          );
        });
      });

      describe("when the 'Tab' key is pressed", () => {
        it("should remove highlight and focus style from the list", () => {
          cy.findByRole("listbox").focus();
          cy.realPress("Tab");

          cy.get("#list .uitkHighlighted").should("not.exist");
          cy.get("#list .uitkFocusVisible").should("not.exist");
        });
      });
    });

    describe("with a selected item", () => {
      describe("when focused", () => {
        it("should highlight the selected item with a focus ring", () => {
          cy.mount(
            isDeclarative ? (
              <List id="list" defaultSelected="list item 3">
                <ListItem>list item 1</ListItem>
                <ListItem>list item 2</ListItem>
                <ListItem>list item 3</ListItem>
                <ListItem>list item 4</ListItem>
              </List>
            ) : (
              <List<ItemWithLabel, "deselectable">
                id="list"
                defaultSelected={ITEMS[2]}
                source={ITEMS}
              />
            )
          );

          cy.findByRole("listbox").focus();
          cy.get("#list-item-2")
            .should("be.highlighted")
            .should("have.focusVisible");
        });
      });
      describe("when focused, then mouse used to take highlighting off, then refocussed", () => {
        it("should highlight the selected item with a focus ring", () => {
          cy.mount(
            isDeclarative ? (
              <>
                <div id="test-div" style={{ width: 100, height: 10 }} />
                <List id="list" defaultSelected="list item 3">
                  <ListItem>list item 1</ListItem>
                  <ListItem>list item 2</ListItem>
                  <ListItem>list item 3</ListItem>
                  <ListItem>list item 4</ListItem>
                </List>
              </>
            ) : (
              <>
                <div id="test-div" style={{ width: 100, height: 10 }} />
                <List<ItemWithLabel, "deselectable">
                  id="list"
                  defaultSelected={ITEMS[2]}
                  source={ITEMS}
                />
              </>
            )
          );

          cy.findByRole("listbox").focus();

          cy.get("#list-item-2").realHover();
          cy.get("#list-item-1").realHover();
          cy.get("#test-div").realHover();
          cy.get("#list .uitkHighlighted").should("not.exist");
          cy.get("#list .uitkFocusVisible").should("not.exist");

          cy.findByRole("listbox").focus();
          cy.get("#list-item-2")
            .should("be.highlighted")
            .should("have.focusVisible");
        });
      });
    });
  });
});

["list", "declarative"].forEach((listType) => {
  describe(`A ${listType} List with "restoreLastFocus" prop set`, () => {
    const isDeclarative = listType === "declarative list";

    describe("with no item selected", () => {
      beforeEach(() => {
        cy.mount(
          isDeclarative ? (
            <List id="list" restoreLastFocus>
              <ListItem>list item 1</ListItem>
              <ListItem>list item 2</ListItem>
              <ListItem>list item 3</ListItem>
              <ListItem>list item 4</ListItem>
            </List>
          ) : (
            <List<ItemWithLabel, "deselectable">
              id="list"
              restoreLastFocus
              source={ITEMS}
            />
          )
        );
      });
      describe("when focused", () => {
        it("should highlight the first item with a focus ring", () => {
          cy.findByRole("listbox").focus();
          cy.get("#list-item-0")
            .should("be.highlighted")
            .should("have.focusVisible");
        });
      });
      describe("when interacted with keyboard and focused again", () => {
        it("should restore focus ring to the last interacted item", () => {
          // move focus
          cy.findByRole("listbox").focus();
          cy.realPress("ArrowDown");
          cy.realPress("ArrowDown");
          cy.findByRole("listbox").blur();
          cy.get("#list-item-2")
            .should("not.be.highlighted")
            .should("not.have.focusVisible");
          // restore focus
          cy.findByRole("listbox").focus();
          cy.get("#list-item-2")
            .should("be.highlighted")
            .should("have.focusVisible");
        });
      });

      describe("when interacted with mouse and focused again", () => {
        it("should not remember the last interacted item and put a focus ring on the highlighted item instead", () => {
          // move highlight only, not the focus
          cy.get("#list-item-1").trigger("mousemove");
          cy.get("#list-item-1").should("be.highlighted");
          // focus
          cy.findByRole("listbox").focus();
          cy.get("#list-item-1")
            .should("be.highlighted")
            .should("have.focusVisible");
        });
      });
      describe("with a selected item", () => {
        describe("when focused", () => {
          it("should focus the selected item, when there is not a previously focussed item", () => {
            cy.mount(
              isDeclarative ? (
                <List id="list" restoreLastFocus defaultSelected="list item 3">
                  <ListItem>list item 1</ListItem>
                  <ListItem>list item 2</ListItem>
                  <ListItem>list item 3</ListItem>
                  <ListItem>list item 4</ListItem>
                </List>
              ) : (
                <List<ItemWithLabel, "deselectable">
                  id="list"
                  defaultSelected={ITEMS[2]}
                  restoreLastFocus
                  source={ITEMS}
                />
              )
            );
            cy.findByRole("listbox").focus();
            cy.get("#list-item-2")
              .should("be.highlighted")
              .should("have.focusVisible");
          });
        });
        describe("when re-focused following interaction", () => {
          it("should focus the previously focussed item, ignoring the selected item", () => {
            cy.mount(
              isDeclarative ? (
                <List id="list" restoreLastFocus defaultSelected="list item 3">
                  <ListItem>list item 1</ListItem>
                  <ListItem>list item 2</ListItem>
                  <ListItem>list item 3</ListItem>
                  <ListItem>list item 4</ListItem>
                </List>
              ) : (
                <List<ItemWithLabel, "deselectable">
                  id="list"
                  defaultSelected={ITEMS[2]}
                  restoreLastFocus
                  source={ITEMS}
                />
              )
            );
            cy.findByRole("listbox").focus();
            cy.realPress("ArrowUp");
            cy.findByRole("listbox").focus();
            cy.get("#list-item-1")
              .should("be.highlighted")
              .should("have.focusVisible");
          });
        });
      });
    });
  });
});

["source", "declarative"].forEach((listType) => {
  describe(`A ${listType} List is being navigated with keyboard`, () => {
    const isDeclarative = listType === "declarative";

    beforeEach(() => {
      cy.mount(
        isDeclarative ? (
          <List displayedItemCount={ITEMS_PER_PAGE} id="list">
            <ListItem>list item 1</ListItem>
            <ListItem>list item 2</ListItem>
            <ListItem>list item 3</ListItem>
            <ListItem>list item 4</ListItem>
          </List>
        ) : (
          <List<ItemWithLabel>
            displayedItemCount={ITEMS_PER_PAGE}
            id="list"
            source={ITEMS}
          />
        )
      );
    });
    describe("when the 'End' key is pressed", () => {
      it("should move focus and highlight to the end of the list", () => {
        cy.findByRole("listbox").focus();
        cy.realPress("End");
        cy.get(`#list-item-${ITEMS.length - 1}`)
          .should("be.highlighted")
          .should("have.focusVisible");
      });
      it("should not change focus or highlight if it is at the end of the list", () => {
        cy.findByRole("listbox").focus();
        cy.realPress("End");
        cy.realPress("End");
        cy.get(`#list-item-${ITEMS.length - 1}`)
          .should("be.highlighted")
          .should("have.focusVisible");
      });
    });
    describe("when the 'Home' key is pressed", () => {
      it("should move focus and highlight to the start of the list", () => {
        cy.findByRole("listbox").focus();
        cy.realPress("End");
        cy.realPress("Home");
        cy.get("#list-item-0")
          .should("be.highlighted")
          .should("have.focusVisible");
      });
      it("should not change focus or highlight if it is at the start of the list", () => {
        cy.findByRole("listbox").focus();
        cy.realPress("End");
        cy.realPress("Home");
        cy.realPress("Home");
        cy.get("#list-item-0")
          .should("be.highlighted")
          .should("have.focusVisible");
      });
    });
    describe("when the 'ArrowDown' key is pressed", () => {
      it("should move focus and highlight one item down at a time", () => {
        cy.findByRole("listbox").focus();
        cy.realPress("ArrowDown");
        cy.realPress("ArrowDown");
        cy.get("#list-item-2")
          .should("be.highlighted")
          .should("have.focusVisible");
      });
      it("should not change focus or highlight if it is at the last item", () => {
        cy.findByRole("listbox").focus();
        cy.realPress("End");
        cy.realPress("ArrowDown");
        cy.get(`#list-item-${ITEMS.length - 1}`)
          .should("be.highlighted")
          .should("have.focusVisible");
      });
    });
    describe("when the 'ArrowUp' key is pressed", () => {
      it("should move focus and highlight one item up at a time", () => {
        cy.findByRole("listbox").focus();
        cy.realPress("ArrowDown");
        cy.realPress("ArrowDown");
        cy.realPress("ArrowUp");
        cy.realPress("ArrowUp");
        cy.get("#list-item-0")
          .should("be.highlighted")
          .should("have.focusVisible");
      });
      it("should not change focus or highlight if it is at the first item", () => {
        cy.findByRole("listbox").focus();
        cy.realPress("ArrowUp");
        cy.get("#list-item-0")
          .should("be.highlighted")
          .should("have.focusVisible");
      });
    });
    describe("when the 'PageDown' key is pressed", () => {
      it("should move focus and highlight one page down at a time", () => {
        cy.findByRole("listbox").focus();
        cy.realPress("PageDown");
        cy.get(`#list-item-${ITEMS_PER_PAGE}`)
          .should("be.highlighted")
          .should("have.focusVisible");
      });
      it("should not change focus or highlight if it is at the last item", () => {
        cy.findByRole("listbox").focus();
        cy.realPress("End");
        cy.realPress("PageDown");
        cy.get(`#list-item-${ITEMS.length - 1}`)
          .should("be.highlighted")
          .should("have.focusVisible");
      });
    });
    describe("when with the 'PageUp' key is pressed", () => {
      it("should move focus and highlight one page up at a time", () => {
        cy.findByRole("listbox").focus();
        cy.realPress("End");
        cy.realPress("PageUp");
        cy.get(`#list-item-${ITEMS.length - ITEMS_PER_PAGE - 1}`)
          .should("be.highlighted")
          .should("have.focusVisible");
      });
      it("should not change focus or highlight if it is at the first item", () => {
        cy.findByRole("listbox").focus();
        cy.realPress("PageUp");
        cy.get("#list-item-0")
          .should("be.highlighted")
          .should("have.focusVisible");
      });
    });
  });
});

["source", "declarative"].forEach((listType) => {
  const isDeclarative = listType === "declarative";
  let onSelectionChange;

  const FancyItems = ["Bar", "Foo", "Foo Bar", "Baz"];

  describe(`A ${listType} supports type to select`, () => {
    beforeEach(() => {
      onSelectionChange = cy.stub().as("selectionChangeHandler");
      const listProps = { id: "list", onSelectionChange };

      cy.mount(
        isDeclarative ? (
          <List {...listProps} displayedItemCount={ITEMS_PER_PAGE}>
            {FancyItems.map((x, i) => (
              <ListItem key={`item-${i}`}>{x}</ListItem>
            ))}
          </List>
        ) : (
          <List {...listProps} source={FancyItems} />
        )
      );
      cy.findByRole("listbox").focus();
    });
    it("supports focusing items by typing letters in rapid succession", () => {
      cy.get(`#list-item-0`)
        .should("be.highlighted")
        .should("have.focusVisible");

      // Prioritize next available option starting with B from the cyclic effect
      cy.realType("B");
      cy.get(`#list-item-3`)
        .should("be.highlighted")
        .should("have.focusVisible");

      cy.realType("A");
      cy.get(`#list-item-3`)
        .should("be.highlighted")
        .should("have.focusVisible");

      cy.realType("R");
      cy.get(`#list-item-0`)
        .should("be.highlighted")
        .should("have.focusVisible");
    });

    it("supports the space character in a search", () => {
      cy.realType("F");
      cy.get(`#list-item-1`)
        .should("be.highlighted")
        .should("have.focusVisible");
      cy.realType("O");
      cy.get(`#list-item-1`)
        .should("be.highlighted")
        .should("have.focusVisible");
      cy.realType("O");
      cy.get(`#list-item-1`)
        .should("be.highlighted")
        .should("have.focusVisible");
      cy.realPress("Space");
      cy.get(`#list-item-2`)
        .should("be.highlighted")
        .should("have.focusVisible");
      cy.realType("B");
      cy.get(`#list-item-2`)
        .should("be.highlighted")
        .should("have.focusVisible");
      cy.realType("A");
      cy.get(`#list-item-2`)
        .should("be.highlighted")
        .should("have.focusVisible");
      cy.realType("R");
      cy.get(`#list-item-2`)
        .should("be.highlighted")
        .should("have.focusVisible");
    });

    it("supports item selection using the Spacebar after search times out", () => {
      cy.realType("F");
      cy.get(`#list-item-1`)
        .should("be.highlighted")
        .should("have.focusVisible");
      cy.realType("O");
      cy.get(`#list-item-1`)
        .should("be.highlighted")
        .should("have.focusVisible");
      cy.realType("O");
      cy.get(`#list-item-1`)
        .should("be.highlighted")
        .should("have.focusVisible");
      cy.realPress("Space");
      cy.get(`#list-item-2`)
        .should("be.highlighted")
        .should("have.focusVisible");
      // Verify no selection was been made

      cy.get("#list-item-2").should("not.have.attr", "aria-selected", "true");
      // Verify onChange was not called
      cy.get("@selectionChangeHandler").should("not.have.been.called");

      cy.wait(1500);
      cy.realPress("Space");
      cy.get("#list-item-2").should("have.attr", "aria-selected", "true");
      cy.get("@selectionChangeHandler").should(
        "have.been.calledWith",
        Cypress.sinon.match.any,
        "Foo Bar"
      );
    });
    it("resets the search text after a timeout", () => {
      cy.realType("F");
      cy.get(`#list-item-1`)
        .should("be.highlighted")
        .should("have.focusVisible");
      cy.wait(1500);
      cy.realType("B");
      cy.get(`#list-item-3`)
        .should("be.highlighted")
        .should("have.focusVisible");
    });

    it("wraps around to search from the beginning when no items past the current one match", () => {
      cy.realType("B");
      cy.realType("A");
      cy.realType("Z");
      cy.get(`#list-item-3`)
        .should("be.highlighted")
        .should("have.focusVisible");
      cy.wait(1500);
      cy.realType("F");
      cy.get(`#list-item-1`)
        .should("be.highlighted")
        .should("have.focusVisible");
    });
    it("cycles through options when typing the first character repeatedly", () => {
      cy.realType("F");
      cy.get(`#list-item-1`)
        .should("be.highlighted")
        .should("have.focusVisible");
      cy.realType("F");
      cy.get(`#list-item-2`)
        .should("be.highlighted")
        .should("have.focusVisible");
      cy.realType("F");
      cy.get(`#list-item-1`)
        .should("be.highlighted")
        .should("have.focusVisible");
    });
    it("does not cycle through options when typing repeated characters after the first char", () => {
      cy.realType("F");
      cy.get(`#list-item-1`)
        .should("be.highlighted")
        .should("have.focusVisible");
      cy.realType("O");
      cy.get(`#list-item-1`)
        .should("be.highlighted")
        .should("have.focusVisible");
      cy.realType("O");
      cy.get(`#list-item-1`)
        .should("be.highlighted")
        .should("have.focusVisible");
    });
    it("supports clicking item first then by typing letters in rapid succession", () => {
      cy.get("#list-item-0").click();
      cy.realType("F");
      cy.get(`#list-item-1`)
        .should("be.highlighted")
        .should("have.focusVisible");
      cy.realType("O");
      cy.get(`#list-item-1`)
        .should("be.highlighted")
        .should("have.focusVisible");
      cy.realType("O");
      cy.get(`#list-item-1`)
        .should("be.highlighted")
        .should("have.focusVisible");
    });
    it(`A ${listType} can disable type to select`, () => {
      cy.mount(
        isDeclarative ? (
          <List
            disableTypeToSelect
            displayedItemCount={ITEMS_PER_PAGE}
            id="list"
          >
            {FancyItems.map((x, i) => (
              <ListItem key={`item-${i}`}>{x}</ListItem>
            ))}
          </List>
        ) : (
          <List
            disableTypeToSelect
            displayedItemCount={ITEMS_PER_PAGE}
            id="list"
            source={FancyItems}
          />
        )
      );
      cy.findByRole("listbox").focus();
      cy.realType("F");

      cy.get(`#list-item-1`)
        .should("not.be.highlighted")
        .should("not.have.focusVisible");
    });
  });
});

["source", "declarative"].forEach((listType) => {
  describe(`A ${listType} List supports tab to select when turned on`, () => {
    const isDeclarative = listType === "declarative list";

    beforeEach(() => {
      cy.mount(
        isDeclarative ? (
          <List id="list" tabToSelect>
            <ListItem>list item 1</ListItem>
            <ListItem>list item 2</ListItem>
            <ListItem>list item 3</ListItem>
            <ListItem>list item 4</ListItem>
          </List>
        ) : (
          <List<ItemWithLabel> id="list" source={ITEMS} tabToSelect />
        )
      );
    });

    it("should select the highlighted item", () => {
      cy.findByRole("listbox").focus();
      cy.realPress("Tab");
      cy.get("#list-item-0").should("have.attr", "aria-selected", "true");
    });
  });
});
