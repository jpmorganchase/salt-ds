import {
  FormField,
  FormFieldLabel,
  NumberInput,
  type NumberInputProps,
} from "@salt-ds/core";
import { composeStories } from "@storybook/react-vite";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import * as numberInputStories from "~stories/number-input/number-input.stories";
import { renderWithSalt } from "../render";

const {
  Default,
  ControlledFormatting,
  MinAndMaxValue,
  ButtonAdornment,
  ReadOnly,
  UncontrolledFormatting,
} = composeStories(numberInputStories);

const input = () => page.getByRole("spinbutton");

function button(kind: "increment" | "decrement") {
  const element = document.querySelector<HTMLElement>(
    `.saltNumberInput-${kind}`,
  );
  if (!element) throw new Error(`${kind} button missing`);
  return page.elementLocator(element);
}

async function typeValue(value: string) {
  await input().click();
  await input().fill("");
  if (value) await userEvent.keyboard(value);
}

describe("Number Input", () => {
  it("renders its input and step buttons", async () => {
    await renderWithSalt(<Default />);
    await expect.element(input()).toHaveValue("");
    await expect.element(button("increment")).toBeInTheDocument();
    await expect.element(button("decrement")).toBeInTheDocument();
  });

  it.each([
    ["increment", "2"],
    ["decrement", "-2"],
  ] as const)("%ss through button clicks", async (kind, value) => {
    await renderWithSalt(<Default />);
    await button(kind).click();
    await button(kind).click();
    await expect.element(input()).toHaveValue(value);
  });

  it.each(["mouse", "touch"] as const)(
    "repeats increment while held with a %s pointer and stops on release",
    async (pointerType) => {
      await renderWithSalt(<Default />);
      const increment = button("increment").element();
      increment.dispatchEvent(
        new PointerEvent("pointerdown", {
          bubbles: true,
          button: 0,
          pointerType,
        }),
      );
      await new Promise((resolve) => setTimeout(resolve, 700));
      increment.dispatchEvent(
        new PointerEvent("pointerup", {
          bubbles: true,
          button: 0,
          pointerType,
        }),
      );
      const valueAfterRelease = Number(
        (input().element() as HTMLInputElement).value,
      );
      expect(valueAfterRelease).toBeGreaterThan(1);
      await new Promise((resolve) => setTimeout(resolve, 300));
      await expect.element(input()).toHaveValue(String(valueAfterRelease));
    },
  );

  it.each([
    ["increment", "42", (): string => "42"],
    ["decrement", "24", (): string => "24"],
  ] as const)(
    "supports a custom %s function",
    async (kind, value, operation) => {
      const callback = vi.fn(operation);
      await renderWithSalt(<Default {...{ [kind]: callback }} />);
      await button(kind).click();
      expect(callback).toHaveBeenCalled();
      await expect.element(input()).toHaveValue(value);
    },
  );

  it.each([
    ["", "increment", "1"],
    ["", "decrement", "-1"],
    ["-", "increment", "1"],
    ["-", "decrement", "-1"],
  ] as const)("steps from '%s' with %s", async (initial, kind, value) => {
    await renderWithSalt(<Default />);
    await typeValue(initial);
    await button(kind).click();
    await expect.element(input()).toHaveValue(value);
  });

  it.each([
    [10, 10, "increment", "20"],
    [3.14, 0.01, "increment", "3.15"],
    [0, 10, "decrement", "-10"],
    [0, 0.01, "decrement", "-0.01"],
  ] as const)(
    "steps %s by %s with %s",
    async (defaultValue, step, kind, value) => {
      await renderWithSalt(<Default defaultValue={defaultValue} step={step} />);
      await button(kind).click();
      await expect.element(input()).toHaveValue(value);
    },
  );

  it("supports keyboard steps, multipliers, and bounds", async () => {
    await renderWithSalt(
      <Default
        defaultValue={10}
        step={10}
        stepMultiplier={10}
        min={-2000}
        max={2000}
      />,
    );
    input().element().focus();
    for (const [key, value] of [
      ["{ArrowUp}", "20"],
      ["{PageUp}", "120"],
      ["{Shift>}{ArrowUp}{/Shift}", "220"],
      ["{End}", "2000"],
      ["{Home}", "-2000"],
    ] as const) {
      await userEvent.keyboard(key);
      await expect.element(input()).toHaveValue(value);
    }
  });

  it.each([
    [9, "increment", 10],
    [1, "decrement", 0],
  ] as const)("disables %s at its bound", async (defaultValue, kind, bound) => {
    await renderWithSalt(
      <Default
        defaultValue={defaultValue}
        {...(kind === "increment" ? { max: bound } : { min: bound })}
      />,
    );
    await button(kind).click();
    await expect.element(input()).toHaveValue(String(bound));
    await expect.element(button(kind)).toBeDisabled();
  });

  it.each([
    [16, "decrement", 1, "15", 15],
    [-109.46, "increment", 0.02, "-109.44", -109.44],
  ] as const)(
    "reports string and numeric values when stepping",
    async (defaultValue, kind, step, text, number) => {
      const onChange = vi.fn();
      const onNumberChange = vi.fn();
      await renderWithSalt(
        <Default
          defaultValue={defaultValue}
          step={step}
          onChange={onChange}
          onNumberChange={onNumberChange}
        />,
      );
      await button(kind).click();
      expect(onChange.mock.lastCall?.[1]).toBe(text);
      expect(onNumberChange.mock.lastCall?.[1]).toBe(number);
    },
  );

  it("sanitizes typed input", async () => {
    await renderWithSalt(<Default />);
    await typeValue("abc-12.3.+-def");
    await expect.element(input()).toHaveValue("-12.3");
  });

  it("accepts maximum and minimum safe integers", async () => {
    await renderWithSalt(<Default />);
    for (const value of [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER]) {
      await typeValue(String(value));
      await expect.element(input()).toHaveValue(String(value));
    }
  });

  it("prevents stepping beyond safe integers", async () => {
    await renderWithSalt(<Default defaultValue={Number.MAX_SAFE_INTEGER} />);
    await expect.element(button("increment")).toBeDisabled();
    await renderWithSalt(<Default defaultValue={Number.MIN_SAFE_INTEGER} />);
    await expect.element(button("decrement")).toBeDisabled();
  });

  it("is disabled as a whole", async () => {
    await renderWithSalt(<Default disabled />);
    await expect.element(input()).toBeDisabled();
    await expect.element(button("increment")).toBeDisabled();
    await expect.element(button("decrement")).toBeDisabled();
  });

  it("keeps a controlled value while reporting proposed changes", async () => {
    const onChange = vi.fn();
    await renderWithSalt(<Default value="5" onChange={onChange} />);
    await button("increment").click();
    await expect.element(input()).toHaveValue("5");
    expect(onChange.mock.lastCall?.[1]).toBe("6");
  });

  it("preserves deliberately invalid controlled and default values", async () => {
    await renderWithSalt(<Default defaultValue="abc-12.3.+-def" />);
    await expect.element(input()).toHaveValue("abc-12.3.+-def");
    const onChange = vi.fn();
    await renderWithSalt(
      <Default value="abc-12.3.+-def" onChange={onChange} />,
    );
    await button("decrement").click();
    await expect.element(input()).toHaveValue("abc-12.3.+-def");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("resets the ButtonAdornment example", async () => {
    await renderWithSalt(<ButtonAdornment />);
    input().element().focus();
    await userEvent.keyboard("{ArrowUp}");
    await expect.element(input()).toHaveValue("11");
    await page
      .getByRole("button", { name: "Reset Number input with adornment" })
      .click();
    await expect.element(input()).toHaveValue("10");
  });

  it("allows out-of-range input when clamp is false", async () => {
    await renderWithSalt(<MinAndMaxValue />);
    input().element().focus();
    await userEvent.keyboard("2");
    await userEvent.tab();
    await expect.element(input()).toHaveValue("22");
    await expect.element(button("increment")).toBeDisabled();
    await expect
      .element(page.getByTestId("ErrorSolidIcon"))
      .toBeInTheDocument();
  });

  it.each([
    [60, 50, undefined, "50"],
    [-10, undefined, 0, "0"],
  ] as const)(
    "clamps default values to bounds",
    async (value, max, min, text) => {
      await renderWithSalt(
        <Default defaultValue={value} max={max} min={min} clamp />,
      );
      await expect.element(input()).toHaveValue(text);
    },
  );

  it("clamps typed values on blur and steps from the clamped result", async () => {
    const onNumberChange = vi.fn();
    await renderWithSalt(
      <Default min={10} max={100} clamp onNumberChange={onNumberChange} />,
    );
    await typeValue("10000000");
    await userEvent.tab();
    await expect.element(input()).toHaveValue("100");
    expect(onNumberChange.mock.lastCall?.[1]).toBe(100);
    await button("decrement").click();
    await expect.element(input()).toHaveValue("99");
    await typeValue("1");
    await userEvent.tab();
    await expect.element(input()).toHaveValue("10");
    await button("increment").click();
    await expect.element(input()).toHaveValue("11");
  });

  it("hides its step buttons", async () => {
    await renderWithSalt(<Default hideButtons />);
    await expect.element(button("increment")).not.toBeVisible();
    await expect.element(button("decrement")).not.toBeVisible();
  });

  describe("formatting", () => {
    it("formats and edits a controlled value", async () => {
      await renderWithSalt(<ControlledFormatting />);
      await expect.element(input()).toHaveValue("100K");
      input().element().focus();
      await userEvent.keyboard("{ArrowUp}");
      await expect.element(input()).toHaveValue("101K");
      await button("decrement").click();
      await expect.element(input()).toHaveValue("100K");
      await input().fill("250000");
      await userEvent.tab();
      await expect.element(input()).toHaveValue("250K");
    });

    it("updates formatted values externally", async () => {
      await renderWithSalt(<ControlledFormatting />);
      const buttons = page.getByRole("button");
      await buttons.nth(0).click();
      await expect.element(input()).toHaveValue("123.456K");
      await buttons.nth(1).click();
      await expect.element(input()).toHaveValue("123.556K");
      await buttons.nth(2).click();
      await expect.element(input()).toHaveValue("");
    });

    it("renders all uncontrolled format examples", async () => {
      await renderWithSalt(<UncontrolledFormatting />);
      const inputs = page.getByRole("spinbutton");
      for (const [index, value] of [
        "12%",
        "1,000,000",
        "10.5",
        "10.24",
      ].entries())
        await expect.element(inputs.nth(index)).toHaveValue(value);
    });

    it("increments parsed suffix values and reports numeric values", async () => {
      const onChange = vi.fn();
      const onNumberChange = vi.fn();
      const props: NumberInputProps = {
        defaultValue: 12,
        format: (value) => `${value}%`,
        parse: (value) =>
          value.length ? Number.parseFloat(value.replace(/%/g, "")) : null,
        onChange,
        onNumberChange,
      };
      await renderWithSalt(<Default {...props} />);
      await button("increment").click();
      await button("increment").click();
      await expect.element(input()).toHaveValue("14%");
      expect(onChange.mock.lastCall?.[1]).toBe("14%");
      expect(onNumberChange.mock.lastCall?.[1]).toBe(14);
    });
  });

  describe("decimal scale", () => {
    it.each([
      [3.145, 2, "3.15"],
      [-12.3324, 3, "-12.332"],
      [-5.8, 3, "-5.800"],
      [12.1111, 2, "12.11"],
    ])("formats %s at scale %s", async (defaultValue, decimalScale, value) => {
      await renderWithSalt(
        <Default defaultValue={defaultValue} decimalScale={decimalScale} />,
      );
      await expect.element(input()).toHaveValue(value);
      input().element().focus();
      await userEvent.tab();
      await expect.element(input()).toHaveValue(value);
    });

    it.each([".", "-"])(
      "normalizes lone '%s' to zero on blur",
      async (value) => {
        await renderWithSalt(<Default />);
        await typeValue(value);
        await userEvent.tab();
        await expect.element(input()).toHaveValue("0");
      },
    );
  });

  describe("read-only", () => {
    it.each([
      [undefined, undefined, "—"],
      ["", undefined, "—"],
      [undefined, "#", "#"],
    ] as const)(
      "shows its empty marker",
      async (defaultValue, marker, value) => {
        await renderWithSalt(
          <ReadOnly
            defaultValue={defaultValue}
            readOnly
            emptyReadOnlyMarker={marker}
          />,
        );
        await expect.element(page.getByRole("textbox")).toHaveValue(value);
        await expect
          .element(page.getByRole("textbox"))
          .toHaveAttribute("readonly");
      },
    );

    it("keeps its formatted value through focus and blur", async () => {
      await renderWithSalt(<ReadOnly decimalScale={2} />);
      const textbox = page.getByRole("textbox");
      textbox.element().focus();
      await expect.element(textbox).toHaveValue("5.00");
      await userEvent.tab();
      await expect.element(textbox).toHaveValue("5.00");
    });
  });

  it.each([
    ["disabled", "Disabled form field", "disabled", true],
    ["required", "Form Field (Required)", "required", true],
    ["asterisk", "Form Field *", "required", true],
    ["optional", "Form Field (Optional)", "required", false],
    ["readOnly", "Readonly form field", "readonly", true],
  ] as const)(
    "inherits %s FormField state",
    async (state, label, attribute, present) => {
      const formFieldProps =
        state === "disabled"
          ? { disabled: true }
          : state === "readOnly"
            ? { readOnly: true }
            : { necessity: state as "required" | "asterisk" | "optional" };
      await renderWithSalt(
        <FormField {...formFieldProps}>
          <FormFieldLabel>
            {label.split(" (")[0].replace(" *", "")}
          </FormFieldLabel>
          <NumberInput />
        </FormField>,
      );
      const field = page.getByLabelText(label);
      if (present) await expect.element(field).toHaveAttribute(attribute);
      else await expect.element(field).not.toHaveAttribute(attribute);
    },
  );

  it("applies name with inputProps taking precedence", async () => {
    await renderWithSalt(
      <Default name="quantity" inputProps={{ name: "override" }} />,
    );
    await expect.element(input()).toHaveAttribute("name", "override");
  });
});
