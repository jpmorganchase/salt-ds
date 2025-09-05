import { FormField, FormFieldLabel } from "@salt-ds/core";
import { NumberInput } from "@salt-ds/lab";

export const FixedDecimalScale = () => {
  return (
    <FormField style={{ width: "256px" }}>
      <FormFieldLabel>Number input with fixed decimal scale</FormFieldLabel>
      <NumberInput
        defaultValue={100.25}
        decimalScale={4}
        onNumberChange={(_event, newValue) =>
          console.log(`Number changed to ${newValue}`)
        }
        format={(value: string) => {
          if (!value.length) {
            return value;
          }
          const numberValue = Number.parseFloat(value);
          return new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 4,
            maximumFractionDigits: 4,
          }).format(numberValue);
        }}
      />
    </FormField>
  );
};
