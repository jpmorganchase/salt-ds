import { FormField, FormFieldLabel, StackLayout } from "@salt-ds/core";
import { RangeSlider } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const WithMarks = (): ReactElement => (
  <StackLayout gap={6} style={{ width: "80%" }}>
    <FormField>
      <FormFieldLabel>With marks</FormFieldLabel>
      <RangeSlider
        aria-label="Slider 1 with marks"
        min={0}
        max={50}
        defaultValue={[10, 30]}
        marks={[
          {
            value: 0,
            label: "0",
          },
          {
            value: 10,
            label: "10",
          },
          {
            value: 20,
            label: "20",
          },
          {
            value: 30,
            label: "30",
          },
          {
            value: 40,
            label: "40",
          },
          {
            value: 50,
            label: "50",
          },
        ]}
      />
    </FormField>
    <FormField>
      <FormFieldLabel>With marks & ticks</FormFieldLabel>
      <RangeSlider
        aria-label="Slider 2 with mark ticks"
        min={0}
        max={50}
        defaultValue={[10, 30]}
        showTicks
        marks={[
          {
            value: 0,
            label: "0",
          },
          {
            value: 10,
            label: "10",
          },
          {
            value: 20,
            label: "20",
          },
          {
            value: 30,
            label: "30",
          },
          {
            value: 40,
            label: "40",
          },
          {
            value: 50,
            label: "50",
          },
        ]}
      />
    </FormField>
    <FormField>
      <FormFieldLabel>With marks, ticks & min/max labels</FormFieldLabel>
      <RangeSlider
        aria-label="Slider 3 with marks"
        min={0}
        max={50}
        defaultValue={[10, 30]}
        minLabel="Very low"
        maxLabel="Very high"
        accessibleMinText="Very low"
        accessibleMaxText="Very high"
        marks={[
          {
            value: 0,
            label: "0",
          },
          {
            value: 10,
            label: "10",
          },
          {
            value: 20,
            label: "20",
          },
          {
            value: 30,
            label: "30",
          },
          {
            value: 40,
            label: "40",
          },
          {
            value: 50,
            label: "50",
          },
        ]}
      />
    </FormField>
  </StackLayout>
);
