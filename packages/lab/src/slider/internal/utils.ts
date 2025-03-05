import type { RefObject } from "react";

export const toFloat = (value: number | string) =>
  typeof value === "string" ? Number.parseFloat(value) : value;

export const calculateMarkerPosition = (
  value: number | string,
  min: number,
  max: number,
) => {
  if (min === max) {
    return 0;
  }
  const clampedValue = Number.isNaN(toFloat(value))
    ? min
    : Math.min(Math.max(toFloat(value), min), max);
  const markerPosition = ((clampedValue - min) / (max - min)) * 100;
  return markerPosition;
};

export const calculatePercentage = (value: number, max: number, min: number) =>
  ((value - min) / (max - min)) * 100;

export const clamp = (value: number, min: number, max: number) => {
  return Number.isNaN(value) ? min : Math.min(Math.max(value, min), max);
};

export const getClickedPosition = (
  sliderRef: RefObject<HTMLDivElement>,
  clientX: number,
  min: number,
  max: number,
  step: number,
) => {
  if (!sliderRef.current) return;

  const sliderRect = sliderRef.current.getBoundingClientRect();
  const rawValue =
    ((clientX - sliderRect.left) / sliderRect.width) * (max - min) + min;
  const steppedValue = Math.round(rawValue / step) * step;
  return clamp(steppedValue, min, max);
};
