import {
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  StackLayout,
} from "@salt-ds/core";
import { NumberInput } from "@salt-ds/lab";

export const Formatting = () => {
  return (
    <StackLayout style={{ width: "256px" }}>
      <FormField>
        <FormFieldLabel>With Intl Number Format (currency)</FormFieldLabel>
        <NumberInput
          defaultValue={100}
          format={(value) =>
            new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "GBP",
            }).format(value)
          }
        />
        <FormFieldHelperText>Please enter a number</FormFieldHelperText>
      </FormField>

      <FormField>
        <FormFieldLabel>
          With custom format function (custom units)
        </FormFieldLabel>
        <NumberInput defaultValue={10} format={(value) => `${value} inches`} />
        <FormFieldHelperText>Please enter a number</FormFieldHelperText>
      </FormField>
      <FormField>
        <FormFieldLabel>With suffix (end adornment)</FormFieldLabel>
        <NumberInput defaultValue={50} endAdornment="%" />
        <FormFieldHelperText>Please enter a number</FormFieldHelperText>
      </FormField>
      <FormField>
        <FormFieldLabel>With prefix (start adornment)</FormFieldLabel>
        <NumberInput defaultValue={20} startAdornment="£" />
        <FormFieldHelperText>Please enter a number</FormFieldHelperText>
      </FormField>
    </StackLayout>
  );
};
