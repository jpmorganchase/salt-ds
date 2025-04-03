import { FormField, FormFieldLabel, StackLayout } from "@salt-ds/core";
import { RangeSlider } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const WithConstrainedLabelPosition = (): ReactElement => (
  <StackLayout gap={6} style={{ width: "80%" }}>
    <FormField>
      <FormFieldLabel>With constrained label position</FormFieldLabel>
      <RangeSlider
        aria-label="WithConstrainedLabelPosition"
        marks={[
          {
            value: 0,
            label: "Very low",
          },
          {
            value: 10,
            label: "Very high",
          },
        ]}
        constrainLabelPosition
      />
    </FormField>
    <FormField>
      <FormFieldLabel>With constrained label position and ticks</FormFieldLabel>
      <RangeSlider
        aria-label="WithConstrainedLabelPosition"
        marks={[
          {
            value: 0,
            label: "Very low",
          },
          {
            value: 10,
            label: "Very high",
          },
        ]}
        constrainLabelPosition
        showTicks
      />
    </FormField>
  </StackLayout>
);
