import { StackLayout } from "@salt-ds/core";
import { Slider } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const WithMarks = (): ReactElement => (
  <StackLayout gap={10}>
    <Slider
      aria-label="Slider 1 with marks"
      min={0}
      max={50}
      defaultValue={30}
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
    <Slider
      aria-label="Slider 2 with mark ticks"
      min={0}
      max={50}
      defaultValue={30}
      style={{ width: "400px" }}
      showTicks
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
    <Slider
      aria-label="Slider 3 with marks"
      min={0}
      max={50}
      defaultValue={30}
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
