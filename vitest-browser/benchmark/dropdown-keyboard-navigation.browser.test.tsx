import { Dropdown, DropdownButton, type SelectionStrategy } from "@salt-ds/lab";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { renderWithSalt } from "../render";

type DropdownKind = "single" | "multiselect";

const DROPDOWN_KINDS = ["single", "multiselect"] as const;
const testSource = ["Bar", "Foo", "Foo Bar", "Baz"];
const LAB_TYPEAHEAD_RESET_MS = 100;

async function withFakeTimers<T extends { unmount: () => Promise<void> }>(
  render: () => Promise<T>,
  run: () => Promise<void>,
) {
  vi.useFakeTimers();
  try {
    const rendered = await render();
    try {
      await run();
    } finally {
      await rendered.unmount();
      expect(vi.getTimerCount()).toBe(0);
    }
  } finally {
    vi.useRealTimers();
  }
}

function selectionStrategy(kind: DropdownKind): SelectionStrategy {
  return kind === "multiselect" ? "multiple" : "default";
}

function renderDropdown(
  kind: DropdownKind,
  props: Record<string, unknown> = {},
) {
  return renderWithSalt(
    <Dropdown
      id="test"
      selectionStrategy={selectionStrategy(kind)}
      source={testSource}
      {...props}
    />,
  );
}

function control() {
  const element = document.getElementById("test-control");
  if (!element) throw new Error("Missing legacy Dropdown control");
  return page.elementLocator(element);
}

async function focusControl() {
  control().element().focus();
  await expect.element(control()).toHaveFocus();
}

async function expectPopup(open: boolean) {
  await expect
    .poll(() => document.getElementById("test-popup") !== null)
    .toBe(open);
}

async function expectActive(index: number) {
  await expect
    .element(control())
    .toHaveAttribute("aria-activedescendant", `test-item-${index}`);
}

describe.each(DROPDOWN_KINDS)("legacy %s Dropdown keyboard", (kind) => {
  it.each([" ", "{Enter}", "{ArrowDown}"])(
    "opens from a closed state with %s",
    async (key) => {
      await renderDropdown(kind);
      await focusControl();
      await userEvent.keyboard(key);
      await expectPopup(true);
    },
  );

  it("does not open from Tab", async () => {
    await renderDropdown(kind);
    await focusControl();
    await userEvent.tab();
    await expectPopup(false);
  });

  it.each([" ", "{Enter}"])(
    "selects the first item with %s from an open state",
    async (key) => {
      await renderDropdown(kind, { defaultIsOpen: true });
      await focusControl();
      await userEvent.keyboard(key);
      await expectPopup(kind === "multiselect");
      await expect.element(control()).toHaveTextContent(testSource[0]);
    },
  );

  it("closes with Escape without selecting", async () => {
    await renderDropdown(kind, { defaultIsOpen: true });
    await focusControl();
    await userEvent.keyboard("{Escape}");
    await expectPopup(false);
    await expect.element(control()).not.toHaveTextContent(testSource[0]);
  });

  it("moves to the second item with ArrowDown", async () => {
    await renderDropdown(kind, { defaultIsOpen: true });
    await focusControl();
    await userEvent.keyboard("{ArrowDown}");
    await expectActive(1);
  });

  it("moves to the last item with End", async () => {
    await renderDropdown(kind, { defaultIsOpen: true });
    await focusControl();
    await userEvent.keyboard("{End}");
    await expectActive(testSource.length - 1);
  });

  it("uses Tab selection only for a single-select Dropdown", async () => {
    await renderDropdown(kind, { defaultIsOpen: true });
    await focusControl();
    await userEvent.keyboard("{ArrowDown}{Tab}");
    if (kind === "single") {
      await expect.element(control()).toHaveTextContent(testSource[1]);
    } else {
      await expect.element(control()).not.toHaveTextContent(testSource[1]);
    }
  });

  it("focuses type-ahead matches typed rapidly", async () => {
    await renderDropdown(kind, { defaultIsOpen: true });
    await focusControl();
    await expectActive(0);
    await userEvent.keyboard("B");
    await expectActive(3);
    await userEvent.keyboard("A");
    await expectActive(3);
    await userEvent.keyboard("R");
    await expectActive(0);
  });

  it("supports a space in type-ahead without closing", async () => {
    await renderDropdown(kind, { defaultIsOpen: true });
    await focusControl();
    await userEvent.keyboard("FOO ");
    await expectActive(2);
    await userEvent.keyboard("BAR");
    await expectActive(2);
    await expectPopup(true);
  });

  it("uses Space as selection after type-ahead times out", async () => {
    await withFakeTimers(
      () => renderDropdown(kind, { defaultIsOpen: true }),
      async () => {
        await focusControl();
        await userEvent.keyboard("FOO ");
        await expectActive(2);
        await vi.advanceTimersByTimeAsync(LAB_TYPEAHEAD_RESET_MS + 1);
        await userEvent.keyboard(" ");
        await expectPopup(kind === "multiselect");
        await expect.element(control()).toHaveTextContent("Foo Bar");
      },
    );
  });

  it("resets type-ahead text after a timeout", async () => {
    await withFakeTimers(
      () => renderDropdown(kind, { defaultIsOpen: true }),
      async () => {
        await focusControl();
        await userEvent.keyboard("F");
        await expectActive(1);
        await vi.advanceTimersByTimeAsync(LAB_TYPEAHEAD_RESET_MS + 1);
        await userEvent.keyboard("B");
        await expectActive(3);
        await vi.advanceTimersByTimeAsync(LAB_TYPEAHEAD_RESET_MS + 1);
      },
    );
  });

  it("wraps type-ahead search to the beginning", async () => {
    await withFakeTimers(
      () => renderDropdown(kind, { defaultIsOpen: true }),
      async () => {
        await focusControl();
        await userEvent.keyboard("BAZ");
        await expectActive(3);
        await vi.advanceTimersByTimeAsync(LAB_TYPEAHEAD_RESET_MS + 1);
        await userEvent.keyboard("F");
        await expectActive(1);
        await vi.advanceTimersByTimeAsync(LAB_TYPEAHEAD_RESET_MS + 1);
      },
    );
  });

  it("cycles matches when the first character is repeated", async () => {
    await renderDropdown(kind, { defaultIsOpen: true });
    await focusControl();
    await userEvent.keyboard("F");
    await expectActive(1);
    await userEvent.keyboard("F");
    await expectActive(2);
    await userEvent.keyboard("F");
    await expectActive(1);
  });

  it.skip("does not propagate Alt+ArrowDown", () => {});

  it("navigates when open state is controlled", async () => {
    await renderDropdown(kind, { isOpen: true });
    await focusControl();
    await expectActive(0);
    await userEvent.keyboard("{ArrowDown}");
    await expectActive(1);
  });

  it.each(["pointer", "keyboard"])(
    "does not open a disabled Dropdown with %s",
    async (interaction) => {
      await renderDropdown(kind, { disabled: true });
      if (interaction === "pointer") {
        await control().click({ force: true });
      } else {
        control().element().focus();
        await userEvent.keyboard("{Enter}");
      }
      await expectPopup(false);
    },
  );

  it("forwards callbacks from a custom trigger", async () => {
    const onKeyDown = vi.fn();
    await renderWithSalt(
      <Dropdown
        id="test"
        placement="bottom-end"
        source={testSource}
        triggerComponent={
          <DropdownButton
            id="custom-button"
            label="blah"
            onKeyDown={onKeyDown}
            tabIndex={0}
          />
        }
      />,
    );
    const customButton = document.getElementById("custom-button");
    if (!customButton) throw new Error("Missing custom Dropdown trigger");
    customButton.focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(onKeyDown).toHaveBeenCalledOnce();
    await expectPopup(true);
  });
});
