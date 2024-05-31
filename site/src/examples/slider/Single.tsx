import { ReactElement } from "react";
import { Slider } from "@salt-ds/lab";
import { StackLayout } from "@salt-ds/core";

export const Single = (): ReactElement => (
  <StackLayout gap={3}>
    <Slider aria-label="single" min={0} max={100} style={{ width: "400px" }} />
    <Slider
      aria-label="single"
      marks="all"
      min={0}
      max={50}
      step={10}
      style={{ width: "400px" }}
    />
  </StackLayout>
);
