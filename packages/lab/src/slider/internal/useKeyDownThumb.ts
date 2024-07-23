import type { SliderChangeHandler, SliderValue } from "../types";
import { clampValue, roundToStep, setValue } from "./utils";

const getValueFromKeyName = (
  keyName: string,
  value: number,
  min: number,
  max: number,
  step: number,
) => {
  switch (keyName) {
    case "Home":
      return min;
    case "End":
      return max;
    case "ArrowUp":
    case "ArrowRight":
      return value + step;
    case "ArrowDown":
    case "ArrowLeft":
      return value - step;
    default:
      return value;
  }
};

export const useKeyDownThumb = (
  min: number,
  max: number,
  step: number,
  value: SliderValue,
  onChange: SliderChangeHandler,
  index: number,
) => {
  return (event: React.KeyboardEvent) => {
    const rawValue = getValueFromKeyName(
      event.key,
      value[index],
      min,
      max,
      step,
    );

    const roundedToStep = roundToStep(rawValue, step);
    const rounded = Number(roundedToStep.toFixed(1));
    const clamped = clampValue(rounded, [min, max]);

    const newValue =
      value.length > 1
        ? index === 0
          ? Math.min(clamped, value[1] - step)
          : Math.max(clamped, value[0] + step)
        : clamped;

    setValue(value, newValue, index, onChange);
  };
};
