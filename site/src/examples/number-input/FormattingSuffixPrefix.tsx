import { FormField, FormFieldLabel } from "@salt-ds/core";
import { toFloat } from "@salt-ds/core/src/slider/internal/utils";
import { NumberInput } from "@salt-ds/lab";
import { isEmpty } from "@salt-ds/lab/src/number-input/internal/utils";
import { StackLayout } from "src/components";

export const FormattingSuffixPrefix = () => {
  return (
    <StackLayout>
      <FormField>
        <FormFieldLabel>With suffix</FormFieldLabel>
        <NumberInput
          defaultValue={12}
          max={100}
          clamp
          format={(value) => `${value}%`}
          parse={(value) => {
            const match = value.match(/^\d*(\.\d*)?%?$/);
            if (!match) return;

            return toFloat(value.replace(/%/g, ""));
          }}
        />
      </FormField>
      <FormField>
        <FormFieldLabel>With prefix</FormFieldLabel>
        <NumberInput
          defaultValue={12}
          max={100}
          clamp
          format={(value) => `£${value}`}
          parse={(value) => {
            const match = value.match(/^£?\d*(\.\d*)?$/);
            if (!match) return;

            const parsedValue = value.replace(/£/g, "");
            return isEmpty(parsedValue) ? 0 : toFloat(parsedValue);
          }}
        />
      </FormField>
    </StackLayout>
  );
};
