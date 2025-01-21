import { FormField, FormFieldLabel, StackLayout } from "@salt-ds/core";
import { Slider } from "@salt-ds/lab";
import { type ChangeEvent, type ReactElement, useState } from "react";

export const WithFormFieldSingle = (): ReactElement => {
  const [inputValue, setInputValue] = useState<number | string>(5);
  const [sliderValue, setSliderValue] = useState<number>(5);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    setInputValue(inputValue);
    if (Number.isNaN(Number(inputValue))) return;
    setSliderValue(Number.parseFloat(inputValue));
  };

  return (
    <StackLayout style={{ width: "400px" }}>
      <FormField labelPlacement="left">
        <FormFieldLabel>Field Label</FormFieldLabel>
        <Slider min={0} max={50} step={10} />
      </FormField>

      <FormField>
        <FormFieldLabel>Field Label</FormFieldLabel>
        <Slider
          defaultValue={80}
          min={0}
          max={20}
          value={sliderValue}
          labelPosition="bottom"
          onChange={(e, value) => {
            setSliderValue(value);
            setInputValue(value);
          }}
        />
      </FormField>
    </StackLayout>
  );
};
