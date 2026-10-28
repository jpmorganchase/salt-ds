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

  it("applies aria-label to the input element", async () => {
    await renderWithSalt(<RadioButton aria-label="Spot" value="spot" />);
    await expect.element(page.getByRole("radio")).toHaveAccessibleName("Spot");
    expect(
      document.querySelector(".saltRadioButton")?.hasAttribute("aria-label"),
    ).toBe(false);
  });

  it("prefers aria-label from inputProps over aria-label", async () => {
    await renderWithSalt(
      <RadioButton
        aria-label="Outer"
        inputProps={{ "aria-label": "Inner" }}
        value="spot"
      />,
    );
    await expect.element(page.getByRole("radio")).toHaveAccessibleName("Inner");
  });

  it("applies aria-labelledby and aria-describedby to the input element", async () => {
    await renderWithSalt(
      <>
        <span id="external-label">Spot</span>
        <span id="external-description">Settles in two days</span>
        <RadioButton
          aria-labelledby="external-label"
          aria-describedby="external-description"
          value="spot"
        />
      </>,
    );
    const radio = page.getByRole("radio");
    await expect.element(radio).toHaveAccessibleName("Spot");
    await expect
      .element(radio)
      .toHaveAccessibleDescription("Settles in two days");
    const root = document.querySelector(".saltRadioButton");
    expect(root?.hasAttribute("aria-labelledby")).toBe(false);
    expect(root?.hasAttribute("aria-describedby")).toBe(false);
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
});

function appearanceOf(name: string) {
  const icon = page
    .getByRole("radio", { name })
    .element()
    .closest("label")
    ?.querySelector(".saltRadioButtonIcon");
  if (!(icon instanceof HTMLElement)) {
    throw new Error(`Expected the "${name}" radio button to render an icon`);
  }
  const { borderTopColor, color } = getComputedStyle(icon);
  return { borderTopColor, color };
}

describe("GIVEN a RadioButton the user cannot change", () => {
  it("looks interactive on hover when it is enabled", async () => {
    await renderWithSalt(<RadioButton label="Enabled" />);
    const resting = appearanceOf("Enabled");

    await userEvent.hover(page.getByText("Enabled"));

    expect(appearanceOf("Enabled")).not.toEqual(resting);
  });

  it.each([
    ["unselected", {}],
    ["selected", { checked: true }],
  ] as const)(
    "keeps its resting appearance on hover when disabled and %s",
    async (_, props) => {
      await renderWithSalt(
        <RadioButton label="Disabled" disabled {...props} />,
      );
      const resting = appearanceOf("Disabled");

      await userEvent.hover(page.getByText("Disabled"));

      expect(appearanceOf("Disabled")).toEqual(resting);
    },
  );

  it("still shows which of the disabled options is selected", async () => {
    await renderWithSalt(
      <>
        <RadioButton label="Selected" checked disabled />
        <RadioButton label="Unselected" disabled />
      </>,
    );
    expect(appearanceOf("Selected")).not.toEqual(appearanceOf("Unselected"));

    await userEvent.hover(page.getByText("Selected"));

    expect(appearanceOf("Selected")).not.toEqual(appearanceOf("Unselected"));
  });

  it.each(["error", "warning"] as const)(
    "keeps its %s appearance on hover",
    async (validationStatus) => {
      await renderWithSalt(
        <RadioButton
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
    await renderWithSalt(<RadioButton label="Read only" checked readOnly />);
    const resting = appearanceOf("Read only");

    await userEvent.hover(page.getByText("Read only"));

    expect(appearanceOf("Read only")).toEqual(resting);
  });
});
