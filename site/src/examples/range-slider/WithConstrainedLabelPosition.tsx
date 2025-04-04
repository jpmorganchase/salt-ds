import { FormField, FormFieldLabel, StackLayout } from "@salt-ds/core";
import { RangeSlider } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const WithConstrainedLabelPosition = (): ReactElement => (
  <StackLayout gap={6} style={{ width: "80%" }}>
    <FormField>
      <FormFieldLabel>With constrained label position</FormFieldLabel>
      <RangeSlider
        marks={[
          {
            value: 0,
            label: "Low",
          },
          {
            value: 100,
            label: "High",
          },
        ]}
        constrainLabelPosition
      />
    </FormField>
    <FormField>
      <FormFieldLabel>With constrained label position and ticks</FormFieldLabel>
      <RangeSlider
        marks={[
          {
            value: 0,
            label: "Low",
          },
          {
            value: 100,
            label: "High",
          },
        ]}
        constrainLabelPosition
        showTicks
      />
    </FormField>
  </StackLayout>
);
