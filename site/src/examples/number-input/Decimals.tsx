import { FormField, FormFieldLabel, NumberInput } from "@salt-ds/core";

export const Decimals = () => {
  return (
    <FormField style={{ width: "256px" }}>
      <FormFieldLabel>Number input with default format/parser</FormFieldLabel>
      <NumberInput
        defaultValue={1.10025}
        decimalScale={5}
        onNumberChange={(_event, newValue) => {
          if (newValue != null) {
            const formatted = new Intl.NumberFormat("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 5,
            }).format(newValue);
            console.log(`Number changed to ${formatted}`);
          }
        }}
      />
    </FormField>
  );
};
