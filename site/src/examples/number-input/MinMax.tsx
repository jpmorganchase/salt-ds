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

export const MinMax = () => {
  const [value, setValue] = useState<number | string>(2);
  const [accessibleText, setAccessibleText] = useState("");
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

  const getValidationStatus = () => {
    if (typeof value === "number" && (value > max || value < min)) {
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
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setValue(event.target.value);
        }}
        onNumberChange={(newValue) => {
          console.log(`Number changed to ${newValue}`);
          setValue(newValue ?? "");
          if (newValue !== null && (newValue > max || newValue < min)) {
            setAccessibleText(
              `Invalid value, please enter a value between ${min} and ${max}`,
            );
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
