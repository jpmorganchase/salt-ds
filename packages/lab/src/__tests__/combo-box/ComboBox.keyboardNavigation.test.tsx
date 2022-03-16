import React from "react";
import {
  fireEvent,
  getAllByRole,
  getByRole,
  prettyDOM,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { ComboBox } from "../../combo-box";

const mockAnnounce = jest.fn();

jest.mock("@brandname/core", () => ({
  ...jest.requireActual("@brandname/core"),
  useAriaAnnouncer: () => ({
    announce: mockAnnounce,
  }),
}));

interface Item {
  id: number;
  label: string;
}

const ITEMS: Item[] = [
  { id: 1, label: "list item 1" },
  { id: 2, label: "list item 2" },
  { id: 3, label: "list item 3" },
  { id: 4, label: "list item 4" },
];

const stringToItem = (selectedItems: Item[], label: string): Item => {
  const [found] = ITEMS.filter((item) => item.label === label.trim());

  return found
    ? found
    : {
        id: Math.max(...selectedItems.map(({ id }) => id), 0) + 1,
        label: label.trim(),
      };
};

const getListbox = () => {
  const listboxes = screen.getAllByRole("listbox");
  return listboxes[listboxes.length - 1];
};

const waitForListToBeInTheDocument = async (): Promise<HTMLElement> => {
  return await waitFor(() => {
    const listbox = getListbox();
    expect(listbox).toBeInTheDocument();
    return listbox;
  });
};

describe("A combo box", () => {
  describe("with nothing selected", () => {
    const changeSpy = jest.fn();

    let input: HTMLElement;
    let list: HTMLElement;

    beforeEach(async () => {
      render(<ComboBox onChange={changeSpy} source={ITEMS} />);

      input = screen.getByRole("combobox");
      fireEvent.focus(input);

      list = await waitForListToBeInTheDocument();
    });

    afterEach(() => {
      changeSpy.mockClear();
    });

    describe("when focused", () => {
      it("should not highlight any item with a focus ring", () => {
        expect(
          list.querySelector(".uitkListItem-highlighted")
        ).not.toBeInTheDocument();
      });
    });

    describe("when blurred", () => {
      it("should clear input value if nothing is selected", () => {
        fireEvent.select(input, {
          target: {
            selectionStart: 0,
            selectionEnd: 0,
          },
        });

        // filter only
        fireEvent.change(input, { target: { value: "item 2" } });
        fireEvent.keyDown(input, { key: "ArrowDown" });

        expect(input).toHaveValue("item 2");

        // filter again and blur away
        fireEvent.change(input, { target: { value: "item 1" } });
        fireEvent.blur(input);

        expect(input).not.toHaveValue();
      });

      it("should reconcile input value if there is a selected item", () => {
        // filter and select
        fireEvent.change(input, { target: { value: "item 2" } });
        fireEvent.keyDown(input, { key: "ArrowDown" });
        fireEvent.keyDown(input, { key: "Enter" });

        expect(input).toHaveValue("list item 2");

        // filter again and blur away without making a new selection
        fireEvent.change(input, { target: { value: "item 1" } });
        fireEvent.blur(input);

        expect(input).toHaveValue("list item 2");
      });
    });

    describe("when focused and ArrowDown key is pressed", () => {
      it("should start highlighting from the first item", () => {
        fireEvent.keyDown(input, { key: "ArrowDown" });

        expect(getByRole(list, "option", { name: /item.+1/i })).toHaveClass(
          "uitkListItem-highlighted",
          "uitkListItem-focusVisible"
        );

        fireEvent.keyDown(input, { key: "ArrowDown" });

        expect(getByRole(list, "option", { name: /item.+2/i })).toHaveClass(
          "uitkListItem-highlighted",
          "uitkListItem-focusVisible"
        );
      });
    });

    describe("when the 'Enter' key is pressed", () => {
      describe("AND there is input text with no highlight", () => {
        it("should selected the first item", () => {
          fireEvent.change(input, { target: { value: "l" } });
          // TODO QuickSelected is not supported by the new list yet.
          // expect(getByRole(list, "option", { name: /item.+1/i })).toHaveClass(
          //   "uitkListItem-quickSelected"
          // );
          fireEvent.keyDown(input, { key: "Enter" });

          // input value updated
          expect(input).toHaveValue(ITEMS[0].label);

          // list is closed
          expect(list).not.toBeInTheDocument();

          // change callback invoked
          expect(changeSpy).toHaveBeenCalledWith(expect.anything(), ITEMS[0]);
        });
      });

      it("should select the highlighted item", () => {
        fireEvent.keyDown(input, { key: "ArrowDown" });
        fireEvent.keyDown(input, { key: "Enter" });

        // input value updated
        expect(input).toHaveValue(ITEMS[0].label);

        // list is closed
        expect(list).not.toBeInTheDocument();

        // change callback invoked
        expect(changeSpy).toHaveBeenCalledWith(expect.anything(), ITEMS[0]);
      });
    });

    describe("when the 'Space' key is pressed", () => {
      it("should not select the highlighted item", () => {
        fireEvent.keyDown(input, { key: "ArrowDown" });
        fireEvent.keyDown(input, { key: "ArrowDown" });
        fireEvent.keyDown(input, { key: " " });

        // no list item is selected
        expect(list.querySelector("[aria-selected]")).not.toBeInTheDocument();

        // change callback not invoked
        expect(changeSpy).not.toHaveBeenCalled();
      });
    });

    describe("when the 'Tab' key is pressed", () => {
      it("should remove highlight and focus style from the list", () => {
        fireEvent.keyDown(input, { key: "ArrowDown" });
        fireEvent.keyDown(input, { key: "Tab" });
        fireEvent.blur(input);

        expect(
          list.querySelector(".uitkListItem-highlighted")
        ).not.toBeInTheDocument();
        expect(
          list.querySelector(".uitkListItem-focusVisible")
        ).not.toBeInTheDocument();
      });
    });

    describe("when the 'Escape' key is pressed", () => {
      it("should clear the input and close the list", () => {
        fireEvent.change(input, { target: { value: "item 1" } });
        fireEvent.keyDown(input, { key: "ArrowDown" });
        fireEvent.keyDown(input, { key: "Escape" });

        // input value cleared
        expect(input).not.toHaveValue();

        // list is closed
        expect(list).not.toBeInTheDocument();
      });
    });

    describe("when the 'Escape' key is pressed after selecting a new item", () => {
      it("should reconcile input value with the selected item", () => {
        // filter and select
        fireEvent.change(input, { target: { value: "item 2" } });
        fireEvent.keyDown(input, { key: "ArrowDown" });
        fireEvent.keyDown(input, { key: "Enter" });

        expect(input).toHaveValue("list item 2");

        // filter again and escape from input
        fireEvent.change(input, { target: { value: "item 1" } });
        fireEvent.keyDown(input, { key: "Escape" });

        expect(input).toHaveValue("list item 2");
      });
    });
  });

  describe("with a selected item", () => {
    describe("when focused", () => {
      it("should highlight the selected item with a focus ring", async () => {
        render(<ComboBox initialSelectedItem={ITEMS[2]} source={ITEMS} />);

        fireEvent.focus(screen.getByRole("combobox"));
        const listbox = await waitForListToBeInTheDocument();

        expect(
          getByRole(listbox, "option", {
            name: /item.+3/i,
          })
        ).toHaveClass("uitkListItem-highlighted", "uitkListItem-focusVisible");
      });
    });
  });
});

describe("A combo box that allows free text", () => {
  describe("with nothing selected", () => {
    const changeSpy = jest.fn();

    let input: HTMLElement;

    beforeEach(async () => {
      render(<ComboBox allowFreeText onChange={changeSpy} source={ITEMS} />);

      input = screen.getByRole("combobox");
      fireEvent.focus(input);
      await waitForListToBeInTheDocument();
    });

    afterEach(() => {
      changeSpy.mockClear();
    });

    it("should not modify input value when blurred", () => {
      fireEvent.select(input, {
        target: {
          selectionStart: 0,
          selectionEnd: 0,
        },
      });

      // filter only
      fireEvent.change(input, { target: { value: "item 2" } });
      fireEvent.keyDown(input, { key: "ArrowDown" });

      expect(input).toHaveValue("item 2");

      // filter again and blur
      fireEvent.change(input, { target: { value: "item 1" } });
      fireEvent.blur(input);

      expect(input).toHaveValue("item 1");
    });

    it("should select the input value when blurred if that value is in the list", async () => {
      fireEvent.select(input, {
        target: {
          selectionStart: 0,
          selectionEnd: 0,
        },
      });

      fireEvent.change(input, { target: { value: "list item 2" } });
      fireEvent.keyDown(input, { key: "ArrowDown" });
      fireEvent.blur(input);

      expect(input).toHaveValue("list item 2");

      // open it and double check item has been selected
      fireEvent.focus(input);
      const listbox = await waitForListToBeInTheDocument();

      expect(
        getByRole(listbox, "option", {
          name: /item.+2/i,
        })
      ).toHaveAttribute("aria-checked", "true");

      // change callback invoked
      expect(changeSpy).toHaveBeenCalledWith(expect.anything(), ITEMS[1]);
    });

    it("should clear the input when pressing 'Escape'", () => {
      // filter and select
      fireEvent.change(input, { target: { value: "item 2" } });
      fireEvent.keyDown(input, { key: "ArrowDown" });
      fireEvent.keyDown(input, { key: "Enter" });

      expect(input).toHaveValue("list item 2");

      // filter again and escape input without making a new selection
      fireEvent.change(input, { target: { value: "item 1" } });
      fireEvent.keyDown(input, { key: "Escape" });

      expect(input).not.toHaveValue();
    });
  });
});

describe("A multi-select combo box", () => {
  describe("with nothing selected", () => {
    const changeSpy = jest.fn();
    const onChange = (...args: any[]) => {
      changeSpy(...args);
      console.log("OnChange invoked");
    };

    let input: HTMLElement;
    let list: HTMLElement;

    beforeEach(async () => {
      render(
        <ComboBox
          multiSelect
          onChange={onChange}
          source={ITEMS}
          stringToItem={stringToItem}
        />
      );

      input = screen.getByRole("textbox");
      fireEvent.focus(input);

      list = await waitForListToBeInTheDocument();
    });

    afterEach(() => {
      changeSpy.mockClear();
    });

    describe("when focused", () => {
      it("should not highlight any item with a focus ring", () => {
        expect(
          getListbox().querySelector(".uitkListItem-highlighted")
        ).not.toBeInTheDocument();
      });
    });

    describe("when blurred", () => {
      it("should clear input value", () => {
        fireEvent.change(input, { target: { value: "list item 1" } });
        fireEvent.blur(input);

        expect(input).not.toHaveValue();
      });
    });

    describe("when using delimiter", () => {
      it("should add unique and valid items only", () => {
        // type and tab out
        fireEvent.change(input, {
          target: {
            value: "list item 1, list item 2, list item 1, list item xyz",
          },
        });

        const pills = screen.getAllByTestId("pill");
        expect(pills).toHaveLength(2);
        expect(pills[0]).toHaveTextContent("list item 1");
        expect(pills[1]).toHaveTextContent("list item 2");

        // list style updated
        list = getListbox();

        expect(getByRole(list, "option", { name: /item.+1/i })).toHaveAttribute(
          "aria-selected",
          "true"
        );
        expect(getByRole(list, "option", { name: /item.+2/i })).toHaveAttribute(
          "aria-selected",
          "true"
        );

        // change callback invoked with expected items
        expect(changeSpy).toHaveBeenCalledWith(null, [ITEMS[0], ITEMS[1]]);
      });
    });

    describe("when focused and ArrowDown key is pressed", () => {
      it("should start highlighting from the first item", () => {
        // make sure cursor is at the end of the textarea
        fireEvent.keyDown(input, { key: "End" });
        fireEvent.keyDown(input, { key: "ArrowDown" });

        expect(getByRole(list, "option", { name: /item.+1/i })).toHaveClass(
          "uitkListItem-highlighted",
          "uitkListItem-focusVisible"
        );

        fireEvent.keyDown(input, { key: "ArrowDown" });

        expect(getByRole(list, "option", { name: /item.+2/i })).toHaveClass(
          "uitkListItem-highlighted",
          "uitkListItem-focusVisible"
        );
      });
    });

    describe("when the 'Enter' key is pressed", () => {
      describe("AND there is input text with no highlight", () => {
        it("should select the first item", () => {
          fireEvent.change(input, { target: { value: "l" } });
          // TODO uncomment when quickSelected is implemented in the list
          // expect(getByRole(list, "option", { name: /item.+1/i })).toHaveClass(
          //   "uitkListItem-quickSelected"
          // );
          fireEvent.keyDown(input, { key: "Enter" });

          console.log(prettyDOM(list));
          // pill group updated
          const pills = screen.getAllByTestId("pill");
          expect(pills).toHaveLength(1);
          expect(pills[0]).toHaveTextContent("list item 1");

          // list style updated
          expect(
            getByRole(list, "option", { name: /item.+1/i })
          ).toHaveAttribute("aria-selected", "true");

          // change callback invoked
          expect(changeSpy).toHaveBeenNthCalledWith(1, expect.anything(), [
            ITEMS[0],
          ]);
        });
      });

      it("should select the highlighted item", () => {
        // make sure cursor is at the end of the textarea
        fireEvent.keyDown(input, { key: "End" });
        fireEvent.keyDown(input, { key: "ArrowDown" });
        fireEvent.keyDown(input, { key: "Enter" });

        // pill group updated
        let pills = screen.getAllByTestId("pill");
        expect(pills).toHaveLength(1);
        expect(pills[0]).toHaveTextContent("list item 1");

        fireEvent.keyDown(input, { key: "ArrowDown" });
        fireEvent.keyDown(input, { key: "ArrowDown" });
        fireEvent.keyDown(input, { key: "Enter" });

        // pill group updated
        pills = screen.getAllByTestId("pill");
        expect(pills).toHaveLength(2);
        expect(pills[0]).toHaveTextContent("list item 1");
        expect(pills[1]).toHaveTextContent("list item 3");

        // list style updated
        expect(getByRole(list, "option", { name: /item.+1/i })).toHaveAttribute(
          "aria-selected",
          "true"
        );
        expect(getByRole(list, "option", { name: /item.+3/i })).toHaveAttribute(
          "aria-selected",
          "true"
        );
        expect(getByRole(list, "option", { name: /item.+3/i })).toHaveClass(
          "uitkListItem-highlighted"
        );

        // change callback invoked
        expect(changeSpy).toHaveBeenNthCalledWith(1, expect.anything(), [
          ITEMS[0],
        ]);

        expect(changeSpy).toHaveBeenNthCalledWith(2, expect.anything(), [
          ITEMS[0],
          ITEMS[2],
        ]);
      });
    });

    describe("when the 'Space' key is pressed", () => {
      it("should not select the highlighted item", () => {
        // make sure cursor is at the end of the textarea
        fireEvent.keyDown(input, { key: "End" });
        fireEvent.keyDown(input, { key: "ArrowDown" });
        fireEvent.keyDown(input, { key: "ArrowDown" });
        fireEvent.keyDown(input, { key: " " });

        // no list item is selected
        expect(list.querySelector("[aria-selected]")).not.toBeInTheDocument();

        // change callback not invoked
        expect(changeSpy).not.toHaveBeenCalled();
      });
    });

    describe("when the 'Tab' key is pressed", () => {
      it("should remove highlight and focus style from the list", () => {
        // make sure cursor is at the end of the textarea
        fireEvent.keyDown(input, { key: "End" });
        fireEvent.keyDown(input, { key: "ArrowDown" });
        fireEvent.keyDown(input, { key: "Tab" });

        expect(
          list.querySelector(".uitkListItem-highlighted")
        ).not.toBeInTheDocument();
        expect(
          list.querySelector(".uitkListItem-focusVisible")
        ).not.toBeInTheDocument();
      });

      it("should add the item if it is a valid option", () => {
        // type and tab out
        fireEvent.change(input, { target: { value: "list item 1" } });
        fireEvent.keyDown(input, { key: "Tab" });

        const pills = screen.getAllByTestId("pill");
        expect(pills).toHaveLength(1);
        expect(pills[0]).toHaveTextContent("list item 1");
      });

      it("should not add the item if it is an invalid option", () => {
        // type and tab out
        fireEvent.change(input, { target: { value: "list item xyz" } });
        fireEvent.keyDown(input, { key: "Tab" });

        const pills = screen.queryAllByRole("option", { name: /pill/i });
        expect(pills).toHaveLength(0);
      });
    });

    describe("when the 'Escape' key is pressed", () => {
      it("should clear the input and remove list highlight", () => {
        fireEvent.change(input, { target: { value: "item 1" } });
        fireEvent.keyDown(input, { key: "ArrowDown" });
        fireEvent.keyDown(input, { key: "Escape" });

        // input value cleared
        expect(input).not.toHaveValue();

        // list will be closed
        expect(list).not.toBeInTheDocument();
      });
    });
  });

  describe("with selected items", () => {
    const changeSpy = jest.fn();

    let tokenizedInput: HTMLElement;
    let input: HTMLElement;
    let list: HTMLElement;

    beforeEach(async () => {
      render(
        <ComboBox
          InputProps={{
            InputProps: { "data-testid": "input-container" } as any,
          }}
          initialSelectedItem={[ITEMS[0], ITEMS[2]]}
          multiSelect
          onChange={changeSpy}
          source={ITEMS}
          stringToItem={stringToItem}
        />
      );

      tokenizedInput = screen.getByTestId("input-container")
        .parentNode as HTMLElement;
      input = screen.getByRole("textbox");
      fireEvent.focus(input);

      list = await waitForListToBeInTheDocument();
    });

    afterEach(() => {
      changeSpy.mockClear();
    });

    describe("when focused", () => {
      it("should not highlight any item with a focus ring", () => {
        expect(
          list.querySelector(".uitkListItem-highlighted")
        ).not.toBeInTheDocument();
      });
    });

    describe("when the 'ArrowLeft' key is pressed", () => {
      it("should put the focus ring on the pill group only", () => {
        expect(
          getByRole(tokenizedInput, "option", { name: /item.+3/i }).closest(
            `.uitkInputPill`
          )
        ).not.toHaveClass("uitkInputPill-pillActive");

        // start navigating through pill group so the focus should be removed from list
        fireEvent.keyDown(input, { key: "ArrowLeft" });

        expect(
          getByRole(tokenizedInput, "option", { name: /item.+3/i }).closest(
            `.uitkInputPill`
          )
        ).toHaveClass("uitkInputPill-pillActive");
      });
    });

    describe("when the 'ArrowDown' key is pressed", () => {
      it("should put the focus ring on the list only", () => {
        fireEvent.keyDown(input, { key: "ArrowLeft" });
        fireEvent.keyDown(input, { key: "Home" });

        expect(
          getByRole(tokenizedInput, "option", { name: /item.+1/i }).closest(
            `.uitkInputPill`
          )
        ).toHaveClass("uitkInputPill-pillActive");

        expect(getByRole(list, "option", { name: /item.+1/i })).not.toHaveClass(
          "uitkListItem-focusVisible"
        );

        // start navigating through list so focus should be removed from pill group
        fireEvent.keyDown(input, { key: "ArrowDown" });

        expect(
          getByRole(tokenizedInput, "option", { name: /item.+1/i })
        ).not.toHaveClass("uitkInputPill-pillActive");

        expect(getByRole(list, "option", { name: /item.+1/i })).toHaveClass(
          "uitkListItem-focusVisible"
        );
      });
    });

    describe("when the 'Tab' key is pressed", () => {
      it("should add an item if it hasn't been selected", () => {
        // type and tab out
        fireEvent.change(input, { target: { value: "list item 2" } });
        fireEvent.keyDown(input, { key: "Tab" });

        const pills = screen.getAllByTestId("pill");
        expect(pills).toHaveLength(3);
        expect(pills[0]).toHaveTextContent("list item 1");
        expect(pills[1]).toHaveTextContent("list item 3");
        expect(pills[2]).toHaveTextContent("list item 2");
      });

      it("should not add an item if it has already been selected", () => {
        // type and tab out
        fireEvent.change(input, { target: { value: "list item 3" } });
        fireEvent.keyDown(input, { key: "Tab" });

        const pills = screen.getAllByTestId("pill");
        expect(pills).toHaveLength(2);
        expect(pills[0]).toHaveTextContent("list item 1");
        expect(pills[1]).toHaveTextContent("list item 3");
      });
    });

    describe("when the 'Enter' key is pressed with an item in focus", () => {
      it("should de-select any selected item", () => {
        // make sure cursor is at the end of the textarea
        fireEvent.keyDown(input, { key: "End" });
        fireEvent.keyDown(input, { key: "ArrowDown" });
        fireEvent.keyDown(input, { key: "Enter" });

        // pill group updated
        let pills = screen.getAllByTestId("pill");
        expect(pills).toHaveLength(1);
        expect(pills[0]).toHaveTextContent("list item 3");

        fireEvent.keyDown(input, { key: "ArrowDown" });
        fireEvent.keyDown(input, { key: "ArrowDown" });
        fireEvent.keyDown(input, { key: "Enter" });

        // pill group cleared
        pills = screen.queryAllByRole("option", { name: /pill/i });
        expect(pills).toHaveLength(0);

        // list style updated
        expect(
          getByRole(list, "option", { name: /item.+1/i })
        ).not.toHaveAttribute("aria-selected", "true");
        expect(
          getByRole(list, "option", { name: /item.+3/i })
        ).not.toHaveAttribute("aria-selected", "true");

        // change callback invoked
        expect(changeSpy).toHaveBeenNthCalledWith(1, expect.anything(), [
          ITEMS[2],
        ]);
        expect(changeSpy).toHaveBeenNthCalledWith(2, expect.anything(), []);
      });
    });

    describe("when the 'Enter' key is pressed while focused on pills", () => {
      it("should de-select any selected item", () => {
        fireEvent.keyDown(input, { key: "ArrowLeft" });
        fireEvent.keyDown(input, { key: "Enter" });

        // selection updated
        const items = getAllByRole(list, "option");
        expect(items[0]).toHaveAttribute("aria-selected", "true");
        expect(items[1]).not.toHaveAttribute("aria-selected", "true");
        expect(items[2]).not.toHaveAttribute("aria-selected", "true");
        expect(items[3]).not.toHaveAttribute("aria-selected", "true");

        fireEvent.keyDown(input, { key: "ArrowLeft" });
        fireEvent.keyDown(input, { key: "Enter" });

        // selection cleared
        expect(items[0]).not.toHaveAttribute("aria-selected", "true");
        expect(items[1]).not.toHaveAttribute("aria-selected", "true");
        expect(items[2]).not.toHaveAttribute("aria-selected", "true");
        expect(items[3]).not.toHaveAttribute("aria-selected", "true");

        // change callback invoked
        expect(changeSpy).toHaveBeenNthCalledWith(1, null, [ITEMS[0]]);
        expect(changeSpy).toHaveBeenNthCalledWith(2, null, []);
      });
    });
  });
});

describe("A multi-select combo box that allows free text item", () => {
  describe("with nothing selected", () => {
    const changeSpy = jest.fn();

    let input: HTMLElement;
    let list: HTMLElement;

    beforeEach(async () => {
      render(
        <ComboBox
          allowFreeText
          multiSelect
          onChange={changeSpy}
          source={ITEMS}
          stringToItem={stringToItem}
        />
      );

      input = screen.getByRole("textbox");
      fireEvent.focus(input);

      list = await waitForListToBeInTheDocument();
    });

    afterEach(() => {
      changeSpy.mockClear();
    });

    describe("when using delimiter", () => {
      it("should add unique items only", () => {
        // type and tab out
        fireEvent.change(input, {
          target: {
            value: "list item 1, list item 2, list item 1, list item xyz",
          },
        });

        const pills = screen.getAllByTestId("pill");
        expect(pills).toHaveLength(3);
        expect(pills[0]).toHaveTextContent("list item 1");
        expect(pills[1]).toHaveTextContent("list item 2");
        expect(pills[2]).toHaveTextContent("list item xyz");

        // list style updated
        list = getListbox();

        expect(getByRole(list, "option", { name: /item.+1/i })).toHaveAttribute(
          "aria-selected",
          "true"
        );
        expect(getByRole(list, "option", { name: /item.+2/i })).toHaveAttribute(
          "aria-selected",
          "true"
        );

        // change callback invoked with expected items
        expect(changeSpy).toHaveBeenCalledWith(null, [
          ITEMS[0],
          ITEMS[1],
          // newly created item by stringToItem
          {
            id: 3,
            label: "list item xyz",
          },
        ]);
      });
    });

    it("should add any free text item", () => {
      // type and tab out
      fireEvent.change(input, { target: { value: "list item xyz" } });
      fireEvent.keyDown(input, { key: "Tab" });

      const pills = screen.getAllByTestId("pill");
      expect(pills).toHaveLength(1);
      expect(pills[0]).toHaveTextContent("list item xyz");
    });

    it("should not add an item if it already exists", () => {
      // initialized with an item
      fireEvent.change(input, { target: { value: "list item xyz" } });
      fireEvent.keyDown(input, { key: "Enter" });

      // type it again and tab out
      fireEvent.change(input, { target: { value: "list item xyz" } });
      fireEvent.keyDown(input, { key: "Tab" });

      const pills = screen.getAllByTestId("pill");
      expect(pills).toHaveLength(1);
      expect(pills[0]).toHaveTextContent("list item xyz");
    });
  });

  describe("with selected items", () => {
    const changeSpy = jest.fn();

    let input: HTMLElement;

    beforeEach(() => {
      render(
        <ComboBox
          InputProps={{
            InputProps: { "data-testid": "input-container" } as any,
          }}
          allowFreeText
          initialSelectedItem={[ITEMS[0], ITEMS[2]]}
          multiSelect
          onChange={changeSpy}
          source={ITEMS}
          stringToItem={stringToItem}
        />
      );

      input = screen.getByRole("textbox");
      fireEvent.focus(input);
    });

    afterEach(() => {
      changeSpy.mockClear();
    });

    it("should add an item if it hasn't been selected", () => {
      // type and tab out
      fireEvent.change(input, { target: { value: "list item 2" } });
      fireEvent.keyDown(input, { key: "Tab" });

      const pills = screen.getAllByTestId("pill");
      expect(pills).toHaveLength(3);
      expect(pills[0]).toHaveTextContent("list item 1");
      expect(pills[1]).toHaveTextContent("list item 3");
      expect(pills[2]).toHaveTextContent("list item 2");
    });

    it("should not add an item if it has already been selected", () => {
      // type and tab out
      fireEvent.change(input, { target: { value: "list item 3" } });
      fireEvent.keyDown(input, { key: "Tab" });

      const pills = screen.getAllByTestId("pill");
      expect(pills).toHaveLength(2);
      expect(pills[0]).toHaveTextContent("list item 1");
      expect(pills[1]).toHaveTextContent("list item 3");
    });
  });
});
