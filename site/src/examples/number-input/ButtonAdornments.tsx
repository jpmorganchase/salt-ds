import {
  Button,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  StackLayout,
  useId,
} from "@salt-ds/core";
import { toFloat } from "@salt-ds/core/src/slider/internal/utils";
import { AddIcon, RefreshIcon, RemoveIcon, SyncIcon } from "@salt-ds/icons";
import { NumberInput } from "@salt-ds/lab";
import { useEffect, useState } from "react";

const accessibleTextStyles = {
  position: "fixed",
  top: "0",
  left: "0",
  transform: "translate(-100%, -100%)",
} as React.CSSProperties;

const ResetAdornment = () => {
  const defaultValue = 1000;
  const [value, setValue] = useState(defaultValue);
  const [accessibleText, setAccessibleText] = useState("");

  const formFieldLabel = "Number input with reset adornment";
  const accessibleTextId = useId();

  const clearAccessibleText = () =>
    setTimeout(() => {
      setAccessibleText(" ");
    }, 3000);

  return (
    <FormField>
      <FormFieldLabel>{formFieldLabel}</FormFieldLabel>
      <NumberInput
        value={value}
        onChange={(_, newValue) => setValue(newValue)}
        step={5}
        stepMultiplier={10}
        endAdornment={
          <>
            <Button
              aria-describedby={accessibleTextId}
              aria-label={`Reset ${formFieldLabel}`}
              onClick={() => {
                setValue(defaultValue);
                setAccessibleText("Value was reset");
                clearAccessibleText();
              }}
              appearance="transparent"
            >
              <RefreshIcon aria-hidden />
            </Button>
            <span
              id={accessibleTextId}
              aria-live="polite"
              style={accessibleTextStyles}
            >
              {accessibleText}
            </span>
          </>
        }
      />
      <FormFieldHelperText>Custom step 5 and step block 50</FormFieldHelperText>
    </FormField>
  );
};

const SyncAdornment = () => {
  const [randomLiveValue, setRandomLiveValue] = useState(14.75);
  const [value, setValue] = useState(randomLiveValue);
  const [accessibleText, setAccessibleText] = useState("");

  const formFieldLabel = "Number input with sync adornment";
  const accessibleTextId = useId();

  useEffect(() => {
    const intervalId = setInterval(() => {
      const randomDelta = toFloat((Math.random() * 2 - 1).toFixed(2));
      setRandomLiveValue((prev) => toFloat((prev + randomDelta).toFixed(2)));
    }, 500);

    return () => clearInterval(intervalId);
  }, []);

  const clearAccessibleText = () =>
    setTimeout(() => {
      setAccessibleText(" ");
    }, 3000);

  return (
    <FormField>
      <FormFieldLabel>{formFieldLabel}</FormFieldLabel>
      <NumberInput
        value={value}
        onChange={(_, newValue) => setValue(newValue)}
        step={0.01}
        stepMultiplier={3}
        endAdornment={
          <>
            <Button
              aria-describedby={accessibleTextId}
              aria-label={`Sync ${formFieldLabel}`}
              onClick={() => {
                setValue(randomLiveValue);
                setAccessibleText(`Synchronized value to ${randomLiveValue}`);
                clearAccessibleText();
              }}
              appearance="transparent"
            >
              <SyncIcon aria-hidden />
            </Button>
            <span
              id={accessibleTextId}
              aria-live="polite"
              style={accessibleTextStyles}
            >
              {accessibleText}
            </span>
          </>
        }
      />
      <FormFieldHelperText>Live value {randomLiveValue}</FormFieldHelperText>
    </FormField>
  );
};

const CustomButtons = () => {
  const step = 1;
  const [value, setValue] = useState(10);

  const updateValue = (multiplier: -1 | 1) => {
    if (typeof value === "number") {
      setValue(value + multiplier * step);
    }
  };

  return (
    <FormField>
      <FormFieldLabel>Number input with custom buttons</FormFieldLabel>
      <NumberInput
        hideButtons
        value={value}
        textAlign="center"
        onChange={(_, newValue) => setValue(newValue)}
        startAdornment={
          <Button aria-hidden tabIndex={-1} onClick={() => updateValue(-1)}>
            <RemoveIcon aria-hidden />
          </Button>
        }
        endAdornment={
          <Button aria-hidden tabIndex={-1} onClick={() => updateValue(1)}>
            <AddIcon aria-hidden />
          </Button>
        }
      />
    </FormField>
  );
};

export const ButtonAdornments = () => {
  return (
    <StackLayout style={{ width: "256px" }}>
      <ResetAdornment />
      <SyncAdornment />
      <CustomButtons />
    </StackLayout>
  );
};
