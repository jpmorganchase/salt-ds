import { RefObject } from "react";
import { SliderChangeHandler, SliderValue } from "../types";

export function getValue(
  trackRef: RefObject<Element>,
  min: number,
  max: number,
  step: number,
  clientX: number
) {
  const { width, x } = trackRef.current!.getBoundingClientRect();
  const localX = clientX - x;
  const normaliseBetweenValues = (localX / width) * (max - min) + min;
  let value = roundToStep(normaliseBetweenValues, step);
  value = roundToTwoDp(value);
  value = clampValue(value, min, max);
  return value;
}

export function setValue(
  value: SliderValue,
  newValue: number,
  index: number,
  onChange: SliderChangeHandler
) {
  const newValueArray = [...value];
  newValueArray.splice(index, 1, newValue);
  onChange(newValueArray);
}

export const roundToTwoDp = (value: number) => Math.round(value * 100) / 100;

export const roundToStep = (value: number, step: number) =>
  Math.round(value / step) * step;

export const clampValue = (value: number, min: number, max: number) => {
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
  return Math.min(Math.max(percentage, 0), 100);
}

export function getPercentageDifference(
  min: number,
  max: number,
  value: number[]
) {
  const valueDiff = value[1] - value[0];
  const percentage = ((valueDiff - min) / (max - min)) * 100;
  return `${Math.min(Math.max(percentage, 0), 100)}%`;
}

export function getPercentageOffset(min: number, max: number, value: number[]) {
  const offsetLeft = ((value[0] - min) / (max - min)) * 100;
  return `${Math.min(Math.max(offsetLeft, 0), 100)}%`;
}

export function getMarkStyles(min: number, max: number, step: number) {
  const marks = [];
  for (let i = min; i <= max; i = i + step) {
    const MarkPosition = getPercentage(min, max, i);
    const MarkLabel = roundToTwoDp(i);
    marks.push({ index: MarkLabel, position: `${MarkPosition}%` });
  }
  return marks;
}

export function getNearestIndex(value: number[], newValue: number) {
  if (value.length === 1) return 0;

  const nearestIndex = value.reduce((acc, value) => {
    const difference = Math.abs(newValue - value);
    const prevDifference = Math.abs(newValue - acc);
    const index = difference < prevDifference ? 1 : 0;
    return index;
  }, 0);
  return nearestIndex;
}
