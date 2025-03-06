import { FormField, FormFieldLabel } from "@salt-ds/core";
import { RangeSlider } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const WithFormField = (): ReactElement => {
  return (
    <FormField style={{ width: "400px" }}>
      <FormFieldLabel>Field Label</FormFieldLabel>
      <RangeSlider min={0} max={50} step={10} labelPosition="bottom" />
    </FormField>
  );
};
