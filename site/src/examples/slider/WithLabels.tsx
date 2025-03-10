import { StackLayout } from "@salt-ds/core";
import { Slider } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const WithLabels = (): ReactElement => (
  <StackLayout gap={3}>
    <Slider
      aria-label="single"
      min={0}
      max={100}
      minLabel="0"
      maxLabel="100"
      defaultValue={30}
      style={{ width: "400px" }}
    />
    <Slider
      aria-label="single"
      min={0}
      max={100}
      defaultValue={30}
      style={{ width: "400px" }}
      marks={[
        {
          value: 0,
          label: "0",
        },
        {
          value: 100,
          label: "100",
        },
      ]}
    />
  </StackLayout>
);
