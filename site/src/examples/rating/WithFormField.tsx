import { FormField, FormFieldHelperText, FormFieldLabel } from "@salt-ds/core";
import { Rating } from "@salt-ds/lab";
import type { ReactElement } from "react";

const labels = ["Poor", "Fair", "Good", "Very Good", "Excellent"];
export const WithFormField = (): ReactElement => (
  <FormField labelPlacement="top">
    <FormFieldLabel>Overall Experience</FormFieldLabel>
    <Rating getLabel={(value) => labels[value - 1] || "No rating"} />
    <FormFieldHelperText>
      Please rate your overall experience with our service. Select the number of
      stars that best reflects your satisfaction.
    </FormFieldHelperText>
  </FormField>
);
