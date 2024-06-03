import { SliderChangeHandler, SliderValue } from "../types";
import { clampValue, roundToStep, roundToTwoDp } from "./utils";

export function useKeyDownThumb(
  min: number,
  max: number,
  step: number,
  value: SliderValue,
  onChange: SliderChangeHandler,
  index: number
) {
  return (event: React.KeyboardEvent) => {
    let valueItem: number = value[index];
    switch (event.key) {
      case "Home":
        valueItem = min;
        break;
      case "End":
        valueItem = max;
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

    valueItem = roundToStep(valueItem, step);
    valueItem = roundToTwoDp(valueItem);
    valueItem = clampValue(valueItem, min, max);

    const newValueArray = [...value];
    newValueArray.splice(index, 1, valueItem);
    onChange(newValueArray);
  };
}
