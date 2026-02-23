import { FormField, FormFieldHelperText, FormFieldLabel } from "@salt-ds/core";
import { Rating } from "@salt-ds/lab";
import type { ReactElement } from "react";

const labels = ["Poor", "Fair", "Good", "Very good", "Excellent"];
export const WithFormField = (): ReactElement => (
  <FormField labelPlacement="top" style={{ width: "225px" }}>
    <FormFieldLabel>Form field label</FormFieldLabel>
    <Rating
      getVisibleLabel={(value) => labels[value - 1] || "No rating"}
      getLabel={(value) => labels[value - 1]}
    />
    <FormFieldHelperText>Helper text</FormFieldHelperText>
  </FormField>
);
