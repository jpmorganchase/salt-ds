import {
  Checkbox,
  CheckboxGroup,
  ComboBox,
  Dropdown,
  FormField,
  FormFieldLabel,
  Input,
  MultilineInput,
  NumberInput,
  Option,
  Pill,
  PillGroup,
  RadioButton,
  RadioButtonGroup,
  RangeSlider,
  Rating,
  Slider,
  Switch,
} from "@salt-ds/core";
import { type ReactNode, useState } from "react";
import { createPortal } from "react-dom";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi,
} from "vitest";
import { page } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";

const ariaLabel = "Work email address";

function ignoredMessage(ariaLabel: string, label: string) {
  return `Salt: aria-label "${ariaLabel}" is ignored because FormFieldLabel "${label}" provides the accessible name. Use aria-labelledby to add to the name, or aria-describedby to add a description.`;
}

// Effects and the microtask that inspects the DOM have run by the next task.
function flushWarnings() {
  return new Promise((resolve) => setTimeout(resolve));
}

function ShadowHost({ children }: { children: ReactNode }) {
  const [shadowRoot, setShadowRoot] = useState<ShadowRoot | null>(null);
  return (
    <div
      ref={(element) => {
        if (element && !element.shadowRoot) {
          setShadowRoot(element.attachShadow({ mode: "open" }));
        }
      }}
    >
      {shadowRoot && createPortal(children, shadowRoot)}
    </div>
  );
}

describe("GIVEN a FormFieldLabel", () => {
  let consoleSpy: MockInstance<typeof console.warn>;
  const ignoredWarnings = () =>
    consoleSpy.mock.calls.filter(([message]) =>
      String(message).includes("is ignored because FormFieldLabel"),
    );

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  const controls: [string, ReactNode][] = [
    ["Input", <Input key="control" aria-label={ariaLabel} />],
    ["MultilineInput", <MultilineInput key="control" aria-label={ariaLabel} />],
    ["NumberInput", <NumberInput key="control" aria-label={ariaLabel} />],
    [
      "ComboBox",
      <ComboBox key="control" aria-label={ariaLabel}>
        <Option value="One" />
      </ComboBox>,
    ],
    [
      "Dropdown",
      <Dropdown key="control" aria-label={ariaLabel}>
        <Option value="One" />
      </Dropdown>,
    ],
    ["Checkbox", <Checkbox key="control" aria-label={ariaLabel} />],
    [
      "RadioButton",
      <RadioButton key="control" aria-label={ariaLabel} value="one" />,
    ],
    ["Switch", <Switch key="control" aria-label={ariaLabel} />],
    ["Slider", <Slider key="control" aria-label={ariaLabel} />],
    ["RangeSlider", <RangeSlider key="control" aria-label={ariaLabel} />],
    ["Rating", <Rating key="control" aria-label={ariaLabel} />],
    [
      "CheckboxGroup",
      <CheckboxGroup key="control" aria-label={ariaLabel}>
        <Checkbox label="One" value="one" />
      </CheckboxGroup>,
    ],
    [
      "RadioButtonGroup",
      <RadioButtonGroup key="control" aria-label={ariaLabel}>
        <RadioButton label="One" value="one" />
      </RadioButtonGroup>,
    ],
    [
      "PillGroup",
      <PillGroup key="control" aria-label={ariaLabel}>
        <Pill value="one">One</Pill>
      </PillGroup>,
    ],
  ];

  it.each(controls)(
    "WHEN %s has an aria-label THEN it warns that the aria-label is ignored",
    async (name, control) => {
      await renderWithSalt(
        <FormField>
          <FormFieldLabel>Email</FormFieldLabel>
          {control}
        </FormField>,
      );
      await expect.poll(ignoredWarnings).toEqual([
        [
          ignoredMessage(ariaLabel, "Email"),
          expect.any(HTMLElement),
          // RangeSlider puts the aria-label on both thumbs.
          ...(name === "RangeSlider" ? [expect.any(HTMLElement)] : []),
        ],
      ]);
    },
  );

  it("WHEN the aria-label repeats words from the label THEN it still warns", async () => {
    await renderWithSalt(
      <FormField>
        <FormFieldLabel>Work email address</FormFieldLabel>
        <Input aria-label="work email" />
      </FormField>,
    );
    await expect
      .poll(ignoredWarnings)
      .toEqual([
        [
          ignoredMessage("work email", "Work email address"),
          expect.any(HTMLElement),
        ],
      ]);
  });

  it("WHEN the control re-renders THEN it warns once", async () => {
    const { rerender } = await renderWithSalt(
      <FormField>
        <FormFieldLabel>Email</FormFieldLabel>
        <Input aria-label={ariaLabel} />
      </FormField>,
    );
    await expect.poll(ignoredWarnings).toHaveLength(1);
    await rerender(
      <FormField>
        <FormFieldLabel>Email</FormFieldLabel>
        <Input aria-label={ariaLabel} placeholder="name@example.com" />
      </FormField>,
    );
    await flushWarnings();
    expect(ignoredWarnings()).toHaveLength(1);
  });

  it("WHEN the aria-label isn't ignored THEN it doesn't warn", async () => {
    await renderWithSalt(
      <>
        <FormField>
          <Input aria-label={ariaLabel} />
        </FormField>
        <Input aria-label={ariaLabel} />
        <FormField>
          <FormFieldLabel>Email</FormFieldLabel>
          <CheckboxGroup>
            <Checkbox aria-label={ariaLabel} value="one" />
          </CheckboxGroup>
        </FormField>
        <FormField>
          <FormFieldLabel>State</FormFieldLabel>
          <ComboBox>
            <Option value="One" />
          </ComboBox>
        </FormField>
        <FormField id="self">
          <FormFieldLabel>Name</FormFieldLabel>
          <input
            id="self-input"
            aria-label="Full"
            aria-labelledby="label-self self-input"
          />
        </FormField>
        <FormField id="fallback">
          <FormFieldLabel>Trade date</FormFieldLabel>
          <input
            aria-label="date input"
            aria-labelledby="label-fallback"
            data-salt-aria-label-fallback
          />
        </FormField>
        <FormField id="same-text">
          <FormFieldLabel>Trade period</FormFieldLabel>
          <input
            aria-label="Start date"
            aria-labelledby="label-same-text start-label"
          />
          <span id="start-label">Start date</span>
        </FormField>
      </>,
    );
    await expect
      .element(page.getByRole("combobox", { name: "State" }))
      .toBeInTheDocument();
    await flushWarnings();
    expect(ignoredWarnings()).toHaveLength(0);
  });

  it("WHEN it's in a shadow root THEN it warns", async () => {
    await renderWithSalt(
      <ShadowHost>
        <FormField>
          <FormFieldLabel>Email</FormFieldLabel>
          <Input aria-label={ariaLabel} />
        </FormField>
      </ShadowHost>,
    );
    await expect.poll(ignoredWarnings).toHaveLength(1);
  });
});
