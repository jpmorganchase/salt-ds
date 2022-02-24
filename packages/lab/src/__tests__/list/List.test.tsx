import { render, fireEvent } from "@testing-library/react";

import { List, ListItem } from "../../list";

type ItemType = { label: string; value: string };
const ITEMS: ItemType[] = [
  { label: "list item 1", value: "item 1" },
  { label: "list item 2", value: "item 2" },
  { label: "list item 3", value: "item 3" },
];

describe("A list", () => {
  it("should render all its items", () => {
    const { queryByText } = render(<List source={ITEMS} />);

    expect(queryByText("list item 1")).toBeInTheDocument();
    expect(queryByText("list item 2")).toBeInTheDocument();
    expect(queryByText("list item 3")).toBeInTheDocument();
  });

  it("should render with a customised id", () => {
    const { getAllByRole } = render(<List id="my-list" source={ITEMS} />);

    const items = getAllByRole("option");

    expect(items[0]).toHaveAttribute("id", "my-list-item-0");
    expect(items[1]).toHaveAttribute("id", "my-list-item-1");
    expect(items[2]).toHaveAttribute("id", "my-list-item-2");
  });

  it('should render with a customised "getItemId"', () => {
    const getItemId = (index: number) => `my-item-${index}`;

    const { getByRole, getAllByRole } = render(
      <List getItemId={getItemId} id="my-list" source={ITEMS} />
    );

    const list = getByRole("listbox");
    const items = getAllByRole("option");

    expect(list).toHaveAttribute("id", "my-list");
    expect(items[0]).toHaveAttribute("id", "my-item-0");
    expect(items[1]).toHaveAttribute("id", "my-item-1");
    expect(items[2]).toHaveAttribute("id", "my-item-2");
  });

  it('should render with a customised "displayItemCount"', () => {
    const { getByRole } = render(
      <List borderless displayedItemCount={2} itemHeight={10} source={ITEMS} />
    );

    // 21 = itemHeight * displayedItemCount + gaps (1 gap * 1)
    expect(getByRole("listbox").parentNode).toHaveStyle("max-height: 21px;");
  });

  it('should render with a customised "itemToString"', () => {
    const { queryByText } = render(
      <List itemToString={(item) => item.value} source={ITEMS} />
    );

    expect(queryByText("item 1")).toBeInTheDocument();
    expect(queryByText("item 2")).toBeInTheDocument();
    expect(queryByText("item 3")).toBeInTheDocument();
  });

  it("should render with a customised indexer", () => {
    const itemCount = ITEMS.length;
    const getItemIndex = (item: ItemType) => ITEMS.indexOf(item);
    const getItemAtIndex = (index: number) => ITEMS[index];

    const { queryByText } = render(
      <List
        getItemAtIndex={getItemAtIndex}
        getItemIndex={getItemIndex}
        itemCount={itemCount}
      />
    );

    expect(queryByText("list item 1")).toBeInTheDocument();
    expect(queryByText("list item 2")).toBeInTheDocument();
    expect(queryByText("list item 3")).toBeInTheDocument();
  });

  it('should render with a customised "getItemHeight"', () => {
    const height: { [key: number]: number } = {
      0: 20,
      1: 30,
      2: 50,
    };

    const getItemHeight = (index?: number) =>
      index !== undefined ? height[index] : 0;

    const { getAllByRole } = render(
      <List getItemHeight={getItemHeight} itemHeight={50} source={ITEMS} />
    );

    const items = getAllByRole("option");

    expect(items[0]).toHaveStyle("height: 20px");
    expect(items[1]).toHaveStyle("height: 30px");
    expect(items[2]).toHaveStyle("height: 50px");
  });

  it("should call the mousedown event on list by default", () => {
    const mouseDownSpy = jest.fn();

    const { getByText } = render(
      <List onMouseDown={mouseDownSpy} source={ITEMS} />
    );

    fireEvent.mouseDown(getByText("list item 1"));

    expect(mouseDownSpy).toHaveBeenCalled();
  });

  it("should not call the mousedown event on list if disableMouseDown is set to true", () => {
    const mouseDownSpy = jest.fn();

    const { getByText } = render(
      <List disableMouseDown onMouseDown={mouseDownSpy} source={ITEMS} />
    );

    fireEvent.mouseDown(getByText("list item 1"));

    expect(mouseDownSpy).not.toHaveBeenCalled();
  });

  it("should not call the mousedown event on list item if disableMouseDown is set to true", () => {
    const mouseDownSpy = jest.fn();

    const { getByText } = render(
      <List disableMouseDown>
        <ListItem item={ITEMS[0]} onMouseDown={mouseDownSpy} />
      </List>
    );

    fireEvent.mouseDown(getByText("list item 1"));

    expect(mouseDownSpy).not.toHaveBeenCalled();
  });

  describe('with a customised "itemHeight"', () => {
    it("should render with numeric value", () => {
      const { getAllByRole } = render(<List itemHeight={50} source={ITEMS} />);

      getAllByRole("option").forEach((item) => {
        expect(item).toHaveStyle("height: 50px");
      });
    });

    it("should render with percentage value", () => {
      const { getAllByRole } = render(
        <List itemHeight="33.33%" source={ITEMS} />
      );

      getAllByRole("option").forEach((item) => {
        expect(item).toHaveStyle("height: 33.33%");
      });
    });
  });
});

describe("A virtualized list", () => {
  it("should render only a portion of all its items", () => {
    const virtualizedItemCount = 100;
    const source = Array.from({ length: virtualizedItemCount }).map(
      (_, index) => ({
        label: `list item ${index + 1}`,
      })
    );

    const { getAllByRole } = render(
      <List height={362} source={source} virtualized width={200} />
    );

    expect(getAllByRole("option").length).toBeLessThan(virtualizedItemCount);
  });
});

describe("A list with no items", () => {
  it("should render an empty list", () => {
    const { getByRole } = render(<List />);

    expect(getByRole("listbox")).toBeEmptyDOMElement();
  });

  describe("when a placeholder component is provided", () => {
    it("should render the placeholder instead", () => {
      const Placeholder = () => (
        <div data-testid="list-placeholder">No Items</div>
      );

      const { queryByRole, queryByTestId } = render(
        <List ListPlaceholder={Placeholder} />
      );

      expect(queryByRole("listbox")).not.toBeInTheDocument();
      expect(queryByTestId("list-placeholder")).toBeInTheDocument();
    });
  });
});
