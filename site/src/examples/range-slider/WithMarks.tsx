import {
  FormField,
  FormFieldLabel,
  RangeSlider,
  StackLayout,
} from "@salt-ds/core";
import type { ReactElement } from "react";

export const WithMarks = (): ReactElement => (
  <StackLayout gap={6} style={{ width: "80%" }}>
    <FormField>
      <FormFieldLabel>With marks</FormFieldLabel>
      <RangeSlider
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
        min={0}
        max={50}
        defaultValue={[10, 30]}
        minLabel="Low"
        maxLabel="High"
        accessibleMinText="Low"
        accessibleMaxText="High"
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
  </StackLayout>
);
