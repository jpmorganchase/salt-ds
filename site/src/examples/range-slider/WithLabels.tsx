import { FormField, FormFieldLabel, StackLayout } from "@salt-ds/core";
import { RangeSlider } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const WithLabels = (): ReactElement => (
  <StackLayout gap={6} style={{ width: "80%" }}>
    <FormField>
      <FormFieldLabel>Min/max labels</FormFieldLabel>
      <RangeSlider
        min={0}
        max={100}
        minLabel="0"
        maxLabel="100"
        defaultValue={[30, 50]}
      />
    </FormField>
    <FormField>
      <FormFieldLabel>Min/max labels with accessible text</FormFieldLabel>
      <RangeSlider
        min={0}
        max={100}
        minLabel="Low"
        maxLabel="High"
        accessibleMinText="Low"
        accessibleMaxText="High"
        defaultValue={[30, 50]}
      />
    </FormField>
    <FormField>
      <FormFieldLabel>
        Min/max labelled by marks with accessible text
      </FormFieldLabel>
      <RangeSlider
        min={0}
        max={100}
        defaultValue={[30, 50]}
        accessibleMinText="Low"
        accessibleMaxText="High"
        constrainLabelPosition
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
      />
    </FormField>
  </StackLayout>
);
