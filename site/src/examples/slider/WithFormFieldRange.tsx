import { FormField, FormFieldLabel, StackLayout } from "@salt-ds/core";
import { RangeSlider } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const WithFormFieldRange = (): ReactElement => (
  <StackLayout style={{ width: "400px" }}>
    <FormField>
      <FormFieldLabel>Field Label</FormFieldLabel>
      <RangeSlider labelPosition="bottom" min={0} max={50} step={10} />
    </FormField>
    <FormField>
      <FormFieldLabel>Field Label</FormFieldLabel>
      <RangeSlider
        defaultValue={[30, 80]}
        labelPosition="bottom"
        min={0}
        max={100}
        step={10}
      />
    </FormField>
    <FormField labelPlacement="left">
      <FormFieldLabel>Field Label</FormFieldLabel>
      <RangeSlider min={0} max={100} defaultValue={[30, 80]} />
    </FormField>
    <FormField labelPlacement="left">
      <FormFieldLabel>Field Label</FormFieldLabel>
      <RangeSlider min={0} max={100} defaultValue={[30, 80]} />
    </FormField>
  </StackLayout>
);
