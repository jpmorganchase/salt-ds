import { render, fireEvent, RenderResult } from "@testing-library/react";

import { List, ListItem } from "../../list";

const ITEMS = [{ label: "list item 1" }, { label: "list item 2" }];

["list", "declarative list"].forEach((listType) => {
  describe(`A ${listType}`, () => {
    it("should be keyboard-focused", () => {
      const { getByRole } =
        listType === "declarative list"
          ? render(
              <List>
                <ListItem>list item 1</ListItem>
                <ListItem>list item 2</ListItem>
              </List>
            )
          : render(<List source={ITEMS} />);

      expect(getByRole("listbox")).toHaveAttribute("tabindex", "0");
    });

    describe("when navigated to an item with mouse", () => {
      it("should show the correct aria-activedescendant", () => {
        const mockId = "list";

        const { getByRole, getAllByRole } =
          listType === "declarative list"
            ? render(
                <List id={mockId}>
                  <ListItem>list item 1</ListItem>
                  <ListItem>list item 2</ListItem>
                </List>
              )
            : render(<List id={mockId} source={ITEMS} />);

        const items = getAllByRole("option");

        fireEvent.mouseMove(items[1]);

        expect(getByRole("listbox")).toHaveAttribute(
          "aria-activedescendant",
          `${mockId}-item-1`
        );
      });
    });

    describe("when navigated to an item with keyboard", () => {
      it("should have correct aria-activedescendant", () => {
        const mockId = "list";

        const { getByRole } =
          listType === "declarative list"
            ? render(
                <List id={mockId}>
                  <ListItem>list item 1</ListItem>
                  <ListItem>list item 2</ListItem>
                </List>
              )
            : render(<List id={mockId} source={ITEMS} />);

        const list = getByRole("listbox");

        fireEvent.focus(list);

        expect(list).toHaveAttribute(
          "aria-activedescendant",
          `${mockId}-item-0`
        );
      });
    });

    it("should set aria-checked for selected item", () => {
      const { getAllByRole } =
        listType === "declarative list"
          ? render(
              <List>
                <ListItem>list item 1</ListItem>
                <ListItem>list item 2</ListItem>
              </List>
            )
          : render(<List source={ITEMS} />);

      const items = getAllByRole("option");

      fireEvent.click(items[1]);

      expect(items[0]).not.toHaveAttribute("aria-checked");
      expect(items[1]).toHaveAttribute("aria-checked");
    });

    it("should set aria-disabled for disabled item", () => {
      const { getAllByRole } =
        listType === "declarative list"
          ? render(
              <List>
                <ListItem>list item 1</ListItem>
                <ListItem disabled>list item 2</ListItem>
              </List>
            )
          : render(
              <List
                source={[
                  { label: "list item 1" },
                  { label: "list item 2", disabled: true },
                ]}
              />
            );

      const items = getAllByRole("option");

      expect(items[0]).not.toHaveAttribute("aria-disabled");
      expect(items[1]).toHaveAttribute("aria-disabled");
    });

    describe("when the entire list is disabled", () => {
      let result: RenderResult;

      beforeEach(() => {
        result =
          listType === "declarative list"
            ? render(
                <List disabled>
                  <ListItem>list item 1</ListItem>
                  <ListItem>list item 2</ListItem>
                </List>
              )
            : render(<List disabled source={ITEMS} />);
      });

      it("should not be keyboard focused", () => {
        expect(result.getByRole("listbox")).not.toHaveAttribute("tabindex");
      });

      it("should set aria-disabled for all its items", () => {
        const { getAllByRole } =
          listType === "declarative list"
            ? render(
                <List disabled>
                  <ListItem>list item 1</ListItem>
                  <ListItem>list item 2</ListItem>
                </List>
              )
            : render(<List disabled source={ITEMS} />);

        getAllByRole("option").forEach((item) => {
          expect(item).toHaveAttribute("aria-disabled");
        });
      });
    });

    describe("when multi-selection is enabled", () => {
      it("should set aria-multiselectable on the list", () => {
        const { getByRole } =
          listType === "declarative list"
            ? render(
                <List selectionVariant="multiple">
                  <ListItem>list item 1</ListItem>
                  <ListItem>list item 2</ListItem>
                </List>
              )
            : render(<List selectionVariant="multiple" source={ITEMS} />);

        expect(getByRole("listbox")).toHaveAttribute("aria-multiselectable");
      });

      it("should set aria-selected for selected items", () => {
        const { getAllByRole } =
          listType === "declarative list"
            ? render(
                <List selectionVariant="multiple">
                  <ListItem>list item 1</ListItem>
                  <ListItem>list item 2</ListItem>
                </List>
              )
            : render(<List selectionVariant="multiple" source={ITEMS} />);

        const items = getAllByRole("option");

        fireEvent.click(items[0]);

        expect(items[0]).toHaveAttribute("aria-selected");
        expect(items[1]).not.toHaveAttribute("aria-selected");
      });
    });
  });
});

describe("A virtualized list", () => {
  it("should set correct aria position attribute for each item", () => {
    const { getAllByRole } = render(<List source={ITEMS} virtualized />);

    getAllByRole("option").forEach((item, index) => {
      expect(item).toHaveAttribute("aria-posinset", String(index + 1));
      expect(item).toHaveAttribute("aria-setsize", String(ITEMS.length));
    });
  });
});
