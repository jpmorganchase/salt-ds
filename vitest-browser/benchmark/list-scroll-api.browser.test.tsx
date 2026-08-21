import { List, type ListProps, type ListScrollHandles } from "@salt-ds/lab";
import { useRef } from "react";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { renderWithSalt } from "../render";

type ItemType = { label: string; value: string };
const items: ItemType[] = Array.from({ length: 5 }, (_, index) => ({
  label: `list item ${index + 1}`,
  value: `item ${index + 1}`,
}));

function TestComponent(props: ListProps<ItemType>) {
  const listScrollRef = useRef<ListScrollHandles<ItemType>>(null);
  return (
    <div>
      <button
        type="button"
        onClick={() => listScrollRef.current?.scrollToIndex(0)}
      >
        Scroll to first
      </button>
      <button
        type="button"
        onClick={() => listScrollRef.current?.scrollToIndex(items.length - 1)}
      >
        Scroll to last
      </button>
      <List {...props} scrollingApiRef={listScrollRef} />
    </div>
  );
}

function isVisibleWithinList(itemText: string) {
  const item = page.getByText(itemText).element();
  const list = item.closest(".saltList");
  if (!list) throw new Error("Missing list container");
  const itemRect = item.getBoundingClientRect();
  const listRect = list.getBoundingClientRect();
  return itemRect.top >= listRect.top && itemRect.bottom <= listRect.bottom;
}

describe("A list", () => {
  it("scrolls to an item through scrollingApiRef", async () => {
    await renderWithSalt(
      <TestComponent source={items} displayedItemCount={2} />,
    );
    expect(isVisibleWithinList("list item 1")).toBe(true);
    expect(isVisibleWithinList("list item 4")).toBe(false);

    await page.getByRole("button", { name: "Scroll to last" }).click();
    await expect.poll(() => isVisibleWithinList("list item 5")).toBe(true);
    expect(isVisibleWithinList("list item 1")).toBe(false);

    await page.getByRole("button", { name: "Scroll to first" }).click();
    await expect.poll(() => isVisibleWithinList("list item 1")).toBe(true);
    expect(isVisibleWithinList("list item 5")).toBe(false);
  });
});

describe("A VirtualizedList", () => {
  it.skip("scrolls to an item through scrollingApiRef", () => {
    // Test a scenario where item is beyond the render buffer.
  });
});
