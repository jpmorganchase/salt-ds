import { FormField, FormFieldLabel, Slider, StackLayout } from "@salt-ds/core";
import type { ReactElement } from "react";

export const WithConstrainedLabelPosition = (): ReactElement => (
  <StackLayout gap={6} style={{ width: "80%" }}>
    <FormField>
      <FormFieldLabel>With constrained label position</FormFieldLabel>
      <Slider
        min={0}
        max={10}
        marks={[
          {
            value: 0,
            label: "Low",
          },
          {
            value: 10,
            label: "High",
          },
        ]}
        constrainLabelPosition
      />
    </FormField>
    <FormField>
      <FormFieldLabel>With constrained label position and ticks</FormFieldLabel>
      <Slider
        min={0}
        max={10}
        marks={[
          {
            value: 0,
            label: "Low",
          },
          {
            value: 10,
            label: "High",
          },
        ]}
        constrainLabelPosition
        showTicks
      />
    </FormField>
  </StackLayout>
);
