import { StackLayout } from "@salt-ds/core";
import { RangeSlider, Slider } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const WithCustomLabels = (): ReactElement => (
  <StackLayout gap={3}>
    <Slider
      aria-label="single"
      min={0}
      max={50}
      defaultValue={50}
      style={{ width: "400px" }}
      minLabel="Very low"
      maxLabel="Very high"
      labelPosition="bottom"
    />
    <RangeSlider
      aria-label="single"
      min={0}
      max={50}
      defaultValue={[20, 50]}
      style={{ width: "400px" }}
      minLabel="About 1 paragraph"
      maxLabel="About 1 page"
      labelPosition="bottom"
    />
  </StackLayout>
);
