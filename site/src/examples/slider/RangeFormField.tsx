import {
  FlexLayout,
  FormField,
  FormFieldLabel,
  StackLayout,
} from "@salt-ds/core";
import { Slider } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const RangeFormField = (): ReactElement => (
  <StackLayout style={{ width: "400px" }}>
    <FormField>
      <FlexLayout gap={1} align="center">
        <FormFieldLabel style={{ width: "max-content" }}>
          Field Label
        </FormFieldLabel>
        <Slider
          aria-label="range-form-field"
          defaultValue={[20, 80]}
          min={0}
          max={100}
          style={{ flexGrow: 1 }}
        />
      </FlexLayout>
    </FormField>
    <FormField>
      <FormFieldLabel>Field Label</FormFieldLabel>
      <Slider
        aria-label="range-form-field"
        defaultValue={[20, 80]}
        marks="bottom"
        min={0}
        max={100}
        step={10}
      />
    </FormField>
  </StackLayout>
);
