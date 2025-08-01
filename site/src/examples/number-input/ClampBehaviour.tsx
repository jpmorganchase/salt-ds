import {
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  StackLayout,
  useId,
} from "@salt-ds/core";
import { NumberInput } from "@salt-ds/lab";
import { useState } from "react";

const accessibleTextStyles = {
  position: "fixed",
  top: "0",
  left: "0",
  transform: "translate(-100%, -100%)",
} as React.CSSProperties;

export const ClampBehaviour = () => {
  const [value, setValue] = useState(2);
  const [accessibleText, setAccessibleText] = useState("");
  const accessibleTextId = useId();
  const max = 10;
  const min = 0;

  const clearAccessibleText = () =>
    setTimeout(() => {
      setAccessibleText(" ");
    }, 3000);

  return (
    <StackLayout style={{ width: "256px" }}>
      <FormField>
        <FormFieldLabel>Number input with clamped range</FormFieldLabel>
        <NumberInput
          value={value}
          onChange={(_, value) => setValue(value)}
          min={min}
          max={max}
          clamp
          inputProps={{
            onBlur: () => {
              const clampedValue = Math.min(Math.max(value, min), max);
              setAccessibleText(`Value adjusted to ${clampedValue}`);
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
          Please enter a value between {min} and {max}
        </FormFieldHelperText>
      </FormField>
    </StackLayout>
  );
};
