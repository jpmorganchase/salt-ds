import { FormField, FormFieldLabel, StackLayout } from "@salt-ds/core";
import { Slider } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const WithFormFieldSingle = (): ReactElement => (
  <StackLayout style={{ width: "400px" }}>
    <FormField>
      <FormFieldLabel>Field Label</FormFieldLabel>
      <Slider labelPosition="bottom" min={0} max={50} step={10} />
    </FormField>
    <FormField>
      <FormFieldLabel>Field Label</FormFieldLabel>
      <Slider
        defaultValue={80}
        labelPosition="bottom"
        min={0}
        max={100}
        step={10}
      />
    </FormField>
    <FormField labelPlacement="left">
      <FormFieldLabel>Field Label</FormFieldLabel>
      <Slider min={0} max={100} />
    </FormField>
    <FormField labelPlacement="left">
      <FormFieldLabel>Field Label</FormFieldLabel>
      <Slider defaultValue={80} min={0} max={100} />
    </FormField>
  </StackLayout>
);
