import { RangeSlider } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const WithCustomLabels = (): ReactElement => (
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
);
