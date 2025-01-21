import { StackLayout } from "@salt-ds/core";
import { RangeSlider, Slider } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Disabled = (): ReactElement => (
  <StackLayout gap={10} style={{ width: "400px" }}>
    <Slider defaultValue={5} disabled />
    <RangeSlider defaultValue={[2, 5]} disabled />
  </StackLayout>
);
