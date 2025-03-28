import {
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  StackLayout,
} from "@salt-ds/core";
import { NumberInput } from "@salt-ds/lab";
import { useState } from "react";

export const Formatting = () => {
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
      <FormField>
        <FormFieldLabel>Decimal scale</FormFieldLabel>
        <NumberInput
          defaultValue="1234.56789"
          decimalScale={3}
          step={step}
          stepMultiplier={multiplier}
        />
      </FormField>
      <FormField>
        <FormFieldLabel>Decimal separator</FormFieldLabel>
        <NumberInput
          defaultValue="1234.56789"
          decimalSeparator={","}
          decimalScale={3}
          step={step}
          stepMultiplier={multiplier}
        />
      </FormField>
      <FormField>
        <FormFieldLabel>Prefix</FormFieldLabel>
        <NumberInput
          defaultValue="123"
          prefix={"$"}
          step={step}
          stepMultiplier={multiplier}
        />
      </FormField>
      <FormField>
        <FormFieldLabel>Suffix</FormFieldLabel>
        <NumberInput
          defaultValue="1234"
          suffix={"M"}
          step={step}
          stepMultiplier={multiplier}
        />
      </FormField>
      <FormField>
        <FormFieldLabel>Thousand group style</FormFieldLabel>
        <NumberInput
          defaultValue="1234567890"
          thousandsGroupStyle={"thousand"}
          thousandSeparator={","}
          step={step}
          stepMultiplier={multiplier}
        />
      </FormField>
      <FormField>
        <FormFieldLabel>Allow leading zeros</FormFieldLabel>
        <NumberInput
          defaultValue="00002"
          allowLeadingZeros
          step={step}
          stepMultiplier={multiplier}
        />
      </FormField>
      <FormField>
        <FormFieldLabel>Fixed decimal scale</FormFieldLabel>
        <NumberInput
          defaultValue={12323.1}
          decimalScale={3}
          fixedDecimalScale
          step={step}
          stepMultiplier={multiplier}
        />
      </FormField>
    </StackLayout>
  );
};
