import { StackLayout } from "@salt-ds/core";
import { RangeSlider } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const WithMarks = (): ReactElement => (
  <StackLayout gap={10}>
    <RangeSlider
      aria-label="single"
      min={0}
      max={50}
      defaultValue={[10, 30]}
      style={{ width: "400px" }}
      marks={[
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
      ]}
    />
    <RangeSlider
      aria-label="single"
      min={0}
      max={50}
      defaultValue={[10, 30]}
      style={{ width: "400px" }}
      minLabel="Very low"
      maxLabel="Very high"
      marks={[
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
      ]}
    />
  </StackLayout>
);
