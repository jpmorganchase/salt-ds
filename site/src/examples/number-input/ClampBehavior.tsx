import {
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  useId,
} from "@salt-ds/core";
import { NumberInput } from "@salt-ds/lab";
import { type ChangeEvent, useEffect, useState } from "react";

const accessibleTextStyles = {
  position: "fixed",
  top: "0",
  left: "0",
  transform: "translate(-100%, -100%)",
} as React.CSSProperties;

export const ClampBehavior = () => {
  const [value, setValue] = useState<number | string>(2);
  const [accessibleText, setAccessibleText] = useState("");
  const [focused, setFocused] = useState(false);
  const accessibleTextId = useId();
  const max = 5;
  const min = 0;

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    if (accessibleText?.length) {
      timeoutId = setTimeout(() => {
        setAccessibleText("");
      }, 3000);
    }
    return () => clearTimeout(timeoutId);
  }, [accessibleText]);

  const handleBlur = () => {
    const numValue = Number(value);
    setFocused(false);
    if (numValue > max) {
      setAccessibleText(
        `${numValue} is greater than the maximum value, value was set to ${max}`,
      );
    } else if (numValue < min) {
      setAccessibleText(
        `${numValue} is less than the minimum value, value was set to ${min}`,
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
        setAccessibleText(`${value} is greater than the maximum value`);
      } else if (numValue < min) {
        setAccessibleText(`${value} is less than the minimum value`);
      } else if (numValue === min) {
        setAccessibleText("Minimum value reached");
      } else if (numValue === max) {
        setAccessibleText("Maximum value reached");
      }
    }
  }, [value, focused]);

  return (
    <FormField style={{ width: "256px" }}>
      <FormFieldLabel>Number input with clamped range</FormFieldLabel>
      <NumberInput
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setValue(event.target.value);
        }}
        onNumberChange={(newValue) => {
          console.log(`Number changed to ${newValue}`);
          setValue(newValue ?? "");
        }}
        clamp
        max={max}
        min={min}
        style={{ width: "250px" }}
        inputProps={{
          onBlur: handleBlur,
          onFocus: handleFocus,
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
  );
};
