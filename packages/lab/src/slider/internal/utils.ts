import type { RefObject } from "react";

export const toFloat = (value: number | string) =>
  typeof value === "string" ? Number.parseFloat(value) : value;

export const calculateMarkPosition = (
  value: number | string,
  max: number,
  min: number,
) => {
  if (min === max) {
    return 0;
  }
  const clampedValue = Number.isNaN(toFloat(value))
    ? min
    : Math.min(Math.max(toFloat(value), min), max);
  const markPosition = ((clampedValue - min) / (max - min)) * 100;
  return Math.round(markPosition * 100) / 100;
};

export const calculatePercentage = (value: number, max: number, min: number) =>
  ((value - min) / (max - min)) * 100;

export const clamp = (
  value: number,
  max: number,
  min: number,
  step: number,
) => {
  if (Number.isNaN(value)) {
    return min;
  }
  // Clamp the value between min and max
  const clampedValue = Math.min(Math.max(value, min), max);
  // Round to the next positive multiple of the step
  const remainder = clampedValue % step;
  const roundedValue =
    remainder === 0 ? clampedValue : clampedValue + step - remainder;
  return roundedValue;
};

export const clampRange = (
  range: [number, number],
  max: number,
  min: number,
  step: number,
) => {
  let [start, end] = range;

  if (Number.isNaN(start)) {
    start = min;
  }
  if (Number.isNaN(end)) {
    end = max;
  }
  if (start > end) {
    [start, end] = [end, start];
  }
  // Clamp the start and end values
  start = Math.min(Math.max(start, min), max);
  end = Math.min(Math.max(end, min), max);
  // Round to the next positive multiple of the step
  const roundToNextMultiple = (value: number) => {
    const remainder = value % step;
    return remainder === 0 ? value : value + step - remainder;
  };
  start = roundToNextMultiple(start);
  end = roundToNextMultiple(end);
  return [start, end] as [number, number];
};

export const getClickedPosition = (
  sliderRef: RefObject<HTMLDivElement>,
  clientX: number,
  max: number,
  min: number,
  step: number,
) => {
  if (!sliderRef.current) return;

  const sliderRect = sliderRef.current.getBoundingClientRect();
  const rawValue =
    ((clientX - sliderRect.left) / sliderRect.width) * (max - min) + min;
  const steppedValue = Math.round(rawValue / step) * step;
  return clamp(steppedValue, max, min, step);
};
