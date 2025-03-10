import { RangeSlider } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Disabled = (): ReactElement => (
  <RangeSlider
    defaultValue={[2, 5]}
    minLabel="0"
    maxLabel="10"
    disabled
    style={{ width: "400px" }}
  />
);
