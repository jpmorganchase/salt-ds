import { render, fireEvent, RenderResult } from "@testing-library/react";

import { List, ListItem } from "../../list";

type ItemWithLabel = { label: string };
const ITEMS: ItemWithLabel[] = [
  { label: "list item 1" },
  { label: "list item 2" },
  { label: "list item 3" },
  { label: "list item 4" },
];

["list", "declarative list"].forEach((listType) => {
  describe(`A default ${listType} with a selected item`, () => {
    const onChangeSpy = jest.fn();
    const onSelectSpy = jest.fn();
    const isDeclarative = listType === "declarative list";

    let result: RenderResult;

    beforeEach(() => {
      jest.clearAllMocks();
      result = isDeclarative
        ? render(
            <List
              initialSelectedItem="list item 2"
              onChange={onChangeSpy}
              onSelect={onSelectSpy}
            >
              <ListItem>list item 1</ListItem>
              <ListItem>list item 2</ListItem>
              <ListItem>list item 3</ListItem>
              <ListItem>list item 4</ListItem>
            </List>
          )
        : render(
            <List
              initialSelectedItem={ITEMS[1]}
              onChange={onChangeSpy}
              onSelect={onSelectSpy}
              source={ITEMS}
            />
          );
    });

    it("clicking the selected item should not change selected item", () => {
      const { getAllByRole } = result;

      const items = getAllByRole("option");

      fireEvent.click(items[1]);

      expect(items[1]).toHaveClass("uitkListItem-selected");

      expect(onChangeSpy).not.toHaveBeenCalled();
      expect(onSelectSpy).toHaveBeenCalledWith(
        expect.anything(),
        isDeclarative ? "list item 2" : ITEMS[1]
      );
    });

    it("clicking another item should change selected item", () => {
      const { getAllByRole } = result;

      const items = getAllByRole("option");

      fireEvent.click(items[2]);

      expect(items[1]).not.toHaveClass("uitkListItem-selected");
      expect(items[2]).toHaveClass("uitkListItem-selected");

      expect(onChangeSpy).toHaveBeenLastCalledWith(
        expect.anything(),
        isDeclarative ? "list item 3" : ITEMS[2]
      );
      expect(onSelectSpy).toHaveBeenCalledWith(
        expect.anything(),
        isDeclarative ? "list item 3" : ITEMS[2]
      );
    });
  });
});

["list", "declarative list"].forEach((listType) => {
  describe(`A de-selectable ${listType} with a selected item`, () => {
    const onChangeSpy = jest.fn();
    const onSelectSpy = jest.fn();
    const isDeclarative = listType === "declarative list";

    let result: RenderResult;

    beforeEach(() => {
      jest.clearAllMocks();
      result = isDeclarative
        ? render(
            <List
              initialSelectedItem="list item 2"
              onChange={onChangeSpy}
              onSelect={onSelectSpy}
              selectionVariant="deselectable"
            >
              <ListItem>list item 1</ListItem>
              <ListItem>list item 2</ListItem>
              <ListItem>list item 3</ListItem>
              <ListItem>list item 4</ListItem>
            </List>
          )
        : render(
            <List
              initialSelectedItem={ITEMS[1]}
              onChange={onChangeSpy}
              onSelect={onSelectSpy}
              selectionVariant="deselectable"
              source={ITEMS}
            />
          );
    });

    describe("when selected item is clicked", () => {
      it("should deselect that item", () => {
        const { getAllByRole } = result;

        const items = getAllByRole("option");

        fireEvent.click(items[1]);

        expect(items[1]).not.toHaveClass("uitkListItem-selected");

        expect(onChangeSpy).toHaveBeenLastCalledWith(expect.anything(), null);
        expect(onSelectSpy).toHaveBeenCalledWith(
          expect.anything(),
          isDeclarative ? "list item 2" : ITEMS[1]
        );
      });
    });
  });
});

["list", "declarative list"].forEach((listType) => {
  describe(`A multi-selection ${listType}`, () => {
    const onChangeSpy = jest.fn();
    const onSelectSpy = jest.fn();
    const isDeclarative = listType === "declarative list";

    let result: RenderResult;

    beforeEach(() => {
      jest.clearAllMocks();
      result = isDeclarative
        ? render(
            <List
              onChange={onChangeSpy}
              onSelect={onSelectSpy}
              selectionVariant="multiple"
            >
              <ListItem>list item 1</ListItem>
              <ListItem>list item 2</ListItem>
              <ListItem>list item 3</ListItem>
              <ListItem>list item 4</ListItem>
            </List>
          )
        : render(
            <List
              onChange={onChangeSpy}
              onSelect={onSelectSpy}
              selectionVariant="multiple"
              source={ITEMS}
            />
          );
    });

    describe("when multiple items are clicked", () => {
      it("should select those items", () => {
        const { getAllByRole } = result;

        const items = getAllByRole("option");

        fireEvent.click(items[0]);

        expect(onSelectSpy).toHaveBeenCalledWith(
          expect.anything(),
          isDeclarative ? "list item 1" : ITEMS[0]
        );

        fireEvent.click(items[2]);

        expect(items[0]).toHaveClass("uitkListItem-selected");
        expect(items[2]).toHaveClass("uitkListItem-selected");

        expect(onChangeSpy).toHaveBeenLastCalledWith(
          expect.anything(),
          isDeclarative ? ["list item 1", "list item 3"] : [ITEMS[0], ITEMS[2]]
        );

        expect(onSelectSpy).toHaveBeenCalledWith(
          expect.anything(),
          isDeclarative ? "list item 3" : ITEMS[2]
        );
      });
    });

    describe("when selected items are clicked one more time", () => {
      it("should deselect those items", () => {
        const { getAllByRole } = result;

        const items = getAllByRole("option");

        // to select
        fireEvent.click(items[0]);

        expect(onSelectSpy).toHaveBeenCalledWith(
          expect.anything(),
          isDeclarative ? "list item 1" : ITEMS[0]
        );

        fireEvent.click(items[2]);
        fireEvent.click(items[3]);

        // to deselect
        fireEvent.click(items[0]);

        expect(onSelectSpy).toHaveBeenCalledWith(
          expect.anything(),
          isDeclarative ? "list item 1" : ITEMS[0]
        );

        fireEvent.click(items[3]);

        expect(items[0]).not.toHaveClass("uitkListItem-selected");
        expect(items[2]).toHaveClass("uitkListItem-selected");
        expect(items[3]).not.toHaveClass("uitkListItem-selected");

        expect(onChangeSpy).toHaveBeenLastCalledWith(
          expect.anything(),
          isDeclarative ? ["list item 3"] : [ITEMS[2]]
        );
      });
    });
  });
});

["list", "declarative list"].forEach((listType) => {
  describe(`A ${listType} with multiple selected items`, () => {
    it("should be a multi-selection list", () => {
      const selectionSpy = jest.fn();

      const { getAllByRole } =
        listType === "declarative list"
          ? render(
              <List<string, "multiple">
                initialSelectedItem={["list item 2", "list item 4"]}
                onChange={selectionSpy}
              >
                <ListItem>list item 1</ListItem>
                <ListItem>list item 2</ListItem>
                <ListItem>list item 3</ListItem>
                <ListItem>list item 4</ListItem>
              </List>
            )
          : render(
              <List<ItemWithLabel, "multiple">
                initialSelectedItem={[ITEMS[1], ITEMS[3]]}
                onChange={selectionSpy}
                source={ITEMS}
              />
            );

      const items = getAllByRole("option");

      fireEvent.click(items[0]);
      fireEvent.click(items[2]);
      fireEvent.click(items[3]);

      expect(items[0]).toHaveClass("uitkListItem-selected");
      expect(items[1]).toHaveClass("uitkListItem-selected");
      expect(items[2]).toHaveClass("uitkListItem-selected");
      expect(items[3]).not.toHaveClass("uitkListItem-selected");
    });
  });
});

["list", "declarative list"].forEach((listType) => {
  describe(`A extended-selection ${listType}`, () => {
    const onChangeSpy = jest.fn();
    const onSelectSpy = jest.fn();
    const isDeclarative = listType === "declarative list";

    let result: RenderResult;

    beforeEach(() => {
      jest.clearAllMocks();
      result = isDeclarative
        ? render(
            <List
              onChange={onChangeSpy}
              onSelect={onSelectSpy}
              selectionVariant="extended"
            >
              <ListItem>list item 1</ListItem>
              <ListItem>list item 2</ListItem>
              <ListItem>list item 3</ListItem>
              <ListItem>list item 4</ListItem>
            </List>
          )
        : render(
            <List
              onChange={onChangeSpy}
              onSelect={onSelectSpy}
              selectionVariant="extended"
              source={ITEMS}
            />
          );
    });

    describe("when multiple items are clicked", () => {
      it("should change selection if simple click", () => {
        const { getAllByRole } = result;

        const items = getAllByRole("option");

        fireEvent.click(items[0]);

        expect(onSelectSpy).toHaveBeenCalledWith(
          expect.anything(),
          isDeclarative ? "list item 1" : ITEMS[0]
        );

        fireEvent.click(items[2]);

        expect(items[0]).not.toHaveClass("uitkListItem-selected");
        expect(items[2]).toHaveClass("uitkListItem-selected");

        expect(onChangeSpy).toHaveBeenLastCalledWith(
          expect.anything(),
          isDeclarative ? ["list item 3"] : [ITEMS[2]]
        );

        expect(onSelectSpy).toHaveBeenCalledWith(
          expect.anything(),
          isDeclarative ? "list item 3" : ITEMS[2]
        );
      });
      it("should select those items if control click is used", () => {
        const { getAllByRole } = result;

        const items = getAllByRole("option");

        fireEvent.click(items[0]);

        expect(onSelectSpy).toHaveBeenCalledWith(
          expect.anything(),
          isDeclarative ? "list item 1" : ITEMS[0]
        );

        fireEvent.click(items[2], { ctrlKey: true });

        expect(items[0]).toHaveClass("uitkListItem-selected");
        expect(items[2]).toHaveClass("uitkListItem-selected");

        expect(onChangeSpy).toHaveBeenLastCalledWith(
          expect.anything(),
          isDeclarative ? ["list item 1", "list item 3"] : [ITEMS[0], ITEMS[2]]
        );

        expect(onSelectSpy).toHaveBeenCalledWith(
          expect.anything(),
          isDeclarative ? "list item 3" : ITEMS[2]
        );
      });
      it("should select a range between those items if shift click is used", () => {
        const { getAllByRole } = result;

        const items = getAllByRole("option");

        fireEvent.click(items[0]);

        expect(onSelectSpy).toHaveBeenCalledWith(
          expect.anything(),
          isDeclarative ? "list item 1" : ITEMS[0]
        );

        fireEvent.click(items[3], { shiftKey: true });

        expect(items[0]).toHaveClass("uitkListItem-selected");
        expect(items[1]).toHaveClass("uitkListItem-selected");
        expect(items[2]).toHaveClass("uitkListItem-selected");
        expect(items[3]).toHaveClass("uitkListItem-selected");

        expect(onChangeSpy).toHaveBeenLastCalledWith(
          expect.anything(),
          isDeclarative
            ? ["list item 1", "list item 2", "list item 3", "list item 4"]
            : [ITEMS[0], ITEMS[1], ITEMS[2], ITEMS[3]]
        );

        expect(onSelectSpy).toHaveBeenCalledWith(
          expect.anything(),
          isDeclarative ? "list item 4" : ITEMS[3]
        );
      });
      it("should not select duplicates if a range overlaps", () => {
        const { getAllByRole } = result;

        const items = getAllByRole("option");

        fireEvent.click(items[1]);

        expect(onSelectSpy).toHaveBeenCalledWith(
          expect.anything(),
          isDeclarative ? "list item 2" : ITEMS[1]
        );

        fireEvent.click(items[0], { shiftKey: true });

        expect(items[0]).toHaveClass("uitkListItem-selected");
        expect(items[1]).toHaveClass("uitkListItem-selected");

        expect(onChangeSpy).toHaveBeenLastCalledWith(
          expect.anything(),
          isDeclarative ? ["list item 1", "list item 2"] : [ITEMS[0], ITEMS[1]]
        );

        expect(onSelectSpy).toHaveBeenCalledWith(
          expect.anything(),
          isDeclarative ? "list item 2" : ITEMS[1]
        );
        // selecting second range that overlaps with the first
        fireEvent.click(items[3], { shiftKey: true, ctrlKey: true });

        expect(onChangeSpy).toHaveBeenLastCalledWith(
          expect.anything(),
          isDeclarative
            ? ["list item 1", "list item 2", "list item 3", "list item 4"]
            : [ITEMS[0], ITEMS[1], ITEMS[2], ITEMS[3]]
        );
      });
      it("should deselect first range if new range selected", () => {
        const { getAllByRole } = result;

        const items = getAllByRole("option");

        fireEvent.click(items[0]);

        expect(onSelectSpy).toHaveBeenCalledWith(
          expect.anything(),
          isDeclarative ? "list item 1" : ITEMS[0]
        );

        fireEvent.click(items[1], { shiftKey: true });

        expect(items[0]).toHaveClass("uitkListItem-selected");
        expect(items[1]).toHaveClass("uitkListItem-selected");

        expect(onChangeSpy).toHaveBeenLastCalledWith(
          expect.anything(),
          isDeclarative ? ["list item 1", "list item 2"] : [ITEMS[0], ITEMS[1]]
        );

        expect(onSelectSpy).toHaveBeenCalledWith(
          expect.anything(),
          isDeclarative ? "list item 2" : ITEMS[1]
        );
        // selecting second range
        fireEvent.click(items[2], { ctrlKey: true });
        fireEvent.click(items[3], { shiftKey: true });

        expect(items[0]).not.toHaveClass("uitkListItem-selected");
        expect(items[1]).not.toHaveClass("uitkListItem-selected");
        expect(items[2]).toHaveClass("uitkListItem-selected");
        expect(items[3]).toHaveClass("uitkListItem-selected");

        expect(onChangeSpy).toHaveBeenLastCalledWith(
          expect.anything(),
          isDeclarative ? ["list item 3", "list item 4"] : [ITEMS[2], ITEMS[3]]
        );
      });
      it("should concatenate first range if new range selected with ctrl shift", () => {
        const { getAllByRole } = result;

        const items = getAllByRole("option");

        fireEvent.click(items[0]);

        expect(onSelectSpy).toHaveBeenCalledWith(
          expect.anything(),
          isDeclarative ? "list item 1" : ITEMS[0]
        );

        fireEvent.click(items[1], { shiftKey: true });

        expect(items[0]).toHaveClass("uitkListItem-selected");
        expect(items[1]).toHaveClass("uitkListItem-selected");

        expect(onChangeSpy).toHaveBeenLastCalledWith(
          expect.anything(),
          isDeclarative ? ["list item 1", "list item 2"] : [ITEMS[0], ITEMS[1]]
        );

        expect(onSelectSpy).toHaveBeenCalledWith(
          expect.anything(),
          isDeclarative ? "list item 2" : ITEMS[1]
        );
        // selecting second range
        fireEvent.click(items[2], { ctrlKey: true });
        fireEvent.click(items[3], { shiftKey: true, ctrlKey: true });

        expect(items[0]).toHaveClass("uitkListItem-selected");
        expect(items[1]).toHaveClass("uitkListItem-selected");
        expect(items[2]).toHaveClass("uitkListItem-selected");
        expect(items[3]).toHaveClass("uitkListItem-selected");

        expect(onChangeSpy).toHaveBeenLastCalledWith(
          expect.anything(),
          isDeclarative
            ? ["list item 1", "list item 2", "list item 3", "list item 4"]
            : [ITEMS[0], ITEMS[1], ITEMS[2], ITEMS[3]]
        );
      });
    });

    describe("when selected items are clicked one more time", () => {
      it("should deselect all items except for the clicked item", () => {
        const { getAllByRole } = result;

        const items = getAllByRole("option");

        // to select
        fireEvent.click(items[0]);

        expect(onSelectSpy).toHaveBeenCalledWith(
          expect.anything(),
          isDeclarative ? "list item 1" : ITEMS[0]
        );
        // to select additional items
        fireEvent.click(items[2], { ctrlKey: true });
        fireEvent.click(items[3], { ctrlKey: true });

        // to deselect
        fireEvent.click(items[0]);

        expect(onSelectSpy).toHaveBeenCalledWith(
          expect.anything(),
          isDeclarative ? "list item 1" : ITEMS[0]
        );

        expect(items[0]).toHaveClass("uitkListItem-selected");
        expect(items[2]).not.toHaveClass("uitkListItem-selected");
        expect(items[3]).not.toHaveClass("uitkListItem-selected");
      });
      it("should deselect only that item if control click is used", () => {
        const { getAllByRole } = result;

        const items = getAllByRole("option");

        // to select
        fireEvent.click(items[0]);

        expect(onSelectSpy).toHaveBeenCalledWith(
          expect.anything(),
          isDeclarative ? "list item 1" : ITEMS[0]
        );

        fireEvent.click(items[2], { ctrlKey: true });
        fireEvent.click(items[3], { ctrlKey: true });

        // to deselect
        fireEvent.click(items[0], { ctrlKey: true });

        expect(onSelectSpy).toHaveBeenCalledWith(
          expect.anything(),
          isDeclarative ? "list item 1" : ITEMS[0]
        );

        expect(items[0]).not.toHaveClass("uitkListItem-selected");
        expect(items[2]).toHaveClass("uitkListItem-selected");
        expect(items[3]).toHaveClass("uitkListItem-selected");
      });
    });
  });
});
