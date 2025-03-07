import { StackLayout } from "@salt-ds/core";
import { RangeSlider } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const WithCustomLabels = (): ReactElement => (
  <StackLayout gap={3}>
    <RangeSlider
      aria-label="single"
      min={0}
      max={50}
      defaultValue={[20, 50]}
      style={{ width: "400px" }}
      minLabel="Very low"
      maxLabel="Very high"
    />
    <RangeSlider
      aria-label="single"
      min={0}
      max={50}
      defaultValue={[20, 50]}
      style={{ width: "400px" }}
      minLabel="Very low"
      maxLabel="Very high"
      labelPosition="bottom"
    />
  </StackLayout>
);
