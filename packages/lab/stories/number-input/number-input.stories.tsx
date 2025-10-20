import {
  Button,
  FlexLayout,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  StackLayout, useAriaAnnouncer,
} from "@salt-ds/core";
import { AddIcon, RefreshIcon, RemoveIcon } from "@salt-ds/icons";
import { NumberInput, type NumberInputProps } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { type ChangeEvent, useEffect, useState } from "react";

export default {
  title: "Lab/Number Input",
  component: NumberInput,
} as Meta<typeof NumberInput>;

const Template: StoryFn = ({ ...args }) => {
  return (
    <FormField>
      <FormFieldLabel>Number input</FormFieldLabel>
      <NumberInput
        onNumberChange={(newValue) =>
          console.log(`Number changed to ${newValue}`)
        }
        {...args}
      />
      <FormFieldHelperText>Please enter a number</FormFieldHelperText>
    </FormField>
  );
};

export const Default = Template.bind({});

export const Bordered = Template.bind({});

Bordered.args = {
  bordered: true,
};

export const Secondary = Template.bind({});

Secondary.args = {
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
};

export const Controlled: StoryFn<NumberInputProps> = (args) => {
  const [value, setValue] = useState<number | string>(1.25);
  const { announce } = useAriaAnnouncer();

  const formFieldLabel = "Number input";

  return (
    <FormField>
      <FormFieldLabel>{formFieldLabel}</FormFieldLabel>
      <NumberInput
        {...args}
        clamp
        decimalScale={2}
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setValue(event.target.value);
        }}
        onNumberChange={(newValue) => {
          console.log(`Number changed to ${newValue}`);
          setValue(newValue ?? "");
        }}
        endAdornment={
            <Button
              appearance="solid"
              aria-label={`Reset ${formFieldLabel}`}
              onClick={() => {
                setValue(1.11);
                announce(`${formFieldLabel} value was reset to 1.11`, 1000);
              }}
            >
              <RefreshIcon aria-hidden />
            </Button>
        }
      />
    </FormField>
  );
};

export const MinAndMaxValue: StoryFn<NumberInputProps> = (args) => {
  const [value, setValue] = useState<number | string>(2);
  const { announce } = useAriaAnnouncer();
  const max = 5;
  const min = 0;

  const getValidationStatus = () => {
    if (typeof value === "number" && (value > max || value < min)) {
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
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setValue(event.target.value);
        }}
        onNumberChange={(newValue) => {
          console.log(`Number changed to ${newValue}`);
          setValue(newValue ?? "");
          if (newValue !== null && (newValue > max || newValue < min)) {
            announce(
              `Invalid value, please enter a value between ${min} and ${max}`,
            );
          }
        }}
        max={max}
        min={min}
        style={{ width: "250px" }}
      />
      <FormFieldHelperText>
        Please enter a value between {min} and {max}
      </FormFieldHelperText>
    </FormField>
  );
};

export const Clamping: StoryFn<NumberInputProps> = (args) => {
  const [value, setValue] = useState<number | string>(2);
  const { announce } = useAriaAnnouncer();
  const [focused, setFocused] = useState(false);
  const max = 5;
  const min = 0;

  const handleBlur = () => {
    const numValue = Number(value);
    setFocused(false);
    if (numValue > max) {
      announce(
        `${numValue} is greater than the maximum value, value was set to ${max}`,
      1000);
    } else if (numValue < min) {
      announce(
        `${numValue} is less than the minimum value, value was set to ${min}`,
      1000);
    }
  };

  const handleFocus = () => {
    setFocused(true);
  };

  useEffect(() => {
    if (focused) {
      const numValue = Number(value);
      if (numValue > max) {
        announce(`${value} is greater than the maximum value`, 1000);
      } else if (numValue < min) {
        announce(`${value} is less than the minimum value`, 1000);
      } else if (numValue === min) {
        announce("Minimum value reached", 1000);
      } else if (numValue === max) {
        announce("Maximum value reached", 1000);
      }
    }
  }, [value, focused]);

  return (
    <StackLayout>
      <FormField>
        <FormFieldLabel>Number input with clamped range</FormFieldLabel>
        <NumberInput
          {...args}
          value={value}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            setValue(event.target.value);
          }}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onNumberChange={(newValue) => {
            console.log(`Number changed to ${newValue}`);
            setValue(newValue ?? "");
          }}
          clamp
          max={max}
          min={min}
          style={{ width: "250px" }}
        />
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
      <FormFieldLabel>Number input with custom step</FormFieldLabel>
      <NumberInput
        onNumberChange={(newValue) =>
          console.log(`Number changed to ${newValue}`)
        }
        {...args}
      />
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
  const [value, setValue] = useState<number | string>(10);
  const { announce } = useAriaAnnouncer();

  const formFieldLabel = "Number input with adornment";

  return (
    <FormField>
      <FormFieldLabel>{formFieldLabel}</FormFieldLabel>
      <NumberInput
        {...args}
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setValue(event.target.value);
        }}
        onNumberChange={(newValue) => {
          console.log(`Number changed to ${newValue}`);
          setValue(newValue ?? "");
        }}
        endAdornment={
            <Button
              appearance="solid"
              aria-label={`Reset ${formFieldLabel}`}
              onClick={() => {
                setValue(10);
                announce(`${formFieldLabel} value was reset to 10`);
              }}
            >
              <RefreshIcon aria-hidden />
            </Button>
        }
      />
      <FormFieldHelperText>Please enter a value</FormFieldHelperText>
    </FormField>
  );
};

export const CustomButtons: StoryFn<NumberInputProps> = (args) => {
  const [value, setValue] = useState<number | string>(10);
  return (
    <FormField>
      <FormFieldLabel>Number input with custom buttons</FormFieldLabel>
      <NumberInput
        {...args}
        hideButtons
        textAlign={"center"}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setValue(event.target.value);
        }}
        onNumberChange={(newValue) => {
          console.log(`Number changed to ${newValue}`);
          setValue(newValue ?? "");
        }}
        value={value}
        startAdornment={
          <Button
            aria-hidden
            tabIndex={-1}
            onClick={() => setValue(Number(value) - 1)}
          >
            <RemoveIcon aria-hidden />
          </Button>
        }
        endAdornment={
          <Button
            aria-hidden
            tabIndex={-1}
            onClick={() => setValue(Number(value) + 1)}
          >
            <AddIcon aria-hidden />
          </Button>
        }
      />
      <FormFieldHelperText>Please enter a value</FormFieldHelperText>
    </FormField>
  );
};

export const HiddenButtons = Template.bind({});
HiddenButtons.args = {
  hideButtons: true,
  defaultValue: undefined,
};

export const ControlledFormatting: StoryFn<NumberInputProps> = (args) => {
  const [value, setValue] = useState<number | string>(100000);
  const validValue = /^[+-]?(\d+(\.\d*)?|\.\d+)([kKmMbBtT]?)$/;
  const parse = (raw: string) => {
    if (!raw.length) {
      return null;
    }
    const match = raw.match(validValue);
    if (!match) {
      return Number.NaN;
    }
    const [_, num, , unit] = match;
    const multiplier =
      { k: 1e3, m: 1e6, b: 1e9, t: 1e12 }[unit.toLowerCase() as string] || 1;
    return Number.parseFloat(num) * multiplier;
  };
  const parsedValue = typeof value !== "number" ? parse(value) : value;
  return (
    <StackLayout gap={2}>
      <FormField>
        <FormFieldLabel>Compact notation</FormFieldLabel>
        <NumberInput
          {...args}
          value={value}
          isAllowed={(inputValue) => validValue.test(inputValue)}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            setValue(event.target.value);
          }}
          onNumberChange={(newValue) => {
            console.log(`Number changed to ${newValue}`);
            setValue(newValue ?? "");
          }}
          format={(value) => {
            if (!value.length) {
              return value;
            }
            const floatValue = Number.parseFloat(value);
            if (Number.isNaN(floatValue)) {
              return value;
            }
            return new Intl.NumberFormat("en-US", {
              notation: "compact",
              compactDisplay: "short",
              maximumFractionDigits: 3,
            }).format(floatValue);
          }}
          step={1000}
          parse={parse}
        />
      </FormField>
      <FlexLayout>
        <Button onClick={() => setValue(123456)}>Set value to 123456</Button>
        <Button
          onClick={() =>
            setValue(
              parsedValue === null || Number.isNaN(parsedValue)
                ? 0
                : parsedValue + 100,
            )
          }
        >
          Increment by 100
        </Button>
        <Button onClick={() => setValue(0)}>Clear</Button>
      </FlexLayout>
    </StackLayout>
  );
};

export const UncontrolledFormatting: StoryFn<NumberInputProps> = (args) => {
  const isInternationalFormat = (inputValue: string): boolean =>
    /^[+-]?(\d{1,3}(,\d{0,3})*|\d*)(\.?\d*)?$/.test(inputValue);
  return (
    <StackLayout>
      <FormField>
        <FormFieldLabel>
          With custom format function and clamping
        </FormFieldLabel>
        <NumberInput
          {...args}
          defaultValue={12}
          isAllowed={(inputValue) =>
            /^[+-]?(\d+(\.\d*)?|\.\d+)%?$/.test(inputValue)
          }
          max={100}
          clamp
          format={(value) => `${value}%`}
          parse={(value) => {
            if (!value.length) {
              return null;
            }
            return Number.parseFloat(value.replace(/%/g, ""));
          }}
        />
      </FormField>
      <FormField>
        <FormFieldLabel>With Intl Number Format</FormFieldLabel>
        <NumberInput
          defaultValue={1000000}
          isAllowed={isInternationalFormat}
          format={(value) => {
            if (!value.length) {
              return value;
            }
            return new Intl.NumberFormat("en-US").format(
              Number.parseFloat(value.replace(/,/g, "")),
            );
          }}
          parse={(value) => {
            if (!value.length) {
              return null;
            }
            return Number.parseFloat(value.replace(/,/g, ""));
          }}
        />
      </FormField>
      <FormField>
        <FormFieldLabel>
          With Intl Number Format, with 2 decimal places
        </FormFieldLabel>
        <NumberInput
          defaultValue={10.5}
          isAllowed={isInternationalFormat}
          format={(value) => {
            if (!value.length) {
              return value;
            }
            return new Intl.NumberFormat("en-US", {
              maximumFractionDigits: 2,
              minimumFractionDigits: 1,
            }).format(Number.parseFloat(value.replace(/,/g, "")));
          }}
          parse={(value) => {
            if (!value.length) {
              return null;
            }
            return Number.parseFloat(value.replace(/,/g, ""));
          }}
          step={0.1}
        />
      </FormField>
      <FormField>
        <FormFieldLabel>With step 0.1, fixed decimal scale 2</FormFieldLabel>
        <NumberInput defaultValue={10.236} decimalScale={2} step={0.1} />
      </FormField>
    </StackLayout>
  );
};
