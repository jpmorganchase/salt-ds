import { SliderValue } from "../types";

export const roundToTwoDp = (value: number) => Math.round(value * 100) / 100;

export const roundToStep = (value: number, step: number) =>
  Math.round(value / step) * step;

export const clampValue = (
  value: SliderValue,
  newValue: SliderValue,
  min: number,
  max: number
) => {
  if (newValue > max) {
    return value;
  }
  if (newValue < min) {
    return value;
  }
  return newValue;
};

export function getPercentage(min: number, max: number, value: number) {
  const percentage = ((value - min) / (max - min)) * 100;
  return `${Math.min(Math.max(percentage, 0), 100)}%`;
}
