import { FormField, FormFieldLabel, NumberInput } from "@salt-ds/core";

export const CustomInputPattern = () => (
  <FormField style={{ width: "256px" }}>
    <FormFieldLabel>Multiplier</FormFieldLabel>
    <NumberInput
      defaultValue={0}
      pattern={(inputValue) => /^[+-]?\d*x?$/.test(inputValue)}
      format={(value) => `${value}x`}
      parse={(value) => {
        if (!value.length) {
          return null;
        }
        return Number.parseFloat(value.replace(/x/g, ""));
      }}
      onNumberChange={(_event, newValue) => {
        console.log(`Number changed to ${newValue}`);
      }}
    />
  </FormField>
);
