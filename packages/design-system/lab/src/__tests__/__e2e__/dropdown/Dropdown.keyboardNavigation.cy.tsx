import { Dropdown, SelectionStrategy } from "@jpmorganchase/uitk-lab";

/**
 * Changes applied
 *
 * - Replace dropdownClasses with plain string className
 * - Replace getByTestId('dropdown-list') with findByTestId, so that it won't
 *   trigger act warning on Popper's createPortal
 * - Use beforeEach instead of beforeAll for jest.useFakeTimers(), otherwise
 *   useTimeout returns undefined
 */

const testSource = ["Bar", "Foo", "Foo Bar", "Baz"];

/**
 * getByTestId 'dropdown-button' and 'dropdownlist' are used for the convenience of
 * not needing to differentiate between 'listbox' and 'option' roles where both the
 * button and the list shares them.
 */
["", "MultiSelect"].forEach((type) => {
  const isMultiSelect = !!type;
  const selectionStrategy = isMultiSelect
    ? "multiple"
    : ("default" as SelectionStrategy);

  describe(`Given a ${type}Dropdown Dropdown`, () => {
    describe("When initial is closed", () => {
      ([" ", "{enter}", "{downarrow}"] as const).forEach((key) => {
        specify(`Pressing "${key}" should open the menu`, () => {
          cy.mount(
            <Dropdown
              id="test"
              selectionStrategy={selectionStrategy}
              source={testSource}
            />
          );
          cy.get("#test-control").focus();
          cy.realPress(key);
          cy.get("#test-popup").should("exist");
        });
      });

      specify("Pressing TAB key should not open the menu", () => {
        cy.mount(
          <Dropdown
            id="test"
            selectionStrategy={selectionStrategy}
            source={testSource}
          />
        );
        cy.get("#test-control").focus();
        cy.realPress("Tab");
        cy.get("#test-popup").should("not.exist");
      });
    });

    describe("When defaultIsOpen", () => {
      (["Space", "Enter"] as const).forEach((key) => {
        specify(
          `Pressing "${key}" should ${
            isMultiSelect ? "not" : ""
          } close the menu and select first item`,
          () => {
            cy.mount(
              <Dropdown
                defaultIsOpen
                id="test"
                selectionStrategy={selectionStrategy}
                source={testSource}
              />
            );
            cy.get("#test-control").focus();
            cy.realPress(key);
            if (isMultiSelect) {
              cy.get("#test-popup").should("exist");
            } else {
              cy.get("#test-popup").should("not.exist");
            }

            cy.get("#test-control").within(() => {
              cy.findByText(testSource[0]).should("exist");
            });
          }
        );
      });

      specify(
        "Pressing ESC key should close the menu but without item selected",
        () => {
          cy.mount(
            <Dropdown
              id="test"
              selectionStrategy={selectionStrategy}
              source={testSource}
              defaultIsOpen
            />
          );
          cy.get("#test-control").focus();
          cy.realPress("Escape");
          cy.get("#test-popup").should("not.exist");
          cy.findByText(testSource[0]).should("not.exist");
        }
      );

      specify("Pressing ArrowDown should highlight second item", () => {
        cy.mount(
          <Dropdown
            defaultIsOpen
            id="test"
            selectionStrategy={selectionStrategy}
            source={testSource}
          />
        );
        cy.get("#test-control").focus();
        cy.realPress("ArrowDown");
        cy.get("#test-control").should(
          "have.attr",
          "aria-activedescendant",
          "test-item-1"
        );
      });

      specify("Pressing End should highlight last item", () => {
        cy.mount(
          <Dropdown
            defaultIsOpen
            id="test"
            selectionStrategy={selectionStrategy}
            source={testSource}
          />
        );
        cy.get("#test-control").focus();
        cy.realPress("End");
        cy.get("#test-control").should(
          "have.attr",
          "aria-activedescendant",
          `test-item-${testSource.length - 1}`
        );
      });

      specify(
        `Pressing Tab after highlighting on a new item should ${
          isMultiSelect ? "not " : ""
        }select it`,
        () => {
          cy.mount(
            <Dropdown
              defaultIsOpen
              id="test"
              selectionStrategy={selectionStrategy}
              source={testSource}
            />
          );
          cy.get("#test-control").focus();

          cy.get("#test-control").within(() => {
            cy.findByText(testSource[1]).should("not.exist");
          });

          cy.realPress("ArrowDown");
          cy.realPress("Tab");
          cy.get("#test-control").within(() => {
            cy.findByText(testSource[1]).should(
              isMultiSelect ? "not.exist" : "exist"
            );
          });
        }
      );

      describe("supports type to highlight", () => {
        it("supports focusing items by typing letters in rapid succession", () => {
          cy.mount(
            <Dropdown
              defaultIsOpen
              id="test"
              selectionStrategy={selectionStrategy}
              source={testSource}
            />
          );
          cy.get("#test-control").focus();

          cy.get("#test-control").should(
            "have.attr",
            "aria-activedescendant",
            "test-item-0"
          );

          // Prioritize next available option starting with B from the cyclic effect
          cy.realPress("B");
          cy.get("#test-control").should(
            "have.attr",
            "aria-activedescendant",
            "test-item-3"
          );

          cy.realPress("A");
          cy.get("#test-control").should(
            "have.attr",
            "aria-activedescendant",
            "test-item-3"
          );

          cy.realPress("R");
          cy.get("#test-control").should(
            "have.attr",
            "aria-activedescendant",
            "test-item-0"
          );
        });

        it("supports the space character in a search without closing the menu", () => {
          cy.mount(
            <Dropdown
              defaultIsOpen
              id="test"
              selectionStrategy={selectionStrategy}
              source={testSource}
            />
          );
          cy.get("#test-control").focus();

          cy.get("#test-control").should(
            "have.attr",
            "aria-activedescendant",
            "test-item-0"
          );

          cy.realPress("F");
          cy.get("#test-control").should(
            "have.attr",
            "aria-activedescendant",
            "test-item-1"
          );

          cy.realPress("O");
          cy.get("#test-control").should(
            "have.attr",
            "aria-activedescendant",
            "test-item-1"
          );

          cy.realPress("O");
          cy.get("#test-control").should(
            "have.attr",
            "aria-activedescendant",
            "test-item-1"
          );

          cy.realPress("Space");
          cy.get("#test-control").should(
            "have.attr",
            "aria-activedescendant",
            "test-item-2"
          );

          cy.realPress("B");
          cy.get("#test-control").should(
            "have.attr",
            "aria-activedescendant",
            "test-item-2"
          );

          cy.realPress("A");
          cy.get("#test-control").should(
            "have.attr",
            "aria-activedescendant",
            "test-item-2"
          );

          cy.realPress("R");
          cy.get("#test-control").should(
            "have.attr",
            "aria-activedescendant",
            "test-item-2"
          );
        });

        it("supports item selection using the Spacebar after search times out", () => {
          cy.mount(
            <Dropdown
              defaultIsOpen
              id="test"
              selectionStrategy={selectionStrategy}
              source={testSource}
            />
          );
          cy.get("#test-control").focus();

          cy.get("#test-control").should(
            "have.attr",
            "aria-activedescendant",
            "test-item-0"
          );

          cy.realPress("F");
          cy.get("#test-control").should(
            "have.attr",
            "aria-activedescendant",
            "test-item-1"
          );

          cy.realPress("O");
          cy.get("#test-control").should(
            "have.attr",
            "aria-activedescendant",
            "test-item-1"
          );

          cy.realPress("O");
          cy.get("#test-control").should(
            "have.attr",
            "aria-activedescendant",
            "test-item-1"
          );

          cy.realPress("Space");
          cy.get("#test-control").should(
            "have.attr",
            "aria-activedescendant",
            "test-item-2"
          );

          // Advance the timers so we can select using the Spacebar
          cy.wait(1500);

          cy.realPress("Space");
          if (!isMultiSelect) {
            // Closes menu
            cy.findByTestId("dropdown-list").should("not.exist");
          }

          cy.get("#test-control").within(() => {
            cy.findByText("Foo Bar").should("exist");
          });
        });

        it("resets the search text after a timeout", () => {
          cy.mount(
            <Dropdown
              defaultIsOpen
              id="test"
              selectionStrategy={selectionStrategy}
              source={testSource}
            />
          );
          cy.get("#test-control").focus();
          cy.realPress("F");
          cy.get("#test-control").should(
            "have.attr",
            "aria-activedescendant",
            "test-item-1"
          );

          cy.wait(1500);

          cy.realPress("B");
          cy.get("#test-control").should(
            "have.attr",
            "aria-activedescendant",
            "test-item-3"
          );
        });

        it("wraps around to search from the beginning when no items past the current one match", () => {
          cy.mount(
            <Dropdown
              defaultIsOpen
              id="test"
              selectionStrategy={selectionStrategy}
              source={testSource}
            />
          );
          cy.get("#test-control").focus();
          cy.realPress("B");
          cy.realPress("A");
          cy.realPress("Z");
          cy.get("#test-control").should(
            "have.attr",
            "aria-activedescendant",
            "test-item-3"
          );

          cy.wait(1500);

          cy.realPress("F");
          cy.get("#test-control").should(
            "have.attr",
            "aria-activedescendant",
            "test-item-1"
          );
        });

        it("cycles through options when typing the first character repeatedly", () => {
          cy.mount(
            <Dropdown
              defaultIsOpen
              id="test"
              selectionStrategy={selectionStrategy}
              source={testSource}
            />
          );
          cy.get("#test-control").focus();
          cy.realPress("F");
          cy.get("#test-control").should(
            "have.attr",
            "aria-activedescendant",
            "test-item-1"
          );

          cy.realPress("F");
          cy.get("#test-control").should(
            "have.attr",
            "aria-activedescendant",
            "test-item-2"
          );

          cy.realPress("F");
          cy.get("#test-control").should(
            "have.attr",
            "aria-activedescendant",
            "test-item-1"
          );
        });
      });

      specify.skip(
        "Pressing ALT + ARROW DOWN key should not be propagated",
        () => {
          const parentKeyDownSpy = cy.stub().as("keyDownSpy");

          cy.mount(
            <div onKeyDown={parentKeyDownSpy}>
              <Dropdown source={testSource} id="test" />
            </div>
          );

          cy.get("#test-control").focus();
          cy.realPress(["Alt", "ArrowDown"]);
          cy.get("@keyDownSpy").should("have.callCount", 1);
        }
      );

      specify(
        "When isOpen is controlled, TAB onto it should still allow navigation",
        () => {
          cy.mount(
            <Dropdown
              isOpen
              id="test"
              selectionStrategy={selectionStrategy}
              source={testSource}
            />
          );

          cy.get("#test-control").focus();
          cy.get("#test-control").should(
            "have.attr",
            "aria-activedescendant",
            "test-item-0"
          );
          cy.realPress("ArrowDown");
          cy.get("#test-control").should(
            "have.attr",
            "aria-activedescendant",
            "test-item-1"
          );
        }
      );
    });

    describe("When disabled", () => {
      it("Clicking it should not open the menu", () => {
        cy.mount(
          <Dropdown
            disabled
            id="test"
            selectionStrategy={selectionStrategy}
            source={testSource}
          />
        );
        cy.get("#test-control").click();

        cy.get("#test-popup").should("not.exist");
      });

      it("Pressing Enter should not open the menu", () => {
        cy.mount(
          <Dropdown
            disabled
            id="test"
            selectionStrategy={selectionStrategy}
            source={testSource}
          />
        );
        cy.get("#test-control").focus();
        cy.realPress("Enter");
        cy.get("#test-popup").should("not.exist");
      });
    });
  });
});
