import {
  Checkbox,
  CheckboxGroup,
  FlexLayout,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
} from "@salt-ds/core";
import type { ReactElement } from "react";

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
