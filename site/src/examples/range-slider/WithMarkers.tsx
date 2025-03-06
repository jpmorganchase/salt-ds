import { RangeSlider } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const WithMarkers = (): ReactElement => (
  <RangeSlider
    aria-label="single"
    min={0}
    max={50}
    defaultValue={[20, 50]}
    style={{ width: "400px" }}
    labelPosition="bottom"
    markers={[
      {
        value: 10,
        label: "10",
      },
      {
        value: 20,
        label: "20",
      },
      {
        value: 30,
        label: "30",
      },
      {
        value: 40,
        label: "40",
      },
    ]}
  />
);
