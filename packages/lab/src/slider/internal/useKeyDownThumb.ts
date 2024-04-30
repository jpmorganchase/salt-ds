import { SliderChangeHandler, SliderValue } from "../types";
import { roundToStep, roundToTwoDp } from "./utils";

export function useKeyDownThumb(
  min: number,
  max: number,
  step: number,
  value: SliderValue,
  setValue: SliderChangeHandler,
  onChange: SliderChangeHandler | undefined
) {
  return (event: React.KeyboardEvent) => {
    let valueItem: number = value;
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
    setValue(valueItem);
    onChange?.(valueItem);
  };
}
