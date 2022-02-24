import { act, fireEvent, render, within } from "@testing-library/react";

import { List, ListItem } from "../../list";

const ITEMS = [
  { label: "list item 1" },
  { label: "list item 2" },
  { label: "list item 3" },
  { label: "list item 4" },
];

const ITEMS_PER_PAGE = 2;

["list", "declarative list"].forEach((listType) => {
  describe(`A ${listType}`, () => {
    describe("with no item selected", () => {
      const onChangeSpy = jest.fn();
      const onSelectSpy = jest.fn();
      const isDeclarative = listType === "declarative list";

      let list: HTMLElement;
      let items: HTMLElement[];

      beforeEach(() => {
        jest.clearAllMocks();
        const { getByRole, getAllByRole } = isDeclarative
          ? render(
              <List id="list" onChange={onChangeSpy} onSelect={onSelectSpy}>
                <ListItem>list item 1</ListItem>
                <ListItem>list item 2</ListItem>
                <ListItem>list item 3</ListItem>
                <ListItem>list item 4</ListItem>
              </List>
            )
          : render(
              <List
                id="list"
                onChange={onChangeSpy}
                onSelect={onSelectSpy}
                source={ITEMS}
              />
            );

        list = getByRole("listbox");
        items = getAllByRole("option");
      });

      describe("when focused", () => {
        it("should highlight the first item with a focus ring", () => {
          fireEvent.focus(list);

          expect(list.querySelector("#list-item-0")).toHaveClass(
            "uitkListItem-highlighted",
            "uitkListItem-focusVisible"
          );
        });
      });

      describe("when interacted with keyboard and focused again", () => {
        it("should highlight the first item with a focus ring", () => {
          // move focus
          fireEvent.focus(list);
          fireEvent.keyDown(list, { key: "ArrowDown" });
          fireEvent.keyDown(list, { key: "ArrowDown" });
          fireEvent.blur(list);

          expect(list.querySelector("#list-item-2")).not.toHaveClass(
            "uitkListItem-highlighted",
            "uitkListItem-focusVisible"
          );

          // focus again
          fireEvent.focus(list);
          expect(list.querySelector("#list-item-0")).toHaveClass(
            "uitkListItem-highlighted",
            "uitkListItem-focusVisible"
          );
        });
      });

      describe("when interacted with mouse and focused again", () => {
        it("should put a focus ring on the highlighted item instead", () => {
          // move highlight only, not the focus
          fireEvent.mouseMove(items[1]);
          expect(list.querySelector("#list-item-1")).toHaveClass(
            "uitkListItem-highlighted"
          );

          // focus
          fireEvent.focus(list);
          expect(list.querySelector("#list-item-1")).toHaveClass(
            "uitkListItem-highlighted",
            "uitkListItem-focusVisible"
          );
        });
      });

      describe("when the 'Enter' key is pressed", () => {
        it("should select the highlighted item", () => {
          fireEvent.focus(list);
          fireEvent.keyDown(list, { key: "Enter" });

          expect(list.querySelector("#list-item-0")).toHaveClass(
            "uitkListItem-highlighted",
            "uitkListItem-selected"
          );
          expect(onChangeSpy).toHaveBeenCalledWith(
            expect.anything(),
            isDeclarative ? "list item 1" : ITEMS[0]
          );
          expect(onSelectSpy).toHaveBeenCalledWith(
            expect.anything(),
            isDeclarative ? "list item 1" : ITEMS[0]
          );
        });
      });

      describe("when the 'Enter' key is pressed after moving mouse away", () => {
        it("should not select anything", () => {
          fireEvent.focus(list);
          fireEvent.keyDown(list, { key: "ArrowDown" });

          // check list item is correctly highlighted
          expect(list.querySelector("#list-item-1")).toHaveClass(
            "uitkListItem-highlighted"
          );

          // move mouse away and select
          fireEvent.mouseLeave(list);
          fireEvent.keyDown(list, { key: "Enter" });

          expect(onChangeSpy).not.toHaveBeenCalled();
          expect(onSelectSpy).not.toHaveBeenCalled();
        });
      });

      describe("when the 'Space' key is pressed", () => {
        it("should select the highlighted item", () => {
          fireEvent.focus(list);
          fireEvent.keyDown(list, { key: " " });

          expect(list.querySelector("#list-item-0")).toHaveClass(
            "uitkListItem-highlighted",
            "uitkListItem-selected"
          );
          expect(onChangeSpy).toHaveBeenCalledWith(
            expect.anything(),
            isDeclarative ? "list item 1" : ITEMS[0]
          );
          expect(onSelectSpy).toHaveBeenCalledWith(
            expect.anything(),
            isDeclarative ? "list item 1" : ITEMS[0]
          );
        });
      });

      describe("when the 'Tab' key is pressed", () => {
        it("should remove highlight and focus style from the list", () => {
          fireEvent.focus(list);
          fireEvent.keyDown(list, { key: "Tab" });

          expect(
            list.querySelector(".ListItem-highlighted")
          ).not.toBeInTheDocument();
          expect(
            list.querySelector(".ListItem-focusVisible")
          ).not.toBeInTheDocument();
        });
      });
    });

    describe("with a selected item", () => {
      describe("when focused", () => {
        it("should highlight the selected item with a focus ring", () => {
          const { getByRole } =
            listType === "declarative list"
              ? render(
                  <List id="list" initialSelectedItem="list item 3">
                    <ListItem>list item 1</ListItem>
                    <ListItem>list item 2</ListItem>
                    <ListItem>list item 3</ListItem>
                    <ListItem>list item 4</ListItem>
                  </List>
                )
              : render(
                  <List
                    id="list"
                    initialSelectedItem={ITEMS[2]}
                    source={ITEMS}
                  />
                );

          const list = getByRole("listbox");

          fireEvent.focus(list);

          expect(list.querySelector("#list-item-2")).toHaveClass(
            "uitkListItem-highlighted",
            "uitkListItem-focusVisible"
          );
        });
      });
    });
  });
});

["list", "declarative list"].forEach((listType) => {
  describe(`A ${listType} with "restoreLastFocus" prop set`, () => {
    describe("with no item selected", () => {
      const isDeclarative = listType === "declarative list";

      let list: HTMLElement;
      let items: HTMLElement[];

      beforeEach(() => {
        const { getByRole, getAllByRole } = isDeclarative
          ? render(
              <List id="list" restoreLastFocus>
                <ListItem>list item 1</ListItem>
                <ListItem>list item 2</ListItem>
                <ListItem>list item 3</ListItem>
                <ListItem>list item 4</ListItem>
              </List>
            )
          : render(<List id="list" restoreLastFocus source={ITEMS} />);

        list = getByRole("listbox");
        items = getAllByRole("option");
      });

      describe("when focused", () => {
        it("should highlight the first item with a focus ring", () => {
          fireEvent.focus(list);

          expect(list.querySelector("#list-item-0")).toHaveClass(
            "uitkListItem-highlighted",
            "uitkListItem-focusVisible"
          );
        });
      });

      describe("when interacted with keyboard and focused again", () => {
        it("should restore focus ring to the last interacted item", () => {
          // move focus
          fireEvent.focus(list);
          fireEvent.keyDown(list, { key: "ArrowDown" });
          fireEvent.keyDown(list, { key: "ArrowDown" });
          fireEvent.blur(list);

          expect(list.querySelector("#list-item-2")).not.toHaveClass(
            "uitkListItem-highlighted",
            "uitkListItem-focusVisible"
          );

          // restore focus
          fireEvent.focus(list);
          expect(list.querySelector("#list-item-2")).toHaveClass(
            "uitkListItem-highlighted",
            "uitkListItem-focusVisible"
          );
        });
      });

      describe("when interacted with mouse and focused again", () => {
        it("should not remember the last interacted item and put a focus ring on the highlighted item instead", () => {
          // move highlight only, not the focus
          fireEvent.mouseMove(items[1]);
          expect(list.querySelector("#list-item-1")).toHaveClass(
            "uitkListItem-highlighted"
          );

          // focus
          fireEvent.focus(list);
          expect(list.querySelector("#list-item-1")).toHaveClass(
            "uitkListItem-highlighted",
            "uitkListItem-focusVisible"
          );
        });
      });
    });

    describe("with a selected item", () => {
      describe("when focused", () => {
        it("should ignore the selected item and highlight the first item with a focus ring instead", () => {
          const { getByRole } =
            listType === "declarative list"
              ? render(
                  <List
                    id="list"
                    initialSelectedItem="list item 3"
                    restoreLastFocus
                  >
                    <ListItem>list item 1</ListItem>
                    <ListItem>list item 2</ListItem>
                    <ListItem>list item 3</ListItem>
                    <ListItem>list item 4</ListItem>
                  </List>
                )
              : render(
                  <List
                    id="list"
                    initialSelectedItem={ITEMS[2]}
                    restoreLastFocus
                    source={ITEMS}
                  />
                );

          const list = getByRole("listbox");

          fireEvent.focus(list);

          expect(list.querySelector("#list-item-0")).toHaveClass(
            "uitkListItem-highlighted",
            "uitkListItem-focusVisible"
          );
        });
      });
    });
  });
});

["list", "declarative list"].forEach((listType) => {
  describe(`A ${listType} is being navigated with keyboard`, () => {
    let list: HTMLElement;

    beforeEach(() => {
      const result =
        listType === "declarative list"
          ? render(
              <List displayedItemCount={ITEMS_PER_PAGE} id="list">
                <ListItem>list item 1</ListItem>
                <ListItem>list item 2</ListItem>
                <ListItem>list item 3</ListItem>
                <ListItem>list item 4</ListItem>
              </List>
            )
          : render(
              <List
                displayedItemCount={ITEMS_PER_PAGE}
                id="list"
                source={ITEMS}
              />
            );

      list = result.getByRole("listbox");
    });

    describe("when the 'End' key is pressed", () => {
      it("should move focus and highlight to the end of the list", () => {
        fireEvent.focus(list);
        fireEvent.keyDown(list, { key: "End" });

        expect(
          list.querySelector(`#list-item-${ITEMS.length - 1}`)
        ).toHaveClass("uitkListItem-highlighted", "uitkListItem-focusVisible");
      });

      it("should not change focus or highlight if it is at the end of the list", () => {
        fireEvent.focus(list);
        fireEvent.keyDown(list, { key: "End" });
        fireEvent.keyDown(list, { key: "End" });

        expect(
          list.querySelector(`#list-item-${ITEMS.length - 1}`)
        ).toHaveClass("uitkListItem-highlighted", "uitkListItem-focusVisible");
      });
    });

    describe("when the 'Home' key is pressed", () => {
      it("should move focus and highlight to the start of the list", () => {
        fireEvent.focus(list);
        fireEvent.keyDown(list, { key: "End" });
        fireEvent.keyDown(list, { key: "Home" });

        expect(list.querySelector("#list-item-0")).toHaveClass(
          "uitkListItem-highlighted",
          "uitkListItem-focusVisible"
        );
      });

      it("should not change focus or highlight if it is at the start of the list", () => {
        fireEvent.focus(list);
        fireEvent.keyDown(list, { key: "End" });
        fireEvent.keyDown(list, { key: "Home" });
        fireEvent.keyDown(list, { key: "Home" });

        expect(list.querySelector("#list-item-0")).toHaveClass(
          "uitkListItem-highlighted",
          "uitkListItem-focusVisible"
        );
      });
    });

    describe("when the 'ArrowDown' key is pressed", () => {
      it("should move focus and highlight one item down at a time", () => {
        fireEvent.focus(list);
        fireEvent.keyDown(list, { key: "ArrowDown", keyCode: 40 });
        fireEvent.keyDown(list, { key: "ArrowDown", keyCode: 40 });

        expect(list.querySelector("#list-item-2")).toHaveClass(
          "uitkListItem-highlighted",
          "uitkListItem-focusVisible"
        );
      });

      it("should not change focus or highlight if it is at the last item", () => {
        fireEvent.focus(list);
        fireEvent.keyDown(list, { key: "End" });
        fireEvent.keyDown(list, { key: "ArrowDown" });

        expect(
          list.querySelector(`#list-item-${ITEMS.length - 1}`)
        ).toHaveClass("uitkListItem-highlighted", "uitkListItem-focusVisible");
      });
    });

    describe("when the 'ArrowUp' key is pressed", () => {
      it("should move focus and highlight one item up at a time", () => {
        fireEvent.focus(list);
        fireEvent.keyDown(list, { key: "ArrowDown" });
        fireEvent.keyDown(list, { key: "ArrowDown" });
        fireEvent.keyDown(list, { key: "ArrowUp" });
        fireEvent.keyDown(list, { key: "ArrowUp" });

        expect(list.querySelector("#list-item-0")).toHaveClass(
          "uitkListItem-highlighted",
          "uitkListItem-focusVisible"
        );
      });

      it("should not change focus or highlight if it is at the first item", () => {
        fireEvent.focus(list);
        fireEvent.keyDown(list, { key: "ArrowUp" });

        expect(list.querySelector("#list-item-0")).toHaveClass(
          "uitkListItem-highlighted",
          "uitkListItem-focusVisible"
        );
      });
    });

    describe("when the 'PageDown' key is pressed", () => {
      it("should move focus and highlight one page down at a time", () => {
        fireEvent.focus(list);
        fireEvent.keyDown(list, { key: "PageDown" });

        expect(list.querySelector(`#list-item-${ITEMS_PER_PAGE}`)).toHaveClass(
          "uitkListItem-highlighted",
          "uitkListItem-focusVisible"
        );
      });

      it("should not change focus or highlight if it is at the last item", () => {
        fireEvent.focus(list);
        fireEvent.keyDown(list, { key: "End" });
        fireEvent.keyDown(list, { key: "PageDown" });

        expect(
          list.querySelector(`#list-item-${ITEMS.length - 1}`)
        ).toHaveClass("uitkListItem-highlighted", "uitkListItem-focusVisible");
      });
    });

    describe("when with the 'PageUp' key is pressed", () => {
      it("should move focus and highlight one page up at a time", () => {
        fireEvent.focus(list);
        fireEvent.keyDown(list, { key: "End" });
        fireEvent.keyDown(list, { key: "PageUp" });

        expect(
          list.querySelector(`#list-item-${ITEMS.length - ITEMS_PER_PAGE - 1}`)
        ).toHaveClass("uitkListItem-highlighted", "uitkListItem-focusVisible");
      });

      it("should not change focus or highlight if it is at the first item", () => {
        fireEvent.focus(list);
        fireEvent.keyDown(list, { key: "PageUp" });

        expect(list.querySelector("#list-item-0")).toHaveClass(
          "uitkListItem-highlighted",
          "uitkListItem-focusVisible"
        );
      });
    });
  });
});

["list", "declarative list"].forEach((listType) => {
  jest.useFakeTimers();
  const isDeclarative = listType === "declarative list";

  const FancyItems = ["Bar", "Foo", "Foo Bar", "Baz"];

  const expectOptionHightlightAt = (listbox: HTMLElement, index: number) => {
    expect(listbox.querySelector(`#list-item-${index}`)).toHaveClass(
      "uitkListItem-highlighted",
      "uitkListItem-focusVisible"
    );
  };

  describe(`A ${listType} supports type to select`, () => {
    let listbox: HTMLElement;
    const onChangeSpy = jest.fn();

    beforeEach(() => {
      const result = isDeclarative
        ? render(
            <List
              displayedItemCount={ITEMS_PER_PAGE}
              id="list"
              onChange={onChangeSpy}
            >
              {FancyItems.map((x, i) => (
                <ListItem key={`item-${i}`}>{x}</ListItem>
              ))}
            </List>
          )
        : render(
            <List
              displayedItemCount={ITEMS_PER_PAGE}
              id="list"
              onChange={onChangeSpy}
              source={FancyItems}
            />
          );

      listbox = result.getByRole("listbox");
      jest.useFakeTimers();
    });

    afterEach(() => {
      onChangeSpy.mockClear();
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    it("supports focusing items by typing letters in rapid succession", () => {
      fireEvent.focus(listbox);
      expectOptionHightlightAt(listbox, 0);

      // Priotize next available option starting with B from the cyclic effect
      fireEvent.keyDown(listbox, { key: "B" });
      expectOptionHightlightAt(listbox, 3);

      fireEvent.keyDown(listbox, { key: "A" });
      expectOptionHightlightAt(listbox, 3);

      fireEvent.keyDown(listbox, { key: "R" });
      expectOptionHightlightAt(listbox, 0);
    });

    it("supports the space character in a search", () => {
      fireEvent.focus(listbox);

      fireEvent.keyDown(listbox, { key: "F" });
      expectOptionHightlightAt(listbox, 1);

      fireEvent.keyDown(listbox, { key: "O" });
      expectOptionHightlightAt(listbox, 1);

      fireEvent.keyDown(listbox, { key: "O" });
      expectOptionHightlightAt(listbox, 1);

      fireEvent.keyDown(listbox, { key: " " });
      expectOptionHightlightAt(listbox, 2);

      fireEvent.keyDown(listbox, { key: "B" });
      expectOptionHightlightAt(listbox, 2);

      fireEvent.keyDown(listbox, { key: "A" });
      expectOptionHightlightAt(listbox, 2);

      fireEvent.keyDown(listbox, { key: "R" });
      expectOptionHightlightAt(listbox, 2);
    });

    it("supports item selection using the Spacebar after search times out", () => {
      fireEvent.focus(listbox);

      fireEvent.keyDown(listbox, { key: "F" });
      expectOptionHightlightAt(listbox, 1);

      fireEvent.keyDown(listbox, { key: "O" });
      expectOptionHightlightAt(listbox, 1);

      fireEvent.keyDown(listbox, { key: "O" });
      expectOptionHightlightAt(listbox, 1);

      fireEvent.keyDown(listbox, { key: " " });
      expectOptionHightlightAt(listbox, 2);

      // Verify no selection was been made
      expect(listbox.querySelector("#list-item-2")).not.toHaveAttribute(
        "aria-checked",
        "true"
      );

      // Verify onChange was not called
      expect(onChangeSpy).not.toBeCalled();

      // Advance the timers so we can select using the Spacebar
      act(() => {
        jest.runAllTimers();
      });

      fireEvent.keyDown(listbox, { key: " " });

      expect(onChangeSpy).toHaveBeenCalledWith(expect.anything(), "Foo Bar");
      expect(listbox.querySelector("#list-item-2")).toHaveAttribute(
        "aria-checked",
        "true"
      );
    });

    it("resets the search text after a timeout", () => {
      fireEvent.focus(listbox);

      fireEvent.keyDown(listbox, { key: "F" });
      expectOptionHightlightAt(listbox, 1);

      act(() => {
        jest.runAllTimers();
      });

      fireEvent.keyDown(listbox, { key: "B" });
      expectOptionHightlightAt(listbox, 3);
    });

    it("wraps around to search from the beginning when no items past the current one match", () => {
      fireEvent.focus(listbox);

      fireEvent.keyDown(listbox, { key: "B" });
      fireEvent.keyDown(listbox, { key: "A" });
      fireEvent.keyDown(listbox, { key: "Z" });
      expectOptionHightlightAt(listbox, 3);

      act(() => {
        jest.runAllTimers();
      });

      fireEvent.keyDown(listbox, { key: "F" });
      expectOptionHightlightAt(listbox, 1);
    });

    it("cycles through options when typing the first character repeatedly", () => {
      fireEvent.focus(listbox);

      fireEvent.keyDown(listbox, { key: "F" });
      expectOptionHightlightAt(listbox, 1);

      fireEvent.keyDown(listbox, { key: "F" });
      expectOptionHightlightAt(listbox, 2);

      fireEvent.keyDown(listbox, { key: "F" });
      expectOptionHightlightAt(listbox, 1);
    });

    it("does not cycle through options when typing repeated characters after the first char", () => {
      fireEvent.focus(listbox);

      fireEvent.keyDown(listbox, { key: "F" });
      expectOptionHightlightAt(listbox, 1);

      fireEvent.keyDown(listbox, { key: "O" });
      expectOptionHightlightAt(listbox, 1);

      fireEvent.keyDown(listbox, { key: "O" });
      expectOptionHightlightAt(listbox, 1);
    });

    it("supports clicking item first then by typing letters in rapid succession", () => {
      fireEvent.click(within(listbox).queryAllByRole("option")[0]);

      fireEvent.keyDown(listbox, { key: "F" });
      expectOptionHightlightAt(listbox, 1);

      fireEvent.keyDown(listbox, { key: "O" });
      expectOptionHightlightAt(listbox, 1);

      fireEvent.keyDown(listbox, { key: "O" });
      expectOptionHightlightAt(listbox, 1);
    });
  });

  test(`A ${listType} can disable type to select`, () => {
    const result = isDeclarative
      ? render(
          <List
            disableTypeToSelect
            displayedItemCount={ITEMS_PER_PAGE}
            id="list"
          >
            {FancyItems.map((x, i) => (
              <ListItem key={`item-${i}`}>{x}</ListItem>
            ))}
          </List>
        )
      : render(
          <List
            disableTypeToSelect
            displayedItemCount={ITEMS_PER_PAGE}
            id="list"
            source={FancyItems}
          />
        );

    const listbox = result.getByRole("listbox");
    fireEvent.focus(listbox);

    fireEvent.keyDown(listbox, { key: "F" });
    expect(listbox.querySelector(`#list-item-${1}`)).not.toHaveClass(
      "uitkListItem-highlighted",
      "uitkListItem-focusVisible"
    );
  });
});

["list", "declarative list"].forEach((listType) => {
  describe(`A ${listType} supports tab to select when turned on`, () => {
    const isDeclarative = listType === "declarative list";
    let list: HTMLElement;

    beforeEach(() => {
      jest.clearAllMocks();
      const { getByRole } = isDeclarative
        ? render(
            <List id="list" tabToSelect>
              <ListItem>list item 1</ListItem>
              <ListItem>list item 2</ListItem>
              <ListItem>list item 3</ListItem>
              <ListItem>list item 4</ListItem>
            </List>
          )
        : render(<List id="list" source={ITEMS} tabToSelect />);

      list = getByRole("listbox");
    });

    it("should select the highlighted item", () => {
      fireEvent.focus(list);
      fireEvent.keyDown(list, { key: "Tab" });

      expect(list.querySelector("#list-item-0")).toHaveClass(
        "uitkListItem-highlighted",
        "uitkListItem-selected"
      );
    });
  });
});
