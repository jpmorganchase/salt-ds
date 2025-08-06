import { FormField, FormFieldLabel, StackLayout } from "@salt-ds/core";
import { toFloat } from "@salt-ds/core/src/slider/internal/utils";
import { NumberInput } from "@salt-ds/lab";

export const FormattingThousandsSeparator = () => {
  return (
    <StackLayout style={{ width: "256px" }}>
      <FormField>
        <FormFieldLabel>Thousands separator</FormFieldLabel>
        <NumberInput
          defaultValue={1000000}
          format={(value) => {
            return new Intl.NumberFormat("en-GB").format(toFloat(value));
          }}
          parse={(value) => {
            const match = value.match(/^[\d,.-]*$/);
            if (!match) return;
            return toFloat(value.replace(/,/g, ""));
          }}
        />
      </FormField>
    </StackLayout>
  );
};
