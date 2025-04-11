import { RangeSlider } from "@salt-ds/core";
import type { ReactElement } from "react";

export const WithFormatting = (): ReactElement => (
  <RangeSlider
    aria-label="With formatting"
    style={{ width: "80%" }}
    minLabel="€0"
    maxLabel="€100"
    format={(value: number) =>
      Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
      }).format(value)
    }
  />
);
