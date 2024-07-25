import { StackLayout } from "@salt-ds/core";
import { Slider } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const CustomStep = (): ReactElement => (
  <StackLayout gap={5} style={{ width: "400px" }}>
    <Slider min={-1} max={1} marks="all" />
    <Slider min={-1} max={1} step={0.5} marks="all" />
    <Slider min={-1} max={1} step={0.2} marks="all" />
    <Slider min={-1} max={1} step={0.25} marks="all" />
  </StackLayout>
);
