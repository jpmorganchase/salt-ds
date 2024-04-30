import { SliderValue, SliderChangeHandler } from "../types";
import { RefObject, MouseEvent } from "react";

export const getValue = (
  trackRef: RefObject<Element>,
  min: number,
  max: number,
  step: number,
  setValue: SliderChangeHandler,
  onChange: SliderChangeHandler | undefined,
  event: MouseEvent
) => {
  const { clientX } = event;
  if (trackRef.current) {
    const { width, x } = trackRef.current.getBoundingClientRect();
    const localX = clientX - x;
    const normaliseBetweenValues = (localX / width) * (max - min) + min;
    let value = roundToStep(normaliseBetweenValues, step);
    value = roundToTwoDp(value);
    value = clampValue(value, min, max);
    setValue(value);
    onChange?.(value);
  }
};

export const roundToTwoDp = (value: number) => Math.round(value * 100) / 100;

export const roundToStep = (value: number, step: number) =>
  Math.round(value / step) * step;

export const clampValue = (value: SliderValue, min: number, max: number) => {
  if (value > max) {
    return max;
  }
  if (value < min) {
    return min;
  }
  return value;
};

export function getPercentage(min: number, max: number, value: number) {
  const percentage = ((value - min) / (max - min)) * 100;
  return `${Math.min(Math.max(percentage, 0), 100)}%`;
}

export function getMarkStyles(min: number, max: number, step: number) {
  const marks = [];
  for (let i = min; i <= max; i = i + step) {
    const MarkPosition = getPercentage(min, max, i);
    const MarkLabel = roundToTwoDp(i);
    marks.push({ index: MarkLabel, position: MarkPosition });
  }

  return marks;
}
