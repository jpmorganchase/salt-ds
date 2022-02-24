import React from "react";
import {
  waitFor,
  screen,
  render,
  fireEvent,
  getByRole,
} from "@testing-library/react";
import { ComboBox } from "../../combo-box";

interface Item {
  id: number;
  label: string;
  value?: string;
}

const ITEMS: Item[] = [
  { id: 1, label: "list item 1", value: "item 1" },
  { id: 2, label: "list item 2", value: "item 2" },
  { id: 3, label: "list item 3", value: "item 3" },
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

const waitForListToBeInTheDocument = async () => {
  await waitFor(() => {
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });
};

describe("A combo box", () => {
  it("should render all its items", async () => {
    render(<ComboBox source={ITEMS} />);

    fireEvent.focus(screen.getByRole("combobox"));
    await waitForListToBeInTheDocument();

    expect(screen.getByText("list item 1")).toBeInTheDocument();
    expect(screen.getByText("list item 2")).toBeInTheDocument();
    expect(screen.getByText("list item 3")).toBeInTheDocument();
  });

  it("should render with a customized id", async () => {
    render(<ComboBox id="my-combo-box" source={ITEMS} />);

    const input = screen.getByRole("combobox");

    fireEvent.focus(input);
    await waitForListToBeInTheDocument();

    const list = screen.getByRole("listbox");
    const items = screen.getAllByLabelText(/list item/);

    expect(input).toHaveAttribute("id", "my-combo-box-input");
    expect(list).toHaveAttribute("id", "my-combo-box-list");
    expect(items[0]).toHaveAttribute("id", "my-combo-box-list-item-0");
    expect(items[1]).toHaveAttribute("id", "my-combo-box-list-item-1");
    expect(items[2]).toHaveAttribute("id", "my-combo-box-list-item-2");
  });

  it('should render with a customized "itemToString"', async () => {
    render(<ComboBox itemToString={(item) => item.value} source={ITEMS} />);

    fireEvent.focus(screen.getByRole("combobox"));
    await waitForListToBeInTheDocument();

    expect(screen.getByText("item 1")).toBeInTheDocument();
    expect(screen.getByText("item 2")).toBeInTheDocument();
    expect(screen.getByText("item 3")).toBeInTheDocument();
  });

  it('should allow setting "initialSelectedItem"', async () => {
    render(<ComboBox initialSelectedItem={ITEMS[2]} source={ITEMS} />);

    const input = screen.getByRole("combobox");

    fireEvent.focus(input);
    await waitForListToBeInTheDocument();

    const items = screen.getAllByLabelText(/list item/);

    expect(input).toHaveValue("list item 3");
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveClass("uitkListItem-selected");
  });

  it('should become a multi-select combo box if "initialSelectedItem" is an array', () => {
    render(
      <ComboBox
        initialOpen
        initialSelectedItem={[ITEMS[1], ITEMS[2]]}
        source={ITEMS}
      />
    );

    const list = screen.getAllByRole("listbox")[1];
    const pills = screen.getAllByTestId("pill");

    // multi-select input should be empty
    expect(screen.getByRole("textbox")).not.toHaveValue();

    // selection is presented as a group of pills
    expect(pills).toHaveLength(2);
    expect(pills[0]).toHaveTextContent("list item 2");
    expect(pills[1]).toHaveTextContent("list item 3");

    // and they should be "selected" in the list
    expect(getByRole(list, "option", { name: /item.+2/i })).toHaveAttribute(
      "aria-selected",
      "true"
    );

    expect(getByRole(list, "option", { name: /item.+3/i })).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });

  it("should allow customized item filter", () => {
    render(
      <ComboBox
        getFilterRegex={(value) => new RegExp(`${value}`, "g")}
        source={ITEMS}
      />
    );

    const input = screen.getByRole("combobox");

    // filter with upper case
    fireEvent.change(input, { target: { value: "M 3" } });

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    expect(screen.queryAllByRole("option")).toHaveLength(0);
  });

  describe("when start typing in the input", () => {
    it("should filter items", async () => {
      render(<ComboBox source={ITEMS} />);

      const input = screen.getByRole("combobox");

      fireEvent.focus(input);
      await waitForListToBeInTheDocument();

      // filter
      fireEvent.change(input, { target: { value: "M 3" } });

      const options = screen.getAllByRole("option");
      expect(options).toHaveLength(1);
      expect(options[0]).toHaveTextContent("list item 3");

      // clear
      fireEvent.change(input, { target: { value: "" } });
      expect(screen.getAllByRole("option")).toHaveLength(3);
    });

    it("should highlight matching text", async () => {
      render(<ComboBox source={ITEMS} />);

      const input = screen.getByRole("combobox");

      fireEvent.focus(input);
      await waitForListToBeInTheDocument();

      fireEvent.change(input, { target: { value: "M 3" } });

      expect(screen.getAllByRole("option")).toHaveLength(1);
      expect(screen.getByText("m 3")).toHaveClass("uitkHighlighter-highlight");
    });
  });
});

describe("A multi-select combo box", () => {
  it("should render with a customized id", () => {
    render(
      <ComboBox
        id="my-combo-box"
        initialOpen
        initialSelectedItem={[ITEMS[0], ITEMS[2]]}
        source={ITEMS}
      />
    );

    const input = screen.getByRole("textbox");
    const list = screen.getAllByRole("listbox")[1];
    const items = screen.getAllByLabelText(/list item/);
    const pills = screen.getAllByTestId("pill");

    expect(input).toHaveAttribute("id", "my-combo-box-input-input");
    expect(pills[0]).toHaveAttribute("id", "my-combo-box-input-pill-0");
    expect(pills[1]).toHaveAttribute("id", "my-combo-box-input-pill-1");

    expect(list).toHaveAttribute("id", "my-combo-box-list");
    expect(items[0]).toHaveAttribute("id", "my-combo-box-list-item-0");
    expect(items[1]).toHaveAttribute("id", "my-combo-box-list-item-1");
    expect(items[2]).toHaveAttribute("id", "my-combo-box-list-item-2");
  });

  it("should allow customized delimiter", () => {
    const changeSpy = jest.fn();

    render(
      <ComboBox
        delimiter="|"
        initialOpen
        multiSelect
        onChange={changeSpy}
        source={ITEMS}
        stringToItem={stringToItem}
      />
    );

    const input = screen.getByRole("textbox");

    fireEvent.focus(input);
    fireEvent.change(input, {
      target: {
        value: "list item 1| list item 3",
      },
    });

    const pills = screen.getAllByTestId("pill");
    expect(pills).toHaveLength(2);
    expect(pills[0]).toHaveTextContent("list item 1");
    expect(pills[1]).toHaveTextContent("list item 3");

    // list style updated
    const list = screen.getAllByRole("listbox")[1];

    expect(getByRole(list, "option", { name: /item.+1/i })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(getByRole(list, "option", { name: /item.+3/i })).toHaveAttribute(
      "aria-selected",
      "true"
    );

    // change callback invoked with expected items
    expect(changeSpy).toHaveBeenCalledWith(null, [ITEMS[0], ITEMS[2]]);
  });
});
