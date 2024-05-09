import { makePrefixer } from "@salt-ds/core";
import { ComponentPropsWithoutRef } from "react";
import { getPercentage } from "./utils";
import { useSliderContext } from "./SliderContext";
import { clsx } from "clsx";

const withBaseName = makePrefixer("saltSliderSelection");

function getPercentageDifference(min, max, value) {
  const valueDiff = value[0] - value[1]; //This breaks if the thumbs swap over
  return getPercentage(min, max, valueDiff);
}

function getPercentageOffset(min, max, value) {
  // The values mixed up the wrong way round ????
  const offsetRight = ((value[1] - min) / (max - min)) * 100;

  return Math.min(Math.max(offsetRight, 0), 100);
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
      style={{ width: `${percentage}`, left: `${percentageOffset}%` }}
      {...props}
    />
  );
}
