import { FormField, FormFieldLabel } from "@salt-ds/core";
import { NumberInput } from "@salt-ds/lab";
import { type ChangeEvent, useState } from "react";

export const FormattingCompactNotation = () => {
  const [value, setValue] = useState<number | string>(100000);
  const validValue = /^[+-]?(\d+(\.\d*)?|\.\d+)([kKmMbBtT]?)$/;
  return (
    <FormField style={{ width: "256px" }}>
      <FormFieldLabel>Compact notation</FormFieldLabel>
      <NumberInput
        value={value}
        isAllowed={(inputValue) => validValue.test(inputValue)}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setValue(event.target.value);
        }}
        onNumberChange={(newValue) => {
          console.log(`Number changed to ${newValue}`);
          setValue(newValue ?? "");
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
        parse={(raw: string) => {
          if (!raw.length) {
            return null;
          }
          const match = raw.match(validValue);
          if (!match) {
            return Number.NaN;
          }
          const [_, num, , unit] = match;
          const multiplier =
            { k: 1e3, m: 1e6, b: 1e9, t: 1e12 }[unit.toLowerCase() as string] ||
            1;
          return Number.parseFloat(num) * multiplier;
        }}
      />
    </FormField>
  );
};
