import { RangeSlider } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const WithConstrainedLabelPosition = (): ReactElement => (
  <RangeSlider
    aria-label="WithConstrainedLabelPosition"
    style={{ width: "400px" }}
    marks={[
      {
        value: 0,
        label: "Very low",
      },
      {
        value: 10,
        label: "Very high",
      },
    ]}
    constrainLabelPosition
  />
);
