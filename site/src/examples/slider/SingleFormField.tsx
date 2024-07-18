import {
  FlexLayout,
  FormField,
  FormFieldLabel,
  StackLayout,
} from "@salt-ds/core";
import { Slider } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const SingleFormField = (): ReactElement => (
  <StackLayout style={{ width: "400px" }}>
    <FormField>
      <FlexLayout gap={1}>
        <FormFieldLabel style={{ width: "max-content" }}>
          Field Label
        </FormFieldLabel>
        <Slider
          aria-label="single-form-field"
          min={0}
          max={100}
          style={{ flexGrow: 1 }}
        />
      </FlexLayout>
    </FormField>
    <FormField>
      <FormFieldLabel>Field Label</FormFieldLabel>
      <Slider
        aria-label="single-form-field"
        marks="bottom"
        min={0}
        max={50}
        step={10}
      />
    </FormField>
  </StackLayout>
);
