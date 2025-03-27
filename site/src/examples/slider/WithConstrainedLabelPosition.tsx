import { Slider } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const WithConstrainedLabelPosition = (): ReactElement => (
  <Slider
    aria-label="WithConstrainedLabelPosition"
    style={{ width: "600px" }}
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
