import { FlexLayout, FormField, FormFieldLabel, Text } from "@salt-ds/core";
import { Rating } from "@salt-ds/lab";
import type { ReactElement } from "react";

const labels = ["Poor", "Fair", "Good", "Very Good", "Excellent"];
export const VisualLabel = (): ReactElement => (
  <FlexLayout direction="column" gap={3}>
    <FormField>
      <FormFieldLabel>Product quality</FormFieldLabel>
      <Rating getLabel={(value) => labels[value - 1] || "No rating"} />
    </FormField>
    <FormField>
      <FormFieldLabel>Customer service</FormFieldLabel>
      <Rating defaultValue={4} getLabel={(value, max) => `${value}/${max}`} />
    </FormField>
    <FormField>
      <FormFieldLabel>Select rating</FormFieldLabel>
      <Rating
        labelPlacement="left"
        getLabel={(value) => labels[value - 1] || "No rating"}
        labelProps={{ style: { minWidth: "15ch" } }}
      />
      <Text style={{ maxWidth: "450px" }}>
        When using labels with `labelPlacement` set to 'left', set a minimum
        width on the label container using the `labelProps` with inline styles.
        This prevents layout shifts as the label text changes between different
        rating values.
      </Text>
    </FormField>
  </FlexLayout>
);
