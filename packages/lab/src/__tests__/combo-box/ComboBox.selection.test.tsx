import {
  waitFor,
  screen,
  render,
  fireEvent,
  getByRole,
} from "@testing-library/react";
import React from "react";
import { ComboBox } from "../../combo-box";

const ITEMS = [
  { label: "list item 1", value: "item 1" },
  { label: "list item 2", value: "item 2" },
  { label: "list item 3", value: "item 3" },
];

const waitForListToBeInTheDocument = async () => {
  await waitFor(() => {
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });
};

describe("A combo box", () => {
  const changeSpy = jest.fn();

  // let itemClasses;
  let input: HTMLElement;

  beforeAll(() => {
    // itemClasses = getClasses(<ListItemBase />);
  });

  beforeEach(async () => {
    render(<ComboBox onChange={changeSpy} source={ITEMS} />);

    input = screen.getByRole("combobox");
    fireEvent.focus(input);

    await waitForListToBeInTheDocument();
  });

  afterEach(() => {
    changeSpy.mockClear();
  });

  it("should select the clicked item", () => {
    fireEvent.click(
      getByRole(screen.getByRole("listbox"), "option", { name: /item.+2/i })
    );

    // input value updated
    expect(input).toHaveValue(ITEMS[1].label);

    // list is closed
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    // change callback invoked
    expect(changeSpy).toHaveBeenCalledWith(expect.anything(), ITEMS[1]);
  });

  it("should update input with the selected item", async () => {
    // filter and select item 2
    fireEvent.change(input, { target: { value: "m 2" } });
    expect(input).toHaveValue("m 2");

    fireEvent.click(screen.getByRole("option"));
    expect(input).toHaveValue(ITEMS[1].label);

    // filter and select item 3
    fireEvent.focus(input);
    await waitForListToBeInTheDocument();

    fireEvent.change(input, { target: { value: "m 3" } });
    expect(input).toHaveValue("m 3");

    fireEvent.click(screen.getByRole("option"));
    expect(input).toHaveValue(ITEMS[2].label);
  });

  it("should do nothing when the selected item is clicked again", async () => {
    fireEvent.click(
      getByRole(screen.getByRole("listbox"), "option", { name: /item.+2/i })
    );

    fireEvent.focus(input);
    await waitForListToBeInTheDocument();

    fireEvent.click(
      getByRole(screen.getByRole("listbox"), "option", { name: /item.+2/i })
    );

    fireEvent.focus(input);
    await waitForListToBeInTheDocument();

    // input value stays the same
    expect(input).toHaveValue(ITEMS[1].label);

    // list style stays the same
    expect(
      getByRole(screen.getByRole("listbox"), "option", { name: /item.+2/i })
    ).toHaveAttribute("aria-checked", "true");
    expect(
      getByRole(screen.getByRole("listbox"), "option", { name: /item.+2/i })
    ).toHaveClass("uitkListItem-highlighted");

    // change callback invoked only once
    expect(changeSpy).toHaveBeenCalledTimes(1);
  });

  it("should not clear the selection when input value changes", async () => {
    fireEvent.click(
      getByRole(screen.getByRole("listbox"), "option", { name: /item.+2/i })
    );

    fireEvent.focus(input);
    await waitForListToBeInTheDocument();

    // change input
    fireEvent.change(input, { target: { value: "item 2" } });

    expect(
      getByRole(screen.getByRole("listbox"), "option", { name: /item.+2/i })
    ).toHaveAttribute("aria-checked", "true");
    expect(changeSpy).toHaveBeenCalledTimes(1);
  });

  it("should clear the selection when input is cleared", async () => {
    fireEvent.click(
      getByRole(screen.getByRole("listbox"), "option", { name: /item.+2/i })
    );

    fireEvent.focus(input);
    await waitForListToBeInTheDocument();

    // clear input
    fireEvent.change(input, { target: { value: "" } });

    expect(
      getByRole(screen.getByRole("listbox"), "option", { name: /item.+2/i })
    ).not.toHaveAttribute("aria-selected", "true");
    expect(
      getByRole(screen.getByRole("listbox"), "option", { name: /item.+2/i })
    ).not.toHaveClass("Highlighter-highlighted");

    // change callback invoked twice - when clicked and when selection is cleared
    expect(changeSpy).toHaveBeenCalledTimes(2);
    expect(changeSpy).toHaveBeenLastCalledWith(expect.anything(), null);
  });
});

describe("A multi-select combo box", () => {
  const changeSpy = jest.fn();

  // let itemClasses;
  let tokenizedInput: HTMLElement;
  let input: HTMLElement;
  let list: HTMLElement;

  beforeAll(() => {
    // itemClasses = getClasses(<ListItemBase />);
  });

  beforeEach(() => {
    render(
      <ComboBox
        InputProps={{ InputProps: { "data-testid": "input-container" } as any }}
        initialOpen
        multiSelect
        onChange={changeSpy}
        source={ITEMS}
      />
    );

    tokenizedInput = screen.getByTestId("input-container")
      .parentNode as HTMLElement;
    input = screen.getByRole("textbox");
    list = screen.getAllByRole("listbox")[1];
  });

  afterEach(() => {
    changeSpy.mockClear();
  });

  it("should select clicked items", () => {
    fireEvent.click(getByRole(list, "option", { name: /item.+2/i }));
    fireEvent.click(getByRole(list, "option", { name: /item.+3/i }));

    // pill group updated
    const pills = screen.getAllByTestId("pill");
    expect(pills).toHaveLength(2);
    expect(pills[0]).toHaveTextContent("list item 2");
    expect(pills[1]).toHaveTextContent("list item 3");

    // list style updated
    expect(getByRole(list, "option", { name: /item.+2/i })).toHaveAttribute(
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
    expect(changeSpy).toHaveBeenNthCalledWith(1, expect.anything(), [ITEMS[1]]);
    expect(changeSpy).toHaveBeenNthCalledWith(2, expect.anything(), [
      ITEMS[1],
      ITEMS[2],
    ]);
  });

  it("should clear input when an item is selected", () => {
    fireEvent.change(input, { target: { value: "m 2" } });
    expect(input).toHaveValue("m 2");

    fireEvent.click(screen.getByRole("option"));

    expect(input).not.toHaveValue();
  });

  it("should de-select when the selected item is clicked again", () => {
    fireEvent.click(getByRole(list, "option", { name: /item.+1/i }));
    fireEvent.click(getByRole(list, "option", { name: /item.+2/i }));
    fireEvent.click(getByRole(list, "option", { name: /item.+1/i }));

    // pill group updated
    const pills = screen.getAllByTestId("pill");
    expect(pills).toHaveLength(1);
    expect(pills[0]).toHaveTextContent("list item 2");

    // list style updated
    expect(getByRole(list, "option", { name: /item.+1/i })).not.toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(getByRole(list, "option", { name: /item.+2/i })).toHaveAttribute(
      "aria-selected",
      "true"
    );

    // change callback invoked
    expect(changeSpy).toHaveBeenNthCalledWith(1, expect.anything(), [ITEMS[0]]);
    expect(changeSpy).toHaveBeenNthCalledWith(2, expect.anything(), [
      ITEMS[0],
      ITEMS[1],
    ]);
    expect(changeSpy).toHaveBeenNthCalledWith(3, expect.anything(), [ITEMS[1]]);
  });

  it("should de-select when the selected term is removed from input", () => {
    fireEvent.click(getByRole(list, "option", { name: /item.+2/i }));
    fireEvent.click(getByRole(list, "option", { name: /item.+3/i }));
    fireEvent.click(
      getByRole(
        getByRole(tokenizedInput, "option", { name: /item.+2/i }),
        "button",
        { hidden: true }
      )
    );

    // pill group updated
    expect(screen.getAllByTestId("pill")).toHaveLength(1);

    // list style updated
    expect(getByRole(list, "option", { name: /item.+3/i })).toHaveAttribute(
      "aria-selected",
      "true"
    );

    // change callback invoked
    expect(changeSpy).toHaveBeenNthCalledWith(1, expect.anything(), [ITEMS[1]]);
    expect(changeSpy).toHaveBeenNthCalledWith(2, expect.anything(), [
      ITEMS[1],
      ITEMS[2],
    ]);
    expect(changeSpy).toHaveBeenNthCalledWith(3, null, [ITEMS[2]]);
  });

  it("should de-select all the selected term when input is cleared", () => {
    fireEvent.click(getByRole(list, "option", { name: /item.+1/i }));
    fireEvent.click(getByRole(list, "option", { name: /item.+3/i }));
    fireEvent.click(screen.getByRole("button", { name: "clear input" }));

    // pill group updated
    expect(
      screen.queryAllByRole("button", { name: /item.+pill/i })
    ).toHaveLength(0);

    // list style updated
    expect(getByRole(list, "option", { name: /item.+1/i })).not.toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(getByRole(list, "option", { name: /item.+3/i })).not.toHaveAttribute(
      "aria-selected",
      "true"
    );

    // change callback invoked
    expect(changeSpy).toHaveBeenNthCalledWith(1, expect.anything(), [ITEMS[0]]);
    expect(changeSpy).toHaveBeenNthCalledWith(2, expect.anything(), [
      ITEMS[0],
      ITEMS[2],
    ]);
    expect(changeSpy).toHaveBeenNthCalledWith(3, null, []);
  });
});
