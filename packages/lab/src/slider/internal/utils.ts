import type { RefObject } from "react";
import type { SliderChangeHandler, SliderValue } from "../types";

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
  const rounded = Number(roundedToStep.toFixed(1));
  const value = clampValue(rounded, min, max);
  return value;
};

export const setValue = (
  value: SliderValue,
  newValue: number,
  index: number,
  onChange: SliderChangeHandler,
) => {
  const newValueArray = [...value];
  newValueArray.splice(index, 1, newValue);
  onChange(newValueArray);
};

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

export const getNearestIndex = (value: number[], newValue: number) => {
  if (value.length === 1) return 0;

  const nearestIndex = value.reduce((acc, value) => {
    const difference = Math.abs(newValue - value);
    const prevDifference = Math.abs(newValue - acc);
    const index = difference < prevDifference ? 1 : 0;
    return index;
  }, 0);
  return nearestIndex;
};
