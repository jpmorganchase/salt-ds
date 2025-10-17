import {
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  useAriaAnnouncer,
} from "@salt-ds/core";
import { NumberInput } from "@salt-ds/lab";
import { useEffect, useState } from "react";

export const ClampBehavior = () => {
  const [value, setValue] = useState<string>("2");
  const [focused, setFocused] = useState(false);

  const { announce } = useAriaAnnouncer();

  const max = 5;
  const min = 0;

  const handleBlur = () => {
    const numValue = Number(value);
    setFocused(false);
    if (numValue > max) {
      announce(
        `${numValue} is greater than the maximum value, value was set to ${max}`,
        1000,
      );
    } else if (numValue < min) {
      announce(
        `${numValue} is less than the minimum value, value was set to ${min}`,
        1000,
      );
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
  }, [announce, value, focused]);

  return (
    <FormField style={{ width: "256px" }}>
      <FormFieldLabel>Number input with clamped range</FormFieldLabel>
      <NumberInput
        value={value}
        onChange={(_event, newValue) => {
          setValue(newValue);
        }}
        onNumberChange={(_event, newValue) => {
          console.log(`Number changed to ${newValue}`);
        }}
        clamp
        max={max}
        min={min}
        inputProps={{
          onBlur: handleBlur,
          onFocus: handleFocus,
        }}
      />
      <FormFieldHelperText>
        Please enter a value between {min} and {max}.
      </FormFieldHelperText>
    </FormField>
  );
};
