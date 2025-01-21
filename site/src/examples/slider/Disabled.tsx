import { Slider } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Disabled = (): ReactElement => (
  <Slider
    style={{ width: "400px" }}
    defaultValue={5}
    disabled
    minLabel="0"
    maxLabel="10"
  />
);
