import type { RefObject } from "react";
import type { SliderChangeHandler, SliderValue, ThumbIndex } from "../types";

export const getValue = (
  trackRef: RefObject<Element>,
  min: number,
  max: number,
  step: number,
  clientX: number,
) => {
  const { width, x } = trackRef.current!.getBoundingClientRect();
  const localX = clientX - x;
  const normaliseBetweenValues = (localX / width) * (max - min) + min;
  const roundedToStep = roundToStep(normaliseBetweenValues, step);
  const decimals = countDecimalPlaces(step);
  const rounded = Number(roundedToStep.toFixed(decimals));
  const value = clampValue(rounded, [min, max]);
  return value;
};

export const setValue = (
  value: SliderValue,
  newValue: number,
  index: ThumbIndex,
  onChange: SliderChangeHandler,
) => {
  if (value.length === 2) {
    const newValueArray = [...value];
    newValueArray.splice(index, 1, newValue);
    onChange(newValueArray as SliderValue);
    return;
  }
  onChange([newValue]);
};

export const roundToStep = (value: number, step: number) =>
  Math.round(value / step) * step;

export const clampValue = (value: number, [min, max]: number[]) => {
  if (value > max) {
    return max;
  }
  if (value < min) {
    return min;
  }
  return value;
};

export const getPercentage = (min: number, max: number, value: number) => {
  const percentage = ((value - min) / (max - min)) * 100;
  return Math.min(Math.max(percentage, 0), 100);
};

export const getPercentageDifference = (
  min: number,
  max: number,
  value: number[],
) => {
  const valueDiff = value[1] - value[0];
  const percentage = ((valueDiff - min) / (max - min)) * 100;
  return `${Math.min(Math.max(percentage, 0), 100)}%`;
};

export const getPercentageOffset = (
  min: number,
  max: number,
  value: number[],
) => {
  const offsetLeft = ((value[0] - min) / (max - min)) * 100;
  return `${Math.min(Math.max(offsetLeft, 0), 100)}%`;
};

export const countDecimalPlaces = (num: number) => {
  const parts = num.toString().split(".");
  return parts.length > 1 ? parts[1].length : 0;
};

export const getMarkStyles = (min: number, max: number, step: number) => {
  const marks = [];
  for (let i = min; i <= max; i = Number((i + step).toPrecision(4))) {
    const value = Number(i.toPrecision(4));
    const position = `${getPercentage(min, max, value)}%`;
    marks.push({ value, position });
  }
  const decimals = Math.max(
    ...marks.map((mark) => countDecimalPlaces(mark.value)),
  );
  return marks.map((mark) => ({
    ...mark,
    label: mark.value.toFixed(decimals),
  }));
};

export const getNearestIndex = (value: SliderValue, newValue: number) => {
  if (value.length === 1) return 0;

  if (value[0] === value[1]) {
    if (newValue < value[0]) return 0;
    return 1;
  }

  const distances = value.map((value) => Math.abs(newValue - value));
  const minDistance = Math.min(...distances);
  const nearestIndex = distances.indexOf(minDistance);

  return nearestIndex as ThumbIndex;
};

export const preventOverlappingValues = (
  value: SliderValue,
  newValue: number,
  index: ThumbIndex,
) =>
  value.length === 2
    ? index === 0
      ? Math.min(newValue, value[1])
      : Math.max(newValue, value[0])
    : newValue;

export const parseValueProp = (
  value: number[] | undefined,
  min: number,
  max: number,
) => {
  if (typeof value === "undefined" || value.length < 1) return;
  const a = clampValue(value[0], [min, max]);
  if (value.length === 1) return [a] as SliderValue;
  const b = clampValue(value[1], [min, max]);
  if (a > b) return [a, a] as SliderValue;
  return [a, b] as SliderValue;
};
