import { RangeSlider } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const WithFormatting = (): ReactElement => (
  <RangeSlider
    defaultValue={[2, 5]}
    format={(value: number) => `${value}%`}
    style={{ width: "400px" }}
  />
);
