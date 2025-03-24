import { Slider } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Disabled = (): ReactElement => (
  <Slider style={{ width: "80%" }} disabled minLabel="0" maxLabel="100" />
);
