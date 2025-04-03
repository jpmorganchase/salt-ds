import { RangeSlider } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Default = (): ReactElement => (
  <RangeSlider aria-label="single" style={{ width: "600px" }} />
);
