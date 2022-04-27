import { ComponentType } from "react";

import { Dropdown, MultiSelectDropdown } from "@jpmorganchase/uitk-lab";

/**
 * Changes applied
 *
 * - Replace dropdownClasses with plain string className
 * - Replace getByTestId('dropdown-list') with findByTestId, so that it won't
 *   trigger act warning on Popper's createPortal
 * - Use beforeEach instead of beforeAll for jest.useFakeTimers(), otherwise
 *   useTimeout returns undefined
 */

/**
 * getByTestId 'dropdown-button' and 'dropdownlist' are used for the convenience of
 * not needing to differentiate between 'listbox' and 'option' roles where both the
 * button and the list shares them.
 */
["", "MultiSelect"].forEach((type) => {
  const isMultiSelect = !!type;
  const Component: ComponentType<any> = isMultiSelect
    ? MultiSelectDropdown
    : Dropdown;

  describe(`Given a ${type}Dropdown component`, () => {
    const testSource = ["Bar", "Foo", "Foo Bar", "Baz"];

    describe("When initial is closed", () => {
      ([" ", "{enter}", "{downarrow}"] as const).forEach((key) => {
        specify(`Pressing "${key}" should open the menu`, () => {
          cy.mount(<Component source={testSource} />);
          cy.findByTestId("dropdown-button").focus();
          cy.realPress(key);
          cy.findByTestId("dropdown-button").should("exist");
        });
      });

      specify("Pressing TAB key should not open the menu", () => {
        cy.mount(<Component source={testSource} />);
        cy.findByTestId("dropdown-button").focus();
        cy.realPress("Tab");
        cy.findByTestId("dropdown-list").should("not.exist");
      });
    });

    describe("When initialIsOpen", () => {
      ([" ", "{enter}"] as const).forEach((key) => {
        specify(
          `Pressing "${key}" should ${
            isMultiSelect ? "not" : ""
          } close the menu and select first item`,
          () => {
            cy.mount(
              <Component
                ListProps={{ id: "list" }}
                initialIsOpen
                source={testSource}
              />
            );
            cy.findByTestId("dropdown-button").focus();
            cy.realPress(key);
            if (isMultiSelect) {
              cy.findByTestId("dropdown-list").should("exist");
            } else {
              cy.findByTestId("dropdown-list").should("not.exist");
            }

            cy.findByTestId("dropdown-button").within(() => {
              cy.findByText(testSource[0]).should("exist");
            });
          }
        );
      });

      specify(
        "Pressing ESC key should close the menu but without item selected",
        () => {
          cy.mount(
            <Component
              ListProps={{ id: "list" }}
              initialIsOpen
              source={testSource}
            />
          );
          cy.findByTestId("dropdown-button").focus();
          cy.realPress("{esc}");
          cy.findByTestId("dropdown-list").should("not.exist");
          cy.findByText(testSource[0]).should("not.exist");
        }
      );

      specify("Pressing ArrowDown should highlight second item", () => {
        cy.mount(
          <Component
            ListProps={{ id: "list" }}
            initialIsOpen
            source={testSource}
          />
        );
        cy.findByTestId("dropdown-button").focus();
        cy.realPress("{downarrow}");
        cy.findByTestId("dropdown-button").should(
          "have.attr",
          "aria-activedescendant",
          "list-item-1"
        );
      });

      specify("Pressing End should highlight last item", () => {
        cy.mount(
          <Component
            ListProps={{ id: "list" }}
            initialIsOpen
            source={testSource}
          />
        );
        cy.findByTestId("dropdown-button").focus();
        cy.realPress("{end}");
        cy.findByTestId("dropdown-button").should(
          "have.attr",
          "aria-activedescendant",
          `list-item-${testSource.length - 1}`
        );
      });

      specify(
        `Pressing Tab after highlighting on a new item should ${
          isMultiSelect ? "not " : ""
        }select it`,
        () => {
          cy.mount(
            <Component
              ListProps={{ id: "list" }}
              initialIsOpen
              source={testSource}
            />
          );
          cy.findByTestId("dropdown-button").focus();

          cy.findByTestId("dropdown-button").within(() => {
            cy.findByText(testSource[1]).should("not.exist");
          });

          cy.realPress("{downarrow}");
          cy.realPress("Tab");
          cy.findByTestId("dropdown-button").within(() => {
            cy.findByText(testSource[1]).should(
              isMultiSelect ? "not.exist" : "exist"
            );
          });
        }
      );

      describe("supports type to highlight", () => {
        it("supports focusing items by typing letters in rapid succession", () => {
          cy.mount(
            <Component
              ListProps={{ id: "list" }}
              initialIsOpen
              source={testSource}
            />
          );
          cy.findByTestId("dropdown-button").focus();

          cy.findByTestId("dropdown-button").should(
            "have.attr",
            "aria-activedescendant",
            "list-item-0"
          );

          // Prioritize next available option starting with B from the cyclic effect
          cy.realPress("B");
          cy.findByTestId("dropdown-button").should(
            "have.attr",
            "aria-activedescendant",
            "list-item-3"
          );

          cy.realPress("A");
          cy.findByTestId("dropdown-button").should(
            "have.attr",
            "aria-activedescendant",
            "list-item-3"
          );

          cy.realPress("R");
          cy.findByTestId("dropdown-button").should(
            "have.attr",
            "aria-activedescendant",
            "list-item-0"
          );
        });

        it("supports the space character in a search without closing the menu", () => {
          cy.mount(
            <Component
              ListProps={{ id: "list" }}
              initialIsOpen
              source={testSource}
            />
          );
          cy.findByTestId("dropdown-button").focus();

          cy.findByTestId("dropdown-button").should(
            "have.attr",
            "aria-activedescendant",
            "list-item-0"
          );

          cy.realPress("F");
          cy.findByTestId("dropdown-button").should(
            "have.attr",
            "aria-activedescendant",
            "list-item-1"
          );

          cy.realPress("O");
          cy.findByTestId("dropdown-button").should(
            "have.attr",
            "aria-activedescendant",
            "list-item-1"
          );

          cy.realPress("O");
          cy.findByTestId("dropdown-button").should(
            "have.attr",
            "aria-activedescendant",
            "list-item-1"
          );

          cy.realPress(" ");
          cy.findByTestId("dropdown-button").should(
            "have.attr",
            "aria-activedescendant",
            "list-item-2"
          );

          cy.realPress("B");
          cy.findByTestId("dropdown-button").should(
            "have.attr",
            "aria-activedescendant",
            "list-item-2"
          );

          cy.realPress("A");
          cy.findByTestId("dropdown-button").should(
            "have.attr",
            "aria-activedescendant",
            "list-item-2"
          );

          cy.realPress("R");
          cy.findByTestId("dropdown-button").should(
            "have.attr",
            "aria-activedescendant",
            "list-item-2"
          );
        });

        it("supports item selection using the Spacebar after search times out", () => {
          cy.mount(
            <Component
              ListProps={{ id: "list" }}
              initialIsOpen
              source={testSource}
            />
          );
          cy.findByTestId("dropdown-button").focus();

          cy.findByTestId("dropdown-button").should(
            "have.attr",
            "aria-activedescendant",
            "list-item-0"
          );

          cy.realPress("F");
          cy.findByTestId("dropdown-button").should(
            "have.attr",
            "aria-activedescendant",
            "list-item-1"
          );

          cy.realPress("O");
          cy.findByTestId("dropdown-button").should(
            "have.attr",
            "aria-activedescendant",
            "list-item-1"
          );

          cy.realPress("O");
          cy.findByTestId("dropdown-button").should(
            "have.attr",
            "aria-activedescendant",
            "list-item-1"
          );

          cy.realPress(" ");
          cy.findByTestId("dropdown-button").should(
            "have.attr",
            "aria-activedescendant",
            "list-item-2"
          );

          // Advance the timers so we can select using the Spacebar
          cy.wait(1500);

          cy.realPress(" ");
          if (!isMultiSelect) {
            // Closes menu
            cy.findByTestId("dropdown-list").should("not.exist");
          }

          cy.findByTestId("dropdown-button").within(() => {
            cy.findByText("Foo Bar").should("exist");
          });
        });

        it("resets the search text after a timeout", () => {
          cy.mount(
            <Component
              ListProps={{ id: "list" }}
              initialIsOpen
              source={testSource}
            />
          );
          cy.findByTestId("dropdown-button").focus();
          cy.realPress("F");
          cy.findByTestId("dropdown-button").should(
            "have.attr",
            "aria-activedescendant",
            "list-item-1"
          );

          cy.wait(1500);

          cy.realPress("B");
          cy.findByTestId("dropdown-button").should(
            "have.attr",
            "aria-activedescendant",
            "list-item-3"
          );
        });

        it("wraps around to search from the beginning when no items past the current one match", () => {
          cy.mount(
            <Component
              ListProps={{ id: "list" }}
              initialIsOpen
              source={testSource}
            />
          );
          cy.findByTestId("dropdown-button").focus();
          cy.realPress("B");
          cy.realPress("A");
          cy.realPress("Z");
          cy.findByTestId("dropdown-button").should(
            "have.attr",
            "aria-activedescendant",
            "list-item-3"
          );

          cy.wait(1500);

          cy.realPress("F");
          cy.findByTestId("dropdown-button").should(
            "have.attr",
            "aria-activedescendant",
            "list-item-1"
          );
        });

        it("cycles through options when typing the first character repeatedly", () => {
          cy.mount(
            <Component
              ListProps={{ id: "list" }}
              initialIsOpen
              source={testSource}
            />
          );
          cy.findByTestId("dropdown-button").focus();
          cy.realPress("F");
          cy.findByTestId("dropdown-button").should(
            "have.attr",
            "aria-activedescendant",
            "list-item-1"
          );

          cy.realPress("F");
          cy.findByTestId("dropdown-button").should(
            "have.attr",
            "aria-activedescendant",
            "list-item-2"
          );

          cy.realPress("F");
          cy.findByTestId("dropdown-button").should(
            "have.attr",
            "aria-activedescendant",
            "list-item-1"
          );
        });
      });
    });

    describe("When disabled", () => {
      specify("Clicking it should not open the menu", () => {
        cy.mount(<Component disabled source={testSource} />);
        cy.findByTestId("dropdown-button").click();

        cy.findByTestId("dropdown-list").should("not.exist");
      });

      specify("Pressing Enter should not open the menu", () => {
        cy.mount(<Component disabled source={testSource} />);
        cy.findByTestId("dropdown-button").focus();
        cy.realPress("{enter}");
        cy.findByTestId("dropdown-list").should("not.exist");
      });
    });

    specify("Pressing ALT + ARROW DOWN key should not be propagated", () => {
      const parentKeyDownSpy = cy.stub().as("keyDownSpy");

      cy.mount(
        <div onKeyDown={parentKeyDownSpy}>
          <Component source={testSource} />
        </div>
      );

      cy.findByTestId("dropdown-button").focus();
      cy.realPress(["Alt", "ArrowDown"]);
      cy.get("@keyDownSpy").should("have.callCount", 1);
    });

    specify(
      "When isOpen is controlled, TAB onto it should still allow navigation",
      () => {
        cy.mount(
          <Component ListProps={{ id: "list" }} isOpen source={testSource} />
        );

        cy.findByTestId("dropdown-button").focus();
        cy.findByTestId("dropdown-button").should(
          "have.attr",
          "aria-activedescendant",
          "list-item-0"
        );
        cy.realPress("ArrowDown");
        cy.findByTestId("dropdown-button").should(
          "have.attr",
          "aria-activedescendant",
          "list-item-1"
        );
      }
    );
  });
});
