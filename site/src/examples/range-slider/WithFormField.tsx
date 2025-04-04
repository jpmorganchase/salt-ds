import { FormField, FormFieldLabel, StackLayout } from "@salt-ds/core";
import { RangeSlider } from "@salt-ds/lab";
import type { ReactElement } from "react";

const marks = [
  {
    value: 0,
    label: "0",
  },
  {
    value: 10,
    label: "10",
  },
  {
    value: 20,
    label: "20",
  },
  {
    value: 30,
    label: "30",
  },
  {
    value: 40,
    label: "40",
  },
  {
    value: 50,
    label: "50",
  },
];

export const WithFormField = (): ReactElement => {
  return (
    <StackLayout gap={3} style={{ width: "80%" }}>
      <FormField>
        <FormFieldLabel>Field label</FormFieldLabel>
        <RangeSlider minLabel="0" maxLabel="50" min={0} max={50} />
      </FormField>
      <FormField>
        <FormFieldLabel>Field label</FormFieldLabel>
        <RangeSlider
          constrainLabelPosition
          showTicks
          marks={marks}
          min={0}
          max={50}
        />
      </FormField>
      <FormField
        labelPlacement="left"
        style={
          {
            "--saltFormField-label-width": "16%",
          } as React.CSSProperties
        }
      >
        <FormFieldLabel>Field label left</FormFieldLabel>
        <RangeSlider minLabel="0" maxLabel="50" min={0} max={50} />
      </FormField>
      <FormField
        labelPlacement="left"
        style={
          {
            "--saltFormField-label-width": "16%",
          } as React.CSSProperties
        }
      >
        <FormFieldLabel>Field label left</FormFieldLabel>
        <RangeSlider
          marks={marks}
          showTicks
          constrainLabelPosition
          min={0}
          max={50}
        />
      </FormField>
    </StackLayout>
  );
};
