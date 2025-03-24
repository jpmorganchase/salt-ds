import { FormField, FormFieldLabel, StackLayout } from "@salt-ds/core";
import { Slider } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const WithConstrainedLabelPosition = (): ReactElement => (
  <StackLayout gap={6}>
    <FormField>
      <FormFieldLabel>With constrained label position</FormFieldLabel>
      <Slider
        aria-label="WithConstrainedLabelPosition"
        style={{ width: "400px" }}
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
      <Slider
        aria-label="WithConstrainedLabelPosition"
        style={{ width: "400px" }}
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
