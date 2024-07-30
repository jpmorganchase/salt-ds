import type { SliderChangeHandler, SliderValue, ThumbIndex } from "../types";
import {
  clampValue,
  preventOverlappingValues,
  roundToStep,
  setValue,
} from "./utils";

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
  index: ThumbIndex,
) => {
  return (event: React.KeyboardEvent) => {
    const targetValue = value[index];
    const rawValue = getValueFromKeyName(
      event.key,
      targetValue as number,
      min,
      max,
      step,
    );

    const roundedToStep = roundToStep(rawValue, step);
    const rounded = Number(roundedToStep.toFixed(1));
    const clamped = clampValue(rounded, [min, max]);
    const newValue = preventOverlappingValues(value, clamped, index);

    setValue(value, newValue, index, onChange);
  };
};
