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
          <RadioButton key="option1" label="NAMR" value="option1" />
          <RadioButton key="option2" label="APAC" value="option2" />
          <RadioButton key="option3" label="EMEA" value="option3" />
        </RadioButtonGroup>
        <FormFieldHelperText>Select one that applies</FormFieldHelperText>
      </FormField>
    </FlexLayout>
  );
};
