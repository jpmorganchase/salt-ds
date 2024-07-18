import { StackLayout } from "@salt-ds/core";
import { Slider } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Range = (): ReactElement => (
  <StackLayout gap={3}>
    <Slider
      aria-label="range"
      style={{ width: "400px" }}
      defaultValue={[20, 60]}
      min={0}
      max={100}
    />
    <Slider
      aria-label="range"
      style={{ width: "400px" }}
      defaultValue={[20, 60]}
      min={0}
      max={100}
      marks="bottom"
    />
  </StackLayout>
);
