import { afterEach, describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { act, renderWithSalt } from "~browser-test-utils/render";
import { DeletionWithFocus } from "../../site/src/examples/dialog/DeletionWithFocus";

afterEach(() => {
  vi.restoreAllMocks();
});

const dialog = () =>
  page.getByRole("dialog", { name: "Delete record?", exact: true });
const deleteButton = (name: string) =>
  page.getByRole("button", { name: `Delete ${name}`, exact: true });
const confirmButton = () =>
  page.getByRole("button", { name: "Confirm delete", exact: true });

async function openDeletion(name: string) {
  const trigger = deleteButton(name).element();
  trigger.focus();
  await userEvent.keyboard("{Enter}");
  await expect.element(dialog()).toBeVisible();
  await expect
    .element(page.getByRole("button", { name: "Cancel", exact: true }))
    .toHaveFocus();
  return { trigger, dialogElement: dialog().element() };
}

describe("Deletion dialog focus", () => {
  it.each([
    ["Mercury", "Nova"],
    ["Nova", "Mercury"],
  ])(
    "deletes %s after closing and focuses the surviving %s action",
    async (removedName, nextName) => {
      await renderWithSalt(<DeletionWithFocus />);
      const next = deleteButton(nextName).element();
      const { trigger, dialogElement } = await openDeletion(removedName);
      const focusWhileDialogMounted: boolean[] = [];
      const nativeFocus = next.focus;
      vi.spyOn(next, "focus").mockImplementation((options) => {
        focusWhileDialogMounted.push(dialogElement.isConnected);
        nativeFocus.call(next, options);
      });

      await act(() => {
        const confirm = confirmButton().element() as HTMLButtonElement;
        confirm.focus();
        confirm.click();
      });

      // Closing preserves the modal and the original record until the exit ends.
      expect(dialogElement).toBeInTheDocument();
      expect(trigger).toBeInTheDocument();
      expect(dialogElement.contains(document.activeElement)).toBe(true);
      expect(next).not.toHaveFocus();

      await expect.element(dialog()).not.toBeInTheDocument();
      await expect.element(deleteButton(removedName)).not.toBeInTheDocument();
      await expect.element(deleteButton(nextName)).toHaveFocus();
      await expect
        .element(page.getByRole("status"))
        .toHaveTextContent(`Deleted ${removedName}.`);
      expect(focusWhileDialogMounted.length).toBeGreaterThan(0);
      expect(focusWhileDialogMounted.every((mounted) => !mounted)).toBe(true);
    },
  );

  it.each(["Cancel", "Escape"])(
    "%s preserves the record and restores its trigger before another attempt",
    async (action) => {
      await renderWithSalt(<DeletionWithFocus />);
      await openDeletion("Mercury");
      if (action === "Escape") {
        await userEvent.keyboard("{Escape}");
      } else {
        await page.getByRole("button", { name: "Cancel", exact: true }).click();
      }

      await expect.element(dialog()).not.toBeInTheDocument();
      await expect.element(deleteButton("Mercury")).toHaveFocus();
      for (const name of ["Atlas", "Mercury", "Nova"]) {
        await expect.element(deleteButton(name)).toBeInTheDocument();
      }
      await expect.element(page.getByRole("status")).toBeEmptyDOMElement();

      await openDeletion("Mercury");
      await confirmButton().click();
      await expect.element(dialog()).not.toBeInTheDocument();
      await expect.element(deleteButton("Mercury")).not.toBeInTheDocument();
      await expect.element(deleteButton("Nova")).toHaveFocus();
    },
  );

  it("handles repeated deletion, the empty list, and a newly added record", async () => {
    await renderWithSalt(<DeletionWithFocus />);
    const add = page.getByRole("button", { name: "Add record", exact: true });

    for (const [removedName, nextName] of [
      ["Mercury", "Nova"],
      ["Nova", "Atlas"],
      ["Atlas", null],
    ] as const) {
      await openDeletion(removedName);
      await confirmButton().click();
      await expect.element(dialog()).not.toBeInTheDocument();
      await expect.element(deleteButton(removedName)).not.toBeInTheDocument();
      await expect
        .element(nextName ? deleteButton(nextName) : add)
        .toHaveFocus();
    }

    await expect.element(page.getByText("No records remain.")).toBeVisible();
    await expect
      .element(page.getByRole("status"))
      .toHaveTextContent("Deleted Atlas.");
    await add.click();
    await expect.element(deleteButton("New record 1")).toBeInTheDocument();
    await openDeletion("New record 1");
    await confirmButton().click();
    await expect.element(dialog()).not.toBeInTheDocument();
    await expect.element(deleteButton("New record 1")).not.toBeInTheDocument();
    await expect.element(add).toHaveFocus();
    await expect.element(page.getByText("No records remain.")).toBeVisible();
  });

  it("lets the user continue tabbing after focus is restored", async () => {
    await renderWithSalt(
      <>
        <DeletionWithFocus />
        <button type="button">Review notes</button>
      </>,
    );
    await openDeletion("Mercury");
    await confirmButton().click();
    await expect.element(dialog()).not.toBeInTheDocument();
    await expect.element(deleteButton("Nova")).toHaveFocus();

    await userEvent.tab();
    await expect
      .element(page.getByRole("button", { name: "Review notes", exact: true }))
      .toHaveFocus();
    await userEvent.tab({ shift: true });
    await expect.element(deleteButton("Nova")).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect
      .element(page.getByRole("button", { name: "Cancel", exact: true }))
      .toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await expect.element(dialog()).not.toBeInTheDocument();
    await expect.element(deleteButton("Nova")).toHaveFocus();
  });

  it("keeps the first close decision when actions repeat during closing", async () => {
    await renderWithSalt(<DeletionWithFocus />);
    await openDeletion("Mercury");
    const confirm = confirmButton().element() as HTMLButtonElement;
    const cancel = page
      .getByRole("button", { name: "Cancel", exact: true })
      .element() as HTMLButtonElement;

    await act(() => {
      confirm.focus();
      confirm.click();
      confirm.click();
      cancel.click();
      confirm.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
    });

    await expect.element(dialog()).not.toBeInTheDocument();
    await expect.element(deleteButton("Mercury")).not.toBeInTheDocument();
    await expect.element(deleteButton("Nova")).toHaveFocus();
    await expect.element(deleteButton("Atlas")).toBeInTheDocument();
    await expect
      .element(page.getByRole("status"))
      .toHaveTextContent("Deleted Mercury.");
  });

  it("preserves focus moved to another control while the collection updates", async () => {
    await renderWithSalt(<DeletionWithFocus />);
    const add = page.getByRole("button", { name: "Add record", exact: true });
    const list = page.getByRole("list", { name: "Research records" }).element();
    const nextFocus = vi.spyOn(deleteButton("Nova").element(), "focus");
    const { trigger } = await openDeletion("Mercury");
    const removeChild = list.removeChild.bind(list);
    let movedFocus = false;

    // Put another control in focus at the committed removal boundary, before
    // the application's follow-up effect. It must retain that destination.
    vi.spyOn(list, "removeChild").mockImplementation(
      <T extends Node>(child: T): T => {
        const removesTrigger = child.contains(trigger);
        const removed = removeChild(child);
        if (removesTrigger) {
          add.element().focus();
          movedFocus = document.activeElement === add.element();
        }
        return removed;
      },
    );

    await confirmButton().click();
    await expect.element(dialog()).not.toBeInTheDocument();
    await expect.element(deleteButton("Mercury")).not.toBeInTheDocument();
    await expect.element(add).toHaveFocus();
    expect(movedFocus).toBe(true);
    expect(nextFocus).not.toHaveBeenCalled();
  });
});
