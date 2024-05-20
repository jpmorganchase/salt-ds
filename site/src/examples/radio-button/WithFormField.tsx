import { ReactElement } from "react";
import {
  FormField,
  FormFieldLabel,
  FormFieldHelperText,
  FlexLayout,
  RadioButtonGroup,
  RadioButton,
} from "@salt-ds/core";

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
