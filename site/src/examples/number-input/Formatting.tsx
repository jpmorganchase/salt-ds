import { FormField, FormFieldLabel, StackLayout } from "@salt-ds/core";
import { toFloat } from "@salt-ds/core/src/slider/internal/utils";
import { NumberInput } from "@salt-ds/lab";

export const Formatting = () => {
  return (
    <StackLayout style={{ width: "256px" }}>
      <FormField>
        <FormFieldLabel>Compact notation</FormFieldLabel>
        <NumberInput
          defaultValue={5000}
          step={1000}
          format={(value) => {
            const formattedValue = new Intl.NumberFormat("en-GB", {
              notation: "compact",
              compactDisplay: "short",
              maximumFractionDigits: 3,
            }).format(toFloat(value));
            return formattedValue;
          }}
          parse={(value) => {
            const match = String(value).match(/^(\d+(\.\d*)?)([kKmMbB]?)$/);
            if (!match) return value;
            const [_, num, , unit] = match;
            const multiplier =
              { k: 1e3, m: 1e6, b: 1e9 }[unit.toLowerCase()] || 1;
            return Number.parseFloat(num) * multiplier;
          }}
        />
      </FormField>
      <FormField>
        <FormFieldLabel>Thousands separator</FormFieldLabel>
        <NumberInput
          defaultValue={1000000}
          format={(value) => {
            return new Intl.NumberFormat("en-GB").format(toFloat(value));
          }}
          parse={(value) => {
            const stringValue =
              typeof value === "number" ? value.toString() : value;
            return stringValue.replace(/,/g, "");
          }}
        />
      </FormField>
    </StackLayout>
  );
};
