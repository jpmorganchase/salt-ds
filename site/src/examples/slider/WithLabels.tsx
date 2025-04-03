import { FormField, FormFieldLabel, StackLayout } from "@salt-ds/core";
import { Slider } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const WithLabels = (): ReactElement => (
  <StackLayout gap={6} style={{ width: "80%" }}>
    <FormField>
      <FormFieldLabel>Min/max labels</FormFieldLabel>
      <Slider
        aria-label="single"
        min={0}
        max={100}
        minLabel="0"
        maxLabel="100"
        defaultValue={30}
      />
    </FormField>
    <FormField>
      <FormFieldLabel>Min/max labels with accessible text</FormFieldLabel>
      <Slider
        aria-label="single"
        min={0}
        max={100}
        minLabel="Very low"
        maxLabel="Very high"
        accessibleMinText="Very low"
        accessibleMaxText="Very high"
        defaultValue={30}
      />
    </FormField>
    <FormField>
      <FormFieldLabel>
        Min/max labelled by marks with accessible text
      </FormFieldLabel>
      <Slider
        aria-label="single"
        min={0}
        max={100}
        defaultValue={30}
        accessibleMinText="Very low"
        accessibleMaxText="Very high"
        marks={[
          {
            value: 0,
            label: "Very low",
          },
          {
            value: 100,
            label: "Very high",
          },
        ]}
      />
    </FormField>
  </StackLayout>
);
