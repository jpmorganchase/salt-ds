import {
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
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

export const Limits = () => {
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
    <FormField
      validationStatus={getValidationStatus()}
      style={{ width: "256px" }}
    >
      <FormFieldLabel>Number input with limited range</FormFieldLabel>
      <NumberInput
        value={value}
        // TODO sort out the conditional events bleeding into public API
        onNumberChange={(_, value = 0) => {
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
