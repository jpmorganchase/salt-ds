import { RangeSlider } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Disabled = (): ReactElement => (
  <RangeSlider minLabel="0" maxLabel="100" disabled style={{ width: "80%" }} />
);
