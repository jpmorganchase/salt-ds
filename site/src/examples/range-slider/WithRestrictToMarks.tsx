import {
  FormField,
  FormFieldLabel,
  RangeSlider,
  StackLayout,
} from "@salt-ds/core";
import type { ReactElement } from "react";

export const WithRestrictToMarks = (): ReactElement => (
  <StackLayout gap={6} style={{ width: "80%" }}>
    <FormField>
      <FormFieldLabel>Restricted to marks</FormFieldLabel>
      <RangeSlider
        marks={[
          { value: 0, label: "0" },
          { value: 15, label: "15" },
          { value: 35, label: "35" },
          { value: 70, label: "70" },
          { value: 85, label: "85" },
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
        marks={[
          { value: 0, label: "0" },
          { value: 15, label: "15" },
          { value: 35, label: "35" },
          { value: 70, label: "70" },
          { value: 85, label: "85" },
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
