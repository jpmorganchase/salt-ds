import { RadioButton } from "@salt-ds/core";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";

describe("GIVEN a RadioButton component", () => {
  it("supports data attributes on inputProps", async () => {
    await renderWithSalt(
      <RadioButton
        inputProps={{ "data-testId": "customInput" }}
        value="value"
      />,
    );
    expect(
      (page.getByTestId("customInput").element() as HTMLInputElement).value,
    ).toBe("value");
  });

  it("renders a specified value", async () => {
    await renderWithSalt(<RadioButton value="some value" />);
    expect((page.getByRole("radio").element() as HTMLInputElement).value).toBe(
      "some value",
    );
  });

  it("renders checked", async () => {
    await renderWithSalt(<RadioButton checked />);
    await expect.element(page.getByRole("radio")).toBeChecked();
  });

  it("renders disabled", async () => {
    await renderWithSalt(<RadioButton disabled />);
    await expect.element(page.getByRole("radio")).toBeDisabled();
  });

  it("applies readOnly", async () => {
    await renderWithSalt(<RadioButton readOnly />);
    await expect.element(page.getByRole("radio")).toHaveAttribute("readonly");
  });

  it("keeps read-only radios focusable and non-interactive", async () => {
    const onChange = vi.fn();
    await renderWithSalt(<RadioButton readOnly onChange={onChange} />);
    const radio = page.getByRole("radio");

    await userEvent.tab();
    await expect.element(radio).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    await radio.click({ force: true });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("changes appearance when an enabled radio button is hovered", async () => {
    await renderWithSalt(<RadioButton label="Enabled" />);
    const icon = document.querySelector(".saltRadioButtonIcon") as HTMLElement;
    const resting = getComputedStyle(icon).borderColor;

    await userEvent.hover(page.getByText("Enabled"));

    expect(getComputedStyle(icon).borderColor).not.toBe(resting);
  });

  it("does not change appearance when a disabled radio button is hovered", async () => {
    await renderWithSalt(<RadioButton disabled label="Disabled" />);
    const icon = document.querySelector(".saltRadioButtonIcon") as HTMLElement;
    const resting = getComputedStyle(icon).borderColor;

    await userEvent.hover(page.getByText("Disabled"));

    expect(getComputedStyle(icon).borderColor).toBe(resting);
  });
});
