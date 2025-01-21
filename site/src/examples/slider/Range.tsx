import { StackLayout } from "@salt-ds/core";
import { RangeSlider } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Range = (): ReactElement => (
  <StackLayout gap={3}>
    <RangeSlider
      aria-label="range"
      style={{ width: "400px" }}
      defaultValue={[20, 50]}
      min={0}
      max={100}
    />
    <RangeSlider
      aria-label="range with bottom labels"
      style={{ width: "400px" }}
      defaultValue={[20, 50]}
      min={0}
      max={100}
      labelPosition="bottom"
    />
  </StackLayout>
);
