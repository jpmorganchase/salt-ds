import { FormField, FormFieldLabel, StackLayout } from "@salt-ds/core";
import { NumberInput, NumberInputProps } from "@salt-ds/lab";

export const CustomFormatting = () => {
    const customFormatter: NumberInputProps['format'] = (numStr: string) => {
      console.log(numStr);
      if (numStr === '') return '';
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(parseFloat(numStr));
    };

    return(
    <FormField style={{ width: "256px" }}>
      <FormFieldLabel>Custom formatted value</FormFieldLabel>
      <NumberInput
        defaultValue={1}
       format={customFormatter}
      />
    </FormField>
  );
};
