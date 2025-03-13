import { Slider } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const WithFormatting = (): ReactElement => (
  <Slider
    defaultValue={5}
    style={{ width: "400px" }}
    minLabel="0€"
    maxLabel="10€"
    format={(value: number) =>
      Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
      }).format(value)
    }
  />
);
