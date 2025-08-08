import {
  Button,
  FlexLayout,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  StackLayout,
  useId,
} from "@salt-ds/core";
import { AddIcon, RefreshIcon, RemoveIcon } from "@salt-ds/icons";
import { NumberInput, type NumberInputProps } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { toFloat } from "packages/core/src/slider/internal/utils";
import { useState } from "react";

export default {
  title: "Lab/Number Input",
  component: NumberInput,
} as Meta<typeof NumberInput>;

const Template: StoryFn = ({ ...args }) => {
  return (
    <FormField>
      <FormFieldLabel>Number input</FormFieldLabel>
      <NumberInput {...args} />
      <FormFieldHelperText>Please enter a number</FormFieldHelperText>
    </FormField>
  );
};

export const Default = Template.bind({});

export const Bordered = Template.bind({});

Bordered.args = {
  bordered: true,
  defaultValue: 0,
};

export const Secondary = Template.bind({});

Secondary.args = {
  defaultValue: 0,
  variant: "secondary",
};

export const ReadOnly = Template.bind({});

ReadOnly.args = {
  readOnly: true,
  defaultValue: 5,
};

export const EmptyReadOnlyMarker: StoryFn<typeof NumberInput> = (args) => {
  return (
    <StackLayout gap={4}>
      <FormField>
        <FormFieldLabel>Read-only</FormFieldLabel>
        <NumberInput readOnly {...args} />
      </FormField>
      <FormField>
        <FormFieldLabel>Read-only with custom marker</FormFieldLabel>
        <NumberInput readOnly emptyReadOnlyMarker="*" {...args} />
      </FormField>
    </StackLayout>
  );
};

export const Disabled = Template.bind({});

Disabled.args = {
  disabled: true,
  defaultValue: 5,
};

export const Validation: StoryFn<typeof NumberInput> = (args) => {
  return (
    <StackLayout>
      <FormField validationStatus="error">
        <FormFieldLabel>Error</FormFieldLabel>
        <NumberInput defaultValue={0} {...args} />
      </FormField>
      <FormField validationStatus="warning">
        <FormFieldLabel>Warning</FormFieldLabel>
        <NumberInput defaultValue={0} {...args} />
      </FormField>
      <FormField validationStatus="success">
        <FormFieldLabel>Success</FormFieldLabel>
        <NumberInput defaultValue={0} {...args} />
      </FormField>
    </StackLayout>
  );
};

export const DecimalPlaces = Template.bind({});

DecimalPlaces.args = {
  defaultValue: 0,
  decimalScale: 2,
  fixedDecimalScale: true,
};

const accessibleTextStyles = {
  position: "fixed",
  top: "0",
  left: "0",
  transform: "translate(-100%, -100%)",
} as React.CSSProperties;

export const Controlled: StoryFn<NumberInputProps> = (args) => {
  const [value, setValue] = useState(1.25);
  const [accessibleText, setAccessibleText] = useState("");

  const formFieldLabel = "Number input";
  const accessibleTextId = useId();

  const clearAccessibleText = () =>
    setTimeout(() => {
      setAccessibleText(" ");
    }, 3000);

  return (
    <FormField>
      <FormFieldLabel>{formFieldLabel}</FormFieldLabel>
      <NumberInput
        {...args}
        decimalScale={2}
        clamp
        value={value}
        onChange={(_event, value) => {
          setValue(value);
        }}
        endAdornment={
          <>
            <Button
              aria-describedby={accessibleTextId}
              variant="secondary"
              aria-label={`Reset ${formFieldLabel}`}
              onClick={() => {
                setValue(1.11);
                setAccessibleText(`${formFieldLabel} value was reset to 1.11`);
                clearAccessibleText();
              }}
            >
              <RefreshIcon aria-hidden />
            </Button>
            <span
              id={accessibleTextId}
              style={accessibleTextStyles}
              aria-live="polite"
            >
              {accessibleText}
            </span>
          </>
        }
      />
      <FormFieldHelperText>
        The number input value is: {value}
      </FormFieldHelperText>
    </FormField>
  );
};

export const MinAndMaxValue: StoryFn<NumberInputProps> = (args) => {
  const [value, setValue] = useState(2);
  const [accessibleText, setAccessibleText] = useState("");
  const accessibleTextId = useId();
  const max = 5;
  const min = 0;

  const clearAccessibleText = () => {
    setTimeout(() => {
      setAccessibleText("");
    }, 3000);
  };

  const getValidationStatus = () => {
    if (value > max || value < min) {
      return "error";
    }
    return undefined;
  };

  return (
    <FormField validationStatus={getValidationStatus()}>
      <FormFieldLabel>Number input</FormFieldLabel>
      <NumberInput
        {...args}
        value={value}
        onChange={(_event, value) => {
          setValue(value);
          if (value > max || value < min) {
            setAccessibleText(
              `Invalid value, please enter a value between ${min} and ${max}`,
            );
            clearAccessibleText();
          }
        }}
        max={max}
        min={min}
        style={{ width: "250px" }}
      />
      <span
        id={accessibleTextId}
        style={accessibleTextStyles}
        aria-live="polite"
      >
        {accessibleText}
      </span>
      <FormFieldHelperText>
        Please enter a value between {min} and {max}
      </FormFieldHelperText>
    </FormField>
  );
};

export const Clamping: StoryFn<NumberInputProps> = (args) => {
  const [value, setValue] = useState(2);
  const [accessibleText, setAccessibleText] = useState("");
  const accessibleTextId = useId();
  const max = 5;
  const min = 0;

  const clearAccessibleText = () => {
    setTimeout(() => {
      setAccessibleText("");
    }, 3000);
  };

  return (
    <StackLayout>
      <FormField>
        <FormFieldLabel>With clamping</FormFieldLabel>
        <NumberInput
          {...args}
          value={value}
          onChange={(_, value) => {
            setValue(value);
            if (value > max) {
              setAccessibleText(`${value} is greater than the maximum value`);
            } else if (value < min) {
              setAccessibleText(`${value} is less than the minimum value`);
            } else if (value === min) {
              setAccessibleText("Minimum value reached");
            } else if (value === max) {
              setAccessibleText("Maximum value reached");
            }
            clearAccessibleText();
          }}
          clamp
          max={max}
          min={min}
          style={{ width: "250px" }}
          inputProps={{
            onBlur: () => {
              if (value > max) {
                setAccessibleText(
                  `${value} is greater than the maximum value, value was set to ${max}`,
                );
              } else if (value < min) {
                setAccessibleText(
                  `${value} is less than the minimum value, value was set to ${min}`,
                );
              }
              clearAccessibleText();
            },
          }}
        />
        <span
          id={accessibleTextId}
          style={accessibleTextStyles}
          aria-live="polite"
        >
          {accessibleText}
        </span>
        <FormFieldHelperText>
          Please enter a value between {min} and {max}.
        </FormFieldHelperText>
      </FormField>
    </StackLayout>
  );
};

export const CustomStep: StoryFn<NumberInputProps> = (args) => {
  return (
    <FormField>
      <FormFieldLabel>Number input</FormFieldLabel>
      <NumberInput {...args} />
      <FormFieldHelperText>
        Custom step 5 and step multiplier 10
      </FormFieldHelperText>
    </FormField>
  );
};
CustomStep.args = {
  defaultValue: 1,
  step: 5,
  stepMultiplier: 10,
};

export const TextAlignment: StoryFn<NumberInputProps> = (args) => (
  <StackLayout>
    <FormField>
      <FormFieldLabel>Left aligned</FormFieldLabel>
      <NumberInput textAlign="left" {...args} />
      <FormFieldHelperText>Please enter a number</FormFieldHelperText>
    </FormField>
    <FormField>
      <FormFieldLabel>Center aligned</FormFieldLabel>
      <NumberInput textAlign="center" {...args} />
      <FormFieldHelperText>Please enter a number</FormFieldHelperText>
    </FormField>
    <FormField>
      <FormFieldLabel>Right aligned</FormFieldLabel>
      <NumberInput textAlign="right" {...args} />
      <FormFieldHelperText>Please enter a number</FormFieldHelperText>
    </FormField>
  </StackLayout>
);
TextAlignment.args = {
  defaultValue: 0,
};

export const ButtonAdornment: StoryFn<NumberInputProps> = (args) => {
  const [value, setValue] = useState(10);
  const [accessibleText, setAccessibleText] = useState("");

  const formFieldLabel = "Number Input";
  const accessibleTextId = useId();

  const clearAccessibleText = () =>
    setTimeout(() => {
      setAccessibleText("");
    }, 3000);

  return (
    <FormField>
      <FormFieldLabel>{formFieldLabel}</FormFieldLabel>
      <NumberInput
        {...args}
        value={value}
        onChange={(_event, value) => {
          setValue(value);
        }}
        endAdornment={
          <>
            <Button
              aria-describedby={accessibleTextId}
              variant="secondary"
              aria-label={`Reset ${formFieldLabel}`}
              onClick={() => {
                setValue(10);
                setAccessibleText(`${formFieldLabel} value was reset to 10`);
                clearAccessibleText();
              }}
            >
              <RefreshIcon aria-hidden />
            </Button>
            <span
              id={accessibleTextId}
              style={accessibleTextStyles}
              aria-live="polite"
            >
              {accessibleText}
            </span>
          </>
        }
      />
      <FormFieldHelperText>Please enter a value</FormFieldHelperText>
    </FormField>
  );
};

export const CustomButtons: StoryFn<NumberInputProps> = (args) => {
  const [value, setValue] = useState(10);

  return (
    <FormField>
      <FormFieldLabel>Number Input</FormFieldLabel>
      <NumberInput
        {...args}
        hideButtons
        onChange={(_event, value) => {
          setValue(value);
        }}
        value={value}
        startAdornment={
          <Button aria-hidden tabIndex={-1} onClick={() => setValue(value - 1)}>
            <RemoveIcon aria-hidden />
          </Button>
        }
        endAdornment={
          <Button aria-hidden tabIndex={-1} onClick={() => setValue(value + 1)}>
            <AddIcon aria-hidden />
          </Button>
        }
      />
      <FormFieldHelperText>Please enter a value</FormFieldHelperText>
    </FormField>
  );
};

CustomButtons.args = {
  textAlign: "center",
};

export const HiddenButtons = Template.bind({});
HiddenButtons.args = {
  hideButtons: true,
  defaultValue: 0,
};

export const ControlledFormatting: StoryFn<NumberInputProps> = (args) => {
  const [value, setValue] = useState(100000);
  return (
    <StackLayout gap={2}>
      <FormField>
        <FormFieldLabel>With compact notation, controlled</FormFieldLabel>
        <NumberInput
          {...args}
          value={value}
          onChange={(e, value) => {
            setValue(value);
          }}
          format={(value) => {
            const formattedValue = new Intl.NumberFormat("en-GB", {
              notation: "compact",
              compactDisplay: "short",
              maximumFractionDigits: 3,
            }).format(toFloat(value));
            return formattedValue;
          }}
          step={1000}
          parse={(value) => {
            const match = value.match(/^(\d+(\.\d*)?)([kKmMbBtT]?)$/);
            if (!match) return;

            const [_, num, , unit] = match;
            const multiplier =
              { k: 1e3, m: 1e6, b: 1e9, t: 1e12 }[unit.toLowerCase()] || 1;
            return toFloat(Number.parseFloat(num) * multiplier);
          }}
        />
      </FormField>
      <FlexLayout>
        <Button onClick={() => setValue(123456)}>Set value to 123456</Button>
        <Button onClick={() => setValue(value + 100)}>Increment by 100</Button>
        <Button onClick={() => setValue(0)}>Clear</Button>
      </FlexLayout>
    </StackLayout>
  );
};

export const UncontrolledFormatting: StoryFn<NumberInputProps> = (args) => {
  return (
    <StackLayout>
      <FormField>
        <FormFieldLabel>
          With custom format function and clamping
        </FormFieldLabel>
        <NumberInput
          {...args}
          defaultValue={12}
          max={100}
          clamp
          format={(value) => `${value}%`}
          parse={(value) => {
            const match = value.match(/^\d*(\.\d*)?%?$/);
            if (!match) return;

            return toFloat(value.replace(/%/g, ""));
          }}
        />
      </FormField>
      <FormField>
        <FormFieldLabel>With Intl Number Format</FormFieldLabel>
        <NumberInput
          defaultValue={1000000}
          format={(value) => {
            return new Intl.NumberFormat("en-GB").format(value);
          }}
          parse={(value) => {
            const match = value.match(/^[\d,.-]*$/);
            if (!match) return;

            return toFloat(value.replace(/,/g, ""));
          }}
        />
      </FormField>
      <FormField>
        <FormFieldLabel>With Intl Number Format</FormFieldLabel>
        <NumberInput
          defaultValue={10.5}
          format={(value) => {
            return new Intl.NumberFormat("en-GB", {
              maximumFractionDigits: 2,
              minimumFractionDigits: 1,
            }).format(toFloat(value));
          }}
          step={0.1}
        />
      </FormField>
      <FormField>
        <FormFieldLabel>With step 0.1, fixed decimal scale 2</FormFieldLabel>
        <NumberInput
          fixedDecimalScale
          defaultValue={10.236}
          decimalScale={2}
          step={0.1}
        />
      </FormField>
    </StackLayout>
  );
};
