import { List, ListItem } from "@salt-ds/lab";
import { version } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { renderWithSalt } from "../render";

const items = [{ label: "list item 1" }, { label: "list item 2" }];

function item(index: number) {
  const element = document.getElementById(`list-item-${index}`);
  if (!element) throw new Error(`Missing list item ${index}`);
  return page.elementLocator(element);
}

async function renderList(
  declarative: boolean,
  props: Record<string, unknown> = {},
) {
  return renderWithSalt(
    declarative ? (
      <List {...props}>
        <ListItem>list item 1</ListItem>
        <ListItem>list item 2</ListItem>
      </List>
    ) : (
      <List {...props} source={items} />
    ),
  );
}

for (const type of ["source", "declarative"] as const) {
  const declarative = type === "declarative";
  describe(`GIVEN a ${type} List`, () => {
    it("is keyboard focusable", async () => {
      await renderList(declarative);
      await expect
        .element(page.getByRole("listbox"))
        .toHaveAttribute("tabindex", "0");
    });

    it("updates aria-activedescendant after mouse navigation", async () => {
      await renderList(declarative, { id: "list" });
      await item(1).hover();
      await expect
        .element(page.getByRole("listbox"))
        .toHaveAttribute("aria-activedescendant", "list-item-1");
    });

    it("sets aria-activedescendant when focused", async () => {
      await renderList(declarative, { id: "list" });
      page.getByRole("listbox").element().focus();
      await expect
        .element(page.getByRole("listbox"))
        .toHaveAttribute("aria-activedescendant", "list-item-0");
    });

    const selectionTest = version.startsWith("18") ? it.skip : it;
    selectionTest("sets aria-selected for a selected item", async () => {
      await renderList(declarative, { id: "list" });
      await item(1).click();
      await expect.element(item(0)).not.toHaveAttribute("aria-selected");
      await expect.element(item(1)).toHaveAttribute("aria-selected");
    });

    it("sets aria-disabled only for disabled items", async () => {
      await renderWithSalt(
        declarative ? (
          <List id="list">
            <ListItem>list item 1</ListItem>
            <ListItem disabled>list item 2</ListItem>
          </List>
        ) : (
          <List
            id="list"
            source={[
              { label: "list item 1" },
              { label: "list item 2", disabled: true },
            ]}
          />
        ),
      );
      await expect.element(item(0)).not.toHaveAttribute("aria-disabled");
      await expect.element(item(1)).toHaveAttribute("aria-disabled");
    });

    describe("WHEN the entire list is disabled", () => {
      beforeEach(async () => {
        await renderList(declarative, { disabled: true, id: "list" });
      });

      it("is not keyboard focusable", async () => {
        await expect
          .element(page.getByRole("listbox"))
          .not.toHaveAttribute("tabindex");
      });

      it("sets aria-disabled on every item", async () => {
        await expect.element(item(0)).toHaveAttribute("aria-disabled");
        await expect.element(item(1)).toHaveAttribute("aria-disabled");
      });
    });

    it("marks a multi-select list", async () => {
      await renderList(declarative, { selectionStrategy: "multiple" });
      await expect
        .element(page.getByRole("listbox"))
        .toHaveAttribute("aria-multiselectable");
    });

    const multipleSelectionTest = version.startsWith("18") ? it.skip : it;
    multipleSelectionTest(
      "sets aria-selected in a multi-select list",
      async () => {
        await renderList(declarative, {
          id: "list",
          selectionStrategy: "multiple",
        });
        await item(0).click();
        await expect.element(item(0)).toHaveAttribute("aria-selected");
        await expect.element(item(1)).not.toHaveAttribute("aria-selected");
      },
    );
  });
}
