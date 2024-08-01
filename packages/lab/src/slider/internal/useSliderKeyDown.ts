import type { KeyboardEvent } from "react";
import type { SliderChangeHandler, SliderValue } from "../types";
import {
  type UpdateValueItem,
  clampValue,
  getHandleIndex,
  roundValue,
} from "./utils";

export function useSliderKeyDown(
  value: SliderValue,
  min: number,
  max: number,
  pageStep: number,
  step: number,
  updateValueItem: UpdateValueItem,
  setValue: SliderChangeHandler,
  onChange?: SliderChangeHandler,
) {
  return (event: KeyboardEvent) => {
    const handleElement = event.target as HTMLDivElement;
    const handleIndex = getHandleIndex(handleElement);
    let valueItem: number = Array.isArray(value) ? value[handleIndex] : value;
    switch (event.key) {
      case "Home":
        valueItem = min;
        break;
      case "End":
        valueItem = max;
        break;
      case "PageUp":
        valueItem += pageStep;
        break;
      case "PageDown":
        valueItem -= pageStep;
        break;
      case "ArrowUp":
      case "ArrowRight":
        valueItem += step;
        break;
      case "ArrowDown":
      case "ArrowLeft":
        valueItem -= step;
        break;
      default:
        return;
    }
    event.preventDefault();
    valueItem = roundValue(valueItem, step);
    valueItem = clampValue(valueItem, min, max);
    const newValue = updateValueItem(value, handleIndex, valueItem);
    if (newValue !== value) {
      setValue(newValue);
      if (onChange) {
        onChange(newValue);
      }
    }
  };
}
