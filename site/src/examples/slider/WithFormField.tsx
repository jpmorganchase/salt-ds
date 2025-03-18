import { FormField, FormFieldLabel } from "@salt-ds/core";
import { Slider } from "@salt-ds/lab";
import { type ReactElement, useState } from "react";

export const WithFormField = (): ReactElement => {
  const [sliderValue, setSliderValue] = useState<number>(5);

  return (
    <FormField style={{ width: "400px" }}>
      <FormFieldLabel>Field Label</FormFieldLabel>
      <Slider
        min={0}
        max={20}
        value={sliderValue}
        minLabel="0"
        maxLabel="20"
        onChange={(e, value) => {
          setSliderValue(value);
        }}
      />
    </FormField>
  );
};
