import { Button } from "@salt-ds/core";
import { QueryInput, type QueryInputCategory } from "@salt-ds/lab";
import { beforeEach, describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { renderWithSalt } from "../render";

const categories: QueryInputCategory[] = [
  { name: "A", values: ["A1", "A2", "A3"] },
  { name: "B", values: ["B1", "B2", "B3", "B4"] },
  { name: "C", values: ["C1", "C2", "C3", "C4", "C5"] },
];

async function renderQuery(
  props: Omit<React.ComponentProps<typeof QueryInput>, "categories"> = {},
) {
  await renderWithSalt(<QueryInput {...props} categories={categories} />);
  page.getByRole("textbox").element().focus();
}

describe("GIVEN a QueryInput", () => {
  it("renders categories when expanded", async () => {
    await renderQuery();
    await expect.element(page.getByRole("listbox")).toBeVisible();
    for (const name of ["A", "B", "C"]) {
      await expect
        .element(page.getByText(name, { exact: true }))
        .toBeInTheDocument();
    }
  });

  it("renders values after choosing a category", async () => {
    await renderQuery();
    const category = page.getByText("B", { exact: true });
    await category.hover();
    await category.click();
    await expect.element(page.getByTestId("value-list")).toBeVisible();
    await expect.element(page.getByText("B1")).toBeInTheDocument();
    await expect.element(page.getByText("B4")).toBeInTheDocument();
  });

  it.skip("returns to categories from the value list", async () => {
    await renderQuery();
    const category = page.getByText("B", { exact: true });
    await category.hover();
    await category.click();
    await page.getByText("B", { exact: true }).click();
    await expect.element(page.getByTestId("category-list")).toBeVisible();
  });

  it("renders search results for a query", async () => {
    await renderQuery();
    await page.getByRole("textbox").fill("2");
    await expect.element(page.getByTestId("search-list")).toBeVisible();
  });

  it("auto-closes after a value is selected", async () => {
    await renderQuery({ autoClose: true });
    const category = page.getByText("C", { exact: true });
    await category.hover();
    await category.click();
    const value = page.getByText("C2");
    await value.hover();
    await value.click();
    await expect
      .poll(() => page.getByTestId("value-list").elements().length)
      .toBe(0);
  });

  it("creates a token for an unmatched query", async () => {
    await renderQuery();
    await page.getByRole("textbox").fill("defg");
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => page.getByTestId("pill").elements().length).toBe(1);
    await expect
      .element(page.getByTestId("pill").nth(0))
      .toHaveTextContent("defg");
  });

  describe("WHEN Tab is pressed from the text editor", () => {
    beforeEach(() => renderQuery());

    it("tokenizes text and focuses the clear button", async () => {
      await page.getByRole("textbox").fill("ABCD");
      await userEvent.tab();
      await expect
        .poll(() => page.getByTestId("pill").elements().length)
        .toBe(1);
      await expect
        .element(page.getByTestId("pill").nth(0))
        .toHaveTextContent("ABCD");
      await expect.element(page.getByTestId("clear-button")).toHaveFocus();
    });
  });

  it("moves focus from clear to the boolean selector", async () => {
    await renderQuery();
    await userEvent.tab();
    await expect.element(page.getByRole("radio").nth(0)).toHaveFocus();
  });

  it("tabs from a menu item without selecting it", async () => {
    await renderQuery();
    await page.getByRole("textbox").fill("2");
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.tab();
    await expect.element(page.getByTestId("clear-button")).toHaveFocus();
  });

  it("supports reverse tabbing to the previous control", async () => {
    await renderWithSalt(
      <div>
        <Button data-testid="previous-control">PreviousControl</Button>
        <QueryInput categories={categories} />
      </div>,
    );
    page.getByRole("textbox").element().focus();
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
    await expect.element(page.getByTestId("previous-control")).toHaveFocus();
  });
});
