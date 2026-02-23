import { FormField, FormFieldLabel, StackLayout } from "@salt-ds/core";
import { Rating } from "@salt-ds/lab";
import type { ReactElement } from "react";

const labels = ["Poor", "Fair", "Good", "Very good", "Excellent"];
export const ReadOnly = (): ReactElement => (
  <StackLayout>
    <FormField>
      <FormFieldLabel>Rating (Read-only)</FormFieldLabel>
      <Rating readOnly defaultValue={3} />
    </FormField>
    <Rating
      aria-label="Rating (Read-only)"
      readOnly
      defaultValue={3}
      getVisibleLabel={(value) => labels[value - 1] || "No rating"}
      getLabel={(value) => labels[value - 1]}
    />
  </StackLayout>
);
