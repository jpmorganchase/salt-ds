import { makePrefixer } from "@salt-ds/core";
import { ComponentPropsWithoutRef } from "react";
import { getPercentage } from "./utils";
import { useSliderContext } from "./SliderContext";
import { clsx } from "clsx";

const withBaseName = makePrefixer("saltSliderSelection");

function getPercentageDifference(min: number, max: number, value: number[]) {
  const valueDiff = value[1] - value[0];
  const percentage = ((valueDiff - min) / (max - min)) * 100;
  return `${Math.min(Math.max(percentage, 0), 100)}%`;
}

function getPercentageOffset(min: number, max: number, value: number[]) {
  const offsetLeft = ((value[0] - min) / (max - min)) * 100;
  return Math.min(Math.max(offsetLeft, 0), 100);
}

export interface SliderSelectionProps extends ComponentPropsWithoutRef<"div"> {}

export function SliderSelection({
  ...props
}: SliderSelectionProps): JSX.Element {
  const { min, max, value } = useSliderContext();

  const percentage = Array.isArray(value)
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
        width: `${percentage}`,
        left: `${percentageOffset}%`,
      }}
      {...props}
    />
  );
}
