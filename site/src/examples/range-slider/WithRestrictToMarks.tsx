import { FormField, FormFieldLabel, StackLayout } from "@salt-ds/core";
import { RangeSlider } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const WithRestrictToMarks = (): ReactElement => (
  <StackLayout gap={6} style={{ width: "80%" }}>
    <FormField>
      <FormFieldLabel>Restricted to marks</FormFieldLabel>
      <RangeSlider
        aria-label="RangeSlider restricted to marks"
        marks={[
          { value: 0, label: "0" },
          { value: 15, label: "15" },
          { value: 25, label: "25" },
          { value: 35, label: "35" },
          { value: 70, label: "70" },
          { value: 80, label: "80" },
          { value: 100, label: "100" },
        ]}
        min={0}
        max={100}
        restrictToMarks
      />
    </FormField>
    <FormField>
      <FormFieldLabel>Restricted to marks, with ticks</FormFieldLabel>
      <RangeSlider
        aria-label="Restricted to marks with mark ticks"
        marks={[
          { value: 0, label: "0" },
          { value: 15, label: "15" },
          { value: 25, label: "25" },
          { value: 35, label: "35" },
          { value: 70, label: "70" },
          { value: 80, label: "80" },
          { value: 100, label: "100" },
        ]}
        min={0}
        max={100}
        restrictToMarks
        showTicks
      />
    </FormField>
  </StackLayout>
);
