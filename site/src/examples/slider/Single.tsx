import { StackLayout } from "@salt-ds/core";
import { Slider } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Single = (): ReactElement => (
  <StackLayout gap={3}>
    <Slider
      aria-label="single"
      min={0}
      max={100}
      defaultValue={30}
      style={{ width: "400px" }}
    />
    <Slider
      aria-label="single with bottom labels"
      min={0}
      max={100}
      defaultValue={30}
      style={{ width: "400px" }}
      labelPosition="bottom"
    />
  </StackLayout>
);
