import {
  Button,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  StackLayout,
  useId,
} from "@salt-ds/core";
import { AddIcon, RefreshIcon, RemoveIcon, SyncIcon } from "@salt-ds/icons";
import { NumberInput } from "@salt-ds/lab";
import { type ChangeEvent, useEffect, useState } from "react";

const accessibleTextStyles = {
  position: "fixed",
  top: "0",
  left: "0",
  transform: "translate(-100%, -100%)",
} as React.CSSProperties;

const ResetAdornment = () => {
  const defaultValue = 1000;
  const [value, setValue] = useState<number | string>(defaultValue);
  const [accessibleText, setAccessibleText] = useState("");

  const formFieldLabel = "Number input with reset adornment";
  const accessibleTextId = useId();

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    if (accessibleText?.length) {
      timeoutId = setTimeout(() => {
        setAccessibleText("");
      }, 3000);
    }
    return () => clearTimeout(timeoutId);
  }, [accessibleText]);

  return (
    <FormField>
      <FormFieldLabel>{formFieldLabel}</FormFieldLabel>
      <NumberInput
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setValue(event.target.value);
        }}
        onNumberChange={(newValue) => {
          console.log(`Number changed to ${newValue}`);
          setValue(newValue ?? "");
        }}
        endAdornment={
          <>
            <Button
              aria-describedby={accessibleTextId}
              appearance="solid"
              aria-label={`Reset ${formFieldLabel}`}
              onClick={() => {
                setValue(defaultValue);
                setAccessibleText(
                  `${formFieldLabel} value was reset ${defaultValue}`,
                );
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

const SyncAdornment = () => {
  const [randomLiveValue, setRandomLiveValue] = useState(14.75);
  const [value, setValue] = useState<number | string>(randomLiveValue);
  const [accessibleText, setAccessibleText] = useState("");

  const formFieldLabel = "Number input with sync adornment";
  const accessibleTextId = useId();

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    if (accessibleText?.length) {
      timeoutId = setTimeout(() => {
        setAccessibleText("");
      }, 3000);
    }
    return () => clearTimeout(timeoutId);
  }, [accessibleText]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const randomDelta = Number.parseFloat((Math.random() * 2 - 1).toFixed(2));
      setRandomLiveValue((prev) =>
        Number.parseFloat((prev + randomDelta).toFixed(2)),
      );
    }, 500);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <FormField>
      <FormFieldLabel>{formFieldLabel}</FormFieldLabel>
      <NumberInput
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setValue(event.target.value);
        }}
        onNumberChange={(newValue) => {
          console.log(`Number changed to ${newValue}`);
          setValue(newValue ?? "");
        }}
        step={0.01}
        stepMultiplier={3}
        endAdornment={
          <>
            <Button
              aria-describedby={accessibleTextId}
              aria-label={`Sync ${formFieldLabel}`}
              appearance="solid"
              onClick={() => {
                setValue(randomLiveValue);
                setAccessibleText(
                  `Sync ${formFieldLabel} value with live value ${randomLiveValue}`,
                );
              }}
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
  const [value, setValue] = useState<number | string>(10);

  return (
    <FormField>
      <FormFieldLabel>Number input with custom buttons</FormFieldLabel>
      <NumberInput
        hideButtons
        textAlign="center"
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

export const ButtonAdornments = () => {
  return (
    <StackLayout style={{ width: "256px" }}>
      <ResetAdornment />
      <SyncAdornment />
      <CustomButtons />
    </StackLayout>
  );
};
