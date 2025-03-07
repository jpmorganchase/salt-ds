import { StackLayout } from "@salt-ds/core";
import { RangeSlider } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Labels = (): ReactElement => (
  <StackLayout gap={3}>
    <RangeSlider
      aria-label="single"
      min={0}
      max={100}
      defaultValue={[30, 50]}
      style={{ width: "400px" }}
    />
    <RangeSlider
      aria-label="single"
      min={0}
      max={100}
      defaultValue={[30, 50]}
      style={{ width: "400px" }}
      labelPosition="bottom"
    />
  </StackLayout>
);
