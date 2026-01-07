import { FormField, FormFieldHelperText, FormFieldLabel } from "@salt-ds/core";
import { Rating } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const WithFormField = (): ReactElement => (
  <FormField labelPlacement="top">
    <FormFieldLabel color="secondary">Overall Experience</FormFieldLabel>
    <Rating
      semanticLabels={["Poor", "Fair", "Good", "Very Good", "Excellent"]}
    />
    <FormFieldHelperText>
      Please rate your overall experience with our service. Select the number of
      stars that best reflects your satisfaction.
    </FormFieldHelperText>
  </FormField>
);
