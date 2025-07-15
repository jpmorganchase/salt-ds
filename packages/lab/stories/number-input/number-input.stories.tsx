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
                setAccessibleText("Value was reset");
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
  const max = 5;
  const min = 0;

  const getValidationStatus = () => {
    if (typeof value === "number") {
      if (value > max || value < min) {
        return "error";
      }
    } else {
      const numericValue = Number.parseFloat(value);
      if (numericValue > max || numericValue < min) {
        return "error";
      }
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
  const [value, setValue] = useState(2);
  const max = 5;
  const min = 0;

  const getValidationStatus = () => {
    if (typeof value === "number") {
      if (value > max || value < min) {
        return "error";
      }
    } else {
      const numericValue = Number.parseFloat(value);
      if (numericValue > max || numericValue < min) {
        return "error";
      }
    }
    return undefined;
  };

  return (
    <StackLayout>
      <FormField validationStatus={getValidationStatus()}>
        <FormFieldLabel>No clamping</FormFieldLabel>
        <NumberInput
          {...args}
          value={value}
          onChange={(_event, value) => {
            setValue(value);
          }}
          max={max}
          min={min}
          style={{ width: "250px" }}
        />
        <FormFieldHelperText>
          Please enter a value between {min} and {max}
        </FormFieldHelperText>
      </FormField>
      <FormField>
        <FormFieldLabel>With clamping</FormFieldLabel>
        <NumberInput
          {...args}
          defaultValue={2}
          clamp
          max={max}
          min={min}
          style={{ width: "250px" }}
        />
        <FormFieldHelperText>
          Please enter a value between {min} and {max}
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

export const ResetAdornment: StoryFn<NumberInputProps> = (args) => {
  const [value, setValue] = useState(10);
  const [accessibleText, setAccessibleText] = useState("");

  const formFieldLabel = "Number Input";
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
                setAccessibleText("Value was reset");
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
          <Button
            aria-hidden
            tabIndex={-1}
            onClick={() =>
              setValue(
                typeof value === "string"
                  ? Number.parseFloat(value) - 1
                  : value - 1,
              )
            }
          >
            <RemoveIcon aria-hidden />
          </Button>
        }
        endAdornment={
          <Button
            aria-hidden
            tabIndex={-1}
            onClick={() =>
              setValue(
                typeof value === "string"
                  ? Number.parseFloat(value) + 1
                  : value + 1,
              )
            }
          >
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
    <StackLayout>
      <FormField>
        <FormFieldLabel>With compact notation, controlled</FormFieldLabel>
        <NumberInput
          {...args}
          value={value}
          onChange={(e, value) => {
            setValue(value);
            console.log("on change value", value);
          }}
          onValueChange={(value) => console.log("onValueChange", value)}
          format={(value) => {
            const formattedValue = new Intl.NumberFormat("en-GB", {
              notation: "compact",
              compactDisplay: "short",
              maximumFractionDigits: 3,
            }).format(toFloat(value));
            return formattedValue;
          }}
          parse={(value) => {
            const match = String(value).match(/^(\d+(\.\d*)?)([kKmMbB]?)$/);
            if (!match) return toFloat(value);

            const [_, num, , unit] = match;
            const multiplier =
              { k: 1e3, m: 1e6, b: 1e9 }[unit.toLowerCase()] || 1;
            return toFloat(Number.parseFloat(num) * multiplier);
          }}
          isAllowed={(value) => {
            const validInputRegex = /^[\d,\.]+[kKmMbB]?$/;
            const isValid = validInputRegex.test(value);
            return isValid;
          }}
        />
        <FormFieldHelperText>
          Number input's value is {value}
        </FormFieldHelperText>
        <FlexLayout>
          <Button onClick={() => setValue(123456)}>Set value to 123456</Button>
          <Button onClick={() => setValue(value + 100)}>
            Increment by 100
          </Button>
          <Button onClick={() => setValue(0)}>Clear</Button>
        </FlexLayout>
      </FormField>
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
          format={(value) => `${value}%`}
          max={100}
          clamp
          parse={(value) => {
            return toFloat(String(value).replace(/%/g, ""));
          }}
        />
        <FormFieldHelperText>Please enter a number</FormFieldHelperText>
      </FormField>
      <FormField>
        <FormFieldLabel>With Intl Number Format</FormFieldLabel>
        <NumberInput
          defaultValue={1000000}
          format={(value) => {
            return new Intl.NumberFormat("en-GB").format(toFloat(value));
          }}
          parse={(value) => {
            const stringValue =
              typeof value === "number" ? value.toString() : value;
            return toFloat(stringValue.replace(/,/g, ""));
          }}
          onChange={(e, val) => console.log("val on change", val)}
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

