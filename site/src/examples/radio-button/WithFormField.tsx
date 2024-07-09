import {
  FlexLayout,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  RadioButton,
  RadioButtonGroup,
} from "@salt-ds/core";
import type { ReactElement } from "react";

export const WithFormField = (): ReactElement => {
  return (
    <FlexLayout>
      <FormField necessity="required">
        <FormFieldLabel>Location</FormFieldLabel>
        <RadioButtonGroup>
          <RadioButton label="NAMR" value="namr" />
          <RadioButton label="APAC" value="apac" />
          <RadioButton label="EMEA" value="emea" />
        </RadioButtonGroup>
        <FormFieldHelperText>Select one that applies</FormFieldHelperText>
      </FormField>
    </FlexLayout>
  );
};
