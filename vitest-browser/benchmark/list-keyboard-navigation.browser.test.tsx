import { List, ListItem } from "@salt-ds/lab";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { renderWithSalt } from "../render";

type ItemWithLabel = { label: string };
type ListKind = "source" | "declarative";

const ITEMS: ItemWithLabel[] = [
  { label: "list item 1" },
  { label: "list item 2" },
  { label: "list item 3" },
  { label: "list item 4" },
];
const LIST_KINDS = ["source", "declarative"] as const;
const ITEMS_PER_PAGE = 2;
const FANCY_ITEMS = ["Bar", "Foo", "Foo Bar", "Baz"];

function selectionFor(kind: ListKind, index: number) {
  return kind === "declarative" ? ITEMS[index].label : ITEMS[index];
}

function renderList(kind: ListKind, props: Record<string, unknown> = {}) {
  return renderWithSalt(
    kind === "declarative" ? (
      <List id="list" {...props}>
        {ITEMS.map(({ label }) => (
          <ListItem key={label}>{label}</ListItem>
        ))}
      </List>
    ) : (
      <List<ItemWithLabel> id="list" source={ITEMS} {...props} />
    ),
  );
}

function renderFancyList(kind: ListKind, props: Record<string, unknown> = {}) {
  return renderWithSalt(
    kind === "declarative" ? (
      <List id="list" displayedItemCount={ITEMS_PER_PAGE} {...props}>
        {FANCY_ITEMS.map((label) => (
          <ListItem key={label}>{label}</ListItem>
        ))}
      </List>
    ) : (
      <List id="list" source={FANCY_ITEMS} {...props} />
    ),
  );
}

function listbox() {
  return page.getByRole("listbox");
}

function item(index: number) {
  const element = document.getElementById(`list-item-${index}`);
  if (!element) throw new Error(`Missing list item ${index}`);
  return page.elementLocator(element);
}

async function focusList() {
  listbox().element().focus();
  await expect.element(listbox()).toHaveFocus();
}

async function expectActive(index: number) {
  await expect.element(item(index)).toHaveClass("saltHighlighted");
  await expect.element(item(index)).toHaveClass("saltFocusVisible");
}

async function expectInactive(index: number) {
  await expect.element(item(index)).not.toHaveClass("saltHighlighted");
  await expect.element(item(index)).not.toHaveClass("saltFocusVisible");
}

describe.each(LIST_KINDS)("%s List keyboard focus", (kind) => {
  it("focuses and highlights the first item", async () => {
    await renderList(kind);
    await focusList();
    await expectActive(0);
  });

  it("focuses an empty List itself", async () => {
    await renderWithSalt(
      kind === "declarative" ? <List /> : <List source={[]} />,
    );
    await focusList();
    await expect.element(listbox()).toHaveClass("saltFocusVisible");
  });

  it("returns to the first item after keyboard focus leaves", async () => {
    await renderList(kind);
    await focusList();
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    listbox().element().blur();
    await expectInactive(2);
    await focusList();
    await expectActive(0);
  });

  it("focuses the item highlighted by the pointer", async () => {
    await renderList(kind);
    await item(1).hover();
    await expect.element(item(1)).toHaveClass("saltHighlighted");
    await focusList();
    await expectActive(1);
  });

  it.each(["{Enter}", " "])(
    "selects the highlighted item with %s",
    async (key) => {
      const onSelect = vi.fn();
      const onSelectionChange = vi.fn();
      await renderList(kind, { onSelect, onSelectionChange });
      await focusList();
      await userEvent.keyboard(key);
      await expect.element(item(0)).toHaveAttribute("aria-selected", "true");
      expect(onSelectionChange).toHaveBeenCalledWith(
        expect.anything(),
        selectionFor(kind, 0),
      );
      expect(onSelect).toHaveBeenCalledWith(
        expect.anything(),
        selectionFor(kind, 0),
      );
    },
  );

  it("removes highlight and focus styling on Tab", async () => {
    await renderList(kind);
    await focusList();
    await userEvent.tab();
    await expect.element(listbox()).not.toHaveFocus();
    await expect
      .poll(() => document.querySelector("#list .saltHighlighted"))
      .toBeNull();
    await expect
      .poll(() => document.querySelector("#list .saltFocusVisible"))
      .toBeNull();
  });

  it("focuses the selected item", async () => {
    await renderList(kind, { defaultSelected: selectionFor(kind, 2) });
    await focusList();
    await expectActive(2);
  });

  it("returns to the selected item after pointer highlight leaves", async () => {
    await renderWithSalt(
      <>
        <div data-testid="outside" style={{ width: 100, height: 10 }} />
        {kind === "declarative" ? (
          <List id="list" defaultSelected="list item 3">
            {ITEMS.map(({ label }) => (
              <ListItem key={label}>{label}</ListItem>
            ))}
          </List>
        ) : (
          <List<ItemWithLabel>
            id="list"
            defaultSelected={ITEMS[2]}
            source={ITEMS}
          />
        )}
      </>,
    );
    await focusList();
    await item(2).hover();
    await item(1).hover();
    await page.getByTestId("outside").hover();
    expect(document.querySelector("#list .saltHighlighted")).toBeNull();
    expect(document.querySelector("#list .saltFocusVisible")).toBeNull();
    listbox().element().blur();
    await focusList();
    await expectActive(2);
  });
});

describe.each(LIST_KINDS)("%s List restoreLastFocus", (kind) => {
  it("initially focuses the first item", async () => {
    await renderList(kind, { restoreLastFocus: true });
    await focusList();
    await expectActive(0);
  });

  it("restores the last keyboard-focused item", async () => {
    await renderList(kind, { restoreLastFocus: true });
    await focusList();
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    listbox().element().blur();
    await expectInactive(2);
    await focusList();
    await expectActive(2);
  });

  it("uses pointer highlight as the next focus target", async () => {
    await renderList(kind, { restoreLastFocus: true });
    await item(1).hover();
    await expect.element(item(1)).toHaveClass("saltHighlighted");
    await focusList();
    await expectActive(1);
  });

  it("uses the selected item when no focus was remembered", async () => {
    await renderList(kind, {
      defaultSelected: selectionFor(kind, 2),
      restoreLastFocus: true,
    });
    await focusList();
    await expectActive(2);
  });

  it("prefers remembered focus over the selected item", async () => {
    await renderList(kind, {
      defaultSelected: selectionFor(kind, 2),
      restoreLastFocus: true,
    });
    await focusList();
    await userEvent.keyboard("{ArrowUp}");
    await focusList();
    await expectActive(1);
  });
});

describe.each(LIST_KINDS)("%s List keyboard movement", (kind) => {
  it.each([
    ["End", "{End}", 3],
    ["End at the boundary", "{End}{End}", 3],
    ["Home", "{End}{Home}", 0],
    ["Home at the boundary", "{End}{Home}{Home}", 0],
    ["ArrowDown", "{ArrowDown}{ArrowDown}", 2],
    ["ArrowDown at the boundary", "{End}{ArrowDown}", 3],
    ["ArrowUp", "{ArrowDown}{ArrowDown}{ArrowUp}{ArrowUp}", 0],
    ["ArrowUp at the boundary", "{ArrowUp}", 0],
    ["PageDown", "{PageDown}", 2],
    ["PageDown at the boundary", "{End}{PageDown}", 3],
    ["PageUp", "{End}{PageUp}", 1],
    ["PageUp at the boundary", "{PageUp}", 0],
  ])("handles %s", async (_name, keys, expectedIndex) => {
    await renderList(kind, { displayedItemCount: ITEMS_PER_PAGE });
    await focusList();
    await userEvent.keyboard(keys);
    await expectActive(expectedIndex);
  });
});

describe.each(LIST_KINDS)("%s List type-to-select", (kind) => {
  it("focuses matches typed in rapid succession", async () => {
    await renderFancyList(kind);
    await focusList();
    await expectActive(0);
    await userEvent.keyboard("B");
    await expectActive(3);
    await userEvent.keyboard("A");
    await expectActive(3);
    await userEvent.keyboard("R");
    await expectActive(0);
  });

  it("uses Space as selection after search times out", async () => {
    const onSelectionChange = vi.fn();
    await renderFancyList(kind, { onSelectionChange });
    await focusList();
    await userEvent.keyboard("FOO ");
    await expectActive(2);
    await expect.element(item(2)).not.toHaveAttribute("aria-selected", "true");
    expect(onSelectionChange).not.toHaveBeenCalled();
    await new Promise((resolve) => setTimeout(resolve, 1_500));
    await userEvent.keyboard(" ");
    await expect.element(item(2)).toHaveAttribute("aria-selected", "true");
    expect(onSelectionChange).toHaveBeenCalledWith(
      expect.anything(),
      "Foo Bar",
    );
  });

  it("resets search text after a timeout", async () => {
    await renderFancyList(kind);
    await focusList();
    await userEvent.keyboard("F");
    await expectActive(1);
    await new Promise((resolve) => setTimeout(resolve, 1_500));
    await userEvent.keyboard("B");
    await expectActive(3);
  });

  it("wraps search to the beginning", async () => {
    await renderFancyList(kind);
    await focusList();
    await userEvent.keyboard("BAZ");
    await expectActive(3);
    await new Promise((resolve) => setTimeout(resolve, 1_500));
    await userEvent.keyboard("F");
    await expectActive(1);
  });

  it("cycles matches when their first character is repeated", async () => {
    await renderFancyList(kind);
    await focusList();
    await userEvent.keyboard("F");
    await expectActive(1);
    await userEvent.keyboard("F");
    await expectActive(2);
    await userEvent.keyboard("F");
    await expectActive(1);
  });

  it("does not cycle for repeated characters after the first", async () => {
    await renderFancyList(kind);
    await focusList();
    await userEvent.keyboard("FOO");
    await expectActive(1);
  });

  it("continues type-to-select after a click", async () => {
    await renderFancyList(kind);
    await item(0).click();
    await userEvent.keyboard("FOO");
    await expectActive(1);
  });

  it("can disable type-to-select", async () => {
    await renderFancyList(kind, { disableTypeToSelect: true });
    await focusList();
    await userEvent.keyboard("F");
    await expectInactive(1);
  });
});

describe.each(LIST_KINDS)("%s List tabToSelect", (kind) => {
  it("selects the highlighted item on Tab", async () => {
    await renderList(kind, { tabToSelect: true });
    await focusList();
    await userEvent.tab();
    await expect.element(item(0)).toHaveAttribute("aria-selected", "true");
  });
});
