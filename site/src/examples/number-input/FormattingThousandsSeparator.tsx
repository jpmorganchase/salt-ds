import { FormField, FormFieldLabel } from "@salt-ds/core";
import { NumberInput } from "@salt-ds/lab";

export const FormattingThousandsSeparator = () => {
  const isInternationalFormat = (inputValue: string): boolean =>
    /^[+-]?(\d{1,3}(,\d{0,3})*|\d*)(\.?\d*)?$/.test(inputValue);
  return (
    <FormField style={{ width: "256px" }}>
      <FormFieldLabel>Thousands separator</FormFieldLabel>
      <NumberInput
        defaultValue={1000000}
        isAllowed={isInternationalFormat}
        format={(value) => {
          if (!value.length) {
            return value;
          }
          return new Intl.NumberFormat("en-US").format(
            Number.parseFloat(value.replace(/,/g, "")),
          );
        }}
        parse={(value) => {
          if (!value.length) {
            return null;
          }
          return Number.parseFloat(value.replace(/,/g, ""));
        }}
        onNumberChange={(_event, newValue) => {
          console.log(`Number changed to ${newValue}`);
        }}
      />
    </FormField>
  );
};
