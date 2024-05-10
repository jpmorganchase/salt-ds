import { makePrefixer } from "@salt-ds/core";
import { ComponentPropsWithoutRef } from "react";
import { getPercentage } from "./utils";
import { useSliderContext } from "./SliderContext";
import { clsx } from "clsx";

const withBaseName = makePrefixer("saltSliderSelection");

function getPercentageDifference(min, max, value) {
  const valueDiff = value[1] - value[0];
  const percentage = ((valueDiff - min) / (max - min)) * 100;
  return `${Math.min(Math.max(percentage, 0), 100)}%`;
}

function getPercentageOffset(min, max, value) {
  // The values mixed up the wrong way round ????
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

  const percentageOffset = getPercentageOffset(min, max, value);

  return (
    <div
      className={clsx(withBaseName(), {
        [withBaseName("range")]: Array.isArray(value),
      })}
      style={{
        width: `${percentage}`,
        left: Array.isArray(value) ? `${percentageOffset}%` : 0,
      }}
      {...props}
    />
  );
}
