import { Checkbox } from "@salt-ds/core";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";

describe("GIVEN a Checkbox", () => {
  it("supports data attributes on inputProps", async () => {
    await renderWithSalt(
      <Checkbox inputProps={{ "data-testId": "customInput" }} checked />,
    );
    await expect.element(page.getByTestId("customInput")).toBeChecked();
  });

  it("sets the indeterminate property", async () => {
    await renderWithSalt(<Checkbox indeterminate />);
    expect(
      (page.getByRole("checkbox").element() as HTMLInputElement).indeterminate,
    ).toBe(true);
  });

  it("supports defaultChecked", async () => {
    await renderWithSalt(<Checkbox defaultChecked />);
    await expect.element(page.getByRole("checkbox")).toBeChecked();
  });

  it("does not add aria-checked to a native checkbox", async () => {
    await renderWithSalt(<Checkbox defaultChecked />);
    await expect
      .element(page.getByRole("checkbox"))
      .not.toHaveAttribute("aria-checked");
  });

  it("toggles an uncontrolled checkbox", async () => {
    const onChange = vi.fn();
    await renderWithSalt(<Checkbox onChange={onChange} value="test" />);
    const checkbox = page.getByRole("checkbox");

    await expect.element(checkbox).not.toBeChecked();
    await checkbox.click();
    await expect.element(checkbox).toBeChecked();
    await checkbox.click();
    await expect.element(checkbox).not.toBeChecked();
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("supports a controlled checked value", async () => {
    await renderWithSalt(<Checkbox checked />);
    await expect.element(page.getByRole("checkbox")).toBeChecked();
  });

  it("calls onChange without changing a controlled value", async () => {
    const onChange = vi.fn();
    await renderWithSalt(
      <Checkbox onChange={onChange} checked={false} value="test" />,
    );
    const checkbox = page.getByRole("checkbox");

    await checkbox.click();
    expect(onChange).toHaveBeenCalledOnce();
    await expect.element(checkbox).not.toBeChecked();
  });

  it("applies disabled", async () => {
    await renderWithSalt(<Checkbox disabled />);
    await expect.element(page.getByRole("checkbox")).toBeDisabled();
  });

  it("applies readOnly", async () => {
    await renderWithSalt(<Checkbox readOnly />);
    await expect
      .element(page.getByRole("checkbox"))
      .toHaveAttribute("readonly");
  });

  it("keeps read-only checkboxes focusable and non-interactive", async () => {
    const onChange = vi.fn();
    await renderWithSalt(<Checkbox readOnly onChange={onChange} />);
    const checkbox = page.getByRole("checkbox");

    await userEvent.tab();
    await expect.element(checkbox).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    await checkbox.click({ force: true });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("does not add empty form-field aria attributes", async () => {
    await renderWithSalt(<Checkbox />);
    const checkbox = page.getByRole("checkbox");

    await expect.element(checkbox).not.toHaveAttribute("aria-describedby");
    await expect.element(checkbox).not.toHaveAttribute("aria-labelledby");
  });

  it("applies the name prop", async () => {
    await renderWithSalt(<Checkbox name="accept" />);
    await expect
      .element(page.getByRole("checkbox"))
      .toHaveAttribute("name", "accept");
  });
});

function appearanceOf(name: string) {
  const icon = page
    .getByRole("checkbox", { name })
    .element()
    .closest("label")
    ?.querySelector(".saltCheckboxIcon");
  if (!(icon instanceof HTMLElement)) {
    throw new Error(`Expected the "${name}" checkbox to render an icon`);
  }
  const { borderTopColor, color } = getComputedStyle(icon);
  return { borderTopColor, color };
}

describe("GIVEN a Checkbox the user cannot change", () => {
  it("looks interactive on hover when it is enabled", async () => {
    await renderWithSalt(<Checkbox label="Enabled" />);
    const resting = appearanceOf("Enabled");

    await userEvent.hover(page.getByText("Enabled"));

    expect(appearanceOf("Enabled")).not.toEqual(resting);
  });

  it.each([
    ["unchecked", {}],
    ["checked", { checked: true }],
    ["indeterminate", { checked: true, indeterminate: true }],
  ] as const)(
    "keeps its resting appearance on hover when disabled and %s",
    async (_, props) => {
      await renderWithSalt(<Checkbox label="Disabled" disabled {...props} />);
      const resting = appearanceOf("Disabled");

      await userEvent.hover(page.getByText("Disabled"));

      expect(appearanceOf("Disabled")).toEqual(resting);
    },
  );

  it("still shows which of the disabled checkboxes is checked", async () => {
    await renderWithSalt(
      <>
        <Checkbox label="Checked" checked disabled />
        <Checkbox label="Unchecked" disabled />
      </>,
    );

    expect(appearanceOf("Checked")).not.toEqual(appearanceOf("Unchecked"));

    await userEvent.hover(page.getByText("Checked"));

    expect(appearanceOf("Checked")).not.toEqual(appearanceOf("Unchecked"));
  });

  it.each(["error", "warning"] as const)(
    "keeps its %s appearance on hover",
    async (validationStatus) => {
      await renderWithSalt(
        <Checkbox
          label="Validated"
          checked
          validationStatus={validationStatus}
        />,
      );
      const resting = appearanceOf("Validated");

      await userEvent.hover(page.getByText("Validated"));

      expect(appearanceOf("Validated")).toEqual(resting);
    },
  );

  it("keeps its read-only appearance on hover", async () => {
    await renderWithSalt(<Checkbox label="Read only" checked readOnly />);
    const resting = appearanceOf("Read only");

    await userEvent.hover(page.getByText("Read only"));

    expect(appearanceOf("Read only")).toEqual(resting);
  });
});
