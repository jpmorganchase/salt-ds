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
        <CheckboxGroup defaultCheckedValues={["alternatives", "equities"]}>
          <Checkbox label="Alternatives" value="alternatives" />
          <Checkbox label="Equities" value="equities" />
          <Checkbox label="Fixed income" value="fixed income" />
        </CheckboxGroup>
        <FormFieldHelperText>Select all appropriate</FormFieldHelperText>
      </FormField>
    </FlexLayout>
  );
};
