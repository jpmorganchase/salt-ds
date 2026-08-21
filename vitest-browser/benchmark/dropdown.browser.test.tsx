import { Dropdown, FormField } from "@salt-ds/lab";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { renderWithSalt } from "../render";

const testSource = ["Bar", "Foo", "Foo Bar", "Baz"];

describe("GIVEN a Dropdown component", () => {
  it("shows the FormField focus ring when focused", async () => {
    await renderWithSalt(
      <FormField label="Dropdown" id="dropdown-in-form-field">
        <Dropdown source={testSource} />
      </FormField>,
    );

    page.getByLabelText("Dropdown").element().focus();
    await expect
      .element(page.getByText("Dropdown").first())
      .toBeInTheDocument();
    expect(document.querySelector(".saltFormFieldLegacy")).toHaveClass(
      "saltFormFieldLegacy-focused",
    );
  });

  it("closes the source list when selecting the same option", async () => {
    await renderWithSalt(
      <Dropdown id="test" source={testSource} selected="Bar" />,
    );

    const control = document.querySelector("#test-control");
    if (!control) throw new Error("Missing dropdown control");
    await page.elementLocator(control).click();
    await expect.element(page.getByTestId("dropdown-list")).toBeVisible();
    await page.getByRole("option", { name: "Bar", exact: true }).nth(1).click();
    await expect
      .element(page.getByTestId("dropdown-list"))
      .not.toBeInTheDocument();
  });
});
