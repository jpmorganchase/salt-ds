import { FormField, FormFieldLabel, RangeSlider } from "@salt-ds/core";
import type { ReactElement } from "react";

export const WithFormField = (): ReactElement => {
  return (
    <FormField style={{ width: "400px" }}>
      <FormFieldLabel>Field Label</FormFieldLabel>
      <RangeSlider min={0} max={50} step={10} minLabel="0" maxLabel="50" />
    </FormField>
  );
};
