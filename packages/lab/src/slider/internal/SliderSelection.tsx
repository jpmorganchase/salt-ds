import { makePrefixer } from "@salt-ds/core";
import { clsx } from "clsx";
import type { ComponentPropsWithoutRef } from "react";
import { useSliderContext } from "./SliderContext";
import { getPercentage } from "./utils";

const withBaseName = makePrefixer("saltSliderSelection");

export interface SliderSelectionProps extends ComponentPropsWithoutRef<"div"> {}

export function SliderSelection({
  ...props
}: SliderSelectionProps): JSX.Element {
  const { min, max, value } = useSliderContext();

  const thumbPosition = value.map((value) => {
    return getPercentage(min, max, value);
  });

  return (
    <div
      className={clsx(withBaseName(), {
        [withBaseName("range")]: Array.isArray(value),
      })}
      style={{
        left: value.length > 1 ? `${thumbPosition[0]}%` : 0,
        width:
          value.length > 1
            ? `${thumbPosition[1] - thumbPosition[0]}%`
            : `${thumbPosition[0]}%`,
      }}
      {...props}
    />
  );
}
