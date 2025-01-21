import { FormField, FormFieldLabel, StackLayout } from "@salt-ds/core";
import { RangeSlider } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const WithFormFieldRange = (): ReactElement => {
  return (
    <StackLayout style={{ width: "400px" }}>
      <FormField labelPlacement="left">
        <FormFieldLabel>Field Label</FormFieldLabel>
        <RangeSlider min={0} max={50} step={10} />
      </FormField>

      <FormField style={{ width: "400px" }}>
        <FormFieldLabel>Field Label</FormFieldLabel>
        <RangeSlider min={0} max={50} step={10} labelPosition="bottom" />
      </FormField>
    </StackLayout>
  );
};
