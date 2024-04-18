import { makePrefixer } from "@salt-ds/core";
import { ComponentPropsWithoutRef } from "react";
import {
  getPercentage,
  getPercentageDifference,
  getPercentageOffset,
} from "./utils";
import { useSliderContext } from "./SliderContext";
import { clsx } from "clsx";

const withBaseName = makePrefixer("saltSliderSelection");

export interface SliderSelectionProps extends ComponentPropsWithoutRef<"div"> {}

export function SliderSelection({
  ...props
}: SliderSelectionProps): JSX.Element {
  const { min, max, value } = useSliderContext();

  const percentageDifference = Array.isArray(value)
    ? getPercentageDifference(min, max, value)
    : getPercentage(min, max, value);

  const percentageOffset = Array.isArray(value)
    ? getPercentageOffset(min, max, value)
    : 0;

  return (
    <div
      className={clsx(withBaseName(), {
        [withBaseName("range")]: Array.isArray(value),
      })}
      style={{
        width: percentageDifference,
        left: percentageOffset,
      }}
      {...props}
    />
  );
}
