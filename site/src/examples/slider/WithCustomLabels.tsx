import { Slider } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const WithCustomLabels = (): ReactElement => (
  <Slider
    aria-label="single"
    min={0}
    max={50}
    defaultValue={30}
    style={{ width: "400px" }}
    minLabel="Very low"
    maxLabel="Very high"
    labelPosition="bottom"
  />
);
