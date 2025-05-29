import {
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  StackLayout,
} from "@salt-ds/core";
import { toFloat } from "@salt-ds/core/src/slider/internal/utils";
import { NumberInput } from "@salt-ds/lab";
import { useState } from "react";

export const Formatting = () => {
  const [value, setValue] = useState<number | string>(100000);
  return (
    <StackLayout>
      <FormField>
        <FormFieldLabel>
          With Intl Number Format, Controlled, Compact
        </FormFieldLabel>
        <NumberInput
          value={value}
          onChange={(e, value) => {
            setValue(value);
          }}
          format={(value) => {
            const formattedValue = new Intl.NumberFormat("en-GB", {
              notation: "compact",
              compactDisplay: "short",
              maximumFractionDigits: 3,
            }).format(toFloat(value));
            return formattedValue;
          }}
          parse={(value) => {
            const stringValue =
              typeof value === "number" ? value.toString() : value;
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
          With custom format function, Uncontrolled (custom units)
        </FormFieldLabel>
        <NumberInput
          defaultValue={12}
          format={(value) => `${value}%`}
          max={100}
          clampingBehaviour="strict"
          parse={(value) => {
            const stringValue =
              typeof value === "number" ? value.toString() : value;
            return stringValue.replace(/%/g, "");
          }}
        />
        <FormFieldHelperText>Please enter a number</FormFieldHelperText>
      </FormField>
      <FormField>
        <FormFieldLabel>
          With Intl Number Format, Thousands separator
        </FormFieldLabel>
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
      <FormField>
        <FormFieldLabel>
          With Intl Number Format, Decimals, step = 0.1
        </FormFieldLabel>
        <NumberInput
          defaultValue={10.23456}
          format={(value) => {
            return new Intl.NumberFormat("en-GB", {
              maximumFractionDigits: 2,
              minimumFractionDigits: 1,
            }).format(toFloat(value));
          }}
          step={0.1}
        />
      </FormField>
      <FormField>
        <FormFieldLabel>
          With decimal step, controlled precision, step=0.1
        </FormFieldLabel>
        <NumberInput defaultValue={10.236} precision={1} step={0.1} />
      </FormField>
    </StackLayout>
  );
};
