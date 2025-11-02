import {
  Button,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  NumberInput,
  StackLayout,
  useAriaAnnouncer,
} from "@salt-ds/core";
import { AddIcon, RefreshIcon, RemoveIcon, SyncIcon } from "@salt-ds/icons";
import { useEffect, useState } from "react";

const ResetAdornment = () => {
  const defaultValue = "1000";
  const [value, setValue] = useState<string>(defaultValue);

  const { announce } = useAriaAnnouncer();

  const formFieldLabel = "Number input with reset adornment";

  return (
    <FormField>
      <FormFieldLabel>{formFieldLabel}</FormFieldLabel>
      <NumberInput
        value={value}
        onChange={(_event, newValue) => {
          setValue(newValue);
        }}
        onNumberChange={(_event, newValue) => {
          console.log(`Number changed to ${newValue}`);
        }}
        endAdornment={
          <Button
            appearance="solid"
            aria-label={`Reset ${formFieldLabel}`}
            onClick={() => {
              setValue(defaultValue);
              announce(
                `${formFieldLabel} value was reset ${defaultValue}`,
                1000,
              );
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

const SyncAdornment = () => {
  const [randomLiveValue, setRandomLiveValue] = useState("14.75");
  const [value, setValue] = useState<string>(randomLiveValue);

  const formFieldLabel = "Number input with sync adornment";

  const { announce } = useAriaAnnouncer();

  useEffect(() => {
    const intervalId = setInterval(() => {
      const randomDelta = Number.parseFloat((Math.random() * 2 - 1).toFixed(2));
      setRandomLiveValue((prev) =>
        String(Number.parseFloat(prev).toFixed(2) + randomDelta),
      );
    }, 500);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <FormField>
      <FormFieldLabel>{formFieldLabel}</FormFieldLabel>
      <NumberInput
        value={value}
        onChange={(_event, newValue) => {
          setValue(newValue);
        }}
        onNumberChange={(_event, newValue) => {
          console.log(`Number changed to ${newValue}`);
        }}
        step={0.01}
        stepMultiplier={3}
        endAdornment={
          <Button
            aria-label={`Sync ${formFieldLabel}`}
            appearance="solid"
            onClick={() => {
              setValue(randomLiveValue);
              announce(
                `Sync ${formFieldLabel} value with live value ${randomLiveValue}`,
                1000,
              );
            }}
          >
            <SyncIcon aria-hidden />
          </Button>
        }
      />
      <FormFieldHelperText>Live value {randomLiveValue}</FormFieldHelperText>
    </FormField>
  );
};

const CustomButtons = () => {
  const [value, setValue] = useState<string>("10");

  return (
    <FormField>
      <FormFieldLabel>Number input with custom buttons</FormFieldLabel>
      <NumberInput
        hideButtons
        textAlign="center"
        onChange={(_event, newValue) => {
          setValue(newValue);
        }}
        onNumberChange={(_event, newValue) => {
          console.log(`Number changed to ${newValue}`);
        }}
        value={value}
        startAdornment={
          <Button
            aria-hidden
            tabIndex={-1}
            onClick={() => {
              const newValue = Number.parseFloat(value);
              if (!Number.isNaN(newValue)) {
                const validValue = Math.max(
                  Number.MIN_SAFE_INTEGER,
                  Math.min(Number.MAX_SAFE_INTEGER, newValue - 1),
                );
                setValue(String(validValue));
              }
            }}
          >
            <RemoveIcon aria-hidden />
          </Button>
        }
        endAdornment={
          <Button
            aria-hidden
            tabIndex={-1}
            onClick={() => {
              const newValue = Number.parseFloat(value);
              if (!Number.isNaN(newValue)) {
                const validValue = Math.max(
                  Number.MIN_SAFE_INTEGER,
                  Math.min(Number.MAX_SAFE_INTEGER, newValue + 1),
                );
                setValue(String(validValue));
              }
            }}
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
