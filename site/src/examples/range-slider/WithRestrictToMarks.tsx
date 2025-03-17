import { StackLayout } from "@salt-ds/core";
import { RangeSlider } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const WithRestrictToMarks = (): ReactElement => (
  <StackLayout gap={6}>
    <RangeSlider
      aria-label="Range Slider restricted to marks"
      style={{ width: "400px" }}
      marks={[
        {
          label: "0",
          value: 0,
        },
        {
          label: "1",
          value: 1,
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
          label: "10",
          value: 10,
        },
      ]}
      restrictToMarks
    />
    <RangeSlider
      aria-label="Range Slider restricted to marks with mark ticks"
      style={{ width: "400px" }}
      marks={[
        {
          label: "0",
          value: 0,
        },
        {
          label: "1",
          value: 1,
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
          label: "10",
          value: 10,
        },
      ]}
      restrictToMarks
      enableMarkTicks
    />
  </StackLayout>
);
