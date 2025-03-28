import {
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  StackLayout,
} from "@salt-ds/core";
import { NumberInput } from "@salt-ds/lab";
import { useState } from "react";

export const StepAndMultiplier = () => {
  const [step, setStep] = useState<number | undefined>(1);
  const [multiplier, setMultiplier] = useState<number | undefined>(10);

  return (
    <StackLayout style={{ width: "256px" }}>
      <StackLayout direction={"row"}>
        <FormField>
          <FormFieldLabel>Step</FormFieldLabel>
          <NumberInput
            value={step}
            onValueChange={(value) => setStep(value.floatValue)}
          />
          <FormFieldHelperText>
            Enter a step value for arrow keys
          </FormFieldHelperText>
        </FormField>
        <FormField>
          <FormFieldLabel>Step multiplier</FormFieldLabel>
          <NumberInput
            value={multiplier}
            onValueChange={(value) => setMultiplier(value.floatValue)}
          />
          <FormFieldHelperText>
            Enter a multiplier for shift keys
          </FormFieldHelperText>
        </FormField>
      </StackLayout>
      <FormField style={{ width: "256px" }}>
        <FormFieldLabel>Custom step</FormFieldLabel>
        <NumberInput
          defaultValue={10}
          step={step}
          stepMultiplier={multiplier}
        />
        <FormFieldHelperText>
          Custom step {step} and step multiplier {multiplier}
        </FormFieldHelperText>
      </FormField>
    </StackLayout>
  );
};
