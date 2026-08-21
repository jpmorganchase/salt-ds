import {
  Checkbox,
  CheckboxGroup,
  type CheckboxGroupProps,
  FormField,
  FormFieldLabel,
} from "@salt-ds/core";
import { type ChangeEvent, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { renderWithSalt } from "../render";

function Group(props: CheckboxGroupProps) {
  return (
    <CheckboxGroup {...props}>
      <Checkbox label="one" value="one" />
      <Checkbox label="two" value="two" />
      <Checkbox label="three" value="three" />
    </CheckboxGroup>
  );
}

function ControlledGroup({ onChange, disabled }: CheckboxGroupProps) {
  const [checkedValues, setCheckedValues] = useState<string[]>([]);
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.persist();
    setCheckedValues((values) =>
      values.includes(event.target.value)
        ? values.filter((value) => value !== event.target.value)
        : [...values, event.target.value],
    );
    onChange?.(event);
  };
  return (
    <CheckboxGroup
      checkedValues={checkedValues}
      disabled={disabled}
      onChange={handleChange}
    >
      <Checkbox label="one" value="one" />
      <Checkbox label="two" value="two" />
      <Checkbox label="three" value="three" />
    </CheckboxGroup>
  );
}

async function expectAllChecked(checked: boolean) {
  for (const checkbox of await page.getByRole("checkbox").elements()) {
    if (checked) expect(checkbox).toBeChecked();
    else expect(checkbox).not.toBeChecked();
  }
}

describe("GIVEN a CheckboxGroup", () => {
  it("renders its checkboxes and values", async () => {
    await renderWithSalt(<Group />);
    expect(await page.getByRole("checkbox").elements()).toHaveLength(3);
    for (const value of ["one", "two", "three"]) {
      await expect
        .element(page.getByRole("checkbox", { name: value }))
        .toHaveAttribute("value", value);
    }
  });

  it.each([false, true])(
    "tabs to the first checkbox (first checked=%s)",
    async (firstChecked) => {
      await renderWithSalt(
        <Group defaultCheckedValues={firstChecked ? ["one"] : undefined} />,
      );
      await userEvent.tab();
      await expect
        .element(page.getByRole("checkbox", { name: "one" }))
        .toHaveFocus();
    },
  );

  it("tabs through the group without wrapping", async () => {
    await renderWithSalt(
      <>
        <Group />
        <button type="button">end</button>
      </>,
    );
    for (const name of ["one", "two", "three"]) {
      await userEvent.tab();
      await expect.element(page.getByRole("checkbox", { name })).toHaveFocus();
    }
    await userEvent.tab();
    await expect
      .element(page.getByRole("button", { name: "end" }))
      .toHaveFocus();
  });

  it("shift-tabs through the group without wrapping", async () => {
    await renderWithSalt(
      <>
        <button type="button">start</button>
        <Group />
        <button type="button">end</button>
      </>,
    );
    await page.getByRole("button", { name: "end" }).click();
    for (const name of ["three", "two", "one"]) {
      await userEvent.tab({ shift: true });
      await expect.element(page.getByRole("checkbox", { name })).toHaveFocus();
    }
    await userEvent.tab({ shift: true });
    await expect
      .element(page.getByRole("button", { name: "start" }))
      .toHaveFocus();
  });

  it("skips disabled checkboxes", async () => {
    await renderWithSalt(
      <CheckboxGroup>
        <Checkbox label="one" value="one" disabled />
        <Checkbox label="two" value="two" />
      </CheckboxGroup>,
    );
    await userEvent.tab();
    await expect
      .element(page.getByRole("checkbox", { name: "two" }))
      .toHaveFocus();
  });

  it("respects defaultCheckedValues", async () => {
    await renderWithSalt(<Group defaultCheckedValues={["one"]} />);
    await expect
      .element(page.getByRole("checkbox", { name: "one" }))
      .toBeChecked();
    await expect
      .element(page.getByRole("checkbox", { name: "two" }))
      .not.toBeChecked();
  });

  it.each(["mouse", "keyboard"])(
    "toggles an uncontrolled group with %s",
    async (interaction) => {
      await renderWithSalt(<Group />);
      await expectAllChecked(false);
      if (interaction === "mouse") {
        for (const name of ["one", "two", "three"])
          await page.getByRole("checkbox", { name }).click();
      } else {
        await userEvent.tab();
        for (let index = 0; index < 3; index += 1) {
          await userEvent.keyboard(" ");
          if (index < 2) await userEvent.tab();
        }
      }
      await expectAllChecked(true);
    },
  );

  it.each(["mouse", "keyboard"])(
    "calls onChange with the checkbox value using %s",
    async (interaction) => {
      const onChange = vi.fn();
      const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        event.persist();
        onChange(event);
      };
      await renderWithSalt(<Group onChange={handleChange} />);
      if (interaction === "mouse") {
        await page.getByRole("checkbox", { name: "two" }).click();
      } else {
        await userEvent.tab();
        await userEvent.tab();
        await userEvent.keyboard(" ");
      }
      expect(onChange.mock.lastCall?.[0].target.value).toBe("two");
    },
  );

  it("does not toggle a disabled checkbox", async () => {
    const onChange = vi.fn();
    await renderWithSalt(
      <CheckboxGroup onChange={onChange}>
        <Checkbox label="one" value="one" disabled />
        <Checkbox label="two" value="two" />
      </CheckboxGroup>,
    );
    const disabled = page.getByRole("checkbox", { name: "one" });
    await expect.element(disabled).toBeDisabled();
    await disabled.click({ force: true });
    await expect.element(disabled).not.toBeChecked();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("does not toggle with Enter", async () => {
    await renderWithSalt(<Group />);
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await expect
      .element(page.getByRole("checkbox", { name: "one" }))
      .not.toBeChecked();
  });

  it("respects controlled checkedValues", async () => {
    await renderWithSalt(<Group checkedValues={["one"]} />);
    await expect
      .element(page.getByRole("checkbox", { name: "one" }))
      .toBeChecked();
    await expect
      .element(page.getByRole("checkbox", { name: "two" }))
      .not.toBeChecked();
  });

  it.each(["mouse", "keyboard"])(
    "toggles a controlled group with %s",
    async (interaction) => {
      await renderWithSalt(<ControlledGroup />);
      if (interaction === "mouse") {
        for (const name of ["one", "two", "three"])
          await page.getByRole("checkbox", { name }).click();
      } else {
        await userEvent.tab();
        for (let index = 0; index < 3; index += 1) {
          await userEvent.keyboard(" ");
          if (index < 2) await userEvent.tab();
        }
      }
      await expectAllChecked(true);
    },
  );

  it("keeps a disabled controlled group unchanged", async () => {
    const onChange = vi.fn();
    await renderWithSalt(<ControlledGroup onChange={onChange} disabled />);
    const checkbox = page.getByRole("checkbox", { name: "one" });
    await expect.element(checkbox).toBeDisabled();
    await checkbox.click({ force: true });
    await expect.element(checkbox).not.toBeChecked();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("keeps a controlled group unchanged with Enter", async () => {
    await renderWithSalt(<ControlledGroup />);
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await expect
      .element(page.getByRole("checkbox", { name: "one" }))
      .not.toBeChecked();
  });

  it("inherits disabled from FormField", async () => {
    await renderWithSalt(
      <FormField disabled>
        <FormFieldLabel>Label</FormFieldLabel>
        <Group checkedValues={["one"]} />
      </FormField>,
    );
    for (const checkbox of await page.getByRole("checkbox").elements())
      expect(checkbox).toBeDisabled();
  });

  it("inherits readOnly from FormField", async () => {
    await renderWithSalt(
      <FormField readOnly>
        <FormFieldLabel>Label</FormFieldLabel>
        <Group checkedValues={["one"]} />
      </FormField>,
    );
    for (const checkbox of await page.getByRole("checkbox").elements())
      expect(checkbox).toHaveAttribute("readonly");
  });

  it("keeps checkbox accessible names inside FormField", async () => {
    await renderWithSalt(
      <FormField>
        <FormFieldLabel>Label</FormFieldLabel>
        <Group checkedValues={["one"]} />
      </FormField>,
    );
    await expect
      .element(page.getByRole("checkbox").nth(0))
      .toHaveAccessibleName("one");
  });

  it("applies the group name and permits a child override", async () => {
    await renderWithSalt(
      <CheckboxGroup name="preferences">
        <Checkbox label="one" value="one" />
        <Checkbox label="two" value="two" name="override" />
      </CheckboxGroup>,
    );
    await expect
      .element(page.getByRole("checkbox", { name: "one" }))
      .toHaveAttribute("name", "preferences");
    await expect
      .element(page.getByRole("checkbox", { name: "two" }))
      .toHaveAttribute("name", "override");
  });
});
