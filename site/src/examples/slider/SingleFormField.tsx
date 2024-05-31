import { ReactElement } from "react";
import { Slider } from "@salt-ds/lab";
import {
  StackLayout,
  FormField,
  FormFieldLabel,
  FlexLayout,
} from "@salt-ds/core";

export const SingleFormField = (): ReactElement => (
  <StackLayout style={{ width: "400px" }}>
    <FormField>
      <FlexLayout gap={1}>
        <FormFieldLabel style={{ width: "max-content" }}>
          Field Label
        </FormFieldLabel>
        <Slider aria-label="single" min={0} max={100} style={{ flexGrow: 1 }} />
      </FlexLayout>
    </FormField>
    <FormField>
      <FormFieldLabel> Field Label </FormFieldLabel>
      <Slider aria-label="single" marks="bottom" min={0} max={50} step={10} />
    </FormField>
  </StackLayout>
);
