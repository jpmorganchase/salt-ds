import { FormField, FormFieldLabel, NumberInput } from "@salt-ds/core";

export const Decimals = () => {
  return (
    <FormField style={{ width: "256px" }}>
      <FormFieldLabel>Number input with decimal scale</FormFieldLabel>
      <NumberInput
        defaultValue={100.25}
        decimalScale={2}
        onNumberChange={(_event, newValue) =>
          console.log(`Number changed to ${newValue}`)
        }
      />
    </FormField>
  );
};
