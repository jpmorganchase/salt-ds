import { ReactElement } from "react";
import {
  StackLayout,
  FormField,
  FormFieldLabel,
  FormFieldHelperText,
  Input,
} from "@salt-ds/core";
import { DropdownNext } from "@salt-ds/lab";

export const AdditionalAddress = (): ReactElement => {
  const Countries = [
    "France",
    "Germany",
    "Spain",
    "United Kingdom",
    "United States",
  ];

  const AddtionalAddress = true;

  return (
    <>
      <StackLayout gap={2}>
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
          <FormField style={{ width: "60%" }}>
            <FormFieldLabel>Town/City</FormFieldLabel>
            <FormFieldHelperText>Locality, Settlement etc.</FormFieldHelperText>
            <Input />
          </FormField>
        </StackLayout>
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
