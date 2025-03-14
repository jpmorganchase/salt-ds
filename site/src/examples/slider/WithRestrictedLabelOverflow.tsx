import { Slider } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const WithRestrictedLabelOverflow = (): ReactElement => (
  <Slider
    aria-label="WithRestrictedLabelOverflow"
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
    restrictLabelOverflow
  />
);
