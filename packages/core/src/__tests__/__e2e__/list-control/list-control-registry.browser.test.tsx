import { Dropdown, ListBox, Option, OptionGroup } from "@salt-ds/core";
import { StrictMode, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { act, renderWithSalt } from "~browser-test-utils/render";

afterEach(() => vi.restoreAllMocks());

// Let both MutationObserver delivery and any queued rebuild finish before
// checking that work did not happen.
const settle = () => new Promise(requestAnimationFrame);
const listbox = () => page.getByRole("listbox");

describe.each(["ListBox", "Dropdown"] as const)(
  "%s after removing the active option",
  (control) => {
    it.each([
      ["{ArrowDown}", "b"],
      ["{ArrowUp}", "b"],
      ["{Home}", "b"],
      ["{End}", "c"],
      ["{PageUp}", "b"],
      ["{PageDown}", "c"],
    ])("recovers with %s", async (key, expectedId) => {
      let removeActive = () => {};
      function UpdatingOptions() {
        const [includeFirst, setIncludeFirst] = useState(true);
        removeActive = () => setIncludeFirst(false);
        return (
          <>
            {includeFirst && <Option id="a" value="A" />}
            <Option id="b" value="B" />
            <Option id="c" value="C" />
          </>
        );
      }
      await renderWithSalt(
        control === "ListBox" ? (
          <ListBox>
            <UpdatingOptions />
          </ListBox>
        ) : (
          <Dropdown open>
            <UpdatingOptions />
          </Dropdown>
        ),
      );
      const trigger = page.getByRole(
        control === "ListBox" ? "listbox" : "combobox",
      );
      trigger.element().focus();
      await userEvent.keyboard("{Home}");
      await expect
        .element(trigger)
        .toHaveAttribute("aria-activedescendant", "a");

      // Updating a nested child keeps Dropdown's children prop stable, so its
      // opening effect cannot hide a stale registry state by activating B.
      await act(removeActive);
      await expect
        .element(trigger)
        .not.toHaveAttribute("aria-activedescendant");
      await userEvent.keyboard(key);

      await expect
        .element(trigger)
        .toHaveAttribute("aria-activedescendant", expectedId);
    });
  },
);

describe("List control registry invalidation", () => {
  it.each(["removed", "disabled", "value", "id"])(
    "reconciles an active option after a %s change",
    async (property) => {
      const onSelectionChange = vi.fn();
      let update = () => {};
      function Fixture() {
        const [changed, setChanged] = useState(false);
        update = () => setChanged(true);
        return (
          <ListBox onSelectionChange={onSelectionChange}>
            {(!changed || property !== "removed") && (
              <Option
                id={changed && property === "id" ? "new-a" : "a"}
                disabled={changed && property === "disabled"}
                value={changed && property === "value" ? "Updated A" : "A"}
              />
            )}
            <Option id="b" value="B" />
          </ListBox>
        );
      }
      await renderWithSalt(
        <StrictMode>
          <Fixture />
        </StrictMode>,
      );
      listbox().element().focus();
      await expect
        .element(listbox())
        .toHaveAttribute("aria-activedescendant", "a");

      await act(update);
      await userEvent.keyboard("{Enter}");

      if (property === "value") {
        expect(onSelectionChange.mock.lastCall?.[1]).toEqual(["Updated A"]);
      } else {
        expect(onSelectionChange).not.toHaveBeenCalled();
      }
      if (property === "removed" || property === "id") {
        await expect
          .element(listbox())
          .not.toHaveAttribute("aria-activedescendant");
      } else {
        await expect
          .element(listbox())
          .toHaveAttribute("aria-activedescendant", "a");
      }
    },
  );

  it("does not scan the option collection when multiselect checkmarks change", async () => {
    const { rerender } = await renderWithSalt(
      <ListBox multiselect>
        <Option value="A" />
        <Option value="B" />
      </ListBox>,
    );
    listbox().element().focus();
    await settle();
    // Observe the rendered list, whether Salt resolves to source or built output.
    const queries = vi.spyOn(listbox().element(), "querySelectorAll");

    for (const selected of ["true", "false"]) {
      await userEvent.keyboard("{Enter}");
      await expect
        .element(page.getByRole("option", { name: "A" }))
        .toHaveAttribute("aria-selected", selected);
      await settle();
      expect(queries).not.toHaveBeenCalledWith('[role="option"]');
    }

    // A structural change must exercise the measurement, so a disconnected spy
    // cannot make the assertions above pass silently.
    await rerender(
      <ListBox multiselect>
        <Option value="A" />
        <Option value="B" />
        <Option value="C" />
      </ListBox>,
    );
    await settle();
    expect(queries).toHaveBeenCalledWith('[role="option"]');
  });

  it("ignores decorative content changes inside and outside options", async () => {
    let update = (_changed: boolean) => {};
    function Fixture({ extraOption = false }: { extraOption?: boolean }) {
      const [changed, setChanged] = useState(false);
      update = setChanged;
      return (
        <ListBox>
          {changed && <span aria-hidden="true">Loading</span>}
          <Option value="A">A{changed && <span>Badge</span>}</Option>
          <Option value="B" />
          {extraOption && <Option value="C" />}
        </ListBox>
      );
    }
    const { rerender } = await renderWithSalt(<Fixture />);
    await settle();
    const queries = vi.spyOn(listbox().element(), "querySelectorAll");

    for (const changed of [true, false]) {
      await act(() => update(changed));
      await settle();
      expect(queries).not.toHaveBeenCalledWith('[role="option"]');
    }

    await rerender(<Fixture extraOption />);
    await settle();
    expect(queries).toHaveBeenCalledWith('[role="option"]');
  });

  it.each(["disabled", "value", "id"])(
    "keeps DOM order after a metadata-only %s change in Strict Mode",
    async (property) => {
      let update = () => {};
      function Fixture() {
        const [changed, setChanged] = useState(false);
        update = () => setChanged(true);
        return (
          <ListBox>
            <Option
              id={changed && property === "id" ? "new-a" : "a"}
              disabled={changed && property === "disabled"}
              value={changed && property === "value" ? "new-value" : "A"}
            >
              A
            </Option>
            <Option id="b" value="B" />
            <Option id="c" value="C" />
          </ListBox>
        );
      }
      await renderWithSalt(
        <StrictMode>
          <Fixture />
        </StrictMode>,
      );
      await act(update);
      await settle();
      listbox().element().focus();
      await expect
        .element(listbox())
        .toHaveAttribute(
          "aria-activedescendant",
          property === "id" ? "new-a" : "a",
        );
      await userEvent.keyboard("{ArrowDown}");
      await expect
        .element(listbox())
        .toHaveAttribute("aria-activedescendant", "b");
      await userEvent.keyboard("{End}");
      await expect
        .element(listbox())
        .toHaveAttribute("aria-activedescendant", "c");
    },
  );

  it("navigates every option in DOM order after grouped insertion, reordering, and removal", async () => {
    let update = (_groups: string[]) => {};
    function Fixture() {
      const [groups, setGroups] = useState(["A", "B"]);
      update = setGroups;
      return (
        <ListBox>
          {groups.map((group) => (
            <OptionGroup label={group} key={group}>
              <Option id={group} value={group} />
              <Option id={`${group}-last`} value={`${group}-last`} />
            </OptionGroup>
          ))}
        </ListBox>
      );
    }
    await renderWithSalt(<Fixture />);

    for (const groups of [
      ["C", "A", "B", "D"],
      ["D", "B", "A", "C"],
      ["B", "A"],
    ]) {
      await act(() => update(groups));
      listbox().element().focus();
      const expectedIds = groups.flatMap((group) => [group, `${group}-last`]);
      await userEvent.keyboard("{Home}");
      for (const [index, id] of expectedIds.entries()) {
        if (index > 0) await userEvent.keyboard("{ArrowDown}");
        await expect
          .element(listbox())
          .toHaveAttribute("aria-activedescendant", id);
      }
      await userEvent.keyboard("{End}");
      for (const [index, id] of [...expectedIds].reverse().entries()) {
        if (index > 0) await userEvent.keyboard("{ArrowUp}");
        await expect
          .element(listbox())
          .toHaveAttribute("aria-activedescendant", id);
      }
    }
  });
});
