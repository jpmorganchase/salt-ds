import { FormField, FormFieldLabel } from "@salt-ds/core";
import { Slider } from "@salt-ds/lab";
import { type ReactElement, useState } from "react";

export const WithFormField = (): ReactElement => {
  const [sliderValue, setSliderValue] = useState<number>(5);

  return (
    <FormField style={{ width: "400px" }}>
      <FormFieldLabel>Field Label</FormFieldLabel>
      <Slider
        defaultValue={80}
        min={0}
        max={20}
        value={sliderValue}
        labelPosition="bottom"
        onChange={(e, value) => {
          setSliderValue(value);
        }}
      />
    </FormField>
  );
};
