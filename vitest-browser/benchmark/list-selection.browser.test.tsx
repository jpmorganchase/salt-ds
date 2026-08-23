import { List, ListItem, type SelectionStrategy } from "@salt-ds/lab";
import { version } from "react";
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
const react18 = version.startsWith("18");

function valueFor(kind: ListKind, index: number) {
  return kind === "declarative" ? ITEMS[index].label : ITEMS[index];
}

function valuesFor(kind: ListKind, indexes: number[]) {
  return indexes.map((index) => valueFor(kind, index));
}

function renderSelectionList(
  kind: ListKind,
  selectionStrategy: SelectionStrategy,
  props: Record<string, unknown> = {},
) {
  const strategyProps =
    selectionStrategy === "default" ? {} : { selectionStrategy };
  return renderWithSalt(
    kind === "declarative" ? (
      <List {...strategyProps} {...props}>
        {ITEMS.map(({ label }) => (
          <ListItem key={label}>{label}</ListItem>
        ))}
      </List>
    ) : (
      <List<ItemWithLabel, SelectionStrategy>
        {...strategyProps}
        {...props}
        source={ITEMS}
      />
    ),
  );
}

function item(index: number) {
  return page.getByRole("option").nth(index);
}

async function expectSelected(index: number, selected = true) {
  const assertion = expect.element(item(index));
  if (selected) {
    await assertion.toHaveAttribute("aria-selected", "true");
  } else {
    await assertion.not.toHaveAttribute("aria-selected", "true");
  }
}

async function expectOnlySelected(indexes: number[]) {
  for (let index = 0; index < ITEMS.length; index += 1) {
    await expectSelected(index, indexes.includes(index));
  }
}

async function clickItem(
  index: number,
  { controlOrMeta = false, shift = false } = {},
) {
  await item(index).hover();
  if (controlOrMeta) await userEvent.keyboard("{ControlOrMeta>}");
  if (shift) await userEvent.keyboard("{Shift>}");
  try {
    await item(index).click();
  } finally {
    if (shift) await userEvent.keyboard("{/Shift}");
    if (controlOrMeta) await userEvent.keyboard("{/ControlOrMeta}");
  }
}

describe.each(LIST_KINDS)("%s List single selection", (kind) => {
  it("keeps selection when the selected item is clicked", async () => {
    const onSelect = vi.fn();
    const onSelectionChange = vi.fn();
    await renderSelectionList(kind, "default", {
      defaultSelected: valueFor(kind, 1),
      onSelect,
      onSelectionChange,
    });
    await expectSelected(1);
    await clickItem(1);
    await expectSelected(1);
    expect(onSelectionChange).not.toHaveBeenCalled();
    expect(onSelect).toHaveBeenCalledWith(expect.anything(), valueFor(kind, 1));
  });

  it("moves selection when another item is clicked", async () => {
    const onSelect = vi.fn();
    const onSelectionChange = vi.fn();
    await renderSelectionList(kind, "default", {
      defaultSelected: valueFor(kind, 1),
      onSelect,
      onSelectionChange,
    });
    await clickItem(2);
    await expectOnlySelected([2]);
    expect(onSelectionChange).toHaveBeenCalledWith(
      expect.anything(),
      valueFor(kind, 2),
    );
    expect(onSelect).toHaveBeenCalledWith(expect.anything(), valueFor(kind, 2));
  });
});

describe.each(LIST_KINDS)("disabled %s List", (kind) => {
  it.each([1, 2])("ignores clicks on item %s", async (index) => {
    const onSelect = vi.fn();
    const onSelectionChange = vi.fn();
    await renderSelectionList(kind, "default", {
      defaultSelected: valueFor(kind, 1),
      disabled: true,
      onSelect,
      onSelectionChange,
    });
    await item(index).hover();
    const disabledItem = item(index).element();
    if (!(disabledItem instanceof HTMLElement)) {
      throw new Error(`List item ${index} is not an HTMLElement`);
    }
    disabledItem.click();
    await expectOnlySelected([1]);
    expect(onSelectionChange).not.toHaveBeenCalled();
    expect(onSelect).not.toHaveBeenCalled();
  });
});

describe.each(LIST_KINDS)("deselectable %s List", (kind) => {
  it("deselects the selected item when clicked", async () => {
    const onSelect = vi.fn();
    const onSelectionChange = vi.fn();
    await renderSelectionList(kind, "deselectable", {
      defaultSelected: valueFor(kind, 1),
      onSelect,
      onSelectionChange,
    });
    await clickItem(1);
    await expectOnlySelected([]);
    expect(onSelectionChange).toHaveBeenCalledWith(expect.anything(), null);
    expect(onSelect).toHaveBeenCalledWith(expect.anything(), valueFor(kind, 1));
  });
});

describe.each(LIST_KINDS)("multiple-selection %s List", (kind) => {
  it("selects multiple clicked items", async () => {
    const onSelect = vi.fn();
    const onSelectionChange = vi.fn();
    await renderSelectionList(kind, "multiple", {
      onSelect,
      onSelectionChange,
    });
    await clickItem(0);
    await clickItem(2);
    await expectOnlySelected([0, 2]);
    expect(onSelectionChange).toHaveBeenLastCalledWith(
      expect.anything(),
      valuesFor(kind, [0, 2]),
    );
    expect(onSelect).toHaveBeenLastCalledWith(
      expect.anything(),
      valueFor(kind, 2),
    );
  });

  it("toggles selected items independently", async () => {
    const onSelect = vi.fn();
    await renderSelectionList(kind, "multiple", { onSelect });
    for (const index of [0, 2, 3, 0, 3]) await clickItem(index);
    await expectOnlySelected([2]);
    expect(onSelect).toHaveBeenLastCalledWith(
      expect.anything(),
      valueFor(kind, 3),
    );
  });
});

describe("source List with initial multiple selection", () => {
  it("adds and removes items from the initial selection", async () => {
    await renderSelectionList("source", "multiple", {
      defaultSelected: [ITEMS[1], ITEMS[3]],
    });
    await clickItem(0);
    await clickItem(2);
    await clickItem(3);
    await expectOnlySelected([0, 1, 2]);
  });
});

describe.each(LIST_KINDS)("extended-selection %s List", (kind) => {
  it("replaces selection on a simple click", async () => {
    const onSelect = vi.fn();
    const onSelectionChange = vi.fn();
    await renderSelectionList(kind, "extended", {
      onSelect,
      onSelectionChange,
    });
    await clickItem(0);
    await clickItem(2);
    await expectOnlySelected([2]);
    expect(onSelectionChange).toHaveBeenLastCalledWith(
      expect.anything(),
      valuesFor(kind, [2]),
    );
    expect(onSelect).toHaveBeenLastCalledWith(
      expect.anything(),
      valueFor(kind, 2),
    );
  });

  it.skipIf(react18)("adds selection with Control/Meta+click", async () => {
    const onSelectionChange = vi.fn();
    await renderSelectionList(kind, "extended", { onSelectionChange });
    await clickItem(0);
    await clickItem(2, { controlOrMeta: true });
    await expectOnlySelected([0, 2]);
    expect(onSelectionChange).toHaveBeenLastCalledWith(
      expect.anything(),
      valuesFor(kind, [0, 2]),
    );
  });

  it.skipIf(react18)("selects a range with Shift+click", async () => {
    const onSelectionChange = vi.fn();
    await renderSelectionList(kind, "extended", { onSelectionChange });
    await clickItem(0);
    await clickItem(3, { shift: true });
    await expectOnlySelected([0, 1, 2, 3]);
    expect(onSelectionChange).toHaveBeenLastCalledWith(
      expect.anything(),
      valuesFor(kind, [0, 1, 2, 3]),
    );
  });

  it("does not duplicate items when ranges overlap", async () => {
    const onSelectionChange = vi.fn();
    await renderSelectionList(kind, "extended", { onSelectionChange });
    await clickItem(1);
    await clickItem(0, { shift: true });
    await expectOnlySelected([0, 1]);
    await clickItem(3, { controlOrMeta: true, shift: true });
    await expectOnlySelected([0, 1, 2, 3]);
    expect(onSelectionChange).toHaveBeenLastCalledWith(
      expect.anything(),
      valuesFor(kind, [0, 1, 2, 3]),
    );
  });

  it("replaces the first range when a new range is selected", async () => {
    const onSelectionChange = vi.fn();
    await renderSelectionList(kind, "extended", { onSelectionChange });
    await clickItem(0);
    await clickItem(1, { shift: true });
    await expectOnlySelected([0, 1]);
    await clickItem(2);
    await clickItem(3, { shift: true });
    await expectOnlySelected([2, 3]);
    expect(onSelectionChange).toHaveBeenLastCalledWith(
      expect.anything(),
      valuesFor(kind, [2, 3]),
    );
  });

  it.skipIf(react18)(
    "concatenates ranges with Control/Meta+Shift+click",
    async () => {
      const onSelectionChange = vi.fn();
      await renderSelectionList(kind, "extended", { onSelectionChange });
      await clickItem(0);
      await clickItem(1, { shift: true });
      await clickItem(2, { controlOrMeta: true });
      await clickItem(3, { controlOrMeta: true, shift: true });
      await expectOnlySelected([0, 1, 2, 3]);
      expect(onSelectionChange).toHaveBeenLastCalledWith(
        expect.anything(),
        valuesFor(kind, [0, 1, 2, 3]),
      );
    },
  );

  it("keeps only the clicked item after a simple click", async () => {
    await renderSelectionList(kind, "extended");
    await clickItem(0);
    await clickItem(2, { controlOrMeta: true });
    await clickItem(3, { controlOrMeta: true });
    await clickItem(0);
    await expectOnlySelected([0]);
  });

  it("deselects only the item clicked with Control/Meta", async () => {
    await renderSelectionList(kind, "extended");
    await clickItem(0);
    await clickItem(2, { controlOrMeta: true });
    await clickItem(3, { controlOrMeta: true });
    await clickItem(0, { controlOrMeta: true });
    await expectOnlySelected([2, 3]);
  });
});
