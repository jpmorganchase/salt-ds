import { SliderChangeHandler, SliderValue } from "../types";
import { clampValue, roundToStep, roundToTwoDp } from "./utils";

export function useSliderKeyDown(
  value: SliderValue,
  min: number,
  max: number,
  step: number,
  setValue: SliderChangeHandler,
  onChange?: SliderChangeHandler
) {
  return (event: React.KeyboardEvent) => {
    let valueItem: number = value;
    switch (event.key) {
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
    valueItem = roundToStep(valueItem, step);
    valueItem = roundToTwoDp(valueItem);
    setValue(valueItem);
    onChange?.(valueItem);
  };
}
