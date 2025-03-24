import { Slider } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Default = (): ReactElement => (
  <Slider
    aria-label="Default"
    min={0}
    max={100}
    defaultValue={30}
    style={{ width: "80%" }}
  />
);
