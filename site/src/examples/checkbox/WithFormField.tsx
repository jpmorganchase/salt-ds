import { ReactElement } from "react";
import {
  Checkbox,
  CheckboxGroup,
  FormField,
  FormFieldLabel,
  FormFieldHelperText,
  FlexLayout,
} from "@salt-ds/core";

export const WithFormField = (): ReactElement => {
  return (
    <FlexLayout>
      <FormField necessity="required">
        <FormFieldLabel>Assignment</FormFieldLabel>
        <CheckboxGroup defaultCheckedValues={["option-1", "option-2"]}>
          <Checkbox label="Alternatives" value="option-1" />
          <Checkbox label="Equities" value="option-2" />
          <Checkbox label="Fixed income" value="option-3" />
        </CheckboxGroup>
        <FormFieldHelperText>Select all appropriate</FormFieldHelperText>
      </FormField>
    </FlexLayout>
  );
};
