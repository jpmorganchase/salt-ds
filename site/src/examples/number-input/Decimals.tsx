import {
  Input,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  StackLayout,
} from "@salt-ds/core";
import { NumberInput } from "@salt-ds/lab";
import {ChangeEvent, SyntheticEvent, useState} from "react";

export const Decimals = () => {
  const [decimalSeparator, setDecimalSeparator] = useState<string>('.');
  const [decimalScale, setDecimalScale] = useState<number | undefined>(2);
  const [step, setStep] = useState<number | undefined>(1);

  return (
    <StackLayout style={{ width: "356px" }}>
        <StackLayout direction={"row"}>
          <FormField>
          <FormFieldLabel>Decimal Scale</FormFieldLabel>
          <NumberInput
            value={decimalScale}
            onValueChange={(value) => setDecimalScale(value.floatValue)}
          />
          <FormFieldHelperText>
            Enter a number of decimal places
          </FormFieldHelperText>
        </FormField>
        <FormField>
          <FormFieldLabel>Step</FormFieldLabel>
          <NumberInput
            value={step}
            onValueChange={(value) => setStep(value.floatValue)}
          />
          <FormFieldHelperText>Enter a step value</FormFieldHelperText>
        </FormField>
        <FormField>
          <FormFieldLabel>Decimal Separator</FormFieldLabel>
          <Input
            value={decimalSeparator}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setDecimalSeparator(event.target.value)}
          />
          <FormFieldHelperText>
            Enter a number of decimal places
          </FormFieldHelperText>
        </FormField>
      </StackLayout>
      <FormField>
        <FormFieldLabel>Number input with decimal places</FormFieldLabel>
        <NumberInput
          defaultValue={12.0}
          decimalScale={decimalScale}
          decimalSeparator={decimalSeparator}
          step={step}
        />
        <FormFieldHelperText>Please enter a decimal value</FormFieldHelperText>
      </FormField>
      <FormField>
        <FormFieldLabel>
          Number input with decimal places and fixed scale
        </FormFieldLabel>
        <NumberInput
          defaultValue={12.0}
          decimalScale={2}
          decimalSeparator={decimalSeparator}
          fixedDecimalScale
          step={0.01}
          endAdornment="USD"
        />
        <FormFieldHelperText>Please enter a decimal value</FormFieldHelperText>
      </FormField>
    </StackLayout>
  );
};
