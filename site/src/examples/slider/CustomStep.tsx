import { FormField, FormFieldLabel, StackLayout } from "@salt-ds/core";
import { Slider } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const CustomStep = (): ReactElement => (
  <StackLayout gap={10} style={{ width: "400px" }}>
    <FormField>
      <FormFieldLabel>Step: 1 (default)</FormFieldLabel>
      <Slider min={-1} max={1} />
    </FormField>
    <FormField>
      <FormFieldLabel>Step: 0.2</FormFieldLabel>
      <Slider min={-1} max={1} step={0.2} />
    </FormField>
    <FormField>
      <FormFieldLabel>Step: 0.25 (two decimal places)</FormFieldLabel>
      <Slider min={-1} max={1} step={0.25} />
    </FormField>
    <FormField>
      <FormFieldLabel>Step: 0.3 (not multiple of total range)</FormFieldLabel>
      <Slider
        min={0}
        max={2}
        step={0.3}
        defaultValue={0.9}
        format={(value: number) => Intl.NumberFormat().format(value)}
      />
    </FormField>
  </StackLayout>
);
