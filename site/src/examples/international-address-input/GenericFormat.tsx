import { ReactElement } from "react";
import {
  StackLayout,
  FormField,
  FormFieldLabel,
  FormFieldHelperText,
  Input,
} from "@salt-ds/core";
import { DropdownNext } from "@salt-ds/lab";

export const GenericFormat = (): ReactElement => {
  const Countries = [
    "France",
    "Germany",
    "Spain",
    "United Kingdom",
    "United States",
  ];

  return (
    <>
      <StackLayout gap={2}>
        <FormField>
          <FormFieldLabel>Full name/Company name</FormFieldLabel>
          <Input />
        </FormField>
        <FormField>
          <FormFieldLabel>Address 1</FormFieldLabel>
          <Input />
          <FormFieldHelperText>
            Street address, P.O. box etc.
          </FormFieldHelperText>
        </FormField>
        <FormField>
          <FormField>
            <FormFieldLabel>Address 2 (optional)</FormFieldLabel>
            <Input />
            <FormFieldHelperText>
              Flat, Apt, Suite, Floor, Building etc.
            </FormFieldHelperText>
          </FormField>
          <FormField>
            <FormFieldLabel>Address 3 (optional)</FormFieldLabel>
            <Input />
          </FormField>
        </FormField>
        <StackLayout gap={2} direction={"row"} role="group">
          <FormField style={{ width: "40%" }}>
            <FormFieldLabel>Postal code/PLZ</FormFieldLabel>
            <Input />
          </FormField>
          <FormField style={{ width: "60%" }}>
            <FormFieldLabel>Town/City</FormFieldLabel>
            <FormFieldHelperText>Locality, Settlement etc.</FormFieldHelperText>
            <Input />
          </FormField>
        </StackLayout>
        <FormField>
          <FormFieldLabel>State/Province (optional)</FormFieldLabel>
          <Input />
        </FormField>
        <FormField>
          <FormFieldLabel>Country</FormFieldLabel>
          <DropdownNext source={Countries} style={{ width: "100%" }} />
        </FormField>
      </StackLayout>
    </>
  );
};
