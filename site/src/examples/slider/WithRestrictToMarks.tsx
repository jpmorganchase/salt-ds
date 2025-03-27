import { FormField, FormFieldLabel, StackLayout } from "@salt-ds/core";
import { Slider } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const WithRestrictToMarks = (): ReactElement => (
  <StackLayout gap={6}>
    <FormField>
      <FormFieldLabel>Restricted to marks</FormFieldLabel>
      <Slider
        aria-label="Slider restricted to marks"
        style={{ width: "400px" }}
        marks={[
          { value: 5, label: "5" },
          { value: 15, label: "15" },
          { value: 25, label: "25" },
          { value: 35, label: "35" },
          { value: 70, label: "70" },
          { value: 80, label: "80" },
          { value: 90, label: "90" },
        ]}
        min={0}
        max={100}
        restrictToMarks
      />
    </FormField>
    <FormField>
      <FormFieldLabel>Restricted to marks, with ticks</FormFieldLabel>
      <Slider
        aria-label="Slider restricted to marks, with mark ticks"
        style={{ width: "400px" }}
        marks={[
          { value: 5, label: "5" },
          { value: 15, label: "15" },
          { value: 25, label: "25" },
          { value: 35, label: "35" },
          { value: 70, label: "70" },
          { value: 80, label: "80" },
          { value: 90, label: "90" },
        ]}
        min={0}
        max={100}
        restrictToMarks
        showTicks
      />
    </FormField>
  </StackLayout>
);
