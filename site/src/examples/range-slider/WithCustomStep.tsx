import { FormField, FormFieldLabel, StackLayout } from "@salt-ds/core";
import { RangeSlider } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const WithCustomStep = (): ReactElement => (
  <StackLayout gap={10} style={{ width: "400px" }}>
    <FormField>
      <FormFieldLabel>Step: 1 (default)</FormFieldLabel>
      <RangeSlider min={-1} max={1} minLabel="-1" maxLabel="1" />
    </FormField>
    <FormField>
      <FormFieldLabel>Step: 0.2</FormFieldLabel>
      <RangeSlider
        min={-1}
        max={1}
        step={0.2}
        minLabel="-1"
        maxLabel="1"
        format={(value: number) => Intl.NumberFormat().format(value)}
      />
    </FormField>
    <FormField>
      <FormFieldLabel>Step: 0.25 (two decimal places)</FormFieldLabel>
      <RangeSlider
        min={-1}
        max={1}
        step={0.25}
        minLabel="-1"
        maxLabel="1"
        format={(value: number) => Intl.NumberFormat().format(value)}
      />
    </FormField>
    <FormField>
      <FormFieldLabel>Step: 0.3 (not multiple of total range)</FormFieldLabel>
      <RangeSlider
        min={0}
        max={2}
        step={0.3}
        minLabel="0"
        maxLabel="2"
        format={(value: number) => Intl.NumberFormat().format(value)}
      />
    </FormField>
  </StackLayout>
);
