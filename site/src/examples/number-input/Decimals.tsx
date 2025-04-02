import {
  Input,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  StackLayout,
} from "@salt-ds/core";
import { NumberInput } from "@salt-ds/lab";
import { ChangeEvent, SyntheticEvent, useState } from "react";

export const Decimals = () => {
  const [decimalSeparator, setDecimalSeparator] = useState<string>(".");
  const [decimalScale, setDecimalScale] = useState<number>(2);
  const [decimalScaleValidationStatus, setDecimalScaleValidationStatus] =
    useState<"error" | undefined>();
  const [step, setStep] = useState<number | undefined>(1);

  return (
    <StackLayout style={{ width: "400px" }}>
      <StackLayout direction={"row"}>
        <FormField validationStatus={decimalScaleValidationStatus}>
          <FormFieldLabel>Decimal Scale</FormFieldLabel>
          <NumberInput
            allowNegative={false}
            min={0}
            max={14}
            value={decimalScale}
            onValueChange={(value) => {
              if (
                value?.floatValue !== undefined &&
                value.floatValue >= 0 &&
                value.floatValue <= 14
              ) {
                setDecimalScale(value.floatValue ?? "");
                setDecimalScaleValidationStatus(undefined);
              } else {
                setDecimalScaleValidationStatus("error");
              }
            }}
          />
          <FormFieldHelperText>
            Enter a number of decimal places, max = 14
          </FormFieldHelperText>
        </FormField>
        <FormField>
          <FormFieldLabel>Step</FormFieldLabel>
          <NumberInput
            value={step}
            decimalScale={decimalScale}
            fixedDecimalScale
            onValueChange={(value) => setStep(value.floatValue ?? 0)}
          />
          <FormFieldHelperText>Enter a step value</FormFieldHelperText>
        </FormField>
        <FormField>
          <FormFieldLabel>Decimal Separator</FormFieldLabel>
          <Input
            value={decimalSeparator}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setDecimalSeparator(event.target.value)
            }
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
          decimalScale={decimalScale}
          decimalSeparator={decimalSeparator}
          fixedDecimalScale
          step={step}
          endAdornment="USD"
        />
        <FormFieldHelperText>Please enter a decimal value</FormFieldHelperText>
      </FormField>
    </StackLayout>
  );
};
