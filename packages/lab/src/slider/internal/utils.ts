import type { RefObject } from "react";

export const interactiveKeys = [
  "ArrowUp",
  "ArrowRight",
  "ArrowDown",
  "ArrowLeft",
  "PageUp",
  "PageDown",
  "Home",
  "End",
];

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
  decimalPlaces: number,
  marks?: { value: number; label: string }[],
  restrictToMarks?: boolean,
) => {
  if (Number.isNaN(value)) {
    return min;
  }
  // Clamp the value between min and max
  const clampedValue = Math.min(Math.max(value, min), max);
  if (restrictToMarks && marks) {
    // Find the closest mark value
    let closestMark = marks[0].value;
    let smallestDifference = Math.abs(clampedValue - closestMark);
    for (let i = 1; i < marks.length; i++) {
      const currentDifference = Math.abs(clampedValue - marks[i].value);
      if (currentDifference < smallestDifference) {
        smallestDifference = currentDifference;
        closestMark = marks[i].value;
      }
    }
    return closestMark;
  }
  // Round to the nearest multiple of the step
  let roundedValue = Math.round(clampedValue / step) * step;
  // Ensure the rounded value does not exceed max or min
  if (roundedValue > max) {
    roundedValue = max;
  } else if (roundedValue < min) {
    roundedValue = min;
  }
  return Number.parseFloat(roundedValue.toFixed(decimalPlaces));
};

export const clampRange = (
  range: [number, number],
  max: number,
  min: number,
  step: number,
  decimalPlaces: number,
  marks?: { value: number; label: string }[],
  restrictToMarks?: boolean,
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
  start = clamp(start, max, min, step, decimalPlaces, marks, restrictToMarks);
  end = clamp(end, max, min, step, decimalPlaces, marks, restrictToMarks);
  return [start, end] as [number, number];
};

export const getClickedPosition = (
  sliderRef: RefObject<HTMLDivElement>,
  clientX: number,
  max: number,
  min: number,
  step: number,
  decimalPlaces: number,
  marks?: { label: string; value: number }[],
  restrictToMarks?: boolean,
) => {
  if (!sliderRef.current) return;

  const sliderRect = sliderRef.current.getBoundingClientRect();
  const rawValue =
    ((clientX - sliderRect.left) / sliderRect.width) * (max - min) + min;
  const steppedValue = Math.round(rawValue / step) * step;
  return clamp(
    steppedValue,
    max,
    min,
    step,
    decimalPlaces,
    marks,
    restrictToMarks,
  );
};

export const getKeyboardValue = (
  event: React.KeyboardEvent,
  value: number,
  step: number,
  stepMultiplier: number,
  max: number,
  min: number,
  restrictToMarks?: boolean,
  marks?: { label: string; value: number }[],
) => {
  let newValue = value;

  if (restrictToMarks && marks && marks.length >= 1) {
    const currentIndex = marks.findIndex((mark) => mark.value === value);

    switch (event.key) {
      case "ArrowUp":
      case "ArrowRight":
      case "PageUp":
        if (currentIndex < marks.length - 1) {
          newValue = marks[currentIndex + 1].value;
        }
        break;
      case "ArrowDown":
      case "ArrowLeft":
      case "PageDown":
        if (currentIndex > 0) {
          newValue = marks[currentIndex - 1].value;
        }
        break;
      default:
        return newValue;
    }
  } else {
    switch (event.key) {
      case "ArrowUp":
      case "ArrowRight":
        newValue = Math.min(value + step, max);
        break;
      case "ArrowDown":
      case "ArrowLeft":
        newValue = Math.max(value - step, min);
        break;
      case "Home":
        newValue = min;
        break;
      case "End":
        newValue = max;
        break;
      case "PageUp":
        newValue = Math.min(value + step * stepMultiplier, max);
        break;
      case "PageDown":
        newValue = Math.max(value - step * stepMultiplier, min);
        break;
      default:
        return newValue;
    }
  }

  event.preventDefault();
  return newValue;
};
