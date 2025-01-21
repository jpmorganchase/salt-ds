import { StackLayout } from "@salt-ds/core";
import { RangeSlider, Slider } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const WithFormatting = (): ReactElement => (
  <StackLayout gap={10} style={{ width: "400px" }}>
    <Slider
      defaultValue={5}
      format={(value: number) =>
        Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "EUR",
          maximumFractionDigits: 0,
        }).format(value)
      }
    />
    <RangeSlider
      defaultValue={[2, 5]}
      format={(value: number) => `${value}%`}
    />
  </StackLayout>
);
