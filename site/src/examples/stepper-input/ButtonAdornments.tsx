import {
  Button,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  StackLayout,
} from "@salt-ds/core";
import { AddIcon, RefreshIcon, RemoveIcon, SyncIcon } from "@salt-ds/icons";
import { StepperInput } from "@salt-ds/lab";
import { useEffect, useState } from "react";

const RefreshAdornment = () => {
  const defaultValue = 1000;
  const [value, setValue] = useState<number | string>(defaultValue);
  return (
    <FormField>
      <FormFieldLabel>Refresh adornment</FormFieldLabel>
      <StepperInput
        value={value}
        onChange={(_, newValue) => setValue(newValue)}
        step={5}
        stepBlock={50}
        endAdornment={
          <Button
            onClick={() => setValue(defaultValue)}
            appearance="transparent"
          >
            <RefreshIcon aria-label="Reset to default" />
          </Button>
        }
      />
      <FormFieldHelperText>Custom step 5 and step block 50</FormFieldHelperText>
    </FormField>
  );
};

const SyncAdornment = () => {
  const [randomLiveValue, setRandomLiveValue] = useState(14.75);
  const [value, setValue] = useState<number | string>(randomLiveValue);
  useEffect(() => {
    const intervalId = setInterval(() => {
      const randomDelta = Math.floor(Math.random() * (1000 - 100) + 100) / 100;
      setRandomLiveValue((prev) => prev + randomDelta);
    }, 500);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <FormField>
      <FormFieldLabel>Sync adornment</FormFieldLabel>
      <StepperInput
        value={value}
        onChange={(_, newValue) => setValue(newValue)}
        decimalPlaces={2}
        step={0.01}
        stepBlock={0.1}
        endAdornment={
          <Button
            onClick={() => setValue(randomLiveValue)}
            appearance="transparent"
          >
            <SyncIcon aria-label="Sync live value" />
          </Button>
        }
      />
      <FormFieldHelperText>Custom step 5 and step block 50</FormFieldHelperText>
    </FormField>
  );
};

const CustomButtons = () => {
  const step = 1;
  const [value, setValue] = useState<number | string>(10);

  const updateValue = (multiplier: -1 | 1) => {
    if (typeof value === "number") {
      setValue(value + multiplier * step);
    }
  };

  return (
    <FormField>
      <FormFieldLabel>Custom buttons</FormFieldLabel>
      <StepperInput
        hideButtons
        value={value}
        onChange={(_, newValue) => setValue(newValue)}
        startAdornment={
          <Button onClick={() => updateValue(-1)}>
            <RemoveIcon aria-label="Decrease value by 1" />
          </Button>
        }
        endAdornment={
          <Button onClick={() => updateValue(1)}>
            <AddIcon aria-label="Increase value by 1" />
          </Button>
        }
      />
    </FormField>
  );
};

export const ButtonAdornments = () => {
  return (
    <StackLayout style={{ width: "256px" }}>
      <RefreshAdornment />
      <SyncAdornment />
      <CustomButtons />
    </StackLayout>
  );
};
