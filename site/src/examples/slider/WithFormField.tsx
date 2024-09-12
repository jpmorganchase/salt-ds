import { FormField, FormFieldLabel, StackLayout } from "@salt-ds/core";
import { Slider } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const WithFormField = (): ReactElement => (
  <StackLayout style={{ width: "400px" }}>
    <FormField>
      <FormFieldLabel>Field Label</FormFieldLabel>
      <Slider marks="bottom" min={0} max={50} step={10} />
    </FormField>
    <FormField>
      <FormFieldLabel>Field Label</FormFieldLabel>
      <Slider
        defaultValue={[20, 80]}
        marks="bottom"
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
      <Slider defaultValue={[20, 80]} min={0} max={100} />
    </FormField>
  </StackLayout>
);
