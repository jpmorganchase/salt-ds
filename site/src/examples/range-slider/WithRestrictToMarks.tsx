import { FormField, FormFieldLabel, StackLayout } from "@salt-ds/core";
import { RangeSlider } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const WithRestrictToMarks = (): ReactElement => (
  <StackLayout gap={6}>
    <FormField>
      <FormFieldLabel>Restricted to marks</FormFieldLabel>
      <RangeSlider
        aria-label="RangeSlider restricted to marks"
        style={{ width: "400px" }}
        marks={[
          {
            label: "0",
            value: 0,
          },
          {
            label: "1",
            value: 1,
          },

          {
            label: "5",
            value: 5,
          },
          {
            label: "6",
            value: 6,
          },
          {
            label: "7",
            value: 7,
          },
          {
            label: "10",
            value: 10,
          },
        ]}
        restrictToMarks
      />
    </FormField>
    <FormField>
      <FormFieldLabel>Restricted to marks, with ticks</FormFieldLabel>
      <RangeSlider
        aria-label="Restricted to marks with mark ticks"
        style={{ width: "400px" }}
        marks={[
          {
            label: "0",
            value: 0,
          },
          {
            label: "1",
            value: 1,
          },

          {
            label: "5",
            value: 5,
          },
          {
            label: "6",
            value: 6,
          },
          {
            label: "7",
            value: 7,
          },
          {
            label: "10",
            value: 10,
          },
        ]}
        restrictToMarks
        showTicks
      />
    </FormField>
  </StackLayout>
);
