import { fireEvent, render, RenderResult } from "@testing-library/react";

import { List, ListItem, ListItemProps } from "../../list";

describe("A declarative list", () => {
  it("should render all list items", () => {
    const { queryByText } = render(
      <List>
        <ListItem>list item 1</ListItem>
        <ListItem>list item 2</ListItem>
        <ListItem>list item 3</ListItem>
      </List>
    );

    expect(queryByText("list item 1")).toBeInTheDocument();
    expect(queryByText("list item 2")).toBeInTheDocument();
    expect(queryByText("list item 3")).toBeInTheDocument();
  });

  describe("when item data is provided", () => {
    it("should use the customized 'itemToString'", () => {
      const item = { name: "John", age: 25 };
      const itemToString: ListItemProps<typeof item>["itemToString"] = ({
        name,
      }) => name;

      const { getByRole } = render(
        <List>
          <ListItem item={item} itemToString={itemToString} />
        </List>
      );

      expect(getByRole("option")).toHaveTextContent("John");
    });

    it("should ignore the data if it has children", () => {
      const item = { name: "John", age: 25 };
      const itemToString: ListItemProps<typeof item>["itemToString"] = ({
        name,
      }) => name;

      const { getByRole } = render(
        <List>
          <ListItem item={item} itemToString={itemToString}>
            Joe
          </ListItem>
        </List>
      );

      expect(getByRole("option")).toHaveTextContent("Joe");
    });
  });

  describe("when mouse is moved over an item", () => {
    it("should highlight that item", () => {
      const { getAllByRole } = render(
        <List>
          <ListItem>list item 1</ListItem>
          <ListItem>list item 2</ListItem>
          <ListItem>list item 3</ListItem>
        </List>
      );

      const items = getAllByRole("option");

      fireEvent.mouseMove(items[1]);

      expect(items[1]).toHaveClass("uitkListItem-highlighted");
    });
  });

  describe("when clicked an item", () => {
    it("should select that item", () => {
      const onChangeSpy = jest.fn();
      const onSelectSpy = jest.fn();

      const { getAllByRole } = render(
        <List onChange={onChangeSpy} onSelect={onSelectSpy}>
          <ListItem>list item 1</ListItem>
          <ListItem>list item 2</ListItem>
          <ListItem>list item 3</ListItem>
        </List>
      );

      const items = getAllByRole("option");

      fireEvent.click(items[1]);

      expect(items[1]).toHaveClass("uitkListItem-selected");
      expect(onChangeSpy).toHaveBeenCalledWith(
        expect.anything(),
        "list item 2"
      );
      expect(onSelectSpy).toHaveBeenCalledWith(
        expect.anything(),
        "list item 2"
      );
    });
  });
});

describe("A declarative list with a disabled item", () => {
  const selectionSpy = jest.fn();
  let result: RenderResult;

  beforeEach(() => {
    result = render(
      <List onChange={selectionSpy}>
        <ListItem>list item 1</ListItem>
        <ListItem disabled>list item 2</ListItem>
        <ListItem>list item 3</ListItem>
      </List>
    );
  });

  afterEach(() => {
    selectionSpy.mockClear();
  });

  it("should render disabled style for the disabled item", () => {
    const disabledItem = result.getAllByRole("option")[1];

    expect(disabledItem).toHaveClass("uitkListItem-disabled");
  });

  describe("when clicked on the disabled item", () => {
    it("should not select anything", () => {
      const disabledItem = result.getAllByRole("option")[1];

      fireEvent.click(disabledItem);

      expect(disabledItem).not.toHaveClass("uitkListItem-selected");
      expect(selectionSpy).not.toHaveBeenCalled();
    });
  });

  describe("when mouse is moved over the disabled item", () => {
    it("should not highlight that item", () => {
      const disabledItem = result.getAllByRole("option")[1];

      fireEvent.mouseMove(disabledItem);

      expect(disabledItem).not.toHaveClass("uitkListItem-highlighted");
    });
  });
});

describe("A disabled declarative list", () => {
  const selectionSpy = jest.fn();
  let result: RenderResult;

  beforeEach(() => {
    result = render(
      <List disabled onChange={selectionSpy}>
        <ListItem>list item 1</ListItem>
        <ListItem>list item 2</ListItem>
        <ListItem>list item 3</ListItem>
      </List>
    );
  });

  afterEach(() => {
    selectionSpy.mockClear();
  });

  it("should have the disabled list style", () => {
    expect(result.getByRole("listbox")).toHaveClass("uitkList-disabled");
  });

  describe("when clicked its items", () => {
    it("should not select anything", () => {
      result.getAllByRole("option").forEach((option) => {
        fireEvent.click(option);
      });

      expect(selectionSpy).not.toHaveBeenCalled();
    });
  });
});
