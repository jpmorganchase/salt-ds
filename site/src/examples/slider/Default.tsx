import { Slider } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Default = (): ReactElement => (
  <Slider
    aria-label="single"
    min={0}
    max={100}
    defaultValue={30}
    style={{ width: "600px" }}
  />
);
