import { ToggleButton, ToggleButtonGroup } from "@salt-ds/core";
import { StrictMode, useState } from "react";
import { createPortal } from "react-dom";
import { describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";

type Option = { value: string; disabled?: boolean };
type OptionsProps = { initialOptions: Option[]; nextOptions: Option[] };

function DynamicOptions({ initialOptions, nextOptions }: OptionsProps) {
  const [options, setOptions] = useState(initialOptions);
  return (
    <>
      {/* Keep the update control out of the group's button registry.
          Only this child updates; the group's children prop is unchanged. */}
      {createPortal(
        <button type="button" onClick={() => setOptions(nextOptions)}>
          Update options
        </button>,
        document.body,
      )}
      {options.map(({ value, disabled }) => (
        <ToggleButton key={value} value={value} disabled={disabled}>
          {value}
        </ToggleButton>
      ))}
    </>
  );
}

async function renderGroup(props: OptionsProps, defaultValue?: string) {
  await renderWithSalt(
    <StrictMode>
      <button type="button">Before group</button>
      <ToggleButtonGroup
        aria-label="Dynamic options"
        defaultValue={defaultValue}
      >
        <DynamicOptions {...props} />
      </ToggleButtonGroup>
      <button type="button">After group</button>
    </StrictMode>,
  );
}

async function expectTabStop(name: string) {
  const group = page.getByRole("radiogroup", { name: "Dynamic options" });
  await expect
    .element(page.getByRole("radio", { name, exact: true }))
    .toHaveAttribute("tabindex", "0");
  expect(group.element().querySelectorAll('button[tabindex="0"]')).toHaveLength(
    1,
  );
}

async function updateOptions() {
  await userEvent.click(page.getByRole("button", { name: "Update options" }));
}

describe("ToggleButtonGroup with independently updated descendants", () => {
  it("creates one tab stop when a child mounts its buttons later", async () => {
    await renderGroup({
      initialOptions: [],
      nextOptions: [{ value: "First" }, { value: "Second" }],
    });
    expect(
      page.getByRole("radiogroup").element().querySelectorAll("button"),
    ).toHaveLength(0);
    await updateOptions();
    await expectTabStop("First");
    await expect
      .element(page.getByRole("radio", { name: "Second" }))
      .toHaveAttribute("tabindex", "-1");
    await userEvent.click(page.getByRole("button", { name: "Before group" }));
    await userEvent.tab();
    await expect
      .element(page.getByRole("radio", { name: "First" }))
      .toHaveFocus();
    await userEvent.tab();
    await expect
      .element(page.getByRole("button", { name: "After group" }))
      .toHaveFocus();
    await userEvent.tab({ shift: true });
    await expect
      .element(page.getByRole("radio", { name: "First" }))
      .toHaveFocus();
  });

  it("falls back when a child disables the selected button", async () => {
    await renderGroup(
      {
        initialOptions: [{ value: "First" }, { value: "Second" }],
        nextOptions: [{ value: "First", disabled: true }, { value: "Second" }],
      },
      "First",
    );
    await expectTabStop("First");
    await updateOptions();
    await expect
      .element(page.getByRole("radio", { name: "First" }))
      .toBeDisabled();
    await expectTabStop("Second");
  });

  it("creates a tab stop when a child enables its only button", async () => {
    await renderGroup({
      initialOptions: [{ value: "First", disabled: true }],
      nextOptions: [{ value: "First" }],
    });
    await expect
      .element(page.getByRole("radio", { name: "First" }))
      .toHaveAttribute("tabindex", "-1");
    await updateOptions();
    await expectTabStop("First");
  });

  it("falls back when a child removes the focused button", async () => {
    await renderGroup({
      initialOptions: [{ value: "First" }, { value: "Second" }],
      nextOptions: [{ value: "First" }],
    });
    await userEvent.click(page.getByRole("radio", { name: "Second" }));
    await expectTabStop("Second");
    await updateOptions();
    await expect
      .element(page.getByRole("radio", { name: "Second" }))
      .not.toBeInTheDocument();
    await expectTabStop("First");
  });

  it("uses DOM order after a child reorders the fallback buttons", async () => {
    await renderGroup({
      initialOptions: [{ value: "First" }, { value: "Second" }],
      nextOptions: [{ value: "Second" }, { value: "First" }],
    });
    await expectTabStop("First");
    await updateOptions();
    await expectTabStop("Second");
  });
});
