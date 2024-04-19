import { SliderChangeHandler, SliderValue } from "../types";
import {
  clampValue,
  roundValue,
} from "./utils";

export function useSliderKeyDown(
  value: SliderValue,
  min: number,
  max: number,
  step: number,
  setValue: SliderChangeHandler,
  onChange?: SliderChangeHandler
) {
  return (event: React.KeyboardEvent) => {
    console.log('keydown')
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
    valueItem = roundValue(valueItem, step);
    valueItem = clampValue(valueItem, min, max);
    setValue(valueItem);
    onChange?.(valueItem);
      }
}
