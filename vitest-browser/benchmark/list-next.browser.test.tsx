import { ListItemNext, ListNext, type ListNextProps } from "@salt-ds/lab";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";

import { renderWithSalt } from "../render";

type ItemType = { label: string; value: string };
const items: ItemType[] = [
  { label: "list item 1", value: "item 1" },
  { label: "list item 2", value: "item 2" },
  { label: "list item 3", value: "item 3" },
];

function SingleSelectList(props: ListNextProps) {
  return (
    <ListNext {...props}>
      {props.children ||
        items.map((item) => (
          <ListItemNext value={item.value} key={item.label}>
            {item.label}
          </ListItemNext>
        ))}
    </ListNext>
  );
}

const option = (index: number) =>
  page.getByRole("option", { name: items[index].label });
const listbox = () => page.getByRole("listbox");
async function focusList() {
  if (document.activeElement !== (await listbox().element())) {
    await userEvent.keyboard("{Shift}");
    (await listbox().element()).focus();
  }
  // Cypress's `.focus()` marks focus as keyboard-visible. A modifier key gives
  // the browser implementation the same input-modality signal.
  await userEvent.keyboard("{Shift}");
}

describe("GIVEN a list", () => {
  describe("GIVEN a single select list", () => {
    it("SHOULD render all list items", async () => {
      await renderWithSalt(<SingleSelectList />);
      for (const item of items)
        await expect.element(page.getByText(item.label)).toBeInTheDocument();
    });

    it("SHOULD allow a single item to be selected", async () => {
      const onChange = vi.fn();
      const onSelect = vi.fn();
      await renderWithSalt(
        <SingleSelectList onChange={onChange} onSelect={onSelect} />,
      );
      await option(1).click();
      await expect.element(option(1)).toHaveAttribute("aria-selected", "true");
      expect(onChange).toHaveBeenCalledOnce();
      expect(onSelect).toHaveBeenCalledOnce();
    });

    it("SHOULD keep its selected item when the same item is selected", async () => {
      const onChange = vi.fn();
      const onSelect = vi.fn();
      await renderWithSalt(
        <SingleSelectList onChange={onChange} onSelect={onSelect} />,
      );
      await option(1).click();
      await option(1).click();
      await expect.element(option(1)).toHaveAttribute("aria-selected", "true");
      expect(onChange).toHaveBeenCalledOnce();
      expect(onSelect).toHaveBeenCalledTimes(2);
    });

    it("SHOULD deselect previous list item when a new list one is selected", async () => {
      await renderWithSalt(<SingleSelectList />);
      await option(1).click();
      await option(2).click();
      await expect.element(option(2)).toHaveAttribute("aria-selected", "true");
      await expect
        .element(option(1))
        .not.toHaveAttribute("aria-selected", "true");
    });

    it("THEN all items should be disabled when the entire list is disabled", async () => {
      await renderWithSalt(<SingleSelectList disabled />);
      for (const element of await page.getByRole("option").elements())
        expect(element).toHaveAttribute("aria-disabled", "true");
    });

    it("THEN a disabled list item is not selectable", async () => {
      await renderWithSalt(
        <SingleSelectList>
          {items.map((item, index) => (
            <ListItemNext
              value={item.value}
              disabled={index === 1}
              key={item.value}
            >
              {item.label}
            </ListItemNext>
          ))}
        </SingleSelectList>,
      );
      ((await option(1).element()) as HTMLElement).click();
      await expect.element(option(1)).not.toHaveAttribute("aria-selected");
    });

    describe("WHEN interacted via keyboard", () => {
      it("SHOULD select list item on Space or Enter key", async () => {
        await renderWithSalt(<SingleSelectList />);
        await focusList();
        await userEvent.keyboard("{ArrowDown}{Enter}");
        await expect.element(option(1)).toHaveClass("saltListItemNext-focused");
        await expect.element(option(1)).toHaveAttribute("aria-selected");
        await userEvent.keyboard("{ArrowDown} ");
        await expect.element(option(2)).toHaveClass("saltListItemNext-focused");
        await expect.element(option(2)).toHaveAttribute("aria-selected");
      });

      it("SHOULD focus first list item on first list keyboard focus", async () => {
        await renderWithSalt(<SingleSelectList />);
        await focusList();
        await expect.element(option(0)).toHaveClass("saltListItemNext-focused");
      });

      it("SHOULD re-focus on previously focused item", async () => {
        await renderWithSalt(<SingleSelectList />);
        await focusList();
        await userEvent.keyboard("{ArrowDown}");
        await expect.element(option(1)).toHaveClass("saltListItemNext-focused");
        (await listbox().element()).blur();
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => resolve()),
        );
        await focusList();
        await expect.element(option(1)).toHaveClass("saltListItemNext-focused");
      });

      it("THEN focus does not wrap on arrow down", async () => {
        await renderWithSalt(<SingleSelectList />);
        await focusList();
        await userEvent.keyboard(
          "{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}",
        );
        await expect.element(option(2)).toHaveClass("saltListItemNext-focused");
      });

      it("THEN focus does not wrap on arrow up", async () => {
        await renderWithSalt(<SingleSelectList />);
        await focusList();
        await userEvent.keyboard("{ArrowUp}");
        await expect.element(option(0)).toHaveClass("saltListItemNext-focused");
      });

      it("THEN focus should move to the first list item on Home", async () => {
        await renderWithSalt(<SingleSelectList />);
        await focusList();
        await option(1).click();
        await userEvent.keyboard("{Home}");
        await expect.element(option(0)).toHaveClass("saltListItemNext-focused");
      });

      it("THEN focus should move to the last list item on End", async () => {
        await renderWithSalt(<SingleSelectList />);
        await focusList();
        await userEvent.keyboard("{End}");
        await expect.element(option(2)).toHaveClass("saltListItemNext-focused");
      });

      it("THEN re-focus on the last focused item", async () => {
        await renderWithSalt(<SingleSelectList />);
        await focusList();
        await userEvent.keyboard("{ArrowDown}");
        await option(2).click();
        (await listbox().element()).blur();
        await userEvent.tab();
        await expect.element(option(2)).toHaveClass("saltListItemNext-focused");
      });
    });
  });
});
