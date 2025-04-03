import { FormField, FormFieldLabel, StackLayout } from "@salt-ds/core";
import { Slider } from "@salt-ds/lab";
import type { ReactElement } from "react";

const marks = [
  {
    label: "0",
    value: 0,
  },
  {
    label: "1",
    value: 1,
  },
  {
    label: "2",
    value: 2,
  },
  {
    label: "3",
    value: 3,
  },
  {
    label: "4",
    value: 4,
  },
  {
    label: "5",
    value: 5,
  },
  {
    label: "6",
    value: 6,
  },
  {
    label: "7",
    value: 7,
  },
  {
    label: "8",
    value: 8,
  },
  {
    label: "9",
    value: 9,
  },
  {
    label: "10",
    value: 10,
  },
];

export const WithFormField = (): ReactElement => {
  return (
    <StackLayout gap={3} style={{ width: "80%" }}>
      <FormField>
        <FormFieldLabel>Field label</FormFieldLabel>
        <Slider minLabel="0" maxLabel="10" />
      </FormField>
      <FormField>
        <FormFieldLabel>Field label</FormFieldLabel>
        <Slider constrainLabelPosition showTicks marks={marks} />
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
        <Slider minLabel="0" maxLabel="10" />
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
        <Slider marks={marks} showTicks constrainLabelPosition />
      </FormField>
    </StackLayout>
  );
};
