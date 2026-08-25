import { List } from "@salt-ds/lab";
import { describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
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
