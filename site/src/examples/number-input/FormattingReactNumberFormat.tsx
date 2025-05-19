import { Button, FormField, FormFieldLabel, StackLayout } from "@salt-ds/core";
import { AddIcon, RemoveIcon } from "@salt-ds/icons";
import { NumberInput, useNumberInput } from "@salt-ds/lab";
import { useState, useRef } from "react";
import { NumericFormat, PatternFormat } from "react-number-format";

export const FormattingReactNumberFormat = () => {
  const [value, setValue] = useState<string | number>("10000");
  const inputRef = useRef<HTMLInputElement>(null);
  const { incrementButtonProps, decrementButtonProps } = useNumberInput({
    inputRef,
    setValue,
    value,
  });

  return (
    <StackLayout>
      <FormField>
        <FormFieldLabel>Thousand separator</FormFieldLabel>
        <NumericFormat
          value={value}
          customInput={NumberInput}
          thousandSeparator
          onChange={(event) => setValue(event.target.value)}
          textAlign="center"
          hideButtons
          inputRef={inputRef}
          startAdornment={
            <Button {...decrementButtonProps} aria-hidden tabIndex={-1}>
              <RemoveIcon aria-hidden />
            </Button>
          }
          endAdornment={
            <Button {...incrementButtonProps} aria-hidden tabIndex={-1}>
              <AddIcon aria-hidden />
            </Button>
          }
        />
      </FormField>
      <FormField>
        <FormFieldLabel>With suffix</FormFieldLabel>
        <NumericFormat
          defaultValue={20}
          suffix="%"
          decimalScale={2}
          customInput={NumberInput}
          hideButtons
        />
      </FormField>
      <FormField>
        <FormFieldLabel>With prefix</FormFieldLabel>
        <NumericFormat
          defaultValue={20}
          prefix="$"
          customInput={NumberInput}
          hideButtons
        />
      </FormField>
      <FormField>
        <FormFieldLabel>Pattern format</FormFieldLabel>
        <PatternFormat
          defaultValue={20}
          format="+1 (###) #### ###"
          allowEmptyFormatting
          mask="_"
          customInput={NumberInput}
          hideButtons
        />
      </FormField>
    </StackLayout>
  );
};
