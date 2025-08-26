import { FormField, FormFieldLabel, StackLayout } from "@salt-ds/core";
import { NumberInput } from "@salt-ds/lab";
import { toFloat } from "@salt-ds/lab/src/number-input/internal/utils";
import { useState } from "react";

export const FormattingCompactNotation = () => {
  const [value, setValue] = useState<string | number>(100000);
  return (
    <StackLayout gap={2} style={{ width: "256px" }}>
      <FormField>
        <FormFieldLabel>Compact notation</FormFieldLabel>
        <NumberInput
          value={value}
          onChange={(e) => {
            setValue(e?.target?.value ?? "");
          }}
          onNumberChange={(e: any, value) => {
            console.log("Number changed to ", value);
            setValue(value ?? "");
          }}
          format={(value) => {
            const formattedValue = new Intl.NumberFormat("en-GB", {
              notation: "compact",
              compactDisplay: "short",
              maximumFractionDigits: 3,
            }).format(toFloat(value));
            return formattedValue === "0" ? "" : formattedValue;
          }}
          step={10000}
          parse={(value) => {
            if (!value?.length) {
              return 0;
            }
            const match = value.match(/^(-?\d+(\.\d*)?)([kKmMbBtT]?)$/);
            if (!match) return NaN;

            const [_, num, , unit] = match;
            const multiplier =
              { k: 1e3, m: 1e6, b: 1e9, t: 1e12 }[unit.toLowerCase()] || 1;
            return toFloat(Number.parseFloat(num) * multiplier);
          }}
        />
      </FormField>
    </StackLayout>
  );
};
