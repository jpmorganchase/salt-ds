import { FormField, FormFieldLabel, NumberInput } from "@salt-ds/core";
import { useState } from "react";

export const FormattingCompactNotation = () => {
  const [value, setValue] = useState<string>("100000");
  const validValue = /^([+-]?\d+(?:\.\d*)?|\.[0-9]+)([kmbt]?)$/i;

  return (
    <FormField style={{ width: "256px" }}>
      <FormFieldLabel>Compact notation</FormFieldLabel>
      <NumberInput
        value={value}
        pattern={(inputValue) => validValue.test(inputValue)}
        onChange={(_event, newValue) => {
          setValue(newValue);
        }}
        onNumberChange={(_event, newValue) => {
          console.log(`Number changed to ${newValue}`);
        }}
        format={(value) => {
          if (!value.length) {
            return value;
          }
          const floatValue = Number.parseFloat(value);
          if (Number.isNaN(floatValue)) {
            return value;
          }
          return new Intl.NumberFormat("en-US", {
            notation: "compact",
            compactDisplay: "short",
            maximumFractionDigits: 3,
          }).format(floatValue);
        }}
        step={1000}
        parse={(raw) => {
          if (!raw.length) {
            return null;
          }
          const match = raw.match(validValue);
          if (!match) {
            return Number.NaN;
          }
          const [_, num, unit] = match;
          const multiplier = unit
            ? { k: 1e3, m: 1e6, b: 1e9, t: 1e12 }[unit.toLowerCase()] || 1
            : 1;
          return Number.parseFloat(num) * multiplier;
        }}
      />
    </FormField>
  );
};
