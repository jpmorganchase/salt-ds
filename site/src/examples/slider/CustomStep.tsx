import { Slider } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const CustomStep = (): ReactElement => (
  <Slider
    aria-label="single"
    marks="all"
    min={-1}
    max={1}
    step={0.2}
    style={{ width: "400px" }}
  />
);
