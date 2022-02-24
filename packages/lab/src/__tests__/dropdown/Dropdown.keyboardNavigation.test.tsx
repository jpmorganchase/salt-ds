import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { ComponentType } from "react";

import { Dropdown, MultiSelectDropdown } from "../../dropdown";

const expectOptionHighlightAt = (listbox: HTMLElement, index: number) => {
  expect(listbox.querySelector(`#list-item-${index}`)).toHaveClass(
    "uitkListItem-highlighted"
  );
};

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
    let button: HTMLElement;
    let menu: HTMLElement;

    describe("When initial is closed", () => {
      beforeEach(() => {
        const { getByTestId } = render(<Component source={testSource} />);

        button = getByTestId("dropdown-button");
        fireEvent.focus(button);
      });

      test("Pressing SPACE key should open the menu", async () => {
        fireEvent.keyDown(button, { key: " " });

        expect(await screen.findByTestId("dropdown-list")).toBeInTheDocument();
      });

      test("Pressing ENTER key should open the menu", async () => {
        fireEvent.keyDown(button, { key: "Enter" });

        expect(await screen.findByTestId("dropdown-list")).toBeInTheDocument();
      });

      test("Pressing ARROW DOWN key should open the menu", async () => {
        fireEvent.keyDown(button, { key: "ArrowDown" });

        expect(await screen.findByTestId("dropdown-list")).toBeInTheDocument();
      });

      test("Pressing TAB key should not make selection", () => {
        fireEvent.keyDown(button, { key: "Tab" });
        testSource.forEach((item) => {
          expect(screen.queryByText(item)).toBeNull();
        });
      });
    });

    describe("When initialIsOpen", () => {
      beforeEach(async () => {
        const { getByTestId, findByTestId } = render(
          <Component
            ListProps={{ id: "list" }}
            initialIsOpen
            source={testSource}
          />
        );

        button = getByTestId("dropdown-button");
        menu = await findByTestId("dropdown-list");
        fireEvent.focus(button);
      });

      test(`Pressing SPACE key should ${
        isMultiSelect ? "not" : ""
      } close the menu and select first item`, async () => {
        fireEvent.keyDown(button, { key: " " });

        if (isMultiSelect) {
          expect(
            await screen.findByTestId("dropdown-list")
          ).toBeInTheDocument();
        } else {
          expect(screen.queryByTestId("dropdown-list")).toBeNull();
        }

        expect(
          within(screen.getByTestId("dropdown-button")).getByText(testSource[0])
        ).toBeInTheDocument();
      });

      test(`Pressing ENTER key should ${
        isMultiSelect ? "not" : ""
      } close the menu and select first item`, async () => {
        fireEvent.keyDown(button, { key: "Enter" });

        if (isMultiSelect) {
          expect(
            await screen.findByTestId("dropdown-list")
          ).toBeInTheDocument();
        } else {
          expect(screen.queryByTestId("dropdown-list")).toBeNull();
        }

        expect(
          within(screen.getByTestId("dropdown-button")).getByText(testSource[0])
        ).toBeInTheDocument();
      });

      test("Pressing ESC key should close the menu but without item selected", async () => {
        fireEvent.keyDown(button, { key: "Esc" });

        expect(screen.queryByTestId("dropdown-list")).toBeNull();
        expect(screen.queryByText(testSource[0])).toBeNull();
      });

      test("Pressing ArrowDown should highlight second item", () => {
        fireEvent.keyDown(button, { key: "ArrowDown" });

        expectOptionHighlightAt(menu, 1);
      });

      test("Pressing End should highlight last item", () => {
        fireEvent.keyDown(button, { key: "End" });

        expectOptionHighlightAt(menu, testSource.length - 1);
      });

      test(`Pressing Tab after highlighting on a new item should ${
        isMultiSelect ? "not " : ""
      }select it`, () => {
        expect(within(button).queryByText(testSource[1])).toBeNull();

        fireEvent.keyDown(button, { key: "ArrowDown" });
        fireEvent.keyDown(button, { key: "Tab" });

        if (isMultiSelect) {
          expect(within(button).queryByText(testSource[1])).toBeNull();
        } else {
          expect(within(button).getByText(testSource[1])).toBeInTheDocument();
        }
      });

      describe("supports type to highlight", () => {
        beforeEach(() => {
          jest.useFakeTimers();
        });

        afterEach(() => {
          jest.runOnlyPendingTimers();
          jest.useRealTimers();
        });

        it("supports focusing items by typing letters in rapid succession", () => {
          fireEvent.focus(button);
          expectOptionHighlightAt(menu, 0);

          // Prioritize next available option starting with B from the cyclic effect
          fireEvent.keyDown(button, { key: "B" });
          expectOptionHighlightAt(menu, 3);

          fireEvent.keyDown(button, { key: "A" });
          expectOptionHighlightAt(menu, 3);

          fireEvent.keyDown(button, { key: "R" });
          expectOptionHighlightAt(menu, 0);
        });

        it("supports the space character in a search without closing the menu", () => {
          fireEvent.keyDown(button, { key: "F" });
          expectOptionHighlightAt(menu, 1);

          fireEvent.keyDown(button, { key: "O" });
          expectOptionHighlightAt(menu, 1);

          fireEvent.keyDown(button, { key: "O" });
          expectOptionHighlightAt(menu, 1);

          fireEvent.keyDown(button, { key: " " });
          expectOptionHighlightAt(menu, 2);

          fireEvent.keyDown(button, { key: "B" });
          expectOptionHighlightAt(menu, 2);

          fireEvent.keyDown(button, { key: "A" });
          expectOptionHighlightAt(menu, 2);

          fireEvent.keyDown(button, { key: "R" });
          expectOptionHighlightAt(menu, 2);
        });

        it("supports item selection using the Spacebar after search times out", async () => {
          fireEvent.keyDown(button, { key: "F" });
          expectOptionHighlightAt(menu, 1);

          fireEvent.keyDown(button, { key: "O" });
          expectOptionHighlightAt(menu, 1);

          fireEvent.keyDown(button, { key: "O" });
          expectOptionHighlightAt(menu, 1);

          fireEvent.keyDown(button, { key: " " });
          expectOptionHighlightAt(menu, 2);

          // Advance the timers so we can select using the Spacebar
          act(() => {
            jest.advanceTimersByTime(1500);
          });

          fireEvent.keyDown(button, { key: " " });

          if (!isMultiSelect) {
            // Closes menu
            expect(screen.queryByTestId("dropdown-list")).toBeNull();
          }

          await waitFor(async () =>
            // Item selected appeaer on screen
            expect(
              await within(screen.getByTestId("dropdown-button")).findByText(
                "Foo Bar"
              )
            ).toBeInTheDocument()
          );
        });

        it("resets the search text after a timeout", () => {
          fireEvent.keyDown(button, { key: "F" });
          expectOptionHighlightAt(menu, 1);

          act(() => {
            jest.runAllTimers();
          });

          fireEvent.keyDown(button, { key: "B" });
          expectOptionHighlightAt(menu, 3);
        });

        it("wraps around to search from the beginning when no items past the current one match", () => {
          fireEvent.keyDown(button, { key: "B" });
          fireEvent.keyDown(button, { key: "A" });
          fireEvent.keyDown(button, { key: "Z" });
          expectOptionHighlightAt(menu, 3);

          act(() => {
            jest.runAllTimers();
          });

          fireEvent.keyDown(button, { key: "F" });
          expectOptionHighlightAt(menu, 1);
        });

        it("cycles through options when typing the first character repeatedly", () => {
          fireEvent.keyDown(button, { key: "F" });
          expectOptionHighlightAt(menu, 1);

          fireEvent.keyDown(button, { key: "F" });
          expectOptionHighlightAt(menu, 2);

          fireEvent.keyDown(button, { key: "F" });
          expectOptionHighlightAt(menu, 1);
        });
      });
    });

    describe("When disabled", () => {
      beforeEach(() => {
        const { getByTestId } = render(
          <Component disabled source={testSource} />
        );

        button = getByTestId("dropdown-button");
      });

      test("Clicking it should not open the menu", () => {
        fireEvent.click(button);
        expect(screen.queryByTestId("dropdown-list")).toBeNull();
      });

      test("Pressing Enter should not open the menu", () => {
        fireEvent.keyDown(button, { key: "Enter" });
        expect(screen.queryByTestId("dropdown-list")).toBeNull();
      });
    });

    test("Pressing ALT + ARROW DOWN key should not be propagated", async () => {
      const parentKeyDownSpy = jest.fn();

      const { getByTestId, findByTestId } = render(
        <div onKeyDown={parentKeyDownSpy}>
          <Component source={testSource} />
        </div>
      );

      button = getByTestId("dropdown-button");
      fireEvent.focus(button);
      fireEvent.keyDown(button, { key: "ArrowDown", altKey: true });

      // Wait until list is shown to avoid act warning
      await findByTestId("dropdown-list");

      expect(parentKeyDownSpy).not.toBeCalled();
    });

    test("When isOpen is controlled, TAB onto it should still allow navigation", async () => {
      const { getByTestId, findByTestId } = render(
        <Component ListProps={{ id: "list" }} isOpen source={testSource} />
      );

      button = getByTestId("dropdown-button");
      menu = await findByTestId("dropdown-list");

      fireEvent.focus(button);
      expectOptionHighlightAt(menu, 0);
      fireEvent.keyDown(button, { key: "ArrowDown" });
      expectOptionHighlightAt(menu, 1);
    });
  });
});
