import {
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  StackLayout,
} from "@salt-ds/core";
import { NumberInput } from "@salt-ds/lab";
import { useState } from "react";

export const Formatting = () => {
  const [value, setValue] = useState<number | string>("10K");
  return (
    <StackLayout>
      <FormField>
        <FormFieldLabel>
          With Intl Number Format, Controlled, Compact
        </FormFieldLabel>
        <NumberInput
          value={value}
          onChange={(e, val) => {
            setValue(val);
          }}
          format={(value) => {
            const formattedValue = new Intl.NumberFormat("en-GB", {
              notation: "compact",
              compactDisplay: "short",
              maximumFractionDigits: 3,
            }).format(value);
            return formattedValue;
          }}
          parse={(value) => {
            let stringValue = value;
            if (typeof value === "number") {
              stringValue = value.toString();
            }
            const match = stringValue.match(/^(\d+(\.\d*)?)([kKmMbB]?)$/);
            if (!match) {
              return value;
            }
            const number = Number.parseFloat(match[1]);
            const unit = match[3].toLowerCase();
            let parsedValue = number;
            switch (unit) {
              case "k":
                parsedValue = number * 1000;
                break;
              case "m":
                parsedValue = number * 1000000;
                break;
              case "b":
                parsedValue = number * 1000000000;
                break;
              default:
                parsedValue = number;
            }
            return parsedValue;
          }}
        />
        <FormFieldHelperText>Please enter a number</FormFieldHelperText>
      </FormField>
      <FormField>
        <FormFieldLabel>
          With custom format function, Uncontrolled (custom units, clamped)
        </FormFieldLabel>
        <NumberInput
          defaultValue={"12%"}
          format={(value) => `${value}%`}
          max={100}
          clampingBehaviour="strict"
          parse={(value) => {
            let parsedValue;

            if (typeof value === "number") {
              parsedValue = value.toString();
            } else parsedValue = value;

            return parsedValue.replace(/%/g, "");
          }}
        />
        <FormFieldHelperText>Please enter a number</FormFieldHelperText>
      </FormField>
      <FormField>
        <FormFieldLabel>With end adornment (suffix)</FormFieldLabel>
        <NumberInput defaultValue={12} endAdornment=" inches" />
        <FormFieldHelperText>Please enter a number</FormFieldHelperText>
      </FormField>
      <FormField>
        <FormFieldLabel>With start adornment (prefix)</FormFieldLabel>
        <NumberInput defaultValue={23} startAdornment="$" />
        <FormFieldHelperText>Please enter a number</FormFieldHelperText>
      </FormField>
    </StackLayout>
  );
};
