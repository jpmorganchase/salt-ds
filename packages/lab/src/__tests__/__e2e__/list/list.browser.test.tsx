import { List, ListItem, VirtualizedList } from "@salt-ds/lab";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";

const items = [
  { label: "list item 1", value: "item 1" },
  { label: "list item 2", value: "item 2" },
  { label: "list item 3", value: "item 3" },
];

describe("GIVEN a source List", () => {
  it("renders every item", async () => {
    await renderWithSalt(<List source={items} />);
    for (const { label } of items)
      await expect.element(page.getByText(label)).toBeInTheDocument();
  });

  it("uses a custom list id for item ids", async () => {
    await renderWithSalt(<List id="my-list" source={items} />);
    const options = page.getByRole("option");
    for (let index = 0; index < 3; index += 1) {
      await expect
        .element(options.nth(index))
        .toHaveAttribute("id", `my-list-item-${index}`);
    }
  });

  it("supports getItemId", async () => {
    await renderWithSalt(
      <List
        getItemId={(index) => `my-item-${index}`}
        id="my-list"
        source={items}
      />,
    );
    const options = page.getByRole("option");
    for (let index = 0; index < 3; index += 1) {
      await expect
        .element(options.nth(index))
        .toHaveAttribute("id", `my-item-${index}`);
    }
  });

  it("uses displayedItemCount for max height", async () => {
    await renderWithSalt(
      <List borderless displayedItemCount={2} itemHeight={10} source={items} />,
    );
    await expect
      .element(page.getByRole("listbox"))
      .toHaveStyle({ maxHeight: "20px" });
  });

  it("includes item gaps in max height", async () => {
    await renderWithSalt(
      <List
        borderless
        displayedItemCount={2}
        itemGapSize={1}
        itemHeight={10}
        source={items}
      />,
    );
    await expect
      .element(page.getByRole("listbox"))
      .toHaveStyle({ maxHeight: "21px" });
  });

  it("fills its parent by default", async () => {
    await renderWithSalt(
      <div style={{ width: 600 }}>
        <List source={items} />
      </div>,
    );
    const listbox = page.getByRole("listbox");
    await expect
      .element(listbox)
      .toHaveAttribute("style", expect.stringMatching(/width: 100%/));
    await expect
      .element(listbox)
      .toHaveAttribute("style", expect.stringMatching(/height: 100%/));
    expect(getComputedStyle(listbox.element()).width).toBe("600px");
  });

  it("supports itemToString", async () => {
    await renderWithSalt(
      <List itemToString={(item) => item.value} source={items} />,
    );
    for (const { value } of items)
      await expect.element(page.getByText(value)).toBeInTheDocument();
  });

  it("supports getItemHeight", async () => {
    const heights = [20, 30, 50];
    await renderWithSalt(
      <List
        getItemHeight={(index) => heights[index ?? 0]}
        itemHeight={50}
        source={items}
      />,
    );
    const options = page.getByRole("option");
    for (const [index, height] of heights.entries()) {
      await expect
        .element(options.nth(index))
        .toHaveStyle({ height: `${height}px` });
    }
  });

  it("forwards mousedown events", async () => {
    const onMouseDown = vi.fn();
    await renderWithSalt(<List onMouseDown={onMouseDown} source={items} />);
    await page.getByText("list item 1").click();
    expect(onMouseDown).toHaveBeenCalled();
  });
});

describe("GIVEN an empty List", () => {
  it("renders emptyMessage", async () => {
    await renderWithSalt(<List emptyMessage="Nothing here" source={[]} />);
    await expect.element(page.getByText("Nothing here")).toBeInTheDocument();
  });

  it("renders a default message with showEmptyMessage", async () => {
    await renderWithSalt(<List showEmptyMessage source={[]} />);
    await expect
      .element(page.getByText("No data to display"))
      .toBeInTheDocument();
  });
});

describe("GIVEN a ListItem", () => {
  it("forwards tabIndex", async () => {
    await renderWithSalt(
      <List>
        <ListItem tabIndex={-1}>list item 1</ListItem>
      </List>,
    );
    await expect
      .element(page.getByRole("option"))
      .toHaveAttribute("tabindex", "-1");
  });
});

describe("GIVEN a VirtualizedList", () => {
  it("highlights item text matching itemTextHighlightPattern", async () => {
    await renderWithSalt(
      <VirtualizedList itemTextHighlightPattern="item 2" source={items} />,
    );
    await expect
      .element(page.getByRole("option").nth(1).getByText("item 2"))
      .toHaveClass("saltHighlighter-highlight");
  });

  it("applies className to the list but not its items", async () => {
    await renderWithSalt(
      <VirtualizedList className="custom-list" source={items} />,
    );
    await expect.element(page.getByRole("listbox")).toHaveClass("custom-list");
    await expect
      .element(page.getByRole("option").first())
      .not.toHaveClass("custom-list");
  });

  it("renders emptyMessage", async () => {
    await renderWithSalt(
      <VirtualizedList emptyMessage="Nothing here" source={[]} />,
    );
    await expect.element(page.getByText("Nothing here")).toBeInTheDocument();
  });
});

describe("GIVEN a List with event handlers", () => {
  it("calls them as well as its own handlers", async () => {
    const handlers = {
      onBlur: vi.fn(),
      onClick: vi.fn(),
      onFocus: vi.fn(),
      onKeyDown: vi.fn(),
      onMouseDownCapture: vi.fn(),
      onMouseLeave: vi.fn(),
      onMouseMove: vi.fn(),
    };
    await renderWithSalt(
      <>
        <List {...handlers} source={items} />
        <button type="button">after</button>
      </>,
    );
    await page.getByText("list item 2").hover();
    expect(handlers.onMouseMove).toHaveBeenCalled();
    await page.getByText("list item 2").click();
    await expect
      .element(page.getByRole("option").nth(1))
      .toHaveAttribute("aria-selected", "true");
    expect(handlers.onMouseDownCapture).toHaveBeenCalled();
    expect(handlers.onFocus).toHaveBeenCalled();
    expect(handlers.onClick).toHaveBeenCalled();
    await userEvent.keyboard("{ArrowDown}");
    await expect
      .element(page.getByRole("option").nth(2))
      .toHaveClass("saltHighlighted");
    expect(handlers.onKeyDown).toHaveBeenCalled();
    await page.getByRole("button", { name: "after" }).hover();
    expect(handlers.onMouseLeave).toHaveBeenCalled();
    await page.getByRole("button", { name: "after" }).click();
    expect(handlers.onBlur).toHaveBeenCalled();
  });
});

describe("GIVEN a VirtualizedList with event handlers", () => {
  it("calls them as well as its own handlers", async () => {
    const onClick = vi.fn();
    const onScroll = vi.fn();
    await renderWithSalt(
      <VirtualizedList onClick={onClick} onScroll={onScroll} source={items} />,
    );
    // A DOM click avoids the pointer scrolling the virtualized list.
    (page.getByText("list item 1").element() as HTMLElement).click();
    await expect
      .element(page.getByRole("option").first())
      .toHaveAttribute("aria-selected", "true");
    expect(onClick).toHaveBeenCalled();
    page.getByRole("listbox").element().dispatchEvent(new Event("scroll"));
    expect(onScroll).toHaveBeenCalled();
  });
});
